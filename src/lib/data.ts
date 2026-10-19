/**
 * All site content lives here. Every value is taken from the résumé
 * (public/Atmika_Manoj_Parey_resume.pdf), including its embedded hyperlinks.
 * Components only read from this file.
 */

export type Profile = {
  name: string;
  firstName: string;
  initials: string;
  role: string;
  roleAccent: string;
  email: string;
  phone?: string;
  phoneHref?: string;
  location?: string;
  resumeSummary: string;
  resumeExtra: string;
  github: string;
  githubLabel: string;
  linkedin: string;
  linkedinLabel: string;
  resume: string;
};

export const PROFILE: Profile = {
  name: "Atmika Manoj Parey",
  firstName: "Atmika",
  initials: "AP",
  role: "Software Engineer",
  roleAccent: "Data & AI",
  email: "atmikaparey18@gmail.com",
  phone: "+91 90211 44315",
  phoneHref: "tel:+919021144315",
  location: "Mumbai, India",
  resumeSummary:
    "Data engineer and software developer who builds production AI platforms, data pipelines and ML systems end-to-end: FastAPI backends, LLM orchestration, RAG pipelines, Kafka and Airflow workflows, and MLOps across AWS, GCP and Azure.",
  resumeExtra: "M.S. Business Analytics, UMass Amherst. Published at IEEE ICCCNT 2023.",
  github: "https://github.com/atmika1807",
  githubLabel: "github.com/atmika1807",
  linkedin: "https://www.linkedin.com/in/atmika-manoj-parey/",
  linkedinLabel: "linkedin.com/in/atmika-manoj-parey",
  resume: "/Atmika_Manoj_Parey_resume.pdf",
};

export const NAV = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "achievements", label: "Achievements" },
  { id: "contact", label: "Contact" },
] as const;

/* ------------------------------------------------------------------ skills */

export type ProjectId = "jobhunt" | "aiops" | "genai" | "crop" | "azure" | "logs" | "sahai";

export type Skill = {
  n: number; // atomic number
  symbol: string; // two letters
  name: string;
  family: string;
  /** key into the BRAND map (real logo) or the CONCEPT map (line icon) */
  icon: string;
  usedIn: ProjectId[];
};

export const FAMILIES = [
  "Languages",
  "Core Competencies",
  "Backend & Data",
  "Cloud & DevOps",
  "AI / ML & Practices",
] as const;

type Raw = [symbol: string, name: string, icon: string, usedIn?: ProjectId[]];

const group = (family: string, start: number, rows: Raw[]): Skill[] =>
  rows.map(([symbol, name, icon, usedIn], i) => ({
    n: start + i,
    symbol,
    name,
    family,
    icon,
    usedIn: usedIn ?? [],
  }));

