import { createSections } from "../kit";
import type { ThemeDefinition } from "../types";
import { config } from "./config";
import { Cover } from "./Cover";
import { Section } from "./ui";

export const nusantaraKlasik: ThemeDefinition = {
  config,
  sections: createSections({ Section, Cover, photoShape: "arch", motion: "zoom", scenes: { countdown: "lanterns", showcase: "rings", closing: "lanterns" } }),
};
