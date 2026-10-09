import { asc, eq } from "drizzle-orm";
import { GuestManager } from "@/components/admin/GuestManager";
import { InvitationNav } from "@/components/admin/InvitationNav";
import { getDb, schema } from "@/db";
import { getInvitationOrNotFound } from "@/lib/invitations";
import { appUrl } from "@/lib/urls";

export default async function GuestsPage({ params }: PageProps<"/admin/[id]/guests">) {
  const { id } = await params;
  const inv = await getInvitationOrNotFound(id);
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.guests)
    .where(eq(schema.guests.invitationId, id))
    .orderBy(asc(schema.guests.nama));

  return (
    <>
      <InvitationNav id={id} title={`${inv.content.groom.nickname} & ${inv.content.bride.nickname}`} active="/guests" />
      <GuestManager
        invitationId={id}
        baseUrl={`${appUrl()}/${inv.slug}`}
        guests={rows.map((g) => ({
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
    </>
  );
}
