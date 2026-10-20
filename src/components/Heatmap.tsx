import Cell from './Cell'

const WEEK_COLUMNS = 53
const WEEK_ROWS = 7

export default function Heatmap() {
  const cells = []
  for (let col = 0; col < WEEK_COLUMNS; col++) {
    for (let row = 0; row < WEEK_ROWS; row++) {
      cells.push(<Cell key={`${col}-${row}`} />)
    }
  }
  return <div className="heatmap">{cells}</div>
}