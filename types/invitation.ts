import { z } from "zod";

export const PERSON_SCHEMA = z.object({
  nickname: z.string().trim().min(1, "Nama panggilan wajib diisi").max(40),
  fullName: z.string().trim().min(1, "Nama lengkap wajib diisi").max(120),
  parents: z.string().trim().max(200).default(""),
  instagram: z.string().trim().max(60).default(""),
  photoUrl: z.string().trim().max(500).default(""),
});

export const LOVE_STORY_SCHEMA = z.object({
  date: z.string().trim().max(60).default(""),
  title: z.string().trim().max(120).default(""),
  text: z.string().trim().max(1000).default(""),
});

/** Isi "data mempelai (JSON)" pada tabel invitations. */
export const CONTENT_SCHEMA = z.object({
  bride: PERSON_SCHEMA,
  groom: PERSON_SCHEMA,
  coverImageUrl: z.string().trim().max(500).default(""),
  opening: z.object({
    greeting: z.string().trim().max(200).default("Assalamu'alaikum Warahmatullahi Wabarakatuh"),
    text: z.string().trim().max(1500).default(""),
    quote: z.string().trim().max(800).default(""),
    quoteSource: z.string().trim().max(120).default(""),
  }),
  closing: z.object({
    message: z.string().trim().max(1500).default(""),
    family: z.string().trim().max(300).default(""),
  }),
  loveStory: z.array(LOVE_STORY_SCHEMA).max(12).default([]),
  liveStreamUrl: z.string().trim().max(500).default(""),
  youtubeUrl: z.string().trim().max(500).default(""),
});
export type InvitationContent = z.infer<typeof CONTENT_SCHEMA>;

export const SECTION_CODES = [
  "cover",
  "pembuka",
  "mempelai",
  "countdown",
  "acara",
  "galeri",
  "lovestory",
  "rsvp",
  "ucapan",
  "amplop",
  "live",
  "penutup",
] as const;
export type SectionCode = (typeof SECTION_CODES)[number];

export const SECTION_LABELS: Record<SectionCode, string> = {
  cover: "Cover",
  pembuka: "Pembuka",
  mempelai: "Mempelai",
  countdown: "Countdown",
  acara: "Acara",
  galeri: "Galeri",
  lovestory: "Love Story",
  rsvp: "RSVP",
  ucapan: "Ucapan",
  amplop: "Amplop Digital",
  live: "Live Streaming",
  penutup: "Penutup",
};

/** Cover dan penutup tidak bisa dinonaktifkan/dipindah. */
export const SECTION_CONFIG_SCHEMA = z.array(
  z.object({
    code: z.enum(SECTION_CODES),
    enabled: z.boolean(),
  }),
);
export type SectionConfig = z.infer<typeof SECTION_CONFIG_SCHEMA>;

export const TIMEZONES = {
  WIB: "Asia/Jakarta",
  WITA: "Asia/Makassar",
  WIT: "Asia/Jayapura",
} as const;
export type TimezoneLabel = keyof typeof TIMEZONES;

export type EventData = {
  id: string;
  name: string;
  startsAt: string; // ISO
  endsAt: string | null; // ISO
  timezone: TimezoneLabel;
  venue: string;
  address: string;
  mapsUrl: string;
};

export type MediaData = {
  id: string;
  type: "foto" | "video" | "audio";
  url: string;
  order: number;
  section: string;
};

export type GiftData = {
  id: string;
  type: "bank" | "ewallet" | "qris" | "alamat";
  bankName: string;
  number: string;
  accountName: string;
  qrUrl: string;
};

/** Tipe tunggal yang diterima semua komponen section tema. */
export type InvitationData = {
  id: string;
  slug: string;
  themeId: string;
  status: "draft" | "aktif" | "arsip";
  content: InvitationContent;
  sectionConfig: SectionConfig;
  primaryColor: string | null;
  musicUrl: string | null;
  ogImageUrl: string | null;
  expiresAt: string | null;
  events: EventData[];
  media: MediaData[];
  gifts: GiftData[];
};

export function defaultSectionConfig(): SectionConfig {
  return SECTION_CODES.map((code) => ({
    code,
    enabled: code !== "lovestory" && code !== "live",
  }));
}

export function emptyContent(): InvitationContent {
  return CONTENT_SCHEMA.parse({
    bride: { nickname: "Mempelai Wanita", fullName: "Nama Lengkap Wanita" },
    groom: { nickname: "Mempelai Pria", fullName: "Nama Lengkap Pria" },
    opening: {},
    closing: {},
  });
}
