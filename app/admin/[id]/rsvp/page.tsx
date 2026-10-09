import { InvitationNav } from "@/components/admin/InvitationNav";
import { RsvpTable } from "@/components/shared/RsvpTable";
import { getInvitationOrNotFound } from "@/lib/invitations";
import { listRsvps } from "@/lib/rsvp";

export default async function RsvpPage({ params }: PageProps<"/admin/[id]/rsvp">) {
  const { id } = await params;
  const inv = await getInvitationOrNotFound(id);
  const rows = await listRsvps(id);
  return (
    <>
      <InvitationNav id={id} title={`${inv.content.groom.nickname} & ${inv.content.bride.nickname}`} active="/rsvp" />
      <RsvpTable rows={rows} csvHref={`/api/admin/rsvp-csv/${id}`} />
    </>
  );
}
