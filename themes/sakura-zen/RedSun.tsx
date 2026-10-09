"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Lingkaran merah (hinomaru) yang membesar dan berdenyut halus di belakang nama. */
export function RedSun() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-[26%] h-60 w-60 -translate-x-1/2 rounded-full bg-inv-primary"
      initial={reduce ? false : { scale: 0, opacity: 0 }}
      animate={{ scale: [1, 1.04, 1], opacity: 0.9 }}
      transition={{ opacity: { duration: 1.6 }, scale: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
      style={{ boxShadow: "0 0 80px 10px color-mix(in srgb, var(--inv-primary) 35%, transparent)" }}
    />
  );
}
