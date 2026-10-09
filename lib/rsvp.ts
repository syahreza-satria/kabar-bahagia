import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { RsvpRow } from "./rsvp-format";

/** Semua RSVP sebuah undangan, urut nama, lengkap dengan grup tamu (bila ada). */
export async function listRsvps(invitationId: string): Promise<RsvpRow[]> {
  return getDb()
    .select({
      nama: schema.rsvps.nama,
      status: schema.rsvps.status,
      jumlah: schema.rsvps.jumlah,
      grup: schema.guests.grup,
      updatedAt: schema.rsvps.updatedAt,
    })
    .from(schema.rsvps)
    .leftJoin(schema.guests, eq(schema.rsvps.guestId, schema.guests.id))
    .where(eq(schema.rsvps.invitationId, invitationId))
    .orderBy(asc(schema.rsvps.nama));
}
