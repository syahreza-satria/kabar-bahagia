import { Reveal } from "@/components/invitation/Reveal";
import type { SectionWrapperProps } from "../kit";

/** Halaman album kertas dengan selotip dan judul tulisan tangan miring. */
export function Section({ title, eyebrow, children }: SectionWrapperProps) {
  return (
    <section className="inv-paper relative px-5 py-10">
      <Reveal variant="rotate">
        <div className="relative rounded-sm bg-inv-surface px-5 py-11 text-center shadow-[0_10px_24px_-12px_rgba(60,40,20,0.45)]">
          <span aria-hidden className="absolute -top-3 left-6 h-6 w-20 -rotate-3 bg-inv-primary/30" />
          <span aria-hidden className="absolute -top-3 right-6 h-6 w-20 rotate-3 bg-inv-primary/30" />
          {eyebrow && <p className="text-[11px] uppercase tracking-[0.3em] text-inv-muted">{eyebrow}</p>}
          {title && (
            <h2 className="mt-1 -rotate-2 font-display text-5xl text-inv-ink">
              <span className="bg-[linear-gradient(transparent_60%,color-mix(in_srgb,var(--inv-primary)_35%,transparent)_60%)] px-2">{title}</span>
            </h2>
          )}
          <div className="mt-7">{children}</div>
        </div>
      </Reveal>
    </section>
  );
}
