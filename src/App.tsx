import { useEffect, useState } from 'react'
import Controls from './components/Controls'
import Heatmap from './components/Heatmap'
import Legend from './components/Legend'
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

  const { phase, year, dayIndex, totalDays, currentGlobal, play, pause, seekTo } = useReplay(history)

  if (!history) return <p className="loading">Loading…</p>
  if (!year) return <p className="empty">No practice history found.</p>

  const toggle = () => {
    if (phase === 'playing') pause()
    else play()
  }

  return (
    <main className="app">
      <Title text="Leet Years" />
      <p className="intro">
        Your LeetCode practice, replayed year by year — each day colored by difficulty.
        Press Play to begin.
      </p>
      <YearLabel label={year.label} />
      <Legend />
      <Heatmap year={year} dayIndex={dayIndex} phase={phase} />
      <Controls
        phase={phase}
        totalDays={totalDays}
        currentGlobal={currentGlobal}
        onToggle={toggle}
        onSeek={seekTo}
      />
    </main>
  )
}