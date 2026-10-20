import { useEffect, useState } from 'react'
import Heatmap from './components/Heatmap'
import YearLabel from './components/YearLabel'

export interface Problem {
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}
export interface Day {
  date: string
  problems: Problem[]
}
export interface Year {
  label: number
  days: Day[]
}
export interface History {
  years: Year[]
}

export default function App() {
  const [history, setHistory] = useState<History | null>(null)

  useEffect(() => {
    fetch('/api/submissions')
      .then((r) => r.json())
      .then(setHistory)
      .catch(() => setHistory({ years: [] }))
  }, [])

  if (!history) return <p className="loading">Loading…</p>

  const first = history.years[0]

  return (
    <main className="app">
      <h1 className="title">Leet Years</h1>
      {first ? (
        <>
          <YearLabel label={first.label} />
          <Heatmap />
        </>
      ) : (
        <p className="empty">No practice history found.</p>
      )}
    </main>
  )
}