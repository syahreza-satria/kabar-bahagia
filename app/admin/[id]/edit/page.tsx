import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { InvitationNav } from "@/components/admin/InvitationNav";
import { InvitationForm, type FormState } from "@/components/admin/InvitationForm";
import { getDb, schema } from "@/db";
import { loadInvitationParts } from "@/lib/data";
import { isoToLocalInput } from "@/lib/utils";
import { themeList } from "@/themes/registry";

export default async function EditInvitationPage({ params }: PageProps<"/admin/[id]/edit">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [row] = await getDb().select().from(schema.invitations).where(eq(schema.invitations.id, id)).limit(1);
  if (!row) notFound();
  const data = await loadInvitationParts(row);

  const initial: FormState = {
    slug: data.slug,
    themeId: data.themeId,
    primaryColor: data.primaryColor ?? "",
    musicUrl: data.musicUrl ?? "",
    ogImageUrl: data.ogImageUrl ?? "",
    content: data.content,
    sectionConfig: data.sectionConfig,
    events: data.events.map((e) => ({
      name: e.name,
      startsLocal: isoToLocalInput(e.startsAt, e.timezone),
      endsLocal: e.endsAt ? isoToLocalInput(e.endsAt, e.timezone) : "",
      timezone: e.timezone,
      venue: e.venue,
      address: e.address,
      mapsUrl: e.mapsUrl,
    })),
    gifts: data.gifts.map((g) => ({
      type: g.type,
      bankName: g.bankName,
      number: g.number,
      accountName: g.accountName,
      qrUrl: g.qrUrl,
    })),
  };

  return (
    <>
      <InvitationNav id={id} title={`${data.content.groom.nickname} & ${data.content.bride.nickname}`} active="/edit" />
      <InvitationForm invitationId={id} initial={initial} themes={themeList} />
    </>
  );
}
