import type { ThemeDefinition } from "../types";
import { config } from "./config";
import { Acara } from "./sections/Acara";
import { Amplop } from "./sections/Amplop";
import { CountdownSection } from "./sections/Countdown";
import { Cover } from "./sections/Cover";
import { Galeri } from "./sections/Galeri";
import { Live } from "./sections/Live";
import { LoveStory } from "./sections/LoveStory";
import { Mempelai } from "./sections/Mempelai";
import { Pembuka } from "./sections/Pembuka";
import { Penutup } from "./sections/Penutup";
import { Rsvp } from "./sections/Rsvp";
import { Ucapan } from "./sections/Ucapan";

export const eleganMinimalis: ThemeDefinition = {
  config,
  sections: {
    cover: Cover,
    pembuka: Pembuka,
    mempelai: Mempelai,
    countdown: CountdownSection,
    acara: Acara,
    galeri: Galeri,
    lovestory: LoveStory,
    rsvp: Rsvp,
    ucapan: Ucapan,
    amplop: Amplop,
    live: Live,
    penutup: Penutup,
  },
};
