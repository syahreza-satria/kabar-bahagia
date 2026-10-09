import "server-only";

/**
 * Akses environment variable di server dengan pesan kesalahan yang jelas.
 * (Variabel NEXT_PUBLIC_* yang dipakai di client tetap dibaca langsung lewat process.env.)
 */
export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Variabel environment "${name}" belum diatur. Salin .env.example ke .env.local lalu isi nilainya.`);
  }
  return value;
}

/** Koneksi Postgres. Menolak nilai contoh dari .env.example. */
export function databaseUrl() {
  const url = requireEnv("DATABASE_URL");
  if (/@host[:/]/.test(url)) {
    throw new Error(
      'DATABASE_URL masih berisi contoh ("host"). Isi dengan connection string dari Supabase (Connect → Transaction pooler).',
    );
  }
  return url;
}

/** URL proyek Supabase tanpa path (mis. https://xxxx.supabase.co). */
export function supabaseUrl() {
  const raw = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL bukan URL yang valid.");
  }
  if (url.pathname !== "/" && url.pathname !== "") {
    throw new Error(`NEXT_PUBLIC_SUPABASE_URL tidak boleh memuat path ("${url.pathname}"). Gunakan ${url.origin}`);
  }
  return url.origin;
}

export const mediaBucket = () => process.env.SUPABASE_MEDIA_BUCKET?.trim() || "media";
