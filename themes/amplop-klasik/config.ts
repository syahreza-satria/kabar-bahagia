import type { ThemeConfig } from "../types";
import { body, display, script } from "./fonts";

export const config: ThemeConfig = {
  id: "amplop-klasik",
  name: "Amplop Klasik",
  description: "Ketuk segel lilin: amplop terbuka dan surat undangan terangkat.",
  previewImage: "/themes/amplop-klasik.svg",
  colors: {
    bg: "#f4ebe0",
    surface: "#fffaf3",
    ink: "#3b2a2a",
    muted: "#8a7468",
    primary: "#8c2b3a",
    line: "#e3d3c1",
  },
  fontClassName: `${display.variable} ${body.variable} ${script.variable} font-body`,
  ornaments: { divider: "✉" },
  coverExit: "fade",
  radius: "0.35rem",
  ambient: null,
};
