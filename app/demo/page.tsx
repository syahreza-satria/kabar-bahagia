import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { themeList } from "@/themes/registry";

export const metadata: Metadata = {
  title: "Demo Tema",
  robots: { index: false, follow: false },
};

export default function DemoIndex() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Demo Tema Undangan</h1>
      <p className="mt-2 max-w-xl text-neutral-600">
        Buka tema di HP atau desktop. Tekan <strong>Buka Undangan</strong>, lalu coba scroll, isi RSVP (konfeti!), tulis
        ucapan, dan buka galeri. Data di halaman ini hanya contoh dan tidak disimpan.
      </p>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {themeList.map((t, i) => (
          <li key={t.id} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="relative aspect-[3/4] bg-neutral-100">
              <Image
                src={t.previewImage}
                alt={`Pratinjau tema ${t.name}`}
                fill
                sizes="(max-width: 640px) 100vw, 25vw"
                loading={i < 4 ? "eager" : "lazy"}
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h2 className="font-semibold">{t.name}</h2>
              <p className="mt-1 text-sm text-neutral-600">{t.description}</p>
              <Link
                href={`/preview/${t.id}`}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-700"
              >
                Lihat demo
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
