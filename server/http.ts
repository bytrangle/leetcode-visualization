import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { History } from './transform'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function startServer(
  history: History,
  port: number,
  opts: { staticDist?: boolean } = {},
) {
  const app = express()

  app.get('/api/submissions', (_req, res) => {
    res.json(history)
  })

  if (opts.staticDist !== false) {
    app.use(express.static(path.resolve(__dirname, '../dist')))
  }

  return app.listen(port, () => {
    if (opts.staticDist !== false) {
      console.log(`\nFetching completed 🎉. Open http://localhost:${port} in your browser to watch your progress through the years`)
    } else {
      console.log(`Leet Years API → http://localhost:${port}`)
    }
  })
}