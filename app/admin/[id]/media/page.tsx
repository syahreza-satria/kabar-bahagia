import { and, asc, eq } from "drizzle-orm";
import { InvitationNav } from "@/components/admin/InvitationNav";
import { MediaManager } from "@/components/admin/MediaManager";
import { getDb, schema } from "@/db";
import { getInvitationOrNotFound } from "@/lib/invitations";

export default async function MediaPage({ params }: PageProps<"/admin/[id]/media">) {
  const { id } = await params;
  const inv = await getInvitationOrNotFound(id);
  const photos = await getDb()
    .select({ id: schema.media.id, url: schema.media.url })
    .from(schema.media)
    .where(and(eq(schema.media.invitationId, id), eq(schema.media.section, "galeri"), eq(schema.media.tipe, "foto")))
    .orderBy(asc(schema.media.urutan));

  return (
    <>
      <InvitationNav id={id} title={`${inv.content.groom.nickname} & ${inv.content.bride.nickname}`} active="/media" />
      <MediaManager invitationId={id} initial={photos} />
    </>
  );
}
