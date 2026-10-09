import type { ThemeDefinition } from "./types";
import { eleganMinimalis } from "./elegan-minimalis";

const themes: Record<string, ThemeDefinition> = {
  [eleganMinimalis.config.id]: eleganMinimalis,
};

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
