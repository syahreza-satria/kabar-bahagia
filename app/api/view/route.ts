import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { findActiveInvitation, findGuestByCode } from "@/lib/invitations";
import { clientIp, rateLimit } from "@/lib/ratelimit";

const BodySchema = z.object({ slug: z.string().min(1).max(80), to: z.string().max(32).optional() });

/** Mencatat kunjungan (statistik dibuka). Tanggal buka pertama tamu disimpan sekali. */
export async function POST(req: Request) {
  if (!rateLimit(`view:${clientIp(req)}`, 30, 60_000)) return new Response(null, { status: 429 });
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 400 });

  const inv = await findActiveInvitation(parsed.data.slug);
  if (!inv) return new Response(null, { status: 204 });

  const db = getDb();
  const guest = parsed.data.to ? await findGuestByCode(inv.id, parsed.data.to) : null;
  if (guest) {
    await db
      .update(schema.guests)
      .set({ openedAt: new Date() })
      .where(and(eq(schema.guests.id, guest.id), isNull(schema.guests.openedAt)));
  }
  await db.insert(schema.pageViews).values({ invitationId: inv.id, guestId: guest?.id ?? null });
  return new Response(null, { status: 204 });
}
