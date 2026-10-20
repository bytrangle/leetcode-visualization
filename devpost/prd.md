---
doc: prd
status: approved
---

# Leet Years — Product Requirements

A self-hosted web app that replays your own LeetCode practice history as an animated, difficulty-colored heatmap. You run it locally, connect your own LeetCode account, and watch your years unfold.

Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey

1. In a terminal you run `npx leet-years`. It asks for your LeetCode session cookie; you paste it (or provide it via an env var).
2. The tool fetches your full submission history from LeetCode, then opens your browser to a local page.
3. The page shows a year label above a 365-cell grid, all cells light grey, and a play button — nothing is animating yet. The label shows the **earliest year with any practice**.
4. You press play; then the replay fills cells day by day, in date order — each active cell flips from grey to its color (a vertical card flip). Days with no practice are skipped and stay grey.
5. As each cell fills, a popup appears next to it listing that day's problem titles, each with a difficulty dot. It shows for ~0.5s, then disappears and the next day fills.
6. After a year's last active day, the whole grid does one vertical card flip: the label advances to the next year, every cell resets to grey, and the replay continues — through the final year with data.
7. When the final year's last active day has filled, the replay ends.
8. Throughout, if the replay is long enough, a small control row lets you pause/play and jump to any point.

Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

## Screens and Layout

One browser view (a player), plus a terminal step before it:

- **Terminal prompt (CLI)** — asks for the session cookie; reports failures (invalid cookie, no history, cannot reach LeetCode) and exits if anything prevents a replay.
- **Player** — the year label above the grid, the heatmap below it, and a play/pause button beneath the grid (the replay starts only when you press play). A seek bar appears above that button only when the history is long enough.

The grid is laid out like GitHub's contribution graph: 7 rows (days of the week) × ~53 columns (weeks), ~365 cells per year, one year at a time.

There is no input or error screen in the browser: the browser opens only when there is data to replay; failures surface in the terminal instead.

## Look and Feel

