"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/** Kontrol ringkas halaman demo: ‹ nama tema ▾ ›, dengan daftar semua tema di menu. */
export function DemoSwitcher({ themes, activeId }: { themes: { id: string; name: string }[]; activeId: string }) {
  const [menu, setMenu] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const index = Math.max(
    0,
    themes.findIndex((t) => t.id === activeId),
  );
  const prev = themes[(index - 1 + themes.length) % themes.length];
  const next = themes[(index + 1) % themes.length];

  useEffect(() => {
    if (!menu) return;
    const close = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setMenu(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [menu]);

  const arrow =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-white/80 hover:bg-white/15 hover:text-white";

  return (
    <div ref={root} className="fixed left-1/2 top-2 z-[80] -translate-x-1/2 text-white">
      <nav
        aria-label="Pilih tema demo"
        className="flex items-center gap-1 rounded-full bg-black/75 p-1 shadow-lg backdrop-blur"
      >
        <Link href={`/preview/${prev.id}`} replace aria-label={`Tema sebelumnya: ${prev.name}`} className={arrow}>
          ‹
        </Link>
        <button
          type="button"
          onClick={() => setMenu((m) => !m)}
          aria-expanded={menu}
          aria-haspopup="listbox"
          className="flex h-9 min-w-[10.5rem] items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium hover:bg-white/10"
        >
          <span className="truncate">{themes[index].name}</span>
          <span aria-hidden className={`text-[10px] transition-transform ${menu ? "rotate-180" : ""}`}>
            ▼
          </span>
        </button>
        <Link href={`/preview/${next.id}`} replace aria-label={`Tema berikutnya: ${next.name}`} className={arrow}>
          ›
        </Link>
      </nav>

      {menu && (
        <div
          role="listbox"
          aria-label="Daftar tema"
          className="mt-2 max-h-[70dvh] w-64 overflow-y-auto rounded-2xl bg-black/90 p-1.5 text-sm shadow-2xl backdrop-blur"
        >
          <Link href="/demo" className="block rounded-xl px-3 py-2.5 text-white/70 hover:bg-white/10 hover:text-white">
            ← Semua tema
          </Link>
          <div className="my-1 h-px bg-white/15" />
          {themes.map((t, i) => (
            <Link
              key={t.id}
              href={`/preview/${t.id}`}
              replace
              role="option"
              aria-selected={t.id === activeId}
              onClick={() => setMenu(false)}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${t.id === activeId ? "bg-white text-black" : "text-white/85 hover:bg-white/10"}`}
            >
              <span>{t.name}</span>
              <span className="text-xs opacity-60">
                {i + 1}/{themes.length}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
