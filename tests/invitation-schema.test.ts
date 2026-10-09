import { describe, expect, it } from "vitest";
import {
  CONTENT_SCHEMA,
  SECTION_CODES,
  SECTION_CONFIG_SCHEMA,
  defaultSectionConfig,
  emptyContent,
} from "@/types/invitation";

describe("defaultSectionConfig", () => {
  it("memuat semua section dengan urutan tetap dan valid", () => {
    const cfg = defaultSectionConfig();
    expect(cfg.map((s) => s.code)).toEqual([...SECTION_CODES]);
    expect(SECTION_CONFIG_SCHEMA.safeParse(cfg).success).toBe(true);
  });
  it("cover aktif; love story & live streaming opsional (mati secara bawaan)", () => {
    const byCode = Object.fromEntries(defaultSectionConfig().map((s) => [s.code, s.enabled]));
    expect(byCode.cover).toBe(true);
    expect(byCode.lovestory).toBe(false);
    expect(byCode.live).toBe(false);
  });
});

describe("CONTENT_SCHEMA", () => {
  it("emptyContent valid dan terisi nilai bawaan", () => {
    const c = emptyContent();
    expect(c.opening.greeting).toContain("Assalamu");
    expect(c.loveStory).toEqual([]);
  });
  it("menolak nama panggilan kosong", () => {
    const base = emptyContent();
    const bad = { ...base, bride: { ...base.bride, nickname: "" } };
    expect(CONTENT_SCHEMA.safeParse(bad).success).toBe(false);
  });
  it("memangkas spasi di tepi", () => {
    const base = emptyContent();
    const parsed = CONTENT_SCHEMA.parse({ ...base, bride: { ...base.bride, nickname: "  Rina  " } });
    expect(parsed.bride.nickname).toBe("Rina");
  });
});
