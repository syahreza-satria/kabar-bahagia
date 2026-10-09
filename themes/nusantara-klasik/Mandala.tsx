"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Mandala emas yang berputar perlahan (dua lapis, arah berlawanan). */
export function Mandala({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const petals = Array.from({ length: 16 }, (_, i) => i * 22.5);
  const ring = (rotate: number, r: number, len: number, w: number) =>
    petals.map((a) => (
      <ellipse key={`${r}-${a}`} cx="200" cy={200 - r} rx={w} ry={len} fill="none" stroke="currentColor" strokeWidth="1.2" transform={`rotate(${a + rotate} 200 200)`} />
    ));
  return (
    <div aria-hidden className={`pointer-events-none text-[#d4a84a] ${className}`}>
      <motion.svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full opacity-60" animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 90, ease: "linear", repeat: Infinity }}>
        {ring(0, 120, 60, 18)}
        <circle cx="200" cy="200" r="190" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" />
      </motion.svg>
      <motion.svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full opacity-70" animate={reduce ? undefined : { rotate: -360 }} transition={{ duration: 60, ease: "linear", repeat: Infinity }}>
        {ring(11.25, 70, 38, 12)}
        <circle cx="200" cy="200" r="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="1" />
      </motion.svg>
    </div>
  );
}
