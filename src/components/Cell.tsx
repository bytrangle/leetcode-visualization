interface CellProps {
  color?: string
  filled: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export default function Cell({ color, filled, onMouseEnter, onMouseLeave }: CellProps) {
  if (!color) return <span className="cell cell-empty" />
  return (
    <span
      className={`cell flip-cell${filled ? ' flipped' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="cell-face final-color" style={{ background: color }} />
      <span className="cell-face initial-color" />
    </span>
  )
}