# KabarBahagia — Konteks Proyek

Dokumen ini adalah **acuan produk dan arsitektur** untuk mengembangkan aplikasi. Ia menjelaskan apa yang dibangun,
mengapa, dan bagaimana bagian-bagiannya terhubung. Cara memasang dan menjalankan aplikasi ada di [README.md](README.md).

> **Aturan merawat dokumen ini:** bila ada keputusan atau perubahan arsitektur, perbarui file ini pada commit yang sama.

## Ringkasan

KabarBahagia adalah layanan **jasa** pembuatan undangan pernikahan digital.

- **Admin** menginput data undangan lewat panel admin.
- **Klien** (pasangan pengantin) tidak login; mereka menerima link undangan dan link rekap rahasia untuk melihat RSVP serta mengirim undangan ke tamu via WhatsApp.
- **Tamu** membuka undangan di HP lewat link personal dari WhatsApp.

Paket, harga, dan pembayaran diurus admin **di luar aplikasi**. Aplikasi hanya untuk membuat dan menjalankan undangan.

## Status

**Fase 1 (MVP) selesai** dan sudah melampaui rencana awal: 11 tema (rencana: 1), animasi interaktif (GSAP, Framer Motion,
Three.js), halaman demo, tes otomatis, dan CI. Belum diuji dengan klien nyata, yang menjadi gerbang ke Fase 2.

