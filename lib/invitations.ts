import "server-only";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb, schema } from "@/db";
import { isUuid } from "@/lib/text";

/** Undangan yang boleh menerima RSVP/ucapan/kunjungan: hanya yang berstatus `aktif`. */
export async function findActiveInvitation(slug: string) {
  const [inv] = await getDb()
    .select({ id: schema.invitations.id, status: schema.invitations.status })
    .from(schema.invitations)
    .where(eq(schema.invitations.slug, slug))
    .limit(1);
  return inv && inv.status === "aktif" ? inv : null;
}

/** Tamu berdasarkan kode di link personal. Nama selalu diambil dari database, bukan dari URL. */
export async function findGuestByCode(invitationId: string, code: string) {
  const [guest] = await getDb()
    .select()
    .from(schema.guests)
    .where(and(eq(schema.guests.invitationId, invitationId), eq(schema.guests.kode, code)))
    .limit(1);
  return guest ?? null;
}

/** Untuk halaman admin: ID tidak valid atau tidak ditemukan -> 404. */
export async function getInvitationOrNotFound(id: string) {
  if (!isUuid(id)) notFound();
  const [row] = await getDb().select().from(schema.invitations).where(eq(schema.invitations.id, id)).limit(1);
  if (!row) notFound();
  return row;
}
