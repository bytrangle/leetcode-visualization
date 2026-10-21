import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import Cell from './Cell'
import Popup from './Popup'
import { dayColor } from '../lib/colors'
import type { Day, Year } from '../types'
import type { Phase } from '../lib/replay'
import { POPUP_MS, YEAR_FLIP_MS } from '../lib/timing'

const WEEK_COLUMNS = 53
const WEEK_ROWS = 7
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
// rows are Sunday-first (0 = Sun); GitHub shows Mon / Wed / Fri
const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

function dayPosition(date: string): { col: number; row: number } {
  const d = new Date(date + 'T00:00:00Z')
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const dayOfYear = Math.floor((d.getTime() - yearStart.getTime()) / 86400000)
  const firstWeekday = yearStart.getUTCDay()
  const offset = dayOfYear + firstWeekday
  return { col: Math.floor(offset / 7), row: offset % 7 }
}

function monthColumns(yearLabel: number): (string | null)[] {
  const firstWeekday = new Date(Date.UTC(yearLabel, 0, 1)).getUTCDay()
  const cols: (string | null)[] = new Array(WEEK_COLUMNS).fill(null)
  for (let m = 0; m < 12; m++) {
    const first = new Date(Date.UTC(yearLabel, m, 1))
    const dayOfYear = Math.floor((first.getTime() - Date.UTC(yearLabel, 0, 1)) / 86400000)
    const col = Math.floor((dayOfYear + firstWeekday) / 7)
    if (col < WEEK_COLUMNS) cols[col] = MONTH_NAMES[m]
  }
  return cols
}

interface HeatmapProps {
  year: Year
  dayIndex: number
  phase: Phase
  epoch: number
}

export default function Heatmap({ year, dayIndex, phase, epoch }: HeatmapProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)
  const [popup, setPopup] = useState<{ day: Day; x: number; y: number } | null>(null)
  const [replayVisible, setReplayVisible] = useState(false)
  const prevYearLabel = useRef(year.label)
  const [flipping, setFlipping] = useState(false)

  // idle/ended show the year fully colored; playing/paused show partial progress.
  const complete = phase === 'idle' || phase === 'ended'

  useEffect(() => {
    if (prevYearLabel.current === year.label) return
    prevYearLabel.current = year.label
    setHoveredDate(null)
    setFlipping(true)
    const id = setTimeout(() => setFlipping(false), YEAR_FLIP_MS)
    return () => clearTimeout(id)
  }, [year.label])

  useEffect(() => {
    if (phase !== 'playing' || dayIndex < 1) return
    setReplayVisible(true)
    const id = setTimeout(() => setReplayVisible(false), POPUP_MS)
    return () => clearTimeout(id)
  }, [phase, dayIndex])

  const posToDay = new Map<string, { day: Day; index: number }>()
  for (let i = 0; i < year.days.length; i++) {
    const day = year.days[i]
    const { col, row } = dayPosition(day.date)
    posToDay.set(`${col}:${row}`, { day, index: i })
  }

  const replayDay =
    dayIndex >= 1 && (phase === 'paused' || (phase === 'playing' && replayVisible))
      ? year.days[dayIndex - 1]
      : null
  const hoveredDay = hoveredDate ? year.days.find((d) => d.date === hoveredDate) ?? null : null
  const popupDay = hoveredDay ?? replayDay

  useLayoutEffect(() => {
    if (!popupDay) {
      setPopup(null)
      return
    }
    const grid = gridRef.current
    if (!grid) return
    const { col, row } = dayPosition(popupDay.date)
    const r = grid.getBoundingClientRect()
    const cs = getComputedStyle(grid)
    const colGap = parseFloat(cs.columnGap) || 0
    const rowGap = parseFloat(cs.rowGap) || 0
    const cellW = (r.width - (WEEK_COLUMNS - 1) * colGap) / WEEK_COLUMNS
    const cellH = (r.height - (WEEK_ROWS - 1) * rowGap) / WEEK_ROWS
    const left = r.left + col * (cellW + colGap)
    const top = r.top + row * (cellH + rowGap)
    setPopup({
      day: popupDay,
      x: left + cellW + 8,
      y: top + cellH / 2,
    })
  }, [popupDay])

  const cells = []
  for (let col = 0; col < WEEK_COLUMNS; col++) {
    for (let row = 0; row < WEEK_ROWS; row++) {
      const key = `${col}:${row}`
      const hit = posToDay.get(key)
      if (hit) {
        const isFilled = complete || dayIndex > hit.index
        cells.push(
          <Cell
            key={`${epoch}:${key}`}
            color={dayColor(hit.day.problems)}
            filled={isFilled}
            onMouseEnter={isFilled ? () => setHoveredDate(hit.day.date) : undefined}
            onMouseLeave={isFilled ? () => setHoveredDate(null) : undefined}
          />,
        )
      } else {
        cells.push(<Cell key={`${epoch}:${key}`} filled={false} />)
      }
    }
  }

  const months = monthColumns(year.label)

  return (
    <>
      <div className="heatmap-wrap">
        <div className="heatmap-months">
          {months.map((name, i) => (
            <span key={i} className="month-label">
              {name ?? ''}
            </span>
          ))}
        </div>
        <div className="heatmap-row">
          <div className="heatmap-weekdays">
            {WEEKDAY_LABELS.map((label, i) => (
              <span key={i} className="weekday-label">
                {label}
              </span>
            ))}
          </div>
          <div className={`heatmap${flipping ? ' year-flip' : ''}`} ref={gridRef}>
            {cells}
          </div>
        </div>
      </div>
      {popup &&
        createPortal(
          <Popup
            day={popup.day}
            style={
              {
                '--popup-x': `${popup.x}px`,
                '--popup-y': `${popup.y}px`,
              } as CSSProperties
            }
          />,
          document.body,
        )}
    </>
  )
}