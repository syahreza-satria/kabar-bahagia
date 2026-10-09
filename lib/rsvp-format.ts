/** Format & ringkasan RSVP (murni, tanpa akses database; dipakai admin, rekap klien, dan ekspor CSV). */

export type RsvpStatus = "hadir" | "tidak" | "ragu";

export type RsvpRow = {
  nama: string;
  status: RsvpStatus;
  jumlah: number;
  grup: string | null;
  updatedAt: Date;
};

export function summarize(rows: { status: RsvpStatus; jumlah: number }[]) {
  const s = { hadir: 0, hadirOrang: 0, tidak: 0, ragu: 0 };
  for (const r of rows) {
    if (r.status === "hadir") {
      s.hadir++;
      s.hadirOrang += r.jumlah;
    } else {
      s[r.status]++;
    }
  }
  return s;
}

const STATUS_LABEL: Record<RsvpStatus, string> = { hadir: "Hadir", tidak: "Tidak hadir", ragu: "Ragu" };
export const statusLabel = (s: RsvpStatus) => STATUS_LABEL[s];

/** Sel CSV aman: tanda kutip di-escape dan awalan rumus (=, +, -, @) dinetralkan agar tidak dieksekusi Excel. */
export function csvCell(value: string | number) {
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replaceAll('"', '""')}"`;
}

/** CSV dengan BOM UTF-8 supaya huruf dan tanda baca terbaca benar di Excel. */
export function rsvpCsv(rows: RsvpRow[]) {
  const lines = [["Nama", "Grup", "Status", "Jumlah", "Diperbarui"].map(csvCell).join(",")];
  for (const r of rows) {
    lines.push(
      [r.nama, r.grup ?? "", statusLabel(r.status), r.jumlah, r.updatedAt.toISOString()].map(csvCell).join(","),
    );
  }
  return "﻿" + lines.join("\r\n");
}
