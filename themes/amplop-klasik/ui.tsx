import { Reveal } from "@/components/invitation/Reveal";
import type { SectionWrapperProps } from "../kit";

/** Setiap section tampil seperti lembar surat di atas kertas. */
export function Section({ title, eyebrow, children }: SectionWrapperProps) {
  return (
    <section className="relative px-5 py-10">
      <Reveal variant="up">
        <div className="relative rounded-sm border border-inv-line bg-inv-surface px-5 py-10 text-center shadow-[0_8px_30px_-12px_rgba(60,30,30,0.25)]">
          <span aria-hidden className="absolute inset-1.5 rounded-sm border border-dashed border-inv-primary/30" />
          <div className="relative">
            {eyebrow && <p className="text-[11px] uppercase tracking-[0.3em] text-inv-muted">{eyebrow}</p>}
            {title && <h2 className="mt-2 font-script text-5xl text-inv-primary">{title}</h2>}
            {(title || eyebrow) && (
              <div aria-hidden className="my-4 flex items-center justify-center gap-2 text-inv-primary">
                <span data-fx="line" className="h-px w-10 origin-right bg-inv-primary/40" />
                <span className="text-sm">✉</span>
                <span data-fx="line" className="h-px w-10 origin-left bg-inv-primary/40" />
              </div>
            )}
            {children}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
