interface YearNavProps {
  label: number
  canGoPrev: boolean
  canGoNext: boolean
  onPrev: () => void
  onNext: () => void
}

export default function YearNav({ label, canGoPrev, canGoNext, onPrev, onNext }: YearNavProps) {
  return (
    <div className="year-nav">
      <button className="year-arrow" onClick={onPrev} disabled={!canGoPrev} aria-label="Previous year">
        ←
      </button>
      <span className="year-label">Year&nbsp;<span>{label}</span></span>
      <button className="year-arrow" onClick={onNext} disabled={!canGoNext} aria-label="Next year">
        →
      </button>
    </div>
  )
}