export const SKILL_GROUPS: { family: string; skills: Skill[] }[] = [
  {
    family: FAMILIES[0],
    skills: group(FAMILIES[0], 1, [
      ["Py", "Python", "python", ["crop", "azure", "logs", "sahai"]],
      ["Jv", "Java", "java"],
      ["Sq", "SQL", "sql", ["logs", "sahai"]],
      ["Ts", "TypeScript", "typescript"],
      ["Ds", "Algorithms & Data Structures", "algo"],
    ]),
  },
  {
    family: FAMILIES[1],
    skills: group(FAMILIES[1], 6, [
      ["Dx", "Distributed Systems", "distributed", ["logs"]],
      ["Ls", "Large-Scale Computing", "largescale", ["logs"]],
      ["Sc", "Scalability", "scalability"],
      ["Ie", "Information Extraction", "extraction", ["genai"]],
      ["Wa", "Web Applications", "webapps", ["crop", "sahai"]],
      ["Mm", "Metric Monitoring", "metrics", ["aiops"]],
      ["Bt", "Build & Testing", "buildtest", ["azure"]],
    ]),
  },
  {
    family: FAMILIES[2],
    skills: group(FAMILIES[2], 13, [
      ["Fa", "FastAPI", "fastapi", ["genai", "crop", "azure", "sahai"]],
      ["Rs", "REST APIs", "rest", ["genai", "azure", "sahai"]],
      ["Re", "React", "react", ["crop", "sahai"]],
      ["Ka", "Kafka", "kafka", ["logs"]],
      ["Af", "Airflow", "airflow", ["logs"]],
      ["Sp", "Apache Spark", "spark"],
      ["Ce", "Celery", "celery"],
      ["Pg", "PostgreSQL", "postgresql", ["logs", "sahai"]],
      ["Po", "PostGIS", "postgis"],
      ["Rd", "Amazon Redshift", "redshift"],
      ["Sn", "Snowflake", "snowflake"],
    ]),
  },
  {
    family: FAMILIES[3],
    skills: group(FAMILIES[3], 24, [
      ["Aw", "AWS", "aws"],
      ["Gc", "GCP", "gcp"],
      ["Az", "Azure", "azure", ["azure"]],
      ["Ak", "Azure Kubernetes Service (AKS)", "kubernetes", ["azure"]],
      ["Do", "Docker", "docker", ["azure", "logs"]],
      ["Ci", "CI/CD", "cicd", ["azure"]],
      ["Gh", "GitHub Actions", "githubactions", ["azure"]],
      ["Gt", "Git", "git"],
      ["Pr", "Prometheus", "prometheus", ["aiops"]],
      ["Gr", "Grafana", "grafana", ["aiops"]],
    ]),
  },
  {
    family: FAMILIES[4],
    skills: group(FAMILIES[4], 34, [
      ["Ra", "RAG/LLM Systems", "rag", ["aiops", "genai"]],
      ["Lc", "LangChain", "langchain"],
      ["Lg", "LangGraph", "langgraph", ["jobhunt", "aiops"]],
      ["Li", "LlamaIndex", "llamaindex", ["aiops"]],
      ["Qd", "Qdrant", "qdrant", ["genai"]],
      ["Ml", "MLflow", "mlflow", ["aiops", "genai"]],
      ["Mo", "MLOps", "mlops", ["aiops", "genai"]],
      ["If", "Isolation Forest", "forest", ["aiops"]],
      ["Dt", "Decision Trees", "tree", ["crop"]],
      ["Ma", "Multi-Agent Systems", "agents", ["jobhunt"]],
      ["Pt", "pytest", "pytest", ["azure"]],
      ["As", "Agile/Scrum", "agile"],
    ]),
  },
];

/* ---------------------------------------------------------------- projects */

export type Project = {
  id: ProjectId;
  index: string;
  title: string;
  kicker: string;
  description: string;
  features: string[];
  tech: string[];
  github?: string;
  githubLabel?: string;
  /** public working demo */
  live?: string;
  /** one-line version used on the printable résumé */
  resumeLine: string;
  /** shown as a "Private project" tag instead of a GitHub link */
  private?: boolean;
  /** case study: only restates what the description above already says */
  problem: string;
  approach: string[];
  result: string[];
  /** simplified architecture: the main data path, plus supporting systems underneath */
  flow: string[];
  support: string[];
  /** terminal-style replay of the workflow; always shown as illustrative, never as a captured run */
  replay?: Replay;
  /** real screenshots of the running app, with personal data covered */
  shots?: { src: string; alt: string; caption: string; w: number; h: number }[];
};

export type ReplayLine = { node: number; text: string; kind?: "start" | "done" | "plain" };
export type Replay = {
  command: string;
  nodes: string[];
  /** stages that exist in the design but are not built yet */
  planned?: string[];
  lines: ReplayLine[];
  note: string;
};

