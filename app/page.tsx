import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">KabarBahagia</h1>
      <p className="mt-3 max-w-md text-neutral-600">Layanan undangan pernikahan digital.</p>
      <Link href="/admin" className="mt-8 text-sm underline underline-offset-4">
        Masuk panel admin
      </Link>
    </main>
  );
}
