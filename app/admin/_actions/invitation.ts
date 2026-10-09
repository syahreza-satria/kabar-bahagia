"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { invitationTag } from "@/lib/data";
import { computeExpiry, localInputToIso } from "@/lib/dates";
import { generateClientToken, generateGuestCode } from "@/lib/ids";
import { deleteObjects } from "@/lib/storage";
import { RESERVED_SLUGS, slugify } from "@/lib/text";
import { CONTENT_SCHEMA, SECTION_CONFIG_SCHEMA } from "@/types/invitation";
import { assertUuid, firstIssue, type ActionResult } from "./guard";

const SavePayload = z.object({
  slug: z.string().trim().min(3, "Slug minimal 3 karakter").max(60),
  themeId: z.string().min(1),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .or(z.literal("")),
  musicUrl: z.string().trim().max(500),
  ogImageUrl: z.string().trim().max(500),
  content: CONTENT_SCHEMA,
  sectionConfig: SECTION_CONFIG_SCHEMA,
  events: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Nama acara wajib diisi").max(80),
        startsLocal: z.string().min(1, "Waktu mulai acara wajib diisi"),
        endsLocal: z.string(),
        timezone: z.enum(["WIB", "WITA", "WIT"]),
        venue: z.string().trim().max(160),
        address: z.string().trim().max(400),
        mapsUrl: z.string().trim().max(500),
      }),
    )
    .max(6),
  gifts: z
    .array(
      z.object({
        type: z.enum(["bank", "ewallet", "qris", "alamat"]),
        bankName: z.string().trim().max(60),
        number: z.string().trim().max(400),
        accountName: z.string().trim().max(100),
        qrUrl: z.string().trim().max(500),
      }),
    )
    .max(10),
});

async function slugTaken(slug: string, exceptId?: string) {
  const [row] = await getDb()
    .select({ id: schema.invitations.id })
    .from(schema.invitations)
    .where(eq(schema.invitations.slug, slug))
    .limit(1);
  return !!row && row.id !== exceptId;
}

/** Simpan undangan (draft atau perubahan). Acara & rekening amplop diganti seluruhnya. */
export async function saveInvitation(id: string | null, raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  if (id) assertUuid(id);
  const parsed = SavePayload.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const p = parsed.data;

  const slug = slugify(p.slug);
  if (slug.length < 3) return { ok: false, error: "Slug tidak valid" };
  if (RESERVED_SLUGS.has(slug)) return { ok: false, error: "Slug dipakai sistem, pilih yang lain" };
  if (await slugTaken(slug, id ?? undefined)) return { ok: false, error: "Slug sudah dipakai undangan lain" };

  const events = p.events.map((e) => ({
    ...e,
    startsIso: localInputToIso(e.startsLocal, e.timezone),
    endsIso: e.endsLocal ? localInputToIso(e.endsLocal, e.timezone) : null,
  }));
  const expiresAt = computeExpiry(
    events.map((e) => e.endsIso),
    events.map((e) => e.startsIso),
  );

  let previousSlug: string | null = null;
  const savedId = await getDb().transaction(async (tx) => {
    const values = {
      slug,
      themeId: p.themeId,
      content: p.content,
      sectionConfig: p.sectionConfig,
      primaryColor: p.primaryColor || null,
      musicUrl: p.musicUrl || null,
      ogImageUrl: p.ogImageUrl || null,
      expiresAt,
      updatedAt: new Date(),
    };
    let invId = id;
    if (invId) {
      const [prev] = await tx
        .select({ slug: schema.invitations.slug })
        .from(schema.invitations)
        .where(eq(schema.invitations.id, invId));
      previousSlug = prev?.slug ?? null;
      await tx.update(schema.invitations).set(values).where(eq(schema.invitations.id, invId));
      await tx.delete(schema.events).where(eq(schema.events.invitationId, invId));
      await tx.delete(schema.giftAccounts).where(eq(schema.giftAccounts.invitationId, invId));
    } else {
      const [row] = await tx
        .insert(schema.invitations)
        .values({ ...values, clientToken: generateClientToken(), status: "draft" })
        .returning({ id: schema.invitations.id });
      invId = row.id;
    }
    const invitationId = invId;
    if (events.length) {
      await tx.insert(schema.events).values(
        events.map((e) => ({
          invitationId,
          nama: e.name,
          mulai: new Date(e.startsIso),
          selesai: e.endsIso ? new Date(e.endsIso) : null,
          zonaWaktu: e.timezone,
          venue: e.venue,
          alamat: e.address,
          mapsUrl: e.mapsUrl,
        })),
      );
    }
    if (p.gifts.length) {
      await tx.insert(schema.giftAccounts).values(
        p.gifts.map((g) => ({
          invitationId,
          tipe: g.type,
          namaBank: g.bankName,
          nomor: g.number,
          atasNama: g.accountName,
          gambarQr: g.qrUrl,
        })),
      );
    }
    return invitationId;
  });

  updateTag(invitationTag(slug));
  if (previousSlug && previousSlug !== slug) updateTag(invitationTag(previousSlug));
  return { ok: true, id: savedId };
}

