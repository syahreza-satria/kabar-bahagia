# KabarBahagia

Layanan undangan pernikahan digital (Fase 1 · MVP). Acuan produk ada di [CONTEXT.md](CONTEXT.md).

## Menjalankan

1. `npm install`
2. Salin `.env.example` ke `.env.local` dan isi nilainya.
3. Di Supabase: buat bucket Storage **publik** bernama `media` (atau sesuai `SUPABASE_MEDIA_BUCKET`).
4. Terapkan skema database: `npx drizzle-kit migrate` (migrasi ada di `db/migrations`).
5. Buat akun admin: tambahkan pengguna di Supabase Auth (email + sandi), lalu daftarkan emailnya di tabel `admins`:
   `insert into admins (email, nama, role) values ('email@anda.com', 'Nama Anda', 'superadmin');`
6. `npm run dev`, buka `/login`.

## Struktur singkat

- `app/[slug]` undangan publik (cache + tag per slug), `app/r/[token]` rekap klien, `app/admin` panel admin.
- `themes/` tema (satu folder per tema, registri di `themes/registry.ts`); `components/invitation/` komponen interaktif bersama.
- `app/api/cron/expire` arsip otomatis (cron Vercel di `vercel.json`, wajib `CRON_SECRET`).

## Catatan

- Rate limit publik berada di memori per instance; ganti dengan penyimpanan terpusat bila trafik besar.
- Turnstile aktif hanya bila `NEXT_PUBLIC_TURNSTILE_SITE_KEY` dan `TURNSTILE_SECRET_KEY` diisi.
- Backup harian database diatur di Supabase (bukan di kode ini).
