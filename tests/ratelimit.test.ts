import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clientIp, rateLimit } from "@/lib/ratelimit";

describe("rateLimit", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("menolak setelah melewati batas dalam satu jendela waktu", () => {
    const key = "uji-batas";
    expect(rateLimit(key, 3, 1000)).toBe(true);
    expect(rateLimit(key, 3, 1000)).toBe(true);
    expect(rateLimit(key, 3, 1000)).toBe(true);
    expect(rateLimit(key, 3, 1000)).toBe(false);
  });

  it("jendela bergeser: diizinkan lagi setelah waktu lewat", () => {
    const key = "uji-geser";
    for (let i = 0; i < 2; i++) rateLimit(key, 2, 1000);
    expect(rateLimit(key, 2, 1000)).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(rateLimit(key, 2, 1000)).toBe(true);
  });

  it("kunci berbeda tidak saling memengaruhi", () => {
    rateLimit("a", 1, 1000);
    expect(rateLimit("a", 1, 1000)).toBe(false);
    expect(rateLimit("b", 1, 1000)).toBe(true);
  });
});

describe("clientIp", () => {
  it("mengambil alamat pertama dari X-Forwarded-For", () => {
    const req = new Request("http://x.test", { headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" } });
    expect(clientIp(req)).toBe("1.2.3.4");
  });
  it("unknown bila header tidak ada", () => {
    expect(clientIp(new Request("http://x.test"))).toBe("unknown");
  });
});
