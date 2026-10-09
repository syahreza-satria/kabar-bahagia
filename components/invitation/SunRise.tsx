"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Matahari yang terbit pelan dengan halo berdenyut (cover Pantai Senja). */
export function SunRise() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-[38%] z-0 h-44 w-44 -translate-x-1/2 rounded-full"
      style={{ background: "radial-gradient(circle, #fff3b0 0%, #ffd166 45%, rgba(255,209,102,0) 72%)" }}
      initial={reduce ? false : { y: 160, opacity: 0, scale: 0.7 }}
      animate={{ y: 0, opacity: 1, scale: [1, 1.08, 1] }}
      transition={{ y: { duration: 2.2, ease: "easeOut" }, opacity: { duration: 1.6 }, scale: { duration: 4, repeat: Infinity, delay: 2.2 } }}
    />
  );
}
