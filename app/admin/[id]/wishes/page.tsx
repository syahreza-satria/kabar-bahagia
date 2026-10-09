import { desc, eq } from "drizzle-orm";
import { InvitationNav } from "@/components/admin/InvitationNav";
import { WishModeration } from "@/components/admin/WishModeration";
import { getDb, schema } from "@/db";
import { getInvitationOrNotFound } from "@/lib/invitations";

export default async function WishesPage({ params }: PageProps<"/admin/[id]/wishes">) {
  const { id } = await params;
  const inv = await getInvitationOrNotFound(id);
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.wishes)
    .where(eq(schema.wishes.invitationId, id))
    .orderBy(desc(schema.wishes.createdAt));
  return (
    <>
      <InvitationNav id={id} title={`${inv.content.groom.nickname} & ${inv.content.bride.nickname}`} active="/wishes" />
      <WishModeration
        invitationId={id}
        initial={rows.map((w) => ({
          id: w.id,
          nama: w.nama,
          pesan: w.pesan,
          hidden: w.hidden,
          createdAt: w.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
