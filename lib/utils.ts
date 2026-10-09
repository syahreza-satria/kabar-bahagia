import { randomBytes } from "node:crypto";
import { TIMEZONES, type TimezoneLabel } from "@/types/invitation";

const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // tanpa karakter membingungkan

export function randomId(length: number, alphabet = CODE_ALPHABET) {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export const generateGuestCode = () => randomId(8);
export const generateClientToken = () => randomId(24);

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Slug yang bentrok dengan rute aplikasi. */
export const RESERVED_SLUGS = new Set(["admin", "api", "login", "r", "_next"]);

/** Normalisasi nomor WhatsApp ke format internasional tanpa "+" (62...). */
export function normalizePhone(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("8")) return "62" + digits;
  return digits;
}

export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export const guestLink = (slug: string, code: string) => `${appUrl()}/${slug}?to=${code}`;
export const clientLink = (token: string) => `${appUrl()}/r/${token}`;

export { DEFAULT_WA_TEMPLATE, renderTemplate, waLink } from "./wa";

const ID_LOCALE = "id-ID";

export function formatDateLong(iso: string, tz: TimezoneLabel) {
  return new Intl.DateTimeFormat(ID_LOCALE, {
    timeZone: TIMEZONES[tz],
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatTime(iso: string, tz: TimezoneLabel) {
  return new Intl.DateTimeFormat(ID_LOCALE, {
    timeZone: TIMEZONES[tz],
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(iso))
    .replace(".", ":");
}

export function formatDateShort(iso: string, tz: TimezoneLabel = "WIB") {
  return new Intl.DateTimeFormat(ID_LOCALE, {
    timeZone: TIMEZONES[tz],
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/** Konversi ISO -> nilai input datetime-local pada zona tertentu. */
export function isoToLocalInput(iso: string, tz: TimezoneLabel) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TIMEZONES[tz],
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(iso))
    .replace(" ", "T");
}

const TZ_OFFSET_HOURS: Record<TimezoneLabel, number> = { WIB: 7, WITA: 8, WIT: 9 };

/** Konversi nilai datetime-local (waktu setempat) -> ISO UTC. Indonesia tidak memakai DST. */
export function localInputToIso(local: string, tz: TimezoneLabel) {
  const [d, t] = local.split("T");
  const [y, mo, da] = d.split("-").map(Number);
  const [h, mi] = t.split(":").map(Number);
  return new Date(Date.UTC(y, mo - 1, da, h - TZ_OFFSET_HOURS[tz], mi)).toISOString();
}

export const EXPIRY_DAYS = 14;

export function computeExpiry(ends: (string | null)[], starts: string[]) {
  const all = [...ends.filter((x): x is string => !!x), ...starts].map((s) => new Date(s).getTime());
  if (!all.length) return null;
  return new Date(Math.max(...all) + EXPIRY_DAYS * 86_400_000);
}

export function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m?.[1] ?? null;
}
