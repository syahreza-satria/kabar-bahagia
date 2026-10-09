import Image from "next/image";
import { CoverScene } from "@/components/invitation/CoverScene";
import { SplitText } from "@/components/invitation/SplitText";
import { formatDateLong } from "@/lib/utils";
import { CoverFooter } from "../kit/CoverFooter";
import type { SectionProps } from "../types";

export function Cover({ data, guestSlot }: SectionProps) {
  const { bride, groom, coverImageUrl } = data.content;
  const main = data.events[0];
  return (
    <div className="relative flex min-h-dvh flex-col items-center overflow-hidden px-6 pb-12 pt-14 text-center">
      <CoverScene kind="petals" />
      <p className="relative z-10 text-xs uppercase tracking-[0.35em] text-inv-muted">Kami Menikah</p>

      <div className="relative z-10 mt-6 h-72 w-56 overflow-hidden rounded-t-full border-4 border-inv-primary/70 bg-inv-line p-1.5 shadow-xl">
        <div className="relative h-full w-full overflow-hidden rounded-t-full">
          {coverImageUrl && <Image src={coverImageUrl} alt="" fill priority sizes="224px" className="inv-kenburns object-cover" />}
        </div>
      </div>

      <h1 className="relative z-10 mt-6 font-script text-6xl leading-none text-inv-primary">
        <SplitText text={`${groom.nickname} & ${bride.nickname}`} />
      </h1>
      {main && <p className="relative z-10 mt-3 text-sm tracking-widest text-inv-muted">{formatDateLong(main.startsAt, main.timezone)}</p>}
      <CoverFooter guestSlot={guestSlot} className="relative z-10 mt-8" />
    </div>
  );
}
