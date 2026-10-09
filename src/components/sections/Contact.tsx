"use client";

import { useRef, useState, type FormEvent } from "react";
import { PROFILE } from "@/lib/data";
import { scrollToTarget } from "@/lib/scroll";

/** Every letter is its own span so it can hop when the cursor passes over it. */
function Hop({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((w, wi, arr) => (
        <span key={wi} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
          {Array.from(w).map((c, ci) => (
            <span key={ci} className="ch">
              {c}
            </span>
          ))}
          {wi < arr.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [fields, setFields] = useState({ name: "", email: "", message: "" });

  const mailtoHref = `mailto:${PROFILE.email}?subject=${encodeURIComponent(`Portfolio message from ${fields.name || "a visitor"}`)}&body=${encodeURIComponent(`${fields.message}\n\n${fields.name}${fields.email ? ` (${fields.email})` : ""}`)}`;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    // honeypot: real visitors never fill this in
    if ((form.elements.namedItem("_honey") as HTMLInputElement | null)?.value) return;
    setStatus("sending");
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${PROFILE.email}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: fields.name,
          email: fields.email,
          message: fields.message,
          _subject: `Portfolio message from ${fields.name}`,
          _replyto: fields.email,
          _template: "table",
          _captcha: "false",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === "false" || data.success === false) throw new Error("send failed");
      setStatus("sent");
      setFields({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };
  const set = (k: "name" | "email" | "message") => (e: { target: { value: string } }) => {
    setFields((f) => ({ ...f, [k]: e.target.value }));
    if (status !== "idle" && status !== "sending") setStatus("idle");
  };
  const timer = useRef<number | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = PROFILE.email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <style>{`
        .contact{padding-bottom:40px}
        .c-h{font-weight:700;font-size:clamp(46px,10.5vw,176px);letter-spacing:-.055em;line-height:.92}
        .c-h .l2{display:block;font-family:var(--serif);font-style:italic;font-weight:400;color:var(--mute);letter-spacing:-.03em}
        .ch{display:inline-block}
        .ch:hover{animation:hop .7s var(--ease)}
        @keyframes hop{0%{transform:translateY(0)}35%{transform:translateY(-.14em)}100%{transform:translateY(0)}}
        .c-row{margin-top:clamp(40px,8vh,88px);display:flex;flex-wrap:wrap;gap:28px 48px;align-items:flex-end;justify-content:space-between}
        .c-mail{display:flex;flex-wrap:wrap;align-items:center;gap:14px}
        .c-mail a.big{font-weight:600;font-size:clamp(22px,4.2vw,56px);letter-spacing:-.045em;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:.14em;text-decoration-color:var(--faint);transition:text-decoration-color .4s var(--ease);overflow-wrap:anywhere}
        .c-mail a.big:hover{text-decoration-color:var(--ink)}
        .copy{height:34px;padding:0 14px;border-radius:999px;font-size:13px;font-weight:600;box-shadow:inset 0 0 0 1px rgba(12,17,22,.25);transition:background .4s var(--ease),color .4s var(--ease)}
        .copy:hover{background:var(--ink);color:#fff}
        .c-links{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
        .badge{position:relative;width:132px;height:132px;flex:none}
        .badge svg{width:100%;height:100%;animation:spin 18s linear infinite}
        .badge span{position:absolute;inset:0;display:grid;place-items:center;font-size:26px}
        @keyframes spin{to{transform:rotate(360deg)}}
        .c-form{margin-top:clamp(40px,7vh,72px);display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.4fr);gap:clamp(24px,5vw,72px);align-items:start;background:#fff;border:1px solid var(--line);border-radius:22px;padding:clamp(22px,3.5vw,44px)}
        .c-form h3{font-family:var(--serif);font-style:italic;font-weight:400;font-size:clamp(30px,3.4vw,48px);line-height:1.05;letter-spacing:-.01em}
        .c-form .c-note{margin-top:12px;font-size:14.5px;line-height:1.55;color:var(--mute-text);max-width:34ch}
        .c-fields{display:grid;gap:16px}
        .c-two{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .c-f{display:grid;gap:6px}
        .c-f label{font-family:var(--mono-f);font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--mute-text)}
        .c-f input,.c-f textarea{width:100%;font:inherit;font-size:16px;color:var(--ink);background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:13px 14px;transition:border-color .3s var(--ease),background .3s var(--ease);resize:vertical}
        .c-f textarea{min-height:140px}
        .c-f input:focus,.c-f textarea:focus{outline:none;border-color:var(--ink);background:#fff}
        .c-f input:focus-visible,.c-f textarea:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
        .c-send{display:flex;flex-wrap:wrap;align-items:center;gap:14px}
        .c-send button{height:48px;padding:0 26px;border-radius:999px;background:var(--ink);color:#fff;font-weight:600;font-size:15px;transition:transform .4s var(--ease),opacity .3s}
        .c-send button:hover:not(:disabled){transform:translateY(-2px)}
        .c-send button:disabled{opacity:.6;cursor:progress}
        .c-msg{font-size:14px;color:var(--ink-2)}
        .c-msg a{text-decoration:underline;text-underline-offset:3px}
        .c-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
        @media (max-width:860px){.c-form{grid-template-columns:minmax(0,1fr)}.c-two{grid-template-columns:1fr}}
        .foot{margin-top:clamp(64px,12vh,120px);padding-top:22px;border-top:1px solid var(--line);display:flex;flex-wrap:wrap;gap:12px 28px;justify-content:space-between;font-size:13.5px;color:var(--mute-text)}
        .foot a{text-decoration:underline;text-underline-offset:3px;text-decoration-color:var(--faint)}
        .foot a:hover{text-decoration-color:var(--ink);color:var(--ink)}
      `}</style>
      <div className="wrap">
        <p className="tag rv">07 — Contact</p>
        <h2 className="c-h" id="contact-title" aria-label="Let's make something useful.">
          <span aria-hidden="true">
            <span className="rv-mask">
              <span>
                <Hop text="Let's make" />
              </span>
            </span>
            <span className="rv-mask">
              <span className="l2" style={{ ["--i" as string]: 1 }}>
                <Hop text="something useful." />
              </span>
            </span>
          </span>
        </h2>

        <div className="c-row rv">
          <div>
            <div className="c-mail">
              <a className="big" href={`mailto:${PROFILE.email}`}>
                {PROFILE.email}
              </a>
              <button type="button" className="copy" onClick={copy}>
                {copied ? "Copied ✓" : "Copy"}
              </button>
              <span aria-live="polite" className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                {copied ? "Email address copied" : ""}
              </span>
            </div>
            <div className="c-links">
              {PROFILE.phone && PROFILE.phoneHref && (
                <a className="btn btn-ghost" href={PROFILE.phoneHref}>
                  {PROFILE.phone}
                </a>
              )}
              <a className="btn btn-primary" href={PROFILE.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a className="btn btn-ghost" href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </div>
          </div>
          <div className="badge" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs>
                <path id="circ" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" />
              </defs>
              <text fontFamily="var(--mono-f)" fontSize="11" letterSpacing="3.2" fill="#0c1116">
                <textPath href="#circ" textLength="284" lengthAdjust="spacing">LET’S TALK · LET’S TALK · LET’S TALK · </textPath>
              </text>
            </svg>
            <span>↗</span>
          </div>
        </div>

        <form className="c-form rv" onSubmit={submit} aria-labelledby="c-form-title">
          <div>
            <h3 id="c-form-title">Send a message.</h3>
            <p className="c-note">Tell me about the role or project. It lands straight in my inbox and I reply within a day or two.</p>
          </div>
          <div className="c-fields">
            <div className="c-two">
              <div className="c-f">
                <label htmlFor="cf-name">Name</label>
                <input id="cf-name" name="name" type="text" autoComplete="name" required maxLength={80} value={fields.name} onChange={set("name")} />
              </div>
              <div className="c-f">
                <label htmlFor="cf-email">Email</label>
                <input id="cf-email" name="email" type="email" autoComplete="email" required maxLength={120} value={fields.email} onChange={set("email")} />
              </div>
            </div>
            <div className="c-f">
              <label htmlFor="cf-msg">Message</label>
              <textarea id="cf-msg" name="message" required minLength={10} maxLength={3000} value={fields.message} onChange={set("message")} />
            </div>
            <div className="c-hp" aria-hidden="true">
              <label htmlFor="cf-hp">Leave this empty</label>
              <input id="cf-hp" name="_honey" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <div className="c-send">
              <button type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
              <p className="c-msg" role="status" aria-live="polite">
                {status === "sent" && "Thanks, your message is on its way."}
                {status === "error" && (
                  <>
                    Couldn’t send it from here. <a href={mailtoHref}>Open it in your email app instead</a>.
                  </>
                )}
              </p>
            </div>
          </div>
        </form>

        <footer className="foot">
          <p>
            © {new Date().getFullYear()} {PROFILE.name}
          </p>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget(0);
            }}
          >
            Back to top ↑
          </a>
          <p>
            Built with <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">Next.js</a>
          </p>
        </footer>
      </div>
    </section>
  );
}
