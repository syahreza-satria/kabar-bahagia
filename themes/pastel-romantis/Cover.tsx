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
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-inv-bg via-white to-inv-bg px-6 py-14 text-center">
      <span aria-hidden className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-inv-primary/15" />
      <span aria-hidden className="absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-inv-primary/10" />
      <CoverScene kind="hearts" />

      <div className="relative z-10">
        {coverImageUrl && (
          <div className="relative mx-auto mb-6 h-48 w-48 overflow-hidden rounded-full border-4 border-white shadow-xl ring-2 ring-inv-primary/40">
            <Image src={coverImageUrl} alt="" fill priority sizes="192px" className="inv-kenburns object-cover" />
          </div>
        )}
        <p className="text-xs tracking-[0.25em] text-inv-muted">Dengan penuh cinta, kami mengundang Anda</p>
        <h1 className="mt-3 font-script text-6xl leading-tight text-inv-primary">
          <SplitText text={groom.nickname} className="block" />
          <span className="block text-3xl">&amp;</span>
          <SplitText text={bride.nickname} className="block" delay={0.7} />
        </h1>
        {main && <p className="mt-4 text-sm text-inv-muted">{formatDateLong(main.startsAt, main.timezone)}</p>}
        <CoverFooter guestSlot={guestSlot} className="mt-8" />
      </div>
    </div>
  );
}
