import { formatDateLong } from "@/lib/utils";
import type { SectionProps } from "../types";
import { EnvelopeCover } from "./EnvelopeCover";

export function Cover({ data, guestSlot }: SectionProps) {
  const { bride, groom } = data.content;
  const main = data.events[0];
  return (
    <EnvelopeCover
      groom={groom.nickname}
      bride={bride.nickname}
      dateText={main ? formatDateLong(main.startsAt, main.timezone) : ""}
    >
      {guestSlot}
    </EnvelopeCover>
  );
}
