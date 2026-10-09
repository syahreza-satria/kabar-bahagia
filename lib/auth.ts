import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb, schema } from "@/db";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function getAdmin() {
  const supabase = await createSupabaseServer();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email;
  if (!email) return null;
  const [admin] = await getDb()
    .select()
    .from(schema.admins)
    .where(eq(schema.admins.email, email.toLowerCase()))
    .limit(1);
  return admin ?? null;
}

/** Cek otorisasi sebenarnya (proxy hanya pemeriksaan optimistis). */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  return admin;
}
