"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

/**
 * Efek scroll GSAP, aktif setelah undangan dibuka. Tema cukup memberi atribut:
 *  - data-fx="parallax"  elemen dekoratif bergeser lebih lambat dari scroll
 *  - data-fx="line"      garis yang memanjang saat masuk layar
 *  - data-fx="drift"     elemen berputar pelan mengikuti scroll
 */
export function ScrollFx({ active, rootSelector }: { active: boolean; rootSelector: string }) {
  useEffect(() => {
    if (!active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const root = document.querySelector(rootSelector);
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-fx='parallax']").forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: 25 },
          {
            yPercent: -25,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: 0.6 },
          },
        );
      });
      gsap.utils.toArray<HTMLElement>("[data-fx='drift']").forEach((el) => {
        gsap.to(el, {
          rotate: 90,
          ease: "none",
          scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: 1 },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-fx='line']").forEach((el) => {
        gsap.from(el, {
          scaleX: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });
    }, root);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [active, rootSelector]);

  return null;
}
