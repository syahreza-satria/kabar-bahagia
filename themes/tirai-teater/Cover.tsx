import { formatDateLong } from "@/lib/utils";
import type { SectionProps } from "../types";
import { CurtainCover } from "./CurtainCover";

export function Cover({ data, guestSlot }: SectionProps) {
  const { bride, groom } = data.content;
  const main = data.events[0];
  return (
    <CurtainCover
      groom={groom.nickname}
      bride={bride.nickname}
      dateText={main ? formatDateLong(main.startsAt, main.timezone) : ""}
    >
      {guestSlot}
    </CurtainCover>
  );
}
