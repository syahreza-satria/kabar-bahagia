import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { clientIp, rateLimit } from "@/lib/ratelimit";

const BodySchema = z.object({ slug: z.string().min(1).max(80), to: z.string().max(32).optional() });

export async function POST(req: Request) {
  if (!rateLimit(`view:${clientIp(req)}`, 30, 60_000)) return new Response(null, { status: 429 });
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 400 });

  const db = getDb();
  const [inv] = await db
    .select({ id: schema.invitations.id, status: schema.invitations.status })
    .from(schema.invitations)
    .where(eq(schema.invitations.slug, parsed.data.slug))
    .limit(1);
  if (!inv || inv.status !== "aktif") return new Response(null, { status: 204 });

  let guestId: string | null = null;
  if (parsed.data.to) {
    const [g] = await db
      .select({ id: schema.guests.id })
      .from(schema.guests)
      .where(and(eq(schema.guests.invitationId, inv.id), eq(schema.guests.kode, parsed.data.to)))
      .limit(1);
    guestId = g?.id ?? null;
    if (guestId) {
      await db
        .update(schema.guests)
        .set({ openedAt: new Date() })
        .where(and(eq(schema.guests.id, guestId), isNull(schema.guests.openedAt)));
    }
  }
  await db.insert(schema.pageViews).values({ invitationId: inv.id, guestId });
  return new Response(null, { status: 204 });
}
