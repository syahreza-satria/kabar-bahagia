import { createSections } from "../kit";
import type { ThemeDefinition } from "../types";
import { config } from "./config";
import { Cover } from "./Cover";
import { Section } from "./ui";

export const polaroidMemories: ThemeDefinition = {
  config,
  sections: createSections({ Section, Cover, photoShape: "square", motion: "rotate", gallery: "polaroid" }),
};
