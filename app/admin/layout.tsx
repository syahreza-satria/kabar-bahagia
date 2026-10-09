import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../login/actions";

async function AdminFrame({ children }: { children: React.ReactNode }) {
  // sesi login bergantung pada waktu & cookie: hanya boleh dihitung saat ada permintaan
  await connection();
  const admin = await requireAdmin();
  return (
    <>
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="font-semibold">
            KabarBahagia <span className="font-normal text-zinc-500">Admin</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-zinc-500 sm:inline">{admin.nama}</span>
            <form action={logout}>
              <button type="submit" className="adm-btn-ghost">
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </>
  );
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 text-zinc-900">
      <Suspense fallback={<p className="p-6 text-sm text-zinc-500">Memuat…</p>}>
        <AdminFrame>{children}</AdminFrame>
      </Suspense>
    </div>
  );
}
