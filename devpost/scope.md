---
doc: scope
status: approved
---

# Leet Years

A web app that replays your own LeetCode practice history as an animated, difficulty-colored heatmap.

## The Unique Kernel

Two things, and it needs both:

**It's a replay, not a picture.** The GitHub contribution graph is static. This unfolds a practice history chronologically — day by day through a year, then year after year through the whole history, each day filling in as the replay reaches it. Strip the animation out and you're left with a static heatmap that already exists in the world.

**Color answers a different question than GitHub's does.** GitHub's grid says *how much did you do*. This says *how hard was what you did* — each day is weighted by the average difficulty of the problems solved in it, not by their count.

The learner's verdict on this framing: *"you put it into words better than I can."*

## Who It's For

**LeetCode users who have solved problems.** They want to see the intensity and difficulty of their own practice journey across the years — something LeetCode itself doesn't show them.

Leet Years is a **self-hosted, open-source personal tool**. Each person runs it on their own machine, authorizes it against their own LeetCode account (their session cookie, pasted into their own terminal), and the app reads only their own history. There is no hosted service and no operator handling anyone else's credentials.

## The Core Loop

You launch the tool (`npx leet-years`), paste your LeetCode session cookie into your own terminal, and the app fetches your full submission history. A year's grid appears empty in light grey. The replay colors it in, day by day. Then it moves to the next year and does it again, until the history runs out.

That's the whole loop. There is no second thing the user does.

## Inspiration & Identity

**The GitHub contribution graph** — the learner's own reference: *"The heatmap will look similar to the contribution map on each Github user's profile."*

Direction (minimal but friendly, GitHub graph reference) was captured in `3-prd` and carried into `4-spec` as implementable styling.

## Why This Matters to the Learner

Not established. The optional deeper-interview invitation in `1-start` was made once and not taken up, and this section is recorded as open rather than filled in with an invented motivation.

## What "Working" Looks Like

The learner's own demo script — this is the finish line, and it has to be showable in about a minute:

1. In a terminal you run `npx leet-years` and paste your LeetCode session cookie when asked.
2. A browser tab opens on localhost with a heatmap of **365 cells in light grey** (the "Leet Years" title and the year label above it).
3. The displayed year is the **earliest year with practice data** for your account.
4. The replay starts at that year's **earliest day with practice data**, filling the cell with the color for that day's **average difficulty**.
5. The cell **transitions from light grey to its final color** — the learner's description: *"it will look like someone flips a cube."*
6. It continues through to the **last day of that year with data**.
7. Then it advances to the **next year with data**: every cell resets to light grey, and the process repeats.
8. It repeats until the **final year with data**.

Coloring rule: **easy = green, medium = yellow, hard = red**, keyed to the average difficulty of the problems solved that day.

Days with no practice stay light grey and are skipped by the replay.

## The POC Boundary

**In:** exactly the flow above, and nothing else. The learner's answer when asked what to cut was that everything described is the whole thing.

That makes this an unusually tight scope — arriving at a precise, demonstrable, single-loop proof of concept is normally the hard part of this conversation, and it was already done.

The scope stays coherent because every element is load-bearing:

- The **replay** is the kernel. Without it there's no project.
- **Difficulty-colored cells** are the other half of the kernel.
- The **popup listing that day's problems with a difficulty dot on each** is what makes the color legible — it shows *which* problems produced that day's average.
- The **hover to re-show a past popup** is how a visitor inspects anything after the replay has moved on.

Demo video and public GitHub repository are required for submission. Deployment is not applicable — a cookie-authenticated tool is local by design, and the public repo is the distribution.

## Later

None named by the learner.

## Explicitly Cut

None — and that's a finding rather than an omission.

Nothing was cut because nothing beyond the described flow was proposed. This proof of concept is small enough that no proposed feature needed to be removed to protect it.

Two things follow from that, for whoever builds this:

- The pressure to add will arrive during `5-build`, not now, and it will feel reasonable at the time. This section is the record that it wasn't part of the plan.
- Several behaviors a visitor might expect were never proposed at all — see **Notes** below. They are unaddressed, not cut.

## Notes

Observations carried from the scope conversation; several were resolved later in `3-prd`/`4-spec`.

- **Data source.** Full per-day difficulty history is not public; LeetCode exposes daily submission *counts* and recent submissions, not "which problems, what difficulty, on which day." So the app authenticates as the user via their own session cookie and pulls their full submissions through `leetcode-query`. `4-spec` treats this as a dependency risk (unofficial, may break) and verifies it early in the build.
- **Playback control was never raised** — resolved in `3-prd` (conditional play/pause + seek).
- **No-data and error behavior was never raised** — resolved in `3-prd` (terminal messages).
- **Popup timing is approximate** — resolved in `3-prd` (0.5s).

The learner logs out between sessions, so **artifact-based resumption is not optional for them**; it is how they will actually work.

> Read by the planning skills (`2-scope`, `3-prd`, `4-spec`) to carry context forward without repeating the interview.