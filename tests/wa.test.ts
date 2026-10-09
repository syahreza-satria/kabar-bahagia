import { describe, expect, it } from "vitest";
import { DEFAULT_WA_TEMPLATE, renderTemplate, waLink } from "@/lib/wa";

describe("waLink", () => {
  it("membuat link wa.me dengan pesan ter-encode", () => {
    expect(waLink("628123456789", "Halo & selamat")).toBe("https://wa.me/628123456789?text=Halo%20%26%20selamat");
  });
  it("tanpa nomor: pengguna memilih kontak sendiri", () => {
    expect(waLink("", "Hai")).toBe("https://wa.me/?text=Hai");
  });
});

describe("renderTemplate", () => {
  it("mengganti {nama} dan {link} di semua kemunculan", () => {
    const out = renderTemplate("Yth {nama}, buka {link}. Sekali lagi {nama}.", {
      nama: "Budi",
      link: "https://x.test/rina?to=abc",
    });
    expect(out).toBe("Yth Budi, buka https://x.test/rina?to=abc. Sekali lagi Budi.");
  });
  it("template bawaan memuat kedua penanda", () => {
    expect(DEFAULT_WA_TEMPLATE).toContain("{nama}");
    expect(DEFAULT_WA_TEMPLATE).toContain("{link}");
  });
});
