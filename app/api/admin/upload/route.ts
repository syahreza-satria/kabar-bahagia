import { count, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { getDb, schema } from "@/db";
import { getAdmin } from "@/lib/auth";
import { invitationTag } from "@/lib/data";
import { MAX_AUDIO_BYTES, MAX_IMAGE_BYTES, uploadAudio, uploadImage } from "@/lib/storage";

const AUDIO_EXT: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/aac": "aac",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
};

/** Upload media admin: gambar dikompres ke WebP, audio diunggah apa adanya. */
export async function POST(req: Request) {
  if (!(await getAdmin())) return Response.json({ error: "Tidak diizinkan" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const invitationId = String(form?.get("invitationId") ?? "");
  const section = String(form?.get("section") ?? "galeri");
  if (!(file instanceof File) || !invitationId) return Response.json({ error: "Berkas tidak valid" }, { status: 400 });

  const db = getDb();
  const [inv] = await db
    .select({ id: schema.invitations.id, slug: schema.invitations.slug })
    .from(schema.invitations)
    .where(eq(schema.invitations.id, invitationId))
    .limit(1);
  if (!inv) return Response.json({ error: "Undangan tidak ditemukan" }, { status: 404 });

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    let uploaded: { path: string; url: string };
    let tipe: "foto" | "audio";

    if (file.type.startsWith("image/")) {
      if (file.size > MAX_IMAGE_BYTES) return Response.json({ error: "Gambar maksimal 12 MB" }, { status: 400 });
      uploaded = await uploadImage(inv.id, buf);
      tipe = "foto";
    } else if (AUDIO_EXT[file.type]) {
      if (file.size > MAX_AUDIO_BYTES) return Response.json({ error: "Audio maksimal 10 MB" }, { status: 400 });
      uploaded = await uploadAudio(inv.id, buf, AUDIO_EXT[file.type], file.type);
      tipe = "audio";
    } else {
      return Response.json({ error: "Format berkas tidak didukung" }, { status: 400 });
    }

    const [{ total }] = await db
      .select({ total: count() })
      .from(schema.media)
      .where(eq(schema.media.invitationId, inv.id));

    const [row] = await db
      .insert(schema.media)
      .values({ invitationId: inv.id, tipe, url: uploaded.url, storagePath: uploaded.path, urutan: total, section })
      .returning();

    revalidateTag(invitationTag(inv.slug), { expire: 0 });
    return Response.json({ id: row.id, url: row.url, tipe, urutan: row.urutan });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Upload gagal" }, { status: 500 });
  }
}
