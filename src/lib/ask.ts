import { ACHIEVEMENTS, CERTIFICATIONS, EDUCATION, EXPERIENCE, PROFILE, PROJECTS, SKILL_GROUPS } from "./data";

/**
 * "Ask my portfolio": retrieval over this site's own content, running in the browser.
 * It chunks the data, scores chunks with BM25 and returns the best ones with sources.
 * There is no language model: answers are extracted straight from the content.
 */

export type Chunk = {
  id: string;
  title: string;
  text: string;
  section: "work" | "experience" | "achievements" | "certifications" | "skills" | "about" | "contact";
  /** opens a project case study when set */
  project?: string;
};

export type Hit = { chunk: Chunk; score: number };

function buildCorpus(): Chunk[] {
  const out: Chunk[] = [];
  for (const p of PROJECTS)
    out.push({
      id: `p-${p.id}`,
      title: p.title,
      section: "work",
      project: p.id,
      text: `${p.description} ${p.problem} Built with ${p.tech.join(", ")}. Result: ${p.result.join(". ")}.`,
    });
  for (const e of EXPERIENCE)
    out.push({ id: `e-${e.place}`, title: `${e.title}, ${e.place}`, section: "experience", text: `${e.year}. ${e.detail.join(" ")}` });
  for (const e of EDUCATION)
    out.push({ id: `d-${e.place}`, title: `${e.title}, ${e.place}`, section: "about", text: `${e.year}. ${e.detail.join(" ")}` });
  for (const a of ACHIEVEMENTS)
    out.push({
      id: `a-${a.label}`,
      title: a.label,
      section: "achievements",
      text: `${a.prefix ?? ""}${a.value}${a.suffix ?? ""} ${a.label}. ${a.caption}. ${a.detail}.`,
    });
  const byIssuer = new Map<string, string[]>();
  for (const c of CERTIFICATIONS) byIssuer.set(c.issuer, [...(byIssuer.get(c.issuer) ?? []), `${c.title} (${c.date})`]);
  for (const [issuer, items] of byIssuer)
    out.push({ id: `c-${issuer}`, title: `Certifications, ${issuer}`, section: "certifications", text: `${items.join("; ")}.` });
  for (const g of SKILL_GROUPS)
    out.push({ id: `s-${g.family}`, title: g.family, section: "skills", text: `${g.skills.map((s) => s.name).join(", ")}.` });
  out.push({
    id: "profile",
    title: "About Atmika",
    section: "about",
    text: `${PROFILE.name} is a ${PROFILE.roleAccent} engineer based in ${PROFILE.location}. ${PROFILE.resumeExtra}`,
  });
  out.push({
    id: "availability",
    title: "Availability",
    section: "contact",
    text: `Available now as an immediate joiner, open to Data, GenAI and Software engineering roles. Based in ${PROFILE.location}, open to relocate.`,
  });
  out.push({
    id: "contact",
    title: "Contact",
    section: "contact",
    text: `Email ${PROFILE.email}. Phone ${PROFILE.phone}. GitHub ${PROFILE.githubLabel}. LinkedIn ${PROFILE.linkedinLabel}. Use the contact form at the bottom of this page. Reach out to hire, interview, hiring, join.`,
  });
  return out;
}

const STOP = new Set(
  "know use used using work worked experience research built build platforms platform a an and are as at be by did do does for from has have how i in is it of on or she her he his me my the their this to was were what when where which who why with you your about can tell any all".split(" "),
);

