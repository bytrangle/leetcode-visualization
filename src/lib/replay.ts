import { useEffect, useState } from 'react'
import type { History, Year } from '../types'
import { DAY_STEP_MS } from './timing'

export type Phase = 'idle' | 'playing' | 'paused' | 'ended'

export function useReplay(history: History | null) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [yearIndex, setYearIndex] = useState(0)
  const [dayIndex, setDayIndex] = useState(0)
  const [epoch, setEpoch] = useState(0)

  const years = history?.years ?? []
  const year: Year | null = years[yearIndex] ?? null
  const dayCount = year?.days.length ?? 0
  const yearCount = years.length

  useEffect(() => {
    if (phase !== 'playing') return
    const id = setInterval(() => {
      setDayIndex((i) => Math.min(i + 1, dayCount))
    }, DAY_STEP_MS)
    return () => clearInterval(id)
  }, [phase, dayCount])

  useEffect(() => {
    if (phase !== 'playing' || dayCount === 0 || dayIndex < dayCount) return
    const id = setTimeout(() => {
      setPhase((p) => (p === 'playing' ? 'ended' : p))
    }, DAY_STEP_MS)
    return () => clearTimeout(id)
  }, [phase, dayCount, dayIndex])

  function goToYear(i: number) {
    if (i < 0 || i >= yearCount) return
    setYearIndex(i)
    setDayIndex(0)
    setPhase('idle')
  }

  function play() {
    if (phase === 'idle' || phase === 'ended') {
      setEpoch((e) => e + 1)
      setDayIndex(0)
      setPhase('playing')
    } else if (phase === 'paused') {
      setPhase('playing')
    }
  }

  function pause() {
    if (phase === 'playing') setPhase('paused')
  }

  function seekTo(fraction: number) {
    if (dayCount === 0) return
    const clamped = Math.max(0, Math.min(1, fraction))
    setDayIndex(Math.round(clamped * dayCount))
    setPhase('paused')
  }

  return {
    phase,
    year,
    dayIndex,
    dayCount,
    epoch,
    canGoPrev: yearIndex > 0,
    canGoNext: yearIndex < yearCount - 1,
    goPrev: () => goToYear(yearIndex - 1),
    goNext: () => goToYear(yearIndex + 1),
    play,
    pause,
    seekTo,
  }
}