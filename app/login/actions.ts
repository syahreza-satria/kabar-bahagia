"use server";

import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function login(_prev: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email dan kata sandi wajib diisi" };

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error("[login] Supabase auth error:", error.status, error.code, error.message);
    // 400 invalid_credentials = email/sandi salah; selain itu biasanya masalah konfigurasi/akun
    if (error.code === "invalid_credentials") return { error: "Email atau kata sandi salah" };
    if (error.code === "email_not_confirmed")
      return { error: "Email belum dikonfirmasi di Supabase (centang Auto Confirm User)" };
    return { error: `Gagal masuk: ${error.message}` };
  }

  // akun Supabase saja tidak cukup: harus terdaftar di tabel admins
  if (!(await getAdmin())) {
    await supabase.auth.signOut();
    return { error: "Akun ini bukan admin" };
  }
  redirect("/admin");
}

export async function logout() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}
