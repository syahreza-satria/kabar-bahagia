"use client";

import { useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { SceneKind } from "@/components/invitation/scene/engine/types";

const Scene3D = dynamic(() => import("@/components/invitation/scene/Scene3D"), { ssr: false });

/**
 * Kanvas 3D di dalam satu section. Hanya dibuat saat section mendekati layar dan dilepas
 * saat menjauh, sehingga jumlah konteks WebGL aktif tetap kecil. Induk harus `relative`.
 */
export function SectionScene({
  kind,
  interactive = false,
  className = "",
}: {
  kind: SceneKind;
  interactive?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => setNear(e[0]?.isIntersecting ?? false), { rootMargin: "400px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (reduce) return null;
  return (
    <div ref={ref} aria-hidden className={`absolute inset-0 ${interactive ? "" : "pointer-events-none"} ${className}`}>
      {near && <Scene3D kind={kind} mode="section" interactive={interactive} />}
    </div>
  );
}
