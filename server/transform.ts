import type { Difficulty, Submission } from './sampleData'

export interface Problem {
  title: string
  difficulty: Difficulty
}
export interface Day {
  date: string // YYYY-MM-DD
  problems: Problem[]
}
export interface Year {
  label: number
  days: Day[]
}
export interface History {
  years: Year[]
}

function toDateString(ts: number): string {
  return new Date(ts * 1000).toISOString().slice(0, 10)
}

// Group raw submissions into years → (date → problems), each sorted ascending.
// The live-data path (slice 6) feeds the same shape in here.
export function buildHistory(submissions: Submission[]): History {
  const yearMap = new Map<number, Map<string, Problem[]>>()

  for (const s of submissions) {
    const year = new Date(s.timestamp * 1000).getUTCFullYear()
    const date = toDateString(s.timestamp)
    if (!yearMap.has(year)) yearMap.set(year, new Map())
    const days = yearMap.get(year)!
    if (!days.has(date)) days.set(date, [])
    days.get(date)!.push({ title: s.title, difficulty: s.difficulty })
  }

  const years: Year[] = [...yearMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([label, days]) => ({
      label,
      days: [...days.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, problems]) => ({ date, problems })),
    }))

  return { years }
}