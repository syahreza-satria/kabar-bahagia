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
    <div className="relative flex min-h-dvh flex-col items-center justify-end overflow-hidden px-6 pb-12 pt-24 text-center">
      {coverImageUrl && (
        <>
          <Image src={coverImageUrl} alt="" fill priority sizes="480px" className="inv-kenburns object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-inv-bg/60 via-inv-bg/85 to-inv-bg" />
        </>
      )}
      <CoverScene kind="rings" />
      <div className="pointer-events-none absolute inset-4 border border-inv-primary/40" aria-hidden />

      <div className="relative z-10">
        <p className="text-xs uppercase tracking-[0.4em] text-inv-muted">The Wedding of</p>
        <h1 className="mt-4 font-display text-6xl leading-tight text-inv-ink">
          <SplitText text={groom.nickname} className="block" />
          <span className="block text-3xl italic text-inv-primary">&amp;</span>
          <SplitText text={bride.nickname} className="block" delay={0.7} />
        </h1>
        {main && <p className="mt-5 text-sm tracking-widest text-inv-muted">{formatDateLong(main.startsAt, main.timezone)}</p>}
        <CoverFooter guestSlot={guestSlot} className="mt-10" />
      </div>
    </div>
  );
}
