import { and, count, countDistinct, eq, isNotNull, sum } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/admin/CopyButton";
import { InvitationActions } from "@/components/admin/InvitationActions";
import { InvitationNav } from "@/components/admin/InvitationNav";
import { getDb, schema } from "@/db";
import { appUrl, clientLink, formatDateShort } from "@/lib/utils";

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default async function InvitationDashboard({ params }: PageProps<"/admin/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = getDb();
  const [inv] = await db.select().from(schema.invitations).where(eq(schema.invitations.id, id)).limit(1);
  if (!inv) notFound();

  const [[guests], [sent], [opened], [views], [hadir], [wishes], events] = await Promise.all([
    db.select({ n: count() }).from(schema.guests).where(eq(schema.guests.invitationId, id)),
    db.select({ n: count() }).from(schema.guests).where(and(eq(schema.guests.invitationId, id), isNotNull(schema.guests.sentAt))),
    db.select({ n: countDistinct(schema.pageViews.guestId) }).from(schema.pageViews).where(eq(schema.pageViews.invitationId, id)),
    db.select({ n: count() }).from(schema.pageViews).where(eq(schema.pageViews.invitationId, id)),
    db
      .select({ n: sum(schema.rsvps.jumlah) })
      .from(schema.rsvps)
      .where(and(eq(schema.rsvps.invitationId, id), eq(schema.rsvps.status, "hadir"))),
    db.select({ n: count() }).from(schema.wishes).where(eq(schema.wishes.invitationId, id)),
    db.select().from(schema.events).where(eq(schema.events.invitationId, id)),
  ]);

  const publicLink = `${appUrl()}/${inv.slug}`;
  const recap = clientLink(inv.clientToken);
  const title = `${inv.content.groom.nickname} & ${inv.content.bride.nickname}`;

  return (
    <>
      <InvitationNav id={id} title={title} active="" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Status: <strong className="text-zinc-900">{inv.status}</strong>
              {inv.expiresAt && <> · Kedaluwarsa {formatDateShort(inv.expiresAt.toISOString())}</>}
            </p>
          </div>
          <InvitationActions id={id} status={inv.status} />
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Stat label="Tamu" value={guests.n} />
          <Stat label="Link terkirim" value={`${sent.n}/${guests.n}`} />
          <Stat label="Tamu yang membuka" value={opened.n} />
          <Stat label="Total kunjungan" value={views.n} />
          <Stat label="Konfirmasi hadir (orang)" value={hadir.n ?? 0} />
        </div>

        <section className="space-y-3 rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold">Link</h2>
          <div className="space-y-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-28 text-zinc-500">Undangan umum</span>
              <a href={publicLink} target="_blank" rel="noopener noreferrer" className="break-all underline">
                {publicLink}
              </a>
              <CopyButton value={publicLink} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-28 text-zinc-500">Rekap klien</span>
              <a href={recap} target="_blank" rel="noopener noreferrer" className="break-all underline">
                {recap}
              </a>
              <CopyButton value={recap} />
            </div>
            <p className="text-xs text-zinc-500">
              Link rekap bersifat rahasia: berikan hanya kepada pasangan pengantin. Draft hanya bisa dibuka saat Anda login.
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="mb-2 font-semibold">Acara ({events.length})</h2>
          {events.length === 0 ? (
            <p className="text-sm text-zinc-500">Belum ada acara. Tambahkan di tab Data & Tema.</p>
          ) : (
            <ul className="text-sm">
              {events.map((e) => (
                <li key={e.id}>
                  {e.nama} · {formatDateShort(e.mulai.toISOString(), e.zonaWaktu)} · {e.venue}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm text-zinc-500">Ucapan masuk: {wishes.n}</p>
        </section>
      </div>
    </>
  );
}
