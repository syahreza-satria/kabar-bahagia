"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

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

export function InvitationShell({
  cover,
  children,
  musicUrl,
  themeVars,
  className,
}: {
  cover: ReactNode;
  children: ReactNode;
  musicUrl: string | null;
  themeVars: React.CSSProperties;
  className: string;
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
      <div style={themeVars} className={`${className} min-h-dvh bg-neutral-200`}>
        <div className="relative mx-auto min-h-dvh w-full max-w-[480px] overflow-x-clip bg-inv-bg text-inv-ink shadow-xl">
          {musicUrl && <audio ref={audioRef} src={musicUrl} loop preload="none" />}

          <div className={opened ? "" : "h-dvh overflow-hidden"} aria-hidden={!opened} inert={!opened}>
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

          {opened && musicUrl && (
            <button
              type="button"
              onClick={toggleMusic}
              aria-label={playing ? "Jeda musik" : "Putar musik"}
              className="fixed bottom-5 right-[max(1.25rem,calc(50%-240px+1.25rem))] z-40 flex h-12 w-12 items-center justify-center rounded-full border border-inv-primary bg-inv-surface text-inv-primary shadow-lg"
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
