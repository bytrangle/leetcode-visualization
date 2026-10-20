import Cell from './Cell'
import { dayColor } from '../lib/colors'
import type { Day, Year } from '../types'

const WEEK_COLUMNS = 53
const WEEK_ROWS = 7

// Map a YYYY-MM-DD date to a GitHub-style (column, row): columns are weeks,
// rows are days of the week (Sunday = 0).
function dayPosition(date: string): { col: number; row: number } {
  const d = new Date(date + 'T00:00:00Z')
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const dayOfYear = Math.floor((d.getTime() - yearStart.getTime()) / 86400000)
  const firstWeekday = yearStart.getUTCDay()
  const offset = dayOfYear + firstWeekday
  return { col: Math.floor(offset / 7), row: offset % 7 }
}

interface HeatmapProps {
  year: Year
  dayIndex: number
}

export default function Heatmap({ year, dayIndex }: HeatmapProps) {
  const posToDay = new Map<string, { day: Day; index: number }>()
  for (let i = 0; i < year.days.length; i++) {
    const day = year.days[i]
    const { col, row } = dayPosition(day.date)
    posToDay.set(`${col}:${row}`, { day, index: i })
  }

  const cells = []
  for (let col = 0; col < WEEK_COLUMNS; col++) {
    for (let row = 0; row < WEEK_ROWS; row++) {
      const hit = posToDay.get(`${col}:${row}`)
      if (hit) {
        cells.push(
          <Cell
            key={`${col}:${row}`}
            color={dayColor(hit.day.problems)}
            filled={dayIndex > hit.index}
          />,
        )
      } else {
        cells.push(<Cell key={`${col}:${row}`} filled={false} />)
      }
    }
  }

  return <div className="heatmap">{cells}</div>
}