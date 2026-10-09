# KabarBahagia 💌

Aplikasi **layanan undangan pernikahan digital**. Admin mengisi data undangan lewat panel admin, pasangan pengantin
menerima link undangan dan link rekap rahasia, lalu tamu membuka undangan di HP lewat link personal dari WhatsApp.

> Dokumen ini untuk **memasang dan menjalankan** aplikasi. Keputusan produk, aturan bisnis, dan arsitektur ada di
> [CONTEXT.md](CONTEXT.md).

## Isi aplikasi

| Siapa           | Apa yang didapat                                                                                                                          |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Admin**       | Panel untuk membuat undangan, mengunggah foto, mengelola tamu, mengirim link WhatsApp, melihat RSVP, memoderasi ucapan, melihat statistik |
| **Klien**       | Link rahasia `/r/…` berisi rekap RSVP & ucapan, plus tombol kirim undangan ke tamu lewat WhatsApp (tanpa login)                           |
| **Tamu**        | Undangan interaktif dengan nama personal, musik, countdown, galeri, RSVP, ucapan, dan amplop digital                                      |
| **Calon klien** | Halaman demo `/demo` untuk mencoba 11 tema langsung di HP atau komputer                                                                   |

**11 tema**, masing-masing dengan cover, tata letak, dan animasi berbeda: Elegan Minimalis, Rustic Floral, Midnight Gold,
Pastel Romantis, Amplop Klasik, Tirai Teater, Pantai Senja, Nusantara Klasik, Neon Night, Polaroid Memories, Sakura Zen.

## Teknologi

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Framer Motion · GSAP · Three.js · PostgreSQL + Drizzle ORM ·
Supabase (Auth + Storage) · Cloudflare Turnstile (opsional) · Vitest · Deploy di Vercel.

## Mulai dalam 10 menit

