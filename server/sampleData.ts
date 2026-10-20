export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface Submission {
  title: string
  difficulty: Difficulty
  timestamp: number // unix seconds
}

// Seeded realistic sample history — two years, a few active days each.
// Used by the `--demo` path so the app runs with no cookie and no network.
const D = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d) / 1000

export const SAMPLE_SUBMISSIONS: Submission[] = [
  // 2021 — earliest year
  { title: 'Two Sum', difficulty: 'Easy', timestamp: D(2021, 3, 4) },
  { title: 'Reverse Linked List', difficulty: 'Easy', timestamp: D(2021, 3, 4) },
  { title: 'Add Two Numbers', difficulty: 'Medium', timestamp: D(2021, 3, 10) },
  { title: 'Median of Two Sorted Arrays', difficulty: 'Hard', timestamp: D(2021, 4, 1) },
  { title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', timestamp: D(2021, 4, 1) },
  { title: 'Merge Two Sorted Lists', difficulty: 'Easy', timestamp: D(2021, 5, 15) },
  // 2022
  { title: 'Two Sum II - Input Array Is Sorted', difficulty: 'Medium', timestamp: D(2022, 1, 6) },
  { title: 'Number of Islands', difficulty: 'Medium', timestamp: D(2022, 2, 20) },
  { title: 'Trapping Rain Water', difficulty: 'Hard', timestamp: D(2022, 2, 20) },
  { title: 'Climbing Stairs', difficulty: 'Easy', timestamp: D(2022, 6, 30) },
]

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