/** Publikasi: draft -> aktif (butuh minimal satu acara). */
export async function setInvitationStatus(id: string, status: "draft" | "aktif"): Promise<ActionResult> {
  await requireAdmin();
  assertUuid(id);
  const db = getDb();
  const [inv] = await db.select().from(schema.invitations).where(eq(schema.invitations.id, id)).limit(1);
  if (!inv) return { ok: false, error: "Undangan tidak ditemukan" };

  if (status === "aktif") {
    const evs = await db.select({ id: schema.events.id }).from(schema.events).where(eq(schema.events.invitationId, id));
    if (!evs.length) return { ok: false, error: "Tambahkan minimal satu acara sebelum dipublikasikan" };
    if (inv.expiresAt && inv.expiresAt.getTime() < Date.now()) {
      return { ok: false, error: "Semua acara sudah lewat lebih dari 14 hari" };
    }
  }
  await db.update(schema.invitations).set({ status, updatedAt: new Date() }).where(eq(schema.invitations.id, id));
  updateTag(invitationTag(inv.slug));
  return { ok: true };
}

/** Duplikat sebagai draft baru. Foto galeri tidak disalin agar tidak ada media yang dipakai bersama. */
export async function duplicateInvitation(id: string) {
  await requireAdmin();
  assertUuid(id);
  const db = getDb();
  const [inv] = await db.select().from(schema.invitations).where(eq(schema.invitations.id, id)).limit(1);
  if (!inv) return;

  const newId = await db.transaction(async (tx) => {
    const [copy] = await tx
      .insert(schema.invitations)
      .values({
        slug: `${inv.slug.slice(0, 50)}-${generateGuestCode().slice(0, 4)}`,
        themeId: inv.themeId,
        status: "draft",
        content: inv.content,
        sectionConfig: inv.sectionConfig,
        primaryColor: inv.primaryColor,
        musicUrl: inv.musicUrl,
        ogImageUrl: inv.ogImageUrl,
        expiresAt: inv.expiresAt,
        clientToken: generateClientToken(),
      })
      .returning({ id: schema.invitations.id });

    const evs = await tx.select().from(schema.events).where(eq(schema.events.invitationId, id));
    if (evs.length) {
      await tx.insert(schema.events).values(evs.map((e) => ({ ...e, id: undefined, invitationId: copy.id })));
    }
    const gifts = await tx.select().from(schema.giftAccounts).where(eq(schema.giftAccounts.invitationId, id));
    if (gifts.length) {
      await tx.insert(schema.giftAccounts).values(gifts.map((g) => ({ ...g, id: undefined, invitationId: copy.id })));
    }
    return copy.id;
  });
  redirect(`/admin/${newId}/edit`);
}

/** Hapus undangan beserta semua data dan berkas medianya. */
export async function deleteInvitation(id: string) {
  await requireAdmin();
  assertUuid(id);
  const db = getDb();
  const [inv] = await db
    .select({ slug: schema.invitations.slug })
    .from(schema.invitations)
    .where(eq(schema.invitations.id, id));
  const files = await db
    .select({ path: schema.media.storagePath })
    .from(schema.media)
    .where(eq(schema.media.invitationId, id));
  await deleteObjects(files.map((f) => f.path).filter((p): p is string => !!p));
  await db.delete(schema.invitations).where(eq(schema.invitations.id, id));
  if (inv) updateTag(invitationTag(inv.slug));
  redirect("/admin");
}
