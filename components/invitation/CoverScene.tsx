"use client";

import { useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import type { SceneKind } from "./Scene3D";

const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

/** Lapisan 3D di belakang konten cover. Tidak dirender bila pengguna memilih reduced motion. */
export function CoverScene({ kind }: { kind: SceneKind }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <Scene3D kind={kind} />
    </div>
  );
}
