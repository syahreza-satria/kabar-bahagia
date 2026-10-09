import { describe, expect, it } from "vitest";
import { EXPIRY_DAYS, computeExpiry, formatDateLong, formatTime, isoToLocalInput, localInputToIso } from "@/lib/dates";

describe("konversi zona waktu Indonesia", () => {
  it("WIB = UTC+7, WITA = UTC+8, WIT = UTC+9", () => {
    expect(localInputToIso("2027-03-20T09:00", "WIB")).toBe("2027-03-20T02:00:00.000Z");
    expect(localInputToIso("2027-03-20T09:00", "WITA")).toBe("2027-03-20T01:00:00.000Z");
    expect(localInputToIso("2027-03-20T09:00", "WIT")).toBe("2027-03-20T00:00:00.000Z");
  });

  it("bolak-balik tanpa mengubah nilai", () => {
    for (const tz of ["WIB", "WITA", "WIT"] as const) {
      const local = "2027-12-31T23:30";
      expect(isoToLocalInput(localInputToIso(local, tz), tz)).toBe(local);
    }
  });

  it("melewati pergantian hari dengan benar", () => {
    expect(localInputToIso("2027-01-01T03:00", "WIB")).toBe("2026-12-31T20:00:00.000Z");
  });
});

describe("format tanggal & jam (id-ID)", () => {
  it("memakai zona waktu acara", () => {
    const iso = "2027-03-20T02:00:00.000Z";
    expect(formatTime(iso, "WIB")).toBe("09:00");
    expect(formatTime(iso, "WIT")).toBe("11:00");
    expect(formatDateLong(iso, "WIB")).toContain("Maret 2027");
  });
});

describe("computeExpiry", () => {
  it("= waktu paling akhir + 14 hari", () => {
    const expiry = computeExpiry(
      ["2027-03-20T08:00:00.000Z", null],
      ["2027-03-20T02:00:00.000Z", "2027-03-21T05:00:00.000Z"],
    );
    expect(expiry?.toISOString()).toBe(
      new Date(Date.parse("2027-03-21T05:00:00.000Z") + EXPIRY_DAYS * 86_400_000).toISOString(),
    );
  });
  it("null bila tidak ada acara", () => {
    expect(computeExpiry([], [])).toBeNull();
  });
});
