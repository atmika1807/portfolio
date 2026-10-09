"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/hooks";
import type { Replay } from "@/lib/data";

const STEP_MS = 650;
const HOLD_MS = 3200;

/** Terminal-style playback of a workflow: nodes light up as their log lines appear, then it loops. */
export default function AgentReplay({ replay }: { replay: Replay }) {
  const total = replay.lines.length;
  const [n, setN] = useState(0); // lines shown
  const [playing, setPlaying] = useState(true);
  const [still, setStill] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setStill(true);
      setN(total);
      setPlaying(false);
    }
  }, [total]);

  useEffect(() => {
    if (!playing || still) return;
    const done = n >= total;
    const id = window.setTimeout(() => setN(done ? 0 : n + 1), done ? HOLD_MS : n === 0 ? 500 : STEP_MS);
    return () => window.clearTimeout(id);
  }, [n, playing, still, total]);

  useEffect(() => {
    const el = box.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [n]);

  const shown = replay.lines.slice(0, n);
  const last = shown[shown.length - 1];
  const nodeState = (i: number) => {
    const doneNode = shown.some((l) => l.node === i && l.kind === "done");
    if (doneNode) return "done";
    if (last && last.node === i) return "active";
    return "idle";
  };
  const finished = n >= total;

  return (
    <div className="ar">
      <style>{`
        .ar{border-radius:18px;background:#0c1116;color:#e8ecef;overflow:hidden}
        .ar-nodes{display:flex;flex-wrap:wrap;gap:6px;padding:14px 16px 0}
        .ar-n{padding:5px 12px;border-radius:999px;font-size:12px;font-weight:600;border:1px solid rgba(255,255,255,.28);color:rgba(255,255,255,.78);transition:background .35s var(--ease),color .35s var(--ease),border-color .35s var(--ease)}
        .ar-n.is-active{background:#fff;color:#0c1116;border-color:#fff}
        .ar-n.is-done{background:rgba(255,255,255,.16);color:#fff;border-color:rgba(255,255,255,.5)}
        .ar-n.is-planned{border-style:dashed;color:rgba(255,255,255,.6)}
        .ar-bar{display:flex;align-items:center;gap:8px;padding:12px 16px 0;font-family:var(--mono-f);font-size:11.5px;color:rgba(255,255,255,.65)}
        .ar-bar i{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.3);display:inline-block}
        .ar-bar button{margin-left:auto;height:30px;padding:0 14px;border-radius:999px;border:1px solid rgba(255,255,255,.3);color:#fff;font-size:12px;font-weight:600;font-family:var(--sans)}
        .ar-bar button:hover{background:#fff;color:#0c1116}
        .ar-bar button:focus-visible{outline:2px solid #fff;outline-offset:2px}
        .ar-log{height:268px;overflow:hidden;padding:12px 16px 16px;font-family:var(--mono-f);font-size:12.5px;line-height:1.75}
        .ar-line{white-space:pre-wrap;word-break:break-word;animation:ar-in .35s var(--ease)}
        .ar-line .p{color:rgba(255,255,255,.62)}
        .ar-line.done .m{color:#fff}
        .ar-line.start{color:rgba(255,255,255,.82)}
        .ar-line.plain{color:#fff;font-weight:600}
        .ar-cmd{color:#fff}
        .ar-caret{display:inline-block;width:7px;height:14px;background:#fff;vertical-align:-2px;margin-left:3px;animation:ar-b 1s steps(2) infinite}
        .ar-note{padding:0 16px 14px;font-size:12px;line-height:1.45;color:rgba(255,255,255,.62)}
        @keyframes ar-in{from{opacity:0;transform:translateY(4px)}}
        @keyframes ar-b{50%{opacity:0}}
        @media (prefers-reduced-motion:reduce){.ar-line{animation:none}.ar-caret{animation:none}}
      `}</style>
      <div className="ar-nodes" aria-hidden="true">
        {replay.nodes.map((nm, i) => (
          <span key={nm} className={`ar-n is-${nodeState(i)}`}>
            {nm}
          </span>
        ))}
        {replay.planned?.map((nm) => (
          <span key={nm} className="ar-n is-planned">
            {nm} · planned
          </span>
        ))}
      </div>
      <div className="ar-bar">
        <i /> <i /> <i />
        <span style={{ marginLeft: 6 }}>agent run · replay</span>
        {!still && (
          <button type="button" onClick={() => (finished ? (setN(0), setPlaying(true)) : setPlaying((p) => !p))}>
            {finished ? "Replay" : playing ? "Pause" : "Play"}
          </button>
        )}
      </div>
      <div className="ar-log" ref={box} aria-hidden="true">
        <div className="ar-line ar-cmd">
          <span className="p">$ </span>
          {replay.command}
        </div>
        {shown.map((l, i) => (
          <div key={i} className={`ar-line ${l.kind ?? "plain"}`}>
            {l.kind === "done" ? (
              <>
                <span className="p">✓ </span>
                <span className="m">{l.text}</span>
              </>
            ) : l.kind === "start" ? (
              <>
                <span className="p">▸ </span>
                {l.text}
              </>
            ) : (
              <>
                <span className="p">→ </span>
                {l.text}
              </>
            )}
          </div>
        ))}
        {!finished && <span className="ar-caret" />}
      </div>
      <ol className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        {replay.lines.map((l, i) => (
          <li key={i}>{l.text.replace(/\s+/g, " ")}</li>
        ))}
      </ol>
      <p className="ar-note">{replay.note}</p>
    </div>
  );
}
