interface CellProps {
  color?: string
  filled: boolean
}

export default function Cell({ color, filled }: CellProps) {
  if (!color) return <span className="cell cell-empty" />
  return (
    <span className={`cell flip${filled ? ' flipped' : ''}`}>
      <span className="face face-final" style={{ background: color }} />
      <span className="face face-initial" />
    </span>
  )
}