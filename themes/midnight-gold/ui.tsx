import { Reveal } from "@/components/invitation/effects/Reveal";
import type { SectionWrapperProps } from "../kit";
import { config } from "./config";

export function Section({ title, eyebrow, children }: SectionWrapperProps) {
  return (
    <section className="relative overflow-hidden border-t border-inv-line px-6 py-20 text-center">
      <span
        data-fx="parallax"
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 select-none font-display text-[9rem] leading-none text-inv-primary opacity-[0.05]"
      >
        {config.ornaments.divider}
      </span>
      <div className="relative">
        <Reveal variant="fade">
          {eyebrow && <p className="text-[11px] uppercase tracking-[0.4em] text-inv-primary">{eyebrow}</p>}
          {title && <h2 className="mt-3 font-display text-3xl uppercase tracking-[0.18em] text-inv-ink">{title}</h2>}
          {(title || eyebrow) && (
            <span
              data-fx="line"
              aria-hidden
              className="mx-auto mt-5 mb-7 block h-px w-24 origin-center bg-inv-primary"
            />
          )}
        </Reveal>
        <Reveal delay={0.1} variant="up">
          {children}
        </Reveal>
      </div>
    </section>
  );
}
