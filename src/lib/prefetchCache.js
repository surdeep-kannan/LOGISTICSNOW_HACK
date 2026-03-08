// ─────────────────────────────────────────────────────────
//  LoRRI.ai · Prefetch Cache
//  src/lib/prefetchCache.js
//
//  LoadingScreen fills this during its 3-4s window.
//  Dashboard (and any other page) reads from it —
//  if data is already here it's used instantly,
//  otherwise a normal fetch is made as fallback.
// ─────────────────────────────────────────────────────────

const cache = {}

export function setCached(key, value) {
  cache[key] = { value, ts: Date.now() }
}

// Returns cached value if it's less than `maxAgeMs` old (default 5 min)
export function getCached(key, maxAgeMs = 5 * 60 * 1000) {
  const entry = cache[key]
  if (!entry) return null
  if (Date.now() - entry.ts > maxAgeMs) return null
  return entry.value
}

export function isCached(key) {
  return !!getCached(key)
}

// Preload an image by URL — returns a Promise that resolves
// when the browser has the image decoded and ready to paint
export function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload  = () => resolve(src)
    img.onerror = () => resolve(src) // don't block on error
    img.src = src
  })
}