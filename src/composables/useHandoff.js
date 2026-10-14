// Smart Paste hands detected input to the tool it opens.
let pending = null

export function handoff (text) { pending = text }

export function takeHandoff () {
  const value = pending
  pending = null
  return value
}
