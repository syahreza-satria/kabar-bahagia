import { Reveal } from "@/components/invitation/effects/Reveal";
import type { SectionWrapperProps } from "../kit";
import { config } from "./config";

export function Section({ title, eyebrow, children }: SectionWrapperProps) {
  return (
    <section className="relative overflow-hidden px-6 py-16 text-center">
      <span
        data-fx="drift"
        aria-hidden
        className="pointer-events-none absolute -left-8 top-4 select-none text-9xl text-inv-primary opacity-[0.08]"
      >
        {config.ornaments.divider}
      </span>
      <span
        data-fx="parallax"
        aria-hidden
        className="pointer-events-none absolute -right-6 bottom-6 select-none text-8xl text-inv-primary opacity-[0.08]"
      >
        ✿
      </span>
      <div className="relative">
        <Reveal variant="zoom">
          {eyebrow && <p className="text-xs uppercase tracking-[0.25em] text-inv-muted">{eyebrow}</p>}
          {title && <h2 className="mt-1 font-script text-5xl text-inv-primary">{title}</h2>}
          {(title || eyebrow) && (
            <div className="mx-auto my-4 flex w-40 items-center justify-center gap-2 text-inv-primary" aria-hidden>
              <span data-fx="line" className="h-px flex-1 origin-right bg-inv-primary/40" />
              <span>{config.ornaments.divider}</span>
              <span data-fx="line" className="h-px flex-1 origin-left bg-inv-primary/40" />
            </div>
          )}
        </Reveal>
        <Reveal delay={0.1}>{children}</Reveal>
      </div>
    </section>
  );
}
