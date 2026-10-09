/** Alamat dasar aplikasi (tanpa garis miring di akhir). */
export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** Link personal tamu: kode tamu menentukan nama yang tampil. */
export const guestLink = (slug: string, code: string) => `${appUrl()}/${slug}?to=${code}`;

/** Link rekap rahasia untuk klien. */
export const clientLink = (token: string) => `${appUrl()}/r/${token}`;
