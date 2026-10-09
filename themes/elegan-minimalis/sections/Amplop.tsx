import { GiftCards } from "@/components/invitation/GiftCards";
import type { SectionProps } from "../../types";
import { Section } from "../ui";

export function Amplop({ data }: SectionProps) {
  return (
    <Section title="Amplop Digital" eyebrow="Tanda kasih">
      <p className="mb-6 text-sm text-inv-muted">
        Doa restu Anda adalah hadiah terbaik bagi kami. Namun bila berkenan memberi tanda kasih, dapat melalui:
      </p>
      <GiftCards gifts={data.gifts} />
    </Section>
  );
}
