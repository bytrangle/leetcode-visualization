import { Credential, LeetCode } from 'leetcode-query'
import type { Difficulty, Submission } from './sampleData.js'

export const AUTH_ERROR = 'Invalid or expired LeetCode session cookie.'
export const EMPTY_ERROR = 'This account has no practice history yet.'
export const NETWORK_ERROR = 'Could not reach LeetCode — check your connection and try again.'

async function net<T>(p: Promise<T>): Promise<T> {
  try {
    return await p
  } catch {
    throw new Error(NETWORK_ERROR)
  }
}

export async function authenticate(cookie: string): Promise<{ lc: LeetCode; username: string }> {
  const credential = new Credential()
  await net(credential.init(cookie))
  const lc = new LeetCode(credential)
  const who = await net(lc.whoami())
  if (!who.isSignedIn) throw new Error(AUTH_ERROR)
  console.log(`Signed in as ${who.username}.`)
  return { lc, username: who.username }
}

// First run: build the full titleSlug → difficulty map from the public problem list.
export async function fetchAllDifficulties(lc: LeetCode): Promise<Map<string, Difficulty>> {
  const map = new Map<string, Difficulty>()
  let offset = 0
  for (;;) {
    const list = await net(lc.problems({ limit: 50, offset }))
    const questions = list.questions ?? []
    if (questions.length === 0) break
    for (const q of questions) {
      if (q.difficulty === 'Easy' || q.difficulty === 'Medium' || q.difficulty === 'Hard') {
        map.set(q.titleSlug, q.difficulty)
      }
    }
    offset += questions.length
    console.log(`Indexing problem difficulties (${map.size} problems)…`)
    if (list.total != null && offset >= list.total) break
  }
  return map
}

// Fetch accepted submissions newer than `sinceSeconds` (newest-first), resolving
// each difficulty from `difficulties` and fetching any missing slug individually.
export async function fetchAcceptedSince(
  lc: LeetCode,
  sinceSeconds: number,
  difficulties: Map<string, Difficulty>,
): Promise<{ submissions: Submission[]; difficulties: Map<string, Difficulty> }> {
  const raw: { title: string; titleSlug: string; timestamp: number }[] = []
  let offset = 0
  for (;;) {
    const page = await net(lc.submissions({ limit: 20, offset }))
    if (page.length === 0) break
    let sawOld = false
    for (const s of page) {
      const secs = s.timestamp / 1000 // leetcode-query returns milliseconds
      if (secs > sinceSeconds) {
        if (s.statusDisplay === 'Accepted') {
          raw.push({ title: s.title, titleSlug: s.titleSlug, timestamp: secs })
        }
      } else {
        sawOld = true
      }
    }
    console.log(`Scanned ${offset + page.length} submissions…`)
    if (sawOld || page.length < 20) break
    offset += page.length
  }

  const submissions: Submission[] = []
  const seen = new Set<string>()
  for (const s of raw) {
    let difficulty = difficulties.get(s.titleSlug)
    if (!difficulty) {
      try {
        const problem = await net(lc.problem(s.titleSlug))
        difficulty = problem.difficulty
        difficulties.set(s.titleSlug, difficulty)
      } catch {
        difficulty = undefined
      }
    }
    if (!difficulty) continue
    const day = new Date(s.timestamp * 1000).toISOString().slice(0, 10)
    const key = `${s.titleSlug}:${day}`
    if (seen.has(key)) continue // dedupe repeated solves of the same problem in one day
    seen.add(key)
    submissions.push({ title: s.title, difficulty, timestamp: s.timestamp })
  }

  return { submissions, difficulties }
}