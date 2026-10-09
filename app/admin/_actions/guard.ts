import { isUuid } from "@/lib/text";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

/** Menolak ID yang bukan UUID sebelum menyentuh database. */
export function assertUuid(...values: string[]) {
  for (const v of values) {
    if (!isUuid(v)) throw new Error("ID tidak valid");
  }
}

/** Pesan galat pertama dari hasil validasi zod. */
export function firstIssue(error: { issues: { message: string }[] }, fallback = "Data tidak valid") {
  return error.issues[0]?.message ?? fallback;
}
