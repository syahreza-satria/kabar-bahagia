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
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      {coverImageUrl && (
        <>
          <Image src={coverImageUrl} alt="" fill loading="eager" sizes="480px" className="inv-kenburns object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-inv-bg/70 via-inv-bg/60 to-inv-bg" />
        </>
      )}
      <CoverScene kind="galaxy" />
      <div className="pointer-events-none absolute inset-5 border border-inv-primary/50" aria-hidden />
      <div className="pointer-events-none absolute inset-7 border border-inv-primary/20" aria-hidden />

      <div className="relative z-10">
        <p className="text-[11px] uppercase tracking-[0.5em] text-inv-primary">Undangan Pernikahan</p>
        <h1 className="mt-6 font-display text-5xl uppercase leading-tight tracking-[0.12em] text-inv-ink">
          <SplitText text={groom.nickname} className="block" />
          <span className="my-1 block text-2xl text-inv-primary">&amp;</span>
          <SplitText text={bride.nickname} className="block" delay={0.7} />
        </h1>
        {main && <p className="mt-6 text-xs uppercase tracking-[0.3em] text-inv-muted">{formatDateLong(main.startsAt, main.timezone)}</p>}
        <CoverFooter guestSlot={guestSlot} className="mt-10" />
      </div>
    </div>
  );
}
