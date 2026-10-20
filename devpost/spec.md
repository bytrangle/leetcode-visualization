---
doc: spec
status: approved
---

# Leet Years — Technical Spec

## How This Works, In Plain Language

Leet Years is two small programs that run on your own computer:

1. A **command-line program** (launched with `npx leet-years`). It asks for your LeetCode session cookie — think of that cookie as a key that unlocks your own LeetCode account. It uses the key to ask LeetCode for your full solved-problem history, then turns that into day-by-day data and starts a tiny local web server on your machine.
2. A **web page** (opened at a `localhost` address) that fetches the day-by-day data from your local server and plays the animated heatmap.

Why this shape: full per-day difficulty history isn't public on LeetCode (only daily *counts* are), so the app has to act as *you* to fetch it. Keeping that key in a local server means (a) the browser never touches it, (b) there's no cross-origin problem, and (c) no third party ever handles your credentials. The web page stays a pure player — no login form, no error screens.

## The Core Journey Through the System

From `prd.md > The Core Journey`:

1. You run the CLI → it prompts for the cookie (or reads `LEETCODE_SESSION`).
2. The CLI calls LeetCode's GraphQL through `leetcode-query` → gets your submission history.
3. The CLI transforms submissions into `year → [day → { problems }]`.
4. If anything failed (bad cookie, empty history, network), the CLI prints a message and exits — no browser.
5. On success, the CLI starts the local server and opens the browser at `http://localhost:PORT`.
6. The React app loads `/api/submissions` and shows the grey grid with a play button (idle, not animating).
7. You press play; then the replay, popup, year flip, and controls run in the browser exactly as the PRD describes.

## Stack

- **Node.js + TypeScript** — the CLI and local server. https://nodejs.org/
- **Express** — the tiny HTTP server: one data endpoint + serving the built frontend. https://expressjs.org/ *(recommended for routing + static serving; Node's built-in `http` would also work.)*
- **`leetcode-query`** — the unofficial LeetCode GraphQL client used to fetch submissions. https://www.npmjs.com/package/leetcode-query · https://github.com/JacobLinCool/LeetCode-Query — **unverified against current GraphQL; verify first in the build.**
- **React + Vite + TypeScript** — the frontend. https://react.dev/ · https://vitejs.dev/
- **Plain CSS** — styling (no CSS framework); the card-flip is a CSS transform the learner already has working.

## Where It Runs and How Someone Tries It

Runs entirely on one laptop. No deployment — a cookie-authenticated tool is local by design.

- Install: `npm install`
- Develop: `npm run dev` (Vite dev server proxying `/api` to the local Node server).
- Run it for real: `npm run build && npm start` → paste your cookie → the browser opens at the `http://localhost:PORT` the server prints.
- Quick demo without a cookie: `npm start -- --demo` (uses labeled sample data).
- Published (optional, for `6-ship`): `npx leet-years`.

For the required demo video: run the real flow with your own account and screen-record the replay. The public GitHub repo holds the code; reviewers can clone and run it themselves.

## Look and Feel

From `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`: light theme, minimal but friendly, GitHub-contribution-graph reference. Empty cells light grey; day fills blend green→yellow→red by difficulty; popup dots use discrete easy/medium/hard colors. Clean type, rounded cell corners, generous whitespace, warm copy. Plain CSS honors all of this directly. `src/lib/colors.ts` owns the numeric difficulty → hue mapping.

## Components

### CLI entry (`bin/cli.ts`)
Parses args (`--demo`), reads/prompts for the cookie, and orchestrates fetch → transform → serve → open browser.
PRD ref: `prd.md > Setup & authentication`.

### LeetCode client (`server/leetcode.ts`)
Holds the cookie and fetches full submissions via `leetcode-query`.
PRD ref: `prd.md > Setup & authentication`.

### Transform (`server/transform.ts`)
Converts submissions into the per-day data model below.
PRD ref: `prd.md > Replay`.

### Local server (`server/http.ts`)
Express app: serves `/api/submissions` and the built static frontend, then opens the browser.
PRD ref: `prd.md > The Core Journey`.

### Player (`src/App.tsx`)
Fetches `/api/submissions`, then holds the replay state machine — idle (grey grid + play), playing, paused, ended — plus current year/day and seek position.
PRD ref: `prd.md > Replay`, `prd.md > Controls`.

### Heatmap (`src/components/Heatmap.tsx`)
Renders the 7×~53 grid and drives the whole-grid year flip.
PRD ref: `prd.md > Year transition`.

### Cell (`src/components/Cell.tsx`)
One day: grey→color flip and the hover handler.
PRD ref: `prd.md > Replay`, `prd.md > Popup`.

### Popup (`src/components/Popup.tsx`)
Lists a day's problem titles with per-problem difficulty dots.
PRD ref: `prd.md > Popup`.

