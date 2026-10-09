import type { ThemeConfig } from "../types";
import { body, display } from "./fonts";

export const config: ThemeConfig = {
  id: "polaroid-memories",
  name: "Polaroid Memories",
  description: "Album kenangan: polaroid yang bisa diseret, tulisan tangan, kertas kraft.",
  previewImage: "/themes/polaroid-memories.svg",
  colors: {
    bg: "#efe6d6",
    surface: "#fffdf8",
    ink: "#3b3328",
    muted: "#85796a",
    primary: "#b5533c",
    line: "#dccfb8",
  },
  fontClassName: `${display.variable} ${body.variable} font-body`,
  ornaments: { divider: "✎" },
  coverExit: "slideLeft",
  radius: "0.375rem",
  ambient: null,
  animation: { reveal: true },
  defaultSections: ["cover", "pembuka", "mempelai", "countdown", "acara", "galeri", "rsvp", "ucapan", "amplop", "penutup"],
};
