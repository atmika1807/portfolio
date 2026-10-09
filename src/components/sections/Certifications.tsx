import { CERTIFICATIONS, type Certification } from "@/lib/data";

type Group = { issuer: string; items: Certification[] };

/** Group by issuer, in order of first appearance. */
function groupByIssuer(list: Certification[]): Group[] {
  const map = new Map<string, Certification[]>();
  for (const c of list) map.set(c.issuer, [...(map.get(c.issuer) ?? []), c]);
  return [...map].map(([issuer, items]) => ({ issuer, items }));
}

/** "Walmart USA: Advanced Software Engineering Job Simulation" -> company + role. */
function split(title: string): { head: string; sub?: string } {
  const i = title.indexOf(": ");
  if (i < 0) return { head: title };
  return { head: title.slice(0, i), sub: title.slice(i + 2).replace(/ Job Simulation$/, "") };
}

/** Credentials shelf: one card per issuer, with the largest group spanning the full width. */
export default function Certifications() {
  if (CERTIFICATIONS.length === 0) return null;
  const groups = groupByIssuer(CERTIFICATIONS);
  const widest = Math.max(...groups.map((g) => g.items.length));

  return (
    <section id="certifications" className="cg" aria-labelledby="cg-title">
      <style>{`
        .cg{background:#fff;border-block:1px solid var(--line);padding-block:var(--pad-y)}
        .cg-head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:16px 40px;margin-bottom:clamp(28px,4vw,56px)}
        .cg-head .h2{font-size:clamp(40px,5vw,76px)}
        .cg-count{font-family:var(--mono-f);font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--mute-text);padding-bottom:10px}
        .cg-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:14px}
        .cg-card{grid-column:span 3;background:var(--paper);border:1px solid var(--line);border-radius:18px;padding:22px 22px 14px;transition:transform .5s var(--ease),box-shadow .5s var(--ease),border-color .5s var(--ease)}
        .cg-card.is-wide{grid-column:1/-1;padding:26px 26px 18px}
        .cg-card:hover{transform:translateY(-3px);box-shadow:0 18px 40px -22px rgba(12,17,22,.35);border-color:rgba(12,17,22,.22)}
        .cg-top{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding-bottom:14px;border-bottom:1px solid var(--line)}
        .cg-issuer{font-family:var(--serif);font-style:italic;font-size:clamp(24px,2.2vw,32px);line-height:1.1;letter-spacing:-.01em}
        .cg-n{font-family:var(--mono-f);font-size:12px;color:var(--mute-text);white-space:nowrap}
        .cg-list{list-style:none;margin:0;padding:0}
        .cg-card.is-wide .cg-list{columns:2;column-gap:40px}
        .cg-item{break-inside:avoid;display:flex;justify-content:space-between;align-items:baseline;gap:14px;padding:14px 0;border-bottom:1px solid var(--line)}
        .cg-card:not(.is-wide) .cg-item:last-child{border-bottom:0}
        .cg-name{display:block;font-weight:600;font-size:15px;letter-spacing:-.02em;line-height:1.3}
        .cg-sub{display:block;margin-top:2px;font-size:13px;line-height:1.35;color:var(--mute-text);font-weight:400}
        .cg-date{font-family:var(--mono-f);font-size:11.5px;color:var(--mute-text);white-space:nowrap}
        a.cg-name:hover{text-decoration:underline;text-underline-offset:3px}
        @media (max-width:1100px){.cg-card{grid-column:span 6}}
        @media (max-width:760px){
          .cg-card,.cg-card.is-wide{grid-column:1/-1;padding:20px 18px 10px}
          .cg-card.is-wide .cg-list{columns:1}
        }
        @media (prefers-reduced-motion:reduce){.cg-card{transition:none}.cg-card:hover{transform:none}}
      `}</style>
      <div className="wrap">
        <div className="cg-head">
          <div>
            <p className="tag rv">05 — Certifications</p>
            <h2 className="h2" id="cg-title">
              <span className="rv-mask">
                <span>
                  Credentials &amp; <em>courses.</em>
                </span>
              </span>
            </h2>
          </div>
          <p className="cg-count rv">
            {CERTIFICATIONS.length} certifications · {groups.length} issuers
          </p>
        </div>
        <div className="cg-grid">
          {groups.map((g) => (
            <article key={g.issuer} className={`cg-card rv${g.items.length === widest && g.items.length > 3 ? " is-wide" : ""}`}>
              <header className="cg-top">
                <h3 className="cg-issuer">{g.issuer}</h3>
                <span className="cg-n">{String(g.items.length).padStart(2, "0")}</span>
              </header>
              <ul className="cg-list">
                {g.items.map((c) => {
                  const { head, sub } = split(c.title);
                  const name = c.href ? (
                    <a className="cg-name" href={c.href} target="_blank" rel="noopener noreferrer">
                      {head}
                    </a>
                  ) : (
                    <span className="cg-name">{head}</span>
                  );
                  return (
                    <li key={c.title} className="cg-item">
                      <span>
                        {name}
                        {sub && <span className="cg-sub">{sub}</span>}
                      </span>
                      <span className="cg-date">{c.date}</span>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
