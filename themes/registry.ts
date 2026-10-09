import { eleganMinimalis } from "./elegan-minimalis";
import { midnightGold } from "./midnight-gold";
import { pastelRomantis } from "./pastel-romantis";
import { rusticFloral } from "./rustic-floral";
import type { ThemeDefinition } from "./types";

const themes: Record<string, ThemeDefinition> = Object.fromEntries(
  [eleganMinimalis, rusticFloral, midnightGold, pastelRomantis].map((t) => [t.config.id, t]),
);

export const DEFAULT_THEME_ID = eleganMinimalis.config.id;

export function getTheme(id: string): ThemeDefinition {
  return themes[id] ?? themes[DEFAULT_THEME_ID];
}

/** Daftar ringan untuk panel admin (id, nama, gambar pratinjau). */
export const themeList = Object.values(themes).map(({ config }) => ({
  id: config.id,
  name: config.name,
  description: config.description,
  previewImage: config.previewImage,
}));
