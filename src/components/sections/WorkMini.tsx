import type { ProjectId } from "@/lib/data";

/**
 * Illustrative mini-UIs, built in pure CSS/JSX and kept in grayscale. They hint at what each
 * product does and are labelled "Illustrative UI" so they are never mistaken for screenshots.
 * They contain no figures; the only words are technology names taken from the résumé.
 */

const bar = (w: string, h = 8, dark = false): React.CSSProperties => ({
  width: w,
  height: h,
  borderRadius: 999,
  background: dark ? "var(--ink)" : "var(--soft)",
});

function JobHunt() {
  const nodes = ["LangGraph", "JSearch", "Dashboard"];
  return (
    <div className="mu-col">
      <div className="mu-row" style={{ justifyContent: "space-between" }}>
        {nodes.map((n, i) => (
          <div key={n} className="mu-row" style={{ flex: i < nodes.length - 1 ? 1 : "none" }}>
            <span className="mu-node">{n}</span>
            {i < nodes.length - 1 && <span className="mu-line" />}
          </div>
        ))}
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="mu-item" style={{ opacity: 1 - i * 0.14 }}>
          <span className="mu-dot" />
          <div className="mu-col" style={{ gap: 6, flex: 1 }}>
            <span style={bar(`${70 - i * 8}%`, 9, true)} />
            <span style={bar(`${46 + i * 5}%`)} />
          </div>
          <span className="mu-pill" />
        </div>
      ))}
    </div>
  );
}

