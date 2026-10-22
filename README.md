# Leet Years

Replay your own LeetCode practice history as a difficulty-colored heatmap.

Each year is a GitHub-style contribution grid where every day is colored by the
**average difficulty** of the problems you solved that day — green for easy,
yellow for medium, red for hard — and the whole year animates day by day.

## Run it

```sh
npx github:bytrangle/leetcode-visualization
```

or, from a clone:

```sh
npm install
npm run build
npm start
```

The CLI asks for your LeetCode session cookie (the cookie is used only in the
local process, never stored or sent anywhere else). **Press Enter instead to
explore with a sample history** — no cookie, no network.

The bundled sample (`server/sample-2023-2026.json`) is generated, not personal:
it uses real LeetCode problems from the public catalog and a realistic practice
rhythm, with every problem the maintainer actually solved excluded. Regenerate
it with `node scripts/generateSampleData.mjs`.

Then open <http://localhost:3000>.

### Getting your cookie

1. Log in to leetcode.com in your browser.
2. Open DevTools → Application (or Storage) → Cookies → `https://leetcode.com`.
3. Copy the value of `LEETCODE_SESSION`.
4. Paste it at the prompt (it is hidden while you type).

You can also skip the prompt entirely:

```sh
LEETCODE_SESSION='your-cookie-value' npm start
```

## Develop

```sh
npm install
npm run dev     # Vite (http://localhost:5173) + API server, full loop with hot reload
```

| command | what it does |
| --- | --- |
| `npm start` | builds the frontend and runs the app on port 3000 (asks for your cookie) |
| `npm start -- --demo` | same, but with the sample history — no cookie needed |
| `npm run dev` | Vite dev server + API server, with hot reload |
| `npm run build` | builds the frontend (`dist/`) and compiles the CLI (`build/`) |
| `npm run typecheck` | typechecks the frontend and the server |

## How it works

- `bin/cli.ts` — the CLI: prompts for the cookie, fetches submissions, starts the server.
- `server/leetcode.ts` — talks to LeetCode's GraphQL API via `leetcode-query`.
- `server/cache.ts` — caches submissions (1h) and problem difficulties (30d) under `.cache/`,
  so a repeat run is instant and only fetches what's new.
- `server/transform.ts` — groups raw submissions into years → days → problems.
- `src/` — the React frontend: the heatmap, the replay, the popup, the year navigation.

## Requirements

Node 20.10+ (the CLI uses JSON import attributes and modern ESM).

## License

MIT
