import { useEffect, useState } from 'react'
import Controls from './components/Controls'
import Heatmap from './components/Heatmap'
import Legend from './components/Legend'
import Title from './components/Title'
import YearNav from './components/YearNav'
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

  const {
    phase,
    year,
    dayIndex,
    dayCount,
    epoch,
    canGoPrev,
    canGoNext,
    goPrev,
    goNext,
    play,
    pause,
    seekTo,
  } = useReplay(history)

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
        Your LeetCode practice, one year at a time — each day colored by difficulty.
        Use the arrows to change years, or press Play to watch the days fill in.
      </p>
      {history.username && (
        <p className="history-owner">Practice history for <strong>{history.username}</strong></p>
      )}
      <YearNav
        label={year.label}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={goPrev}
        onNext={goNext}
      />
      <Legend />
      <Heatmap year={year} dayIndex={dayIndex} phase={phase} epoch={epoch} />
      <Controls
        phase={phase}
        dayCount={dayCount}
        dayIndex={dayIndex}
        onToggle={toggle}
        onSeek={seekTo}
      />
    </main>
  )
}