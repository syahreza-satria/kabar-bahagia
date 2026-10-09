import { Reveal } from "@/components/invitation/Reveal";
import type { SectionWrapperProps } from "../kit";

const CORNER = ["left-3 top-3 border-l-2 border-t-2", "right-3 top-3 border-r-2 border-t-2", "bottom-3 left-3 border-b-2 border-l-2", "bottom-3 right-3 border-b-2 border-r-2"];

/** Panel gelap dengan sudut neon dan judul berpendar. */
export function Section({ title, eyebrow, children }: SectionWrapperProps) {
  return (
    <section className="relative px-4 py-8">
      <div className="relative overflow-hidden rounded-lg border border-inv-line bg-inv-surface/80 px-5 py-12 text-center">
        <span data-fx="parallax" aria-hidden className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-inv-primary opacity-20 blur-3xl" />
        <span data-fx="parallax" aria-hidden className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-[#00e5ff] opacity-15 blur-3xl" />
        {CORNER.map((c) => (
          <span key={c} aria-hidden className={`absolute h-4 w-4 border-inv-primary ${c}`} />
        ))}
        <div className="relative">
          <Reveal variant="blur">
            {eyebrow && <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#00e5ff]">{eyebrow}</p>}
            {title && (
              <h2 className="mt-3 font-display text-2xl font-extrabold uppercase tracking-[0.12em] text-inv-ink [text-shadow:0_0_14px_var(--inv-primary)]">
                {title}
              </h2>
            )}
            {(title || eyebrow) && <span data-fx="line" aria-hidden className="mx-auto mb-7 mt-4 block h-px w-24 origin-center bg-inv-primary shadow-[0_0_10px_var(--inv-primary)]" />}
          </Reveal>
          <Reveal delay={0.1} variant="flip">
            {children}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
