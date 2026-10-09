"use server";

import { and, eq, inArray } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { invitationTag } from "@/lib/data";
import { deleteObjects } from "@/lib/storage";
import {
  RESERVED_SLUGS,
  computeExpiry,
  generateClientToken,
  generateGuestCode,
  localInputToIso,
  normalizePhone,
  slugify,
} from "@/lib/utils";
import { CONTENT_SCHEMA, SECTION_CONFIG_SCHEMA } from "@/types/invitation";

type Result = { ok: true; id?: string } | { ok: false; error: string };

const SavePayload = z.object({
  slug: z.string().trim().min(3, "Slug minimal 3 karakter").max(60),
  themeId: z.string().min(1),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).or(z.literal("")),
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
export type SavePayloadInput = z.input<typeof SavePayload>;

async function slugTaken(slug: string, exceptId?: string) {
  const [row] = await getDb()
    .select({ id: schema.invitations.id })
    .from(schema.invitations)
    .where(eq(schema.invitations.slug, slug))
    .limit(1);
  return !!row && row.id !== exceptId;
}

/** Simpan undangan (draft atau perubahan). Events & gift account diganti seluruhnya. */
export async function saveInvitation(id: string | null, raw: unknown): Promise<Result> {
  await requireAdmin();
  const parsed = SavePayload.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
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

  const db = getDb();
  let previousSlug: string | null = null;
  const savedId = await db.transaction(async (tx) => {
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
      const [prev] = await tx.select({ slug: schema.invitations.slug }).from(schema.invitations).where(eq(schema.invitations.id, invId));
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
    if (events.length) {
      await tx.insert(schema.events).values(
        events.map((e) => ({
          invitationId: invId!,
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
          invitationId: invId!,
          tipe: g.type,
          namaBank: g.bankName,
          nomor: g.number,
          atasNama: g.accountName,
          gambarQr: g.qrUrl,
        })),
      );
    }
    return invId!;
  });

  updateTag(invitationTag(slug));
  if (previousSlug && previousSlug !== slug) updateTag(invitationTag(previousSlug));
  return { ok: true, id: savedId };
}

/** Publikasi: draft -> aktif. Hanya bisa bila ada minimal satu acara. */
export async function setInvitationStatus(id: string, status: "draft" | "aktif"): Promise<Result> {
  await requireAdmin();
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

export async function duplicateInvitation(id: string) {
  await requireAdmin();
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
      await tx.insert(schema.events).values(evs.map(({ id: _id, invitationId: _i, ...e }) => ({ ...e, invitationId: copy.id })));
    }
    const gifts = await tx.select().from(schema.giftAccounts).where(eq(schema.giftAccounts.invitationId, id));
    if (gifts.length) {
      await tx.insert(schema.giftAccounts).values(gifts.map(({ id: _id, invitationId: _i, ...g }) => ({ ...g, invitationId: copy.id })));
    }
    return copy.id;
  });
  redirect(`/admin/${newId}/edit`);
}

export async function deleteInvitation(id: string) {
  await requireAdmin();
  const db = getDb();
  const [inv] = await db.select({ slug: schema.invitations.slug }).from(schema.invitations).where(eq(schema.invitations.id, id));
  const files = await db
    .select({ path: schema.media.storagePath })
    .from(schema.media)
    .where(eq(schema.media.invitationId, id));
  await deleteObjects(files.map((f) => f.path).filter((p): p is string => !!p));
  await db.delete(schema.invitations).where(eq(schema.invitations.id, id));
  if (inv) updateTag(invitationTag(inv.slug));
  redirect("/admin");
}

/* ---------------- Media ---------------- */

async function invitationSlug(id: string) {
  const [inv] = await getDb().select({ slug: schema.invitations.slug }).from(schema.invitations).where(eq(schema.invitations.id, id));
  return inv?.slug;
}

export async function deleteMedia(invitationId: string, mediaId: string) {
  await requireAdmin();
  const db = getDb();
  const [m] = await db
    .select()
    .from(schema.media)
    .where(and(eq(schema.media.id, mediaId), eq(schema.media.invitationId, invitationId)));
  if (!m) return;
  if (m.storagePath) await deleteObjects([m.storagePath]);
  await db.delete(schema.media).where(eq(schema.media.id, mediaId));
  const slug = await invitationSlug(invitationId);
  if (slug) updateTag(invitationTag(slug));
}

export async function reorderMedia(invitationId: string, orderedIds: string[]) {
  await requireAdmin();
  const db = getDb();
  await db.transaction(async (tx) => {
    for (const [index, mediaId] of orderedIds.entries()) {
      await tx
        .update(schema.media)
        .set({ urutan: index })
        .where(and(eq(schema.media.id, mediaId), eq(schema.media.invitationId, invitationId)));
    }
  });
  const slug = await invitationSlug(invitationId);
  if (slug) updateTag(invitationTag(slug));
}

