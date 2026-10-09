import { Reveal } from "@/components/invitation/effects/Reveal";
import type { SectionWrapperProps } from "../kit";

/** Banyak ruang kosong; garis vertikal tipis dan titik merah sebagai penanda. */
export function Section({ title, eyebrow, children }: SectionWrapperProps) {
  return (
    <section className="relative px-8 py-20 text-center">
      <Reveal variant="fade">
        <span
          data-fx="line"
          aria-hidden
          className="mx-auto mb-5 block h-14 w-px origin-top scale-x-100 bg-inv-ink/30"
        />
        {eyebrow && <p className="text-[11px] tracking-[0.5em] text-inv-muted">{eyebrow}</p>}
        {title && <h2 className="mt-3 font-display text-3xl tracking-[0.3em] text-inv-ink">{title}</h2>}
        {(title || eyebrow) && <span aria-hidden className="mx-auto mt-5 block h-2 w-2 rounded-full bg-inv-primary" />}
      </Reveal>
      <Reveal delay={0.1} variant="up">
        <div className="mt-10">{children}</div>
      </Reveal>
    </section>
  );
}
