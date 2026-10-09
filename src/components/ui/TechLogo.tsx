import type { ReactNode } from "react";
import Img from "./Img";

/** Real brand logos, self-hosted in public/logos with their licence files. `tint` is the brand colour. */
export const BRAND: Record<string, { src: string; tint: string; label: string }> = {
  python: { src: "/logos/python.svg", tint: "#3776ab", label: "Python" },
  fastapi: { src: "/logos/fastapi.svg", tint: "#009688", label: "FastAPI" },
  typescript: { src: "/logos/typescript.svg", tint: "#3178c6", label: "TypeScript" },
  react: { src: "/logos/react.svg", tint: "#61dafb", label: "React" },
  kafka: { src: "/logos/kafka.svg", tint: "#231f20", label: "Apache Kafka" },
  airflow: { src: "/logos/airflow.svg", tint: "#017cee", label: "Apache Airflow" },
  postgresql: { src: "/logos/postgresql.svg", tint: "#336791", label: "PostgreSQL" },
  aws: { src: "/logos/aws.svg", tint: "#ff9900", label: "AWS" },
  gcp: { src: "/logos/gcp.svg", tint: "#4285f4", label: "Google Cloud" },
  azure: { src: "/logos/azure.svg", tint: "#0078d4", label: "Microsoft Azure" },
  docker: { src: "/logos/docker.svg", tint: "#2496ed", label: "Docker" },
  prometheus: { src: "/logos/prometheus.svg", tint: "#e6522c", label: "Prometheus" },
  grafana: { src: "/logos/grafana.svg", tint: "#f46800", label: "Grafana" },
  pytest: { src: "/logos/pytest.svg", tint: "#0a9edc", label: "pytest" },
  langchain: { src: "/logos/langchain.svg", tint: "#7fc8ff", label: "LangChain" },
  mlflow: { src: "/logos/mlflow.svg", tint: "#0194e2", label: "MLflow" },
  qdrant: { src: "/logos/qdrant.svg", tint: "#dc244c", label: "Qdrant" },
  java: { src: "/logos/java.svg", tint: "#e76f00", label: "Java" },
  spark: { src: "/logos/spark.svg", tint: "#e25a1c", label: "Apache Spark" },
  snowflake: { src: "/logos/snowflake.svg", tint: "#29b5e8", label: "Snowflake" },
  redshift: { src: "/logos/redshift.svg", tint: "#8c4fff", label: "Amazon Redshift" },
  celery: { src: "/logos/celery.svg", tint: "#37814a", label: "Celery" },
  kubernetes: { src: "/logos/kubernetes.svg", tint: "#326ce5", label: "Kubernetes" },
  githubactions: { src: "/logos/githubactions.svg", tint: "#2088ff", label: "GitHub Actions" },
  git: { src: "/logos/git.svg", tint: "#f05032", label: "Git" },
};

const S = (children: ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    width="100%"
    height="100%"
  >
    {children}
  </svg>
);

