import type { Metadata } from "next";
import { and, asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RsvpTable } from "@/components/admin/RsvpTable";
import { ClientGuestLinks } from "@/components/invitation/ClientGuestLinks";
import { getDb, schema } from "@/db";
import { listRsvps } from "@/lib/rsvp";
import { appUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Rekap Undangan",
  robots: { index: false, follow: false },
};

async function Recap({ params }: Pick<PageProps<"/r/[token]">, "params">) {
  const { token } = await params;
  if (!/^[a-z0-9]{24}$/.test(token)) notFound();
  const db = getDb();
  const [inv] = await db.select().from(schema.invitations).where(eq(schema.invitations.clientToken, token)).limit(1);
  if (!inv) notFound();

  const [rsvps, wishes, guests] = await Promise.all([
    listRsvps(inv.id),
    db
      .select()
      .from(schema.wishes)
      .where(and(eq(schema.wishes.invitationId, inv.id), eq(schema.wishes.hidden, false)))
      .orderBy(desc(schema.wishes.createdAt)),
    db.select().from(schema.guests).where(eq(schema.guests.invitationId, inv.id)).orderBy(asc(schema.guests.nama)),
  ]);

  const title = `${inv.content.groom.nickname} & ${inv.content.bride.nickname}`;
  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 px-4 py-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-zinc-500">Rekap undangan</p>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Status undangan: {inv.status}. Simpan link halaman ini dan jangan bagikan ke tamu.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Kirim undangan ke tamu</h2>
        <ClientGuestLinks
          token={token}
          baseUrl={`${appUrl()}/${inv.slug}`}
          guests={guests.map((g) => ({
            id: g.id,
            kode: g.kode,
            nama: g.nama,
            grup: g.grup,
            noWhatsapp: g.noWhatsapp,
            maxPax: g.maxPax,
            sentAt: g.sentAt?.toISOString() ?? null,
            openedAt: g.openedAt?.toISOString() ?? null,
          }))}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Konfirmasi kehadiran</h2>
        <RsvpTable rows={rsvps} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Ucapan ({wishes.length})</h2>
        <ul className="space-y-3">
          {wishes.map((w) => (
            <li key={w.id} className="rounded-lg border border-zinc-200 bg-white p-4">
              <strong>{w.nama}</strong>
              <p className="mt-1 whitespace-pre-line break-words text-sm">{w.pesan}</p>
            </li>
          ))}
          {wishes.length === 0 && <li className="text-sm text-zinc-500">Belum ada ucapan.</li>}
        </ul>
      </section>
    </div>
  );
}

export default function RecapPage(props: PageProps<"/r/[token]">) {
  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900">
      <Suspense fallback={<p className="p-6 text-sm text-zinc-500">Memuat rekap…</p>}>
        <Recap params={props.params} />
      </Suspense>
    </div>
  );
}
