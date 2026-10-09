"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { NAV, PROFILE } from "@/lib/data";
import { scrollToTarget, useScroll } from "@/lib/scroll";
import { OPEN_PALETTE } from "./CommandPalette";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [ind, setInd] = useState<{ x: number; w: number } | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const { lock, unlock } = useScroll();

  // scroll state + 2px progress bar (no re-render per frame)
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled((s) => (s !== y > 40 ? y > 40 : s));
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // active section: a band across the middle of the viewport
  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        // Certifications has no nav link of its own, so it keeps "Experience" lit
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id === "certifications" ? "experience" : e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    const certs = document.getElementById("certifications");
    if (certs) io.observe(certs);
    const hero = document.getElementById("hero");
    const heroIo = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setActive("");
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    if (hero) heroIo.observe(hero);
    return () => {
      io.disconnect();
      heroIo.disconnect();
    };
  }, []);

  // sliding indicator under the active link
  const measure = useCallback(() => {
    const ul = list.current;
    if (!ul || !active) return setInd(null);
    const a = ul.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (a) setInd({ x: a.offsetLeft, w: a.offsetWidth });
  }, [active]);
  useLayoutEffect(measure, [measure, scrolled]);
  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  // mobile menu: Esc closes, page scroll is locked while open
  useEffect(() => {
    if (!open) return;
    lock();
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const opener = menuBtn.current;
    return () => {
      window.removeEventListener("keydown", onKey);
      unlock();
      opener?.focus({ preventScroll: true });
    };
  }, [open, lock, unlock]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    window.setTimeout(() => scrollToTarget(`#${id}`), open ? 60 : 0);
  };

  return (
    <>
      <style>{`
        .nav-progress{position:fixed;inset:0 0 auto 0;height:2px;z-index:60;background:transparent;pointer-events:none}
        .nav-progress>div{height:100%;background:var(--ink);transform-origin:0 50%;transform:scaleX(0)}
        .nav{position:fixed;inset:0 0 auto 0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px var(--gutter);pointer-events:none}
        .nav>*{pointer-events:auto}
        .nav-brand{display:flex;align-items:center;gap:12px}
        .nav-mark{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-weight:700;font-size:15px;letter-spacing:-.03em;box-shadow:inset 0 0 0 1.5px var(--ink);background:transparent;color:var(--ink);transition:background .5s var(--ease),color .5s var(--ease),transform .9s var(--ease)}
        .nav-mark:hover,.nav-mark:focus-visible{transform:rotate(360deg)}
        .nav.is-scrolled .nav-mark{background:var(--ink);color:var(--paper)}
        .nav-name{font-weight:600;letter-spacing:-.02em;transition:opacity .4s var(--ease),transform .4s var(--ease),visibility .4s}
        .nav.is-scrolled .nav-name{opacity:0;transform:translateX(-8px);visibility:hidden}
        .nav-pill{position:relative;border-radius:999px;padding:5px;transition:background .5s var(--ease),box-shadow .5s var(--ease),backdrop-filter .5s var(--ease)}
        .nav.is-scrolled .nav-pill{background:rgba(255,255,255,.72);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);box-shadow:inset 0 0 0 1px var(--line),0 12px 40px -18px rgba(12,17,22,.25)}
        .nav-pill ul{position:relative;display:flex;gap:2px}
        .nav-ind{position:absolute;top:0;bottom:0;left:0;border-radius:999px;background:var(--ink);transition:transform .6s var(--ease),width .6s var(--ease),opacity .3s}
        .nav-pill a{position:relative;z-index:1;display:block;padding:9px 16px;border-radius:999px;font-size:14px;font-weight:500;letter-spacing:-.01em;transition:color .4s var(--ease)}
        .nav-pill a[aria-current="true"]{color:#fff}
        .nav-right{display:flex;align-items:center;gap:8px}
        .nav-tools{display:flex;align-items:center;gap:8px}
        .nav-ic{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.8);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);box-shadow:inset 0 0 0 1px var(--line);transition:background .4s var(--ease),color .4s var(--ease)}
        .nav-ic:hover,.nav-ic:focus-visible{background:var(--ink);color:#fff}
        .nav-cv{display:inline-flex;align-items:center;gap:6px;height:44px;padding:0 18px;border-radius:999px;background:var(--ink);color:#fff;font-weight:600;font-size:14px;letter-spacing:-.01em;transition:transform .4s var(--ease)}
        .nav-cv:hover,.nav-cv:focus-visible{transform:translateY(-2px)}
        .nav-menu{display:none;height:44px;padding:0 20px;border-radius:999px;font-weight:600;font-size:14px;background:rgba(255,255,255,.8);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);box-shadow:inset 0 0 0 1px var(--line)}
        .overlay{position:fixed;inset:0;z-index:70;background:var(--paper);clip-path:inset(0 0 100% 0);visibility:hidden;transition:clip-path .8s var(--ease),visibility 0s .8s;display:flex;flex-direction:column;padding:16px var(--gutter) 40px}
        .overlay.is-open{clip-path:inset(0 0 0 0);visibility:visible;transition:clip-path .8s var(--ease),visibility 0s}
        .overlay-top{display:flex;justify-content:space-between;align-items:center}
        .overlay ol{margin-top:auto;display:grid;gap:4px}
        .overlay li{overflow:hidden}
        .overlay li a{display:flex;align-items:baseline;gap:16px;padding:6px 0;font-size:clamp(40px,12vw,64px);font-weight:700;letter-spacing:-.045em;line-height:1.05;transform:translateY(110%);transition:transform .8s var(--ease)}
        .overlay.is-open li a{transform:none;transition-delay:calc(.12s + var(--i)*60ms)}
        .overlay li a span{font-family:var(--mono-f);font-size:12px;font-weight:400;letter-spacing:.08em;color:var(--mute-text)}
        @media (max-width:860px){
          .nav-pill{display:none}
          .nav-menu{display:block}
          .nav-name{display:none}
          .nav-tools{display:none}
        }
        @media (max-width:1180px){.nav-name{display:none}}
      `}</style>
      <div className="nav-progress" aria-hidden="true">
        <div ref={bar} />
      </div>
      <header className={`nav${scrolled ? " is-scrolled" : ""}`}>
        <a href="#top" className="nav-brand" aria-label={`${PROFILE.initials} ${PROFILE.name}, back to top`} onClick={go("top")}>
          <span className="nav-mark">{PROFILE.initials}</span>{" "}
          <span className="nav-name">{PROFILE.name}</span>
        </a>
        <div className="nav-right">
        <nav className="nav-pill" aria-label="Primary">
          <ul ref={list}>
            {ind && (
              <li
                aria-hidden="true"
                className="nav-ind"
                style={{ transform: `translateX(${ind.x}px)`, width: ind.w }}
              />
            )}
            {NAV.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  data-id={n.id}
                  aria-current={active === n.id ? "true" : undefined}
                  onClick={go(n.id)}
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav-tools">
          <button type="button" className="nav-ic" aria-label="Quick jump, Ctrl K" title="Quick jump (Ctrl K)" onClick={() => window.dispatchEvent(new CustomEvent(OPEN_PALETTE))}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
          <a className="nav-cv" href={PROFILE.resume} download="Atmika_Manoj_Parey_resume.pdf">
            Résumé <span aria-hidden="true">↓</span>
          </a>
        </div>
        <button
          ref={menuBtn}
          className="nav-menu"
          aria-expanded={open}
          aria-controls="menu-overlay"
          onClick={() => setOpen(true)}
        >
          Menu
        </button>
        </div>
      </header>
      <div
        id="menu-overlay"
        className={`overlay${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
        inert={!open}
      >
        <div className="overlay-top">
          <span className="nav-name">{PROFILE.name}</span>
          <button ref={closeBtn} className="nav-menu" style={{ display: "block" }} onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
        <ol>
          {NAV.map((n, i) => (
            <li key={n.id}>
              <a href={`#${n.id}`} style={{ ["--i" as string]: i }} onClick={go(n.id)}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {n.label}
              </a>
            </li>
          ))}
        </ol>
        <a className="nav-cv" style={{ marginTop: 20, alignSelf: "flex-start" }} href={PROFILE.resume} download="Atmika_Manoj_Parey_resume.pdf">
          Download résumé <span aria-hidden="true">↓</span>
        </a>
      </div>
    </>
  );
}
