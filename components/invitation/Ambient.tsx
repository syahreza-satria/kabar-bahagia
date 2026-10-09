"use client";

export type AmbientKind = "petals" | "hearts" | "sparkles" | "bubbles";

// Pseudo-acak deterministik supaya HTML server dan client identik (tanpa hydration mismatch).
function rand(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const COUNT = 14;

/** Partikel dekoratif yang melayang pelan. Disembunyikan bila pengguna memilih reduced motion. */
export function Ambient({ kind }: { kind: AmbientKind }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-y-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 overflow-hidden motion-reduce:hidden"
    >
      {Array.from({ length: COUNT }, (_, i) => {
        const size = 8 + rand(i, 1) * 14;
        const style = {
          left: `${rand(i, 2) * 100}%`,
          width: size,
          height: size,
          animationDuration: `${12 + rand(i, 3) * 14}s`,
          animationDelay: `-${rand(i, 4) * 20}s`,
          "--sway": `${(rand(i, 5) - 0.5) * 120}px`,
          "--spin": `${(rand(i, 6) - 0.5) * 540}deg`,
        } as React.CSSProperties;
        return (
          <span key={i} className={`inv-particle inv-particle-${kind}`} style={style}>
            {kind === "hearts" ? "♥" : kind === "sparkles" ? "✦" : ""}
          </span>
        );
      })}
    </div>
  );
}
