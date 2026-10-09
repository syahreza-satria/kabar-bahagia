"use client";

import { useEffect, useState } from "react";

function rand(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const COLORS = ["var(--inv-primary)", "#f4c95d", "#e87a90", "#7bc6a4", "#8fb8ed"];

/** Ledakan konfeti singkat. Ubah `burstKey` untuk memicu ulang. */
export function Confetti({ burstKey }: { burstKey: number }) {
  const [visibleKey, setVisibleKey] = useState(0);

  useEffect(() => {
    if (!burstKey) return;
    const show = setTimeout(() => setVisibleKey(burstKey), 0);
    const hide = setTimeout(() => setVisibleKey(0), 3000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [burstKey]);

  if (!visibleKey) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70] overflow-hidden motion-reduce:hidden">
      {Array.from({ length: 46 }, (_, i) => {
        const angle = rand(i, 1) * Math.PI * 2;
        const dist = 120 + rand(i, 2) * 260;
        const style = {
          "--dx": `${Math.cos(angle) * dist}px`,
          "--dy": `${Math.sin(angle) * dist - 140}px`,
          "--rot": `${rand(i, 3) * 720}deg`,
          background: COLORS[i % COLORS.length],
          width: 6 + rand(i, 4) * 6,
          height: 10 + rand(i, 5) * 8,
          animationDelay: `${rand(i, 6) * 0.15}s`,
        } as React.CSSProperties;
        return <span key={`${visibleKey}-${i}`} className="inv-confetti" style={style} />;
      })}
    </div>
  );
}
