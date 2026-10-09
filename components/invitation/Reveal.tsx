"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

export type RevealVariant = "up" | "left" | "right" | "zoom" | "fade" | "blur";

const HIDDEN: Record<RevealVariant, Record<string, number | string>> = {
  up: { opacity: 0, y: 28 },
  left: { opacity: 0, x: -40 },
  right: { opacity: 0, x: 40 },
  zoom: { opacity: 0, scale: 0.9 },
  fade: { opacity: 0 },
  blur: { opacity: 0, filter: "blur(10px)", y: 12 },
};
const SHOWN: Record<RevealVariant, Record<string, number | string>> = {
  up: { opacity: 1, y: 0 },
  left: { opacity: 1, x: 0 },
  right: { opacity: 1, x: 0 },
  zoom: { opacity: 1, scale: 1 },
  fade: { opacity: 1 },
  blur: { opacity: 1, filter: "blur(0px)", y: 0 },
};

/** Muncul saat masuk layar. Mengikuti prefers-reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  className,
  variant = "up",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: RevealVariant;
}) {
  const reduce = useReducedMotion();
  const variants: Variants = { hidden: HIDDEN[variant], shown: SHOWN[variant] };
  return (
    <motion.div
      className={className}
      variants={variants}
      initial={reduce ? "shown" : "hidden"}
      whileInView="shown"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/** Anak-anaknya muncul berurutan. */
export function Stagger({ children, className, step = 0.12 }: { children: ReactNode[]; className?: string; step?: number }) {
  return (
    <div className={className}>
      {children.map((c, i) => (
        <Reveal key={i} delay={i * step}>
          {c}
        </Reveal>
      ))}
    </div>
  );
}
