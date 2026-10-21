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