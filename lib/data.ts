import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getDb, schema } from "@/db";
import type { InvitationData } from "@/types/invitation";

export const invitationTag = (slug: string) => `inv:${slug}`;

type InvitationRow = typeof schema.invitations.$inferSelect;

export async function loadInvitationParts(row: InvitationRow): Promise<InvitationData> {
  const db = getDb();
  const [events, media, gifts] = await Promise.all([
    db.select().from(schema.events).where(eq(schema.events.invitationId, row.id)).orderBy(asc(schema.events.mulai)),
    db.select().from(schema.media).where(eq(schema.media.invitationId, row.id)).orderBy(asc(schema.media.urutan)),
    db.select().from(schema.giftAccounts).where(eq(schema.giftAccounts.invitationId, row.id)),
  ]);

  return {
    id: row.id,
    slug: row.slug,
    themeId: row.themeId,
    status: row.status,
    content: row.content,
    sectionConfig: row.sectionConfig,
    primaryColor: row.primaryColor,
    musicUrl: row.musicUrl,
    ogImageUrl: row.ogImageUrl,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    events: events.map((e) => ({
      id: e.id,
      name: e.nama,
      startsAt: e.mulai.toISOString(),
      endsAt: e.selesai?.toISOString() ?? null,
      timezone: e.zonaWaktu,
      venue: e.venue,
      address: e.alamat,
      mapsUrl: e.mapsUrl,
    })),
    media: media.map((m) => ({ id: m.id, type: m.tipe, url: m.url, order: m.urutan, section: m.section })),
    gifts: gifts.map((g) => ({
      id: g.id,
      type: g.tipe,
      bankName: g.namaBank,
      number: g.nomor,
      accountName: g.atasNama,
      qrUrl: g.gambarQr,
    })),
  };
}

/** Undangan publik, di-cache per slug dan di-revalidate lewat tag saat admin menyimpan. */
export async function getInvitationBySlug(slug: string): Promise<InvitationData | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(invitationTag(slug));

  const [row] = await getDb().select().from(schema.invitations).where(eq(schema.invitations.slug, slug)).limit(1);
  if (!row) return null;
  const data = await loadInvitationParts(row);
  // kedaluwarsa dihitung di sini; hasil di-cache paling lama beberapa jam
  if (data.status === "aktif" && row.expiresAt && row.expiresAt.getTime() < Date.now()) {
    return { ...data, status: "arsip", media: [] };
  }
  return data;
}
