"use client";

import { useState } from "react";

export function CopyButton({ value, label = "Salin" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="adm-btn-ghost"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          window.prompt("Salin teks berikut:", value);
        }
      }}
    >
      {done ? "Tersalin ✓" : label}
    </button>
  );
}
