export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface Submission {
  title: string
  difficulty: Difficulty
  timestamp: number // unix seconds
}

// Realistic sample history — the learner's own 2023–2026 practice, captured
// to `server/sample-2023-2026.json`. Used whenever the cookie is skipped, so
// the app runs with no cookie and no network.
import sampleSubmissions from './sample-2023-2026.json' with { type: 'json' }

export const SAMPLE_SUBMISSIONS: Submission[] = sampleSubmissions as Submission[]

// Whose history the sample file is — shown on the page and in the CLI summary.
export const SAMPLE_USERNAME = 'bytrangle'

// A long synthetic history (3 years × 20 active days) for testing controls
// that only appear on extended replays (the seek bar).
export function generateLongHistory(): Submission[] {
  const DIFFS = ['Easy', 'Medium', 'Hard'] as const
  const subs: Submission[] = []
  let n = 1
  for (let year = 2019; year <= 2021; year++) {
    for (let i = 0; i < 20; i++) {
      const ts = Date.UTC(year, 0, 2 + i * 18) / 1000 // one day every ~18 days
      const perDay = 1 + (i % 3)
      for (let p = 0; p < perDay; p++) {
        subs.push({
          title: `Sample Problem ${n++}`,
          difficulty: DIFFS[(i + p) % 3],
          timestamp: ts + p * 3600,
        })
      }
    }
  }
  return subs
}