import { formatDateLong } from "@/lib/utils";
import type { SectionProps } from "../types";
import { PolaroidCover } from "./PolaroidCover";

export function Cover({ data, guestSlot }: SectionProps) {
  const { bride, groom, coverImageUrl } = data.content;
  const main = data.events[0];
  const gallery = data.media.filter((m) => m.type === "foto" && m.section === "galeri");
  // gunakan foto yang ada: cover, mempelai, lalu galeri
  const sources = [
    coverImageUrl && { src: coverImageUrl, caption: "us ♡" },
    groom.photoUrl && { src: groom.photoUrl, caption: groom.nickname },
    bride.photoUrl && { src: bride.photoUrl, caption: bride.nickname },
    ...gallery.map((g, i) => ({ src: g.url, caption: `#${i + 1}` })),
  ].filter((x): x is { src: string; caption: string } => !!x);

  return (
    <PolaroidCover
      groom={groom.nickname}
      bride={bride.nickname}
      dateText={main ? formatDateLong(main.startsAt, main.timezone) : ""}
      photos={sources}
    >
      {guestSlot}
    </PolaroidCover>
  );
}
