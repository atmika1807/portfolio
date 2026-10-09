"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NAV, PROFILE, PROJECTS } from "@/lib/data";
import { scrollToTarget, useScroll } from "@/lib/scroll";

type Item = { id: string; group: string; label: string; hint?: string; keywords: string; run: () => void };

export const OPEN_PALETTE = "open-palette";
export const OPEN_CASE = "open-case";

const jump = (sel: string) => () => window.setTimeout(() => scrollToTarget(sel), 80);

/** Ctrl/Cmd+K quick-jump: sections, projects and common actions in one searchable list. */
export default function CommandPalette() {
  const { lock, unlock } = useScroll();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const opener = useRef<Element | null>(null);

  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];
    for (const n of NAV) out.push({ id: `s-${n.id}`, group: "Go to", label: n.label, keywords: n.id, run: jump(`#${n.id}`) });
    out.push({ id: "s-cert", group: "Go to", label: "Certifications", keywords: "certificates courses forage datacamp", run: jump("#certifications") });
    for (const p of PROJECTS)
      out.push({
        id: `p-${p.id}`,
        group: "Projects",
        label: p.title,
        hint: "Case study",
        keywords: `${p.tech.join(" ")} ${p.kicker} project case study`,
        run: () => {
          scrollToTarget("#work");
          window.setTimeout(() => window.dispatchEvent(new CustomEvent(OPEN_CASE, { detail: p.id })), 450);
        },
      });
    out.push(
      {
        id: "a-ask",
        group: "Actions",
        label: "Ask my portfolio",
        hint: "Try the Q&A",
        keywords: "ask question chat ai rag search",
        run: () => {
          scrollToTarget("#ask");
          window.setTimeout(() => document.querySelector<HTMLInputElement>(".ask-form input")?.focus({ preventScroll: true }), 1300);
        },
      },
      {
        id: "a-find",
        group: "Actions",
        label: "Search my work by skill",
        hint: "Kafka, RAG, Azure…",
        keywords: "search find skill tool technology",
        run: () => {
          scrollToTarget("#find");
          window.setTimeout(() => document.querySelector<HTMLInputElement>(".find-box input")?.focus({ preventScroll: true }), 1300);
        },
      },
      {
        id: "a-resume",
        group: "Actions",
        label: "Download résumé",
        hint: "PDF",
        keywords: "resume cv pdf download",
        run: () => {
          const a = document.createElement("a");
          a.href = PROFILE.resume;
          a.download = "Atmika_Manoj_Parey_resume.pdf";
          document.body.appendChild(a);
          a.click();
          a.remove();
        },
      },
      {
        id: "a-msg",
        group: "Actions",
        label: "Send a message",
        hint: "Contact form",
        keywords: "contact form email message hire",
        run: jump("#cf-name"),
      },
      {
        id: "a-copy",
        group: "Actions",
        label: `Copy email, ${PROFILE.email}`,
        keywords: "copy email address",
        run: () => {
          navigator.clipboard?.writeText(PROFILE.email).catch(() => {});
        },
      },
      { id: "l-gh", group: "Links", label: "GitHub", hint: PROFILE.githubLabel, keywords: "github code repos", run: () => window.open(PROFILE.github, "_blank", "noopener,noreferrer") },
      { id: "l-in", group: "Links", label: "LinkedIn", hint: PROFILE.linkedinLabel, keywords: "linkedin profile", run: () => window.open(PROFILE.linkedin, "_blank", "noopener,noreferrer") },
    );
    return out;
  }, []);

  const shown = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return items;
    return items.filter((it) => {
      const hay = `${it.label} ${it.keywords} ${it.group}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [items, q]);

  const close = () => setOpen(false);
  const pick = (it: Item | undefined) => {
    if (!it) return;
    close();
    it.run();
  };

  // open: Ctrl/Cmd+K anywhere, or the nav button
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE, onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    setQ("");
    setActive(0);
    lock();
    input.current?.focus();
    return () => {
      unlock();
      (opener.current as HTMLElement | null)?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (shown.length ? (a + 1) % shown.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (shown.length ? (a - 1 + shown.length) % shown.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(shown[active]);
    } else if (e.key === "Tab") {
      e.preventDefault();
    }
  };

  if (!open || typeof document === "undefined") return null;

  let lastGroup = "";
  return createPortal(
    <div className="cp" onKeyDown={onKeyDown}>
      <style>{`
        .cp{position:fixed;inset:0;z-index:300;display:flex;justify-content:center;align-items:flex-start;padding:clamp(60px,14vh,140px) 16px 16px}
        .cp-bg{position:absolute;inset:0;background:rgba(12,17,22,.5);animation:cp-fade .25s var(--ease)}
        .cp-box{position:relative;width:min(640px,100%);max-height:min(70vh,560px);display:flex;flex-direction:column;background:#fff;border-radius:20px;box-shadow:0 40px 100px -30px rgba(12,17,22,.55),inset 0 0 0 1px var(--line);overflow:hidden;animation:cp-in .35s var(--ease)}
        .cp-in{display:flex;align-items:center;gap:12px;padding:0 18px;border-bottom:1px solid var(--line)}
        .cp-in svg{flex:none;color:var(--mute-text)}
        .cp-in input{flex:1;min-width:0;height:60px;font:inherit;font-size:17px;color:var(--ink);background:transparent;border:0;outline:0}
        .cp-in kbd{flex:none;font-family:var(--mono-f);font-size:11px;padding:3px 7px;border-radius:6px;box-shadow:inset 0 0 0 1px var(--line);color:var(--mute-text)}
        .cp-list{list-style:none;margin:0;padding:8px;overflow-y:auto;overscroll-behavior:contain}
        .cp-g{padding:12px 12px 6px;font-family:var(--mono-f);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--mute-text)}
        .cp-opt{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 12px;border-radius:12px;cursor:pointer;font-size:15px;font-weight:500;letter-spacing:-.01em}
        .cp-opt .h{font-size:12.5px;font-weight:400;color:var(--mute-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:45%}
        .cp-opt[aria-selected="true"]{background:var(--ink);color:#fff}
        .cp-opt[aria-selected="true"] .h{color:rgba(255,255,255,.72)}
        .cp-empty{padding:28px 18px;text-align:center;color:var(--mute-text);font-size:14.5px}
        .cp-foot{display:flex;gap:16px;flex-wrap:wrap;padding:10px 18px;border-top:1px solid var(--line);font-size:12px;color:var(--mute-text)}
        @keyframes cp-fade{from{opacity:0}}
        @keyframes cp-in{from{opacity:0;transform:translateY(-10px) scale(.985)}}
        @media (prefers-reduced-motion:reduce){.cp-bg,.cp-box{animation:none}}
      `}</style>
      <div className="cp-bg" onClick={close} />
      <div className="cp-box" role="dialog" aria-modal="true" aria-label="Quick jump">
        <div className="cp-in">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={input}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="cp-list"
            aria-activedescendant={shown[active] ? `cp-${shown[active].id}` : undefined}
            aria-label="Search sections, projects and actions"
            placeholder="Jump to a section, project or action"
            autoComplete="off"
            spellCheck={false}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <kbd aria-hidden="true">Esc</kbd>
        </div>
        <ul className="cp-list" id="cp-list" role="listbox" ref={list} aria-label="Results">
          {shown.length === 0 && (
            <li className="cp-empty" role="presentation">
              Nothing matches &ldquo;{q}&rdquo;. Try &ldquo;kafka&rdquo;, &ldquo;resume&rdquo; or &ldquo;contact&rdquo;.
            </li>
          )}
          {shown.map((it, i) => {
            const head = it.group !== lastGroup ? it.group : null;
            lastGroup = it.group;
            return (
              <li key={it.id} role="presentation">
                {head && <div className="cp-g" role="presentation">{head}</div>}
                <div
                  id={`cp-${it.id}`}
                  data-i={i}
                  role="option"
                  aria-selected={i === active}
                  className="cp-opt"
                  onMouseMove={() => active !== i && setActive(i)}
                  onClick={() => pick(it)}
                >
                  <span>{it.label}</span>
                  {it.hint && <span className="h">{it.hint}</span>}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="cp-foot" aria-hidden="true">
          <span>↑ ↓ to move</span>
          <span>Enter to open</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