### Controls (`src/components/Controls.tsx`)
Play/pause toggle (always shown) + seek bar (shown only when history exceeds ~20s).
PRD ref: `prd.md > Controls`.

### Color mapping (`src/lib/colors.ts`)
Difficulty → score (1/2/4) → gradient color, plus the discrete dot colors.
PRD ref: `prd.md > Replay`, `prd.md > Look and Feel`.

### Replay logic (`src/lib/replay.ts`)
Timeline/seek: idle → playing → paused → ended state, current day position, jump-to-point, restart.
PRD ref: `prd.md > Controls`.

## Data Model

Shape produced by the transform and served at `/api/submissions`:

```
{
  years: [
    { label: 2021, days: [
      { date: "2021-03-04", problems: [ { title: "Two Sum", difficulty: "Easy" } ] }
    ] }
  ]
}
```

- A **day's color** = gradient position of `average(difficulty scores)` over its problems (easy=1, medium=2, hard=4).
- **Where it lives:** the CLI fetches LeetCode data, transforms it, and serves it in-process; the browser receives it once at load and keeps it in React state for the whole replay.
- **Leaving and coming back:** nothing persists — the cookie is not written to disk, and fetched data is reclaimed when the process and page close.

## File Structure

```
leet-years/
├── package.json          # bin: "leet-years"; scripts: dev/build/start
├── tsconfig.json
├── vite.config.ts        # frontend build + /api proxy in dev
├── README.md
├── bin/
│   └── cli.ts            # entry point: prompt for cookie, run server
├── server/
│   ├── leetcode.ts       # leetcode-query client
│   ├── transform.ts      # submissions -> years/days
│   ├── sampleData.ts     # seeded sample history (--demo)
│   └── http.ts           # Express app
├── src/                  # React frontend
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── Heatmap.tsx
│   │   ├── Cell.tsx
│   │   ├── Popup.tsx
│   │   ├── Controls.tsx
│   │   └── YearLabel.tsx
│   ├── lib/
│   │   ├── colors.ts
│   │   └── replay.ts
│   └── styles.css
└── devpost/              # learning workspace (scope, prd, spec)
```

## External Services and Dependencies

- **LeetCode GraphQL** (unofficial) via `leetcode-query`. Auth: your `LEETCODE_SESSION` cookie passed as a header. No key, no cost; rate limits unknown and changeable.
  - Required verification (build step #1): confirm `leetcode-query` v2.0.1 still fetches **full** submissions with `title`, `difficulty`, and `timestamp` against LeetCode's current GraphQL. If it only exposes counts or recent submissions, fall back to the labeled sample-data mode and revisit the data source.
  - Package docs: https://www.npmjs.com/package/leetcode-query · Repo: https://github.com/JacobLinCool/LeetCode-Query (last published July 2025).

## Important Failure Modes

- **`leetcode-query` is broken / returns only counts** → run in `--demo` mode (labeled sample data); log the mismatch rather than silently faking live data.
- **Invalid or expired cookie** → CLI prints "Couldn't authenticate — check your session cookie." and exits non-zero.
- **LeetCode unreachable / rate-limited / timeout** → CLI prints "Couldn't reach LeetCode — try again." and exits non-zero.
- **No solved problems** → CLI prints "This account hasn't solved any problems yet." and exits.
- **Browser loses the local server mid-replay** → a minimal in-browser message: "Couldn't load the visualization — restart the tool."

## What Was Simplified and Why

- **No hosted service / accounts / database** — a local Express server + React, instead of a deployed app. A hosted app would be stuck with count-only data or require handling strangers' cookies; both fail the kernel.
- **Errors live in the CLI, not the browser** — the CLI fails fast before opening a page, so the frontend has no input, auth, or error screens.
- **Labeled sample-data mode (`--demo`)** instead of betting the demo on an unofficial API — keeps the tool runnable/reviewable without a cookie.
- **One endpoint (`/api/submissions`)** instead of per-year/per-day calls — the CLI does the heavy transform once, up front.

## Decisions and Open Issues

- **Learner decisions:** React; TypeScript; a self-hosted `npx` CLI + local server; authenticate via the user's own session cookie through `leetcode-query` (not a public API).
- **Derived implementation details** (not learner choices, easy to change): Express, Vite, the file layout, the sample-data demo mode, and the per-day transform shape.

**The learner's open question, worked through:** *"Is pasting your LeetCode session cookie good practice?"* → Clarified: a session cookie is a live credential. That's appropriate **only** for a self-hosted/personal tool (you are the account owner, in a trusted local context), and inappropriate for a hosted service collecting strangers' cookies. Resolved by the local-server design: the cookie stays server-side and in-process — never in the browser, never with a third party.

- **To verify early in `5-build`:** `leetcode-query`'s current methods and whether LeetCode's GraphQL still returns full submission history.
- **Open from `prd.md`:** exact typeface + accent color.
- **Optional, decide in `6-ship`:** whether to publish to npm.