/** Light synonym expansion so natural questions reach the right chunks. */
const SYN: Record<string, string[]> = {
  streaming: ["sse", "kafka", "real-time", "events"],
  stream: ["sse", "kafka", "events"],
  pipeline: ["pipelines", "airflow", "kafka", "events"],
  pipelines: ["pipeline", "airflow", "kafka", "events"],
  llm: ["rag", "genai", "langgraph", "langchain", "llamaindex"],
  genai: ["rag", "llm", "langgraph"],
  ai: ["rag", "llm", "langgraph", "ml"],
  agent: ["agents", "langgraph", "multi-agent"],
  agents: ["agent", "langgraph", "multi-agent"],
  agentic: ["agents", "langgraph"],
  ml: ["mlflow", "mlops", "scikit-learn", "models"],
  mlops: ["mlflow", "pipelines", "deployment"],
  paper: ["ieee", "published", "publication"],
  publication: ["ieee", "published"],
  published: ["ieee", "publication"],
  degree: ["master", "bachelor", "education", "gpa", "cgpa"],
  education: ["master", "bachelor", "umass", "srm", "gpa"],
  study: ["master", "bachelor", "umass", "srm"],
  university: ["umass", "srm", "master", "bachelor"],
  grades: ["gpa", "cgpa"],
  cloud: ["aws", "gcp", "azure"],
  hire: ["contact", "email", "joiner", "available", "availability"],
  hiring: ["contact", "email", "joiner", "available"],
  available: ["joiner", "immediate", "availability"],
  availability: ["joiner", "immediate"],
  join: ["joiner", "immediate"],
  notice: ["joiner", "immediate"],
  reach: ["contact", "email", "phone"],
  email: ["contact", "mail"],
  phone: ["contact", "number"],
  number: ["phone", "contact"],
  location: ["mumbai", "based", "relocate"],
  relocate: ["mumbai", "based", "relocate", "location"],
  relocation: ["relocate", "mumbai"],
  live: ["mumbai", "based"],
  accuracy: ["90"],
  certification: ["certifications", "forage", "job", "simulation"],
  certifications: ["certification", "forage", "simulation", "datacamp"],
  courses: ["certifications", "datacamp", "forage"],
  skills: ["python", "fastapi", "kafka", "aws"],
  stack: ["python", "fastapi", "kafka", "aws"],
  tools: ["python", "fastapi", "kafka", "aws"],
  job: ["experience", "role", "developer", "engineer"],
  backend: ["fastapi", "api", "python"],
  api: ["fastapi", "rest", "endpoints"],
  testing: ["pytest", "coverage", "tests"],
  quality: ["coverage", "pytest", "drift", "evaluation"],
  monitoring: ["prometheus", "grafana", "observability", "drift"],
  observability: ["prometheus", "grafana", "mlflow", "drift"],
  incident: ["aiops", "triage", "anomaly"],
  anomaly: ["isolation", "forest", "aiops"],
  search: ["retrieval", "rag", "qdrant"],
  vector: ["qdrant", "retrieval", "rag"],
  dashboard: ["react", "grafana"],
  data: ["pipelines", "kafka", "airflow", "postgresql"],
};

const tok = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-/\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^[.\-/]+|[.\-/]+$/g, ""))
    .filter((t) => t && !STOP.has(t));

const stem = (t: string) => (t.length > 4 ? t.replace(/(ing|ed|es|s)$/, "") : t);

let CORPUS: Chunk[] | null = null;
let INDEX: { tf: Map<string, number>[]; df: Map<string, number>; len: number[]; avg: number } | null = null;

function ensure() {
  if (CORPUS && INDEX) return;
  CORPUS = buildCorpus();
  const tf: Map<string, number>[] = [];
  const df = new Map<string, number>();
  const len: number[] = [];
  for (const c of CORPUS) {
    const toks = tok(`${c.title} ${c.title} ${c.text}`).map(stem);
    const m = new Map<string, number>();
    for (const t of toks) m.set(t, (m.get(t) ?? 0) + 1);
    tf.push(m);
    len.push(toks.length);
    for (const t of m.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  }
  INDEX = { tf, df, len, avg: len.reduce((a, b) => a + b, 0) / len.length };
}

/** BM25 over the chunks. Returns up to `k` hits above a small relevance floor. */
export function search(query: string, k = 3): Hit[] {
  ensure();
  const idx = INDEX!;
  const corpus = CORPUS!;
  const base = tok(query);
  const terms = new Map<string, number>();
  for (const t of base) {
    terms.set(stem(t), Math.max(terms.get(stem(t)) ?? 0, 1));
    for (const s of SYN[t] ?? []) terms.set(stem(s), Math.max(terms.get(stem(s)) ?? 0, 0.45));
  }
  if (!terms.size) return [];
  const N = corpus.length;
  const k1 = 1.4;
  const b = 0.72;
  const hits: Hit[] = [];
  corpus.forEach((chunk, i) => {
    let score = 0;
    for (const [t, w] of terms) {
      const f = idx.tf[i].get(t);
      if (!f) continue;
      const n = idx.df.get(t) ?? 0;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      score += w * idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * idx.len[i]) / idx.avg)));
    }
    // projects and roles make better answers than bare lists of skills
    const boost = chunk.section === "work" ? 1.25 : chunk.section === "experience" ? 1.1 : chunk.section === "skills" ? 0.7 : chunk.section === "achievements" ? 0.8 : chunk.section === "certifications" ? 0.75 : 1;
    if (score > 0) hits.push({ chunk, score: score * boost });
  });
  hits.sort((a, b2) => b2.score - a.score);
  const top = hits[0]?.score ?? 0;
  if (top < 1.1) return [];
  return hits.filter((h) => h.score >= top * 0.45).slice(0, k);
}

export const SUGGESTIONS = [
  "What have you built with Kafka?",
  "Do you have RAG experience?",
  "Tell me about your research paper",
  "Are you available to join?",
  "Which cloud platforms do you know?",
];
