# Portfolio (Next.js)

Personal portfolio built with Next.js App Router, Tailwind CSS v4, and Framer Motion.

## Features

- Boot sequence overlay that blocks interaction and hands off into the hero.
- Animated hero headline.
- Projects list auto-loaded from GitHub based on a JSON config.
- Theme toggle (dark/light) + “skip boot sequence” setting (persisted in localStorage).

## Tech

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS v4 (CSS variables + `bg-(--bg)` style utilities)
- Framer Motion (animations)

## Getting Started

Install deps:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Open http://localhost:3000

## GitHub Projects

Edit the config in `src/data/projects.json`:

```json
[
  { "url": "https://github.com/owner/repo", "shown": true },
  { "url": "https://github.com/owner/hidden-repo", "shown": false }
]
```

The server route `src/app/api/projects/route.ts`:

- Loads `projects.json`
- Filters by `shown: true`
- Fetches repo metadata + languages from the GitHub REST API
- Returns JSON consumed by the client component `src/app/components/Projects.tsx`

## Environment Variables

Create `.env.local` (optional, but recommended to avoid rate limits):

```bash
GITHUB_TOKEN=your_token_here
```

Notes:

- Token is only used server-side (inside the Next.js route handler).
- A fine-grained token with read access to public repos is enough.

## Project Structure

Key files:

- `src/app/page.tsx` – page composition
- `src/app/layout.tsx` – root layout
- `src/app/globals.css` – global styles + theme variables
- `src/app/components/BootSequence.tsx` – boot overlay
- `src/app/components/Hero.tsx` – hero section
- `src/app/components/Projects.tsx` – projects list
- `src/app/components/StatusBar.tsx` – fixed status bar + settings
- `src/lib/github.ts` – GitHub fetch + parsing + language percentage computation
- `src/lib/prefs.ts` – theme + skip-boot localStorage helpers
- `src/lib/boot.ts` – boot event/dataset helpers

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
