import Link from "next/link";

const TABS = [
  ["", "Ringkasan"],
  ["/edit", "Data & Tema"],
  ["/media", "Galeri"],
  ["/guests", "Tamu & WhatsApp"],
  ["/rsvp", "RSVP"],
  ["/wishes", "Ucapan"],
] as const;

export function InvitationNav({ id, title, active }: { id: string; title: string; active: string }) {
  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/admin" className="hover:underline">
          Undangan
        </Link>
        <span>/</span>
        <span className="text-zinc-900">{title}</span>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-b border-zinc-200" aria-label="Menu undangan">
        {TABS.map(([path, label]) => (
          <Link
            key={path}
            href={`/admin/${id}${path}`}
            aria-current={active === path ? "page" : undefined}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm ${
              active === path ? "border-zinc-900 font-medium" : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
