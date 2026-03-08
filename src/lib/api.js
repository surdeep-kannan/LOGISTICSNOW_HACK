// ─────────────────────────────────────────────────────────
//  LoRRI.ai  ·  Frontend API Client
//  Place at: src/lib/api.js
//  Backend:  http://localhost:3001
// ─────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001"

// ── In-memory cache with TTL ──────────────────────────────
// Prevents hammering the backend on every tab switch.
// Each entry: { data, expiresAt }
const _cache = new Map()

const TTL = {
  short:  15_000,   // 15s  — auth/me, shipment list
  medium: 60_000,   // 60s  — port congestion, rate benchmarks
  long:   120_000,  // 2min — alerts
}

function cacheGet(key) {
  const entry = _cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) { _cache.delete(key); return null }
  return entry.data
}

function cacheSet(key, data, ttl = TTL.short) {
  _cache.set(key, { data, expiresAt: Date.now() + ttl })
}

export function cacheBust(keyOrPrefix) {
  if (!keyOrPrefix) { _cache.clear(); return }
  // If key ends with ":" treat as prefix — delete all matching keys
  if (keyOrPrefix.endsWith(":")) {
    for (const k of _cache.keys()) {
      if (k.startsWith(keyOrPrefix)) _cache.delete(k)
    }
  } else {
    _cache.delete(keyOrPrefix)
  }
}

// ── In-flight deduplication ───────────────────────────────
// If two components call the same endpoint simultaneously,
// only one real request is made — both get the same promise.
const _inflight = new Map()

async function cachedRequest(cacheKey, path, options = {}, ttl = TTL.short) {
  // Only cache GET requests
  const isGet = !options.method || options.method === "GET"
  if (isGet) {
    const cached = cacheGet(cacheKey)
    if (cached) return cached

    // Deduplicate in-flight
    if (_inflight.has(cacheKey)) return _inflight.get(cacheKey)
  }

  const promise = request(path, options).then(data => {
    if (isGet) cacheSet(cacheKey, data, ttl)
    _inflight.delete(cacheKey)
    return data
  }).catch(err => {
    _inflight.delete(cacheKey)
    throw err
  })

  if (isGet) _inflight.set(cacheKey, promise)
  return promise
}

// ── Token helpers ─────────────────────────────────────────
export function saveToken(token) {
  localStorage.setItem("lorri_token", token)
}

export function clearToken() {
  localStorage.removeItem("lorri_token")
}

export function getToken() {
  return localStorage.getItem("lorri_token")
}

export function isLoggedIn() {
  return !!getToken()
}

// ── Core fetch wrapper ────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken()

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Request failed")
  return data
}

// ── Auth ──────────────────────────────────────────────────
export const auth = {
  login: (email, password) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signup: ({ email, password, full_name, company_name, mobile_number, role }) =>
    request("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name, company_name, mobile_number, role }),
    }),

  me: () => cachedRequest("auth:me", "/api/auth/me", {}, TTL.short),

  logout: () => { cacheBust(); return request("/api/auth/logout", { method: "POST" }) },

  updateProfile: (form) => {
    cacheBust("auth:me")   // profile changed — invalidate
    return request("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(form),
    })
  },

  resetPassword: () =>
    request("/api/auth/reset-password", { method: "POST" }),
}

// ── Shipments ─────────────────────────────────────────────
export const shipments = {
  list: (params = {}) => {
    const key = "shipments:list:" + new URLSearchParams(params).toString()
    return cachedRequest(key, "/api/shipments?" + new URLSearchParams(params), {}, TTL.short)
  },

  get: (id) => cachedRequest(`shipments:${id}`, `/api/shipments/${id}`, {}, TTL.short),

  create: (body) => {
    cacheBust("shipments:list:")
    cacheBust("shipments:stats")
    cacheBust("orders:list:")   // orders page shows shipments too
    return request("/api/shipments", { method: "POST", body: JSON.stringify(body) })
  },

  update: (id, body) => {
    cacheBust(`shipments:${id}`)
    cacheBust("shipments:list:")
    cacheBust("shipments:stats")
    cacheBust("orders:list:")
    return request(`/api/shipments/${id}`, { method: "PUT", body: JSON.stringify(body) })
  },

  stats: () => cachedRequest("shipments:stats", "/api/shipments/stats/summary", {}, TTL.short),

  timeline: (id) => cachedRequest(`shipments:timeline:${id}`, `/api/shipments/${id}/timeline`, {}, TTL.short),
}

// ── Orders ────────────────────────────────────────────────
export const orders = {
  list: (params = {}) => {
    const key = "orders:list:" + new URLSearchParams(params).toString()
    return cachedRequest(key, "/api/orders?" + new URLSearchParams(params), {}, TTL.short)
  },
  exportUrl: () => `${BASE}/api/orders/export`,
}

// ── Freight Intelligence ──────────────────────────────────
export const intelligence = {
  ports:  () => cachedRequest("intel:ports",  "/api/intelligence/ports",  {}, TTL.medium),
  rates:  () => cachedRequest("intel:rates",  "/api/intelligence/rates",  {}, TTL.medium),
  alerts: () => cachedRequest("intel:alerts", "/api/intelligence/alerts", {}, TTL.long),
  markRead: (id) => {
    cacheBust("intel:alerts")
    return request(`/api/intelligence/alerts/${id}/read`, { method: "PUT" })
  },
}

// ── AI ────────────────────────────────────────────────────
export const ai = {
  chat: (message, shipment_context = null) =>
    request("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message, shipment_context }),
    }),

  history:      () => request("/api/ai/chat/history"),
  clearHistory: () => request("/api/ai/chat/history", { method: "DELETE" }),

  route: (form) =>
    request("/api/ai/route", {
      method: "POST",
      body: JSON.stringify(form),
    }),
}

// ── ROI ───────────────────────────────────────────────────
export const roi = {
  calculate: (form) =>
    request("/api/roi/calculate", {
      method: "POST",
      body: JSON.stringify(form),
    }),

  history: () => request("/api/roi/history"),
}

// ── Upload ────────────────────────────────────────────────
export const upload = {
  avatar: async (file) => {
    const token = getToken()
    const formData = new FormData()
    formData.append("avatar", file)

    const res = await fetch(`${BASE}/api/upload/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Upload failed")
    return data
  },
}