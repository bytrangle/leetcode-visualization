import { useEffect, useState } from 'react'
import type { History, Year } from '../types'

export type Phase = 'idle' | 'playing' | 'paused' | 'ended'

const DAY_STEP_MS = 500

export function useReplay(history: History | null) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [yearIndex, setYearIndex] = useState(0)
  const [dayIndex, setDayIndex] = useState(0)

  const years = history?.years ?? []
  const year: Year | null = years[yearIndex] ?? null
  const dayCount = year?.days.length ?? 0

  useEffect(() => {
    if (phase !== 'playing') return
    const id = setInterval(() => {
      setDayIndex((i) => Math.min(i + 1, dayCount))
    }, DAY_STEP_MS)
    return () => clearInterval(id)
  }, [phase, dayCount])

  useEffect(() => {
    if (phase === 'playing' && dayCount > 0 && dayIndex >= dayCount) {
      setPhase('ended')
    }
  }, [phase, dayIndex, dayCount])

  function play() {
    if (phase === 'ended') {
      setYearIndex(0)
      setDayIndex(0)
      setPhase('playing')
    } else if (phase === 'idle' || phase === 'paused') {
      setPhase('playing')
    }
  }

  function pause() {
    if (phase === 'playing') setPhase('paused')
  }

  return { phase, year, dayIndex, play, pause }
}