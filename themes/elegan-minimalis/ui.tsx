import type { ReactNode } from "react";
import { Reveal } from "@/components/invitation/Reveal";
import { config } from "./config";

export function Section({
  id,
  title,
  eyebrow,
  children,
}: {
  id?: string;
  title?: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="px-6 py-16 text-center">
      <Reveal>
        {eyebrow && <p className="text-xs uppercase tracking-[0.3em] text-inv-muted">{eyebrow}</p>}
        {title && <h2 className="mt-2 font-display text-4xl text-inv-primary">{title}</h2>}
        {(title || eyebrow) && <Divider />}
      </Reveal>
      <Reveal delay={0.1}>{children}</Reveal>
    </section>
  );
}

export function Divider() {
  return (
    <div className="my-5 flex items-center justify-center gap-3 text-inv-primary" aria-hidden>
      <span className="h-px w-12 bg-inv-line" />
      <span>{config.ornaments.divider}</span>
      <span className="h-px w-12 bg-inv-line" />
    </div>
  );
}
