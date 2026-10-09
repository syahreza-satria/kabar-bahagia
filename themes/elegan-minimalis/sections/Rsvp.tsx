import { Suspense } from "react";
import { RsvpForm } from "@/components/invitation/RsvpForm";
import type { SectionProps } from "../../types";
import { Section } from "../ui";

export function Rsvp({ data }: SectionProps) {
  return (
    <Section id="rsvp" title="RSVP" eyebrow="Konfirmasi Kehadiran">
      <Suspense fallback={<p className="text-sm text-inv-muted">Memuat formulir…</p>}>
        <RsvpForm slug={data.slug} />
      </Suspense>
    </Section>
  );
}
