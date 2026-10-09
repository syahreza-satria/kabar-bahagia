"use client";

import Image from "next/image";
import { useState } from "react";
import type { GiftData } from "@/types/invitation";

const TYPE_LABEL: Record<GiftData["type"], string> = {
  bank: "Transfer Bank",
  ewallet: "E-Wallet",
  qris: "QRIS",
  alamat: "Kirim Kado",
};

function CopyButton({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="inv-btn inv-btn-outline !min-h-11 !px-4 !text-xs"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          window.prompt("Salin teks berikut:", value);
        }
      }}
    >
      {done ? "Tersalin ✓" : label}
    </button>
  );
}

export function GiftCards({ gifts }: { gifts: GiftData[] }) {
  return (
    <div className="space-y-4">
      {gifts.map((g) => (
        <div key={g.id} className="rounded-lg border border-inv-line bg-inv-surface p-5 text-center">
          <p className="text-xs uppercase tracking-widest text-inv-muted">
            {TYPE_LABEL[g.type]}
            {g.bankName ? ` · ${g.bankName}` : ""}
          </p>
          {g.type === "qris" && g.qrUrl && (
            <div className="relative mx-auto mt-3 aspect-square w-48">
              <Image src={g.qrUrl} alt="Kode QRIS" fill sizes="192px" className="object-contain" />
            </div>
          )}
          {g.number && (
            <p className={`mt-3 ${g.type === "alamat" ? "whitespace-pre-line text-sm" : "font-display text-2xl tracking-wider"} text-inv-ink`}>
              {g.number}
            </p>
          )}
          {g.accountName && <p className="mt-1 text-sm text-inv-muted">a.n. {g.accountName}</p>}
          {g.number && g.type !== "qris" && (
            <div className="mt-4">
              <CopyButton value={g.number} label={g.type === "alamat" ? "Salin alamat" : "Salin nomor"} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
