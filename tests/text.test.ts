import { describe, expect, it } from "vitest";
import { RESERVED_SLUGS, isUuid, normalizePhone, slugify, youtubeId } from "@/lib/text";

describe("slugify", () => {
  it("mengubah nama menjadi slug URL", () => {
    expect(slugify("Rina & Dimas")).toBe("rina-dimas");
    expect(slugify("  Pernikahan  Ayu!!  ")).toBe("pernikahan-ayu");
  });
  it("menghapus aksen dan membatasi panjang", () => {
    expect(slugify("Café Évian")).toBe("cafe-evian");
    expect(slugify("a".repeat(100))).toHaveLength(60);
  });
});

describe("normalizePhone", () => {
  it.each([
    ["08123456789", "628123456789"],
    ["+62 812-3456-789", "628123456789"],
    ["628123456789", "628123456789"],
    ["8123456789", "628123456789"],
    ["", ""],
    ["abc", ""],
  ])("%s -> %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });
});

describe("youtubeId", () => {
  it("membaca berbagai bentuk URL", () => {
    expect(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://example.com/video")).toBeNull();
  });
});

describe("isUuid", () => {
  it("menerima UUID dan menolak yang lain", () => {
    expect(isUuid("0364a085-f6fe-4483-86cd-e9e7a1b2c3d4")).toBe(true);
    expect(isUuid("../../etc/passwd")).toBe(false);
    expect(isUuid("")).toBe(false);
    expect(isUuid("0364a085f6fe448386cde9e7a1b2c3d4")).toBe(false);
  });
});

describe("RESERVED_SLUGS", () => {
  it("melindungi rute aplikasi", () => {
    for (const s of ["admin", "api", "login", "r", "demo", "preview"]) expect(RESERVED_SLUGS.has(s)).toBe(true);
  });
});