export const PROJECTS: Project[] = [
  {
    id: "jobhunt",
    index: "01",
    title: "JobHunt Agent",
    shots: [
      {
        src: "/shots/jobhunt-dashboard.jpg",
        alt: "JobHunt Agent dashboard showing 108 jobs discovered, 13 matched, 4 drafted and a table of matched roles with scores and reasoning",
        caption: "A real run: 108 jobs discovered, 13 matched above the score threshold, each with a match score and a written reason.",
        w: 1600,
        h: 931,
      },
      {
        src: "/shots/jobhunt-drafts.jpg",
        alt: "A drafted outreach email tied to the job it was written for, with recipient details covered",
        caption: "Each draft is tied to its job and waits for review. Recipient details are covered here.",
        w: 1580,
        h: 610,
      },
    ],
    kicker: "LangGraph · Multi-Agent · FastAPI · PostgreSQL",
    description:
      "Built a multi-agent job-search system on LangGraph: separate agents for matching, outreach and tracking share one state graph with checkpoints. The Gmail outreach module is live, working from 925 HR and founder contacts across 361 Indian product companies. Each run discovers about 80–110 real jobs through 11 JSearch API calls, within the free tier of 200 a month.",
    features: [
      "LangGraph state graph with checkpoints",
      "Matcher agent: 0–100 fit score with reasons",
      "Gmail outreach to HR contacts",
      "Max 2 contacts per company",
      "FastAPI dashboard endpoints",
      "PostgreSQL and optional MLflow logging",
      "JSearch job discovery: 11 API calls per run, free tier of 200 a month",
    ],
    tech: ["LangGraph", "Multi-Agent Systems", "LangChain", "FastAPI", "PostgreSQL", "MLflow"],
    resumeLine: "Built a LangGraph job-search agent: finding relevant roles went from hours to 5 minutes, with outreach to 925 HR contacts",
    problem: "Job search meant repeating the same steps by hand: find roles, judge the fit, and write to the right people. Just finding relevant postings took hours.",
    approach: [
      "Modelled the workflow as a LangGraph state machine: Discover, Score, Filter, Outreach, Track, Follow-up.",
      "Built a matcher that embeds the resume and each job description, then combines similarity with LLM reasoning.",
      "Built a Gmail outreach module that matches companies to HR contacts, caps two per company and drafts personal emails.",
      "Stored jobs, contacts and applications in PostgreSQL and exposed them through FastAPI.",
    ],
    result: ["Finding relevant roles went from hours to about 5 minutes, with score and location on each match", "About 80–110 real jobs discovered per run, using 11 JSearch API calls", "Runs inside the JSearch free tier of 200 API calls a month", "925 HR and founder contacts across 361 Indian product companies ready for outreach", "Every match comes with a 0–100 score, reasons and missing skills"],
    flow: ["Job postings", "Matcher agent", "Outreach agent", "Gmail drafts"],
    support: ["LangGraph state + checkpoints", "PostgreSQL", "FastAPI dashboard", "MLflow"],
    replay: {
      command: "python -m src.graph --mode=once",
      nodes: ["Score", "Outreach"],
      planned: ["Discover scrapers", "Reply tracking", "Follow-ups"],
      lines: [
        { node: 0, kind: "start", text: "score     embedding the resume and the job description" },
        { node: 0, kind: "start", text: "score     cosine similarity, then LLM reasoning" },
        { node: 0, kind: "done", text: "score     match score 0–100, reasons and missing skills" },
        { node: 1, kind: "start", text: "outreach  matching the company to HR contacts" },
        { node: 1, kind: "start", text: "outreach  keeping at most 2 contacts per company" },
        { node: 1, kind: "done", text: "outreach  personalised drafts created in Gmail" },
        { node: 1, kind: "plain", text: "state checkpointed, ready to resume" },
      ],
      note: "Illustrative replay of the agent graph, not a captured run. Scrapers, reply tracking and follow-ups are on the roadmap.",
    },
    github: "https://github.com/atmika1807/jobhunt-agent",
    githubLabel: "atmika1807/jobhunt-agent",
  },
  {
    id: "aiops",
    index: "02",
    title: "AIOps Incident Intelligence System",
    kicker: "LlamaIndex · LangGraph · RAG · Isolation Forest",
    description:
      "Built an agentic incident-intelligence system combining LlamaIndex RAG, a LangGraph workflow, and Isolation Forest anomaly detection to speed up incident triage, instrumented end-to-end with Prometheus, Grafana, and MLflow.",
    features: [
      "LlamaIndex RAG",
      "LangGraph workflow",
      "Isolation Forest anomaly detection",
      "Evidence-backed root-cause diagnosis",
      "Confidence-gated retry, then escalate",
      "Prometheus, Grafana and MLflow",
    ],
    tech: ["LlamaIndex", "LangGraph", "RAG", "Isolation Forest", "Prometheus", "Grafana", "MLflow"],
    resumeLine: "Built agentic incident triage: evidence-backed diagnosis with human escalation; LlamaIndex, LangGraph, Isolation Forest",
    problem: "Incident triage often means someone staring at dashboards and guessing: is this a leak or a bad deploy? Signals and past knowledge live in different places.",
    approach: [
      "Flagged anomalies in metrics with Isolation Forest.",
      "Retrieved related context with LlamaIndex RAG.",
      "Orchestrated triage as a LangGraph workflow that states the likely cause with a confidence score and the metrics behind it.",
      "Added a confidence gate: weak evidence triggers one broader retrieval, and if it is still unsure the case goes to a human.",
      "Instrumented the whole system with Prometheus, Grafana and MLflow, with an evaluation script that scores it.",
    ],
    result: [
      "From guessing at dashboards to a diagnosis with the likely cause, a confidence score and the exact metrics behind it",
      "Knows when not to trust itself: it escalates to a human instead of confidently giving a wrong answer",
      "98%+ detection and diagnosis accuracy and 0% false alarms on synthetic data, tracked in MLflow",
    ],
    flow: ["Metrics", "Isolation Forest", "LangGraph workflow", "Triage output"],
    support: ["LlamaIndex RAG", "Prometheus", "Grafana", "MLflow"],
    replay: {
      command: "aiops triage --incident latest",
      nodes: ["Detect", "Retrieve", "Triage", "Observe"],
      lines: [
        { node: 0, kind: "start", text: "detect    scoring metrics with Isolation Forest" },
        { node: 0, kind: "done", text: "detect    anomaly flagged" },
        { node: 1, kind: "start", text: "retrieve  LlamaIndex searching past incidents and knowledge" },
        { node: 1, kind: "done", text: "retrieve  related context found" },
        { node: 2, kind: "start", text: "triage    LangGraph workflow reasoning over signal and context" },
        { node: 2, kind: "done", text: "triage    likely cause and next steps drafted" },
        { node: 3, kind: "start", text: "observe   Prometheus, Grafana and MLflow record the run" },
        { node: 3, kind: "plain", text: "faster triage, with the trail to prove it" },
      ],
      note: "Illustrative replay of the workflow, not a captured run.",
    },
    private: true,
  },
  {
    id: "genai",
    index: "03",
    title: "Enterprise GenAI Control Tower",
    kicker: "Production RAG System · FastAPI · Qdrant · MLflow",
    description:
      "Built a production-grade, two-service RAG system with async document ingestion, hybrid retrieval, cross-encoder re-ranking and SSE streaming, plus LLM cost and quality observability in MLflow.",
    features: [
      "Async ingestion through Celery",
      "Hybrid dense + BM25 retrieval",
      "Cross-encoder re-ranking",
      "SSE streaming answers",
      "Cost and retrieval-quality tracking",
      "CI eval gate on retrieval thresholds",
    ],
    tech: ["FastAPI", "Qdrant", "MLflow", "RAG", "Celery", "Redis", "Docker"],
    resumeLine: "Built a production RAG system: hybrid retrieval, re-ranking, SSE streaming; 94% Hit@5, p95 under 200 ms",
    problem: "Teams want to put an internal knowledge base behind an LLM, but they need answers they can trust, spend they can control, and changes that do not quietly make it worse.",
    approach: [
      "Ingested documents asynchronously through FastAPI and a Celery queue into Qdrant.",
      "Fused dense and BM25 search, then re-ranked the top results with a cross-encoder.",
      "Streamed grounded answers to the client with SSE.",
      "Tracked latency, retrieval quality and cost per query in MLflow.",
      "Blocked changes in CI when retrieval metrics fell below thresholds.",
    ],
    result: [
      "Trustworthy answers: they come only from the company's own documents, with citations, and it says \"I don't know\" instead of guessing",
      "Cost control: cost per query and per embedding is tracked against a daily target, so GenAI spend does not run away",
      "Safe changes: a CI eval gate blocks any change that makes retrieval worse, a step most RAG demos skip",
      "94% Hit@5 and under 200 ms p95 query latency (from the repo's evaluation), with alerts when it degrades",
    ],
    flow: ["Query", "Hybrid retrieval", "Cross-encoder re-rank", "LLM answer", "SSE stream"],
    support: ["Celery ingestion", "Qdrant", "MLflow", "Cost ledger", "CI eval gate"],
    github: "https://github.com/atmika1807/Enterprise-GenAI-Control-Tower",
    githubLabel: "atmika1807/Enterprise-GenAI-Control-Tower",
  },
  {
    id: "crop",
    index: "04",
    title: "Smart Crop Management Dashboard",
    kicker: "Python · FastAPI · React · scikit-learn · IEEE ICCCNT 2023",
    description:
      "Built an AI-powered crop recommendation system on Wireless Sensor Network data: a Decision Tree model predicts the next farm action, a FastAPI backend serves it, and a real-time React dashboard shows live readings, trends and history. Published at IEEE ICCCNT 2023.",
    features: [
      "Decision Tree action model, six action classes",
      "Seven WSN sensor inputs",
      "FastAPI prediction and metrics endpoints",
      "Real-time React dashboard with trend charts",
      "AI-written explanation of each prediction",
      "Published at IEEE ICCCNT 2023",
    ],
    tech: ["Python", "FastAPI", "React", "scikit-learn", "Decision Trees"],
    resumeLine: "Built a Decision Tree crop model on WSN data with a FastAPI + React dashboard; IEEE ICCCNT 2023",
    problem: "Farmers need a clear next action from live field conditions, not a stream of raw sensor numbers.",
    approach: [
      "Generated a balanced dataset across 8 crop profiles and trained a scikit-learn Decision Tree with feature scaling.",
      "Served predictions and model metrics through FastAPI endpoints.",
      "Built a React dashboard with live sensor readings, trend charts and a prediction history.",
      "Added an optional LLM layer that explains each recommendation in plain language.",
    ],
    result: ["99% test accuracy on the project's synthetic dataset", "Published at the 14th IEEE ICCCNT, IIT Delhi, 2023"],
    flow: ["WSN sensor readings", "Decision Tree model", "FastAPI", "React dashboard"],
    support: ["scikit-learn", "Feature scaling", "Prediction history", "LLM explanation layer"],
    github: "https://github.com/atmika1807/-Smart-Crop-Management",
    githubLabel: "atmika1807/-Smart-Crop-Management",
    live: "https://smart-crop-management-eta.vercel.app/",
  },
  {
    id: "azure",
    index: "05",
    title: "Azure Incident API",
    kicker: "FastAPI · Azure App Service · Application Insights · Azure DevOps",
    description:
      "Built a deliberately breakable FastAPI service to practice production observability on Azure: every endpoint produces a different signal (healthy, slow, client error, server error, failed dependency), investigated in Application Insights with KQL and shipped through an Azure DevOps pipeline.",
    features: [
      "Seven endpoints, each a distinct telemetry signal",
      "Azure Monitor auto-instrumentation",
      "KQL cookbook and incident runbook",
      "pytest suite across every endpoint",
      "Docker image in Azure Container Registry",
      "Azure DevOps CI/CD with a smoke test",
    ],
    tech: ["Python", "FastAPI", "Docker", "Azure", "Application Insights", "KQL", "pytest", "Azure DevOps"],
    resumeLine: "Built a breakable FastAPI service for observability: Application Insights, KQL runbooks, Azure DevOps CI/CD",
    problem: "A production issue can only be fixed quickly if the telemetry shows exactly what broke.",
    approach: [
      "Built a FastAPI service with healthy, slow, erroring and dependency-failing endpoints.",
      "Turned on Azure Monitor instrumentation so every request, failure and dependency call reaches Application Insights.",
      "Wrote a KQL cookbook and an incident runbook for investigating slow requests, failures and exceptions.",
      "Automated test, build, push and deploy in an Azure DevOps pipeline ending in a /health smoke test.",
    ],
    result: ["Seven endpoints, each producing a distinct telemetry signal", "Push-to-deploy pipeline on Azure App Service with a smoke test"],
    flow: ["Request", "FastAPI service", "Azure Monitor", "Application Insights", "KQL investigation"],
    support: ["Docker", "Azure Container Registry", "App Service", "Azure DevOps", "pytest"],
    replay: {
      command: "git push origin main",
      nodes: ["Test", "Build", "Deploy", "Smoke test"],
      lines: [
        { node: 0, kind: "start", text: "test      running pytest across every endpoint" },
        { node: 0, kind: "done", text: "test      suite passed" },
        { node: 1, kind: "start", text: "build     docker image, pushed to Azure Container Registry" },
        { node: 1, kind: "done", text: "build     image published" },
        { node: 2, kind: "start", text: "deploy    Azure App Service, Linux container" },
        { node: 2, kind: "done", text: "deploy    release live" },
        { node: 3, kind: "start", text: "smoke     GET /health" },
        { node: 3, kind: "done", text: "smoke     service healthy" },
        { node: 3, kind: "plain", text: "telemetry now flowing to Application Insights" },
      ],
      note: "Illustrative replay of the pipeline stages, not a captured run.",
    },
    github: "https://github.com/atmika1807/azure-incident-api",
    githubLabel: "atmika1807/azure-incident-api",
  },
  {
    id: "logs",
    index: "06",
    title: "Log Analytics Pipeline",
    kicker: "Kafka · Airflow · PostgreSQL · Docker",
    description:
      "Built an event-driven log analytics pipeline: a Kafka producer and consumer feed PostgreSQL, an Airflow DAG runs Ingest, Transform, Validate and Load every five minutes, and a dashboard shows live metrics, error rates and latency. The whole stack runs locally with Docker Compose.",
    features: [
      "Kafka topics for raw logs and errors",
      "Batched consumer writes, 100 rows per insert",
      "Airflow DAG every 5 minutes with per-task retries",
      "Composite index for fast dashboard queries",
      "Kafka buffers events if the database is down",
      "One-command Docker Compose setup",
    ],
    tech: ["Kafka", "Airflow", "PostgreSQL", "Python", "Docker"],
    resumeLine: "Built a Kafka, Airflow and PostgreSQL log pipeline; a composite index cut dashboard latency by 35%",
    problem: "Log data arrives fast and in bursts, and a slow or failing database must not lose events.",
    approach: [
      "Published log events to Kafka, sending error events to their own topic.",
      "Consumed in batches of 100 and wrote them to PostgreSQL with batched inserts.",
      "Orchestrated Ingest, Transform, Validate and Load as an Airflow DAG, so a failed validate step retries without re-running ingest.",
      "Added a composite index on service and event time for the dashboard queries.",
    ],
    result: [
      "35% faster dashboard queries from the composite index (about 850 ms down to 550 ms, per the repo's notes)",
      "Events keep flowing into Kafka and can be replayed if the database goes down",
    ],
    flow: ["Log producer", "Kafka topics", "Consumer", "PostgreSQL", "Dashboard"],
    support: ["Airflow ETL, every 5 min", "Docker Compose", "Composite index", "Flask query server (optional)"],
    replay: {
      command: "docker compose up -d && python producer.py",
      nodes: ["Produce", "Buffer", "Load", "Orchestrate"],
      lines: [
        { node: 0, kind: "start", text: "produce      publishing log events to logs.raw" },
        { node: 0, kind: "done", text: "produce      error events routed to logs.errors" },
        { node: 1, kind: "start", text: "kafka        events buffered, replayable if the database is down" },
        { node: 2, kind: "start", text: "consumer     reading a batch of 100 events" },
        { node: 2, kind: "done", text: "consumer     batch inserted into PostgreSQL" },
        { node: 3, kind: "start", text: "airflow      ingest, transform, validate, load" },
        { node: 3, kind: "done", text: "airflow      DAG finished, next run in 5 minutes" },
        { node: 3, kind: "plain", text: "dashboard shows metrics, error rate and latency" },
      ],
      note: "Illustrative replay of the data flow, not a captured run.",
    },
    github: "https://github.com/atmika1807/Log-Analytics-pipeline",
    githubLabel: "atmika1807/Log-Analytics-pipeline",
  },
  {
    id: "sahai",
    index: "07",
    title: "Sahai 2.0 Wellness Companion",
    kicker: "React · FastAPI · PostgreSQL · Claude",
    description:
      "Built a full-stack prototype of an AI wellness companion: users register, chat with Claude, keep a journal that gets an AI-written insight, log their mood on a 1 to 5 scale and see their streaks on a dashboard.",
    features: [
      "JWT authentication",
      "Chat powered by the Claude API",
      "Journal entries with AI insight",
      "Mood tracking on a 1 to 5 scale",
      "Dashboard with counts and streaks",
      "Swagger API docs",
    ],
    tech: ["React", "FastAPI", "PostgreSQL", "Python", "Claude API", "JWT"],
    resumeLine: "Built a full-stack AI wellness prototype: React, FastAPI, PostgreSQL, Claude API, JWT, chat and journaling",
    problem: "Reflecting regularly is hard to keep up without a private, low-friction place to do it.",
    approach: [
      "Built a FastAPI backend with SQLAlchemy models for users, journal entries and mood logs.",
      "Secured it with JWT authentication and hashed passwords.",
      "Added a Claude-powered service for chat replies and journal insights.",
      "Built the React app: landing, login, dashboard, chat, journal and mood tracker.",
    ],
    result: ["Working full-stack prototype across auth, AI chat, journaling and mood tracking"],
    flow: ["React app", "FastAPI + JWT", "Claude service", "PostgreSQL"],
    support: ["SQLAlchemy models", "Mood and journal APIs", "Dashboard stats"],
    github: "https://github.com/atmika1807/Sahai-2.0-AI-Mental-Wellness-Companion",
    githubLabel: "atmika1807/Sahai-2.0",
  },
];