function AIOps() {
  return (
    <div className="mu-col">
      <p className="mu-cap">Isolation Forest</p>
      <svg viewBox="0 0 240 90" role="img" aria-label="Illustrative line chart with one flagged point" style={{ width: "100%" }}>
        <polyline
          fill="none"
          stroke="#0c1116"
          strokeWidth="1.6"
          strokeLinejoin="round"
          points="0,58 16,54 32,60 48,52 64,56 80,50 96,57 112,53 128,12 144,55 160,51 176,58 192,52 208,56 224,50 240,54"
        />
        <circle cx="128" cy="12" r="5" fill="#fff" stroke="#0c1116" strokeWidth="1.6" />
        <line x1="128" y1="20" x2="128" y2="84" stroke="#9aa3ab" strokeDasharray="3 4" />
        <line x1="0" y1="84" x2="240" y2="84" stroke="#dde1e5" />
      </svg>
      <p className="mu-cap">LangGraph triage</p>
      {[0, 1, 2].map((i) => (
        <div key={i} className="mu-item">
          <span className="mu-dot" style={{ background: i === 0 ? "var(--ink)" : "var(--faint)" }} />
          <div className="mu-col" style={{ gap: 6, flex: 1 }}>
            <span style={bar(`${72 - i * 12}%`, 9, i === 0)} />
            <span style={bar(`${50 + i * 6}%`)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function GenAI() {
  return (
    <div className="mu-col" style={{ height: "100%" }}>
      <div className="mu-bubble" style={{ alignSelf: "flex-end", width: "62%" }}>
        <span style={bar("90%", 8, true)} />
        <span style={bar("55%")} />
      </div>
      <div className="mu-bubble" style={{ width: "82%", background: "#fff" }}>
        <span style={bar("100%")} />
        <span style={bar("92%")} />
        <span style={bar("64%")} />
        <span className="mu-caret" />
      </div>
      <p className="mu-cap" style={{ marginTop: "auto" }}>
        Hybrid retrieval · Qdrant
      </p>
      <div className="mu-row" style={{ flexWrap: "wrap" }}>
        {["SSE streaming", "FastAPI", "MLflow"].map((c) => (
          <span key={c} className="mu-chip">
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function Crop() {
  const hs = [46, 70, 38, 82, 58, 64];
  return (
    <div className="mu-col">
      <p className="mu-cap">Wireless Sensor Network</p>
      <div className="mu-row" style={{ alignItems: "flex-end", height: 96, gap: 10 }}>
        {hs.map((h, i) => (
          <span key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 8, background: i === 3 ? "var(--ink)" : "var(--soft)" }} />
        ))}
      </div>
      <p className="mu-cap">Decision Tree</p>
      <svg viewBox="0 0 200 74" role="img" aria-label="Illustrative decision tree" style={{ width: "100%" }}>
        <g fill="#fff" stroke="#0c1116" strokeWidth="1.4">
          <rect x="78" y="4" width="44" height="18" rx="6" />
          <rect x="22" y="48" width="44" height="18" rx="6" />
          <rect x="134" y="48" width="44" height="18" rx="6" />
        </g>
        <path d="M100 22v10M44 48V32h112v16" fill="none" stroke="#0c1116" strokeWidth="1.4" />
      </svg>
    </div>
  );
}

function Azure() {
  const rows: [string, string, boolean][] = [
    ["GET /health", "healthy", false],
    ["GET /users/{id}", "404", false],
    ["POST /recommendation", "variable latency", false],
    ["GET /slow", "slow", true],
    ["GET /error", "500", true],
    ["GET /dependency-failure", "failed call", true],
  ];
  return (
    <div className="mu-col">
      <p className="mu-cap">Application Insights</p>
      {rows.map(([route, tag, hot]) => (
        <div key={route} className="mu-item" style={{ justifyContent: "space-between" }}>
          <span className="mu-chip" style={{ background: "transparent", boxShadow: "none", padding: 0, fontFamily: "var(--mono-f)" }}>
            {route}
          </span>
          <span className="mu-chip" style={hot ? { background: "var(--ink)", color: "#fff" } : undefined}>
            {tag}
          </span>
        </div>
      ))}
    </div>
  );
}

function Logs() {
  const topics = ["logs.raw", "logs.errors"];
  return (
    <div className="mu-col">
      <p className="mu-cap">Kafka topics</p>
      {topics.map((t, i) => (
        <div key={t} className="mu-item" style={{ justifyContent: "space-between" }}>
          <span className="mu-chip" style={{ background: "transparent", boxShadow: "none", padding: 0, fontFamily: "var(--mono-f)" }}>
            {t}
          </span>
          <div className="mu-row" style={{ gap: 4 }}>
            {[0, 1, 2, 3, 4, 5].map((k) => (
              <span key={k} style={{ width: 9, height: 22, borderRadius: 3, background: i === 1 && k % 3 === 0 ? "var(--ink)" : "var(--soft)" }} />
            ))}
          </div>
        </div>
      ))}
      <p className="mu-cap">Airflow DAG</p>
      <div className="mu-row" style={{ flexWrap: "wrap" }}>
        {["Ingest", "Transform", "Validate", "Load"].map((n, i, a) => (
          <span key={n} className="mu-row" style={{ gap: 6 }}>
            <span className="mu-node">{n}</span>
            {i < a.length - 1 && <span className="mu-line" style={{ width: 14, flex: "none" }} />}
          </span>
        ))}
      </div>
    </div>
  );
}

function Sahai() {
  return (
    <div className="mu-col" style={{ height: "100%" }}>
      <div className="mu-bubble" style={{ alignSelf: "flex-end", width: "60%" }}>
        <span style={bar("85%", 8, true)} />
        <span style={bar("50%")} />
      </div>
      <div className="mu-bubble" style={{ width: "80%", background: "#fff" }}>
        <span style={bar("100%")} />
        <span style={bar("78%")} />
      </div>
      <p className="mu-cap" style={{ marginTop: "auto" }}>Mood, 1 to 5</p>
      <div className="mu-row" style={{ alignItems: "flex-end", height: 56, gap: 8 }}>
        {[3, 4, 2, 4, 5, 3, 4].map((v, i) => (
          <span key={i} style={{ flex: 1, height: `${v * 20}%`, borderRadius: 6, background: i === 4 ? "var(--ink)" : "var(--soft)" }} />
        ))}
      </div>
    </div>
  );
}

const MAP: Record<ProjectId, () => React.JSX.Element> = {
  jobhunt: JobHunt,
  aiops: AIOps,
  genai: GenAI,
  crop: Crop,
  azure: Azure,
  logs: Logs,
  sahai: Sahai,
};

export default function WorkMini({ id }: { id: ProjectId }) {
  const Ui = MAP[id];
  return (
    <div className="mu" aria-hidden="false">
      <span className="mu-label">Illustrative UI</span>
      <Ui />
    </div>
  );
}
