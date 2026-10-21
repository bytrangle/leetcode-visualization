import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { History } from './transform.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The frontend build lives in `dist/`. This file runs from `server/` in the
// source tree and from `build/server/` after compilation, so look in both
// places and use whichever exists.
function findDistDir(): string | null {
  const candidates = [
    path.resolve(__dirname, '../dist'), // build/server -> build/dist (published layout)
    path.resolve(__dirname, '../../dist'), // server -> ./dist (source tree)
  ]
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'index.html'))) return dir
  }
  return null
}

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
    const distDir = findDistDir()
    if (distDir) {
      app.use(express.static(distDir))
    } else {
      console.warn(
        'Warning: frontend build not found. Run `npm run build` before starting the server.',
      )
    }
  }

  return app.listen(port, () => {
    if (opts.staticDist !== false) {
      console.log(`\nFetching completed 🎉. Open http://localhost:${port} in your browser to watch your progress through the years`)
    } else {
      console.log(`Leet Years API → http://localhost:${port}`)
    }
  })
}