import "server-only";
import { createClient } from "@supabase/supabase-js";
import { mediaBucket, requireEnv, supabaseUrl } from "@/lib/env";

/** Klien service-role: hanya untuk server (upload/hapus media). Jangan diimpor di client. */
export function createSupabaseService() {
  return createClient(supabaseUrl(), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false },
  });
}

export const MEDIA_BUCKET = mediaBucket();
