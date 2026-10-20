interface CellProps {
  color?: string
  filled: boolean
}

export default function Cell({ color, filled }: CellProps) {
  if (!color) return <span className="cell cell-empty" />
  return (
    <span className={`cell flip-cell${filled ? ' flipped' : ''}`}>
      <span className="cell-face final-color" style={{ background: color }} />
      <span className="cell-face initial-color" />
    </span>
  )
}