import { createSections } from "../kit";
import type { ThemeDefinition } from "../types";
import { config } from "./config";
import { Cover } from "./Cover";
import { Section } from "./ui";

export const eleganMinimalis: ThemeDefinition = {
  config,
  sections: createSections({ Section, Cover, photoShape: "arch", scenes: { countdown: "stars", showcase: "rings" } }),
};
