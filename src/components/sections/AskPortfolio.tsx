"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { search, SUGGESTIONS, type Hit } from "@/lib/ask";
import { scrollToTarget } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/hooks";

type Answer = { q: string; hits: Hit[] };

/** Retrieval demo: ask a question, see the passages found, then the answer typed out with its sources. */
export default function AskPortfolio({ onOpenCase }: { onOpenCase: (projectId: string) => void }) {
  const [value, setValue] = useState("");
  const [ans, setAns] = useState<Answer | null>(null);
  const [shown, setShown] = useState(0);
  const timer = useRef<number | null>(null);
  const abort = useRef<AbortController | null>(null);
  // "ai": a model-written answer is streaming or done. "quote": quoting the best passage instead.
  const [mode, setMode] = useState<"pending" | "ai" | "quote">("pending");
  const [aiText, setAiText] = useState("");
  const [aiDone, setAiDone] = useState(false);

  const quote = ans ? (ans.hits[0] ? ans.hits[0].chunk.text : "") : "";
  const full = mode === "ai" ? aiText : quote;

  useEffect(() => {
    if (timer.current) window.clearInterval(timer.current);
    if (!ans || !full || mode !== "quote") return;
    if (prefersReducedMotion()) {
      setShown(full.length);
      return;
    }
    setShown(0);
    timer.current = window.setInterval(() => {
      setShown((n) => {
        if (n >= full.length && timer.current) {
          window.clearInterval(timer.current);
          return n;
        }
        return n + 3;
      });
    }, 14);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [ans, full, mode]);

  const ask = (q: string) => {
    const query = q.trim();
    if (!query) return;
    setValue(query);
    const hits = search(query);
    setAns({ q: query, hits });
    abort.current?.abort();
    setAiText("");
    setAiDone(false);
    if (!hits.length) return setMode("quote");
    setMode("pending");
    const ctl = new AbortController();
    abort.current = ctl;
    // never leave the visitor waiting: if nothing arrives in 15 s, quote the best passage instead
    let timedOut = false;
    const wait = window.setTimeout(() => {
      timedOut = true;
      ctl.abort();
    }, 15000);
    (async () => {
      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: query }),
          signal: ctl.signal,
        });
        window.clearTimeout(wait);
        if (!res.ok || !res.body) throw new Error(String(res.status));
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let acc = "";
        setMode("ai");
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += dec.decode(value, { stream: true });
          setAiText(acc);
        }
        if (!acc.trim()) throw new Error("empty");
        setAiDone(true);
      } catch (e) {
        window.clearTimeout(wait);
        if ((e as Error).name === "AbortError" && !timedOut) return;
        setMode("quote");
      }
    })();
  };
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(value);
  };
  const open = (h: Hit) => {
    if (h.chunk.project) onOpenCase(h.chunk.project);
    else scrollToTarget(`#${h.chunk.section}`, -40);
  };

  const max = ans?.hits[0]?.score ?? 1;
  const shownText = mode === "ai" ? aiText : full.slice(0, shown);
  const typing = mode === "ai" ? !aiDone : shown < full.length;

  return (
    <div className="ask rv" id="ask">
      <style>{`
        .ask{margin-top:clamp(40px,7vh,72px);display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.4fr);gap:clamp(24px,5vw,72px);align-items:start;background:var(--ink);color:#fff;border-radius:26px;padding:clamp(24px,3.6vw,48px)}
        .ask-tag{font-family:var(--mono-f);font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.7)}
        .ask h3{margin-top:12px;font-family:var(--serif);font-style:italic;font-weight:400;font-size:clamp(32px,3.8vw,54px);line-height:1.04;letter-spacing:-.01em}
        .ask-note{margin-top:14px;font-size:14px;line-height:1.55;color:rgba(255,255,255,.72);max-width:36ch}
        .ask-form{display:flex;gap:8px}
        .ask-form input{flex:1;min-width:0;height:52px;padding:0 18px;border-radius:999px;border:1px solid rgba(255,255,255,.28);background:rgba(255,255,255,.07);color:#fff;font:inherit;font-size:16px}
        .ask-form input::placeholder{color:rgba(255,255,255,.55)}
        .ask-form input:focus-visible{outline:2px solid #fff;outline-offset:2px}
        .ask-form button{flex:none;height:52px;padding:0 22px;border-radius:999px;background:#fff;color:var(--ink);font-weight:600;font-size:15px;transition:transform .4s var(--ease)}
        .ask-form button:hover{transform:translateY(-2px)}
        .ask-form button:focus-visible{outline:2px solid #fff;outline-offset:3px}
        .ask-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
        .ask-chips button{padding:7px 13px;border-radius:999px;border:1px solid rgba(255,255,255,.28);font-size:13px;color:rgba(255,255,255,.88);transition:background .3s var(--ease),color .3s var(--ease)}
        .ask-chips button:hover{background:#fff;color:var(--ink)}
        .ask-chips button:focus-visible{outline:2px solid #fff;outline-offset:2px}
        .ask-out{margin-top:22px;min-height:20px}
        .ask-q{font-family:var(--mono-f);font-size:12px;letter-spacing:.04em;color:rgba(255,255,255,.65)}
        .ask-a{margin-top:10px;font-size:clamp(16px,1.5vw,19px);line-height:1.55;max-width:60ch}
        .ask-a b{display:block;font-weight:600;letter-spacing:-.02em;margin-bottom:6px}
        .ask-caret{display:inline-block;width:2px;height:1em;background:#fff;vertical-align:-.15em;margin-left:2px;animation:ask-b 1s steps(2) infinite}
        @keyframes ask-b{50%{opacity:0}}
        .ask-src{margin-top:18px;display:grid;gap:8px;list-style:none;padding:0}
        .ask-src-h{font-family:var(--mono-f);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.65)}
        .ask-src button{width:100%;text-align:left;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 14px;align-items:center;padding:12px 14px;border-radius:14px;border:1px solid rgba(255,255,255,.22);transition:background .3s var(--ease)}
        .ask-src button:hover{background:rgba(255,255,255,.1)}
        .ask-src button:focus-visible{outline:2px solid #fff;outline-offset:2px}
        .ask-src span.t{font-weight:600;font-size:14.5px;letter-spacing:-.02em}
        .ask-src span.go{font-size:12px;color:rgba(255,255,255,.75);white-space:nowrap}
        .ask-bar{grid-column:1/-1;height:3px;border-radius:3px;background:rgba(255,255,255,.18);overflow:hidden}
        .ask-bar i{display:block;height:100%;background:#fff;border-radius:3px}
        .ask-none a{text-decoration:underline;text-underline-offset:3px}
        @media (max-width:860px){.ask{grid-template-columns:minmax(0,1fr)}}
        @media (prefers-reduced-motion:reduce){.ask-caret{animation:none}}
      `}</style>
      <div>
        <p className="ask-tag">Try it · live retrieval</p>
        <h3 id="ask-title">Ask my portfolio.</h3>
        <p className="ask-note">
          Type a question about my work. It finds the matching passages on this site, then Claude writes the answer from only those
          passages and shows its sources. If the AI is busy, it quotes the closest passage instead.
        </p>
      </div>
      <div>
        <form className="ask-form" onSubmit={onSubmit} role="search" aria-labelledby="ask-title">
          <input
            type="text"
            aria-label="Ask a question about Atmika's work"
            placeholder="e.g. What have you built with Kafka?"
            value={value}
            maxLength={140}
            onChange={(e) => setValue(e.target.value)}
          />
          <button type="submit">Ask</button>
        </form>
        <div className="ask-chips">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => ask(s)}>
              {s}
            </button>
          ))}
        </div>

        <div className="ask-out" aria-live="polite">
          {ans && ans.hits.length > 0 && (
            <>
              <p className="ask-q">Q · {ans.q}</p>
              <p className="ask-a">
                <b>{mode === "ai" ? "Answer · written by Claude from the sources below" : mode === "quote" ? `Closest match · ${ans.hits[0].chunk.title}` : "Searching…"}</b>
                <span className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                  {mode === "pending" || (mode === "ai" && !aiDone) ? "" : full}
                </span>
                <span aria-hidden="true">
                  {shownText}
                  {(typing || mode === "pending") && <span className="ask-caret" />}
                </span>
              </p>
              <p className="ask-src-h" style={{ marginTop: 18 }}>
                Sources found ({ans.hits.length})
              </p>
              <ul className="ask-src" style={{ marginTop: 8 }}>
                {ans.hits.map((h) => (
                  <li key={h.chunk.id}>
                    <button type="button" onClick={() => open(h)}>
                      <span className="t">{h.chunk.title}</span>
                      <span className="go">{h.chunk.project ? "Open case study →" : `Go to ${h.chunk.section} →`}</span>
                      <span className="ask-bar" aria-hidden="true">
                        <i style={{ width: `${Math.max(12, Math.round((h.score / max) * 100))}%` }} />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {ans && ans.hits.length === 0 && (
            <p className="ask-a ask-none">
              I couldn&rsquo;t find that on this site. Try asking about a project, a skill, my experience, or availability, or{" "}
              <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToTarget("#contact"); }}>
                send me a message
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
