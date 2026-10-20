import fs from 'node:fs'
import path from 'node:path'
import type { Difficulty, Submission } from './sampleData'

export const SUBMISSIONS_TTL_SECONDS = 60 * 60 // 1 hour — serve cached data within this window
export const DIFFICULTIES_TTL_SECONDS = 30 * 24 * 60 * 60 // 30 days — problem difficulties rarely change

const CACHE_DIR = path.resolve(process.cwd(), '.cache')

export interface SubmissionsCache {
  savedAt: number // unix seconds
  submissions: Submission[]
}

export interface DifficultiesCache {
  savedAt: number
  map: Record<string, Difficulty>
}

export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

export function maxTimestamp(submissions: Submission[]): number {
  if (submissions.length === 0) return 0
  return Math.max(...submissions.map((s) => s.timestamp))
}

// Merge cached + freshly fetched, deduping by problem title + day.
export function mergeSubmissions(oldSubs: Submission[], newerSubs: Submission[]): Submission[] {
  const byKey = new Map<string, Submission>()
  for (const s of oldSubs) byKey.set(keyOf(s), s)
  for (const s of newerSubs) byKey.set(keyOf(s), s)
  return [...byKey.values()]
}

function keyOf(s: Submission): string {
  return `${s.title}:${new Date(s.timestamp * 1000).toISOString().slice(0, 10)}`
}

function readJson<T>(file: string): T | null {
  try {
    const p = path.join(CACHE_DIR, file)
    if (!fs.existsSync(p)) return null
    return JSON.parse(fs.readFileSync(p, 'utf8')) as T
  } catch {
    return null
  }
}

function writeJson(file: string, data: unknown): void {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
    fs.writeFileSync(path.join(CACHE_DIR, file), JSON.stringify(data, null, 2))
  } catch {
    // a failed cache write isn't fatal
  }
}

export function loadSubmissionsCache(): SubmissionsCache | null {
  return readJson<SubmissionsCache>('submissions.json')
}

export function saveSubmissionsCache(cache: SubmissionsCache): void {
  writeJson('submissions.json', cache)
}

export function loadDifficultiesCache(): DifficultiesCache | null {
  return readJson<DifficultiesCache>('difficulties.json')
}

export function saveDifficultiesCache(cache: DifficultiesCache): void {
  writeJson('difficulties.json', cache)
}