export function generateId(length = 8) {
  // simple, dependency-free random id: base36 without leading "0."
  return Math.random().toString(36).slice(2, 2 + length)
}
