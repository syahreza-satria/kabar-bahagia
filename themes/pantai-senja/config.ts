import type { ThemeConfig } from "../types";
import { body, display, script } from "./fonts";

export const config: ThemeConfig = {
  id: "pantai-senja",
  name: "Pantai Senja",
  description: "Matahari terbenam, ombak bergerak, gelembung laut 3D.",
  previewImage: "/themes/pantai-senja.svg",
  colors: {
    bg: "#fff6e9",
    surface: "#ffffff",
    ink: "#12414a",
    muted: "#5f8187",
    primary: "#e46a4e",
    line: "#f1dfc4",
    scene: "#8fdde0",
  },
  fontClassName: `${display.variable} ${body.variable} ${script.variable} font-body`,
  ornaments: { divider: "〰" },
  coverExit: "zoom",
  radius: "1.75rem",
  ambient: "bubbles",
};
