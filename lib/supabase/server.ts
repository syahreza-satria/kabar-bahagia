import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireEnv, supabaseUrl } from "@/lib/env";

/** Klien Supabase berbasis cookie (untuk auth admin). */
export async function createSupabaseServer() {
  const store = await cookies();
  return createServerClient(supabaseUrl(), requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // dipanggil dari Server Component; refresh sesi ditangani proxy
        }
      },
    },
  });
}
