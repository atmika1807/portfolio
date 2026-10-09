"use client";

import { Fragment, useMemo, useState } from "react";
import { searchSkill, SKILL_NAMES } from "@/lib/skillSearch";
import { OPEN_CASE } from "../CommandPalette";
import { scrollToTarget } from "@/lib/scroll";

const SUGGEST = ["Python", "Kafka", "RAG", "FastAPI", "LangGraph", "Azure", "PostgreSQL", "Airflow"];

/** Splits text around the query so the match can be marked. */
function Marked({ text, q }: { text: string; q: string }) {
  const term = q.trim();
  if (term.length < 2) return <>{text}</>;
  const re = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>{i % 2 === 1 ? <mark>{p}</mark> : p}</Fragment>
      ))}
    </>
  );
}

/** Recruiter skill search under the hero: type a skill, see where it was used and the evidence. */
export default function SkillSearch() {
  const [q, setQ] = useState("");
  const res = useMemo(() => searchSkill(q), [q]);
  const typed = q.trim().length >= 2;
  const hints = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 1) return [];
    return SKILL_NAMES.filter((n) => n.toLowerCase().includes(t) && n.toLowerCase() !== t).slice(0, 5);
  }, [q]);

  return (
    <section id="find" className="find" aria-labelledby="find-title">
      <style>{`
        .find{padding-block:clamp(40px,7vh,72px);background:#fff;border-block:1px solid var(--line)}
        .find-top{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.5fr);gap:clamp(20px,4vw,64px);align-items:end}
        .find h2{font-family:var(--serif);font-style:italic;font-weight:400;font-size:clamp(34px,4.4vw,64px);line-height:1.02;letter-spacing:-.015em}
        .find-sub{margin-top:10px;font-size:14.5px;line-height:1.5;color:var(--mute-text);max-width:38ch}
        .find-box{display:flex;align-items:center;gap:12px;height:62px;padding:0 22px;border-radius:999px;background:var(--paper);border:1px solid var(--line);transition:border-color .3s var(--ease),background .3s var(--ease)}
        .find-box:focus-within{border-color:var(--ink);background:#fff}
        .find-box svg{flex:none;color:var(--mute-text)}
        .find-box input{flex:1;min-width:0;height:100%;font:inherit;font-size:18px;color:var(--ink);background:transparent;border:0;outline:0}
        .find-box button{flex:none;font-size:13px;font-weight:600;color:var(--mute-text);padding:6px 10px;border-radius:999px}
        .find-box button:hover{background:var(--soft)}
        .find-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;align-items:center}
        .find-chips span.l{font-family:var(--mono-f);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--mute-text);margin-right:2px}
        .find-chips button{padding:7px 14px;border-radius:999px;font-size:13.5px;font-weight:500;box-shadow:inset 0 0 0 1px rgba(12,17,22,.22);transition:background .3s var(--ease),color .3s var(--ease)}
        .find-chips button:hover,.find-chips button:focus-visible{background:var(--ink);color:#fff}
        .find-out{margin-top:clamp(22px,3vw,34px)}
        .find-sum{padding:18px 20px;border-radius:18px;background:var(--ink);color:#fff;font-size:clamp(15.5px,1.5vw,18px);line-height:1.5;font-weight:500;letter-spacing:-.01em}
        .find-sum b{font-weight:700}
        .find-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:12px}
        .find-card{padding:18px 20px;border-radius:18px;background:var(--paper);border:1px solid var(--line);display:flex;flex-direction:column;gap:8px;min-width:0}
        .find-k{font-family:var(--mono-f);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--mute-text)}
        .find-card h3{font-weight:700;font-size:clamp(17px,1.6vw,20px);letter-spacing:-.03em;line-height:1.15}
        .find-card p{font-size:14.5px;line-height:1.5;color:var(--ink-2)}
        .find-card ul{margin:0;padding:0;list-style:none;display:grid;gap:8px}
        .find-card li{font-size:14.5px;line-height:1.5;color:var(--ink-2)}
        .find-card mark{background:#d9e0e6;color:var(--ink);border-radius:4px;padding:0 3px}
        .find-act{margin-top:auto;align-self:flex-start;padding:7px 14px;border-radius:999px;font-size:13px;font-weight:600;box-shadow:inset 0 0 0 1px rgba(12,17,22,.28);transition:background .3s var(--ease),color .3s var(--ease)}
        .find-act:hover,.find-act:focus-visible{background:var(--ink);color:#fff}
        .find-wide{grid-column:1/-1}
        .find-tags{display:flex;flex-wrap:wrap;gap:6px}
        .find-tags span{padding:4px 11px;border-radius:999px;background:#fff;box-shadow:inset 0 0 0 1px var(--line);font-size:12.5px;font-weight:500}
        .find-none{padding:20px;border-radius:18px;background:var(--paper);border:1px solid var(--line);font-size:15px;color:var(--ink-2)}
        @media (max-width:860px){.find-top{grid-template-columns:minmax(0,1fr)}.find-grid{grid-template-columns:minmax(0,1fr)}.find-box{height:56px}}
      `}</style>
      <div className="wrap">
        <div className="find-top">
          <div>
            <p className="tag rv">Quick search</p>
            <h2 id="find-title" className="rv">
              Search my work by <em>skill.</em>
            </h2>
            <p className="find-sub rv">Type a skill or tool to see where I&rsquo;ve used it, with the evidence.</p>
          </div>
          <div>
            <div className="find-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                aria-label="Search a skill, for example Kafka or RAG"
                placeholder="Try Kafka, RAG, FastAPI, Azure…"
                value={q}
                maxLength={40}
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => setQ(e.target.value)}
              />
              {q && (
                <button type="button" onClick={() => setQ("")} aria-label="Clear search">
                  Clear
                </button>
              )}
            </div>
            <div className="find-chips">
              <span className="l">{hints.length ? "Did you mean" : "Popular"}</span>
              {(hints.length ? hints : SUGGEST).map((s) => (
                <button key={s} type="button" onClick={() => setQ(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="find-out" aria-live="polite">
          {typed && res.total === 0 && res.listed && (
            <p className="find-sum">
              <b>{res.summary.split(":")[0]}:</b>
              {res.summary.slice(res.summary.indexOf(":") + 1)}
            </p>
          )}
          {typed && res.total === 0 && !res.listed && (
            <p className="find-none">
              I couldn&rsquo;t find &ldquo;{q.trim()}&rdquo; in my work. Try one of the popular skills above, or ask the question in{" "}
              <a href="#ask" style={{ textDecoration: "underline" }} onClick={(e) => { e.preventDefault(); scrollToTarget("#ask"); }}>
                Ask my portfolio
              </a>
              .
            </p>
          )}
          {typed && res.total > 0 && (
            <>
              <p className="find-sum">
                <b>{res.summary.split(":")[0]}:</b>
                {res.summary.slice(res.summary.indexOf(":") + 1)}
              </p>
              <div className="find-grid">
                {res.projects.map((h) => (
                  <article key={h.project.id} className="find-card">
                    <p className="find-k">Project · {h.inStack ? "in the stack" : "mentioned"}</p>
                    <h3>{h.project.title}</h3>
                    <p>
                      <Marked text={h.line} q={res.query} />
                    </p>
                    <button
                      type="button"
                      className="find-act"
                      onClick={() => {
                        scrollToTarget("#work");
                        window.setTimeout(() => window.dispatchEvent(new CustomEvent(OPEN_CASE, { detail: h.project.id })), 450);
                      }}
                    >
                      Open case study →
                    </button>
                  </article>
                ))}
                {res.roles.map((r) => (
                  <article key={r.place + r.year} className="find-card">
                    <p className="find-k">Role · {r.year}</p>
                    <h3>
                      {r.title}, {r.place.split(",")[0]}
                    </h3>
                    <ul>
                      {r.bullets.map((b) => (
                        <li key={b}>
                          <Marked text={b} q={res.query} />
                        </li>
                      ))}
                    </ul>
                    <button type="button" className="find-act" onClick={() => scrollToTarget("#experience")}>
                      See experience →
                    </button>
                  </article>
                ))}
                {res.achievements.length > 0 && (
                  <article className="find-card">
                    <p className="find-k">Results</p>
                    <ul>
                      {res.achievements.map((a) => (
                        <li key={a.label}>
                          <b>{a.label}</b>, {a.text}
                        </li>
                      ))}
                    </ul>
                  </article>
                )}
                {res.certs.length > 0 && (
                  <article className="find-card find-wide">
                    <p className="find-k">Certifications</p>
                    <div className="find-tags">
                      {res.certs.map((c) => (
                        <span key={c.title}>
                          {c.title} · {c.issuer}
                        </span>
                      ))}
                    </div>
                  </article>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
