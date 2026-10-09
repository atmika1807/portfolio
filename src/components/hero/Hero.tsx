"use client";

import { useEffect, useRef, useState } from "react";
import { PROFILE } from "@/lib/data";
import { scrollToTarget } from "@/lib/scroll";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const blockedRef = useRef(false);
  const visible = useRef(true);

  const setBlockedBoth = (v: boolean) => {
    blockedRef.current = v;
    setBlocked(v);
  };

  // Try to play with sound; if the browser refuses, play muted and unlock on the first gesture.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    let cancelled = false;

    (async () => {
      v.muted = false;
      try {
        await v.play();
        if (!cancelled) {
          setSoundOn(true);
          setBlockedBoth(false);
        }
      } catch {
        v.muted = true;
        try {
          await v.play();
        } catch {
          /* still blocked: the poster stays visible */
        }
        if (!cancelled) {
          setSoundOn(false);
          setBlockedBoth(true);
        }
      }
    })();

    const unlock = (e: Event) => {
      if ((e.target as Element | null)?.closest?.("[data-sound]")) return; // the button handles itself
      remove();
      if (!blockedRef.current || !visible.current) return;
      v.muted = false;
      v.play()
        .then(() => {
          setSoundOn(true);
          setBlockedBoth(false);
        })
        .catch(() => {
          v.muted = true;
        });
    };
    const events = ["pointerdown", "keydown", "touchend"] as const;
    const remove = () => events.forEach((ev) => window.removeEventListener(ev, unlock));
    events.forEach((ev) => window.addEventListener(ev, unlock, { passive: true }));

    // Pause (and so silence) the voice whenever less than 35% of the hero is visible.
    const hero = heroRef.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.intersectionRatio >= 0.35;
        if (visible.current) {
          v.play().catch(() => {
            v.muted = true;
            setSoundOn(false);
            v.play().catch(() => {});
          });
        } else {
          v.pause();
        }
      },
      { threshold: [0, 0.35, 0.5, 1] },
    );
    if (hero) io.observe(hero);

    return () => {
      cancelled = true;
      remove();
      io.disconnect();
    };
  }, []);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.muted || v.paused) {
      v.muted = false;
      v.play()
        .then(() => {
          setSoundOn(true);
          setBlockedBoth(false);
        })
        .catch(() => {
          v.muted = true;
        });
    } else {
      v.muted = true;
      setSoundOn(false);
    }
  };

  const go = (sel: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToTarget(sel);
  };

  return (
    <section id="hero" ref={heroRef} className="hero" aria-labelledby="hero-title">
      <style>{`
        .hero{position:relative;min-height:100svh;display:flex;flex-direction:column;align-items:center;overflow:hidden}
        .hero-ghost{position:absolute;left:50%;top:50%;transform:translate(-50%,-52%);z-index:0;font-weight:800;font-size:clamp(120px,27vw,420px);letter-spacing:-.06em;line-height:.8;color:transparent;-webkit-text-stroke:1.5px rgba(12,17,22,.16);white-space:nowrap;user-select:none;pointer-events:none}
        .hero-vid{position:relative;height:min(96svh,1040px);aspect-ratio:768/960;max-width:100%}
        .hero-vid video{width:100%;height:100%;object-fit:cover;mix-blend-mode:multiply;background:transparent;-webkit-mask-image:linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent);mask-image:linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent)}
        .hero-copy{position:absolute;left:0;right:0;bottom:clamp(40px,9vh,96px);z-index:2;pointer-events:none}
        .hero-copy .wrap>div{max-width:min(32vw,440px);pointer-events:auto}
        .hero-title{font-weight:700;font-size:clamp(36px,4.5vw,68px);letter-spacing:-.045em;line-height:1}
        .hero-title em{display:block;font-family:var(--serif);font-style:italic;font-weight:400;color:var(--mute);letter-spacing:-.02em}
        .hero-cta{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}
        .snd{position:absolute;z-index:3;right:8%;bottom:7%;width:46px;height:46px;border-radius:50%;background:var(--ink);color:#fff;display:grid;place-items:center;transition:transform .4s var(--ease),background .4s var(--ease)}
        .snd:hover{transform:scale(1.08);background:var(--ink-2)}
        .snd svg{width:16px;height:16px;fill:currentColor}
        .snd.is-blocked::after{content:"";position:absolute;inset:-6px;border-radius:50%;border:2px solid var(--ink);opacity:.5;animation:ping 1.8s var(--ease) infinite}
        @keyframes ping{0%{transform:scale(.8);opacity:.6}100%{transform:scale(1.5);opacity:0}}
        @media (max-width:900px){
          .hero{padding-top:64px;min-height:0}
          .hero-vid{height:62svh}
          .hero-copy{position:relative;bottom:auto;z-index:2;margin-top:-4px;padding-bottom:56px}
          .hero-copy .wrap>div{max-width:none;text-align:left}
          .hero-title{font-size:clamp(34px,10vw,52px)}
          .hero-ghost{top:34%}
          .snd{right:2%}
        }
      `}</style>
      <div className="hero-ghost" aria-hidden="true">
        {PROFILE.firstName.toUpperCase()}
      </div>
      <div className="hero-vid">
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="auto"
          poster="/hero/poster.webp"
          aria-label={`Animated portrait of ${PROFILE.firstName} introducing herself`}
        >
          <source src="/hero/hero.webm" type="video/webm" />
          <source src="/hero/hero.mp4" type="video/mp4" />
        </video>
        <button
          type="button"
          data-sound
          className={`snd${blocked ? " is-blocked" : ""}`}
          aria-label={soundOn ? "Mute the intro voice" : "Play the intro voice"}
          aria-pressed={soundOn}
          onClick={toggle}
        >
          {soundOn ? (
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <rect x="3" y="2" width="3.4" height="12" rx="0.6" />
              <rect x="9.6" y="2" width="3.4" height="12" rx="0.6" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 2.2v11.6a.5.5 0 0 0 .76.42l9.2-5.8a.5.5 0 0 0 0-.84L4.76 1.78A.5.5 0 0 0 4 2.2Z" />
            </svg>
          )}
        </button>
      </div>
      <div className="hero-copy">
        <div className="wrap">
          <div>
            <h1 id="hero-title" className="hero-title">
              <span className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                {PROFILE.name},{" "}
              </span>
              <span className="rv-mask">
                <span style={{ ["--i" as string]: 0 }}>{PROFILE.role}</span>
              </span>
              <span className="rv-mask">
                <em style={{ ["--i" as string]: 1 }}>{PROFILE.roleAccent}</em>
              </span>
            </h1>
            <div className="hero-cta rv" style={{ ["--i" as string]: 3 }}>
              <a href="#work" className="btn btn-primary" onClick={go("#work")}>
                Explore work
              </a>
              <a href="#contact" className="btn btn-ghost" onClick={go("#contact")}>
                Let&apos;s talk
              </a>
              <a href={PROFILE.resume} className="btn btn-ghost" download>
                Résumé <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
