import type { ThemeConfig } from "../types";
import { body, display, script } from "./fonts";

export const config: ThemeConfig = {
  id: "tirai-teater",
  name: "Tirai Teater",
  description: "Tirai beludru merah terbuka lebar, pertunjukan cinta dimulai.",
  previewImage: "/themes/tirai-teater.svg",
  tags: ["Gelap", "Interaktif", "3D"],
  colors: {
    bg: "#1b0a0d",
    surface: "#2a1015",
    ink: "#f6e9d2",
    muted: "#bf9f8a",
    primary: "#d9a441",
    line: "#4a2128",
    onPrimary: "#1b0a0d",
  },
  fontClassName: `${display.variable} ${body.variable} ${script.variable} font-body`,
  ornaments: { divider: "❖" },
  coverExit: "fade",
  radius: "0.25rem",
  ambient: "sparkles",
};
