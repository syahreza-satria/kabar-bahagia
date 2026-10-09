import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { InvitationNav } from "@/components/admin/InvitationNav";
import { MediaManager } from "@/components/admin/MediaManager";
import { getDb, schema } from "@/db";

export default async function MediaPage({ params }: PageProps<"/admin/[id]/media">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = getDb();
  const [inv] = await db.select().from(schema.invitations).where(eq(schema.invitations.id, id)).limit(1);
  if (!inv) notFound();
  const photos = await db
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
