import { describe, expect, it } from "vitest";
import { generateClientToken, generateGuestCode, randomId } from "@/lib/ids";

describe("pembuat ID", () => {
  it("kode tamu 8 karakter dan token klien 24 karakter", () => {
    expect(generateGuestCode()).toHaveLength(8);
    expect(generateClientToken()).toHaveLength(24);
  });

  it("hanya memakai karakter yang tidak membingungkan (tanpa 0, o, 1, l, i)", () => {
    const sample = Array.from({ length: 200 }, () => randomId(24)).join("");
    expect(sample).toMatch(/^[abcdefghjkmnpqrstuvwxyz23456789]+$/);
  });

  it("tidak bertabrakan pada sampel besar", () => {
    const set = new Set(Array.from({ length: 5000 }, () => generateGuestCode()));
    expect(set.size).toBe(5000);
  });
});
