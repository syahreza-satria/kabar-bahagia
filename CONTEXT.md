# KabarBahagia — Konteks Proyek

Dokumen ini adalah ringkasan PRD untuk dipakai sebagai acuan saat mengembangkan aplikasi. Bila ada keputusan baru, perbarui file ini.

## Ringkasan

KabarBahagia adalah layanan **jasa** pembuatan undangan pernikahan digital.

- **Admin** menginput data undangan lewat panel admin.
- **Klien** (pasangan pengantin) tidak login; mereka menerima link undangan dan link rekap rahasia untuk melihat RSVP serta mengirim undangan ke tamu via WhatsApp.
- **Tamu** membuka undangan di HP lewat link personal dari WhatsApp.

Paket, harga, dan pembayaran diurus admin **di luar aplikasi**. Aplikasi hanya untuk membuat dan menjalankan undangan.

## Keputusan yang sudah final

| Topik             | Keputusan                                                          |
| ----------------- | ------------------------------------------------------------------ |
| Model bisnis      | Jasa (admin yang input data)                                       |
| Jenis acara       | Pernikahan saja                                                    |
| Tema awal         | Elegan Minimalis (satu tema di MVP)                                |
| Bahasa            | Bahasa Indonesia saja (UI dan konten)                              |
| Pengirim WhatsApp | Klien, lewat halaman rekap, memakai link `wa.me`                   |
| Masa aktif        | 2 minggu setelah acara terakhir, lalu diarsipkan dan media dihapus |
| Storage media     | Supabase Storage                                                   |
| Domain            | Domain bawaan Vercel (`*.vercel.app`)                              |

## Tech stack

| Lapisan    | Pilihan                                                              |
| ---------- | -------------------------------------------------------------------- |
| Framework  | Next.js (App Router) + TypeScript                                    |
| Styling    | Tailwind CSS                                                         |
| Animasi    | Framer Motion (GSAP hanya bila perlu efek scroll rumit)              |
| Database   | PostgreSQL di Supabase                                               |
| ORM        | Drizzle                                                              |
| Auth admin | Supabase Auth                                                        |
| Storage    | Supabase Storage                                                     |
| Gambar     | `next/image` + kompres/resize saat upload dengan `sharp` (WebP/AVIF) |
| OG image   | `next/og`                                                            |
| Anti-spam  | Cloudflare Turnstile + rate limit                                    |
| Deploy     | Vercel                                                               |

## Struktur rute

| Rute                       | Fungsi                                                                     |
| -------------------------- | -------------------------------------------------------------------------- |
| `/{slug}`                  | Halaman undangan publik (ISR)                                              |
| `/{slug}?to={kode-tamu}`   | Undangan dengan nama tamu personal                                         |
| `/api/rsvp`, `/api/wishes` | Endpoint publik, wajib rate limit + validasi                               |
| `/admin/*`                 | Panel admin, dilindungi middleware auth                                    |
| `/r/{client_token}`        | Halaman rekap klien: RSVP, ucapan, daftar link tamu, tombol kirim WhatsApp |

## Model data (inti)

Semua entitas berpusat pada `Invitation`.

| Entitas     | Field utama                                                                                                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Admin       | id, email, nama, role                                                                                                                                                                      |
| Invitation  | id, slug (unik), theme_id, status (`draft` / `aktif` / `arsip`), data mempelai (JSON), section_config (JSON), music_url, og_image_url, expires_at (acara terakhir + 14 hari), client_token |
| Event       | id, invitation_id, nama (Akad, Resepsi), mulai, selesai, zona waktu, venue, alamat, maps_url                                                                                               |
| Media       | id, invitation_id, tipe (foto, video), url, urutan, section                                                                                                                                |
| Guest       | id, invitation_id, kode (unik, acak ±8 karakter), nama, grup, no_whatsapp, max_pax, sent_at, opened_at                                                                                     |
| Rsvp        | id, invitation_id, guest_id (opsional), nama, status (hadir / tidak / ragu), jumlah, updated_at                                                                                            |
| Wish        | id, invitation_id, guest_id (opsional), nama, pesan, hidden, created_at                                                                                                                    |
| GiftAccount | id, invitation_id, tipe (bank, e-wallet, QRIS, alamat), nama bank, nomor, atas nama, gambar_qr                                                                                             |
| PageView    | id, invitation_id, guest_id (opsional), waktu                                                                                                                                              |

## Halaman undangan: section

Section bisa diaktifkan, dinonaktifkan, dan diurutkan per undangan lewat `section_config`.

