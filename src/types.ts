export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface Problem {
  title: string
  difficulty: Difficulty
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