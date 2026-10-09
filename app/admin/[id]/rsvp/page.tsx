import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { InvitationNav } from "@/components/admin/InvitationNav";
import { RsvpTable } from "@/components/admin/RsvpTable";
import { getDb, schema } from "@/db";
import { listRsvps } from "@/lib/rsvp";

export default async function RsvpPage({ params }: PageProps<"/admin/[id]/rsvp">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [inv] = await getDb().select().from(schema.invitations).where(eq(schema.invitations.id, id)).limit(1);
  if (!inv) notFound();
  const rows = await listRsvps(id);
  return (
    <>
      <InvitationNav id={id} title={`${inv.content.groom.nickname} & ${inv.content.bride.nickname}`} active="/rsvp" />
      <RsvpTable rows={rows} csvHref={`/api/admin/rsvp-csv/${id}`} />
    </>
  );
}
