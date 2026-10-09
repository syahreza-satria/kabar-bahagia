import type { ComponentType, ReactNode } from "react";
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
  colors: { bg: string; surface: string; ink: string; muted: string; primary: string; line: string };
  /** className dari next/font yang menyetel --font-inv-display & --font-inv-body */
  fontClassName: string;
  ornaments: { divider: string };
  animation: { reveal: boolean };
  defaultSections: SectionCode[];
};

export type ThemeDefinition = {
  config: ThemeConfig;
  sections: Record<SectionCode, ComponentType<SectionProps>>;
};
