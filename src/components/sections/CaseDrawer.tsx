"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Img from "../ui/Img";
import ArchFlow from "./ArchFlow";
import AgentReplay from "./AgentReplay";
import TechLogo, { normalize, BRAND, CONCEPT } from "../ui/TechLogo";
import { useScroll } from "@/lib/scroll";
import type { Project } from "@/lib/data";

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

/** Case-study side panel: a modal dialog with focus trap, Esc to close and focus return. */
export default function CaseDrawer({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const { lock, unlock } = useScroll();
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    if (!project) return;
    opener.current = document.activeElement;
    lock();
    const first = panel.current?.querySelector<HTMLElement>("[data-close]");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const els = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!els.length) return;
      const a = els[0];
      const z = els[els.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      unlock();
      (opener.current as HTMLElement | null)?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  if (!project || typeof document === "undefined") return null;
  const p = project;

  return createPortal(
    <div className="cd" role="presentation">
      <style>{`
        .cd{position:fixed;inset:0;z-index:200;display:flex;justify-content:flex-end}
        .cd-bg{position:absolute;inset:0;background:rgba(12,17,22,.45);animation:cd-fade .4s var(--ease)}
        .cd-panel{position:relative;width:min(720px,100vw);height:100%;overflow-y:auto;overscroll-behavior:contain;background:var(--paper);box-shadow:-30px 0 80px -30px rgba(12,17,22,.4);padding:clamp(22px,3.4vw,44px);animation:cd-in .6s var(--ease);color:var(--ink)}
        .cd-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}
        .cd-kick{font-family:var(--mono-f);font-size:12px;letter-spacing:.04em;color:var(--mute-text)}
        .cd-panel h2{margin-top:10px;font-weight:700;font-size:clamp(30px,4vw,52px);letter-spacing:-.045em;line-height:1}
        .cd-x{flex:none;width:44px;height:44px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(12,17,22,.3);display:grid;place-items:center;font-size:20px;transition:background .3s var(--ease),color .3s var(--ease)}
        .cd-x:hover{background:var(--ink);color:#fff}
        .cd-sec{margin-top:clamp(26px,4vh,40px)}
        .cd-sec h3{font-family:var(--mono-f);font-weight:400;font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--mute-text);margin-bottom:12px}
        .cd-prob{font-family:var(--serif);font-style:italic;font-size:clamp(22px,2.4vw,30px);line-height:1.2;letter-spacing:-.01em}
        .cd-ol{list-style:none;margin:0;padding:0;display:grid;gap:10px;counter-reset:s}
        .cd-ol li{position:relative;padding-left:38px;font-size:15.5px;line-height:1.5;color:var(--ink-2);counter-increment:s}
        .cd-ol li::before{content:counter(s);position:absolute;left:0;top:1px;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-family:var(--mono-f);font-size:11.5px;background:#fff;box-shadow:inset 0 0 0 1px var(--line)}
        .cd-res{display:grid;gap:10px}
        .cd-res li{list-style:none;padding:16px 18px;border-radius:16px;background:var(--ink);color:#fff;font-weight:600;font-size:clamp(17px,1.8vw,21px);letter-spacing:-.03em;line-height:1.25}
        .cd-arch{padding:20px;border-radius:18px;background:#fff;box-shadow:inset 0 0 0 1px var(--line)}
        .cd-tech{display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:0;list-style:none}
        .cd-tech li{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px 0 9px;border-radius:999px;font-size:12.5px;font-weight:500;background:#fff;box-shadow:inset 0 0 0 1px var(--line)}
        .cd-tech li.nolg{padding-left:12px}
        .cd-shots{display:grid;gap:22px}
        .cd-shots figure{margin:0}
        .cd-frame{border-radius:14px;overflow:hidden;background:#0d1117;box-shadow:0 18px 40px -22px rgba(12,17,22,.55),inset 0 0 0 1px rgba(12,17,22,.25)}
        .cd-bar{display:flex;gap:6px;padding:9px 12px;background:#161b22}
        .cd-bar i{width:9px;height:9px;border-radius:50%;background:#30363d}
        .cd-frame img{display:block;width:100%;height:auto}
        .cd-shots figcaption{margin-top:10px;font-size:13.5px;line-height:1.45;color:var(--mute-text)}
        .cd-act{margin-top:clamp(26px,4vh,40px);display:flex;gap:10px;flex-wrap:wrap}
        @keyframes cd-fade{from{opacity:0}}
        @keyframes cd-in{from{transform:translateX(40px);opacity:0}}
        @media (prefers-reduced-motion:reduce){.cd-bg,.cd-panel{animation:none}}
      `}</style>
      <div className="cd-bg" onClick={onClose} />
      <div className="cd-panel" ref={panel} role="dialog" aria-modal="true" aria-labelledby="cd-title" data-lenis-prevent>
        <div className="cd-top">
          <div>
            <p className="cd-kick">
              Case study · {p.index} · {p.kicker}
            </p>
            <h2 id="cd-title">{p.title}</h2>
          </div>
          <button type="button" className="cd-x" data-close onClick={onClose} aria-label="Close case study">
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <section className="cd-sec">
          <h3>The problem</h3>
          <p className="cd-prob">{p.problem}</p>
        </section>

        <section className="cd-sec">
          <h3>What I built</h3>
          <ol className="cd-ol">
            {p.approach.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ol>
        </section>

        <section className="cd-sec">
          <h3>How it fits together</h3>
          <div className="cd-arch">
            <ArchFlow flow={p.flow} support={p.support} />
          </div>
        </section>

        {p.replay && (
          <section className="cd-sec">
            <h3>Watch it run</h3>
            <AgentReplay replay={p.replay} />
          </section>
        )}

        {p.shots && (
          <section className="cd-sec">
            <h3>The real app</h3>
            <div className="cd-shots">
              {p.shots.map((sh) => (
                <figure key={sh.src}>
                  <div className="cd-frame">
                    <div className="cd-bar" aria-hidden="true">
                      <i /><i /><i />
                    </div>
                    <a href={sh.src} target="_blank" rel="noopener noreferrer" aria-label="Open this screenshot full size">
                      <Img src={sh.src} alt={sh.alt} width={sh.w} height={sh.h} loading="lazy" />
                    </a>
                  </div>
                  <figcaption>{sh.caption} Click the image to view it full size.</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <section className="cd-sec">
          <h3>Result</h3>
          <ul className="cd-res" style={{ margin: 0, padding: 0 }}>
            {p.result.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <section className="cd-sec">
          <h3>Stack</h3>
          <ul className="cd-tech">
            {p.tech.map((t) => {
              const k = normalize(t);
              const has = k in BRAND || k in CONCEPT;
              return (
                <li key={t} className={has ? undefined : "nolg"}>
                  {has && <TechLogo name={t} size={16} />}
                  {t}
                </li>
              );
            })}
          </ul>
        </section>

        <div className="cd-act">
          {p.private && (
            <span className="btn btn-ghost" style={{ cursor: "default" }}>
              Private project
            </span>
          )}
          {p.live && (
            <a className="btn btn-primary" href={p.live} target="_blank" rel="noopener noreferrer">
              Live demo <span aria-hidden="true">↗</span>
            </a>
          )}
          {p.github && (
            <a className="btn btn-ghost" href={p.github} target="_blank" rel="noopener noreferrer">
              View on GitHub <span aria-hidden="true">↗</span>
            </a>
          )}
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Back to projects
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
