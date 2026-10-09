"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ThemeTag } from "@/themes/types";

type ThemeItem = { id: string; name: string; description: string; previewImage: string; tags: ThemeTag[] };

const FILTERS: ("Semua" | ThemeTag)[] = ["Semua", "Terang", "Gelap", "Interaktif", "3D"];

const TAG_STYLE: Record<ThemeTag, string> = {
  Terang: "bg-amber-50 text-amber-800 ring-amber-200",
  Gelap: "bg-slate-800 text-slate-100 ring-slate-700",
  Interaktif: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  "3D": "bg-violet-50 text-violet-800 ring-violet-200",
};

/** Galeri tema responsif dengan filter. 2 kolom di HP, 3 di tablet, 4 di layar lebar. */
export function ThemeGallery({ themes }: { themes: ThemeItem[] }) {
  const [filter, setFilter] = useState<"Semua" | ThemeTag>("Semua");
  const shown = filter === "Semua" ? themes : themes.filter((t) => t.tags.includes(filter));

  return (
    <div>
      <div
        role="group"
        aria-label="Filter tema"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      >
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-100"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <p role="status" className="mt-4 text-sm text-neutral-500">
        Menampilkan {shown.length} dari {themes.length} tema
      </p>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
        {shown.map((t, i) => (
          <li
            key={t.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200 transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-within:ring-2 focus-within:ring-neutral-900"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
              <Image
                src={t.previewImage}
                alt={`Pratinjau tema ${t.name}`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                loading={i < 4 ? "eager" : "lazy"}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-3 sm:p-4">
              <h2 className="text-sm font-semibold leading-tight sm:text-base">{t.name}</h2>
              <ul className="mt-2 flex flex-wrap gap-1" aria-label="Label tema">
                {t.tags.map((tag) => (
                  <li key={tag} className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${TAG_STYLE[tag]}`}>
                    {tag}
                  </li>
                ))}
              </ul>
              <p className="mt-2 line-clamp-3 flex-1 text-xs text-neutral-600 sm:text-sm">{t.description}</p>
              <Link
                href={`/preview/${t.id}`}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-neutral-900 px-3 text-sm font-medium text-white after:absolute after:inset-0 after:content-[''] hover:bg-neutral-700 focus-visible:outline-none"
              >
                Lihat demo
                <span aria-hidden className="ml-1 transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {shown.length === 0 && <p className="mt-10 text-center text-neutral-500">Belum ada tema dengan label ini.</p>}
    </div>
  );
}