Butuh: **Node.js 22** (lihat `.nvmrc`) dan akun gratis **[Supabase](https://supabase.com)**.

### 1. Pasang dependensi

```bash
npm install
```

### 2. Siapkan Supabase

1. Buat proyek baru di Supabase. Catat **kata sandi database** yang Anda buat (ini bukan kata sandi login admin).
2. Buka **Storage → New bucket**, beri nama `media`, aktifkan **Public bucket**.
3. Buka **Authentication → Users → Add user → Create new user**. Isi email + kata sandi untuk login admin dan
   centang **Auto Confirm User**.

### 3. Isi konfigurasi

Salin `.env.example` menjadi `.env.local`, lalu isi (penjelasan tiap variabel ada di
[Konfigurasi](#konfigurasi)):

```powershell
# Windows PowerShell
Copy-Item .env.example .env.local
```

```bash
# macOS / Linux / Git Bash
cp .env.example .env.local
```

### 4. Buat tabel database

```bash
npm run db:migrate
```

### 5. Daftarkan akun admin

Login Supabase saja belum cukup. Email Anda juga harus ada di tabel `admins`. Buka **SQL Editor** di Supabase lalu
jalankan (pakai email yang **sama persis** dengan langkah 2.3):

```sql
insert into admins (email, nama, role)
values ('email@anda.com', 'Nama Anda', 'superadmin');
```

> Jika Supabase menanyakan soal _Row Level Security_ saat membuat tabel, pilih **enable RLS**. Aplikasi ini mengakses
> database lewat koneksi langsung sehingga tidak terpengaruh.

### 6. Jalankan

```bash
npm run dev
```

Buka <http://localhost:3000>:

- `/demo` — lihat semua tema
- `/login` — masuk ke panel admin

## Konfigurasi

Semua variabel ada di `.env.local` (contoh lengkap di [.env.example](.env.example)).

| Variabel                         | Wajib       | Keterangan                                                                                             |
| -------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`                   | ✅          | Supabase → **Connect → Transaction pooler** (port 6543). Isi `[KATA-SANDI]` dengan kata sandi database |
| `NEXT_PUBLIC_SUPABASE_URL`       | ✅          | URL proyek, contoh `https://abc.supabase.co`. **Tanpa** `/rest/v1/` di belakangnya                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | ✅          | Project Settings → API → kunci `anon`                                                                  |
| `SUPABASE_SERVICE_ROLE_KEY`      | ✅          | Project Settings → API → kunci `service_role`. **Rahasia**, hanya dipakai server                       |
| `SUPABASE_MEDIA_BUCKET`          | –           | Nama bucket Storage. Bawaan `media`                                                                    |
| `NEXT_PUBLIC_APP_URL`            | ✅ produksi | Alamat publik aplikasi, dipakai di link undangan & preview WhatsApp                                    |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | –           | Kunci situs Cloudflare Turnstile. Kosongkan untuk menonaktifkan anti-spam                              |
| `TURNSTILE_SECRET_KEY`           | –           | Pasangan rahasia dari kunci di atas                                                                    |
| `CRON_SECRET`                    | ✅ produksi | Teks acak panjang untuk mengamankan cron kedaluwarsa                                                   |

Jika ada variabel wajib yang salah atau kosong, aplikasi menampilkan pesan yang menyebut nama variabelnya.

## Cara memakai

1. **Admin** buka `/admin` → **Undangan baru** → isi data mempelai, acara, tema → **Simpan sebagai draft**.
2. Setelah tersimpan, unggah foto (cover, mempelai, galeri), musik, dan isi amplop digital. Draft bisa dipratinjau
   lewat tombol **Pratinjau** (hanya terbuka saat Anda login).
3. Tab **Tamu & WhatsApp**: tambah tamu satu per satu atau tempel dari Excel. Tiap tamu mendapat link personal
   `…/slug?to=kode`.
4. Tekan **Publikasikan**. Berikan **link rekap rahasia** (di tab Ringkasan) kepada pasangan pengantin.
5. **Klien** membuka link rekap, menekan **Kirim WhatsApp** pada tiap tamu, dan memantau RSVP.
6. **Tamu** membuka link, menekan **Buka Undangan**, mengisi RSVP dan ucapan.
7. **2 minggu setelah acara terakhir**, undangan otomatis diarsipkan dan foto dihapus dari Storage.

## Deploy ke Vercel

1. Push repo ini ke GitHub, lalu **Import** di [vercel.com](https://vercel.com/new).
2. Isi semua variabel di **Settings → Environment Variables** (isi `NEXT_PUBLIC_APP_URL` dengan alamat
   `https://…vercel.app` proyek Anda, dan `CRON_SECRET` dengan teks acak panjang).
3. Deploy. Cron harian di [vercel.json](vercel.json) otomatis mengarsipkan undangan yang kedaluwarsa.
4. Jalankan `npm run db:migrate` sekali dari komputer Anda (dengan `DATABASE_URL` yang sama) bila skema berubah.

## Perintah yang berguna

| Perintah                      | Fungsi                                                          |
| ----------------------------- | --------------------------------------------------------------- |
| `npm run dev`                 | Jalankan mode pengembangan                                      |
| `npm run build` / `npm start` | Build produksi / jalankan hasil build                           |
| `npm run check`               | Lint + typecheck + tes (jalankan sebelum commit)                |
| `npm test`                    | Tes unit (Vitest)                                               |
| `npm run format`              | Rapikan kode dengan Prettier                                    |
| `npm run db:generate`         | Buat migrasi baru setelah mengubah [db/schema.ts](db/schema.ts) |
| `npm run db:migrate`          | Terapkan migrasi ke database                                    |
| `npm run db:studio`           | Buka penjelajah database                                        |

## Struktur folder

```
app/                      Rute Next.js
  [slug]/                 Undangan publik (cache per slug + gambar OG)
  r/[token]/              Rekap klien (tanpa login)
  admin/                  Panel admin (dilindungi proxy.ts + cek sesi)
    _actions/             Server Actions admin, dipisah per fitur
  api/                    rsvp, wishes, view (publik) · admin/upload, rsvp-csv · cron/expire
  demo/ · preview/        Halaman demo tema (data contoh, tanpa database)
components/
  invitation/             Bagian undangan: shell, view
    effects/              Animasi (reveal, partikel, tilt, GSAP, konfeti)
    scene/                Adegan Three.js (+ engine/: renderer & pembuat adegan)
    widgets/              RSVP, ucapan, galeri, countdown, amplop digital
  admin/                  Komponen panel admin
  shared/                 Dipakai admin & rekap klien (daftar link tamu, tabel RSVP)
themes/
  kit/                    Section yang dipakai semua tema + factory createSections()
  <nama-tema>/            config.ts · fonts.ts · Cover.tsx · ui.tsx · index.ts
  registry.ts             Daftar semua tema
lib/                      Logika server & helper (env, auth, dates, ids, storage, …)
db/                       Skema Drizzle + migrasi SQL
types/                    Tipe & skema data undangan
tests/                    Tes unit
```

## Menambah tema baru

1. Salin folder tema yang mirip, mis. `themes/elegan-minimalis` → `themes/nama-baru`.
2. Ubah `config.ts` (warna, font, radius, efek penutup cover, partikel) dan `fonts.ts`.
3. Ubah `Cover.tsx` (tampilan pertama) dan `ui.tsx` (pembungkus tiap section: judul, ornamen, animasi).
4. Di `index.ts`, panggil `createSections({ Section, Cover, photoShape, motion, gallery, scenes })`. Semua section lain
   (acara, galeri, RSVP, dll.) otomatis tersedia dari `themes/kit`. Section tertentu bisa diganti lewat argumen kedua.
5. Daftarkan di [themes/registry.ts](themes/registry.ts) dan tambahkan gambar kecil `public/themes/<id>.svg`.
6. Buka `/demo` untuk melihat hasilnya.

Tema hanya mengatur **tampilan**; data undangan tidak pernah disimpan di dalam tema.

## Masalah umum

| Gejala                                                  | Penyebab & solusi                                                                                                   |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Login: "Email atau kata sandi salah" padahal benar      | `NEXT_PUBLIC_SUPABASE_URL` salah (mis. berakhiran `/rest/v1/`). Restart `npm run dev` setelah mengubah `.env.local` |
| Login: "Akun ini bukan admin"                           | Email belum ada di tabel `admins`, atau berbeda dengan email di Supabase Auth                                       |
| `relation "admins" does not exist`                      | Migrasi belum dijalankan: `npm run db:migrate`                                                                      |
| `DATABASE_URL masih berisi contoh`                      | Isi `DATABASE_URL` dengan connection string asli dari Supabase                                                      |
| Upload gagal: `Bucket not found`                        | Buat bucket `media` (publik) di Supabase Storage                                                                    |
| Gambar baru tidak muncul di `/demo` (ikon gambar rusak) | Restart `npm run dev` lalu refresh keras (Ctrl+Shift+R)                                                             |
| Build dev error soal font Google / cache aneh           | Hapus cache: PowerShell `Remove-Item -Recurse -Force .next`, lalu `npm run dev` lagi                                |
| `rm -rf` tidak dikenali di PowerShell                   | Pakai `Remove-Item -Recurse -Force <folder>` (PowerShell) atau jalankan di Git Bash                                 |

## Keamanan singkat

- Halaman admin dilindungi `proxy.ts` (pemeriksaan awal) **dan** pengecekan sesi + tabel `admins` di server.
- Semua input publik divalidasi dengan Zod; endpoint publik dibatasi laju + Turnstile opsional.
- Nomor WhatsApp tamu tidak pernah dikirim ke halaman publik; nama tamu selalu diambil dari database lewat kode.
- Semua halaman diberi `noindex`, dan `robots.txt` melarang pengindeksan.
- Header keamanan (HSTS, nosniff, frame, referrer, permissions) diatur di [next.config.ts](next.config.ts).

**Batasan yang perlu diketahui:** pembatas laju disimpan di memori per instance (cukup sebagai lapisan pertama; ganti ke
penyimpanan terpusat seperti Upstash bila trafik besar), dan backup harian database diatur di Supabase, bukan di kode ini.
