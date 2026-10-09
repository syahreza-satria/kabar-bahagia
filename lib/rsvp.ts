import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";

export async function listRsvps(invitationId: string) {
  return getDb()
    .select({
      nama: schema.rsvps.nama,
      status: schema.rsvps.status,
      jumlah: schema.rsvps.jumlah,
      grup: schema.guests.grup,
      updatedAt: schema.rsvps.updatedAt,
    })
    .from(schema.rsvps)
    .leftJoin(schema.guests, eq(schema.rsvps.guestId, schema.guests.id))
    .where(eq(schema.rsvps.invitationId, invitationId))
    .orderBy(asc(schema.rsvps.nama));
}

export function summarize(rows: { status: "hadir" | "tidak" | "ragu"; jumlah: number }[]) {
  const s = { hadir: 0, hadirOrang: 0, tidak: 0, ragu: 0 };
  for (const r of rows) {
    if (r.status === "hadir") {
      s.hadir++;
      s.hadirOrang += r.jumlah;
    } else s[r.status]++;
  }
  return s;
}

const STATUS_LABEL = { hadir: "Hadir", tidak: "Tidak hadir", ragu: "Ragu" } as const;
export const statusLabel = (s: keyof typeof STATUS_LABEL) => STATUS_LABEL[s];

function csvCell(v: string | number) {
  let s = String(v);
  // cegah formula injection saat dibuka di Excel
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replaceAll('"', '""')}"`;
}

export function rsvpCsv(rows: Awaited<ReturnType<typeof listRsvps>>) {
  const lines = [["Nama", "Grup", "Status", "Jumlah", "Diperbarui"].map(csvCell).join(",")];
  for (const r of rows) {
    lines.push([r.nama, r.grup ?? "", statusLabel(r.status), r.jumlah, r.updatedAt.toISOString()].map(csvCell).join(","));
  }
  return "﻿" + lines.join("\r\n");
}
