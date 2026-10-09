import type { SectionProps } from "../../types";
import { Section } from "../ui";

export function Pembuka({ data }: SectionProps) {
  const { opening } = data.content;
  return (
    <Section eyebrow={opening.greeting}>
      {opening.text && <p className="whitespace-pre-line leading-relaxed text-inv-ink">{opening.text}</p>}
      {opening.quote && (
        <blockquote className="mt-8 font-display text-xl italic leading-relaxed text-inv-ink">
          &ldquo;{opening.quote}&rdquo;
          {opening.quoteSource && (
            <footer className="mt-2 text-sm not-italic text-inv-muted">&mdash; {opening.quoteSource}</footer>
          )}
        </blockquote>
      )}
    </Section>
  );
}
