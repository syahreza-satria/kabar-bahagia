"use server";

import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { invitationTag } from "@/lib/data";
import { deleteObjects } from "@/lib/storage";
import { assertUuid } from "./guard";

async function invalidate(invitationId: string) {
  const [inv] = await getDb()
    .select({ slug: schema.invitations.slug })
    .from(schema.invitations)
    .where(eq(schema.invitations.id, invitationId));
  if (inv) updateTag(invitationTag(inv.slug));
}

export async function deleteMedia(invitationId: string, mediaId: string) {
  await requireAdmin();
  assertUuid(invitationId, mediaId);
  const db = getDb();
  const [m] = await db
    .select()
    .from(schema.media)
    .where(and(eq(schema.media.id, mediaId), eq(schema.media.invitationId, invitationId)));
  if (!m) return;
  if (m.storagePath) await deleteObjects([m.storagePath]);
  await db.delete(schema.media).where(eq(schema.media.id, mediaId));
  await invalidate(invitationId);
}

export async function reorderMedia(invitationId: string, orderedIds: string[]) {
  await requireAdmin();
  assertUuid(invitationId, ...orderedIds);
  await getDb().transaction(async (tx) => {
    for (const [index, mediaId] of orderedIds.entries()) {
      await tx
        .update(schema.media)
        .set({ urutan: index })
        .where(and(eq(schema.media.id, mediaId), eq(schema.media.invitationId, invitationId)));
    }
  });
  await invalidate(invitationId);
}
