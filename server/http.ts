import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { History } from './transform'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function startServer(history: History, port: number) {
  const app = express()

  app.get('/api/submissions', (_req, res) => {
    res.json(history)
  })

  app.use(express.static(path.resolve(__dirname, '../dist')))

  return app.listen(port, () => {
    console.log(`Leet Years → http://localhost:${port}`)
  })
}