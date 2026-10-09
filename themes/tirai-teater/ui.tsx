import { Reveal } from "@/components/invitation/Reveal";
import type { SectionWrapperProps } from "../kit";

/** Bingkai art-deco dengan sudut emas dan judul bergaris ganda. */
export function Section({ title, eyebrow, children }: SectionWrapperProps) {
  return (
    <section className="relative px-5 py-12 text-center">
      <div className="relative border border-inv-primary/40 px-5 py-12">
        {["left-0 top-0 border-l-2 border-t-2", "right-0 top-0 border-r-2 border-t-2", "bottom-0 left-0 border-b-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"].map((c) => (
          <span key={c} aria-hidden className={`absolute h-5 w-5 border-inv-primary ${c}`} />
        ))}
        <Reveal variant="drop">
          {eyebrow && <p className="text-[11px] uppercase tracking-[0.4em] text-inv-primary">{eyebrow}</p>}
          {title && <h2 className="mt-2 font-display text-3xl font-semibold text-inv-ink">{title}</h2>}
          {(title || eyebrow) && (
            <div aria-hidden className="my-5 flex items-center justify-center gap-3 text-inv-primary">
              <span data-fx="line" className="h-px w-14 origin-right bg-inv-primary" />
              <span>❖</span>
              <span data-fx="line" className="h-px w-14 origin-left bg-inv-primary" />
            </div>
          )}
        </Reveal>
        <Reveal delay={0.1} variant="flip">
          {children}
        </Reveal>
      </div>
    </section>
  );
}