/* ---------------- Tamu ---------------- */

const GuestInput = z.object({
  nama: z.string().trim().min(1, "Nama wajib diisi").max(100),
  grup: z.string().trim().max(60).default(""),
  noWhatsapp: z.string().trim().max(30).default(""),
  maxPax: z.coerce.number().int().min(1).max(20).default(2),
});

export async function addGuest(invitationId: string, raw: unknown): Promise<Result> {
  await requireAdmin();
  const p = GuestInput.safeParse(raw);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Data tidak valid" };
  await getDb().insert(schema.guests).values({
    invitationId,
    kode: generateGuestCode(),
    nama: p.data.nama,
    grup: p.data.grup,
    noWhatsapp: normalizePhone(p.data.noWhatsapp),
    maxPax: p.data.maxPax,
  });
  return { ok: true };
}

export async function updateGuest(invitationId: string, guestId: string, raw: unknown): Promise<Result> {
  await requireAdmin();
  const p = GuestInput.safeParse(raw);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Data tidak valid" };
  await getDb()
    .update(schema.guests)
    .set({
      nama: p.data.nama,
      grup: p.data.grup,
      noWhatsapp: normalizePhone(p.data.noWhatsapp),
      maxPax: p.data.maxPax,
    })
    .where(and(eq(schema.guests.id, guestId), eq(schema.guests.invitationId, invitationId)));
  return { ok: true };
}

export async function deleteGuest(invitationId: string, guestId: string) {
  await requireAdmin();
  await getDb()
    .delete(schema.guests)
    .where(and(eq(schema.guests.id, guestId), eq(schema.guests.invitationId, invitationId)));
}

/**
 * Impor massal dari tempelan Excel/CSV. Kolom: nama, grup, no whatsapp, max pax.
 * Pemisah: tab (tempel dari Excel), koma, atau titik koma.
 */
export async function importGuests(invitationId: string, text: string): Promise<Result & { added?: number; skipped?: number }> {
  await requireAdmin();
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const rows: (typeof schema.guests.$inferInsert)[] = [];
  let skipped = 0;
  const used = new Set<string>();

  for (const [i, line] of lines.entries()) {
    const cells = line.split(line.includes("\t") ? "\t" : /[;,]/).map((c) => c.trim());
    if (i === 0 && /^nama$/i.test(cells[0])) continue; // baris header
    const parsed = GuestInput.safeParse({
      nama: cells[0] ?? "",
      grup: cells[1] ?? "",
      noWhatsapp: cells[2] ?? "",
      maxPax: cells[3] || 2,
    });
    if (!parsed.success) {
      skipped++;
      continue;
    }
    let kode = generateGuestCode();
    while (used.has(kode)) kode = generateGuestCode();
    used.add(kode);
    rows.push({
      invitationId,
      kode,
      nama: parsed.data.nama,
      grup: parsed.data.grup,
      noWhatsapp: normalizePhone(parsed.data.noWhatsapp),
      maxPax: parsed.data.maxPax,
    });
  }
  if (!rows.length) return { ok: false, error: "Tidak ada baris yang valid" };
  if (rows.length > 1000) return { ok: false, error: "Maksimal 1000 tamu sekali impor" };
  await getDb().insert(schema.guests).values(rows);
  return { ok: true, added: rows.length, skipped };
}

export async function markGuestSent(invitationId: string, guestId: string, sent: boolean) {
  await requireAdmin();
  await getDb()
    .update(schema.guests)
    .set({ sentAt: sent ? new Date() : null })
    .where(and(eq(schema.guests.id, guestId), eq(schema.guests.invitationId, invitationId)));
}

/* ---------------- Ucapan ---------------- */

export async function setWishHidden(invitationId: string, wishId: string, hidden: boolean) {
  await requireAdmin();
  await getDb()
    .update(schema.wishes)
    .set({ hidden })
    .where(and(eq(schema.wishes.id, wishId), eq(schema.wishes.invitationId, invitationId)));
}

export async function deleteWish(invitationId: string, wishId: string) {
  await requireAdmin();
  await getDb()
    .delete(schema.wishes)
    .where(and(eq(schema.wishes.id, wishId), eq(schema.wishes.invitationId, invitationId)));
}

export async function deleteWishes(invitationId: string, ids: string[]) {
  await requireAdmin();
  if (!ids.length) return;
  await getDb()
    .delete(schema.wishes)
    .where(and(inArray(schema.wishes.id, ids), eq(schema.wishes.invitationId, invitationId)));
}
