// Generates the anonymised sample history used when the user skips the cookie.
//
// The goal: the sample must look like a genuine LeetCode practice history —
// real problem titles, real difficulties, a believable rhythm of days — while
// being unrecognisable as any one person's real history.
//
// Approach:
//   1. Source real problem titles + difficulties from LeetCode's public
//      problem catalog (no auth required).
//   2. Exclude every title that appears in the learner's own history (read
//      from the local, git-ignored fetch cache), so the sample shares no
//      identifiable problem set with it.
//   3. Draw a fresh practice calendar: the same year range and the same
//      statistical shape (problems-per-day distribution, weekday bias, daily
//      volume) as a typical history, but a different realisation.
//   4. Assign problems to days at random, preserving the target difficulty mix.
//
// The excluded-title list is read from .cache/submissions.json, which is
// git-ignored — the learner's real problem set never enters the repository.
//
// Usage: node scripts/generateSampleData.mjs [outfile]

import { readFile, writeFile, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = process.argv[2] ?? path.join(ROOT, 'server', 'sample-2023-2026.json')
const CATALOG_URL = 'https://leetcode-api-pied.vercel.app/problems'
const SEED = 20240607

// ---- deterministic PRNG (mulberry32) so regeneration is reproducible -------
function makeRng(seed) {
  let a = seed >>> 0
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = makeRng(SEED)
function shuffled(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ---- 1. public problem catalog -------------------------------------------
console.log('Fetching the public problem catalog…')
const res = await fetch(CATALOG_URL, { headers: { Origin: 'https://leetcode.com' } })
if (!res.ok) throw new Error(`catalog fetch failed: HTTP ${res.status}`)
const raw = await res.json()
const list = Array.isArray(raw) ? raw : (raw.questions ?? [])
const catalog = list
  .filter((q) => ['Easy', 'Medium', 'Hard'].includes(q.difficulty))
  .map((q) => ({ title: q.title, difficulty: q.difficulty }))
console.log(`  ${catalog.length} problems`)

// ---- 2. exclude everything from the learner's own history -----------------
// The local fetch cache holds the learner's real submissions (git-ignored).
// Every title in it is excluded from the catalog, so the sample shares no
// identifiable problem set with the real history.
const CACHE = path.join(ROOT, '.cache', 'submissions.json')
const excludedTitles = new Set()
try {
  await access(CACHE)
  const cache = JSON.parse(await readFile(CACHE, 'utf8'))
  for (const s of cache.submissions ?? cache) {
    if (s.title) excludedTitles.add(s.title)
  }
  console.log(`  excluding ${excludedTitles.size} titles from the local fetch cache`)
} catch {
  console.log('  no local cache found — cannot exclude personal titles')
}

const fresh = catalog.filter((p) => !excludedTitles.has(p.title))
console.log(`  ${fresh.length} problems remain after exclusion`)

const byDifficulty = { Easy: [], Medium: [], Hard: [] }
for (const p of fresh) byDifficulty[p.difficulty].push(p)
for (const k of Object.keys(byDifficulty)) byDifficulty[k] = shuffled(byDifficulty[k])

// ---- 3. practice calendar -------------------------------------------------
// Same shape as a real history: a long run of single-problem days, a tail of
// multi-problem days, and a bias toward weekdays over weekends.
const YEARS = [2023, 2024, 2025, 2026]
const ACTIVE_DAYS_PER_YEAR = { 2023: 118, 2024: 132, 2025: 196, 2026: 121 }
const MULTI_DAY_CHANCE = 0.26 // fraction of active days with 2+ problems
const WEEKDAY_WEIGHT = 8 // relative weight of a weekday vs. a weekend day
const HOUR_PEAK_UTC = 9 // most practice happens late morning UTC
const REPEAT_CHANCE = 0.25 // chance a problem is one already solved before

function isWeekend(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`).getUTCDay()
  return d === 0 || d === 6
}

// Pick active days per year: spread over the year, weekday-weighted.
function pickActiveDays(year, count) {
  const start = Date.UTC(year, 0, 1)
  const end = Date.UTC(year, 11, 31)
  const daysInYear = Math.round((end - start) / 86400000) + 1
  const weighted = []
  for (let i = 0; i < daysInYear; i++) {
    const date = new Date(start + i * 86400000).toISOString().slice(0, 10)
    const copies = isWeekend(date) ? 1 : WEEKDAY_WEIGHT
    for (let k = 0; k < copies; k++) weighted.push(date)
  }
  const chosen = new Set()
  const pool = shuffled(weighted)
  let guard = 0
  while (chosen.size < count && guard < pool.length * 20) {
    const d = pool[guard++]
    if (!chosen.has(d)) chosen.add(d)
  }
  return [...chosen].sort()
}

// Problems per active day: mostly 1, occasionally 2–5.
function problemsForDay() {
  if (rng() > MULTI_DAY_CHANCE) return 1
  const r = rng()
  if (r < 0.72) return 2
  if (r < 0.9) return 3
  if (r < 0.97) return 4
  return 5
}

// Difficulty mix matching a realistic history: ~28% easy, ~60% medium, ~12% hard.
function pickDifficulty() {
  const r = rng()
  if (r < 0.28) return 'Easy'
  if (r < 0.88) return 'Medium'
  return 'Hard'
}

// A practice session starts near the peak hour and drifts a little.
function sessionHour() {
  return Math.max(0, Math.min(23, Math.round(HOUR_PEAK_UTC + (rng() - 0.5) * 6)))
}

const submissions = []
// Problems already solved, per difficulty — real practice re-solves old ones.
const solved = { Easy: [], Medium: [], Hard: [] }
for (const year of YEARS) {
  const activeDays = pickActiveDays(year, ACTIVE_DAYS_PER_YEAR[year])
  for (const date of activeDays) {
    const n = problemsForDay()
    let hour = sessionHour()
    const dayTs = Math.floor(new Date(`${date}T00:00:00Z`).getTime() / 1000)
    for (let i = 0; i < n; i++) {
      const difficulty = pickDifficulty()
      // Sometimes re-solve something already attempted; otherwise take a new one.
      const redo = solved[difficulty].length > 0 && rng() < REPEAT_CHANCE
      let p
      if (redo) {
        p = solved[difficulty][Math.floor(rng() * solved[difficulty].length)]
      } else {
        const bucket = byDifficulty[difficulty]
        p = bucket.length > 0 ? bucket.pop() : pick(fresh)
        solved[difficulty].push(p)
      }
      const minute = Math.floor(rng() * 60)
      const second = Math.floor(rng() * 60)
      submissions.push({
        title: p.title,
        difficulty,
        timestamp: dayTs + hour * 3600 + minute * 60 + second,
      })
      hour = Math.min(23, hour + 1 + Math.floor(rng() * 2))
    }
  }
}

submissions.sort((a, b) => a.timestamp - b.timestamp)
await writeFile(OUT, JSON.stringify(submissions, null, 2) + '\n')

// ---- report ---------------------------------------------------------------
const diff = {}
for (const s of submissions) diff[s.difficulty] = (diff[s.difficulty] || 0) + 1
const days = new Set(
  submissions.map((s) => new Date(s.timestamp * 1000).toISOString().slice(0, 10)),
)
console.log(`\nWrote ${submissions.length} submissions to ${path.relative(ROOT, OUT)}`)
console.log(`  distinct problems: ${new Set(submissions.map((s) => s.title)).size}`)
console.log(`  practice days:     ${days.size}`)
console.log(`  difficulty mix:    ${JSON.stringify(diff)}`)
console.log(
  `  years:             ${[...new Set(submissions.map((s) => new Date(s.timestamp * 1000).getUTCFullYear()))].join(', ')}`,
)
console.log(`  titles overlapping the real history: ${submissions.filter((s) => excludedTitles.has(s.title)).length}`)
