import { CoverScene } from "@/components/invitation/CoverScene";
import { SplitText } from "@/components/invitation/SplitText";
import { SunRise } from "@/components/invitation/SunRise";
import { formatDateLong } from "@/lib/utils";
import { CoverFooter } from "../kit/CoverFooter";
import type { SectionProps } from "../types";

const WAVE = "M0 40 C 150 0, 350 80, 600 40 S 1050 0, 1200 40 L1200 120 L0 120 Z";

function Wave({ color, duration, className }: { color: string; duration: string; className: string }) {
  return (
    <div aria-hidden className={`absolute inset-x-0 h-24 overflow-hidden ${className}`}>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="inv-wave h-full w-[200%] max-w-none" style={{ animationDuration: duration }}>
        <path d={WAVE} fill={color} />
        <path d={WAVE} fill={color} transform="translate(1200 0)" />
      </svg>
    </div>
  );
}

/** Bagian atas: langit senja + laut + ombak; bagian bawah: panel pasir untuk tamu dan tombol. */
export function Cover({ data, guestSlot }: SectionProps) {
  const { bride, groom } = data.content;
  const main = data.events[0];
  return (
    <div className="flex min-h-dvh flex-col bg-inv-bg">
      <div
        className="relative flex min-h-[62dvh] flex-1 flex-col items-center overflow-hidden px-6 pt-16 text-center"
        style={{ background: "linear-gradient(#ffd6a5 0%, #ff9a76 36%, #ee6a5b 56%, #1b6f7c 57%, #0f4c5c 100%)" }}
      >
        <CoverScene kind="bubbles" />
        <SunRise />
        <div className="relative z-10 mt-2">
          <p className="text-xs uppercase tracking-[0.4em] text-white/90">Kami Menikah</p>
          <h1 className="mt-4 font-script text-6xl leading-tight text-white drop-shadow">
            <SplitText text={groom.nickname} className="block" />
            <span className="block text-3xl">&amp;</span>
            <SplitText text={bride.nickname} className="block" delay={0.7} />
          </h1>
          {main && <p className="mt-4 text-sm tracking-widest text-white/95">{formatDateLong(main.startsAt, main.timezone)}</p>}
        </div>
        <Wave color="rgba(255,255,255,0.25)" duration="12s" className="bottom-12" />
        <Wave color="rgba(255,246,233,0.6)" duration="8s" className="bottom-6" />
        <Wave color="#fff6e9" duration="6s" className="-bottom-1" />
      </div>
      <div className="bg-inv-bg px-6 pb-8 pt-2 text-center">
        <CoverFooter guestSlot={guestSlot} />
      </div>
    </div>
  );
}
