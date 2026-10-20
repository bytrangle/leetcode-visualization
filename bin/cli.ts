import { SAMPLE_SUBMISSIONS, generateLongHistory } from '../server/sampleData'
import { buildHistory } from '../server/transform'
import { startServer } from '../server/http'

const args = process.argv.slice(2)
const apiOnly = args.includes('--api-only')
const useLong = args.includes('--long')
const PORT = Number(process.env.PORT ?? 3000)

console.log(
  useLong ? 'Loading long sample history (--long)…' : 'Loading sample practice history (demo)…',
)
const history = buildHistory(useLong ? generateLongHistory() : SAMPLE_SUBMISSIONS)

startServer(history, PORT, { staticDist: !apiOnly })