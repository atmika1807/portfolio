/**
 * Small in-memory limiter: a per-visitor window plus a global daily cap.
 * On serverless hosts each instance keeps its own counters, so treat this as a
 * speed bump. The hard guarantee is the spend limit set in the Anthropic console.
 */
const WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();
let day = "";
let dayCount = 0;

export function allow(ip: string, perIp: number, dailyCap: number): "ok" | "ip" | "daily" {
  const now = Date.now();
  const today = new Date(now).toISOString().slice(0, 10);
  if (today !== day) {
    day = today;
    dayCount = 0;
  }
  if (dayCount >= dailyCap) return "daily";
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= perIp) {
    hits.set(ip, recent);
    return "ip";
  }
  recent.push(now);
  hits.set(ip, recent);
  dayCount += 1;
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  return "ok";
}
