import type { ThemeConfig } from "../types";
import { body, display } from "./fonts";

export const config: ThemeConfig = {
  id: "midnight-gold",
  name: "Midnight Gold",
  description: "Biru malam dengan aksen emas, langit berbintang 3D.",
  previewImage: "/themes/midnight-gold.svg",
  colors: {
    bg: "#0f1626",
    surface: "#172036",
    ink: "#f1ecdf",
    muted: "#9aa3b8",
    primary: "#d4af6a",
    line: "#2a3550",
    onPrimary: "#0f1626",
  },
  fontClassName: `${display.variable} ${body.variable} font-body`,
  ornaments: { divider: "✦" },
  radius: "0.25rem",
  ambient: "sparkles",
  animation: { reveal: true },
  defaultSections: ["cover", "pembuka", "mempelai", "countdown", "acara", "galeri", "rsvp", "ucapan", "amplop", "penutup"],
};
