import { SAMPLE_SUBMISSIONS } from '../server/sampleData'
import { buildHistory } from '../server/transform'
import { startServer } from '../server/http'

const PORT = Number(process.env.PORT ?? 3000)

// Slice 1: only the demo (sample-data) path exists yet.
console.log('Loading sample practice history (demo mode)…')
const history = buildHistory(SAMPLE_SUBMISSIONS)
startServer(history, PORT)