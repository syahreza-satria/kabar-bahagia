"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef, type ReactNode } from "react";

/** Latar foto yang bergeser lebih lambat dari konten saat di-scroll. */
export function ParallaxBand({ src, children, className }: { src: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.div className="absolute inset-x-0 -inset-y-[15%]" style={reduce ? undefined : { y }}>
        <Image src={src} alt="" fill sizes="480px" className="object-cover" loading="lazy" />
      </motion.div>
      <div className="absolute inset-0 bg-inv-bg/80" />
      <div className="relative">{children}</div>
    </div>
  );
}
