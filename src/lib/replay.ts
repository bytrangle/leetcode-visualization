import { useEffect, useMemo, useState } from 'react'
import type { History, Year } from '../types'

export type Phase = 'idle' | 'playing' | 'paused' | 'ended'

export const DAY_STEP_MS = 800 // 0.3s flip animation + 0.5s rest before the next cell
export const SEEK_THRESHOLD_DAYS = 40 // show the seek bar only for long histories

export function globalIndexToProgress(
  years: Year[],
  globalIndex: number,
): { yearIndex: number; dayIndex: number } {
  let remaining = globalIndex
  let yearIndex = 0
  while (yearIndex < years.length - 1 && remaining > years[yearIndex].days.length) {
    remaining -= years[yearIndex].days.length
    yearIndex++
  }
  return { yearIndex, dayIndex: Math.min(remaining, years[yearIndex]?.days.length ?? 0) }
}

export function useReplay(history: History | null) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [yearIndex, setYearIndex] = useState(0)
  const [dayIndex, setDayIndex] = useState(0)

  const years = history?.years ?? []
  const year: Year | null = years[yearIndex] ?? null
  const dayCount = year?.days.length ?? 0

  const totalDays = useMemo(() => years.reduce((sum, y) => sum + y.days.length, 0), [years])
  const currentGlobal = useMemo(() => {
    let sum = 0
    for (let i = 0; i < yearIndex; i++) sum += years[i]?.days.length ?? 0
    return sum + dayIndex
  }, [years, yearIndex, dayIndex])

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
      if (yearIndex < years.length - 1) {
        setYearIndex((i) => i + 1)
        setDayIndex(0)
      } else {
        setPhase((p) => (p === 'playing' ? 'ended' : p))
      }
    }, DAY_STEP_MS)
    return () => clearTimeout(id)
  }, [phase, dayIndex, dayCount, yearIndex, years.length])

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

  function seekTo(fraction: number) {
    if (totalDays === 0) return
    const clamped = Math.max(0, Math.min(1, fraction))
    const target = Math.round(clamped * totalDays)
    const { yearIndex: yi, dayIndex: di } = globalIndexToProgress(years, target)
    setYearIndex(yi)
    setDayIndex(di)
    setPhase('paused')
  }

  return { phase, year, dayIndex, totalDays, currentGlobal, play, pause, seekTo }
}