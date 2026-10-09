import type { ThemeConfig } from "../types";
import { body, display } from "./fonts";

export const config: ThemeConfig = {
  id: "elegan-minimalis",
  name: "Elegan Minimalis",
  description: "Krem hangat, tipografi serif klasik, ruang lega.",
  previewImage: "/themes/elegan-minimalis.svg",
  tags: ["Terang", "3D"],
  colors: {
    bg: "#faf7f2",
    surface: "#ffffff",
    ink: "#2b2a28",
    muted: "#78736b",
    primary: "#8a6f4d",
    line: "#e6dfd3",
  },
  fontClassName: `${display.variable} ${body.variable} font-body`,
  ornaments: { divider: "❦" },
  coverExit: "slideUp",
  radius: "0.5rem",
  ambient: "sparkles",
};
