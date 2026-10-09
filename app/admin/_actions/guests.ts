"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { generateGuestCode } from "@/lib/ids";
import { normalizePhone } from "@/lib/text";
import { assertUuid, firstIssue, type ActionResult } from "./guard";

const MAX_IMPORT_ROWS = 1000;

const GuestInput = z.object({
  nama: z.string().trim().min(1, "Nama wajib diisi").max(100),
  grup: z.string().trim().max(60).default(""),
  noWhatsapp: z.string().trim().max(30).default(""),
  maxPax: z.coerce.number().int().min(1).max(20).default(2),
});

export async function addGuest(invitationId: string, raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  assertUuid(invitationId);
  const p = GuestInput.safeParse(raw);
  if (!p.success) return { ok: false, error: firstIssue(p.error) };
  await getDb()
    .insert(schema.guests)
    .values({
      invitationId,
      kode: generateGuestCode(),
      nama: p.data.nama,
      grup: p.data.grup,
      noWhatsapp: normalizePhone(p.data.noWhatsapp),
      maxPax: p.data.maxPax,
    });
  return { ok: true };
}

export async function updateGuest(invitationId: string, guestId: string, raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  assertUuid(invitationId, guestId);
  const p = GuestInput.safeParse(raw);
  if (!p.success) return { ok: false, error: firstIssue(p.error) };
  await getDb()
    .update(schema.guests)
    .set({
      nama: p.data.nama,
      grup: p.data.grup,
      noWhatsapp: normalizePhone(p.data.noWhatsapp),
      maxPax: p.data.maxPax,
    })
    .where(and(eq(schema.guests.id, guestId), eq(schema.guests.invitationId, invitationId)));
  return { ok: true };
}

export async function deleteGuest(invitationId: string, guestId: string) {
  await requireAdmin();
  assertUuid(invitationId, guestId);
  await getDb()
    .delete(schema.guests)
    .where(and(eq(schema.guests.id, guestId), eq(schema.guests.invitationId, invitationId)));
}

/**
 * Impor massal dari tempelan Excel/CSV. Kolom: nama, grup, no whatsapp, max pax.
 * Pemisah: tab (tempel dari Excel), koma, atau titik koma.
 */
export async function importGuests(
  invitationId: string,
  text: string,
): Promise<ActionResult & { added?: number; skipped?: number }> {
  await requireAdmin();
  assertUuid(invitationId);
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const rows: (typeof schema.guests.$inferInsert)[] = [];
  const usedCodes = new Set<string>();
  let skipped = 0;

  for (const [i, line] of lines.entries()) {
    const cells = line.split(line.includes("\t") ? "\t" : /[;,]/).map((c) => c.trim());
    if (i === 0 && /^nama$/i.test(cells[0])) continue; // baris header
    const parsed = GuestInput.safeParse({
      nama: cells[0] ?? "",
      grup: cells[1] ?? "",
      noWhatsapp: cells[2] ?? "",
      maxPax: cells[3] || 2,
    });
    if (!parsed.success) {
      skipped++;
      continue;
    }
    let kode = generateGuestCode();
    while (usedCodes.has(kode)) kode = generateGuestCode();
    usedCodes.add(kode);
    rows.push({
      invitationId,
      kode,
      nama: parsed.data.nama,
      grup: parsed.data.grup,
      noWhatsapp: normalizePhone(parsed.data.noWhatsapp),
      maxPax: parsed.data.maxPax,
    });
  }
  if (!rows.length) return { ok: false, error: "Tidak ada baris yang valid" };
  if (rows.length > MAX_IMPORT_ROWS) return { ok: false, error: `Maksimal ${MAX_IMPORT_ROWS} tamu sekali impor` };
  await getDb().insert(schema.guests).values(rows);
  return { ok: true, added: rows.length, skipped };
}

export async function markGuestSent(invitationId: string, guestId: string, sent: boolean) {
  await requireAdmin();
  assertUuid(invitationId, guestId);
  await getDb()
    .update(schema.guests)
    .set({ sentAt: sent ? new Date() : null })
    .where(and(eq(schema.guests.id, guestId), eq(schema.guests.invitationId, invitationId)));
}
