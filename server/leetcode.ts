import { Credential, LeetCode } from 'leetcode-query'
import type { Difficulty, Submission } from './sampleData'

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

// Build titleSlug → difficulty from the full public problem list.
async function slugsToDifficulty(lc: LeetCode): Promise<Map<string, Difficulty>> {
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

// Authenticate with the session cookie and return accepted submissions as
// the standard { title, difficulty, timestamp } shape.
export async function fetchAcceptedSubmissions(
  cookie: string,
): Promise<{ username: string; submissions: Submission[] }> {
  const credential = new Credential()
  await net(credential.init(cookie))
  const lc = new LeetCode(credential)

  const who = await net(lc.whoami())
  if (!who.isSignedIn) throw new Error(AUTH_ERROR)
  console.log(`Signed in as ${who.username}.`)

  // Paginate through all submissions; keep only accepted ones.
  const raw: { title: string; titleSlug: string; timestamp: number }[] = []
  let offset = 0
  let scanned = 0
  for (;;) {
    const page = await net(lc.submissions({ limit: 20, offset }))
    if (page.length === 0) break
    scanned += page.length
    console.log(`Scanned ${scanned} submissions…`)
    for (const s of page) {
      if (s.statusDisplay === 'Accepted') {
        raw.push({ title: s.title, titleSlug: s.titleSlug, timestamp: s.timestamp })
      }
    }
    if (page.length < 20) break
    offset += page.length
  }

  console.log(`Found ${raw.length} accepted submissions.`)
  if (raw.length === 0) throw new Error(EMPTY_ERROR)

  const slugDifficulty = await slugsToDifficulty(lc)

  const out: Submission[] = []
  const seen = new Set<string>()
  for (const s of raw) {
    const difficulty = slugDifficulty.get(s.titleSlug)
    if (!difficulty) continue // skip problems we couldn't classify
    const day = new Date(s.timestamp * 1000).toISOString().slice(0, 10)
    const key = `${s.titleSlug}:${day}`
    if (seen.has(key)) continue // dedupe repeated solves of the same problem in one day
    seen.add(key)
    out.push({ title: s.title, difficulty, timestamp: s.timestamp })
  }

  if (out.length === 0) throw new Error(EMPTY_ERROR)
  return { username: who.username, submissions: out }
}