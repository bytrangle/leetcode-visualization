import type { CSSProperties } from 'react'
import { difficultyDotColor } from '../lib/colors'
import type { Day } from '../types'

interface PopupProps {
  day: Day
  style: CSSProperties
}

export default function Popup({ day, style }: PopupProps) {
  return (
    <div className="popup" style={style}>
      {day.problems.map((p, i) => (
        <div key={i} className="popup-row">
          <span className="dot" style={{ background: difficultyDotColor(p.difficulty) }} />
          <span className="popup-title">{p.title}</span>
        </div>
      ))}
    </div>
  )
}