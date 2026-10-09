import { createSections } from "../kit";
import type { ThemeDefinition } from "../types";
import { config } from "./config";
import { Cover } from "./Cover";
import { Section } from "./ui";

export const pastelRomantis: ThemeDefinition = {
  config,
  sections: createSections({
    Section,
    Cover,
    photoShape: "circle",
    scenes: { countdown: "hearts", showcase: "heart" },
  }),
};
