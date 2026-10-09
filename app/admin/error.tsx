"use client";

import { useEffect } from "react";

/** Galat di panel admin biasanya soal konfigurasi (database/Supabase), jadi pesannya lebih informatif. */
export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error("[admin] error:", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="mx-auto mt-16 max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <h1 className="text-lg font-semibold text-red-900">Panel admin gagal dimuat</h1>
      <p className="mt-2 text-sm text-red-800">
        Periksa koneksi database dan konfigurasi Supabase di <code>.env.local</code>, lalu coba lagi.
      </p>
      {error.digest && <p className="mt-2 text-xs text-red-700">Kode: {error.digest}</p>}
      <button type="button" onClick={() => retry()} className="adm-btn mt-5">
        Coba lagi
      </button>
    </div>
  );
}
