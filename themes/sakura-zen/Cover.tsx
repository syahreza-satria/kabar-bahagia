import { CoverScene } from "@/components/invitation/scene/CoverScene";
import { SplitText } from "@/components/invitation/effects/SplitText";
import { formatDateLong } from "@/lib/dates";
import { CoverFooter } from "../kit/CoverFooter";
import type { SectionProps } from "../types";
import { RedSun } from "./RedSun";

export function Cover({ data, guestSlot }: SectionProps) {
  const { bride, groom } = data.content;
  const main = data.events[0];
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden px-6 pb-10 pt-14">
      <CoverScene kind="petals" />
      <RedSun />

      {/* nama vertikal bergaya tulisan Jepang */}
      <div className="relative z-10 flex flex-1 justify-center gap-6">
        <h1 className="font-display text-5xl text-inv-ink [text-orientation:upright] [writing-mode:vertical-rl]">
          <SplitText text={groom.nickname} />
        </h1>
        <p className="mt-12 font-display text-2xl text-inv-primary [writing-mode:vertical-rl]">結</p>
        <h1 className="mt-10 font-display text-5xl text-inv-ink [text-orientation:upright] [writing-mode:vertical-rl]">
          <SplitText text={bride.nickname} delay={0.7} />
        </h1>
      </div>

      <div className="relative z-10 text-center">
        {main && (
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-inv-muted">
            {formatDateLong(main.startsAt, main.timezone)}
          </p>
        )}
        <CoverFooter guestSlot={guestSlot} />
      </div>
    </div>
  );
}
