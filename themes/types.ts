import type { ComponentType, ReactNode } from "react";
import type { AmbientKind } from "@/components/invitation/Ambient";
import type { InvitationData, SectionCode } from "@/types/invitation";

export type SectionProps = {
  data: InvitationData;
  /** Khusus Cover: nama tamu (di-stream terpisah agar halaman tetap statis). */
  guestSlot?: ReactNode;
};

export type ThemeConfig = {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  colors: { bg: string; surface: string; ink: string; muted: string; primary: string; line: string; onPrimary?: string };
  /** className dari next/font yang menyetel --font-inv-display & --font-inv-body */
  fontClassName: string;
  ornaments: { divider: string };
  /** radius kartu (CSS), mis. "0.5rem" */
  radius: string;
  /** partikel melayang setelah undangan dibuka */
  ambient: AmbientKind | null;
  animation: { reveal: boolean };
  defaultSections: SectionCode[];
};

export type ThemeDefinition = {
  config: ThemeConfig;
  sections: Record<SectionCode, ComponentType<SectionProps>>;
};
