import Link from "next/link";

/** Bilah kecil di halaman demo untuk berpindah antar tema. */
export function DemoSwitcher({ themes, activeId }: { themes: { id: string; name: string }[]; activeId: string }) {
  return (
    <nav
      aria-label="Pilih tema demo"
      className="fixed left-1/2 top-2 z-[80] flex max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full bg-black/75 p-1 text-xs text-white shadow-lg backdrop-blur [scrollbar-width:none]"
    >
      <Link href="/demo" className="shrink-0 rounded-full px-3 py-2 text-white/70 hover:text-white">
        ← Semua tema
      </Link>
      {themes.map((t) => (
        <Link
          key={t.id}
          href={`/preview/${t.id}`}
          replace
          aria-current={t.id === activeId ? "page" : undefined}
          className={`shrink-0 rounded-full px-3 py-2 ${t.id === activeId ? "bg-white text-black" : "text-white/80 hover:text-white"}`}
        >
          {t.name}
        </Link>
      ))}
    </nav>
  );
}
