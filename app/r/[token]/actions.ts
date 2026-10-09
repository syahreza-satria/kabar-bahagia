"use server";

import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";

/** Klien tidak login: otorisasi lewat client_token rahasia. */
export async function markSentByToken(token: string, guestId: string, sent: boolean) {
  const db = getDb();
  const [inv] = await db
    .select({ id: schema.invitations.id })
    .from(schema.invitations)
    .where(eq(schema.invitations.clientToken, token))
    .limit(1);
  if (!inv) return;
  await db
    .update(schema.guests)
    .set({ sentAt: sent ? new Date() : null })
    .where(and(eq(schema.guests.id, guestId), eq(schema.guests.invitationId, inv.id)));
}