/* -------------------------------------------------------------- experience */

export type TimelineItem = {
  kind: "education" | "experience";
  year: string;
  title: string;
  place: string;
  where: string;
  detail: string[];
};

export const EDUCATION: TimelineItem[] = [
  {
    kind: "education",
    year: "2019 – 2023",
    title: "Bachelor of Technology, Computer Science",
    place: "SRM Institute of Science and Technology",
    where: "India",
    detail: ["CGPA 9.2 / 10"],
  },
  {
    kind: "education",
    year: "2024 – 2025",
    title: "Master of Science, Business Analytics",
    place: "University of Massachusetts Amherst",
    where: "Amherst, USA",
    detail: ["GPA 3.9 / 4"],
  },
];

export const EXPERIENCE: TimelineItem[] = [
  {
    kind: "experience",
    year: "Apr 2021 – Jun 2021",
    title: "Software Developer Intern",
    place: "Unschool",
    where: "India (Remote)",
    detail: [
      "Built backend REST API endpoints in Python and introduced systematic peer review and Git-based workflows, driving test coverage to 80%.",
    ],
  },
  {
    kind: "experience",
    year: "Jun 2021 – Aug 2021",
    title: "Software Developer Intern",
    place: "Supa Ventures Pvt Ltd (Blitz Jobs)",
    where: "India (Remote)",
    detail: [
      "Built event-driven Kafka + Airflow pipelines processing 50K+ events/day with retry logic and fault-tolerant design for high-volume reliability, cutting failed jobs by 90% while owning the work across the full SDLC.",
    ],
  },
  {
    kind: "experience",
    year: "Mar 2024 – May 2025",
    title: "Software Developer",
    place: "University of Massachusetts Amherst, Auxiliary Services",
    where: "Amherst, USA",
    detail: [
      "Built MLOps pipelines covering training, evaluation, versioning, and deployment across AWS, GCP, and Azure, giving research ML/DL models a repeatable path to production.",
      "Developed APIs that embedded ML models into research workflows, partnering directly with researchers to translate open research questions into deployable systems.",
    ],
  },
  {
    kind: "experience",
    year: "Aug 2025 – Jul 2026",
    title: "Data Engineer",
    place: "Community Dreams Foundation",
    where: "USA (Remote)",
    detail: [
      "Owned and built a new AI platform end-to-end – FastAPI backend, Qdrant RAG pipelines, LLM orchestration, SSE streaming – improving information retrieval efficiency by 60% for community program queries, from design through production.",
      "Automated manual, CLI-driven data ingestion and deployment workflows into standardized CI/CD pipelines, eliminating a release bottleneck and cutting operational overhead.",
      "Built evaluation, drift detection, and observability into the production service, reaching 90% accuracy on grant and outreach content (right context, right audience, as scored by an LLM judge) while tracking latency and cost.",
      "Replaced hours of manual grant and outreach message writing with an AI agent, then added an MLflow evaluation pipeline with an LLM as judge and set criteria, cutting processing time by 60%.",
    ],
  },
];

