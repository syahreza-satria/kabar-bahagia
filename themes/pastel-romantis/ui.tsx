import { Reveal } from "@/components/invitation/Reveal";
import type { SectionWrapperProps } from "../kit";
import { config } from "./config";

export function Section({ title, eyebrow, children }: SectionWrapperProps) {
  return (
    <section className="relative overflow-hidden px-6 py-16 text-center">
      <span data-fx="parallax" aria-hidden className="pointer-events-none absolute -left-10 top-8 h-40 w-40 rounded-full bg-inv-primary opacity-[0.07]" />
      <span data-fx="parallax" aria-hidden className="pointer-events-none absolute -right-12 bottom-10 h-48 w-48 rounded-full bg-inv-primary opacity-[0.07]" />
      <div className="relative">
        <Reveal variant="zoom">
          {eyebrow && <p className="text-xs tracking-[0.2em] text-inv-muted">{eyebrow}</p>}
          {title && <h2 className="mt-1 font-script text-5xl text-inv-primary">{title}</h2>}
          {(title || eyebrow) && (
            <p data-fx="drift" aria-hidden className="my-3 text-xl text-inv-primary">
              {config.ornaments.divider}
            </p>
          )}
        </Reveal>
        <Reveal delay={0.1}>{children}</Reveal>
      </div>
    </section>
  );
}
