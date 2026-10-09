import type { ReactNode } from "react";
import { OpenButton } from "@/components/invitation/InvitationShell";

/** Bagian bawah cover: nama tamu + tombol Buka Undangan (sama di semua tema). */
export function CoverFooter({ guestSlot, className = "" }: { guestSlot?: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-inv-muted">Kepada Yth. Bapak/Ibu/Saudara/i</p>
      <p className="mt-2 font-display text-2xl text-inv-ink">{guestSlot}</p>
      <p className="mt-1 text-xs text-inv-muted">Mohon maaf apabila ada kesalahan penulisan nama dan gelar</p>
      <div className="mt-7">
        <OpenButton>Buka Undangan</OpenButton>
      </div>
    </div>
  );
}