/** Education and experience as one path, in chronological order of start date. */
export const TIMELINE: TimelineItem[] = [
  EDUCATION[0],
  EXPERIENCE[0],
  EXPERIENCE[1],
  EXPERIENCE[2],
  EDUCATION[1],
  EXPERIENCE[3],
];

/* ---------------------------------------------------- certifications / awards */

export type Certification = { title: string; issuer: string; date: string; href?: string };

/** From the LinkedIn certifications list. Add an `href` to any entry to make its row a link. */
export const CERTIFICATIONS: Certification[] = [
  { title: "Electronic Arts: Software Engineering Job Simulation", issuer: "Forage", date: "Sep 2025" },
  { title: "Deloitte Australia: Data Analytics Job Simulation", issuer: "Forage", date: "Sep 2025" },
  { title: "Walmart USA: Advanced Software Engineering Job Simulation", issuer: "Forage", date: "Jul 2025" },
  { title: "Verizon Communications Inc.: Cloud Platform Job Simulation", issuer: "Forage", date: "Jul 2025" },
  { title: "Tata: GenAI Powered Data Analytics Job Simulation", issuer: "Forage", date: "Jul 2025" },
  { title: "BCG: Data Science Job Simulation", issuer: "Forage", date: "May 2025" },
  { title: "Bank of America: Global Markets Sales and Trading Analyst Job Simulation", issuer: "Forage", date: "Apr 2025" },
  { title: "Quantium: Data Analytics Job Simulation", issuer: "Forage", date: "Mar 2025" },
  { title: "Supervised Learning with scikit-learn", issuer: "DataCamp", date: "Feb 2025" },
  { title: "Developer Program", issuer: "Accenture", date: "Feb 2022" },
  { title: "Web-Based Learning to Enhance English Communication & Employability Skills", issuer: "SRM University", date: "Feb 2020" },
  { title: "JavaScript", issuer: "SRM University", date: "Apr 2020" },
  { title: "Introduction to Cloud Computing Workshop", issuer: "Microsoft", date: "Sep 2019" },
];

