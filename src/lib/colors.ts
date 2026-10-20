import type { Difficulty } from '../types'

const SCORES: Record<Difficulty, number> = { Easy: 1, Medium: 2, Hard: 4 }

const GREEN: [number, number, number] = [46, 160, 67]
const YELLOW: [number, number, number] = [210, 168, 0]
const RED: [number, number, number] = [201, 75, 75]
const GREY = 'rgb(235, 237, 240)'

function blend(from: number[], to: number[], t: number): string {
  const r = Math.round(from[0] + (to[0] - from[0]) * t)
  const g = Math.round(from[1] + (to[1] - from[1]) * t)
  const b = Math.round(from[2] + (to[2] - from[2]) * t)
  return `rgb(${r}, ${g}, ${b})`
}

export function averageDifficulty(problems: { difficulty: Difficulty }[]): number {
  if (problems.length === 0) return 0
  return problems.reduce((sum, p) => sum + SCORES[p.difficulty], 0) / problems.length
}

export function averageColor(avg: number): string {
  if (avg <= 1) return `rgb(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]})`
  if (avg <= 2) return blend(GREEN, YELLOW, (avg - 1) / 1)
  if (avg <= 4) return blend(YELLOW, RED, (avg - 2) / 2)
  return `rgb(${RED[0]}, ${RED[1]}, ${RED[2]})`
}

export function dayColor(problems: { difficulty: Difficulty }[]): string {
  if (problems.length === 0) return GREY
  return averageColor(averageDifficulty(problems))
}