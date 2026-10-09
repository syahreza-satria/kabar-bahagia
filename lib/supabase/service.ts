import { createClient } from "@supabase/supabase-js";

/** Klien service-role: hanya untuk server (upload/hapus media). Jangan diimpor di client. */
export function createSupabaseService() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

export const MEDIA_BUCKET = process.env.SUPABASE_MEDIA_BUCKET ?? "media";
