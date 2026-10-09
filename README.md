# Atmika Manoj Parey: talking-video portfolio

One continuous-scroll portfolio built with Next.js 15 (App Router), React 19, TypeScript and Tailwind CSS 4.
A looping video of an animated 3D portrait introduces the page; everything else is generated from the résumé.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (type + lint checked)
npm start          # serve the production build
```

Node 20 or newer is recommended.

## Sections

| # | Section (nav link) | What it is |
|---|--------------------|------------|
| – | Hero | Looping intro video, ghost first name, role heading, CTAs, sound button |
| 01 | About | Lanyard ID card (drag to swing, tap or Enter to flip), summary, quick facts |
| 02 | Skills | "Periodic table of my stack": 26 element tiles, family filters, inspector panel |
| 03 | Work | Expanding accordion gallery, one panel per résumé project |
| 04 | Certifications | Numbered ink-flood list (no nav link, as in the brief) |
| 05 | Experience | Education and experience on one scroll-drawn timeline |
| 06 | Achievements | Pinned horizontal gallery of the numbers and honours in the résumé |
| 07 | Contact | Email with copy chip, GitHub, LinkedIn, footer |

Certifications (04) come from the LinkedIn list; add an `href` to an entry in `CERTIFICATIONS` to link its row.

## Where the content lives

All text and links are in **`src/lib/data.ts`** (`PROFILE`, `NAV`, `SKILL_GROUPS`, `PROJECTS`, `EXPERIENCE`, `EDUCATION`, `TIMELINE`, `ACHIEVEMENTS`).
Components only read from it. Everything comes from `public/Atmika_Manoj_Parey_resume.pdf`, including its embedded links.
Added at your request (not in the résumé PDF): phone, Mumbai, GPA 3.9/4 and CGPA 9.2/10, "Immediate joiner", and the certifications. Not on the site: ID number.
To update the site after changing the résumé, edit `data.ts` and replace the PDF in `public/`.

## Rebuild the hero video

`scripts/build-hero-assets.py` (needs `ffmpeg`, `ffprobe`, `numpy`) turns a raw intro video into the hero assets:

```bash
python3 scripts/build-hero-assets.py --video path/to/intro.mp4 \
  --photo "path/to/photo.jpeg" --photo-crop 66:20:288:360 --white 0.955
```

What it does:

1. Detects the person and crops tightly around them (head to toe) to a 768:960 portrait, scaled to 768 px wide.
2. Whitens the off-white backdrop (`colorlevels`) so `mix-blend-mode: multiply` makes it vanish into the page.
   `--white 0.98` is the default; this video needed `0.955` because its backdrop has faint patches.
3. Makes the loop seamless: uses the first 10 s and cross-fades the last stretch of picture into the first (ffmpeg `xfade`).
   The same cross-fade is done on the audio in numpy (not `acrossfade`). The clip is never retimed, so lips stay in sync.
   The fade is 0.5 s by default and is automatically shortened when the voice starts or ends closer than that to the clip edges
   (for the current video: 0.25 s).
4. Exports `public/hero/hero.mp4` (H.264, CRF 24, AAC 96 k, faststart) and `public/hero/hero.webm` (VP9 CRF 36, Opus 80 k).
5. Writes `public/hero/poster.webp`, `public/portrait-bust.webp` (480×600, from your photo if given) and `public/og.jpg` (1200×630).

Options: `--crop x:y:w:h` to override the person crop, `--xfade 0.3` to override the fade length.

## Behaviour notes

- The page tries to play the video with sound. If the browser blocks that, it plays muted (the round button pulses) and
  unlocks sound on your first click, key press or touch. The round button toggles sound (play icon = off, pause icon = on).
- The video pauses (so the voice stops) whenever less than 35 % of the hero is visible, and resumes when you scroll back.
- `prefers-reduced-motion` turns off smooth scrolling and decorative motion.
- First-load JS is about 128 kB. Fonts are self-hosted; there are no CDNs or external scripts at runtime.
- Lighthouse (local production build): Performance 95 mobile / 100 desktop, Accessibility 100, Best Practices 100, SEO 100.

## Credits and licences

- **Brand logos** in `public/logos/`: official "original" SVGs from [devicon](https://devicon.dev) (MIT, see `LICENSE-devicon.txt`)
  and [Simple Icons](https://simpleicons.org) (CC0, see `LICENSE-simple-icons.txt`) for LangChain, MLflow and Qdrant.
  Logos are trademarks of their respective owners and are used only to identify the technologies.
  Skills with no official mark (PostGIS, CI/CD, LangGraph, LlamaIndex, RAG, Isolation Forest, Decision Trees, Multi-Agent Systems,
  Agile/Scrum) get custom thin line icons.
- **Fonts**, self-hosted in `src/fonts/` (SIL Open Font License 1.1, see `LICENSE-dm-serif-display.txt`):
  Inter Tight (variable), DM Serif Display (italic accent), JetBrains Mono (variable), via Fontsource.
- **Smooth scrolling**: [Lenis](https://lenis.darkroom.engineering) (MIT), the only animation-related dependency.
- The work-panel mini UIs are illustrative CSS drawings, labelled "Illustrative UI", not screenshots of the projects.

## Before you deploy

`metadataBase` in `src/app/layout.tsx` points at `https://atmika-dev.vercel.app`. Change it if the site will live elsewhere.

## "Ask my portfolio" with real AI answers

The box works with no setup: it finds the best passages on the site and quotes them. To let Claude write the answer from those passages:

1. Create an API key in the Anthropic Console and **set a monthly spend limit there** (this is the hard cap on cost).
2. Local: copy `.env.example` to `.env.local` and fill in `ANTHROPIC_API_KEY`. Restart `npm run dev`.
3. Vercel: Project, Settings, Environment Variables, add `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`, `ASK_PER_IP`, `ASK_DAILY_CAP`), then redeploy.

The key stays on the server (`src/app/api/ask/route.ts`); the browser never sees it. Each visitor is limited to 8 questions per 10 minutes and the site to 300 a day, after which the box quietly falls back to quoting passages.

## Résumé PDF

`public/Atmika_Manoj_Parey_resume.pdf` is generated from `src/lib/data.ts`, so it stays in step with the site. To rebuild it after editing the data (needs LaTeX with `pdflatex`):

    NODE_NO_WARNINGS=1 node --experimental-strip-types scripts/build-resume.mjs

## Quick jump

Press Ctrl+K (Cmd+K on Mac) anywhere on the page to jump to a section, open a project's case study, download the résumé or send a message.
