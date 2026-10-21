import type { Phase } from '../lib/replay'

interface ControlsProps {
  phase: Phase
  dayCount: number
  dayIndex: number
  onToggle: () => void
  onSeek: (fraction: number) => void
}

export default function Controls({ phase, dayCount, dayIndex, onToggle, onSeek }: ControlsProps) {
  // The thumb sits at the beginning until the loop has actually played through
  // the year; only a finished loop shows 100%.
  const progress = phase === 'ended' ? 100 : dayCount > 0 ? Math.round((dayIndex / dayCount) * 100) : 0

  return (
    <div className="controls">
      <input
        type="range"
        className="seek"
        min={0}
        max={100}
        step={1}
        value={progress}
        onChange={(e) => onSeek(Number(e.target.value) / 100)}
      />
      <span className="loop-label">Loop through days</span>
      <button className="play-btn" onClick={onToggle}>
        {phase === 'playing' ? 'Pause' : 'Play'}
      </button>
    </div>
  )
}