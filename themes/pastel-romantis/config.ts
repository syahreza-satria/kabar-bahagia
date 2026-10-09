import type { ThemeConfig } from "../types";
import { body, display, script } from "./fonts";

export const config: ThemeConfig = {
  id: "pastel-romantis",
  name: "Pastel Romantis",
  description: "Merah muda lembut, tulisan tangan, hati 3D melayang.",
  previewImage: "/themes/pastel-romantis.svg",
  colors: {
    bg: "#fdf2f4",
    surface: "#ffffff",
    ink: "#4a3538",
    muted: "#957e82",
    primary: "#c95a77",
    line: "#f3d6dc",
  },
  fontClassName: `${display.variable} ${body.variable} ${script.variable} font-body`,
  ornaments: { divider: "♡" },
  radius: "1.5rem",
  ambient: "hearts",
  animation: { reveal: true },
  defaultSections: ["cover", "pembuka", "mempelai", "countdown", "acara", "galeri", "rsvp", "ucapan", "amplop", "penutup"],
};
