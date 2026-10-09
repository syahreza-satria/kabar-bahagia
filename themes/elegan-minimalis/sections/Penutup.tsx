import type { SectionProps } from "../../types";
import { Section } from "../ui";

export function Penutup({ data }: SectionProps) {
  const { closing, bride, groom } = data.content;
  return (
    <Section eyebrow="Terima kasih">
      {closing.message && <p className="whitespace-pre-line leading-relaxed text-inv-ink">{closing.message}</p>}
      <p className="mt-8 text-sm text-inv-muted">Kami yang berbahagia,</p>
      <p className="mt-1 font-display text-4xl text-inv-primary">
        {groom.nickname} &amp; {bride.nickname}
      </p>
      {closing.family && <p className="mt-4 whitespace-pre-line text-sm text-inv-muted">{closing.family}</p>}
      <p className="mt-12 text-[11px] uppercase tracking-widest text-inv-muted">Dibuat dengan KabarBahagia</p>
    </Section>
  );
}
