import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">KabarBahagia</h1>
      <p className="mt-3 max-w-md text-neutral-600">Layanan undangan pernikahan digital.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/demo" className="inline-flex min-h-11 items-center rounded-md bg-neutral-900 px-5 text-sm font-medium text-white">
          Lihat demo tema
        </Link>
        <Link href="/admin" className="inline-flex min-h-11 items-center rounded-md border border-neutral-300 px-5 text-sm">
          Masuk panel admin
        </Link>
      </div>
    </main>
  );
}
