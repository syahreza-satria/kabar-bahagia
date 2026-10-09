import { OpenButton } from "@/components/invitation/InvitationShell";
import { SplitText } from "@/components/invitation/SplitText";
import { formatDateLong } from "@/lib/utils";
import type { SectionProps } from "../types";
import { Mandala } from "./Mandala";

export function Cover({ data, guestSlot }: SectionProps) {
  const { bride, groom } = data.content;
  const main = data.events[0];
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#4a1219] px-6 py-16 text-center text-[#f6e3b4]">
      <div aria-hidden className="inv-batik absolute inset-0 opacity-60" />
      <div aria-hidden className="absolute inset-4 border-2 border-[#d4a84a]/70" />
      <div aria-hidden className="absolute inset-6 border border-[#d4a84a]/40" />

      <div className="relative flex aspect-square w-[88%] max-w-[360px] items-center justify-center">
        <Mandala className="absolute inset-0" />
        <div className="relative">
          <p className="text-[11px] uppercase tracking-[0.45em] text-[#d4a84a]">Pernikahan</p>
          <h1 className="mt-3 font-display text-5xl leading-tight">
            <SplitText text={groom.nickname} className="block" />
            <span className="block text-2xl text-[#d4a84a]">&amp;</span>
            <SplitText text={bride.nickname} className="block" delay={0.7} />
          </h1>
          {main && <p className="mt-3 text-xs uppercase tracking-[0.25em] text-[#f6e3b4]/80">{formatDateLong(main.startsAt, main.timezone)}</p>}
        </div>
      </div>

      <div className="relative mt-6">
        <p className="text-xs text-[#f6e3b4]/70">Kepada Yth. Bapak/Ibu/Saudara/i</p>
        <p className="mt-1 font-display text-2xl">{guestSlot}</p>
        <div className="mt-6">
          <OpenButton className="inv-btn !bg-[#d4a84a] !text-[#4a1219]">Buka Undangan</OpenButton>
        </div>
      </div>
    </div>
  );
}
