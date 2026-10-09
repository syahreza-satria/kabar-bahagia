import { TIMEZONES, type TimezoneLabel } from "@/types/invitation";

const ID_LOCALE = "id-ID";

/** Undangan aktif selama 14 hari setelah acara terakhir. */
export const EXPIRY_DAYS = 14;

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

/** ISO -> nilai input `datetime-local` pada zona tertentu. */
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

/** Nilai `datetime-local` (waktu setempat) -> ISO UTC. Indonesia tidak memakai DST. */
export function localInputToIso(local: string, tz: TimezoneLabel) {
  const [d, t] = local.split("T");
  const [y, mo, da] = d.split("-").map(Number);
  const [h, mi] = t.split(":").map(Number);
  return new Date(Date.UTC(y, mo - 1, da, h - TZ_OFFSET_HOURS[tz], mi)).toISOString();
}

/** Tanggal kedaluwarsa = waktu paling akhir dari semua acara + EXPIRY_DAYS. */
export function computeExpiry(ends: (string | null)[], starts: string[]) {
  const all = [...ends.filter((x): x is string => !!x), ...starts].map((s) => new Date(s).getTime());
  if (!all.length) return null;
  return new Date(Math.max(...all) + EXPIRY_DAYS * 86_400_000);
}
