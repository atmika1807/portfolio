"use client";

import { useEffect, useRef, useState } from "react";
import TechLogo, { BRAND, CONCEPT } from "../ui/TechLogo";
import { ACHIEVEMENTS, type Achievement } from "@/lib/data";
import { prefersReducedMotion, useInView, useScrollProgress } from "@/lib/hooks";

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

/** Counts up from 0 the first time the card is seen (easeOutQuart over 1.4 s). */
function Counter({ a, go }: { a: Achievement; go: boolean }) {
  const [v, setV] = useState(a.plain ? a.value : 0);
  const done = useRef(false);
  useEffect(() => {
    if (!go || done.current) return;
    done.current = true;
    if (a.plain || prefersReducedMotion()) {
      setV(a.value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1400);
      setV(Math.round(easeOutQuart(p) * a.value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [go, a]);
  return (
    <span>
      <span className="sr-only">
        {a.prefix}
        {a.value}
        {a.suffix}
      </span>
      <span aria-hidden="true">
        {a.prefix}
        {a.plain ? a.value : v}
        {a.suffix}
      </span>
    </span>
  );
}

function Card({ a, i, near }: { a: Achievement; i: number; near: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const seen = useInView(ref, { once: true, threshold: 0.35 });
  const brand = BRAND[a.icon];
  const total = String(ACHIEVEMENTS.length).padStart(2, "0");
  return (
    <li ref={ref} className={`ach-card${near ? " is-near" : ""}`} data-card>
      <div className="ach-top">
        <span className="ach-logo">
          {brand && <span className="ach-glow" style={{ background: brand.tint }} aria-hidden="true" />}
          {brand || CONCEPT[a.icon] ? (
            <TechLogo name={a.icon} size={40} />
          ) : null}
        </span>
        <span className="ach-idx">
          {String(i + 1).padStart(2, "0")} / {total}
        </span>
      </div>
      <div className="ach-bot">
        <div className="ach-txt">
          <p className="ach-label">{a.label}</p>
          <p className="ach-cap">{a.caption}</p>
          <p className="ach-det">{a.detail}</p>
        </div>
        <p className="ach-num">
          <Counter a={a} go={seen} />
        </p>
      </div>
    </li>
  );
}

export default function Achievements() {
  const outer = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [travel, setTravel] = useState(0);
  const [near, setNear] = useState(0);
  const p = useScrollProgress(outer, "pinned");

  // horizontal travel = track width minus the viewport
  useEffect(() => {
    const measure = () => {
      const t = track.current;
      if (!t) return;
      setTravel(Math.max(0, Math.round(t.scrollWidth - window.innerWidth)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // the card nearest the viewport centre lifts
  useEffect(() => {
    const t = track.current;
    if (!t) return;
    const cx = window.innerWidth / 2;
    let best = 0;
    let bestD = Infinity;
    t.querySelectorAll<HTMLElement>("[data-card]").forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - cx);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setNear(best);
  }, [p]);

  return (
    <section
      id="achievements"
      ref={outer}
      className="ach"
      aria-labelledby="ach-title"
      style={{ height: `calc(100svh + ${travel}px)` }}
    >
      <style>{`
        .ach{position:relative}
        .ach-pin{position:sticky;top:0;height:100svh;overflow:hidden;display:flex;flex-direction:column;justify-content:center;gap:clamp(20px,5vh,48px);padding-top:72px}
        .ach-head{display:flex;flex-direction:column;gap:14px}
        .ach-head .tag{margin-bottom:6px}
        .ach-head .h2{font-size:clamp(36px,5vw,76px)}
        .ach-bar{height:2px;background:var(--line);border-radius:2px;overflow:hidden;max-width:420px}
        .ach-bar>div{height:100%;background:var(--ink);transform-origin:0 50%}
        .ach-track{display:flex;gap:20px;width:max-content;padding:16px max(var(--gutter),calc((100vw - 1320px) / 2)) 28px;will-change:transform}
        .ach-card{position:relative;flex:none;width:clamp(340px,40vw,540px);height:clamp(260px,36vh,310px);padding:22px 24px 22px;border-radius:28px;background:#fff;box-shadow:inset 0 0 0 1px var(--line),0 10px 30px -22px rgba(12,17,22,.2);display:flex;flex-direction:column;justify-content:space-between;transition:transform .7s var(--ease),box-shadow .7s var(--ease)}
        .ach-card.is-near{transform:translateY(-12px);box-shadow:inset 0 0 0 1px var(--line),0 40px 70px -30px rgba(12,17,22,.34)}
        .ach-top{display:flex;justify-content:space-between;align-items:flex-start}
        .ach-logo{position:relative;width:72px;height:72px;border-radius:20px;background:#fff;box-shadow:inset 0 0 0 1px var(--line);display:grid;place-items:center;color:var(--ink);transition:box-shadow .7s var(--ease)}
        .ach-glow{position:absolute;inset:6px;border-radius:50%;filter:blur(14px);opacity:.18;transition:opacity .7s var(--ease)}
        .ach-card.is-near .ach-glow{opacity:.45}
        .ach-logo>*:not(.ach-glow){position:relative}
        .ach-idx{font-family:var(--mono-f);font-size:12px;color:var(--mute-text);letter-spacing:.04em}
        .ach-bot{display:flex;justify-content:space-between;align-items:flex-end;gap:12px}
        .ach-txt{min-width:0;flex:1}
        .ach-label{font-family:var(--mono-f);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--mute-text)}
        .ach-cap{margin-top:6px;font-weight:700;font-size:clamp(17px,1.6vw,22px);letter-spacing:-.035em;line-height:1.1}
        .ach-det{margin-top:6px;font-size:12.5px;line-height:1.4;color:var(--mute-text)}
        .ach-num{font-weight:700;font-size:clamp(54px,7.2vw,104px);letter-spacing:-.06em;line-height:.85;font-variant-numeric:tabular-nums;white-space:nowrap}
        .ach-end{flex:none;align-self:center;padding:0 clamp(24px,5vw,80px) 0 28px;font-family:var(--serif);font-style:italic;font-size:clamp(30px,4vw,56px);color:var(--mute);white-space:nowrap;letter-spacing:-.02em}
        @media (max-width:560px){
          .ach-card{padding:18px}
          .ach-det{display:none}
          .ach-txt{flex:1.2}
        }
      `}</style>
      <div className="ach-pin">
        <div className="wrap ach-head">
          <p className="tag rv">06 — Achievements</p>
          <h2 className="h2" id="ach-title">
            <span className="rv-mask">
              <span>
                Results, <em>quantified.</em>
              </span>
            </span>
          </h2>
          <div className="ach-bar" role="progressbar" aria-label="Gallery progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p * 100)}>
            <div style={{ transform: `scaleX(${p})` }} />
          </div>
        </div>
        <ul className="ach-track" ref={track} style={{ transform: `translate3d(${-p * travel}px,0,0)` }} aria-label="Achievements">
          {ACHIEVEMENTS.map((a, i) => (
            <Card key={a.label} a={a} i={i} near={near === i} />
          ))}
          <li className="ach-end" aria-hidden="true">
            more to come →
          </li>
        </ul>
      </div>
    </section>
  );
}
