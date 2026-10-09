"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useShellOpen } from "@/components/invitation/InvitationShell";

const VELVET =
  "repeating-linear-gradient(90deg, #5a0b17 0px, #8e1a2b 18px, #5a0b17 36px, #3f0710 44px, #5a0b17 52px)";

/** Cover tirai panggung: tarik tirai, lampu sorot menyala, nama mempelai terungkap. */
export function CurtainCover({
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
  const [opened, setOpened] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function pull() {
    if (opened) return;
    if (reduce) return open();
    setOpened(true);
    timer.current = setTimeout(open, 3200);
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-inv-bg">
      {/* panggung + lampu sorot */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 55% at 50% 38%, rgba(217,164,65,0.35), transparent 70%)" }}
        animate={{ opacity: opened ? 1 : 0.25 }}
        transition={{ duration: 1.8 }}
      />
      <div className="relative z-0 flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <p className="text-[11px] uppercase tracking-[0.5em] text-inv-primary">The Wedding of</p>
        <h1 className="mt-4 font-script text-7xl leading-[0.95] text-inv-ink">
          {groom}
          <span className="block text-4xl text-inv-primary">&amp;</span>
          {bride}
        </h1>
        <p className="mt-5 text-xs uppercase tracking-[0.3em] text-inv-muted">{dateText}</p>
        <div className="mt-8">
          <p className="text-xs text-inv-muted">Kepada Yth. Bapak/Ibu/Saudara/i</p>
          <p className="mt-1 font-display text-2xl">{children}</p>
        </div>
      </div>

      {/* tirai kiri & kanan */}
      {(["left", "right"] as const).map((side) => (
        <motion.div
          key={side}
          aria-hidden
          className={`absolute inset-y-0 z-10 w-1/2 shadow-2xl ${side === "left" ? "left-0" : "right-0"}`}
          style={{ background: VELVET }}
          animate={{ x: opened ? (side === "left" ? "-102%" : "102%") : 0 }}
          transition={{ duration: 2, ease: [0.65, 0, 0.35, 1], delay: opened ? 0.2 : 0 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
          <div className={`absolute inset-y-0 w-6 bg-gradient-to-r ${side === "left" ? "right-0 from-transparent to-black/40" : "left-0 from-black/40 to-transparent"}`} />
        </motion.div>
      ))}

      {/* lambrequin atas */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 z-20 h-16 shadow-xl"
        style={{
          background: "linear-gradient(#3f0710, #6d1022)",
          clipPath: "polygon(0 0,100% 0,100% 70%,92% 100%,84% 70%,76% 100%,68% 70%,60% 100%,52% 70%,44% 100%,36% 70%,28% 100%,20% 70%,12% 100%,4% 70%,0 90%)",
        }}
      />
      <div aria-hidden className="absolute inset-x-0 top-14 z-20 h-px bg-inv-primary/70" />

      {/* tombol tarik tirai */}
      <motion.button
        type="button"
        onClick={pull}
        className="absolute bottom-16 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center"
        animate={opened ? { opacity: 0, y: 20, pointerEvents: "none" } : { opacity: 1 }}
        aria-label="Tarik tirai untuk membuka undangan"
      >
        <span aria-hidden className="h-10 w-px bg-inv-primary" />
        <span className="inv-btn inv-btn-solid !px-7 shadow-xl">Tarik Tirai</span>
      </motion.button>
    </div>
  );
}
