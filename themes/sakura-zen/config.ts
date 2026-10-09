import type { ThemeConfig } from "../types";
import { body, display } from "./fonts";

export const config: ThemeConfig = {
  id: "sakura-zen",
  name: "Sakura Zen",
  description: "Minimalis ala Jepang: matahari merah, teks vertikal, kelopak sakura 3D.",
  previewImage: "/themes/sakura-zen.svg",
  colors: {
    bg: "#faf6f2",
    surface: "#ffffff",
    ink: "#2a2626",
    muted: "#8a7f7a",
    primary: "#b8374a",
    line: "#eadfd8",
    scene: "#f7a8bb",
  },
  fontClassName: `${display.variable} ${body.variable} font-body`,
  ornaments: { divider: "●" },
  coverExit: "iris",
  radius: "0.125rem",
  ambient: "petals",
};
