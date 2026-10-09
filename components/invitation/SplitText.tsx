"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";

/** Teks yang muncul huruf demi huruf dengan GSAP. Teks asli tetap tersedia untuk pembaca layar. */
export function SplitText({
  text,
  className,
  delay = 0.3,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "span" | "h1" | "h2" | "p";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll("[data-char]"), {
        yPercent: 120,
        rotateX: -80,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
        stagger: 0.045,
        delay,
      });
    }, el);
    return () => ctx.revert();
  }, [text, delay]);

  const Component = Tag as React.ElementType;
  return (
    <Component ref={ref} className={className} aria-label={text}>
      {text.split(" ").map((word, wi, words) => (
        <span key={wi} aria-hidden className="inline-block whitespace-nowrap">
          {Array.from(word).map((ch, ci) => (
            <span key={ci} className="inline-block overflow-hidden align-bottom">
              <span data-char className="inline-block will-change-transform">
                {ch}
              </span>
            </span>
          ))}
          {wi < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Component>
  );
}
