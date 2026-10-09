import { describe, expect, it } from "vitest";
import { csvCell, rsvpCsv, statusLabel, summarize, type RsvpRow } from "@/lib/rsvp-format";

describe("summarize", () => {
  it("menghitung konfirmasi dan jumlah orang yang hadir", () => {
    const s = summarize([
      { status: "hadir", jumlah: 2 },
      { status: "hadir", jumlah: 3 },
      { status: "ragu", jumlah: 1 },
      { status: "tidak", jumlah: 0 },
    ]);
    expect(s).toEqual({ hadir: 2, hadirOrang: 5, ragu: 1, tidak: 1 });
  });
  it("kosong", () => {
    expect(summarize([])).toEqual({ hadir: 0, hadirOrang: 0, ragu: 0, tidak: 0 });
  });
});

describe("csvCell", () => {
  it("meng-escape tanda kutip", () => {
    expect(csvCell('Dia "si" budi')).toBe('"Dia ""si"" budi"');
  });
  it.each(["=SUM(A1)", "+1", "-1", "@cmd"])("menetralkan awalan rumus %s", (v) => {
    expect(csvCell(v).startsWith(`"'`)).toBe(true);
  });
});

describe("rsvpCsv", () => {
  const rows: RsvpRow[] = [
    {
      nama: "Budi, S.T.",
      status: "hadir",
      jumlah: 2,
      grup: "Keluarga",
      updatedAt: new Date("2027-01-02T03:04:05.000Z"),
    },
    { nama: "=HACK()", status: "tidak", jumlah: 0, grup: null, updatedAt: new Date("2027-01-02T03:04:05.000Z") },
  ];
  it("diawali BOM dan memakai label bahasa Indonesia", () => {
    const csv = rsvpCsv(rows);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toContain('"Budi, S.T.","Keluarga","Hadir","2"');
    expect(csv).toContain('"Tidak hadir"');
  });
  it("tidak membiarkan rumus lolos", () => {
    expect(rsvpCsv(rows)).toContain(`"'=HACK()"`);
  });
  it("statusLabel", () => {
    expect(statusLabel("ragu")).toBe("Ragu");
  });
});
