import "server-only";
import sharp from "sharp";
import { MEDIA_BUCKET, createSupabaseService } from "@/lib/supabase/service";
import { randomId } from "@/lib/utils";

export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
export const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

/** Kompres & resize ke WebP sebelum diunggah ke Supabase Storage. */
export async function uploadImage(invitationId: string, input: Buffer) {
  const output = await sharp(input)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer();
  return putObject(invitationId, output, "webp", "image/webp");
}

export async function uploadAudio(invitationId: string, input: Buffer, ext: string, contentType: string) {
  return putObject(invitationId, input, ext, contentType);
}

async function putObject(invitationId: string, body: Buffer, ext: string, contentType: string) {
  const path = `${invitationId}/${Date.now()}-${randomId(6)}.${ext}`;
  const supabase = createSupabaseService();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, body, {
    contentType,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`Upload gagal: ${error.message}`);
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function deleteObjects(paths: string[]) {
  if (!paths.length) return;
  const { error } = await createSupabaseService().storage.from(MEDIA_BUCKET).remove(paths);
  if (error) throw new Error(`Hapus media gagal: ${error.message}`);
}
