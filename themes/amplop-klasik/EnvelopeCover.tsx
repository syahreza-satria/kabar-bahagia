"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useShellOpen } from "@/components/invitation/InvitationShell";

/**
 * Cover amplop: ketuk segel -> tutup amplop terbuka (rotateX), surat terangkat,
 * lalu undangan dibuka. Menggunakan Framer Motion.
 */
export function EnvelopeCover({
  groom,
  bride,
  dateText,
  children,
}: {
  groom: string;
  bride: string;
  dateText: string;
  children: ReactNode;
}) {
  const open = useShellOpen();
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function go() {
    if (stage) return;
    if (reduce) return open();
    setStage(1);
    timers.current.push(setTimeout(() => setStage(2), 900), setTimeout(open, 2400));
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-inv-bg px-6 py-10 text-center">
      <p className="mb-8 text-xs uppercase tracking-[0.35em] text-inv-muted">Anda diundang</p>

      <div className="relative w-full max-w-[320px]" style={{ perspective: 1100 }}>
        {/* surat */}
        <motion.div
          className="absolute inset-x-3 top-3 z-10 flex h-[210px] flex-col items-center justify-center rounded-sm bg-white px-4 text-center shadow-md"
          animate={{ y: stage === 2 ? -150 : 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-inv-muted">The Wedding of</p>
          <p className="mt-2 font-script text-4xl leading-none text-inv-primary">{groom}</p>
          <p className="font-script text-2xl text-inv-muted">&amp;</p>
          <p className="font-script text-4xl leading-none text-inv-primary">{bride}</p>
          <p className="mt-3 text-[11px] tracking-widest text-inv-muted">{dateText}</p>
        </motion.div>

        {/* badan amplop */}
        <div className="relative aspect-[4/3] w-full">
          <div className="absolute inset-0 rounded-sm bg-inv-primary" style={{ filter: "brightness(0.82)" }} />
          <div
            className="absolute inset-0 z-20 rounded-sm bg-inv-primary shadow-xl"
            style={{ clipPath: "polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%)", filter: "brightness(1.08)" }}
          />
          <div
            className="absolute inset-0 z-20 bg-inv-primary"
            style={{ clipPath: "polygon(0 100%, 50% 45%, 100% 100%)", filter: "brightness(1.18)" }}
          />
          {/* tutup amplop */}
          <motion.div
            className="absolute inset-x-0 top-0 h-[58%] origin-top bg-inv-primary"
            style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", filter: "brightness(0.95)", backfaceVisibility: "visible" }}
            animate={{ rotateX: stage >= 1 ? 180 : 0, zIndex: stage >= 1 ? 5 : 30 }}
            transition={{ duration: 0.8, ease: "easeInOut", zIndex: { delay: stage >= 1 ? 0.35 : 0 } }}
          />
          {/* segel lilin */}
          <motion.button
            type="button"
            onClick={go}
            aria-label="Buka amplop undangan"
            className="absolute left-1/2 top-[50%] z-40 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/30 bg-[#6d1424] text-2xl text-white shadow-lg"
            animate={stage ? { scale: 0, opacity: 0 } : { scale: [1, 1.08, 1] }}
            transition={stage ? { duration: 0.3 } : { duration: 1.8, repeat: Infinity }}
          >
            ♥
          </motion.button>
        </div>
      </div>

      <div className="mt-10">
        <p className="text-xs text-inv-muted">Kepada Yth. Bapak/Ibu/Saudara/i</p>
        <p className="mt-2 font-display text-2xl text-inv-ink">{children}</p>
        <p className="mt-4 text-xs uppercase tracking-widest text-inv-primary">Ketuk segel untuk membuka</p>
      </div>
    </div>
  );
}
