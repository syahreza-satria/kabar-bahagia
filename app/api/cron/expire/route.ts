import { and, eq, lt } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { getDb, schema } from "@/db";
import { invitationTag } from "@/lib/data";
import { deleteObjects } from "@/lib/storage";

/**
 * Cron harian (vercel.json): undangan aktif yang lewat 2 minggu dari acara terakhir
 * diarsipkan dan seluruh medianya dihapus dari Supabase Storage.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const db = getDb();
  const expired = await db
    .select({ id: schema.invitations.id, slug: schema.invitations.slug })
    .from(schema.invitations)
    .where(and(eq(schema.invitations.status, "aktif"), lt(schema.invitations.expiresAt, new Date())));

  let archived = 0;
  for (const inv of expired) {
    const files = await db
      .select({ path: schema.media.storagePath })
      .from(schema.media)
      .where(eq(schema.media.invitationId, inv.id));
    // hapus storage dulu; bila gagal, undangan tetap aktif dan dicoba lagi besok
    await deleteObjects(files.map((f) => f.path).filter((p): p is string => !!p));
    await db.delete(schema.media).where(eq(schema.media.invitationId, inv.id));
    await db
      .update(schema.invitations)
      .set({ status: "arsip", musicUrl: null, ogImageUrl: null, updatedAt: new Date() })
      .where(eq(schema.invitations.id, inv.id));
    revalidateTag(invitationTag(inv.slug), { expire: 0 });
    archived++;
  }
  return Response.json({ archived });
}
