"use server";

import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { assertUuid } from "./guard";

export async function setWishHidden(invitationId: string, wishId: string, hidden: boolean) {
  await requireAdmin();
  assertUuid(invitationId, wishId);
  await getDb()
    .update(schema.wishes)
    .set({ hidden })
    .where(and(eq(schema.wishes.id, wishId), eq(schema.wishes.invitationId, invitationId)));
}

export async function deleteWish(invitationId: string, wishId: string) {
  await requireAdmin();
  assertUuid(invitationId, wishId);
  await getDb()
    .delete(schema.wishes)
    .where(and(eq(schema.wishes.id, wishId), eq(schema.wishes.invitationId, invitationId)));
}
