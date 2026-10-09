"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Ambient, type AmbientKind } from "./Ambient";
import { ScrollFx } from "./ScrollFx";

type ShellContext = { open: () => void };
const Ctx = createContext<ShellContext>({ open: () => {} });

/** Tombol "Buka Undangan" yang dipakai komponen Cover tema. */
export function OpenButton({ children, className }: { children: ReactNode; className?: string }) {
  const { open } = useContext(Ctx);
  return (
    <button type="button" onClick={open} className={className ?? "inv-btn inv-btn-solid"}>
      {children}
    </button>
  );
}

export type NavItem = { code: string; label: string };

/** Label ringkas supaya dock muat di layar sempit. */
const SHORT_LABEL: Record<string, string> = { lovestory: "Cerita", amplop: "Amplop", live: "Live", mempelai: "Mempelai" };

/** Progress bar tipis di atas layar yang mengikuti scroll. */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-40 mx-auto h-[3px] max-w-[480px] origin-left bg-inv-primary"
      style={{ scaleX }}
    />
  );
}

/** Dock navigasi di bawah: lompat ke section dan menandai section yang sedang terlihat. */
function SectionDock({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState<string | null>(null);
  const barRef = useRef<HTMLElement>(null);

  // jaga item aktif tetap terlihat di tengah dock (tanpa menggulir halaman)
  useEffect(() => {
    const bar = barRef.current;
    const btn = active ? bar?.querySelector<HTMLElement>(`[data-code="${active}"]`) : null;
    if (!bar || !btn) return;
    bar.scrollTo({ left: btn.offsetLeft - (bar.clientWidth - btn.clientWidth) / 2, behavior: "smooth" });
  }, [active]);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(`sec-${i.code}`)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id.replace("sec-", ""));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  if (items.length < 2) return null;
  return (
    <motion.nav
      ref={barRef}
      aria-label="Navigasi section"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.9, type: "spring", stiffness: 140, damping: 18 }}
      className="fixed bottom-4 left-1/2 z-40 flex max-w-[calc(min(480px,100vw)-1.5rem)] -translate-x-1/2 gap-1 overflow-x-auto rounded-full border border-inv-line bg-inv-surface/95 p-1 shadow-lg backdrop-blur [scrollbar-width:none] [mask-image:linear-gradient(to_right,transparent,#000_14px,#000_calc(100%-14px),transparent)]"
    >
      {items.map((i) => (
        <button
          key={i.code}
          data-code={i.code}
          type="button"
          onClick={() => document.getElementById(`sec-${i.code}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          aria-current={active === i.code ? "true" : undefined}
          className={`relative min-h-11 shrink-0 rounded-full px-3.5 text-xs transition-colors ${
            active === i.code ? "text-inv-on-primary" : "text-inv-muted hover:text-inv-ink"
          }`}
        >
          {active === i.code && (
            <motion.span layoutId="dock-pill" className="absolute inset-0 rounded-full bg-inv-primary" transition={{ type: "spring", stiffness: 300, damping: 28 }} />
          )}
          <span className="relative">{SHORT_LABEL[i.code] ?? i.label}</span>
        </button>
      ))}
    </motion.nav>
  );
}

export function InvitationShell({
  cover,
  children,
  musicUrl,
  themeVars,
  className,
  ambient,
  nav,
}: {
  cover: ReactNode;
  children: ReactNode;
  musicUrl: string | null;
  themeVars: React.CSSProperties;
  className: string;
  ambient: AmbientKind | null;
  nav: NavItem[];
}) {
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const reduce = useReducedMotion();

  const open = useCallback(() => {
    setOpened(true);
    window.scrollTo({ top: 0 });
    // diputar setelah interaksi pengguna (autoplay diblokir browser)
    audioRef.current
      ?.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = opened ? "" : "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [opened]);

  function toggleMusic() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      a.pause();
      setPlaying(false);
    }
  }

  return (
    <Ctx.Provider value={{ open }}>
      <div style={themeVars} className={`${className} min-h-dvh bg-neutral-200`} data-inv-root>
        <div className="relative mx-auto min-h-dvh w-full max-w-[480px] overflow-x-clip bg-inv-bg text-inv-ink shadow-xl">
          {musicUrl && <audio ref={audioRef} src={musicUrl} loop preload="none" />}

          <div className={opened ? "pb-24" : "h-dvh overflow-hidden"} aria-hidden={!opened} inert={!opened}>
            {children}
          </div>

          <AnimatePresence>
            {!opened && (
              <motion.div
                key="cover"
                className="fixed inset-0 z-50 mx-auto w-full max-w-[480px] overflow-y-auto bg-inv-bg"
                exit={reduce ? { opacity: 0 } : { y: "-100%" }}
                transition={{ duration: reduce ? 0.01 : 0.9, ease: [0.76, 0, 0.24, 1] }}
              >
                {cover}
              </motion.div>
            )}
          </AnimatePresence>

          {opened && (
            <>
              <ScrollProgress />
              {ambient && <Ambient kind={ambient} />}
              <SectionDock items={nav} />
            </>
          )}
          <ScrollFx active={opened} rootSelector="[data-inv-root]" />

          {opened && musicUrl && (
            <button
              type="button"
              onClick={toggleMusic}
              aria-label={playing ? "Jeda musik" : "Putar musik"}
              className="fixed right-[max(1rem,calc(50%-240px+1rem))] top-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-inv-primary bg-inv-surface text-inv-primary shadow-lg"
            >
              <span className={playing && !reduce ? "animate-spin [animation-duration:4s]" : ""} aria-hidden>
                ♪
              </span>
            </button>
          )}
        </div>
      </div>
    </Ctx.Provider>
  );
}
