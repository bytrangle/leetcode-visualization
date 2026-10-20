import { SEEK_THRESHOLD_DAYS, type Phase } from '../lib/replay'

interface ControlsProps {
  phase: Phase
  totalDays: number
  currentGlobal: number
  onToggle: () => void
  onSeek: (fraction: number) => void
}

export default function Controls({
  phase,
  totalDays,
  currentGlobal,
  onToggle,
  onSeek,
}: ControlsProps) {
  const showSeek = totalDays > SEEK_THRESHOLD_DAYS
  const progress = totalDays > 0 ? Math.round((currentGlobal / totalDays) * 100) : 0

  return (
    <div className="controls">
      {showSeek && (
        <input
          type="range"
          className="seek"
          min={0}
          max={100}
          step={1}
          value={progress}
          onChange={(e) => onSeek(Number(e.target.value) / 100)}
        />
      )}
      <button className="play-btn" onClick={onToggle}>
        {phase === 'playing' ? 'Pause' : 'Play'}
      </button>
    </div>
  )
}