import { Reveal } from "@/components/invitation/Reveal";
import type { SectionWrapperProps } from "../kit";

/** Latar motif batik tipis, judul dengan garis ganda dan wajik emas. */
export function Section({ title, eyebrow, children }: SectionWrapperProps) {
  return (
    <section className="inv-batik relative px-6 py-16 text-center">
      <Reveal variant="zoom">
        {eyebrow && <p className="text-[11px] uppercase tracking-[0.35em] text-inv-muted">{eyebrow}</p>}
        {title && (
          <div className="mt-3">
            <span data-fx="line" aria-hidden className="mx-auto block h-px w-28 bg-inv-primary" />
            <h2 className="my-3 font-display text-3xl uppercase tracking-[0.16em] text-inv-primary">{title}</h2>
            <span data-fx="line" aria-hidden className="mx-auto block h-px w-28 bg-inv-primary" />
            <span aria-hidden className="mx-auto mt-2 block h-2 w-2 rotate-45 bg-inv-primary" />
          </div>
        )}
      </Reveal>
      <Reveal delay={0.1} variant="up">
        <div className="mt-8">{children}</div>
      </Reveal>
    </section>
  );
}
