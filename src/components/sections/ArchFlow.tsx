/**
 * Simplified architecture: a data path that lights up node by node, and the supporting
 * systems listed underneath. Pure CSS animation; static when reduced motion is preferred.
 */
export default function ArchFlow({ flow, support }: { flow: string[]; support: string[] }) {
  const step = 0.9; // seconds per node
  const total = flow.length * step + 0.8;
  return (
    <figure className="af" style={{ ["--T" as string]: `${total}s` }}>
      <style>{`
        .af{margin:0}
        .af-flow{list-style:none;margin:0;padding:0;display:flex;align-items:stretch}
        .af-step{display:flex;align-items:center;flex:1 1 0;min-width:0}
        .af-step:last-child{flex:0 1 auto}
        .af-node{position:relative;flex:none;max-width:100%;padding:10px 14px;border-radius:14px;background:#fff;box-shadow:inset 0 0 0 1px rgba(12,17,22,.28);font-size:12.5px;font-weight:600;line-height:1.25;text-align:center;animation:af-lit var(--T) linear infinite;animation-delay:calc(var(--i) * ${step}s)}
        .af-link{position:relative;flex:1;min-width:18px;height:1px;background:rgba(12,17,22,.3);margin-inline:2px}
        .af-link::after{content:"";position:absolute;left:0;top:-3px;width:7px;height:7px;border-radius:50%;background:var(--ink);opacity:0;animation:af-dx var(--T) linear infinite;animation-delay:calc(var(--i) * ${step}s + .35s)}
        @keyframes af-lit{0%{background:var(--ink);color:#fff}14%{background:var(--ink);color:#fff}22%,100%{background:#fff;color:var(--ink)}}
        @keyframes af-dx{0%{left:0;opacity:1}14%{left:calc(100% - 7px);opacity:1}15%,100%{left:calc(100% - 7px);opacity:0}}
        @keyframes af-dy{0%{top:0;opacity:1}14%{top:calc(100% - 7px);opacity:1}15%,100%{top:calc(100% - 7px);opacity:0}}
        .af-sup{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:14px}
        .af-sup b{font-family:var(--mono-f);font-size:11px;font-weight:400;letter-spacing:.08em;text-transform:uppercase;color:var(--mute-text);margin-right:4px}
        .af-sup span{padding:4px 10px;border-radius:999px;background:var(--paper);box-shadow:inset 0 0 0 1px var(--line);font-size:12px;font-weight:500}
        .af-cap{margin-top:12px;font-size:12px;color:var(--mute-text)}
        @media (max-width:640px){
          .af-flow{flex-direction:column;align-items:center}
          .af-step{flex-direction:column;flex:none;width:100%}
          .af-node{width:100%}
          .af-link{flex:none;width:1px;height:22px;min-width:0;margin:2px 0}
          .af-link::after{left:-3px;top:0;animation-name:af-dy}
        }
        @media (prefers-reduced-motion:reduce){
          .af-node{animation:none}
          .af-link::after{display:none}
        }
      `}</style>
      <ol className="af-flow" aria-label="Data flow">
        {flow.map((n, i) => (
          <li key={n} className="af-step" style={{ ["--i" as string]: i }}>
            <span className="af-node">{n}</span>
            {i < flow.length - 1 && <span className="af-link" aria-hidden="true" />}
          </li>
        ))}
      </ol>
      {support.length > 0 && (
        <div className="af-sup">
          <b>Supporting</b>
          {support.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      )}
      <figcaption className="af-cap">Simplified architecture, not a full diagram.</figcaption>
    </figure>
  );
}
