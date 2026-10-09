"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { prefersReducedMotion } from "./hooks";

type Api = {
  scrollTo: (target: string | number, opts?: { offset?: number }) => void;
  lock: () => void;
  unlock: () => void;
};

let current: Lenis | null = null;

/** Smooth-scroll to a selector, element or y offset. Falls back to native scrolling. */
export function scrollToTarget(target: string | number | HTMLElement, offset = 0) {
  if (current) {
    current.scrollTo(target as never, { offset, duration: 1.2 });
    return;
  }
  const reduce = prefersReducedMotion();
  if (typeof target === "number") {
    window.scrollTo({ top: target + offset, behavior: reduce ? "auto" : "smooth" });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  }
}

const Ctx = createContext<Api>({
  scrollTo: (t, o) => scrollToTarget(t, o?.offset ?? 0),
  lock: () => {},
  unlock: () => {},
});

export const useScroll = () => useContext(Ctx);

export function ScrollProvider({ children }: { children: ReactNode }) {
  const lockCount = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    current = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      current = null;
    };
  }, []);

  const api = useMemo<Api>(
    () => ({
      scrollTo: (t, o) => scrollToTarget(t, o?.offset ?? 0),
      lock: () => {
        lockCount.current += 1;
        current?.stop();
        document.documentElement.style.overflow = "hidden";
      },
      unlock: () => {
        lockCount.current = Math.max(0, lockCount.current - 1);
        if (lockCount.current === 0) {
          current?.start();
          document.documentElement.style.overflow = "";
        }
      },
    }),
    [],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
