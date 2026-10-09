import { createSections } from "../kit";
import type { ThemeDefinition } from "../types";
import { config } from "./config";
import { Cover } from "./Cover";
import { Section } from "./ui";

export const tiraiTeater: ThemeDefinition = {
  config,
  sections: createSections({ Section, Cover, photoShape: "arch", motion: "flip", gallery: "filmstrip", scenes: { countdown: "stars", showcase: "rings" } }),
};
