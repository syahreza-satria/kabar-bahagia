import type { ThemeConfig } from "../types";
import { body, display } from "./fonts";

export const config: ThemeConfig = {
  id: "neon-night",
  name: "Neon Night",
  description: "Gelap futuristik: lantai grid neon, teks glitch, bentuk wireframe 3D.",
  previewImage: "/themes/neon-night.svg",
  colors: {
    bg: "#0a0a14",
    surface: "#12121f",
    ink: "#f4f4ff",
    muted: "#8d8da8",
    primary: "#ff2e93",
    line: "#2b2b45",
    onPrimary: "#ffffff",
    scene: "#00e5ff",
  },
  fontClassName: `${display.variable} ${body.variable} font-body`,
  ornaments: { divider: "◆" },
  coverExit: "zoom",
  radius: "0.5rem",
  ambient: "sparkles",
  animation: { reveal: true },
  defaultSections: ["cover", "pembuka", "mempelai", "countdown", "acara", "galeri", "rsvp", "ucapan", "amplop", "penutup"],
};
