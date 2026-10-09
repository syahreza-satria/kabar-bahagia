import { Countdown as CountdownTimer } from "@/components/invitation/Countdown";
import type { SectionProps } from "../../types";
import { Section } from "../ui";

export function CountdownSection({ data }: SectionProps) {
  const main = data.events[0];
  if (!main) return null;
  return (
    <Section title="Menuju Hari Bahagia">
      <CountdownTimer targetIso={main.startsAt} />
    </Section>
  );
}
