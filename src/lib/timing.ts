// Single source of truth for replay/cell timing, in milliseconds.
// Tweak here — these drive both the JS cadence and the CSS animations.
export const FLIP_MS = 400 // cell card-flip duration
export const POPUP_IN_MS = 300 // popup entrance fade duration
export const POPUP_MS = 1000 // how long each cell's popup stays before dismissing
export const REST_MS = 200 // idle gap after the popup dismisses, before the next cell
export const DAY_STEP_MS = POPUP_MS + REST_MS // full per-cell cadence (1200ms)
export const YEAR_FLIP_MS = 300 // whole-grid flip between years