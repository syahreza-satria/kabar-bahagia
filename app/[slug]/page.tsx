import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { InvitationView } from "@/components/invitation/InvitationView";
import { getAdmin } from "@/lib/auth";
import { getInvitationBySlug } from "@/lib/data";
import { formatDateShort, RESERVED_SLUGS } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = RESERVED_SLUGS.has(slug) ? null : await getInvitationBySlug(slug);
  const robots = { index: false, follow: false };
  if (!data) return { title: "Undangan", robots };

  const { bride, groom } = data.content;
  const names = `${groom.nickname} & ${bride.nickname}`;
  const main = data.events[0];
  const title = `Undangan Pernikahan ${names}`;
  const description = main
    ? `Kami mengundang Anda pada pernikahan ${names}, ${formatDateShort(main.startsAt, main.timezone)}.`
    : `Kami mengundang Anda pada pernikahan ${names}.`;

  return {
    title,
    description,
    robots,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "id_ID",
      // tanpa gambar kustom, file opengraph-image.tsx dipakai otomatis
      ...(data.ogImageUrl ? { images: [{ url: data.ogImageUrl, width: 1200, height: 630 }] } : {}),
    },
  };
}

function Splash() {
  return <div className="flex min-h-dvh items-center justify-center bg-[#faf7f2] text-sm text-neutral-500">Memuat undangan…</div>;
}

/** Undangan draft hanya bisa dibuka admin. */
async function DraftGate({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  if (!admin) notFound();
  return <>{children}</>;
}

async function InvitationLoader({
  params,
  searchParams,
}: Pick<PageProps<"/[slug]">, "params" | "searchParams">) {
  const { slug } = await params;
  if (RESERVED_SLUGS.has(slug)) notFound();
  const data = await getInvitationBySlug(slug);
  if (!data) notFound();

  if (data.status === "arsip") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-[#faf7f2] px-6 text-center text-[#2b2a28]">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Undangan Pernikahan</p>
        <h1 className="mt-3 text-3xl font-semibold">
          {data.content.groom.nickname} &amp; {data.content.bride.nickname}
        </h1>
        <p className="mt-6 max-w-sm text-neutral-600">
          Acara telah selesai dan undangan ini sudah diarsipkan. Terima kasih atas doa dan kehadiran Anda.
        </p>
      </main>
    );
  }

  const view = <InvitationView data={data} searchParams={searchParams} />;
  if (data.status === "draft") {
    return (
      <Suspense fallback={<Splash />}>
        <DraftGate>{view}</DraftGate>
      </Suspense>
    );
  }
  return view;
}

export default function InvitationPage(props: PageProps<"/[slug]">) {
  return (
    <Suspense fallback={<Splash />}>
      <InvitationLoader params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}
