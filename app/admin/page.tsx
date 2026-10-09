import Link from "next/link";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { formatDateShort } from "@/lib/utils";

const STATUS = ["draft", "aktif", "arsip"] as const;
const BADGE: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-700",
  aktif: "bg-emerald-100 text-emerald-800",
  arsip: "bg-amber-100 text-amber-800",
};

export default async function AdminHome({ searchParams }: PageProps<"/admin">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const status = typeof sp.status === "string" && (STATUS as readonly string[]).includes(sp.status) ? sp.status : "";
  const order = sp.urut === "acara" ? "acara" : "baru";

  const db = getDb();
  const firstEvent = sql<Date | null>`(select min(${schema.events.mulai}) from ${schema.events} where ${schema.events.invitationId} = ${schema.invitations.id})`;
  const guestCount = sql<number>`(select count(*)::int from ${schema.guests} where ${schema.guests.invitationId} = ${schema.invitations.id})`;

  const rows = await db
    .select({
      id: schema.invitations.id,
      slug: schema.invitations.slug,
      status: schema.invitations.status,
      content: schema.invitations.content,
      createdAt: schema.invitations.createdAt,
      eventAt: firstEvent,
      guests: guestCount,
    })
    .from(schema.invitations)
    .where(
      and(
        status ? eq(schema.invitations.status, status as (typeof STATUS)[number]) : undefined,
        q
          ? or(
              ilike(schema.invitations.slug, `%${q}%`),
              sql`${schema.invitations.content}->'bride'->>'nickname' ilike ${`%${q}%`}`,
              sql`${schema.invitations.content}->'groom'->>'nickname' ilike ${`%${q}%`}`,
            )
          : undefined,
      ),
    )
    .orderBy(order === "acara" ? asc(firstEvent) : desc(schema.invitations.createdAt));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Daftar Undangan</h1>
        <Link href="/admin/new" className="adm-btn">
          + Undangan baru
        </Link>
      </div>

      <form className="flex flex-wrap gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Cari nama / slug" className="adm-input !w-60" />
        <select name="status" defaultValue={status} className="adm-input !w-36">
          <option value="">Semua status</option>
          {STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select name="urut" defaultValue={order} className="adm-input !w-44">
          <option value="baru">Terbaru dibuat</option>
          <option value="acara">Tanggal acara</option>
        </select>
        <button className="adm-btn-ghost">Terapkan</button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-2">Mempelai</th>
              <th className="px-4 py-2">Slug</th>
              <th className="px-4 py-2">Tanggal acara</th>
              <th className="px-4 py-2">Tamu</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  Belum ada undangan.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/${r.id}`} className="hover:underline">
                    {r.content.groom.nickname} &amp; {r.content.bride.nickname}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600">/{r.slug}</td>
                <td className="px-4 py-3 text-zinc-600">{r.eventAt ? formatDateShort(new Date(r.eventAt).toISOString()) : "-"}</td>
                <td className="px-4 py-3 text-zinc-600">{r.guests}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${BADGE[r.status]}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
