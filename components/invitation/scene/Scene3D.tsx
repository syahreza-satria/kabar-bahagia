"use client";

import { useEffect, useRef } from "react";
import { mountScene } from "@/components/invitation/scene/engine/runtime";
import type { SceneKind, SceneMode } from "@/components/invitation/scene/engine/types";

export type { SceneKind, SceneMode };

/**
 * Adegan Three.js (cincin, hati, galaksi, lampion, kembang api, kupu-kupu, dll.).
 * Three.js dimuat dinamis supaya tidak memperlambat render awal.
 *
 * Setiap pemasangan membuat elemen <canvas> baru: konteks WebGL yang sudah dilepas
 * (forceContextLoss) tidak bisa dipakai ulang, dan React StrictMode (mode dev) memasang
 * komponen dua kali pada elemen yang sama.
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
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = `absolute inset-0 h-full w-full ${interactive ? "cursor-grab touch-pan-y active:cursor-grabbing" : ""}`;
    canvas.style.background = "transparent";
    host.appendChild(canvas);

    let cancelled = false;
    let dispose: (() => void) | null = null;
    mountScene(canvas, kind, mode, interactive, () => cancelled)
      .then((d) => {
        if (cancelled) d?.();
        else dispose = d;
      })
      .catch((err) => console.warn("[Scene3D] gagal memuat adegan 3D:", err));

    return () => {
      cancelled = true;
      dispose?.();
      canvas.remove();
    };
  }, [kind, mode, interactive]);

  return <div ref={hostRef} aria-hidden className="absolute inset-0" />;
}
