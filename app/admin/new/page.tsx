import { InvitationForm, type FormState } from "@/components/admin/InvitationForm";
import { defaultSectionConfig, emptyContent } from "@/types/invitation";
import { DEFAULT_THEME_ID, themeList } from "@/themes/registry";

export default function NewInvitationPage() {
  const initial: FormState = {
    slug: "",
    themeId: DEFAULT_THEME_ID,
    primaryColor: "",
    musicUrl: "",
    ogImageUrl: "",
    content: emptyContent(),
    sectionConfig: defaultSectionConfig(),
    events: [],
    gifts: [],
  };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Undangan baru</h1>
      <InvitationForm invitationId={null} initial={initial} themes={themeList} />
    </div>
  );
}
