import { difficultyDotColor } from '../lib/colors'

const ITEMS: { difficulty: 'Easy' | 'Medium' | 'Hard' }[] = [
  { difficulty: 'Easy' },
  { difficulty: 'Medium' },
  { difficulty: 'Hard' },
]

export default function Legend() {
  return (
    <div className="legend">
      {ITEMS.map(({ difficulty }) => (
        <span key={difficulty} className="legend-item">
          <span className="legend-dot" style={{ background: difficultyDotColor(difficulty) }} />
          {difficulty}
        </span>
      ))}
    </div>
  )
}