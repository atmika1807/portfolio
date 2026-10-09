"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** True when the visitor asked for reduced motion. Server render assumes motion is fine. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(QUERY).matches;
}

/** Reports whether an element is in view. `once` keeps it true after the first time. */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  options: IntersectionObserverInit & { once?: boolean } = {},
): boolean {
  const [inView, setInView] = useState(false);
  const { once = false, root = null, rootMargin, threshold } = options;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { root, rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, once, root, rootMargin, threshold]);
  return inView;
}

/**
 * Progress (0 to 1) of scrolling through an element: 0 when its top reaches the
 * middle of the viewport, 1 when its bottom does. Updated in a rAF loop only while
 * the element is near the viewport.
 */
export function useScrollProgress<T extends HTMLElement>(
  ref: RefObject<T | null>,
  mode: "through" | "pinned" = "through",
): number {
  const [p, setP] = useState(0);
  const last = useRef(-1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let near = true;
    const io = new IntersectionObserver(
      ([e]) => {
        near = e.isIntersecting;
        if (near) tick();
      },
      { rootMargin: "100% 0px 100% 0px" },
    );
    io.observe(el);
    const compute = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      let v: number;
      if (mode === "pinned") {
        v = -r.top / Math.max(1, r.height - vh);
      } else {
        v = (vh * 0.5 - r.top) / Math.max(1, r.height);
      }
      v = Math.min(1, Math.max(0, v));
      if (Math.abs(v - last.current) > 0.0005) {
        last.current = v;
        setP(v);
      }
    };
    function tick() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        compute();
        if (near) tick();
      });
    }
    tick();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [ref, mode]);
  return p;
}

/** Stable callback ref helper for measuring. */
export function useLatest<T>(value: T) {
  const r = useRef(value);
  useEffect(() => {
    r.current = value;
  });
  return useCallback(() => r.current, []);
}
