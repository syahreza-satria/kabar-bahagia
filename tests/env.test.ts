import { afterEach, describe, expect, it } from "vitest";
import { databaseUrl, mediaBucket, requireEnv, supabaseUrl } from "@/lib/env";

const original = { ...process.env };
afterEach(() => {
  process.env = { ...original };
});

describe("requireEnv", () => {
  it("melempar pesan yang menyebut nama variabel", () => {
    delete process.env.VARIABEL_UJI;
    expect(() => requireEnv("VARIABEL_UJI")).toThrow(/VARIABEL_UJI/);
  });
  it("mengembalikan nilai yang dipangkas", () => {
    process.env.VARIABEL_UJI = "  nilai  ";
    expect(requireEnv("VARIABEL_UJI")).toBe("nilai");
  });
});

describe("supabaseUrl", () => {
  it("menolak URL yang memuat path (kesalahan umum: /rest/v1/)", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abc.supabase.co/rest/v1/";
    expect(() => supabaseUrl()).toThrow(/path/);
  });
  it("menerima URL proyek biasa", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abc.supabase.co/";
    expect(supabaseUrl()).toBe("https://abc.supabase.co");
  });
  it("menolak nilai yang bukan URL", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "bukan-url";
    expect(() => supabaseUrl()).toThrow(/valid/);
  });
});

describe("databaseUrl", () => {
  it("menolak nilai contoh dari .env.example", () => {
    process.env.DATABASE_URL = "postgresql://postgres:password@host:6543/postgres";
    expect(() => databaseUrl()).toThrow(/contoh/);
  });
  it("menerima connection string nyata", () => {
    process.env.DATABASE_URL = "postgresql://postgres.abc:pw@aws-0-ap.pooler.supabase.com:6543/postgres";
    expect(databaseUrl()).toContain("pooler.supabase.com");
  });
});

describe("mediaBucket", () => {
  it("bawaan: media", () => {
    delete process.env.SUPABASE_MEDIA_BUCKET;
    expect(mediaBucket()).toBe("media");
  });
});