/** Thin line icons for skills that have no brand logo (concepts and tools without an official mark). */
export const CONCEPT: Record<string, { icon: ReactNode; label: string }> = {
  postgis: {
    label: "PostGIS",
    icon: S(
      <>
        <path d="M12 21s-6-5.6-6-10.5a6 6 0 0 1 12 0C18 15.4 12 21 12 21Z" />
        <circle cx="12" cy="10.5" r="2.2" />
      </>,
    ),
  },
  cicd: {
    label: "CI/CD",
    icon: S(
      <>
        <path d="M4 12a8 8 0 0 1 13.6-5.7L20 8.5" />
        <path d="M20 4v4.5h-4.5" />
        <path d="M20 12a8 8 0 0 1-13.6 5.7L4 15.5" />
        <path d="M4 20v-4.5h4.5" />
      </>,
    ),
  },
  langgraph: {
    label: "LangGraph",
    icon: S(
      <>
        <circle cx="5.5" cy="6" r="2" />
        <circle cx="18.5" cy="6" r="2" />
        <circle cx="12" cy="18" r="2" />
        <path d="M7.5 6h9M6.5 7.8l4.5 8.4M17.5 7.8 13 16.2" />
      </>,
    ),
  },
  llamaindex: {
    label: "LlamaIndex",
    icon: S(
      <>
        <rect x="4" y="4" width="16" height="4" rx="1" />
        <rect x="4" y="10" width="16" height="4" rx="1" />
        <rect x="4" y="16" width="16" height="4" rx="1" />
        <path d="M7 6h4M7 12h6M7 18h3" />
      </>,
    ),
  },
  rag: {
    label: "RAG",
    icon: S(
      <>
        <path d="M5 3.5h8l3 3V12" />
        <path d="M5 3.5v14h6" />
        <path d="M8 8h5M8 11h3" />
        <circle cx="16.5" cy="16.5" r="3" />
        <path d="m18.7 18.7 2.3 2.3" />
      </>,
    ),
  },
  forest: {
    label: "Isolation Forest",
    icon: S(
      <>
        <path d="M7 20v-5M7 15l-3.5-3.5M7 15l3.5-4M7 11V5" />
        <path d="M17 20v-7M17 13l-3-3M17 13l3-3" />
        <circle cx="19.5" cy="5.5" r="1.3" />
      </>,
    ),
  },
  tree: {
    label: "Decision Trees",
    icon: S(
      <>
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <rect x="3" y="14" width="6" height="4" rx="1" />
        <rect x="15" y="14" width="6" height="4" rx="1" />
        <path d="M12 7v3M6 14v-4h12v4" />
      </>,
    ),
  },
  agents: {
    label: "Multi-Agent Systems",
    icon: S(
      <>
        <circle cx="12" cy="12" r="2.4" />
        <circle cx="5" cy="5.5" r="1.8" />
        <circle cx="19" cy="5.5" r="1.8" />
        <circle cx="5" cy="18.5" r="1.8" />
        <circle cx="19" cy="18.5" r="1.8" />
        <path d="m6.4 6.6 3.8 3.6M17.6 6.6l-3.8 3.6M6.4 17.4l3.8-3.6M17.6 17.4l-3.8-3.6" />
      </>,
    ),
  },
  agile: {
    label: "Agile/Scrum",
    icon: S(
      <>
        <path d="M20 12a8 8 0 1 1-2.6-5.9" />
        <path d="M20 4v4h-4" />
        <path d="M9 12.2l2.2 2.2L15.5 10" />
      </>,
    ),
  },
  sql: {
    label: "SQL",
    icon: S(
      <>
        <ellipse cx="12" cy="6" rx="7" ry="2.8" /><path d="M5 6v12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6" /><path d="M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8" />
      </>,
    ),
  },
  algo: {
    label: "Algorithms & Data Structures",
    icon: S(
      <>
        <rect x="9.5" y="3" width="5" height="4" rx="1" /><rect x="3" y="15" width="5" height="4" rx="1" /><rect x="16" y="15" width="5" height="4" rx="1" /><path d="M12 7v4M5.5 15v-4h13v4" />
      </>,
    ),
  },
  rest: {
    label: "REST APIs",
    icon: S(
      <>
        <path d="M8 7 3 12l5 5M16 7l5 5-5 5" /><path d="m13.5 5-3 14" />
      </>,
    ),
  },
  distributed: {
    label: "Distributed Systems",
    icon: S(
      <>
        <circle cx="12" cy="5" r="2" /><circle cx="5" cy="18" r="2" /><circle cx="19" cy="18" r="2" /><path d="m11 6.8-5 9.4M13 6.8l5 9.4M7 18h10" />
      </>,
    ),
  },
  largescale: {
    label: "Large-Scale Computing",
    icon: S(
      <>
        <rect x="3" y="4" width="18" height="5" rx="1.2" /><rect x="3" y="11" width="18" height="5" rx="1.2" /><path d="M7 6.5h.01M7 13.5h.01M12 19v2M8 21h8" />
      </>,
    ),
  },
  scalability: {
    label: "Scalability",
    icon: S(
      <>
        <path d="M4 20V14M10 20V10M16 20V6" /><path d="M4 8l5-4 3 2.5L20 3" /><path d="M16.5 3H20v3.5" />
      </>,
    ),
  },
  extraction: {
    label: "Information Extraction",
    icon: S(
      <>
        <path d="M6 3.5h9l3 3v14H6z" /><path d="M9 11h4M9 14h6" /><circle cx="16.5" cy="16.5" r="3" /><path d="m18.7 18.7 2.3 2.3" />
      </>,
    ),
  },
  webapps: {
    label: "Web Applications",
    icon: S(
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M6.5 6.5h.01M9 6.5h.01M9 13h6M9 16h3.5" />
      </>,
    ),
  },
  metrics: {
    label: "Metric Monitoring",
    icon: S(
      <>
        <path d="M3 12h4l2.5-6 4 12 2.5-6H21" />
      </>,
    ),
  },
  buildtest: {
    label: "Build & Testing",
    icon: S(
      <>
        <path d="m14.5 6.5 3 3L8 19l-4 1 1-4z" /><path d="m13 8 3 3M17.5 3.5l3 3" />
      </>,
    ),
  },
  mlops: {
    label: "MLOps",
    icon: S(
      <>
        <path d="M20 12a8 8 0 1 1-2.6-5.9" /><path d="M20 4v4h-4" /><circle cx="12" cy="12" r="2.4" />
      </>,
    ),
  },
  paper: {
    label: "Publication",
    icon: S(
      <>
        <path d="M6 3.5h9l3 3v14H6z" />
        <path d="M14.5 3.5v3.5H18" />
        <path d="M9 11h6M9 14h6M9 17h3.5" />
      </>,
    ),
  },
};

export function isBrand(key: string): boolean {
  return key in BRAND;
}

/** Renders a brand logo when one exists, otherwise a concept line icon. */
export default function TechLogo({
  name,
  size = 20,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const key = normalize(name);
  const brand = BRAND[key];
  if (brand) {
    return (
      <Img
        src={brand.src}
        alt=""
        width={size}
        height={size}
        className={className}
        style={{ width: size, height: size, objectFit: "contain" }}
      />
    );
  }
  const concept = CONCEPT[key];
  if (concept) {
    return (
      <span className={className} style={{ width: size, height: size, display: "inline-block" }} aria-hidden="true">
        {concept.icon}
      </span>
    );
  }
  return null;
}

const ALIASES: Record<string, string> = {
  "multi-agent systems": "agents",
  "isolation forest": "forest",
  "decision trees": "tree",
  "ci/cd": "cicd",
  "agile/scrum": "agile",
  "rag/llm systems": "rag",
  "apache spark": "spark",
  "algorithms & data structures": "algo",
  "distributed systems": "distributed",
  "large-scale computing": "largescale",
  "information extraction": "extraction",
  "web applications": "webapps",
  "metric monitoring": "metrics",
  "build & testing": "buildtest",
  "rest apis": "rest",
  "amazon redshift": "redshift",
  "azure kubernetes service (aks)": "kubernetes",
  "github actions": "githubactions",
};

/** Map a display name ("Multi-Agent Systems") to an icon key ("agents"). */
export function normalize(name: string): string {
  const k = name.trim().toLowerCase();
  return ALIASES[k] ?? k;
}
