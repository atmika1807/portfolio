"use client";

import { useMemo, useState } from "react";
import SectionHead from "../ui/SectionHead";
import TechLogo, { BRAND, CONCEPT, isBrand } from "../ui/TechLogo";
import { FAMILIES, PROJECTS, SKILL_GROUPS, type Skill } from "@/lib/data";

const COLS_DESKTOP = 8;
const COLS_MOBILE = 4;

export default function Skills() {
  const all = useMemo(() => SKILL_GROUPS.flatMap((g) => g.skills), []);
  const [family, setFamily] = useState<string>("All");
  const [active, setActive] = useState<Skill>(all[0]);

  const projectTitle = (id: string) => PROJECTS.find((p) => p.id === id)?.title ?? id;
  const brand = isBrand(active.icon) ? BRAND[active.icon] : null;
  const concept = CONCEPT[active.icon];

  return (
    <section id="skills" className="section skills" aria-labelledby="skills-title">
      <style>{`
        .skills-layout{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:32px;align-items:start}
        .chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:22px}
        .chip{height:38px;padding:0 16px;border-radius:999px;font-size:14px;font-weight:500;box-shadow:inset 0 0 0 1px rgba(12,17,22,.2);transition:background .4s var(--ease),color .4s var(--ease)}
        .chip:hover{background:rgba(12,17,22,.06)}
        .chip[aria-pressed="true"]{background:var(--ink);color:#fff;box-shadow:none}
        .ptable{display:grid;grid-template-columns:repeat(${COLS_DESKTOP},minmax(0,1fr));gap:10px}
        .tile{display:block;aspect-ratio:1/1;text-align:left;border-radius:16px;
          transition:opacity .9s var(--ease) calc((var(--r8) + var(--c8)) * 40ms),transform .9s var(--ease) calc((var(--r8) + var(--c8)) * 40ms)}
        .tile.rv{transition-delay:calc((var(--r8) + var(--c8)) * 40ms)}
        .t-in{position:relative;height:100%;display:flex;flex-direction:column;justify-content:space-between;padding:10px 11px 11px;border-radius:16px;background:#fff;box-shadow:inset 0 0 0 1px var(--line);transition:transform .5s var(--ease),box-shadow .5s var(--ease),opacity .5s var(--ease),background .5s var(--ease)}
        .tile:hover .t-in,.tile:focus-visible .t-in,.tile[aria-pressed="true"] .t-in{transform:translateY(-4px);box-shadow:inset 0 0 0 1px rgba(12,17,22,.5),0 18px 36px -18px rgba(12,17,22,.4)}
        .t-in.is-dim{opacity:.2}
        .t-n{font-family:var(--mono-f);font-size:11px;color:var(--mute-text)}
        .t-s{font-weight:700;font-size:clamp(22px,2.6vw,34px);letter-spacing:-.05em;line-height:1}
        .t-name{font-size:11px;font-weight:500;line-height:1.15;letter-spacing:-.01em;overflow-wrap:anywhere}
        .insp{position:sticky;top:96px;padding:28px 24px 26px;min-height:360px;display:flex;flex-direction:column;gap:14px}
        .insp-logo{position:relative;height:190px;display:grid;place-items:center}
        .insp-glow{position:absolute;inset:0;border-radius:50%;filter:blur(24px);opacity:.28;transform:scale(.8)}
        .insp-logo>*:not(.insp-glow){position:relative;animation:pop .6s var(--ease)}
        @keyframes pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
        .insp h3{font-size:26px;font-weight:700;letter-spacing:-.04em;line-height:1.05}
        .insp .fam{font-family:var(--mono-f);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--mute-text)}
        .insp ul{display:flex;flex-wrap:wrap;gap:6px;margin-top:2px}
        .insp li{font-size:12.5px;padding:5px 11px;border-radius:999px;background:var(--paper);box-shadow:inset 0 0 0 1px var(--line)}
        .insp p.none{font-size:13px;color:var(--mute-text)}
        @media (max-width:980px){
          .skills-layout{grid-template-columns:1fr}
          .insp{position:static;min-height:0}
          .ptable{grid-template-columns:repeat(${COLS_MOBILE},minmax(0,1fr));gap:8px}
          .tile,.tile.rv{transition-delay:calc((var(--r4) + var(--c4)) * 40ms)}
          .t-in{padding:8px}
          .t-name{font-size:10px}
        }
      `}</style>
      <div className="wrap">
        <SectionHead index="02" label="Skills" id="skills-title">
          <span className="rv-mask">
            <span>
              My stack,
              <br />
              by <em>element.</em>
            </span>
          </span>
        </SectionHead>

        <div className="chips rv" role="group" aria-label="Filter skills by family">
          {["All", ...FAMILIES].map((f) => (
            <button key={f} type="button" className="chip" aria-pressed={family === f} onClick={() => setFamily(f)}>
              {f}
            </button>
          ))}
        </div>

        <div className="skills-layout">
          <ul className="ptable" aria-label="Skills">
            {all.map((s, i) => {
              const dim = family !== "All" && s.family !== family;
              return (
                <li key={s.name} style={{ display: "contents" }}>
                  <button
                    type="button"
                    className="tile rv"
                    aria-pressed={active.name === s.name}
                    aria-label={`${s.name}, ${s.family}`}
                    onMouseEnter={() => setActive(s)}
                    onFocus={() => setActive(s)}
                    onClick={() => setActive(s)}
                    style={
                      {
                        "--r8": Math.floor(i / COLS_DESKTOP),
                        "--c8": i % COLS_DESKTOP,
                        "--r4": Math.floor(i / COLS_MOBILE),
                        "--c4": i % COLS_MOBILE,
                      } as React.CSSProperties
                    }
                  >
                    <span className={`t-in${dim ? " is-dim" : ""}`}>
                      <span className="t-n">{s.n}</span>
                      <span className="t-s">{s.symbol}</span>
                      <span className="t-name">{s.name}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <aside className="insp card rv" aria-live="polite" aria-label="Skill details">
            <div className="insp-logo" key={active.name}>
              {brand && <span className="insp-glow" style={{ background: brand.tint }} aria-hidden="true" />}
              {brand ? (
                <TechLogo name={active.icon} size={150} />
              ) : (
                <span style={{ width: 150, height: 150, color: "var(--ink)" }} aria-hidden="true">
                  {concept?.icon}
                </span>
              )}
            </div>
            <div>
              <p className="fam">
                {active.n} · {active.symbol} · {active.family}
              </p>
              <h3>{active.name}</h3>
            </div>
            {active.usedIn.length ? (
              <div>
                <p className="fam" style={{ marginBottom: 8 }}>
                  Used in
                </p>
                <ul>
                  {active.usedIn.map((id) => (
                    <li key={id}>{projectTitle(id)}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="none">Listed under {active.family} in my résumé.</p>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
