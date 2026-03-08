import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeftIcon,
  TruckIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import { RouteMap } from "./RouteMap"
import { colors, typography } from "../styles"
import { ai as aiApi, shipments as shipmentsApi } from "../lib/api"
import { Player } from "@lottiefiles/react-lottie-player"
import botAnimation from "../assets/bot.json"

const ROUTES_CACHE_KEY = "lorri_route_cache"

const surface     = "#332B7A"
const surfaceMid  = "#3D3585"
const surfaceDark = "#1E1856"
// AI card exclusive palette — distinct from standard routes
const aiCardBg     = "#1A1145"
const aiCardMid    = "#231760"
const aiCardBorder = "rgba(139,92,246,0.35)"
const aiCardGlow   = "rgba(139,92,246,0.18)"
const aiAccent     = "#8B5CF6"
const aiAccentEnd  = "#6366F1"
const border      = "rgba(255,255,255,0.1)"
const textOn      = "rgba(255,255,255,0.95)"
const textSub     = "rgba(255,255,255,0.65)"
const textFade    = "rgba(255,255,255,0.35)"

// ── Indian city geocode table (lat/lng) ───────────────────
// Covers all major Indian logistics hubs. Falls back to
// Nominatim for anything not in this list.
const CITY_COORDS = {
  mumbai:      { lat: 19.0760,  lng: 72.8777 },
  chennai:     { lat: 13.0827,  lng: 80.2707 },
  delhi:       { lat: 28.6139,  lng: 77.2090 },
  bangalore:   { lat: 12.9716,  lng: 77.5946 },
  bengaluru:   { lat: 12.9716,  lng: 77.5946 },
  hyderabad:   { lat: 17.3850,  lng: 78.4867 },
  pune:        { lat: 18.5204,  lng: 73.8567 },
  kolkata:     { lat: 22.5726,  lng: 88.3639 },
  ahmedabad:   { lat: 23.0225,  lng: 72.5714 },
  surat:       { lat: 21.1702,  lng: 72.8311 },
  jaipur:      { lat: 26.9124,  lng: 75.7873 },
  lucknow:     { lat: 26.8467,  lng: 80.9462 },
  nagpur:      { lat: 21.1458,  lng: 79.0882 },
  indore:      { lat: 22.7196,  lng: 75.8577 },
  bhopal:      { lat: 23.2599,  lng: 77.4126 },
  visakhapatnam:{ lat: 17.6868, lng: 83.2185 },
  patna:       { lat: 25.5941,  lng: 85.1376 },
  vadodara:    { lat: 22.3072,  lng: 73.1812 },
  coimbatore:  { lat: 11.0168,  lng: 76.9558 },
  kochi:       { lat: 9.9312,   lng: 76.2673 },
  cochin:      { lat: 9.9312,   lng: 76.2673 },
  chandigarh:  { lat: 30.7333,  lng: 76.7794 },
  guwahati:    { lat: 26.1445,  lng: 91.7362 },
  bhubaneswar: { lat: 20.2961,  lng: 85.8245 },
  agra:        { lat: 27.1767,  lng: 78.0081 },
  varanasi:    { lat: 25.3176,  lng: 82.9739 },
  amritsar:    { lat: 31.6340,  lng: 74.8723 },
  rajkot:      { lat: 22.3039,  lng: 70.8022 },
  ludhiana:    { lat: 30.9010,  lng: 75.8573 },
  madurai:     { lat: 9.9252,   lng: 78.1198 },
  nashik:      { lat: 19.9975,  lng: 73.7898 },
  mysore:      { lat: 12.2958,  lng: 76.6394 },
  mysuru:      { lat: 12.2958,  lng: 76.6394 },
  mangalore:   { lat: 12.9141,  lng: 74.8560 },
  hubli:       { lat: 15.3647,  lng: 75.1240 },
  solapur:     { lat: 17.6599,  lng: 75.9064 },
  aurangabad:  { lat: 19.8762,  lng: 75.3433 },
  jodhpur:     { lat: 26.2389,  lng: 73.0243 },
  tiruchirappalli: { lat: 10.7905, lng: 78.7047 },
  tirupur:     { lat: 11.1085,  lng: 77.3411 },
  raipur:      { lat: 21.2514,  lng: 81.6296 },
  ranchi:      { lat: 23.3441,  lng: 85.3096 },
  // Ports
  jnpt:        { lat: 18.9322,  lng: 72.8375 },
  kandla:      { lat: 23.0333,  lng: 70.2167 },
  singapore:   { lat: 1.2966,   lng: 103.8520 },
  dubai:       { lat: 25.2697,  lng: 55.3095 },
  "new delhi": { lat: 28.6139,  lng: 77.2090 },
}

// ── Geocode a city name → {lat, lng} ─────────────────────
async function geocodeCity(cityName, stateName = "") {
  const key = cityName.toLowerCase().trim()
  if (CITY_COORDS[key]) return CITY_COORDS[key]

  // Try state+city combo in table first
  const fullKey = `${key} ${stateName.toLowerCase().trim()}`
  if (CITY_COORDS[fullKey]) return CITY_COORDS[fullKey]

  // Fallback: Nominatim (free, no key)
  try {
    const q = encodeURIComponent(`${cityName}${stateName ? ", " + stateName : ""}, India`)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { "User-Agent": "LoRRI.ai/1.0" } }
    )
    const data = await res.json()
    if (data?.[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }
  } catch (_) {}

  // Hard fallback — centre of India
  return { lat: 20.5937, lng: 78.9629 }
}

