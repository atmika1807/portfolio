"use client";

import { useEffect, useRef, useState } from "react";
import SectionHead from "../ui/SectionHead";
import { TIMELINE } from "@/lib/data";
import { useScrollProgress } from "@/lib/hooks";

export default function Experience() {
  const list = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(list);
  const [lit, setLit] = useState<boolean[]>(() => TIMELINE.map(() => false));

  // a stop lights up when the spine reaches its dot
  useEffect(() => {
    const ol = list.current;
    if (!ol) return;
    const h = ol.offsetHeight;
    const next = Array.from(ol.querySelectorAll<HTMLElement>("[data-stop]")).map(
      (el) => el.offsetTop + 14 <= progress * h + 1,
    );
    setLit((prev) => (prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next));
  }, [progress]);

  return (
    <section id="experience" className="section exp" aria-labelledby="exp-title">
      <style>{`
        .tl{position:relative;--yc:200px;padding-bottom:8px}
        .stops{display:grid;gap:clamp(36px,6vh,64px)}
        .tl-track,.tl-fill{position:absolute;top:10px;bottom:0;left:calc(var(--yc) + 13px);width:2px;border-radius:2px}
        .tl-track{background:var(--line)}
        .tl-fill{background:var(--ink);transform-origin:50% 0;will-change:transform}
        .stop{position:relative;display:grid;grid-template-columns:var(--yc) 28px minmax(0,1fr);gap:0 28px}
        .stop h3,.stop-place,.stop li{color:var(--mute-text);transition:color .7s var(--ease)}
        .stop h3{color:var(--mute)}
        .stop.is-lit h3{color:var(--ink)}
        .stop.is-lit .stop-place,.stop.is-lit li{color:var(--ink-2)}
        .stop-year{font-family:var(--mono-f);font-size:13px;color:var(--mute-text);padding-top:6px;text-align:right}
        .stop-dot{position:relative;z-index:1;width:28px;height:28px;display:grid;place-items:center}
        .stop-dot::before{content:"";width:14px;height:14px;border-radius:50%;background:var(--paper);box-shadow:inset 0 0 0 2px var(--faint);transition:background .5s var(--ease),box-shadow .5s var(--ease),transform .5s var(--ease)}
        .stop.is-lit .stop-dot::before{background:var(--ink);box-shadow:0 0 0 5px rgba(12,17,22,.1);transform:scale(1.1)}
        .stop-kind{font-family:var(--mono-f);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--mute-text);margin-bottom:6px}
        .stop h3{font-weight:700;font-size:clamp(22px,2.4vw,32px);letter-spacing:-.04em;line-height:1.1}
        .stop-place{margin-top:6px;font-weight:500}
        .stop-place span{color:var(--mute-text);font-weight:400}
        .stop ul{margin-top:14px;display:grid;gap:10px;max-width:72ch}
        .stop li{position:relative;padding-left:18px;font-size:15.5px;line-height:1.55}
        .stop li::before{content:"";position:absolute;left:0;top:.7em;width:8px;height:1px;background:var(--ink)}
        .next{margin-left:calc(var(--yc) + 56px);padding:28px 32px;border-radius:26px;border:1.5px dashed rgba(12,17,22,.3);font-weight:700;font-size:clamp(26px,3vw,40px);letter-spacing:-.045em;line-height:1.1;transition:background .5s var(--ease)}
        .next:hover{background:#fff}
        .next em{font-family:var(--serif);font-style:italic;font-weight:400;color:var(--mute);letter-spacing:-.02em}
        @media (max-width:760px){
          .tl{--yc:0px}
          .tl-track,.tl-fill{left:13px}
          .stop{grid-template-columns:28px minmax(0,1fr);gap:0 16px}
          .stop-year{grid-column:2;grid-row:1;text-align:left;padding:0 0 6px}
          .stop-dot{grid-column:1;grid-row:1 / span 2}
          .stop-main{grid-column:2;grid-row:2}
          .next{margin-left:44px;padding:22px}
        }
      `}</style>
      <div className="wrap">
        <SectionHead index="04" label="Experience" id="exp-title">
          <span className="rv-mask">
            <span>
              The path,
              <br />
              <em>so far.</em>
            </span>
          </span>
        </SectionHead>

        <div className="tl" ref={list}>
          <div className="tl-track" aria-hidden="true" />
          <div className="tl-fill" aria-hidden="true" style={{ transform: `scaleY(${progress})` }} />
          <ol className="stops">
          {TIMELINE.map((t, i) => (
            <li key={`${t.title}-${t.year}`} data-stop className={`stop${lit[i] ? " is-lit" : ""}`}>
              <p className="stop-year">{t.year}</p>
              <span className="stop-dot" aria-hidden="true" />
              <div className="stop-main">
                <p className="stop-kind">{t.kind === "education" ? "Education" : "Experience"}</p>
                <h3>{t.title}</h3>
                <p className="stop-place">
                  {t.place} <span>· {t.where}</span>
                </p>
                {t.detail.length > 0 && (
                  <ul>
                    {t.detail.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
