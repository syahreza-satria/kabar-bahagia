"use client";

import { useEffect, useState } from "react";

function diff(target: number, now: number) {
  const ms = Math.max(0, target - now);
  return {
    hari: Math.floor(ms / 86_400_000),
    jam: Math.floor(ms / 3_600_000) % 24,
    menit: Math.floor(ms / 60_000) % 60,
    detik: Math.floor(ms / 1000) % 60,
  };
}

export function Countdown({ targetIso, className }: { targetIso: string; className?: string }) {
  const target = new Date(targetIso).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const d = diff(target, now ?? target);
  const items = [
    ["Hari", d.hari],
    ["Jam", d.jam],
    ["Menit", d.menit],
    ["Detik", d.detik],
  ] as const;

  return (
    <div className={className ?? "grid grid-cols-4 gap-2"} role="timer" aria-label="Hitung mundur menuju acara">
      {items.map(([label, value]) => (
        <div key={label} className="flex flex-col items-center rounded-lg border border-inv-line bg-inv-surface py-4">
          <span className="font-display text-3xl tabular-nums text-inv-primary">
            {String(value).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[11px] uppercase tracking-widest text-inv-muted">{label}</span>
        </div>
      ))}
    </div>
  );
}
