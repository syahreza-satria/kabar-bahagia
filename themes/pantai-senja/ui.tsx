import { Reveal } from "@/components/invitation/effects/Reveal";
import type { SectionWrapperProps } from "../kit";

const WAVE = "M0 12 C 20 0, 40 24, 60 12 S 100 0, 120 12";

function WaveLine() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 24"
      className="mx-auto my-4 h-5 w-24 text-inv-primary"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d={WAVE} />
    </svg>
  );
}

/** Kartu-kartu pasir berbentuk lembut dengan garis ombak. */
export function Section({ title, eyebrow, children }: SectionWrapperProps) {
  return (
    <section className="relative px-4 py-8">
      <div className="relative overflow-hidden rounded-[2rem] bg-white/70 px-5 py-12 text-center shadow-[0_10px_40px_-18px_rgba(18,65,74,0.35)]">
        <span
          data-fx="parallax"
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-inv-primary opacity-[0.12]"
        />
        <span
          data-fx="parallax"
          aria-hidden
          className="pointer-events-none absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-[#8fdde0] opacity-30"
        />
        <div className="relative">
          <Reveal variant="up">
            {eyebrow && <p className="text-xs uppercase tracking-[0.25em] text-inv-muted">{eyebrow}</p>}
            {title && <h2 className="mt-2 font-script text-4xl text-inv-primary">{title}</h2>}
            {(title || eyebrow) && <WaveLine />}
          </Reveal>
          <Reveal delay={0.1}>{children}</Reveal>
        </div>
      </div>
    </section>
  );
}
