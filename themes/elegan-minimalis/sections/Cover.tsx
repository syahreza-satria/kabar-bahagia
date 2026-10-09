import Image from "next/image";
import { OpenButton } from "@/components/invitation/InvitationShell";
import { formatDateLong } from "@/lib/utils";
import type { SectionProps } from "../../types";

export function Cover({ data, guestSlot }: SectionProps) {
  const { bride, groom, coverImageUrl } = data.content;
  const main = data.events[0];
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-12 text-center">
      {coverImageUrl && (
        <>
          <Image src={coverImageUrl} alt="" fill priority sizes="480px" className="object-cover" />
          <div className="absolute inset-0 bg-inv-bg/80" />
        </>
      )}
      <div className="relative z-10">
        <p className="text-xs uppercase tracking-[0.4em] text-inv-muted">The Wedding of</p>
        <h1 className="mt-5 font-display text-6xl leading-tight text-inv-ink">
          {groom.nickname}
          <span className="block text-3xl italic text-inv-primary">&amp;</span>
          {bride.nickname}
        </h1>
        {main && (
          <p className="mt-6 text-sm tracking-widest text-inv-muted">{formatDateLong(main.startsAt, main.timezone)}</p>
        )}

        <div className="mt-12">
          <p className="text-xs text-inv-muted">Kepada Yth. Bapak/Ibu/Saudara/i</p>
          <p className="mt-2 font-display text-2xl text-inv-ink">{guestSlot}</p>
          <p className="mt-1 text-xs text-inv-muted">Mohon maaf apabila ada kesalahan penulisan nama dan gelar</p>
        </div>

        <div className="mt-8">
          <OpenButton>Buka Undangan</OpenButton>
        </div>
      </div>
    </div>
  );
}
