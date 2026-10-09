import { ACHIEVEMENTS, CERTIFICATIONS, EXPERIENCE, PROJECTS, SKILL_GROUPS, type Project } from "./data";

/** Recruiter-style skill search: finds where a skill was used, with a short summary of the evidence. */

export type ProjectHit = { project: Project; inStack: boolean; line: string; score: number };
export type RoleHit = { title: string; place: string; year: string; bullets: string[] };
export type CertHit = { title: string; issuer: string; date: string };
export type AchHit = { label: string; text: string };

export type SkillResult = {
  query: string;
  projects: ProjectHit[];
  roles: RoleHit[];
  certs: CertHit[];
  achievements: AchHit[];
  summary: string;
  total: number;
  /** skill is in my toolkit but has no project or role text yet */
  listed?: { name: string; family: string };
};

const norm = (s: string) => ` ${s.toLowerCase().replace(/[^a-z0-9+#]+/g, " ").trim()} `;

const ALIASES: Record<string, string[]> = {
  rag: ["retrieval"],
  llm: ["llm", "claude", "gpt"],
  genai: ["llm", "rag", "generative"],
  ai: ["llm", "rag", "agents"],
  ml: ["mlflow", "scikit-learn", "mlops", "models"],
  mlops: ["mlflow", "mlops"],
  cloud: ["aws", "gcp", "azure"],
  streaming: ["kafka", "sse"],
  agents: ["agent", "multi-agent", "langgraph"],
  "multi-agent": ["agents", "langgraph"],
  sql: ["postgresql", "postgres", "redshift", "snowflake"],
  spark: ["apache spark"],
  aks: ["kubernetes", "aks"],
  kubernetes: ["aks"],
  rest: ["rest api", "rest apis", "endpoints"],
  "distributed systems": ["distributed", "kafka", "event-driven"],
  scalability: ["scalable", "scale", "throughput"],
  "github actions": ["ci/cd"],
  postgres: ["postgresql"],
  testing: ["pytest", "tests", "coverage"],
  devops: ["ci/cd", "docker", "azure devops"],
  observability: ["prometheus", "grafana", "application insights", "monitoring"],
  etl: ["pipelines", "airflow"],
};

function terms(q: string): string[] {
  const base = norm(q).trim();
  if (base.length < 2) return [];
  return [base, ...(ALIASES[q.trim().toLowerCase()] ?? []).map((a) => norm(a).trim())];
}

/** strict: whole words only (so "Java" never matches "JavaScript"). loose: substring, used for partial typing. */
function has(text: string, ts: string[], loose = false): boolean {
  const t = norm(text);
  return ts.some((q) => (loose && q.length > 3 ? t.includes(q) : t.includes(` ${q} `) || t.includes(` ${q}s `)));
}

export const SKILL_NAMES = SKILL_GROUPS.flatMap((g) => g.skills.map((s) => s.name));

export function searchSkill(query: string): SkillResult {
  const strict = run(query, false);
  if (strict.total || strict.listed) return strict;
  return run(query, true);
}

function run(query: string, loose: boolean): SkillResult {
  const ts = terms(query);
  const out: SkillResult = { query: query.trim(), projects: [], roles: [], certs: [], achievements: [], summary: "", total: 0 };
  if (!ts.length) return out;

  for (const p of PROJECTS) {
    const inStack = p.tech.some((t) => has(t, ts, loose)) || p.support.some((t) => has(t, ts, loose)) || p.flow.some((t) => has(t, ts, loose));
    const text = [p.description, ...p.features, ...p.approach, ...p.result, p.kicker].join(" ");
    const inText = has(text, ts, loose);
    if (!inStack && !inText) continue;
    out.projects.push({ project: p, inStack, line: p.resumeLine, score: (inStack ? 3 : 0) + (inText ? 1 : 0) });
  }
  out.projects.sort((a, b) => b.score - a.score);

  for (const e of EXPERIENCE.slice().reverse()) {
    const bullets = e.detail.filter((d) => has(d, ts, loose));
    if (bullets.length) out.roles.push({ title: e.title, place: e.place, year: e.year, bullets });
  }
  for (const c of CERTIFICATIONS) if (has(`${c.title} ${c.issuer}`, ts, loose)) out.certs.push({ title: c.title, issuer: c.issuer, date: c.date });
  for (const a of ACHIEVEMENTS) {
    const text = `${a.caption} ${a.detail} ${a.label}`;
    if (has(text, ts, loose)) out.achievements.push({ label: `${a.prefix ?? ""}${a.value}${a.suffix ?? ""} ${a.label.toLowerCase()}`, text: `${a.caption}, ${a.detail}` });
  }

  out.total = out.projects.length + out.roles.length + out.certs.length + out.achievements.length;
  if (out.total) {
    const parts: string[] = [];
    if (out.projects.length) parts.push(`${out.projects.length} ${out.projects.length === 1 ? "project" : "projects"} (${out.projects.slice(0, 3).map((h) => h.project.title).join(", ")}${out.projects.length > 3 ? ", and more" : ""})`);
    if (out.roles.length) parts.push(`${out.roles.length} ${out.roles.length === 1 ? "role" : "roles"} (${out.roles.map((r) => r.place.split(",")[0]).join(", ")})`);
    if (out.certs.length) parts.push(`${out.certs.length} ${out.certs.length === 1 ? "certification" : "certifications"}`);
    const stat = out.achievements[0] ? ` Headline result: ${out.achievements[0].label}, ${out.achievements[0].text}.` : "";
    out.summary = `${out.query}: found in ${parts.join(", ")}.${stat}`;
  }
  if (!out.total) {
    for (const g of SKILL_GROUPS)
      for (const sk of g.skills)
        if (has(sk.name, ts, false)) {
          out.listed = { name: sk.name, family: g.family };
          out.summary = `${sk.name}: part of my toolkit (${g.family}). I haven't built a featured project around it yet, so ask me about it or see the other skills above.`;
        }
  }
  return out;
}
