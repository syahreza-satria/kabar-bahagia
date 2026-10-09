import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DemoSwitcher } from "@/components/invitation/DemoSwitcher";
import { InvitationView } from "@/components/invitation/InvitationView";
import { demoInvitation } from "@/lib/demo-data";
import { themeList } from "@/themes/registry";

export const metadata: Metadata = {
  title: "Demo Tema Undangan",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return themeList.map((t) => ({ themeId: t.id }));
}

async function Demo({ params, searchParams }: Pick<PageProps<"/preview/[themeId]">, "params" | "searchParams">) {
  const { themeId } = await params;
  if (!themeList.some((t) => t.id === themeId)) notFound();
  return (
    <>
      <DemoSwitcher themes={themeList} activeId={themeId} />
      <InvitationView data={demoInvitation(themeId)} searchParams={searchParams} />
    </>
  );
}

export default function PreviewPage(props: PageProps<"/preview/[themeId]">) {
  return (
    <Suspense
      fallback={<div className="flex min-h-dvh items-center justify-center text-sm text-neutral-500">Memuat demo…</div>}
    >
      <Demo params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}