**Minimal but friendly** (learner's words). Light theme, matching GitHub's light graph and the light-grey empty cells. Clean type, rounded corners on the cells (fits the card flip), generous spacing, and a warm, human tone.

Fixed color system: empty = light grey; a day's fill color is a continuous blend along green → yellow → red, positioned by the day's average difficulty; each problem's dot in the popup uses the discrete difficulty color (easy = green, medium = yellow, hard = red).

Exact typeface and accent color are left to `4-spec`.

## Features and Behavior

### Setup & authentication
- You run the CLI and paste your LeetCode session cookie (or set it via env var).
- The app uses it only to read your own submission history, and only in the local process.

### Replay
- Cells fill in date order, earliest active day first, each via a vertical card flip.
- Each active day's color is the gradient point for its **average difficulty score**, where easy = 1, medium = 2, hard = 4 (hard counts twice medium). Averaging produces in-between colors rather than three buckets.
- Days with no solved problems stay light grey and are skipped.

### Popup
- When a cell fills, a popup opens next to it listing that day's problems, each preceded by a difficulty dot.
- The popup auto-dismisses after ~0.5s, then the next day fills.
- Hovering any already-filled cell re-shows its popup (it stays while hovered).

### Year transition
- After a year's last active day, the whole grid does one vertical card flip (the same flip as individual cells): the year label advances, all cells reset to light grey, and the replay resumes.
- Continues until the final year with data.

### Controls
- A **play/pause toggle** is always visible below the grid: play starts the replay (or restarts it after it finishes), pause freezes it.
- A **seek bar** sits above the button (thin bar + round handle) and appears **only when the replay's total duration exceeds ~20 seconds** (≈ more than 40 active days; estimated as active days × 0.5s). Dragging jumps the grid **straight to the state at that point** (no scrubbing animation) and resumes from there.

## Acceptance Criteria — how we know it works

- [ ] The terminal prompts for a session cookie and accepts it via prompt or env var.
- [ ] The browser opens to a ~365-cell light-grey grid with a play button (not yet animating); the year label is the earliest year with data.
- [ ] Pressing play starts the replay; it fills active days in date order, each via a card flip, colored by the blended average-difficulty gradient.
- [ ] A popup appears beside each newly-filled cell listing its problem titles with per-problem difficulty dots, and clears after ~0.5s.
- [ ] Hovering a filled cell re-shows its popup.
- [ ] Days with no data stay light grey and are skipped.
- [ ] After a year's last active day, the whole grid card-flips to the next year and continues; the replay ends after the final year.
- [ ] The play/pause toggle is always visible and starts, pauses, and restarts the replay; the seek bar appears only for histories longer than ~20s and jumps-and-resumes.
- [ ] Invalid/expired cookie → the terminal prints "couldn't authenticate" and exits; no browser opens.
- [ ] No solved problems → the terminal prints a "no solved problems yet" message and exits.
- [ ] Cannot reach LeetCode → the terminal prints a "try again" message and exits.

## States and Boundaries

- **Idle** — the page opens showing the grey grid and a play button; the replay hasn't started.
- **First use** — run the CLI; no cookie yet → prompt; then success → browser opens to the idle grid.
- **Normal use** — press play; the replay runs end to end, then stops.
- **Empty state** — account with zero solves → terminal message, no browser.
- **Error states** — invalid cookie and cannot-reach-LeetCode each print a terminal message and exit; nothing is shown in the browser.
- **End state** — the grid holds the final year's complete state; if controls are visible, Play restarts from the earliest year.
- **Persistence** — none. The cookie is held in the process only (not written to disk); the app remembers nothing between runs.
- **Boundary** — the tool reads only your own account, and never sends the cookie anywhere except LeetCode.

## Product Decisions

- **Name: "Leet Years."**
- **Self-hosted, open-source, run via `npx`** — each user authenticates to their own account; no hosted service, no operator, no credential-handling by a third party.
- **One year per view, whole-grid vertical card flip on year change.**
- **Continuous color blend by average difficulty** (easy=1 green, medium=2 yellow, hard=4 red; hard = 2× medium). Rejected three discrete buckets and orange-as-medium ("too close to red").
- **Popup auto-dismiss of 0.5s** ("2s or something" was too slow); hover re-inspects.
- **Adaptive controls** past ~20s / ~40 active days; minimal set (play/pause + seek); seek **jumps**, not scrubs ("too abrupt").
- **Errors in the terminal, not the browser.**

## What We're Building

The loop above and nothing else: CLI setup → fetch history → year-by-year replay (cell fills + popups) → year flips → end, with conditional controls and terminal-handled errors.

## Deferred From the POC

- **A hosted URL anyone can visit** — not possible without count-only public data or credential-harvesting; both fail the kernel.
- **Playback speed control** and **skip-to-next-year buttons** — the seek bar already covers "go somewhere fast."
- **Publishing to npm / running as a hosted service** — publishing is optional; a public repo satisfies the demo.

## Possible Later Enhancements

- Publish to npm so it's a true `npx leet-years` without a clone.
- A labeled sample-data mode for people who want to try it without a cookie.
- Playback speed control; keyboard shortcuts; a totals summary line; comparing two accounts side by side.

## Non-Goals

- No hosted service, no third-party server, no handling of other people's cookies.
- No writing to or modifying LeetCode data.
- No social features, leaderboards, or sharing links.
- No persistence of the session cookie.

## Open Questions

- **`leetcode-query` reliability** — verify it still works against current LeetCode GraphQL early in `5-build`; fallback is the labeled sample-data mode.
- **Exact typeface & accent color** — direction captured under Look and Feel; `4-spec` picks specifics.

## Assumptions

- **Light theme** — implied by light-grey empty cells + the GitHub reference.
- **Errors live in the terminal, not the browser** — the CLI fails fast before opening the browser.
- **~40 active days ≈ 20s** — per-day time is the ~0.5s popup plus a small flip.