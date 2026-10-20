import { SAMPLE_SUBMISSIONS } from '../server/sampleData'
import { buildHistory } from '../server/transform'
import { startServer } from '../server/http'

const args = process.argv.slice(2)
const apiOnly = args.includes('--api-only')
const PORT = Number(process.env.PORT ?? 3000)

// Slice 2: sample data is the only mode yet; `--demo` is accepted for clarity later.
console.log('Loading sample practice history (demo mode)…')
const history = buildHistory(SAMPLE_SUBMISSIONS)

startServer(history, PORT, { staticDist: !apiOnly })