import { CoverScene } from "@/components/invitation/CoverScene";
import { SplitText } from "@/components/invitation/SplitText";
import { formatDateLong } from "@/lib/utils";
import { CoverFooter } from "../kit/CoverFooter";
import type { SectionProps } from "../types";

export function Cover({ data, guestSlot }: SectionProps) {
  const { bride, groom } = data.content;
  const main = data.events[0];
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      {/* lantai grid perspektif */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[55%] [perspective:400px]">
        <div className="inv-neon-grid h-[200%] w-[200%] origin-bottom -translate-x-1/4 opacity-40 [transform:rotateX(62deg)]" />
      </div>
      <div aria-hidden className="absolute inset-x-0 top-[20%] h-px bg-gradient-to-r from-transparent via-inv-primary to-transparent shadow-[0_0_24px_4px_var(--inv-primary)]" />
      <CoverScene kind="wire" />

      <div className="relative z-10">
        <p className="text-[11px] uppercase tracking-[0.5em] text-[#00e5ff]">{"// we are getting married"}</p>
        <h1 className="inv-glitch mt-5 font-display text-5xl font-extrabold uppercase leading-tight text-inv-ink">
          <SplitText text={groom.nickname} className="block" />
          <span className="block text-3xl text-inv-primary">+</span>
          <SplitText text={bride.nickname} className="block" delay={0.7} />
        </h1>
        {main && <p className="mt-5 font-mono text-xs uppercase tracking-[0.3em] text-[#00e5ff]">{formatDateLong(main.startsAt, main.timezone)}</p>}
        <CoverFooter guestSlot={guestSlot} className="mt-10 [&_button]:shadow-[0_0_24px_var(--inv-primary)]" buttonLabel="Masuk" />
      </div>
    </div>
  );
}
