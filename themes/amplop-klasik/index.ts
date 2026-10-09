import { createSections } from "../kit";
import type { ThemeDefinition } from "../types";
import { config } from "./config";
import { Cover } from "./Cover";
import { Section } from "./ui";

export const amplopKlasik: ThemeDefinition = {
  config,
  sections: createSections({ Section, Cover, photoShape: "oval", motion: "rise" }),
};
