import type { ThemeConfig } from "../types";
import { body, display, script } from "./fonts";

export const config: ThemeConfig = {
  id: "rustic-floral",
  name: "Rustic Floral",
  description: "Hijau sage hangat, dedaunan, kelopak 3D berjatuhan.",
  previewImage: "/themes/rustic-floral.svg",
  colors: {
    bg: "#f6f3ea",
    surface: "#fffdf7",
    ink: "#33392f",
    muted: "#7b806f",
    primary: "#5f7c55",
    line: "#ddd8c4",
  },
  fontClassName: `${display.variable} ${body.variable} ${script.variable} font-body`,
  ornaments: { divider: "❧" },
  coverExit: "slideUp",
  radius: "1.25rem",
  ambient: "petals",
  animation: { reveal: true },
  defaultSections: ["cover", "pembuka", "mempelai", "countdown", "acara", "galeri", "rsvp", "ucapan", "amplop", "penutup"],
};
