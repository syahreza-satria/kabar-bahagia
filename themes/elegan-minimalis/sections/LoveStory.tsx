import type { SectionProps } from "../../types";
import { Section } from "../ui";

export function LoveStory({ data }: SectionProps) {
  return (
    <Section title="Kisah Kami">
      <ol className="relative ml-3 space-y-8 border-l border-inv-line text-left">
        {data.content.loveStory.map((s, i) => (
          <li key={i} className="pl-6">
            <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-inv-primary" aria-hidden />
            {s.date && <p className="text-xs uppercase tracking-widest text-inv-muted">{s.date}</p>}
            <h3 className="font-display text-2xl text-inv-primary">{s.title}</h3>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-inv-ink">{s.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
