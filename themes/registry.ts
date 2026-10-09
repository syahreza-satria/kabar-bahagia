import { amplopKlasik } from "./amplop-klasik";
import { eleganMinimalis } from "./elegan-minimalis";
import { midnightGold } from "./midnight-gold";
import { neonNight } from "./neon-night";
import { nusantaraKlasik } from "./nusantara-klasik";
import { pantaiSenja } from "./pantai-senja";
import { pastelRomantis } from "./pastel-romantis";
import { polaroidMemories } from "./polaroid-memories";
import { rusticFloral } from "./rustic-floral";
import { sakuraZen } from "./sakura-zen";
import { tiraiTeater } from "./tirai-teater";
import type { ThemeDefinition } from "./types";

const ALL: ThemeDefinition[] = [
  eleganMinimalis,
  rusticFloral,
  midnightGold,
  pastelRomantis,
  amplopKlasik,
  tiraiTeater,
  pantaiSenja,
  nusantaraKlasik,
  neonNight,
  polaroidMemories,
  sakuraZen,
];

const themes: Record<string, ThemeDefinition> = Object.fromEntries(ALL.map((t) => [t.config.id, t]));

export const DEFAULT_THEME_ID = eleganMinimalis.config.id;

export function getTheme(id: string): ThemeDefinition {
  return themes[id] ?? themes[DEFAULT_THEME_ID];
}

/** Daftar ringan untuk panel admin (id, nama, gambar pratinjau). */
export const themeList = ALL.map(({ config }) => ({
  id: config.id,
  name: config.name,
  description: config.description,
  previewImage: config.previewImage,
}));
