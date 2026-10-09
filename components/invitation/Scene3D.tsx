"use client";

import { useEffect, useRef } from "react";
import { mountScene } from "./scenes/runtime";
import type { SceneKind, SceneMode } from "./scenes/types";

export type { SceneKind, SceneMode };

/**
 * Adegan Three.js (cincin, hati, galaksi, lampion, kembang api, kupu-kupu, dll.).
 * Three.js dimuat dinamis supaya tidak memperlambat render awal.
 */
export default function Scene3D({
  kind,
  mode = "cover",
  interactive = false,
}: {
  kind: SceneKind;
  mode?: SceneMode;
  /** true: kanvas menerima seretan untuk memutar objek */
  interactive?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let dispose: (() => void) | null = null;
    mountScene(canvas, kind, mode, interactive).then((d) => {
      if (cancelled) d?.();
      else dispose = d;
    });
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [kind, mode, interactive]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`absolute inset-0 h-full w-full ${interactive ? "cursor-grab touch-pan-y active:cursor-grabbing" : ""}`}
    />
  );
}