Yang belum ada (lihat [Roadmap](#roadmap)): edit tamu dari UI, pembatas laju terpusat, tema tambahan di luar 11 yang ada,
check-in QR, custom domain, dan WhatsApp otomatis.

## Keputusan yang sudah final

| Topik               | Keputusan                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| Model bisnis        | Jasa (admin yang input data)                                                                                |
| Jenis acara         | Pernikahan saja                                                                                             |
| Tema                | 11 tema siap pakai (lihat [Daftar tema](#daftar-tema)); demo di `/demo`                                     |
| Bahasa              | Bahasa Indonesia saja (UI dan konten)                                                                       |
| Pengirim WhatsApp   | Klien, lewat halaman rekap, memakai link `wa.me`                                                            |
| Masa aktif          | 2 minggu setelah acara terakhir, lalu diarsipkan dan media dihapus                                          |
| Storage media       | Supabase Storage (bucket publik `media`)                                                                    |
| Domain              | Domain bawaan Vercel (`*.vercel.app`)                                                                       |
| Akses database      | Koneksi Postgres langsung lewat Drizzle (bukan API Supabase), sehingga tabel memakai RLS aktif tanpa policy |
| Animasi             | Tiga pustaka dengan pembagian tugas jelas: Framer Motion (UI), GSAP (teks & scroll), Three.js (adegan 3D)   |
| Aksesibilitas gerak | Semua animasi, partikel, dan adegan 3D dimatikan bila pengguna memilih `prefers-reduced-motion`             |

## Tech stack

| Lapisan    | Pilihan                                                                                                              |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, **Cache Components + Partial Prefetching**) + TypeScript                                     |
| Styling    | Tailwind CSS 4, variabel CSS tema (`--inv-*`)                                                                        |
| Animasi    | Framer Motion (reveal, dock, transisi, kartu), GSAP + ScrollTrigger (teks per huruf, parallax), Three.js (adegan 3D) |
| Database   | PostgreSQL di Supabase                                                                                               |
| ORM        | Drizzle (migrasi SQL di `db/migrations`)                                                                             |
| Auth admin | Supabase Auth + tabel `admins` (akun Supabase saja tidak cukup)                                                      |
| Storage    | Supabase Storage                                                                                                     |
| Gambar     | `next/image` + `sharp` (resize maks 1600px, WebP) saat upload                                                        |
| OG image   | `next/og` (otomatis per undangan) atau gambar kustom                                                                 |
| Validasi   | Zod                                                                                                                  |
| Anti-spam  | Cloudflare Turnstile (opsional) + rate limit                                                                         |
| Kualitas   | ESLint, Prettier, Vitest, GitHub Actions (format → lint → typecheck → test → build)                                  |
| Deploy     | Vercel (+ Vercel Cron)                                                                                               |

> Next.js 16 punya API yang berbeda dari versi lama (mis. `proxy.ts` menggantikan `middleware.ts`, `updateTag`,
> prop `retry` pada `error.tsx`). Baca `node_modules/next/dist/docs/` sebelum mengubah perilaku framework (lihat `AGENTS.md`).

## Struktur rute

| Rute                                                  | Fungsi                                                                            |
| ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| `/{slug}`                                             | Halaman undangan publik (di-cache per slug, tag `inv:{slug}`)                     |
| `/{slug}?to={kode-tamu}`                              | Undangan dengan nama tamu personal (nama dari database lewat kode)                |
| `/{slug}/opengraph-image`                             | Gambar preview WhatsApp 1200×630 (otomatis)                                       |
| `/r/{client_token}`                                   | Rekap klien: RSVP, ucapan, daftar link tamu, tombol kirim WhatsApp (tanpa login)  |
| `/login`                                              | Login admin                                                                       |
| `/admin`                                              | Daftar undangan (cari, filter status, urut tanggal acara)                         |
| `/admin/new`                                          | Buat undangan                                                                     |
| `/admin/{id}`                                         | Ringkasan: status, link, statistik, publikasi, duplikat, hapus                    |
| `/admin/{id}/edit`                                    | Form data & tema                                                                  |
| `/admin/{id}/media` · `/guests` · `/rsvp` · `/wishes` | Galeri · tamu & WhatsApp · rekap RSVP · moderasi ucapan                           |
| `/demo` · `/preview/{themeId}`                        | Demo semua tema dengan data contoh; RSVP & ucapan berjalan lokal (tanpa database) |
| `/api/rsvp` · `/api/wishes`                           | Endpoint publik (GET/POST), wajib rate limit + validasi + Turnstile               |
| `/api/view`                                           | Mencatat kunjungan/dibuka (statistik)                                             |
| `/api/admin/upload`                                   | Upload media admin (gambar → WebP, audio apa adanya)                              |
| `/api/admin/rsvp-csv/{id}`                            | Ekspor RSVP ke CSV (admin)                                                        |
| `/api/cron/expire`                                    | Cron harian: arsipkan undangan kedaluwarsa + hapus media (butuh `CRON_SECRET`)    |

Slug yang dicadangkan sistem (tidak boleh dipakai undangan): `admin`, `api`, `login`, `r`, `demo`, `preview`, `_next`.

## Model data (inti)

Semua entitas berpusat pada `Invitation`. Skema sumber: `db/schema.ts`.

| Entitas     | Field utama                                                                                                                                                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin       | id, email, nama, role                                                                                                                                                                                                                                               |
| Invitation  | id, slug (unik), theme_id, status (`draft` / `aktif` / `arsip`), content (JSON: data mempelai, pembuka, penutup, love story, link live/YouTube), section_config (JSON), primary_color, music_url, og_image_url, expires_at (acara terakhir + 14 hari), client_token |
| Event       | id, invitation_id, nama (Akad, Resepsi), mulai, selesai, zona waktu (WIB/WITA/WIT), venue, alamat, maps_url                                                                                                                                                         |
| Media       | id, invitation_id, tipe (foto / video / audio), url, **storage_path**, urutan, section (`galeri` atau `aset` untuk foto cover/mempelai/QRIS/musik)                                                                                                                  |
| Guest       | id, invitation_id, kode (unik, acak 8 karakter), nama, grup, no_whatsapp (62…), max_pax, sent_at, opened_at                                                                                                                                                         |
| Rsvp        | id, invitation_id, guest_id (opsional, unik bila ada), nama, status (hadir / tidak / ragu), jumlah, updated_at                                                                                                                                                      |
| Wish        | id, invitation_id, guest_id (opsional), nama, pesan, hidden, created_at                                                                                                                                                                                             |
| GiftAccount | id, invitation_id, tipe (bank, e-wallet, QRIS, alamat), nama_bank, nomor, atas_nama, gambar_qr                                                                                                                                                                      |
| PageView    | id, invitation_id, guest_id (opsional), waktu                                                                                                                                                                                                                       |

Bentuk data yang dipakai komponen tema (`InvitationData`) dan skema validasinya ada di `types/invitation.ts`.

## Halaman undangan: section

Section bisa diaktifkan, dinonaktifkan, dan diurutkan per undangan lewat `section_config` (Cover selalu pertama). Section
yang diaktifkan tapi tanpa data (mis. Acara tanpa acara) tidak ditampilkan.

| Kode | Section        | Catatan                                                                                                 | Prioritas |
| ---- | -------------- | ------------------------------------------------------------------------------------------------------- | --------- |
| U-01 | Cover          | Nama mempelai, tanggal, nama tamu; tombol "Buka Undangan". Bentuk berbeda tiap tema                     | Wajib     |
| U-02 | Musik          | Diputar setelah tombol Buka ditekan (autoplay diblokir browser); tombol jeda melayang                   | Wajib     |
| U-03 | Pembuka        | Salam, ayat atau kutipan (latar foto parallax bila ada foto cover)                                      | Wajib     |
| U-04 | Mempelai       | Foto (bingkai sesuai tema, miring mengikuti kursor), nama lengkap, orang tua, Instagram                 | Wajib     |
| U-05 | Countdown      | Ke acara utama; angka bergulir; bisa berlatar adegan 3D                                                 | Wajib     |
| U-06 | Acara          | Tanggal, jam, zona waktu, alamat, Google Maps, tombol "Google Kalender" & "Kalender HP / iPhone" (.ics) | Wajib     |
| U-07 | Galeri         | Lightbox bisa digeser; tata letak per tema (grid, polaroid, filmstrip, masonry); video YouTube opsional | Wajib     |
| U-08 | Love story     | Timeline cerita                                                                                         | Opsional  |
| U-09 | RSVP           | Hadir/tidak/ragu, jumlah dibatasi `max_pax`; bisa diubah lewat link yang sama; konfeti saat "hadir"     | Wajib     |
| U-10 | Ucapan         | Terbaru di atas; anti-spam; ucapan disembunyikan moderator tidak tampil                                 | Wajib     |
| U-11 | Amplop digital | Rekening/e-wallet + tombol salin, QRIS, alamat kirim kado                                               | Wajib     |
| U-12 | Live streaming | Link YouTube/Instagram Live                                                                             | Opsional  |
| U-13 | Penutup        | Terima kasih, nama keluarga; objek 3D yang bisa diseret + kembang api/lampion                           | Wajib     |

Elemen navigasi bersama: bilah progres scroll, **dock** navigasi section di bawah (menggulir otomatis ke item aktif), dan
tombol musik di kanan atas.

## Panel admin: modul

| Kode | Modul                                                                             | Status                                                      |
| ---- | --------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| A-01 | Login (hanya admin terdaftar di tabel `admins`)                                   | ✅                                                          |
| A-02 | Daftar undangan (cari, filter status, urut tanggal acara)                         | ✅                                                          |
| A-03 | Form undangan (simpan sebagai draft)                                              | ✅                                                          |
| A-04 | Pilih tema + pratinjau (tautan demo per tema)                                     | ✅                                                          |
| A-05 | Upload media (resize, kompres WebP, urutkan dengan drag)                          | ✅                                                          |
| A-06 | Duplikat undangan (foto galeri tidak ikut disalin)                                | ✅                                                          |
| A-07 | Kelola tamu (tambah manual, impor tempel Excel/CSV, grup, max_pax, hapus)         | ✅ (edit tamu belum ada UI; action `updateGuest` sudah ada) |
| A-08 | Link & pesan WA (template bisa diedit, `wa.me`, tandai terkirim)                  | ✅                                                          |
| A-09 | Rekap RSVP + export CSV (aman dari formula injection)                             | ✅                                                          |
| A-10 | Moderasi ucapan (sembunyikan / hapus)                                             | ✅                                                          |
| A-11 | Link rekap klien (`/r/{client_token}`)                                            | ✅                                                          |
| A-12 | Publikasi (draft → aktif; kedaluwarsa otomatis lewat cron)                        | ✅                                                          |
| A-13 | Statistik dibuka (tamu yang membuka, total kunjungan, terkirim, konfirmasi hadir) | ✅                                                          |

## Aturan bisnis penting

- Nama tamu **diambil dari database lewat kode tamu**, bukan dari teks di URL.
- Link tanpa kode tetap bisa dibuka sebagai undangan umum; RSVP lalu meminta nama (maks. 5 orang).
- Undangan `draft` hanya bisa dibuka admin yang sedang login; RSVP/ucapan/kunjungan hanya diterima untuk status `aktif`.
- Undangan otomatis kedaluwarsa 2 minggu setelah acara terakhir: halaman arsip tampil dan media dihapus dari Supabase Storage (cron harian; pengecekan juga dilakukan saat halaman dimuat dari cache).
- Nomor WhatsApp tamu tidak pernah tampil di halaman publik atau dikirim lewat API publik.
- Halaman undangan, rekap, dan admin diberi `noindex`; `robots.txt` melarang semua pengindeksan.
- Link rekap klien bersifat rahasia (token acak 24 karakter); siapa pun yang memegangnya dapat melihat RSVP dan menandai pesan terkirim.

## Sistem tema

Tema hanya mengatur tampilan; data undangan tidak pernah disimpan di dalam tema.

- Satu folder per tema: `config.ts` (warna, font, radius, partikel, efek penutup cover), `fonts.ts`, `Cover.tsx`, `ui.tsx` (pembungkus section), `index.ts`.
- **Kit bersama** (`themes/kit`): semua section selain Cover dan pembungkusnya dibangun oleh `createSections()`. Tema memberi opsi `photoShape`, `motion`, `gallery`, `scenes`, dan boleh mengganti section tertentu lewat argumen kedua.
- Semua komponen section menerima tipe data yang sama (`InvitationData`).
- Komponen interaktif (RSVP, ucapan, amplop, galeri, countdown) dipakai bersama dan hanya diberi gaya lewat variabel `--inv-*`.
- Warna utama bisa di-override per undangan; urutan dan aktif/nonaktif section diatur per undangan.
- Registri tema (`themes/registry.ts`) berisi id, nama, deskripsi, dan gambar pratinjau untuk panel admin.

### Daftar tema

| Tema (`id`)                           | Cover (interaksi)                                | Adegan 3D cover | Penutupan cover | Galeri    |
| ------------------------------------- | ------------------------------------------------ | --------------- | --------------- | --------- |
| Elegan Minimalis `elegan-minimalis`   | Teks per huruf, foto Ken Burns                   | Cincin emas     | geser naik      | grid      |
| Rustic Floral `rustic-floral`         | Foto berbingkai lengkung                         | Kupu-kupu       | geser naik      | grid      |
| Midnight Gold `midnight-gold`         | Bingkai emas ganda                               | Galaksi spiral  | geser naik      | grid      |
| Pastel Romantis `pastel-romantis`     | Foto bulat, bentuk lembut                        | Hati melayang   | geser naik      | grid      |
| Amplop Klasik `amplop-klasik`         | **Ketuk segel**: amplop terbuka, surat terangkat | Hati melayang   | memudar         | grid      |
| Tirai Teater `tirai-teater`           | **Tarik tirai** beludru, lampu sorot             | Kembang api     | memudar         | filmstrip |
| Pantai Senja `pantai-senja`           | Matahari terbit, 3 lapis ombak                   | Gelembung       | zoom            | masonry   |
| Nusantara Klasik `nusantara-klasik`   | Mandala emas berputar di atas motif batik        | Lampion langit  | geser naik      | grid      |
| Neon Night `neon-night`               | Lantai grid neon, teks glitch                    | Wireframe       | zoom            | masonry   |
| Polaroid Memories `polaroid-memories` | **Seret polaroid** di cover                      | –               | geser kiri      | polaroid  |
| Sakura Zen `sakura-zen`               | Matahari merah, nama vertikal                    | Kelopak sakura  | iris (mengecil) | filmstrip |

Menambah tema baru: lihat [README.md → Menambah tema baru](README.md#menambah-tema-baru).

### Gaya penutupan cover (`coverExit`)

`slideUp` · `fade` · `zoom` · `iris` · `slideLeft`. Cover interaktif (amplop, tirai) memutar animasinya sendiri lewat
`useShellOpen()` sebelum undangan dibuka.

## Animasi dan adegan 3D

| Teknologi     | Dipakai untuk                                                                                                                 | Lokasi                                |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Framer Motion | Reveal (up/left/right/zoom/fade/blur/rotate/flip/drop), dock, countdown bergulir, tilt foto, lightbox swipe, cover interaktif | `components/invitation/effects`, tema |
| GSAP          | Teks cover per huruf (`SplitText`), parallax/drift/garis saat scroll (`ScrollFx`, lewat atribut `data-fx`)                    | `components/invitation/effects`       |
| Three.js      | Adegan 3D: cincin, hati, hati berdetak, galaksi, lampion, kembang api, kupu-kupu, bintang, kelopak, gelembung, wireframe      | `components/invitation/scene`         |
| CSS           | Partikel ambient, konfeti RSVP, gelombang, grid neon, glitch, Ken Burns                                                       | `app/globals.css`                     |

Aturan arsitektur adegan 3D (`scene/engine`):

- `builders.ts` berisi pembuat adegan per jenis; `runtime.ts` mengurus renderer, kamera, cahaya, input (pointer, kemiringan HP, seretan), percikan saat diketuk, dan pelepasan sumber daya.
- Three.js **dimuat dinamis** (`import("three")`) agar tidak membebani render awal.
- Adegan **berhenti** saat tab tersembunyi atau di luar layar; jumlah objek dikurangi di HP kecil/CPU rendah.
- Setiap pemasangan membuat `<canvas>` baru (konteks WebGL yang sudah dilepas tidak bisa dipakai ulang; React StrictMode memasang dua kali di mode dev).
- Adegan section (`SectionScene`) hanya dibuat saat mendekati layar dan dilepas saat menjauh, agar konteks WebGL aktif tetap sedikit.
- Warna adegan mengikuti variabel tema (`--inv-scene` atau `--inv-primary`); latar terang memakai blending normal, latar gelap additive.

## Arsitektur & konvensi kode

```
app/            Rute. Server Actions admin di app/admin/_actions/{invitation,media,guests,wishes}.ts
components/     invitation/{effects,scene,widgets} · admin · shared
themes/         kit + satu folder per tema + registry
lib/            env, auth, data (loader ber-cache), invitations (query bersama), dates, ids, text, urls, wa,
                rsvp, rsvp-format, storage, ratelimit, turnstile, calendar, demo-data
db/             schema.ts, index.ts (koneksi lazy), migrations/
types/          invitation.ts (tipe + skema Zod)
tests/          Vitest (lib murni: teks, tanggal, ID, WA, CSV RSVP, rate limit, env, skema)
```

Konvensi:

- **Cache Components:** akses runtime (`cookies`, `searchParams`, `params`) dibungkus `<Suspense>`. Data undangan publik di-cache (`"use cache"` + `cacheTag("inv:{slug}")`) dan di-invalidate dengan `updateTag` setelah admin menyimpan. Komponen yang memakai sesi/waktu memanggil `await connection()` lebih dulu.
- **Validasi ID:** semua Server Action memeriksa ID dengan `assertUuid` sebelum menyentuh database; halaman admin memakai `getInvitationOrNotFound`.
- **Environment:** diakses lewat `lib/env.ts` yang memberi pesan jelas (menolak URL Supabase berpath dan `DATABASE_URL` contoh). Variabel `NEXT_PUBLIC_*` yang dipakai di client dibaca langsung lewat `process.env`.
- **Modul server-only:** `lib/ids.ts`, `lib/auth.ts`, `lib/storage.ts`, `lib/env.ts`, `lib/invitations.ts`, klien Supabase memakai `import "server-only"`. Helper murni yang dipakai client ada di `lib/text.ts`, `lib/dates.ts`, `lib/urls.ts`, `lib/wa.ts`, `lib/rsvp-format.ts`.
- **Gaya kode:** Prettier (lebar 120, LF), ESLint bawaan Next. Komentar dalam Bahasa Indonesia, menjelaskan _mengapa_.
- Sebelum commit: `npm run check` (lint + typecheck + tes). CI menjalankan format, lint, typecheck, tes, dan build.

## Kebutuhan non-fungsional

- **Performa**: LCP < 2,5 detik di 4G; halaman awal < 1 MB sebelum galeri dimuat; galeri lazy-load; Three.js dimuat dinamis dan hanya setelah komponen dipasang. _Belum diukur dengan perangkat nyata._
- **Mobile-first**: desain untuk lebar 360–430 px (kontainer undangan maks. 480 px), tetap rapi di desktop.
- **Preview WhatsApp**: Open Graph per undangan (judul, deskripsi, gambar 1200×630; otomatis atau kustom).
- **Caching**: halaman undangan statis/ISR per slug; RSVP dan ucapan diambil terpisah lewat API.
- **Keamanan**: validasi Zod di server; rate limit + Turnstile di endpoint publik; header keamanan (HSTS, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy); `Cache-Control: private, no-store` untuk `/admin` dan `/r`; RLS aktif tanpa policy; kunci service-role hanya di server.
- **Aksesibilitas**: kontras cukup, area sentuh ≥ 44 px, `prefers-reduced-motion` dihormati (animasi, partikel, 3D).
- **Cadangan**: backup harian database diatur di Supabase (bukan di kode).
- **Observabilitas**: halaman error (`error.tsx`, `global-error.tsx`, `admin/error.tsx`) menampilkan kode `digest` yang cocok dengan log server.

## Catatan teknis & batasan yang diketahui

- **Pembatas laju** disimpan di memori per instance (efektif sebagai lapisan pertama bersama Turnstile). Ganti ke penyimpanan terpusat (mis. Upstash Redis) bila trafik besar.
- **Kedaluwarsa** dihitung saat halaman dimuat ulang dari cache (maks. beberapa jam) dan oleh cron harian; media dihapus oleh cron.
- **Duplikat undangan** tidak menyalin foto agar tidak ada berkas Storage yang dipakai bersama dan ikut terhapus saat salah satu diarsipkan.
- **Edit tamu** belum punya UI (hapus & tambah ulang sebagai gantinya).
- **Font Google** diambil lewat `next/font`; bila build dev menolak sebuah font, ganti dengan font lain atau hapus cache `.next`.
- **WebGL** bisa dinonaktifkan browser (mis. mode privasi ketat). Adegan 3D lalu dilewati dan tampilan tetap utuh.
- **Pratinjau tema di form admin** berupa ilustrasi SVG sederhana, bukan tangkapan layar asli; tampilan penuh ada di `/demo`.

## Di luar lingkup MVP

- Registrasi/login klien dan editor mandiri
- Paket, harga, dan pembayaran
- Pengiriman WhatsApp otomatis
- Custom domain dan subdomain
- Check-in tamu dengan QR
- Jenis acara lain dan bahasa selain Indonesia

## Roadmap

1. **Fase 1 · MVP — ✅ selesai.** Halaman undangan lengkap, 11 tema, panel admin, link tamu + `wa.me`, link rekap, demo. _Gerbang: 3 klien pertama tanpa kendala besar (belum diuji)._
2. **Fase 2 · Efisiensi jasa** — ✅ duplikat undangan, statistik, tema tambahan, demo tema. Sisa: edit tamu dari UI, impor tamu dengan pratinjau, template pesan WA tersimpan per undangan, jenis acara lain. _Gerbang: produksi < 30 menit per undangan._
3. **Fase 3 · Self-service** — login klien, editor mandiri, pembayaran, paket harga.
4. **Fase 4 · Diferensiasi** — check-in QR, custom domain, WhatsApp Business API.

Kandidat peningkatan teknis (tanpa urutan): pembatas laju terpusat, tes end-to-end (Playwright) untuk alur admin & RSVP, pengukuran performa di perangkat nyata, pratinjau tema berupa tangkapan layar otomatis, dan peta situs internal untuk admin.