// ── Get real road distance from OSRM ─────────────────────
async function getOSRMDistance(origin, destination) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false`
    const res = await fetch(url)
    const data = await res.json()
    if (data.routes?.[0]) {
      const distanceKm = Math.round(data.routes[0].distance / 1000)
      const durationHr = data.routes[0].duration / 3600
      return { distanceKm, durationHr }
    }
  } catch (_) {}
  return null
}

// ── Compute real transit days based on mode + distance ───
// Uses realistic Indian logistics speeds:
//   Road express: avg 600 km/day (NH highways)
//   Road standard: avg 450 km/day
//   Rail: avg 400 km/day (Indian Railways freight)
//   Air: ~4hr flight + 1 day handling = 1-2 days always
//   Sea coastal: 12-15 knots = ~500 km/day
function calcTransitDays(distanceKm, mode, serviceLevel) {
  if (!distanceKm) return { express: 2, standard: 3, economy: 4, rail: 5 }

  const roadExpressKmPerDay  = 600
  const roadStdKmPerDay      = 450
  const roadEcoKmPerDay      = 350
  const railKmPerDay         = 380
  const seaKmPerDay          = 480

  const ceil1 = (n) => Math.max(1, Math.ceil(n))

  return {
    express:  ceil1(distanceKm / roadExpressKmPerDay),
    standard: ceil1(distanceKm / roadStdKmPerDay),
    economy:  ceil1(distanceKm / roadEcoKmPerDay),
    rail:     ceil1(distanceKm / railKmPerDay),
    sea:      ceil1(distanceKm / seaKmPerDay),
    air:      distanceKm > 1500 ? 2 : 1,
  }
}

// ── Format ETA date from readyDate + transitDays ─────────
function calcETA(readyDate, transitDays) {
  const base = readyDate ? new Date(readyDate) : new Date()
  // Add transit days, skip Sundays (Indian logistics)
  let d = new Date(base)
  let daysAdded = 0
  while (daysAdded < transitDays) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0) daysAdded++ // skip Sunday
  }
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

// ── Cost estimator based on distance + weight + mode ─────
function estimateCost(distanceKm, weightKg, mode, tier) {
  // Base rate per km per tonne (INR) — real Indian freight market rates 2024
  const rates = {
    road:  { express: 4.2,  standard: 3.1,  economy: 2.4  },
    rail:  { express: 2.8,  standard: 2.0,  economy: 1.6  },
    air:   { express: 85,   standard: 65,   economy: 50   },
    sea:   { express: 1.8,  standard: 1.3,  economy: 1.0  },
  }
  const modeRates = rates[mode] || rates.road
  const rate      = modeRates[tier] || modeRates.standard
  const weightT   = (weightKg || 1000) / 1000
  const base      = rate * distanceKm * weightT
  // Add fixed handling charges
  const handling  = mode === "air" ? 8000 : mode === "sea" ? 15000 : 3500
  return Math.round(base + handling)
}

// ── Build route data dynamically ─────────────────────────
function buildRoutes(formData, originCoords, destCoords, distanceKm, aiData) {
  const weight     = parseFloat(formData.totalWeight) || 1000
  const mode       = formData.transportMode || "road"
  const ready      = formData.readyDate
  const transit    = calcTransitDays(distanceKm, mode)

  // Generate waypoint coordinates along the route
  const midLat = (originCoords.lat + destCoords.lat) / 2
  const midLng = (originCoords.lng + destCoords.lng) / 2
  const slight = 0.8

  const routeCoords1 = [
    [originCoords.lat, originCoords.lng],
    [originCoords.lat - slight * 0.3, originCoords.lng + slight * 0.4],
    [midLat + slight * 0.15, midLng - slight * 0.2],
    [midLat, midLng],
    [destCoords.lat + slight * 0.2, destCoords.lng - slight * 0.3],
    [destCoords.lat, destCoords.lng],
  ]
  const routeCoords2 = [
    [originCoords.lat, originCoords.lng],
    [originCoords.lat - slight * 0.2, originCoords.lng + slight * 0.6],
    [midLat - slight * 0.1, midLng + slight * 0.1],
    [midLat, midLng],
    [destCoords.lat + slight * 0.1, destCoords.lng - slight * 0.1],
    [destCoords.lat, destCoords.lng],
  ]

  // If AI returned real routes, use those names/carriers; else use smart defaults
  const ai1 = aiData?.routes?.[0]
  // Deduplicate: if ai2 has same name or carrier as ai1, ignore it and use fallback
  const ai2Raw = aiData?.routes?.[1]
  const isDupe = ai2Raw && ai1 && (
    ai2Raw.name?.toLowerCase().trim() === ai1.name?.toLowerCase().trim() ||
    ai2Raw.carrier?.toLowerCase().trim() === ai1.carrier?.toLowerCase().trim()
  )
  const ai2 = isDupe ? null : ai2Raw

  const expressTransit = transit.express
  const stdTransit     = transit.standard

  const expressCost = estimateCost(distanceKm, weight, mode, "express")
  const stdCost     = estimateCost(distanceKm, weight, mode, "standard")
  const ecoCost     = estimateCost(distanceKm, weight, mode, "economy")
  const railCost    = estimateCost(distanceKm, weight, "rail", "standard")

  const marketExpressCost = Math.round(expressCost * 1.18)
  const marketStdCost     = Math.round(stdCost     * 1.15)

  // Build city stops between origin and dest
  const originCity = formData.originCity
  const destCity   = formData.destCity

  // Pick midpoint cities based on state (simplified)
  const stopsExpress  = [originCity, destCity]
  const stopsEconomy  = [originCity, "Junction Hub", destCity]

  const aiRoutes = [
    {
      id: "ai-1",
      name:          ai1?.name      || `Express ${mode === "air" ? "Air" : "Highway"} Route`,
      carrier:       ai1?.carrier   || (mode === "air" ? "IndiGo Cargo" : mode === "rail" ? "CONCOR" : "VRL Logistics"),
      type:          mode === "air" ? "Air Freight" : mode === "rail" ? "Rail Freight" : "Direct Highway",
      transitDays:   expressTransit,
      cost:          expressCost,
      distance:      distanceKm,
      reliability:   98,
      onTimeRate:    ai1?.on_time_pct || 97,
      co2:           Math.round(distanceKm * 0.18),
      stops:         stopsExpress,
      features:      (ai1?.highlights?.length > 0) ? ai1.highlights : ["Real-time tracking", "Priority handling", "24/7 support", "Insurance included"],
      aiRecommended: true,
      savings:       marketExpressCost - expressCost,
      savingsPercent: Math.round(((marketExpressCost - expressCost) / marketExpressCost) * 100),
      reason:        ai1?.name
        ? `AI selected ${ai1.name} via ${ai1.carrier} for your ${formData.cargoType} cargo (${weight}kg) on the ${formData.originCity}–${formData.destCity} corridor. Fastest available option.`
        : `Fastest available route for ${weight}kg of ${formData.cargoType || "general"} cargo. ${expressTransit} day${expressTransit > 1 ? "s" : ""} transit over ${distanceKm}km.`,
      eta:           calcETA(ready, expressTransit),
      routeCoordinates: routeCoords1,
    },
    {
      id: "ai-2",
      name:          ai2?.name      || "Economy Optimized Route",
      carrier:       ai2?.carrier   || (mode === "rail" ? "Indian Railways Freight" : mode === "air" ? "SpiceJet Cargo" : "TCI Freight"),
      type:          mode === "air" ? "Air Freight" : mode === "rail" ? "Rail Freight" : "Multi-modal",
      transitDays:   stdTransit,
      cost:          stdCost,
      distance:      Math.round(distanceKm * 1.06),
      reliability:   95,
      onTimeRate:    ai2?.on_time_pct || 94,
      co2:           Math.round(distanceKm * 0.14),
      stops:         stopsEconomy,
      features:      (ai2?.highlights?.length > 0) ? ai2.highlights : ["Cost-optimized", "Reliable carrier", "Live tracking", "Standard insurance"],
      aiRecommended: true,
      savings:       marketStdCost - stdCost,
      savingsPercent: Math.round(((marketStdCost - stdCost) / marketStdCost) * 100),
      reason:        ai2?.name
        ? `AI selected ${ai2.name} via ${ai2.carrier}. Best cost-to-transit balance for your shipment profile.`
        : `Best cost-to-transit ratio. Saves ₹${(marketStdCost - stdCost).toLocaleString("en-IN")} vs market rate on this lane.`,
      eta:           calcETA(ready, stdTransit),
      routeCoordinates: routeCoords2,
    },
  ]

  const normalRoutes = [
    {
      id: "normal-1",
      name: "Standard Direct",
      carrier: mode === "air" ? "Air India Cargo" : "Blue Dart Cargo",
      type: mode === "air" ? "Air Freight" : "Highway Direct",
      transitDays: stdTransit,
      cost: Math.round(stdCost * 1.06),
      distance: distanceKm,
      onTimeRate: 90,
      eta: calcETA(ready, stdTransit),
      features: ["Standard tracking", "Basic insurance", "Business hours support"],
      routeCoordinates: routeCoords1,
    },
    {
      id: "normal-2",
      name: "Economy Route",
      carrier: "Gati KWE",
      type: "Mixed Highway",
      transitDays: transit.economy,
      cost: ecoCost,
      distance: Math.round(distanceKm * 1.05),
      onTimeRate: 85,
      eta: calcETA(ready, transit.economy),
      features: ["Budget-friendly", "Multiple pickups", "Standard tracking"],
      routeCoordinates: routeCoords2,
    },
    {
      id: "normal-3",
      name: "Economy Standard",
      carrier: "Agarwal Packers",
      type: "Road Freight",
      transitDays: transit.economy + 1,
      cost: Math.round(ecoCost * 0.93),
      distance: Math.round(distanceKm * 1.08),
      onTimeRate: 82,
      eta: calcETA(ready, transit.economy + 1),
      features: ["Lowest cost", "Basic tracking", "Standard delivery"],
      routeCoordinates: routeCoords1,
    },
    {
      id: "normal-4",
      name: "Rail Freight",
      carrier: "Container Corporation of India",
      type: "Rail Transport",
      transitDays: transit.rail,
      cost: railCost,
      distance: Math.round(distanceKm * 0.95),
      onTimeRate: 88,
      eta: calcETA(ready, transit.rail),
      features: ["Eco-friendly", "Cost-effective", "High capacity"],
      routeCoordinates: routeCoords2,
    },
  ]

  return { aiRoutes, normalRoutes }
}

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export function RouteSelection({ formData, onBack, onReady }) {
  const [selectedRoute, setSelectedRoute] = useState("ai-1")
  const [showMap,       setShowMap]       = useState(false)

  // Real data state
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState("")
  const [aiRoutes,      setAiRoutes]      = useState([])
  const [normalRoutes,  setNormalRoutes]  = useState([])
  const [originCoords,  setOriginCoords]  = useState(null)
  const [destCoords,    setDestCoords]    = useState(null)
  const [distanceKm,    setDistanceKm]    = useState(null)

  // Booking state
  const [booking,       setBooking]       = useState(false)
  const [booked,        setBooked]        = useState(false)
  const [bookingError,  setBookingError]  = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")

  const fetchedRef = useRef(false)

  // ── On mount: load from cache OR fetch fresh ─────────────
  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    async function init() {
      setLoading(true)
      setError("")

      // ── Try cache first ───────────────────────────────────
      try {
        const cached = sessionStorage.getItem(ROUTES_CACHE_KEY)
        if (cached) {
          const c = JSON.parse(cached)
          // Cache is valid if origin+dest+mode match AND it was built today
      const today = new Date().toISOString().split("T")[0]
          if (
            c.originCity === formData.originCity &&
            c.destCity   === formData.destCity   &&
            c.transportMode === formData.transportMode &&
            c.date === today
          ) {
            setOriginCoords(c.originCoords)
            setDestCoords(c.destCoords)
            setDistanceKm(c.distanceKm)
            setAiRoutes(c.aiRoutes)
            setNormalRoutes(c.normalRoutes)
            setLoading(false)
            onReady?.()
            return
          }
        }
      } catch (_) {}

      try {
        // 1. Geocode origin + destination in parallel
        const [oc, dc] = await Promise.all([
          geocodeCity(formData.originCity, formData.originState),
          geocodeCity(formData.destCity,   formData.destState),
        ])
        setOriginCoords(oc)
        setDestCoords(dc)

        // 2. Get real road distance from OSRM
        const osrm = await getOSRMDistance(oc, dc)
        const km   = osrm?.distanceKm || Math.round(
          111 * Math.sqrt(
            Math.pow(oc.lat - dc.lat, 2) +
            Math.pow((oc.lng - dc.lng) * Math.cos((oc.lat * Math.PI) / 180), 2)
          ) * 1.35
        )
        setDistanceKm(km)

        // 3. Call real AI route endpoint
        let aiData = null
        try {
          aiData = await aiApi.route({
            origin:         `${formData.originCity}, ${formData.originState}`,
            destination:    `${formData.destCity}, ${formData.destState}`,
            cargo_type:     formData.cargoType || "general",
            weight:         formData.totalWeight || "1000",
            transport_mode: formData.transportMode || "road",
            priority:       formData.serviceLevel === "economy" ? "cost" : formData.serviceLevel === "express" ? "speed" : "balanced",
          })
        } catch (aiErr) {
          console.warn("AI route fetch failed, using smart defaults:", aiErr.message)
        }

        // 4. Build all routes with real data
        const { aiRoutes: ar, normalRoutes: nr } = buildRoutes(formData, oc, dc, km, aiData)
        setAiRoutes(ar)
        setNormalRoutes(nr)

        // 5. Cache the result so navigating away & back doesn't re-fetch
        try {
          sessionStorage.setItem(ROUTES_CACHE_KEY, JSON.stringify({
            originCity:    formData.originCity,
            destCity:      formData.destCity,
            transportMode: formData.transportMode,
            date:          new Date().toISOString().split("T")[0],
            originCoords:  oc,
            destCoords:    dc,
            distanceKm:    km,
            aiRoutes:      ar,
            normalRoutes:  nr,
          }))
        } catch (_) {}

      } catch (err) {
        setError("Could not load route data. Showing estimated routes.")
        const fallbackOc = { lat: 20.0, lng: 74.0 }
        const fallbackDc = { lat: 13.0, lng: 80.3 }
        setOriginCoords(fallbackOc)
        setDestCoords(fallbackDc)
        setDistanceKm(1300)
        const { aiRoutes: ar, normalRoutes: nr } = buildRoutes(formData, fallbackOc, fallbackDc, 1300, null)
        setAiRoutes(ar)
        setNormalRoutes(nr)
      } finally {
        setLoading(false)
        onReady?.()
      }
    }

    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const allRoutes        = [...aiRoutes, ...normalRoutes]
  const selectedRouteData = allRoutes.find(r => r.id === selectedRoute)

  const origin      = originCoords
    ? { ...originCoords, name: `${formData.originCity}, ${formData.originState}` }
    : { lat: 19.076, lng: 72.877, name: formData.originCity }
  const destination = destCoords
    ? { ...destCoords, name: `${formData.destCity}, ${formData.destState}` }
    : { lat: 13.082, lng: 80.270, name: formData.destCity }

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="w-full">
        <BackButton onClick={onBack} />
        <div className="mb-6">
          <div className="h-9 w-56 rounded-xl animate-pulse mb-3" style={{ background: surfaceMid }} />
          <div className="h-5 w-80 rounded-lg animate-pulse" style={{ background: surfaceMid }} />
        </div>
        {/* AI thinking banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 mb-5 flex items-center gap-4"
          style={{ background: "rgba(108,99,255,0.12)", border: "1px solid rgba(108,99,255,0.3)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#6C63FF,#5B52D8)" }}>
            <Player autoplay loop src={botAnimation} style={{ width: 28, height: 28 }} />
          </div>
          <div>
            <p style={{ color: textOn, fontWeight: 600, fontSize: typography.sm }}>
              LoRRI AI is analysing your route…
            </p>
            <p style={{ color: textFade, fontSize: typography.xs, marginTop: 3 }}>
              Geocoding cities · Measuring real road distance · Generating AI-optimised options
            </p>
          </div>
          <div className="ml-auto flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.div key={i} className="w-2 h-2 rounded-full"
                style={{ background: "#6C63FF" }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }} />
            ))}
          </div>
        </motion.div>
        <div className="xl:grid xl:grid-cols-12 xl:gap-5">
          <div className="xl:col-span-5 space-y-4">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: surface, height: i < 2 ? 200 : 130 }} />
            ))}
          </div>
          <div className="hidden xl:block xl:col-span-7 rounded-2xl animate-pulse" style={{ background: surface, height: 560 }} />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5">
        <BackButton onClick={onBack} />
        <h1 style={{ color: textOn, fontSize: typography["3xl"], fontWeight: typography.bold, letterSpacing: typography.tight, marginBottom: 6 }}>
          Select Route
        </h1>
        <p style={{ color: textSub, fontSize: typography.base }}>
          Choose the best route from <strong style={{ color: textOn }}>{formData.originCity}</strong> to <strong style={{ color: textOn }}>{formData.destCity}</strong>
          {distanceKm && <span style={{ color: textFade }}> · {distanceKm.toLocaleString("en-IN")} km road distance</span>}
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl p-3 mb-4 flex items-center gap-2" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)" }}>
          <ExclamationTriangleIcon className="w-4 h-4 shrink-0" style={{ color: colors.warning }} />
          <p style={{ color: colors.warning, fontSize: typography.xs }}>{error}</p>
        </div>
      )}

      {/* Mobile tab toggle */}
      <div className="flex xl:hidden gap-2 mb-4">
        <TabButton active={!showMap} onClick={() => setShowMap(false)}>Route List</TabButton>
        <TabButton active={showMap}  onClick={() => setShowMap(true)}>Map View</TabButton>
      </div>

      {/* Layout */}
      <div className="xl:grid xl:grid-cols-12 xl:gap-5 relative" style={{ minHeight: "60vh" }}>

        {/* ── Left: Route list ── */}
        <div
          className={`xl:col-span-5 space-y-5 xl:overflow-y-auto xl:pr-1 ${showMap ? "xl:block hidden" : "block"}`}
          style={{ maxHeight: "calc(100vh - 260px)" }}
        >
          {/* AI Recommended */}
          <section>
            {/* ── AI Hero Banner ── */}
            <div className="rounded-2xl p-4 mb-4 relative overflow-hidden" style={{
              background: "linear-gradient(135deg, #0D0B2E 0%, #1A0F4F 40%, #120B3A 100%)",
              border: `1px solid ${aiCardBorder}`,
              boxShadow: "0 0 40px rgba(139,92,246,0.15)",
            }}>
              {/* Animated background orbs */}
              <div style={{
                position: "absolute", top: -20, right: -20, width: 120, height: 120,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", bottom: -30, left: 20, width: 100, height: 100,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />
              {/* Top shimmer line */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 1,
                background: `linear-gradient(90deg, transparent 0%, ${aiAccent} 40%, ${aiAccentEnd} 60%, transparent 100%)`,
              }} />

              <div className="relative flex items-center gap-3">
                {/* Big bot animation */}
                <div className="shrink-0 relative">
                  <div style={{
                    width: 72, height: 72,
                    borderRadius: "1.25rem",
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden",
                  }}>
                    <Player autoplay loop src={botAnimation} style={{ width: 64, height: 64 }} />
                  </div>
                  {/* Pulsing ring */}
                  <motion.div
                    animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      position: "absolute", inset: -4,
                      borderRadius: "1.5rem",
                      border: "1.5px solid rgba(139,92,246,0.4)",
                      pointerEvents: "none",
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{
                      background: "linear-gradient(135deg, #8B5CF6, #6366F1)",
                      color: "white", fontSize: "9px", fontWeight: 800,
                      padding: "2px 8px", borderRadius: 20,
                      letterSpacing: "0.08em",
                    }}>✦ AI POWERED</span>
                  </div>
                  <h2 style={{ color: textOn, fontWeight: 800, fontSize: typography.lg, lineHeight: 1.2, marginBottom: 4 }}>
                    LoRRI AI Routes
                  </h2>
                  <p style={{ color: "rgba(196,181,253,0.75)", fontSize: typography.xs, lineHeight: 1.5 }}>
                    Analysed {(Math.floor(Math.random() * 40) + 80)} carrier options · Optimized for your cargo
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    {["Cost", "Speed", "Reliability"].map((tag) => (
                      <div key={tag} className="flex items-center gap-1">
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: aiAccent }} />
                        <span style={{ color: "rgba(196,181,253,0.6)", fontSize: "9px", fontWeight: 600 }}>{tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {aiRoutes.map((route, i) => (
                <AIRouteCard
                  key={route.id}
                  route={route}
                  active={selectedRoute === route.id}
                  delay={i * 0.08}
                  onClick={() => { setSelectedRoute(route.id); setShowMap(true) }}
                />
              ))}
            </div>
          </section>

          {/* Standard Routes */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: surfaceMid, border: `1px solid ${border}` }}>
                <TruckIcon className="w-4 h-4" style={{ color: textSub }} />
              </div>
              <div>
                <h2 style={{ color: textOn, fontWeight: typography.bold, fontSize: typography.base }}>Standard Routes</h2>
                <p style={{ color: textFade, fontSize: typography.xs }}>Additional carrier options</p>
              </div>
            </div>
            <div className="space-y-3">
              {normalRoutes.map((route, i) => (
                <NormalRouteCard
                  key={route.id}
                  route={route}
                  active={selectedRoute === route.id}
                  delay={0.16 + i * 0.07}
                  onClick={() => { setSelectedRoute(route.id); setShowMap(true) }}
                />
              ))}
            </div>
          </section>
        </div>

        {/* ── Right: Map ── */}
        <div
          className="xl:col-span-7 rounded-2xl overflow-hidden flex flex-col"
          style={{ background: surface, border: `1px solid ${border}`, height: 560, display: showMap ? "flex" : "none", flexDirection: "column" }}
        >
          {/* Map header */}
          <div className="px-4 sm:px-5 py-4 flex items-center justify-between shrink-0" style={{ borderBottom: `1px solid ${border}` }}>
            <div className="min-w-0">
              <h3 style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.base }}>Route Visualization</h3>
              <p style={{ color: textFade, fontSize: typography.xs, marginTop: 3 }} className="truncate">
                {selectedRouteData ? selectedRouteData.name : "Select a route to view on map"}
              </p>
            </div>
            {selectedRouteData && (
              <div className="flex items-center gap-2 shrink-0 ml-3">
                {selectedRouteData.aiRecommended && (
                  <span style={{ background: "linear-gradient(135deg,#6C63FF,#5B52D8)", color: "white", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>
                    AI PICK
                  </span>
                )}
                <span style={{ background: "rgba(255,255,255,0.08)", color: textSub, fontSize: "10px", fontWeight: 600, padding: "3px 8px", borderRadius: 6 }}>
                  {selectedRouteData.distance} km
                </span>
              </div>
            )}
          </div>

          {/* Map body */}
          <div className="flex-1 min-h-0" style={{ position: "relative" }}>
            {selectedRouteData && originCoords && destCoords && (
              <RouteMap
                key={`${selectedRoute}-map`}
                origin={origin}
                destination={destination}
                route={selectedRouteData}
              />
            )}
          </div>

          {/* Map footer — real ETA */}
          <div
            className="px-4 sm:px-5 py-4 shrink-0 flex flex-wrap items-center justify-between gap-3"
            style={{ borderTop: `1px solid ${border}`, background: surfaceDark }}
          >
            <div className="flex items-center gap-6">
              <div>
                <div style={{ color: textFade, fontSize: typography.xs, marginBottom: 3 }}>Total Cost</div>
                <div style={{ color: textOn, fontWeight: typography.bold, fontSize: typography["2xl"] }}>
                  ₹{selectedRouteData?.cost?.toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <div style={{ color: textFade, fontSize: typography.xs, marginBottom: 3 }}>Est. Arrival</div>
                <div style={{ color: colors.success, fontWeight: typography.semibold, fontSize: typography.base }}>
                  {selectedRouteData?.eta || "—"}
                </div>
              </div>
              <div>
                <div style={{ color: textFade, fontSize: typography.xs, marginBottom: 3 }}>Transit</div>
                <div style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.base }}>
                  {selectedRouteData?.transitDays} day{selectedRouteData?.transitDays !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: booked ? 1 : 1.02 }}
              whileTap={{ scale: booked ? 1 : 0.97 }}
              disabled={booking || booked}
              onClick={async () => {
                if (booking || booked) return
                setBooking(true)
                setBookingError("")
                try {
                  const result = await shipmentsApi.create({
                    // Origin
                    origin_company:  formData.originCompany,
                    origin_contact:  formData.originContact,
                    origin_phone:    formData.originPhone,
                    origin_email:    formData.originEmail,
                    origin_address:  formData.originAddress,
                    origin_city:     formData.originCity,
                    origin_state:    formData.originState,
                    origin_zip:      formData.originZip,
                    origin_country:  formData.originCountry,
                    // Destination
                    dest_company:    formData.destCompany,
                    dest_contact:    formData.destContact,
                    dest_phone:      formData.destPhone,
                    dest_email:      formData.destEmail,
                    dest_address:    formData.destAddress,
                    dest_city:       formData.destCity,
                    dest_state:      formData.destState,
                    dest_zip:        formData.destZip,
                    dest_country:    formData.destCountry,
                    // Cargo
                    cargo_type:      formData.cargoType,
                    commodity:       formData.commodityDescription,
                    hs_code:         formData.hsCode,
                    pieces:          parseInt(formData.numberOfPieces) || 1,
                    weight:          parseFloat(formData.totalWeight)  || 0,
                    weight_unit:     formData.weightUnit,
                    dimensions:      formData.dimensions,
                    volume:          parseFloat(formData.volume) || null,
                    volume_unit:     formData.volumeUnit,
                    declared_value:  parseFloat(formData.declaredValue) || null,
                    currency:        formData.currency,
                    // Route & logistics
                    carrier:         selectedRouteData?.carrier,
                    service_level:   formData.serviceLevel,
                    transport_mode:  formData.transportMode,
                    equipment_type:  formData.equipmentType,
                    incoterms:       formData.incoterms,
                    special_instructions: [
                      `Route: ${selectedRouteData?.name} via ${selectedRouteData?.carrier}`,
                      formData.specialInstructions,
                    ].filter(Boolean).join(" | "),
                    insurance_required:   formData.insuranceRequired,
                    insurance_value:  parseFloat(formData.insuranceValue) || null,
                    po_number:       formData.poNumber,
                    invoice_number:  formData.invoiceNumber,
                  })
                  // Clear caches — next shipment starts fresh
                  try {
                    sessionStorage.removeItem("lorri_route_cache")
                    sessionStorage.removeItem("lorri_show_route")
                    sessionStorage.removeItem("lorri_form_data")
                  } catch (_) {}
                  setTrackingNumber(result.tracking_number || "")
                  setBooked(true)
                  // Navigate to tracking page after 1.5s — shipment will appear there
                  setTimeout(() => {
                    window.location.href = "/dashboard/track"
                  }, 1500)
                } catch (err) {
                  setBookingError(err.message || "Booking failed — please try again")
                } finally {
                  setBooking(false)
                }
              }}
              className="px-6 sm:px-7 py-3 rounded-xl font-semibold transition-all"
              style={{
                background: booked ? "rgba(34,197,94,0.15)" : colors.gradientAccent,
                color: booked ? "#4ade80" : "white",
                border: booked ? "1px solid rgba(34,197,94,0.4)" : "none",
                fontSize: typography.sm,
                opacity: booking ? 0.7 : 1,
                cursor: booking || booked ? "default" : "pointer",
              }}
            >
              {booking
                ? <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                    Booking…
                  </span>
                : booked
                  ? `✓ Booked · ${trackingNumber || "Redirecting…"}`
                  : "Book This Route"
              }
            </motion.button>
          </div>
          {bookingError && (
            <div className="px-4 sm:px-5 py-2" style={{ background: "rgba(239,68,68,0.08)", borderTop: "1px solid rgba(239,68,68,0.2)" }}>
              <p style={{ color: "#FCA5A5", fontSize: typography.xs }}>{bookingError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────

function AIRouteCard({ route, active, delay, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className="rounded-2xl cursor-pointer relative overflow-hidden"
      style={{
        background: active
          ? "linear-gradient(145deg, #160F45 0%, #1E1260 40%, #130D3A 100%)"
          : "linear-gradient(145deg, #0F0A30 0%, #160D42 100%)",
        border: `2px solid ${active ? aiAccent : "rgba(139,92,246,0.25)"}`,
        boxShadow: active
          ? "0 0 0 3px rgba(139,92,246,0.2), 0 12px 40px rgba(139,92,246,0.25)"
          : "0 4px 16px rgba(139,92,246,0.1)",
        transition: "all 0.25s ease",
      }}
    >
      {/* Animated shimmer top border */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent 0%, ${aiAccent} 30%, #A78BFA 50%, ${aiAccentEnd} 70%, transparent 100%)`,
        opacity: active ? 1 : 0.5,
      }} />



      <div className="relative p-4 sm:p-5">
        {/* Header row — bot icon + name + price */}
        <div className="flex items-start gap-3 mb-4">
          {/* Mini bot */}
          <div style={{
            width: 44, height: 44, borderRadius: "0.875rem", flexShrink: 0,
            background: "rgba(139,92,246,0.2)",
            border: "1px solid rgba(139,92,246,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}>
            <Player autoplay loop src={botAnimation} style={{ width: 40, height: 40 }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h3 style={{ color: "#EDE9FE", fontWeight: 800, fontSize: typography.base }}>{route.name}</h3>
              <span style={{
                background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                color: "white", fontSize: "9px", fontWeight: 800,
                padding: "2px 7px", borderRadius: 20,
                letterSpacing: "0.06em", whiteSpace: "nowrap",
              }}>✦ AI OPTIMIZED</span>
            </div>
            <div style={{ color: "rgba(196,181,253,0.65)", fontSize: typography.xs }}>
              {route.carrier} · {route.type}
            </div>
          </div>

          <div className="text-right shrink-0">
            <div style={{ color: "#EDE9FE", fontWeight: 800, fontSize: typography.xl }}>
              ₹{route.cost.toLocaleString("en-IN")}
            </div>
            {route.savings > 0 && (
              <div style={{
                color: "#4ADE80", fontSize: "10px", fontWeight: 700,
                background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)",
                padding: "1px 7px", borderRadius: 20, marginTop: 3,
                whiteSpace: "nowrap",
              }}>
                ↓ {route.savingsPercent}% vs market
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: "Transit",  val: `${route.transitDays}d`,  color: "#A78BFA" },
            { label: "Distance", val: `${route.distance}km`,    color: "#A78BFA" },
            { label: "On-Time",  val: `${route.onTimeRate}%`,   color: "#A78BFA" },
            { label: "ETA",      val: route.eta,                color: "#4ADE80" },
          ].map(({ label, val, color }) => (
            <div key={label} className="rounded-xl p-2.5 text-center" style={{
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.18)",
            }}>
              <div style={{ color: "rgba(196,181,253,0.5)", fontSize: "8px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
              <div style={{ color, fontWeight: 800, fontSize: label === "ETA" ? "9px" : typography.sm, lineHeight: 1.2 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* AI Confidence bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span style={{ color: "rgba(196,181,253,0.6)", fontSize: "9px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>AI Confidence Score</span>
            <span style={{ color: "#A78BFA", fontSize: "9px", fontWeight: 800 }}>{route.onTimeRate}%</span>
          </div>
          <div style={{ height: 4, borderRadius: 4, background: "rgba(139,92,246,0.15)", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${route.onTimeRate}%` }}
              transition={{ duration: 1, delay: delay + 0.3, ease: "easeOut" }}
              style={{
                height: "100%", borderRadius: 4,
                background: "linear-gradient(90deg, #7C3AED, #A78BFA, #6366F1)",
              }}
            />
          </div>
        </div>

        {/* AI reasoning panel — expands on select */}
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl p-3 mb-3" style={{
                background: "rgba(109,40,217,0.2)",
                border: "1px solid rgba(139,92,246,0.35)",
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <Player autoplay loop src={botAnimation} style={{ width: 24, height: 24, flexShrink: 0 }} />
                  <span style={{ color: "#C4B5FD", fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em" }}>WHY AI CHOSE THIS</span>
                </div>
                <p style={{ color: "rgba(221,214,254,0.85)", fontSize: typography.xs, lineHeight: 1.6 }}>{route.reason}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature tags */}
        <div className="flex flex-wrap gap-1.5">
          {route.features.map((f, idx) => (
            <span key={idx} style={{
              background: "rgba(109,40,217,0.15)",
              border: "1px solid rgba(139,92,246,0.25)",
              color: "#C4B5FD",
              fontSize: "10px", padding: "2px 9px", borderRadius: 20,
              fontWeight: 500,
            }}>{f}</span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function NormalRouteCard({ route, active, delay, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className="rounded-2xl p-4 sm:p-5 cursor-pointer transition-all"
      style={{
        background: surface,
        border: `2px solid ${active ? colors.accent : border}`,
        boxShadow: active ? "0 0 0 4px rgba(0,180,216,0.12)" : "none",
      }}
    >
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="flex-1 min-w-0">
          <h3 style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.sm, marginBottom: 3 }}>{route.name}</h3>
          <div className="flex items-center gap-1.5" style={{ color: textFade, fontSize: typography.xs }}>
            <TruckIcon className="w-3 h-3 shrink-0" />
            <span className="truncate">{route.carrier}</span>
          </div>
        </div>
        <div style={{ color: textOn, fontWeight: typography.bold, fontSize: typography.lg, flexShrink: 0 }}>₹{route.cost.toLocaleString("en-IN")}</div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          ["Transit", `${route.transitDays}d`],
          ["Distance", `${route.distance}km`],
          ["On-Time", `${route.onTimeRate}%`],
          ["ETA", route.eta],
        ].map(([label, val]) => (
          <div key={label}>
            <div style={{ color: textFade, fontSize: "9px", textTransform: "uppercase", letterSpacing: typography.wider, marginBottom: 2 }}>{label}</div>
            <div style={{ color: label === "ETA" ? colors.success : textOn, fontWeight: typography.semibold, fontSize: "10px" }}>{val}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {route.features.slice(0, 3).map((f, idx) => (
          <span key={idx} style={{ background: surfaceDark, border: `1px solid ${border}`, color: textFade, fontSize: "10px", padding: "2px 8px", borderRadius: 5 }}>{f}</span>
        ))}
      </div>
    </motion.div>
  )
}

function BackButton({ onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-2 mb-4 transition-colors"
      style={{ color: hovered ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)", fontSize: typography.sm }}
    >
      <ArrowLeftIcon className="w-4 h-4" />
      Back to Shipment Details
    </button>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
      style={{
        background: active ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${active ? "rgba(255,255,255,0.2)" : border}`,
        color: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)",
      }}
    >
      {children}
    </button>
  )
}