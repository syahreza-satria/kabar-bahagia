import type { ReactNode } from "react";
import { OpenButton } from "@/components/invitation/InvitationShell";

/** Bagian bawah cover: nama tamu + tombol Buka Undangan (sama di semua tema). */
export function CoverFooter({
  guestSlot,
  className = "",
  tone = "default",
  buttonLabel = "Buka Undangan",
}: {
  guestSlot?: ReactNode;
  className?: string;
  /** "light" untuk cover bergambar/gelap dengan teks putih */
  tone?: "default" | "light";
  buttonLabel?: string;
}) {
  const light = tone === "light";
  return (
    <div className={className}>
      <p className={`text-xs ${light ? "text-white/80" : "text-inv-muted"}`}>Kepada Yth. Bapak/Ibu/Saudara/i</p>
      <p className={`mt-2 font-display text-2xl ${light ? "text-white" : "text-inv-ink"}`}>{guestSlot}</p>
      <p className={`mt-1 text-xs ${light ? "text-white/70" : "text-inv-muted"}`}>
        Mohon maaf apabila ada kesalahan penulisan nama dan gelar
      </p>
      <div className="mt-7">
        <OpenButton>{buttonLabel}</OpenButton>
      </div>
    </div>
  );
}