export type Achievement = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  /** shown instead of counting when the figure is a year */
  plain?: boolean;
  caption: string;
  detail: string;
  icon: string;
};

/** Only numbers and honours stated in the résumé. */
export const ACHIEVEMENTS: Achievement[] = [
  {
    label: "Publication",
    value: 2023,
    plain: true,
    caption: "IEEE ICCCNT, IIT Delhi",
    detail: "Smart Crop Management Dashboard",
    icon: "paper",
  },
  {
    label: "Accuracy",
    value: 90,
    suffix: "%",
    caption: "Grant and outreach content",
    detail: "Community Dreams Foundation · right context and audience, scored by an LLM judge",
    icon: "fastapi",
  },
  {
    label: "Faster processing",
    value: 60,
    suffix: "%",
    caption: "Grant and outreach messages",
    detail: "Community Dreams Foundation · MLflow LLM-as-judge evaluation, replacing hours of manual writing",
    icon: "fastapi",
  },
  {
    label: "Events per day",
    value: 50,
    suffix: "K+",
    caption: "Kafka + Airflow pipelines",
    detail: "Supa Ventures Pvt Ltd · retry logic, fault-tolerant design",
    icon: "kafka",
  },
  {
    label: "Fewer failed jobs",
    value: 90,
    suffix: "%",
    caption: "Event-driven pipelines",
    detail: "Supa Ventures Pvt Ltd · owned across the full SDLC",
    icon: "airflow",
  },
  {
    label: "HR contacts mapped",
    value: 925,
    caption: "JobHunt Agent",
    detail: "LangGraph multi-agent system · 361 Indian product companies",
    icon: "langgraph",
  },
  {
    label: "Test coverage",
    value: 80,
    suffix: "%",
    caption: "Backend REST API endpoints",
    detail: "Unschool · peer review and Git-based workflows",
    icon: "pytest",
  },
];