| Kode | Section        | Catatan                                                                                        | Prioritas |
| ---- | -------------- | ---------------------------------------------------------------------------------------------- | --------- |
| U-01 | Cover          | Nama mempelai, tanggal, nama tamu; tombol "Buka Undangan"                                      | Wajib     |
| U-02 | Musik          | Diputar setelah tombol Buka Undangan ditekan (autoplay diblokir browser); tombol jeda melayang | Wajib     |
| U-03 | Pembuka        | Salam, ayat atau kutipan                                                                       | Wajib     |
| U-04 | Mempelai       | Foto, nama lengkap, nama orang tua, link Instagram                                             | Wajib     |
| U-05 | Countdown      | Ke acara utama                                                                                 | Wajib     |
| U-06 | Acara          | Akad/resepsi: tanggal, jam, zona waktu, alamat, Google Maps, Add to Calendar                   | Wajib     |
| U-07 | Galeri         | Foto + lightbox; video YouTube opsional                                                        | Wajib     |
| U-08 | Love story     | Timeline cerita                                                                                | Opsional  |
| U-09 | RSVP           | Hadir/tidak/ragu, jumlah dibatasi `max_pax`; bisa diubah lewat link yang sama                  | Wajib     |
| U-10 | Ucapan         | Terbaru di atas; anti-spam                                                                     | Wajib     |
| U-11 | Amplop digital | Rekening/e-wallet + tombol salin, QRIS, alamat kirim kado                                      | Wajib     |
| U-12 | Live streaming | Link YouTube/Instagram Live                                                                    | Opsional  |
| U-13 | Penutup        | Terima kasih, nama keluarga                                                                    | Wajib     |

## Panel admin: modul

| Kode | Modul                                                                     | Prioritas |
| ---- | ------------------------------------------------------------------------- | --------- |
| A-01 | Login (hanya admin)                                                       | Wajib     |
| A-02 | Daftar undangan (cari, filter status, tanggal acara)                      | Wajib     |
| A-03 | Form undangan (simpan sebagai draft)                                      | Wajib     |
| A-04 | Pilih tema + pratinjau                                                    | Wajib     |
| A-05 | Upload media (resize, kompres, urutkan dengan drag)                       | Wajib     |
| A-06 | Duplikat undangan                                                         | Sebaiknya |
| A-07 | Kelola tamu (manual, import CSV / tempel dari Excel, grup, max_pax)       | Wajib     |
| A-08 | Link & pesan WA (generate link, template pesan, `wa.me`, tandai terkirim) | Wajib     |
| A-09 | Rekap RSVP + export CSV                                                   | Wajib     |
| A-10 | Moderasi ucapan                                                           | Wajib     |
| A-11 | Link rekap klien (`/r/{client_token}`)                                    | Wajib     |
| A-12 | Publikasi (draft → aktif; kedaluwarsa otomatis)                           | Wajib     |
| A-13 | Statistik dibuka                                                          | Sebaiknya |

## Aturan bisnis penting

- Nama tamu **diambil dari database lewat kode tamu**, bukan dari teks di URL.
- Link tanpa kode tetap bisa dibuka sebagai undangan umum; RSVP lalu meminta nama.
- Undangan `draft` hanya bisa dibuka admin.
- Undangan otomatis kedaluwarsa 2 minggu setelah acara terakhir: tampilkan halaman arsip dan hapus media dari Supabase Storage.
- Nomor WhatsApp tamu tidak pernah tampil di halaman publik.
- Halaman undangan diberi `noindex`.

## Sistem tema

Tema hanya mengatur tampilan; data undangan tidak pernah disimpan di dalam tema.

- Satu folder per tema, berisi komponen untuk setiap section + file konfigurasi.
- Konfigurasi tema (warna, font, ornamen, animasi, section default) berupa objek TypeScript terketik.
- Semua komponen section menerima tipe data yang sama (`InvitationData`).
- Komponen interaktif (RSVP, ucapan, amplop) dipakai bersama dan hanya diberi gaya oleh tema.
- Warna utama dan urutan section bisa di-override per undangan.
- Registri tema berisi id, nama, dan gambar pratinjau untuk panel admin.

Contoh struktur:

```
src/
  themes/
    registry.ts
    elegan-minimalis/
      config.ts
      sections/
        Cover.tsx
        Mempelai.tsx
        Acara.tsx
        ...
  components/
    invitation/   # RSVP, Ucapan, Amplop, MusicPlayer (dipakai semua tema)
  types/
    invitation.ts # InvitationData
```

## Kebutuhan non-fungsional

- **Performa**: LCP < 2,5 detik di 4G; halaman awal < 1 MB sebelum galeri dimuat; lazy-load galeri.
- **Mobile-first**: desain untuk lebar 360–430 px, tetap rapi di desktop.
- **Preview WhatsApp**: Open Graph per undangan (judul, deskripsi, gambar 1200×630).
- **Caching**: halaman undangan statis/ISR; RSVP dan ucapan diambil terpisah.
- **Keamanan**: validasi input di server, rate limit + Turnstile di endpoint publik.
- **Aksesibilitas**: kontras cukup, area sentuh ≥ 44 px, hormati `prefers-reduced-motion`.
- **Cadangan**: backup database harian.

## Di luar lingkup MVP

- Registrasi/login klien dan editor mandiri
- Paket, harga, dan pembayaran
- Pengiriman WhatsApp otomatis
- Custom domain dan subdomain
- Check-in tamu dengan QR
- Jenis acara lain dan bahasa selain Indonesia

## Roadmap

1. **Fase 1 · MVP** — halaman undangan lengkap, tema Elegan Minimalis, panel admin, link tamu + `wa.me`, link rekap. Gerbang: 3 klien pertama tanpa kendala besar.
2. **Fase 2 · Efisiensi jasa** — duplikat undangan, statistik, tema tambahan, jenis acara lain. Gerbang: produksi < 30 menit per undangan.
3. **Fase 3 · Self-service** — login klien, editor mandiri, pembayaran, paket harga.
4. **Fase 4 · Diferensiasi** — check-in QR, custom domain, WhatsApp Business API.
