/**
 * Builds the one-page résumé PDF from src/lib/data.ts, so the résumé and the site always agree.
 * Needs LaTeX (pdflatex). Run:  NODE_NO_WARNINGS=1 node --experimental-strip-types scripts/build-resume.mjs
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EDUCATION, EXPERIENCE, PROFILE, PROJECTS, SKILL_GROUPS, CERTIFICATIONS } from "../src/lib/data.ts";

const esc = (t) =>
  String(t)
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([&%$#_{}])/g, "\\$1")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/→/g, "->");
const href = (url, label) => `\\href{${url}}{\\underline{${esc(label)}}}`;
const bullets = (items) => `\\resumeItemListStart\n${items.map((i) => `\\resumeItem{${esc(i)}}`).join("\n")}\n\\resumeItemListEnd`;

const site = "https://atmika-dev.vercel.app";
const header = `\\begin{center}
{\\Huge \\scshape ${esc(PROFILE.name)}} \\\\ \\vspace{3pt}
\\small ${esc(PROFILE.phone)} $|$ ${href("mailto:" + PROFILE.email, PROFILE.email)} $|$ ${esc(PROFILE.location)} (open to relocate) $|$ Immediate joiner \\\\ \\vspace{1pt}
${href(PROFILE.linkedin, PROFILE.linkedinLabel)} $|$ ${href(PROFILE.github, PROFILE.githubLabel)} $|$ ${href(site, "atmika-dev.vercel.app")}
\\end{center}`;

const education = EDUCATION.slice()
  .reverse()
  .map((e) => `\\resumeSubheading{${esc(e.title)}}{${esc(e.year)}}{${esc(e.place)}${e.detail.length ? ", " + esc(e.detail.join(", ")) : ""}}{${esc(e.where)}}`)
  .join("\n");

const SKIP = new Set(["PostGIS", "Prometheus", "Grafana", "LlamaIndex", "Isolation Forest", "Decision Trees", "Multi-Agent Systems", "pytest", "Agile/Scrum"]);
const skills = SKILL_GROUPS.map((g) => `\\textbf{${esc(g.family)}}{: ${esc(g.skills.filter((s) => !SKIP.has(s.name)).map((s) => s.name).join(", "))}} \\\\`).join("\n");

const experience = EXPERIENCE.slice()
  .reverse()
  .map((e) => `\\resumeSubheading{${esc(e.title)}}{${esc(e.year)}}{${esc(e.place)}}{${esc(e.where)}}\n${bullets(e.detail)}`)
  .join("\n");

const projects = PROJECTS.map((p) => {
  const right = p.github ? href(p.github, p.githubLabel ?? p.github) : "Private project";
  return `\\resumeProjectHeading{\\textbf{${esc(p.title)}} $|$ \\emph{${esc(p.tech.slice(0, 4).join(", "))}}}{${right}}\n${bullets([p.resumeLine])}`;
}).join("\n");

const forage = [...new Set(CERTIFICATIONS.filter((c) => c.issuer === "Forage").map((c) => c.title.split(":")[0].replace(/ (Inc\.|Australia|USA|Communications)/g, "").trim()))];
const others = [...new Set(CERTIFICATIONS.filter((c) => c.issuer === "DataCamp" || c.issuer === "Accenture").map((c) => c.issuer))];
const certLine = `\\textbf{Certifications}{: Forage job simulations (${esc(forage.join(", "))}); ${esc(others.join(", "))}}`;

const tex = String.raw`\documentclass[letterpaper,10pt]{article}
\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\input{glyphtounicode}
\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}
\addtolength{\oddsidemargin}{-0.55in}
\addtolength{\evensidemargin}{-0.55in}
\addtolength{\textwidth}{1.1in}
\addtolength{\topmargin}{-0.72in}
\addtolength{\textheight}{1.55in}
\urlstyle{same}
\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}
\titleformat{\section}{\vspace{-5pt}\scshape\raggedright\large}{}{0em}{}[\color{black}\titlerule \vspace{-4pt}]
\pdfgentounicode=1
\newcommand{\resumeItem}[1]{\item\small{#1 \vspace{-2pt}}}
\newcommand{\resumeSubheading}[4]{\vspace{-1pt}\item
  \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
    \textbf{#1} & #2 \\
    \textit{\small#3} & \textit{\small #4} \\
  \end{tabular*}\vspace{-6pt}}
\newcommand{\resumeProjectHeading}[2]{\item
  \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
    \small#1 & \small #2 \\
  \end{tabular*}\vspace{-6pt}}
\renewcommand\labelitemii{$\vcenter{\hbox{\tiny$\bullet$}}$}
\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-4pt}}
\begin{document}
${header}
\section{Education}
\resumeSubHeadingListStart
${education}
\resumeSubHeadingListEnd
\section{Technical Skills}
\begin{itemize}[leftmargin=0.15in, label={}]
\small{\item{
${skills}
}}
\end{itemize}
\section{Experience}
\resumeSubHeadingListStart
${experience}
\resumeSubHeadingListEnd
\section{Projects}
\resumeSubHeadingListStart
${projects}
\resumeSubHeadingListEnd
\vspace{-2pt}
\begin{itemize}[leftmargin=0.15in, label={}]
\small{\item{
${certLine}
}}
\end{itemize}
\end{document}
`;

const dir = join(tmpdir(), "resume-build");
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "resume.tex"), tex);
for (let i = 0; i < 2; i++) execFileSync("pdflatex", ["-interaction=nonstopmode", "-halt-on-error", "resume.tex"], { cwd: dir, stdio: "ignore" });
const out = process.argv[2] || "public/Atmika_Manoj_Parey_resume.pdf";
copyFileSync(join(dir, "resume.pdf"), out);
console.log("wrote", out);
