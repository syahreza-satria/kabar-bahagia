import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { InvitationNav } from "@/components/admin/InvitationNav";
import { WishModeration } from "@/components/admin/WishModeration";
import { getDb, schema } from "@/db";

export default async function WishesPage({ params }: PageProps<"/admin/[id]/wishes">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = getDb();
  const [inv] = await db.select().from(schema.invitations).where(eq(schema.invitations.id, id)).limit(1);
  if (!inv) notFound();
  const rows = await db.select().from(schema.wishes).where(eq(schema.wishes.invitationId, id)).orderBy(desc(schema.wishes.createdAt));
  return (
    <>
      <InvitationNav id={id} title={`${inv.content.groom.nickname} & ${inv.content.bride.nickname}`} active="/wishes" />
      <WishModeration
        invitationId={id}
        initial={rows.map((w) => ({ id: w.id, nama: w.nama, pesan: w.pesan, hidden: w.hidden, createdAt: w.createdAt.toISOString() }))}
      />
    </>
  );
}
