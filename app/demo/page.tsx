import type { Metadata } from "next";
import Link from "next/link";
import { ThemeGallery } from "@/components/invitation/ThemeGallery";
import { themeList } from "@/themes/registry";

export const metadata: Metadata = {
  title: "Demo Tema Undangan",
  robots: { index: false, follow: false },
};

const STEPS = [
  ["1", "Pilih tema", "Filter berdasarkan suasana atau efek."],
  ["2", "Tekan Buka Undangan", "Setiap tema punya cara membuka yang berbeda."],
  ["3", "Coba semua fitur", "Scroll, RSVP (ada konfeti!), ucapan, galeri."],
] as const;

export default function DemoIndex() {
  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex min-h-11 items-center font-semibold tracking-tight">
            KabarBahagia
          </Link>
          <span className="text-xs text-neutral-500 sm:text-sm">Demo tema</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <section className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">Demo Tema Undangan</h1>
          <p className="mt-3 text-base text-neutral-600 sm:text-lg">
            {themeList.length} tema siap pakai. Buka di HP atau komputer dan rasakan sendiri. Data di halaman demo hanya
            contoh dan tidak disimpan.
          </p>
        </section>

        <ol className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-3">
          {STEPS.map(([n, title, text]) => (
            <li key={n} className="flex gap-3 rounded-xl bg-white p-3 ring-1 ring-neutral-200 sm:p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                {n}
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-neutral-600 sm:text-sm">{text}</p>
              </div>
            </li>
          ))}
        </ol>

        <section className="mt-8 sm:mt-10" aria-label="Daftar tema">
          <ThemeGallery themes={themeList} />
        </section>
      </main>
    </div>
  );
}
