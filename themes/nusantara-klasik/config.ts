import type { ThemeConfig } from "../types";
import { body, display } from "./fonts";

export const config: ThemeConfig = {
  id: "nusantara-klasik",
  name: "Nusantara Klasik",
  description: "Motif batik emas dan mandala berputar di atas marun tradisional.",
  previewImage: "/themes/nusantara-klasik.svg",
  colors: {
    bg: "#fbf3e4",
    surface: "#fffaf0",
    ink: "#3a1f1a",
    muted: "#86695a",
    primary: "#9a6b1f",
    line: "#e7d3a8",
  },
  fontClassName: `${display.variable} ${body.variable} font-body`,
  ornaments: { divider: "❖" },
  coverExit: "slideUp",
  radius: "0.25rem",
  ambient: "sparkles",
};
