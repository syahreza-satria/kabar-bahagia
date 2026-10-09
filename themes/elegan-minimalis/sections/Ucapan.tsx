import { Suspense } from "react";
import { WishesBoard } from "@/components/invitation/WishesBoard";
import type { SectionProps } from "../../types";
import { Section } from "../ui";

export function Ucapan({ data }: SectionProps) {
  return (
    <Section title="Ucapan & Doa">
      <Suspense fallback={<p className="text-sm text-inv-muted">Memuat ucapan…</p>}>
        <WishesBoard slug={data.slug} />
      </Suspense>
    </Section>
  );
}
