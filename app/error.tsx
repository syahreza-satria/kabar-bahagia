"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    // digest cocok dengan log server; pesan asli sengaja tidak ditampilkan ke pengguna
    console.error("[app] error:", error.digest ?? error.message);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold">Terjadi kesalahan</h1>
      <p className="mt-2 max-w-sm text-neutral-600">Maaf, halaman ini gagal dimuat. Silakan coba lagi sebentar lagi.</p>
      {error.digest && <p className="mt-2 text-xs text-neutral-400">Kode: {error.digest}</p>}
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 inline-flex min-h-11 items-center rounded-md bg-neutral-900 px-5 text-sm font-medium text-white hover:bg-neutral-700"
      >
        Coba lagi
      </button>
    </main>
  );
}
