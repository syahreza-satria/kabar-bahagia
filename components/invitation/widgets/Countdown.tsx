"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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

function Digits({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const text = String(value).padStart(2, "0");
  return (
    <span className="relative inline-flex h-10 overflow-hidden font-display text-3xl tabular-nums text-inv-primary">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          initial={reduce ? false : { y: "-100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? undefined : { y: "100%", opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="inline-block leading-10"
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Countdown({ targetIso, className }: { targetIso: string; className?: string }) {
  const target = new Date(targetIso).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const d = diff(target, now ?? target);
  const items = [
    ["Hari", d.hari],
    ["Jam", d.jam],
    ["Menit", d.menit],
    ["Detik", d.detik],
  ] as const;

  if (now !== null && now >= target) {
    return <p className="font-display text-2xl text-inv-primary">Hari bahagia telah tiba 🎉</p>;
  }

  return (
    <div className={className ?? "grid grid-cols-4 gap-2"} role="timer" aria-label="Hitung mundur menuju acara">
      {items.map(([label, value]) => (
        <div key={label} className="inv-card flex flex-col items-center py-4">
          <Digits value={value} />
          <span className="mt-1 text-[11px] uppercase tracking-widest text-inv-muted">{label}</span>
        </div>
      ))}
    </div>
  );
}
