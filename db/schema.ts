import { boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import type { InvitationContent, SectionConfig } from "@/types/invitation";

export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  nama: text("nama").notNull(),
  role: text("role", { enum: ["admin", "superadmin"] })
    .notNull()
    .default("admin"),
});

export const invitations = pgTable("invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  themeId: text("theme_id").notNull().default("elegan-minimalis"),
  status: text("status", { enum: ["draft", "aktif", "arsip"] })
    .notNull()
    .default("draft"),
  content: jsonb("content").$type<InvitationContent>().notNull(),
  sectionConfig: jsonb("section_config").$type<SectionConfig>().notNull(),
  primaryColor: text("primary_color"),
  musicUrl: text("music_url"),
  ogImageUrl: text("og_image_url"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  clientToken: text("client_token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    nama: text("nama").notNull(),
    mulai: timestamp("mulai", { withTimezone: true }).notNull(),
    selesai: timestamp("selesai", { withTimezone: true }),
    zonaWaktu: text("zona_waktu", { enum: ["WIB", "WITA", "WIT"] })
      .notNull()
      .default("WIB"),
    venue: text("venue").notNull().default(""),
    alamat: text("alamat").notNull().default(""),
    mapsUrl: text("maps_url").notNull().default(""),
  },
  (t) => [index("events_invitation_idx").on(t.invitationId)],
);

export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    tipe: text("tipe", { enum: ["foto", "video", "audio"] })
      .notNull()
      .default("foto"),
    url: text("url").notNull(),
    storagePath: text("storage_path"),
    urutan: integer("urutan").notNull().default(0),
    section: text("section").notNull().default("galeri"),
  },
  (t) => [index("media_invitation_idx").on(t.invitationId)],
);

export const guests = pgTable(
  "guests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    kode: text("kode").notNull().unique(),
    nama: text("nama").notNull(),
    grup: text("grup").notNull().default(""),
    noWhatsapp: text("no_whatsapp").notNull().default(""),
    maxPax: integer("max_pax").notNull().default(2),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    openedAt: timestamp("opened_at", { withTimezone: true }),
  },
  (t) => [index("guests_invitation_idx").on(t.invitationId)],
);

export const rsvps = pgTable(
  "rsvps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    guestId: uuid("guest_id").references(() => guests.id, { onDelete: "cascade" }),
    nama: text("nama").notNull(),
    status: text("status", { enum: ["hadir", "tidak", "ragu"] }).notNull(),
    jumlah: integer("jumlah").notNull().default(1),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("rsvps_invitation_idx").on(t.invitationId), uniqueIndex("rsvps_guest_unique").on(t.guestId)],
);

export const wishes = pgTable(
  "wishes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    guestId: uuid("guest_id").references(() => guests.id, { onDelete: "set null" }),
    nama: text("nama").notNull(),
    pesan: text("pesan").notNull(),
    hidden: boolean("hidden").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("wishes_invitation_idx").on(t.invitationId)],
);

export const giftAccounts = pgTable(
  "gift_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    tipe: text("tipe", { enum: ["bank", "ewallet", "qris", "alamat"] }).notNull(),
    namaBank: text("nama_bank").notNull().default(""),
    nomor: text("nomor").notNull().default(""),
    atasNama: text("atas_nama").notNull().default(""),
    gambarQr: text("gambar_qr").notNull().default(""),
  },
  (t) => [index("gifts_invitation_idx").on(t.invitationId)],
);

export const pageViews = pgTable(
  "page_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    guestId: uuid("guest_id").references(() => guests.id, { onDelete: "set null" }),
    waktu: timestamp("waktu", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("views_invitation_idx").on(t.invitationId)],
);
