import { stdin, stdout } from 'node:process'
import { SAMPLE_SUBMISSIONS, generateLongHistory } from '../server/sampleData'
import { buildHistory, type History } from '../server/transform'
import { startServer } from '../server/http'
import { fetchAcceptedSubmissions } from '../server/leetcode'

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
    const history: History = buildHistory(useLong ? generateLongHistory() : SAMPLE_SUBMISSIONS)
    startServer(history, PORT, { staticDist: !apiOnly })
    return
  }

  let username = ''
  if (stdin.isTTY) {
    username = await prompt('Enter your LeetCode username: ', false)
  }

  let cookie = process.env.LEETCODE_SESSION ?? ''
  if (!cookie && stdin.isTTY) {
    cookie = await prompt('Paste your LEETCODE_SESSION cookie (hidden): ', true)
  }
  if (!cookie) {
    console.error(
      'No LeetCode session cookie provided.\n' +
        '  • set LEETCODE_SESSION to your cookie, or\n' +
        '  • run in a terminal and paste it, or\n' +
        '  • use --demo for sample data.',
    )
    process.exit(1)
  }

  console.log('Fetching your LeetCode submissions…')
  const { username: realUsername, submissions } = await fetchAcceptedSubmissions(cookie)
  console.log(`Fetched ${submissions.length} accepted submissions for ${realUsername}.`)
  if (username && username !== realUsername) {
    console.log(`Note: that cookie belongs to "${realUsername}", not "${username}".`)
  }

  const history: History = buildHistory(submissions)
  startServer(history, PORT, { staticDist: !apiOnly })
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})