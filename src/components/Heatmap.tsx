import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import Cell from './Cell'
import Popup from './Popup'
import { dayColor } from '../lib/colors'
import type { Day, Year } from '../types'
import type { Phase } from '../lib/replay'
import { POPUP_MS, YEAR_FLIP_HALF_MS } from '../lib/timing'

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

  // Year-flip state: the outgoing year is kept mounted and rotates away while
  // the incoming year rotates in, so the two meet edge-on at the midpoint.
  const [outgoingYear, setOutgoingYear] = useState<Year | null>(null)
  const [flipping, setFlipping] = useState(false)
  const [flipKey, setFlipKey] = useState(0)
  const prevYear = useRef<{ label: number; data: Year }>({ label: year.label, data: year })

  // idle/ended show the year fully colored; playing/paused show partial progress.
  const complete = phase === 'idle' || phase === 'ended'

  useEffect(() => {
    if (phase !== 'playing' || dayIndex < 1) return
    setReplayVisible(true)
    const id = setTimeout(() => setReplayVisible(false), POPUP_MS)
    return () => clearTimeout(id)
  }, [phase, dayIndex])

  // Runs before paint, so the flip class is applied in the same frame the new
  // year is committed — otherwise the new grid flashes in flat for one frame.
  useLayoutEffect(() => {
    if (prevYear.current.label === year.label) return
    const old = prevYear.current.data // remember the year we're leaving
    prevYear.current = { label: year.label, data: year }
    setHoveredDate(null)
    setOutgoingYear(old) // keep the old year mounted
    setFlipKey((k) => k + 1) // remount both layers
    setFlipping(true) // turn on the animation
    const mid = setTimeout(() => setOutgoingYear(null), YEAR_FLIP_HALF_MS)
    const end = setTimeout(() => setFlipping(false), YEAR_FLIP_HALF_MS * 2)
    return () => {
      clearTimeout(mid)
      clearTimeout(end)
    }
  }, [year])

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

  const renderLayer = (target: Year, interactive: boolean) => {
    // Build this layer's own position map — the outgoing year has different
    // days than the incoming one.
    const targetPos = new Map<string, { day: Day; index: number }>()
    for (let i = 0; i < target.days.length; i++) {
      const day = target.days[i]
      const { col, row } = dayPosition(day.date)
      targetPos.set(`${col}:${row}`, { day, index: i })
    }
    const targetDayCount = target.days.length
    // The outgoing year is always shown complete; the incoming one follows the replay.
    const targetIndex = interactive ? dayIndex : targetDayCount

    const cells = []
    for (let col = 0; col < WEEK_COLUMNS; col++) {
      for (let row = 0; row < WEEK_ROWS; row++) {
        const key = `${col}:${row}`
        const hit = targetPos.get(key)
        if (hit) {
          const isFilled = complete || targetIndex > hit.index
          cells.push(
            <Cell
              key={`${epoch}:${key}`}
              color={dayColor(hit.day.problems)}
              filled={isFilled}
              onMouseEnter={interactive && isFilled ? () => setHoveredDate(hit.day.date) : undefined}
              onMouseLeave={interactive && isFilled ? () => setHoveredDate(null) : undefined}
            />,
          )
        } else {
          cells.push(<Cell key={`${epoch}:${key}`} filled={false} />)
        }
      }
    }

    const months = monthColumns(target.label)

    return (
      <>
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
          <div className="heatmap" ref={interactive ? gridRef : undefined}>
            {cells}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="heatmap-stage">
        <div className={`heatmap-layer${flipping ? ' flip-in' : ''}`} key={`in-${flipKey}`}>
          {renderLayer(year, true)}
        </div>
        {flipping && outgoingYear && (
          <div className="heatmap-layer flip-out" key={`out-${flipKey}`}>
            {renderLayer(outgoingYear, false)}
          </div>
        )}
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