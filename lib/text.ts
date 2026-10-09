/** Helper teks murni (aman dipakai di server maupun client). */

const SLUG_MAX = 60;

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "") // buang tanda aksen: "é" -> "e"
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX);
}

/** Slug yang bentrok dengan rute aplikasi tidak boleh dipakai undangan. */
export const RESERVED_SLUGS = new Set(["admin", "api", "login", "r", "demo", "preview", "_next"]);

/** Normalisasi nomor WhatsApp ke format internasional tanpa "+" (62...). */
export function normalizePhone(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("8")) return "62" + digits;
  return digits;
}

/** Ambil ID video dari berbagai bentuk URL YouTube. */
export function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m?.[1] ?? null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: string) => UUID_RE.test(value);
