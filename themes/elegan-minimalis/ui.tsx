import { Reveal } from "@/components/invitation/Reveal";
import type { SectionWrapperProps } from "../kit";
import { config } from "./config";

export function Divider() {
  return (
    <div className="my-5 flex items-center justify-center gap-3 text-inv-primary" aria-hidden>
      <span data-fx="line" className="h-px w-12 origin-right bg-inv-line" />
      <span>{config.ornaments.divider}</span>
      <span data-fx="line" className="h-px w-12 origin-left bg-inv-line" />
    </div>
  );
}

export function Section({ title, eyebrow, children }: SectionWrapperProps) {
  return (
    <section className="relative overflow-hidden px-6 py-16 text-center">
      <span data-fx="parallax" aria-hidden className="pointer-events-none absolute right-2 top-6 select-none font-display text-9xl text-inv-primary opacity-[0.06]">
        {config.ornaments.divider}
      </span>
      <div className="relative">
        <Reveal variant="blur">
          {eyebrow && <p className="text-xs uppercase tracking-[0.3em] text-inv-muted">{eyebrow}</p>}
          {title && <h2 className="mt-2 font-display text-4xl text-inv-primary">{title}</h2>}
          {(title || eyebrow) && <Divider />}
        </Reveal>
        <Reveal delay={0.1}>{children}</Reveal>
      </div>
    </section>
  );
}
