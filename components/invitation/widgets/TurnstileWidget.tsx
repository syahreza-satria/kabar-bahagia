"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; callback: (t: string) => void }) => string;
      reset: (id?: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** Tidak menampilkan apa pun bila site key belum diatur. */
export function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);

  useEffect(() => {
    if (!SITE_KEY) return;
    const tryRender = () => {
      if (rendered.current || !ref.current || !window.turnstile) return;
      rendered.current = true;
      window.turnstile.render(ref.current, { sitekey: SITE_KEY, callback: onToken });
    };
    tryRender();
    const id = setInterval(tryRender, 300);
    return () => clearInterval(id);
  }, [onToken]);

  if (!SITE_KEY) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
      <div ref={ref} />
    </>
  );
}
