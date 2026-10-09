import { createSections } from "../kit";
import type { ThemeDefinition } from "../types";
import { config } from "./config";
import { Cover } from "./Cover";
import { Section } from "./ui";

export const sakuraZen: ThemeDefinition = {
  config,
  sections: createSections({
    Section,
    Cover,
    photoShape: "square",
    motion: "rise",
    gallery: "filmstrip",
    scenes: { countdown: "petals", showcase: "heart", closing: "lanterns" },
  }),
};
