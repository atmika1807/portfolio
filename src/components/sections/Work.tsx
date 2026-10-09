"use client";

import { useEffect, useState } from "react";
import SectionHead from "../ui/SectionHead";
import TechLogo, { normalize, BRAND, CONCEPT } from "../ui/TechLogo";
import WorkMini from "./WorkMini";
import CaseDrawer from "./CaseDrawer";
import AskPortfolio from "./AskPortfolio";
import { PROJECTS } from "@/lib/data";
import { OPEN_CASE } from "../CommandPalette";

const canHover = () =>
  typeof window !== "undefined" && window.matchMedia("(min-width: 861px) and (hover: hover)").matches;

export default function Work() {
  const [open, setOpen] = useState(0);
  const [caseId, setCaseId] = useState<string | null>(null);
  const activeCase = PROJECTS.find((p) => p.id === caseId) ?? null;

  // the quick-jump menu opens a project's case study through this event
  useEffect(() => {
    const on = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      const i = PROJECTS.findIndex((p) => p.id === id);
      if (i >= 0) {
        setOpen(i);
        setCaseId(id);
      }
    };
    window.addEventListener(OPEN_CASE, on);
    return () => window.removeEventListener(OPEN_CASE, on);
  }, []);

  return (
    <section id="work" className="section work" aria-labelledby="work-title">
      <style>{`
        .acc{display:flex;gap:12px;height:min(82svh,660px)}
        .pn{position:relative;flex:1 1 0;min-width:0;overflow:hidden;border-radius:26px;background:#fff;box-shadow:inset 0 0 0 1px var(--line);transition:flex-grow .8s var(--ease),box-shadow .6s var(--ease)}
        .pn.is-open{flex-grow:8;box-shadow:inset 0 0 0 1px var(--line),0 30px 80px -34px rgba(12,17,22,.28)}
        .pn-head{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:22px 0;width:100%;text-align:center;transition:opacity .4s var(--ease)}
        .pn.is-open .pn-head{opacity:0;pointer-events:none}
        .pn-num{font-family:var(--mono-f);font-size:12px;color:var(--mute-text)}
        .pn-vt{writing-mode:vertical-rl;transform:rotate(180deg);font-weight:700;font-size:clamp(18px,1.7vw,24px);letter-spacing:-.035em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-height:70%}
        .pn-plus{width:36px;height:36px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(12,17,22,.25);display:grid;place-items:center;font-size:20px;line-height:1;transition:transform .6s var(--ease),background .4s var(--ease),color .4s var(--ease)}
        .pn:hover .pn-plus,.pn-head:focus-visible .pn-plus{transform:rotate(90deg);background:var(--ink);color:#fff}
        .pn-body{position:absolute;inset:0;min-width:640px;padding:clamp(24px,2.6vw,40px);display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:clamp(20px,2.4vw,36px);opacity:0;pointer-events:none;transition:opacity .35s var(--ease)}
        .pn.is-open .pn-body{opacity:1;pointer-events:auto;transition:opacity .6s var(--ease) .3s}
        .pn-l{display:flex;flex-direction:column;gap:14px;min-width:0;overflow:auto}
        .pn-kick{font-family:var(--mono-f);font-size:12px;letter-spacing:.04em;color:var(--mute-text)}
        .pn-l h3{font-weight:700;font-size:clamp(26px,2.9vw,42px);letter-spacing:-.045em;line-height:1}
        .pn-l p.d{color:var(--ink-2);font-size:15.5px;line-height:1.55}
        .feat{display:grid;grid-template-columns:1fr 1fr;gap:8px 18px}
        .feat li{position:relative;padding-left:16px;font-size:13.5px;line-height:1.35}
        .feat li::before{content:"";position:absolute;left:0;top:.5em;width:6px;height:6px;border-radius:50%;background:var(--ink)}
        .tech{display:flex;flex-wrap:wrap;gap:6px}
        .tech li{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px 0 9px;border-radius:999px;font-size:12.5px;font-weight:500;background:var(--paper);box-shadow:inset 0 0 0 1px var(--line)}
        .tech li.nolg{padding-left:12px}
        .pn-act{display:flex;flex-wrap:wrap;gap:10px;margin-top:auto;position:sticky;bottom:0;padding-top:10px;background:linear-gradient(to top,#fff 70%,rgba(255,255,255,0))}
        .pn-l .btn{height:44px}
        .pn-priv{display:inline-flex;align-items:center;height:44px;padding:0 18px;border-radius:999px;font-size:14px;font-weight:600;color:var(--mute-text);box-shadow:inset 0 0 0 1px var(--line);background:var(--paper)}
        .ui-wrap{clip-path:inset(0 100% 0 0);min-width:0}
        .pn.is-open .ui-wrap{clip-path:inset(0 0 0 0);transition:clip-path 1s var(--ease) .35s}
        .mu{position:relative;height:100%;border-radius:20px;background:var(--paper);box-shadow:inset 0 0 0 1px var(--line);padding:46px 18px 18px;overflow:hidden}
        .mu-label{position:absolute;top:14px;left:18px;font-family:var(--mono-f);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--mute-text)}
        .mu-col{display:flex;flex-direction:column;gap:12px}
        .mu-row{display:flex;align-items:center;gap:10px}
        .mu-node{padding:6px 12px;border-radius:999px;background:#fff;box-shadow:inset 0 0 0 1px rgba(12,17,22,.3);font-size:11px;font-weight:600;white-space:nowrap}
        .mu-line{flex:1;height:1px;background:rgba(12,17,22,.3);margin:0 4px}
        .mu-item{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:14px;background:#fff;box-shadow:inset 0 0 0 1px var(--line)}
        .mu-dot{width:26px;height:26px;border-radius:50%;background:var(--soft);flex:none}
        .mu-pill{width:38px;height:18px;border-radius:999px;background:var(--soft)}
        .mu-cap{font-family:var(--mono-f);font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--mute-text)}
        .mu-bubble{display:flex;flex-direction:column;gap:8px;padding:14px;border-radius:16px;background:var(--soft);position:relative}
        .mu-caret{width:2px;height:14px;background:var(--ink);animation:blink 1s steps(2) infinite}
        @keyframes blink{50%{opacity:0}}
        .mu-chip{padding:5px 11px;border-radius:999px;background:#fff;box-shadow:inset 0 0 0 1px var(--line);font-size:11px;font-weight:500}
        @media (max-width:1100px){
          .pn-body{grid-template-columns:1fr}
          .ui-wrap{display:none}
        }
        @media (max-width:860px){
          .acc{flex-direction:column;height:auto;gap:10px}
          .pn{flex:none}
          .pn-head{position:relative;inset:auto;flex-direction:row;padding:0 20px;height:72px;justify-content:flex-start;gap:16px;text-align:left}
          .pn.is-open .pn-head{opacity:1;pointer-events:auto}
          .pn-vt{writing-mode:horizontal-tb;transform:none;font-size:18px;flex:1;max-height:none}
          .pn.is-open .pn-plus{transform:rotate(45deg);background:var(--ink);color:#fff}
          .pn:hover .pn-plus{transform:none;background:transparent;color:inherit}
          .pn.is-open:hover .pn-plus{transform:rotate(45deg);background:var(--ink);color:#fff}
          .pn-wrap{display:grid;grid-template-rows:0fr;transition:grid-template-rows .8s var(--ease)}
          .pn.is-open .pn-wrap{grid-template-rows:1fr}
          .pn-wrap>div{overflow:hidden;min-height:0}
          .pn-body{position:relative;inset:auto;min-width:0;opacity:1;pointer-events:auto;padding:4px 20px 24px;grid-template-columns:1fr}
          .pn-l{overflow:visible}
          .feat{grid-template-columns:1fr}
          .ui-wrap{display:block;height:230px;clip-path:inset(0 0 0 0)}
        }
        @media (prefers-reduced-motion: reduce){
          .mu-caret{animation:none}
        }
      `}</style>
      <div className="wrap">
        <SectionHead index="03" label="Work" id="work-title">
          <span className="rv-mask">
            <span>
              Selected <em>systems.</em>
            </span>
          </span>
        </SectionHead>

        <ul className="acc rv" aria-label="Projects">
          {PROJECTS.map((p, i) => {
            const isOpen = open === i;
            return (
              <li
                key={p.id}
                className={`pn${isOpen ? " is-open" : ""}`}
                onMouseEnter={() => canHover() && setOpen(i)}
              >
                <button
                  type="button"
                  className="pn-head"
                  aria-expanded={isOpen}
                  aria-controls={`pn-${p.id}`}
                  onClick={() => setOpen(i)}
                  onFocus={() => setOpen(i)}
                >
                  <span className="pn-num">{p.index}</span>
                  <span className="pn-vt">{p.title}</span>
                  <span className="pn-plus" aria-hidden="true">
                    +
                  </span>
                </button>
                <div className="pn-wrap" id={`pn-${p.id}`} role="region" aria-label={p.title}>
                  <div>
                    <div className="pn-body">
                      <div className="pn-l">
                        <p className="pn-kick">
                          {p.index} · {i < 3 ? "Featured · " : ""}{p.kicker}
                        </p>
                        <h3>{p.title}</h3>
                        <p className="d">{p.description}</p>
                        <ul className="feat">
                          {p.features.map((f) => (
                            <li key={f}>{f}</li>
                          ))}
                        </ul>
                        <ul className="tech" aria-label="Technologies">
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
                        <div className="pn-act">
                          <button type="button" className="btn btn-primary" tabIndex={isOpen ? 0 : -1} onClick={() => setCaseId(p.id)}>
                            Case study <span aria-hidden="true">→</span>
                          </button>
                        {p.live && (
                          <a className="btn btn-primary" href={p.live} target="_blank" rel="noopener noreferrer" tabIndex={isOpen ? 0 : -1}>
                            Live demo <span aria-hidden="true">↗</span>
                          </a>
                        )}
                        {p.private && <span className="pn-priv">Private project</span>}
                        {p.github && (
                          <a
                            className="btn btn-ghost"
                            href={p.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            tabIndex={isOpen ? 0 : -1}
                          >
                            GitHub <span aria-hidden="true">↗</span>
                          </a>
                        )}
                        </div>
                      </div>
                      <div className="ui-wrap">
                        <WorkMini id={p.id} />
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <AskPortfolio onOpenCase={setCaseId} />
      </div>
      <CaseDrawer project={activeCase} onClose={() => setCaseId(null)} />
    </section>
  );
}
