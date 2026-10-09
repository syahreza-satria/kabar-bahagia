"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

/** Mencatat tamu membuka undangan (statistik dibuka) sekali per sesi tab. */
export function ViewBeacon({ slug }: { slug: string }) {
  const code = useSearchParams().get("to") ?? "";
  useEffect(() => {
    const key = `viewed:${slug}:${code}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    fetch("/api/view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, to: code || undefined }),
      keepalive: true,
    }).catch(() => {});
  }, [slug, code]);
  return null;
}
