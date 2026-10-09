import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { verifyTurnstile } from "@/lib/turnstile";

const BodySchema = z.object({
  slug: z.string().min(1).max(80),
  to: z.string().max(32).optional(),
  nama: z.string().trim().min(1).max(80).optional(),
  status: z.enum(["hadir", "tidak", "ragu"]),
  jumlah: z.number().int().min(0).max(50),
  turnstile: z.string().max(2048).optional(),
});

async function findInvitation(slug: string) {
  const [inv] = await getDb()
    .select({ id: schema.invitations.id, status: schema.invitations.status })
    .from(schema.invitations)
    .where(eq(schema.invitations.slug, slug))
    .limit(1);
  return inv && inv.status === "aktif" ? inv : null;
}

async function findGuest(invitationId: string, code: string) {
  const [g] = await getDb()
    .select()
    .from(schema.guests)
    .where(and(eq(schema.guests.invitationId, invitationId), eq(schema.guests.kode, code)))
    .limit(1);
  return g ?? null;
}

/** Data tamu (nama, batas pax) dan RSVP yang sudah ada. Nomor WhatsApp tidak pernah dikirim. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") ?? "";
  const code = url.searchParams.get("to") ?? "";
  if (!rateLimit(`rsvp-get:${clientIp(req)}`, 60, 60_000)) {
    return Response.json({ error: "Terlalu banyak permintaan" }, { status: 429 });
  }

  const inv = await findInvitation(slug);
  if (!inv) return Response.json({ guest: null, rsvp: null });
  const guest = code ? await findGuest(inv.id, code) : null;
  if (!guest) return Response.json({ guest: null, rsvp: null });

  const [rsvp] = await getDb().select().from(schema.rsvps).where(eq(schema.rsvps.guestId, guest.id)).limit(1);
  return Response.json({
    guest: { nama: guest.nama, maxPax: guest.maxPax },
    rsvp: rsvp ? { status: rsvp.status, jumlah: rsvp.jumlah } : null,
  });
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`rsvp-post:${ip}`, 10, 60_000)) {
    return Response.json({ error: "Terlalu banyak percobaan, coba lagi sebentar lagi." }, { status: 429 });
  }

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Data tidak valid" }, { status: 400 });
  const body = parsed.data;

  if (!(await verifyTurnstile(body.turnstile, ip))) {
    return Response.json({ error: "Verifikasi anti-spam gagal" }, { status: 400 });
  }

  const inv = await findInvitation(body.slug);
  if (!inv) return Response.json({ error: "Undangan tidak ditemukan" }, { status: 404 });

  const db = getDb();
  const guest = body.to ? await findGuest(inv.id, body.to) : null;

  if (guest) {
    const jumlah = body.status === "tidak" ? 0 : Math.max(1, Math.min(body.jumlah, guest.maxPax));
    await db
      .insert(schema.rsvps)
      .values({ invitationId: inv.id, guestId: guest.id, nama: guest.nama, status: body.status, jumlah })
      .onConflictDoUpdate({
        target: schema.rsvps.guestId,
        set: { status: body.status, jumlah, updatedAt: new Date() },
      });
    return Response.json({ ok: true });
  }

  // Link tanpa kode: RSVP umum, wajib menyebut nama
  if (!body.nama) return Response.json({ error: "Nama wajib diisi" }, { status: 400 });
  const jumlah = body.status === "tidak" ? 0 : Math.max(1, Math.min(body.jumlah, 5));
  await db.insert(schema.rsvps).values({ invitationId: inv.id, nama: body.nama, status: body.status, jumlah });
  return Response.json({ ok: true });
}
