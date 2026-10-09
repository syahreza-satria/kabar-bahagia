"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

export type RevealVariant = "up" | "left" | "right" | "zoom" | "fade" | "blur" | "rotate" | "flip" | "drop";

const HIDDEN: Record<RevealVariant, Record<string, number | string>> = {
  up: { opacity: 0, y: 28 },
  left: { opacity: 0, x: -40 },
  right: { opacity: 0, x: 40 },
  zoom: { opacity: 0, scale: 0.9 },
  fade: { opacity: 0 },
  blur: { opacity: 0, filter: "blur(10px)", y: 12 },
  rotate: { opacity: 0, rotate: -7, y: 30, scale: 0.94 },
  flip: { opacity: 0, rotateX: 70, y: 20 },
  drop: { opacity: 0, y: -44 },
};
const SHOWN: Record<RevealVariant, Record<string, number | string>> = {
  up: { opacity: 1, y: 0 },
  left: { opacity: 1, x: 0 },
  right: { opacity: 1, x: 0 },
  zoom: { opacity: 1, scale: 1 },
  fade: { opacity: 1 },
  blur: { opacity: 1, filter: "blur(0px)", y: 0 },
  rotate: { opacity: 1, rotate: 0, y: 0, scale: 1 },
  flip: { opacity: 1, rotateX: 0, y: 0 },
  drop: { opacity: 1, y: 0 },
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
      style={variant === "flip" ? { transformPerspective: 700 } : undefined}
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
