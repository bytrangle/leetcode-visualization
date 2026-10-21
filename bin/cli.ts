import { stdin, stdout } from 'node:process'
import { SAMPLE_SUBMISSIONS, generateLongHistory } from '../server/sampleData'
import type { Difficulty } from '../server/sampleData'
import { buildHistory, type History } from '../server/transform'
import { startServer } from '../server/http'
import {
  EMPTY_ERROR,
  authenticate,
  fetchAllDifficulties,
  fetchAcceptedSince,
} from '../server/leetcode'
import {
  DIFFICULTIES_TTL_SECONDS,
  SUBMISSIONS_TTL_SECONDS,
  loadDifficultiesCache,
  loadSubmissionsCache,
  maxTimestamp,
  mergeSubmissions,
  nowSeconds,
  saveDifficultiesCache,
  saveSubmissionsCache,
} from '../server/cache'

const args = process.argv.slice(2)
const apiOnly = args.includes('--api-only')
const useLong = args.includes('--long')
const useDemo = args.includes('--demo')
const PORT = Number(process.env.PORT ?? 3000)

function prompt(question: string, secret: boolean): Promise<string> {
  return new Promise((resolve) => {
    stdout.write(question)
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf8')
    let value = ''
    const onData = (c: string) => {
      switch (c) {
        case '\u0003':
        case '\u0004':
          stdout.write('\n')
          process.exit(1)
          break
        case '\r':
        case '\n':
          stdin.setRawMode(false)
          stdin.pause()
          stdout.write('\n')
          stdin.off('data', onData)
          resolve(value.trim())
          break
        case '\u007f':
        case '\b':
          if (value.length > 0) {
            value = value.slice(0, -1)
            if (!secret) stdout.write('\b \b')
          }
          break
        default:
          value += c
          if (!secret) stdout.write(c)
      }
    }
    stdin.on('data', onData)
  })
}

async function main() {
  if (useDemo || useLong) {
    console.log(
      useLong ? 'Loading long sample history (--long)…' : 'Loading sample practice history (demo)…',
    )
    const history: History = buildHistory(
      useLong ? generateLongHistory() : SAMPLE_SUBMISSIONS,
      useLong ? 'demo-long' : 'demo',
    )
    startServer(history, PORT, { staticDist: !apiOnly })
    return
  }

  let username = ''
  if (stdin.isTTY) username = await prompt('Enter your LeetCode username: ', false)

  let cookie = process.env.LEETCODE_SESSION ?? ''
  if (!cookie && stdin.isTTY) cookie = await prompt('Paste your LEETCODE_SESSION cookie (hidden): ', true)
  if (!cookie) {
    console.error(
      'No LeetCode session cookie provided.\n' +
        '  • set LEETCODE_SESSION to your cookie, or\n' +
        '  • run in a terminal and paste it, or\n' +
        '  • use --demo for sample data.',
    )
    process.exit(1)
  }

  const now = nowSeconds()

  // 1. Fresh cache (within 1h) → serve it without touching the network.
  const cached = loadSubmissionsCache()
  if (cached && now - cached.savedAt < SUBMISSIONS_TTL_SECONDS) {
    const mins = Math.max(1, Math.round((now - cached.savedAt) / 60))
    console.log(`Using cached fetch from ~${mins} min ago (${cached.submissions.length} accepted submissions).`)
    // A cache written before the username was tracked has none — one cheap whoami
    // call fills it in (no full submission scan).
    let cachedUsername = cached.username
    if (!cachedUsername) {
      try {
        cachedUsername = (await authenticate(cookie)).username
        saveSubmissionsCache({ ...cached, username: cachedUsername })
        console.log(`Identified account as ${cachedUsername}.`)
      } catch {
        // non-fatal: the page just omits the username
      }
    }
    startServer(buildHistory(cached.submissions, cachedUsername), PORT, { staticDist: !apiOnly })
    return
  }

  console.log('Fetching your LeetCode submissions…')
  const { lc, username: realUsername } = await authenticate(cookie)
  if (username && username !== realUsername) {
    console.log(`Note: that cookie belongs to "${realUsername}", not "${username}".`)
  }

  // 2. Difficulty map: reuse if fresh, else full build (and cache it).
  let difficulties: Map<string, Difficulty>
  const cachedDiff = loadDifficultiesCache()
  if (cachedDiff && now - cachedDiff.savedAt < DIFFICULTIES_TTL_SECONDS) {
    difficulties = new Map(Object.entries(cachedDiff.map))
    console.log(`Reusing cached problem difficulties (${difficulties.size} problems).`)
  } else {
    difficulties = await fetchAllDifficulties(lc)
    saveDifficultiesCache({ savedAt: now, map: Object.fromEntries(difficulties) })
  }

  // 3. Only fetch submissions newer than the newest we already have.
  const sinceSeconds = cached ? maxTimestamp(cached.submissions) : 0
  const { submissions: freshSubs, difficulties: updatedDifficulties } = await fetchAcceptedSince(
    lc,
    sinceSeconds,
    difficulties,
  )
  saveDifficultiesCache({ savedAt: now, map: Object.fromEntries(updatedDifficulties) })

  const merged = mergeSubmissions(cached?.submissions ?? [], freshSubs)
  if (merged.length === 0) {
    console.error(EMPTY_ERROR)
    process.exit(1)
  }
  saveSubmissionsCache({ savedAt: now, submissions: merged, username: realUsername })
  console.log(`Fetched ${freshSubs.length} new; ${merged.length} total accepted submissions.`)

  const history: History = buildHistory(merged, realUsername)
  startServer(history, PORT, { staticDist: !apiOnly })
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})