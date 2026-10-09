"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Img from "../ui/Img";
import { EXPERIENCE, PROFILE, PROJECTS } from "@/lib/data";
import { prefersReducedMotion, useInView } from "@/lib/hooks";

const MAX_ANGLE = 22;

/** A realistic ID card on a lanyard: swings (spring pendulum), drags, flips on tap / Enter / Space. */
function LanyardCard() {
  const host = useRef<HTMLDivElement>(null);
  const swing = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);
  const inView = useInView(host, { once: true, threshold: 0.3 });

  const st = useRef({ a: 0, w: 0, drag: false, startX: 0, startA: 0, moved: false, raf: 0, last: 0, lastA: 0 });

  const apply = () => {
    if (swing.current) swing.current.style.transform = `rotate(${st.current.a.toFixed(3)}deg)`;
  };

  const loop = useCallback((t: number) => {
    const s = st.current;
    const dt = Math.min(0.033, (t - s.last) / 1000 || 0.016);
    s.last = t;
    if (!s.drag) {
      // damped spring around the vertical
      s.w += (-22 * s.a - 1.7 * s.w) * dt;
      s.a += s.w * dt;
      if (Math.abs(s.a) < 0.02 && Math.abs(s.w) < 0.05) {
        s.a = 0;
        s.w = 0;
        apply();
        s.raf = 0;
        return;
      }
    }
    apply();
    s.raf = requestAnimationFrame(loop);
  }, []);

  const wake = useCallback(() => {
    const s = st.current;
    if (!s.raf) {
      s.last = performance.now();
      s.raf = requestAnimationFrame(loop);
    }
  }, [loop]);

  useEffect(() => {
    const s = st.current;
    return () => cancelAnimationFrame(s.raf);
  }, []);

  // a gentle swing-in the first time the card is seen
  useEffect(() => {
    if (!inView || prefersReducedMotion()) return;
    st.current.a = 11;
    wake();
  }, [inView, wake]);

  const onDown = (e: React.PointerEvent) => {
    const s = st.current;
    s.drag = true;
    s.moved = false;
    s.startX = e.clientX;
    s.startA = s.a;
    s.lastA = s.a;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const s = st.current;
    if (!s.drag || prefersReducedMotion()) return;
    const dx = e.clientX - s.startX;
    if (Math.abs(dx) > 5) s.moved = true;
    if (!s.moved) return;
    const next = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, s.startA + dx * 0.14));
    s.w = (next - s.lastA) * 40;
    s.lastA = next;
    s.a = next;
    wake();
  };
  const onUp = () => {
    const s = st.current;
    if (!s.drag) return;
    s.drag = false;
    if (!s.moved) setFlipped((f) => !f);
    wake();
  };
  const onKey = (e: React.KeyboardEvent) => {
    const s = st.current;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setFlipped((f) => !f);
    } else if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && !prefersReducedMotion()) {
      e.preventDefault();
      s.w += e.key === "ArrowLeft" ? -60 : 60;
      wake();
    }
  };

  return (
    <div className="lan" ref={host}>
      <div className="lan-swing" ref={swing}>
        <div className="lan-strap" aria-hidden="true" />
        <div className="lan-clip" aria-hidden="true">
          <i />
        </div>
        <div className="lan-persp">
          <div
            className={`lan-card${flipped ? " is-flipped" : ""}`}
            role="group"
            aria-roledescription="flippable ID card"
            tabIndex={0}
            aria-label={`${PROFILE.name}, engineer ID card, showing the ${flipped ? "back" : "front"}. Press Enter to flip it, left and right arrows to swing it.`}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onKeyDown={onKey}
          >
            {/* front */}
            <div className="face front" aria-hidden={flipped}>
              <div className="slot" aria-hidden="true" />
              <p className="kicker">ENGINEER ID</p>
              <div className="ring">
                <Img src="/portrait-bust.webp" alt={`Portrait of ${PROFILE.name}`} width={128} height={156} draggable={false} />
              </div>
              <p className="nm">{PROFILE.name}</p>
              <p className="rl">
                {PROFILE.role}, {PROFILE.roleAccent}
              </p>
              <dl className="rows">
                <div>
                  <dt>Dept.</dt>
                  <dd>Data &amp; AI</dd>
                </div>
                <div>
                  <dt>Degree</dt>
                  <dd>M.S. Business Analytics</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>Immediate joiner</dd>
                </div>
              </dl>
              <div className="id-foot" aria-hidden="true">
                <span className="barcode" />
                <span className="holo" />
              </div>
            </div>
            {/* back */}
            <div className="face back" aria-hidden={!flipped}>
              <div className="slot" aria-hidden="true" />
              <p className="kicker">What I am</p>
              <ul className="what">
                <li>Data engineer and software developer</li>
                <li>M.S. Business Analytics, UMass Amherst · GPA 3.9/4</li>
                <li>B.Tech Computer Science, SRM · CGPA 9.2/10</li>
                <li>
                  Built {PROJECTS[0].title}, AIOps Incident Intelligence and GenAI Control Tower
                </li>
                <li>Published at IEEE ICCCNT 2023</li>
              </ul>
              <p className="sig" aria-label={`Signature: ${PROFILE.name}`}>
                {PROFILE.name}
              </p>
              <p className="found">If found, say hello · {PROFILE.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function About() {
  const current = EXPERIENCE[EXPERIENCE.length - 1];
  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <style>{`
        .about{padding-top:calc(var(--pad-y) * .8)}
        .about-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px minmax(0,1fr);gap:clamp(24px,4.5vw,72px);align-items:stretch}
        .about-l,.about-r{display:flex;flex-direction:column;gap:28px;min-width:0}
        .about-l .h2{font-size:clamp(44px,5vw,76px)}
        .about-l p.sum{font-size:clamp(17px,1.35vw,20px);line-height:1.55;color:var(--ink-2);max-width:46ch}
        .about-l p.sub{color:var(--mute-text);max-width:46ch}
        .about-btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:auto}
        .about-r{justify-content:space-between;padding-top:clamp(0px,6vw,96px)}
        .facts dl{display:grid;gap:0;margin:0}
        .facts h3{font-family:var(--mono-f);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--mute-text);margin-bottom:12px;font-weight:500}
        .facts dl>div{display:grid;grid-template-columns:96px 1fr;gap:12px;padding:14px 0;border-top:1px solid var(--line)}
        .facts dl>div:last-child{border-bottom:1px solid var(--line)}
        .facts dt{font-family:var(--mono-f);font-size:12px;color:var(--mute-text);padding-top:3px}
        .facts dd{margin:0;font-weight:500;letter-spacing:-.01em;overflow-wrap:anywhere}
        .facts a{text-decoration:underline;text-underline-offset:3px;text-decoration-color:var(--faint)}
        .facts a:hover{text-decoration-color:var(--ink)}
        .quote{font-family:var(--serif);font-style:italic;font-size:clamp(24px,2.2vw,32px);line-height:1.2;letter-spacing:-.01em}

        /* lanyard */
        .about-c{position:relative;min-height:600px}
        .lan{position:absolute;left:0;right:0;top:calc(-1 * var(--pad-y) * .8);display:flex;justify-content:center}
        .lan-swing{transform-origin:50% 0;width:264px;display:flex;flex-direction:column;align-items:center;will-change:transform}
        .lan-strap{width:30px;height:calc(var(--pad-y) * .8 + 30px);background:repeating-linear-gradient(90deg,#1c1c1c 0 2px,#2c2c2c 2px 4px);box-shadow:inset 0 0 0 1px rgba(255,255,255,.06),0 0 0 1px rgba(0,0,0,.4)}
        .lan-clip{width:56px;height:56px;margin-top:-6px;position:relative;z-index:2;display:grid;place-items:start center}
        .lan-clip::before{content:"";width:26px;height:40px;border-radius:7px 7px 12px 12px;background:linear-gradient(90deg,#8f8f8f,#e8e8e8 40%,#9b9b9b);box-shadow:inset 0 0 0 1px rgba(0,0,0,.25),0 2px 4px rgba(0,0,0,.2)}
        .lan-clip i{position:absolute;top:30px;width:16px;height:16px;border-radius:50%;border:3px solid #9d9d9d;border-top-color:#cfcfcf}
        .lan-persp{perspective:1400px;margin-top:-24px;position:relative;z-index:1}
        .lan-card{position:relative;width:264px;height:412px;transform-style:preserve-3d;transition:transform .9s var(--ease);cursor:grab;touch-action:pan-y;user-select:none;-webkit-user-select:none;border-radius:22px}
        .lan-card:active{cursor:grabbing}
        .lan-card.is-flipped{transform:rotateY(180deg)}
        .face{position:absolute;inset:0;border-radius:22px;background:#fff;box-shadow:inset 0 0 0 1px rgba(12,17,22,.1),0 30px 60px -28px rgba(12,17,22,.45),0 8px 18px -8px rgba(12,17,22,.18);backface-visibility:hidden;-webkit-backface-visibility:hidden;padding:30px 22px 20px;display:flex;flex-direction:column;align-items:center;overflow:hidden}
        .face.back{transform:rotateY(180deg);align-items:stretch}
        .face::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,#f3f3f3 0 54px,transparent 54px)}
        .slot{position:absolute;top:12px;left:50%;width:54px;height:9px;margin-left:-27px;border-radius:6px;background:var(--paper);box-shadow:inset 0 1px 3px rgba(0,0,0,.35)}
        .kicker{position:relative;font-family:var(--mono-f);font-size:11px;font-weight:600;letter-spacing:.2em;color:var(--ink-2);margin-top:2px}
        .ring{position:relative;margin-top:14px;padding:4px;border-radius:20px;background:linear-gradient(145deg,#d9d9d9,#6b6b6b 55%,#e6e6e6);box-shadow:0 0 0 6px rgba(12,17,22,.05),0 10px 30px -10px rgba(12,17,22,.4);transition:transform .6s var(--ease)}
        .ring img{width:128px;height:156px;object-fit:cover;object-position:50% 20%;border-radius:16px;transition:transform .8s var(--ease)}
        .ring{overflow:hidden}
        .lan-card:hover .ring img{transform:scale(1.07)}
        .nm{position:relative;margin-top:14px;font-weight:700;font-size:19px;letter-spacing:-.03em;line-height:1.1;text-align:center}
        .rl{position:relative;font-size:12px;color:var(--mute-text);margin-top:3px;text-align:center}
        .rows{position:relative;width:100%;margin:12px 0 0;display:grid;gap:3px}
        .rows div{display:flex;justify-content:space-between;gap:10px;font-size:11px;border-bottom:1px dashed rgba(12,17,22,.14);padding-bottom:3px}
        .rows dt{font-family:var(--mono-f);color:var(--mute-text);text-transform:uppercase;letter-spacing:.06em;font-size:10px}
        .rows dd{margin:0;font-weight:600;text-align:right}
        .id-foot{position:absolute;left:22px;right:22px;bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:14px}
        .barcode{flex:1;height:30px;background:repeating-linear-gradient(90deg,#111 0 2px,transparent 2px 4px,#111 4px 5px,transparent 5px 8px,#111 8px 11px,transparent 11px 13px)}
        .holo{width:34px;height:34px;border-radius:50%;background:conic-gradient(from 20deg,#f2f2f2,#9a9a9a,#fafafa,#6f6f6f,#e4e4e4,#a8a8a8,#f2f2f2);box-shadow:inset 0 0 0 1px rgba(0,0,0,.2),inset 0 0 8px rgba(255,255,255,.8)}
        .what{position:relative;margin-top:22px;display:grid;gap:0}
        .what li{padding:10px 0;border-bottom:1px solid var(--line);font-size:13px;font-weight:500;line-height:1.35;letter-spacing:-.01em}
        .what li:first-child{border-top:1px solid var(--line)}
        .sig{position:relative;margin-top:auto;font-family:var(--serif);font-style:italic;font-size:30px;line-height:1;letter-spacing:-.01em;text-align:center;padding-bottom:6px;border-bottom:1px solid var(--ink)}
        .found{position:relative;margin-top:10px;font-family:var(--mono-f);font-size:10px;color:var(--mute-text);text-align:center;overflow-wrap:anywhere}
        @media (max-width:1040px){
          .about-grid{grid-template-columns:1fr;gap:40px}
          .about-c{order:-1;min-height:560px}
          .about-r{padding-top:0}
          .about-btns{margin-top:8px}
        }
      `}</style>
      <div className="wrap">
        <div className="about-grid">
          <div className="about-l">
            <div>
              <p className="tag rv">01 — About</p>
              <h2 className="h2" id="about-title">
                <span className="rv-mask">
                  <span>
                    Hi, I&apos;m <em>{PROFILE.firstName}.</em>
                  </span>
                </span>
              </h2>
            </div>
            <p className="sum rv">{PROFILE.resumeSummary}</p>
            <p className="sub rv">{PROFILE.resumeExtra}</p>
            <div className="about-btns rv">
              <a className="btn btn-primary" href={PROFILE.resume} download>
                Résumé <span aria-hidden="true">↓</span>
              </a>
              <a className="btn btn-ghost" href={PROFILE.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a className="btn btn-ghost" href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </div>
          </div>

          <div className="about-c">
            <LanyardCard />
          </div>

          <div className="about-r">
            <div className="facts rv">
              <h3>Quick facts</h3>
              <dl>
              <div>
                <dt>Education</dt>
                <dd>
                  M.S. Business Analytics, UMass Amherst · 3.9/4
                  <br />
                  <span style={{ color: "var(--mute-text)", fontWeight: 400 }}>B.Tech Computer Science, SRM Institute · 9.2/10</span>
                </dd>
              </div>
              <div>
                <dt>Recent role</dt>
                <dd>
                  {current.title}, {current.place}
                </dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{PROFILE.location} · open to relocate</dd>
              </div>
              <div>
                <dt>Availability</dt>
                <dd>Immediate joiner</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={PROFILE.phoneHref}>{PROFILE.phone}</a>
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
                </dd>
              </div>
              </dl>
            </div>
            <blockquote className="quote rv" style={{ margin: 0 }}>
              “I turn manual workflows and open research questions into systems that run in production.”
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
