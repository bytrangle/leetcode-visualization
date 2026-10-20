import { useEffect, useState } from 'react'
import Heatmap from './components/Heatmap'
import Title from './components/Title'
import YearLabel from './components/YearLabel'
import { useReplay } from './lib/replay'
import type { History } from './types'

export default function App() {
  const [history, setHistory] = useState<History | null>(null)

  useEffect(() => {
    fetch('/api/submissions')
      .then((r) => r.json())
      .then(setHistory)
      .catch(() => setHistory({ years: [] }))
  }, [])

  const { phase, year, dayIndex, play, pause } = useReplay(history)

  if (!history) return <p className="loading">Loading…</p>
  if (!year) return <p className="empty">No practice history found.</p>

  const toggle = () => {
    if (phase === 'playing') pause()
    else play()
  }

  return (
    <main className="app">
      <Title text="Leet Years" />
      <YearLabel label={year.label} />
      <Heatmap year={year} dayIndex={dayIndex} />
      <div className="controls">
        <button className="play-btn" onClick={toggle}>
          {phase === 'playing' ? 'Pause' : 'Play'}
        </button>
      </div>
    </main>
  )
}