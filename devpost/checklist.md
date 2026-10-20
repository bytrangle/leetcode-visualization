---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. The app boots and renders the empty grey heatmap (sample data)**
  Becomes usable: `npm start -- --demo` opens the browser to the year label and a 7×~53 light-grey grid; `/api/submissions` serves seeded sample history.
  Why now: Bootstraps everything (scaffold, deps, server, frontend) and proves the whole data path end to end with zero external risk, before the kernel lands on top.
  PRD ref: `prd.md > The Core Journey` (steps 1–3), `prd.md > Screens and Layout`
  Spec ref: `spec.md > Components` (CLI entry, Local server, Player, Heatmap), `spec.md > File Structure`, `spec.md > Data Model`
  Build: Scaffold package.json / tsconfig / Vite per the spec; add `server/sampleData.ts`, `server/transform.ts`, `server/http.ts`, `bin/cli.ts` (with `--demo`); add React `App` / `Heatmap` / `Cell` that render the grid grey from `/api/submissions`.
  Verify (mechanical): `npm install` clean; `npm run build` passes; start `npm start -- --demo`; `curl localhost:<PORT>/api/submissions` returns the seeded `years[].days[].problems` shape.
  Learner check: Run `npm start -- --demo`, open the printed localhost URL, and confirm the year label and grey 365-cell grid appear.
  Commit: `Bootstrap app and render sample-data heatmap grid`

- [x] **2. Replay: press play and days fill with difficulty color**
  Becomes usable: Pressing play fills each active day's cell in date order, colored by its average difficulty (green→yellow→red blend), on sample data.
  Why now: This is the unique kernel — the replay with difficulty coloring — so it lands right after the grid exists; everything later supports it.
  PRD ref: `prd.md > Features and Behavior > Replay`, `prd.md > The Core Journey` (step 4)
  Spec ref: `spec.md > Components` (Player, Cell, Color mapping, Replay logic), `spec.md > Data Model`
  Build: Add `src/lib/colors.ts` (difficulty → score 1/2/4 → gradient) and `src/lib/replay.ts` (idle/playing/paused/ended, current day); wire the play/pause toggle into `Controls` and the grey→color card-flip into `Cell`.
  Verify (mechanical): `npm run build` passes; a small scripted assertion on `colors.ts`/`replay.ts` confirms days are ordered by date and a known day maps to its expected blended color.
  Learner check: Press play and watch active days fill in date order with blended difficulty colors; confirm the play button becomes pause.
  Commit: `Add replay: play fills days with difficulty color`

- [ ] **3. Popup: the day's problems with difficulty dots, plus hover**
  Becomes usable: As each cell fills (and on hover), a popup lists that day's problems with per-problem difficulty dots, auto-dismissing after ~0.5s.
  Why now: The popup makes the color legible — it shows which problems produced the day's average; without it the color is unexplained.
  PRD ref: `prd.md > Features and Behavior > Popup`
  Spec ref: `spec.md > Components` (Popup, Cell)
  Build: Add `src/components/Popup.tsx`; position it beside the active cell; list titles with difficulty dots; auto-dismiss in ~0.5s; re-show on hover of a filled cell.
  Verify (mechanical): `npm run build` passes; a scripted check that a known day's popup composes the correct titles + dot colors and that its timer is 0.5s.
  Learner check: Watch a cell fill — its popup should appear and clear ~0.5s later; hover a filled cell and confirm the popup returns.
  Commit: `Add day popup with difficulty dots and hover`

- [ ] **4. Year transition: whole-grid flip, label advance, loop until the end**
  Becomes usable: After a year's last active day, the whole grid flips to the next year (label updates, cells reset grey), continues through the final year, then stops.
  Why now: Completes the "year after year" half of the kernel now that individual days already fill correctly.
  PRD ref: `prd.md > Features and Behavior > Year transition`
  Spec ref: `spec.md > Components` (Heatmap, YearLabel)
  Build: In `src/components/Heatmap.tsx`, add the whole-grid vertical card flip on year change; advance `YearLabel`; reset cells grey; loop until the final year; set the ended state.
  Verify (mechanical): `npm run build` passes; a scripted check that a multi-year sample history produces the correct year sequence and resets state between years.
  Learner check: Let a year finish and confirm the whole grid flips to the next year with the updated label and resets grey; confirm it ends after the final year.
  Commit: `Add year-to-year whole-grid flip`

- [ ] **5. Seek bar (conditional) and restart**
  Becomes usable: For long histories (>~20s / ~40 active days) a seek bar appears above the play button; dragging jumps straight to that point; play after the end restarts.
  Why now: Play/pause already exists from slice 2; this adds the "jump anywhere" control only once the replay loop is complete.
  PRD ref: `prd.md > Features and Behavior > Controls`
  Spec ref: `spec.md > Components` (Controls, Replay logic)
  Build: Add the seek bar (thin bar + round handle) to `Controls.tsx`, rendered only when the history exceeds ~40 active days; dragging sets the replay position (jump, no scrub); wire play-to-restart after ended.
  Verify (mechanical): `npm run build` passes; a scripted check that the "show seek bar" threshold computes from active-day count and that a seek maps to a valid day index.
  Learner check: With the long sample history, confirm the seek bar appears, drag it to a point and see the grid snap there then resume; confirm a short history does not show it.
  Commit: `Add conditional seek bar and restart`

- [ ] **6. Live data: cookie auth via `leetcode-query` with terminal errors**
  Becomes usable: `npm start` (without `--demo`) prompts for the session cookie, fetches real submissions through `leetcode-query`, transforms them to the same shape, and either opens the replay or prints the right terminal error.
  Why now: The kernel is already proven on sample data; this is the one external-risk slice, and arriving here means a broken `leetcode-query` affects only the live path, never the demo.
  PRD ref: `prd.md > Features and Behavior > Setup & authentication`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components` (LeetCode client, Transform), `spec.md > External Services and Dependencies`, `spec.md > Important Failure Modes`
  Build: Add `server/leetcode.ts` using `leetcode-query`; prompt for / read the cookie in `bin/cli.ts`; transform to the standard shape; print terminal errors (auth/empty/network) and exit; keep `--demo` on sample data.
  Verify (mechanical): `npm run build` passes; without a cookie the CLI prompts or exits cleanly; `--demo` still works end to end.
  Learner check: Run `npm start`, paste your real cookie, and confirm it shows your real history (or a specific error if the cookie is expired) — this is the live check that `leetcode-query` still returns full submissions.
  Commit: `Add live LeetCode data via cookie`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 2 (replay visible), feedback can shape popup / year flip / controls
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: [what actually happened; real document/test/code references; unfinished work if interrupted]
Route and stops: [actual paths and symbols; guided stops completed, or reference-only route]
Edit outcome: [tried/kept/reverted/declined/not applicable; verification if changed]
Reflection: [offered/answered/declined/already covered — personal answer belongs only in the ignored profile]
Activity mode: [live app and editor, explicit static fallback, focused alternative, prior practice, or recap]

## Revisions