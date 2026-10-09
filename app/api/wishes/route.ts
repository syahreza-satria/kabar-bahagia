import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { verifyTurnstile } from "@/lib/turnstile";

const BodySchema = z.object({
  slug: z.string().min(1).max(80),
  to: z.string().max(32).optional(),
  nama: z.string().trim().min(1).max(80).optional(),
  pesan: z.string().trim().min(1).max(500),
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

/** Ucapan terbaru di atas; yang disembunyikan moderator tidak ikut. */
export async function GET(req: Request) {
  if (!rateLimit(`wish-get:${clientIp(req)}`, 60, 60_000)) {
    return Response.json({ error: "Terlalu banyak permintaan" }, { status: 429 });
  }
  const inv = await findInvitation(new URL(req.url).searchParams.get("slug") ?? "");
  if (!inv) return Response.json({ wishes: [] });
  const rows = await getDb()
    .select({
      id: schema.wishes.id,
      nama: schema.wishes.nama,
      pesan: schema.wishes.pesan,
      createdAt: schema.wishes.createdAt,
    })
    .from(schema.wishes)
    .where(and(eq(schema.wishes.invitationId, inv.id), eq(schema.wishes.hidden, false)))
    .orderBy(desc(schema.wishes.createdAt))
    .limit(100);
  return Response.json({ wishes: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })) });
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`wish-post:${ip}`, 5, 60_000)) {
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
  let guest: { id: string; nama: string } | undefined;
  if (body.to) {
    [guest] = await db
      .select({ id: schema.guests.id, nama: schema.guests.nama })
      .from(schema.guests)
      .where(and(eq(schema.guests.invitationId, inv.id), eq(schema.guests.kode, body.to)))
      .limit(1);
  }
  const nama = guest?.nama ?? body.nama;
  if (!nama) return Response.json({ error: "Nama wajib diisi" }, { status: 400 });

  await db.insert(schema.wishes).values({
    invitationId: inv.id,
    guestId: guest?.id ?? null,
    nama,
    pesan: body.pesan,
  });
  return Response.json({ ok: true });
}
