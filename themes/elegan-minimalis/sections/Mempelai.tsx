import Image from "next/image";
import type { InvitationContent } from "@/types/invitation";
import type { SectionProps } from "../../types";
import { Section } from "../ui";

function Person({ p, label }: { p: InvitationContent["bride"]; label: string }) {
  const handle = p.instagram.replace(/^@/, "");
  return (
    <div className="flex flex-col items-center">
      {p.photoUrl && (
        <div className="relative h-56 w-44 overflow-hidden rounded-t-full border border-inv-primary p-1">
          <div className="relative h-full w-full overflow-hidden rounded-t-full">
            <Image src={p.photoUrl} alt={p.fullName} fill sizes="176px" className="object-cover" loading="lazy" />
          </div>
        </div>
      )}
      <p className="mt-5 text-xs uppercase tracking-[0.3em] text-inv-muted">{label}</p>
      <h3 className="mt-1 font-display text-3xl text-inv-ink">{p.fullName}</h3>
      {p.parents && <p className="mt-2 max-w-[18rem] whitespace-pre-line text-sm text-inv-muted">{p.parents}</p>}
      {handle && (
        <a
          href={`https://instagram.com/${handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-11 items-center text-sm text-inv-primary underline underline-offset-4"
        >
          @{handle}
        </a>
      )}
    </div>
  );
}

export function Mempelai({ data }: SectionProps) {
  const { bride, groom } = data.content;
  return (
    <Section title="Mempelai" eyebrow="Dengan memohon rahmat Allah">
      <div className="space-y-10">
        <Person p={groom} label="Mempelai Pria" />
        <p className="font-display text-4xl italic text-inv-primary">&amp;</p>
        <Person p={bride} label="Mempelai Wanita" />
      </div>
    </Section>
  );
}
