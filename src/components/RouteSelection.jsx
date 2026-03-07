import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeftIcon,
  SparklesIcon,
  TruckIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/outline"
import { RouteMap } from "./RouteMap"
import { colors, typography } from "../styles"

const surface     = "#332B7A"
const surfaceMid  = "#3D3585"
const surfaceDark = "#1E1856"
const border      = "rgba(255,255,255,0.1)"
const textOn      = "rgba(255,255,255,0.95)"
const textSub     = "rgba(255,255,255,0.65)"
const textFade    = "rgba(255,255,255,0.35)"

export function RouteSelection({ formData, onBack }) {
  const [selectedRoute, setSelectedRoute] = useState("ai-1")
  const [showMap, setShowMap] = useState(false)
  const [mapMounted, setMapMounted] = useState(true) // always mount map for Leaflet init

  const origin      = { lat: 19.076, lng: 72.8777, name: `${formData.originCity}, ${formData.originState}` }
  const destination = { lat: 13.0827, lng: 80.2707, name: `${formData.destCity}, ${formData.destState}` }

  const aiRoutes = [
    {
      id: "ai-1", name: "Express Via Bangalore", carrier: "VRL Logistics", type: "Direct Highway",
      transitDays: 2, cost: 42500, distance: 1340, reliability: 98, onTimeRate: 97,
      stops: ["Mumbai", "Pune", "Bangalore", "Chennai"],
      features: ["Real-time tracking", "Priority handling", "24/7 support", "Insurance included"],
      aiRecommended: true, savings: 7500, savingsPercent: 15,
      reason: "Fastest route with optimal fuel efficiency. Avoids NH-48 congestion via Bangalore bypass.",
      routeCoordinates: [[19.076,72.8777],[18.5204,73.8567],[17.5,76.0],[15.3647,75.124],[13.0827,77.5946],[12.8,78.8],[13.0827,80.2707]],
    },
    {
      id: "ai-2", name: "Economy Plus Route", carrier: "TCI Freight", type: "Multi-modal",
      transitDays: 3, cost: 38900, distance: 1420, reliability: 95, onTimeRate: 94,
      stops: ["Mumbai", "Pune", "Solapur", "Hyderabad", "Chennai"],
      features: ["Cost-optimized", "Reliable carrier", "Tracking available", "Standard insurance"],
      aiRecommended: true, savings: 11100, savingsPercent: 22,
      reason: "Best cost-to-transit ratio. Uses less congested secondary highways.",
      routeCoordinates: [[19.076,72.8777],[18.5204,73.8567],[17.6599,75.9064],[17.385,78.4867],[15.0,79.5],[13.0827,80.2707]],
    },
  ]

  const normalRoutes = [
    {
      id: "normal-1", name: "Standard Direct", carrier: "Blue Dart Cargo", type: "Highway Direct",
      transitDays: 3, cost: 45000, distance: 1366, onTimeRate: 90,
      features: ["Standard tracking", "Basic insurance", "Business hours support"],
      routeCoordinates: [[19.076,72.8777],[18.5204,73.8567],[17.0,76.5],[13.0827,77.5946],[13.0827,80.2707]],
    },
    {
      id: "normal-2", name: "Coastal Route", carrier: "Gati KWE", type: "Coastal Highway",
      transitDays: 4, cost: 50000, distance: 1685, onTimeRate: 85,
      features: ["Scenic route", "Multiple stops", "Standard tracking"],
      routeCoordinates: [[19.076,72.8777],[15.2993,74.124],[12.9141,74.856],[11.0168,76.9558],[13.0827,80.2707]],
    },
    {
      id: "normal-3", name: "Economy Standard", carrier: "Agarwal Packers", type: "Mixed Highway",
      transitDays: 4, cost: 39500, distance: 1450, onTimeRate: 82,
      features: ["Budget-friendly", "Basic tracking", "Standard delivery"],
      routeCoordinates: [[19.076,72.8777],[18.5204,73.8567],[17.6599,75.9064],[15.8281,78.0373],[13.0827,80.2707]],
    },
    {
      id: "normal-4", name: "Rail Freight", carrier: "Container Corporation", type: "Rail Transport",
      transitDays: 5, cost: 35000, distance: 1279, onTimeRate: 88,
      features: ["Eco-friendly", "Cost-effective", "High capacity"],
      routeCoordinates: [[19.076,72.8777],[18.5204,73.8567],[17.0,77.0],[14.5,78.5],[13.0827,80.2707]],
    },
  ]

  const allRoutes = [...aiRoutes, ...normalRoutes]
  const selectedRouteData = allRoutes.find((r) => r.id === selectedRoute)

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5">
        <BackButton onClick={onBack} />
        <h1 style={{ color: textOn, fontSize: typography["3xl"], fontWeight: typography.bold, letterSpacing: typography.tight, marginBottom: 6 }}>
          Select Route
        </h1>
        <p style={{ color: textSub, fontSize: typography.base }}>
          Choose the best route from {formData.originCity} to {formData.destCity}
        </p>
      </div>

      {/* Mobile: toggle between list and map */}
      <div className="flex xl:hidden gap-2 mb-4">
        <TabButton active={!showMap} onClick={() => setShowMap(false)}>Route List</TabButton>
        <TabButton active={showMap}  onClick={() => setShowMap(true)}>Map View</TabButton>
      </div>

      {/* Layout */}
      <div className="xl:grid xl:grid-cols-12 xl:gap-5 relative" style={{ minHeight: "60vh" }}>

        {/* Left — route list */}
        <div
          className={`xl:col-span-5 space-y-5 xl:overflow-y-auto xl:pr-1 ${showMap ? "xl:block hidden" : "block"}`}
          style={{ maxHeight: "calc(100vh - 260px)" }}
        >
          {/* AI Routes */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#6C63FF,#5B52D8)" }}>
                <SparklesIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 style={{ color: textOn, fontWeight: typography.bold, fontSize: typography.base }}>LoRRI AI Recommended</h2>
                <p style={{ color: textFade, fontSize: typography.xs }}>Optimized for cost, speed & reliability</p>
              </div>
            </div>
            <div className="space-y-4">
              {aiRoutes.map((route, i) => {
                const active = selectedRoute === route.id
                return (
                  <motion.div
                    key={route.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => { setSelectedRoute(route.id); setShowMap(true) }}
                    className="rounded-2xl p-4 sm:p-5 cursor-pointer transition-all"
                    style={{
                      background: surface,
                      border: `2px solid ${active ? "#6C63FF" : border}`,
                      boxShadow: active ? "0 0 0 4px rgba(108,99,255,0.15)" : "none",
                    }}
                  >
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 style={{ color: textOn, fontWeight: typography.bold, fontSize: typography.base }}>{route.name}</h3>
                          <span style={{ background: "linear-gradient(135deg,#6C63FF,#5B52D8)", color: "white", fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: 5, whiteSpace: "nowrap" }}>AI PICK</span>
                        </div>
                        <div className="flex items-center gap-1.5" style={{ color: textFade, fontSize: typography.xs }}>
                          <TruckIcon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{route.carrier} · {route.type}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div style={{ color: textOn, fontWeight: typography.bold, fontSize: typography.xl }}>₹{route.cost.toLocaleString()}</div>
                        <div style={{ color: colors.success, fontSize: typography.xs, fontWeight: typography.semibold, whiteSpace: "nowrap" }}>
                          Save ₹{route.savings.toLocaleString()} ({route.savingsPercent}%)
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { Icon: ClockIcon,      label: "Transit",  val: `${route.transitDays}d`  },
                        { Icon: MapPinIcon,      label: "Distance", val: `${route.distance}km`    },
                        { Icon: CheckCircleIcon, label: "On-Time",  val: `${route.onTimeRate}%`   },
                      ].map(({ Icon, label, val }) => (
                        <div key={label} className="rounded-xl p-2.5 sm:p-3" style={{ background: surfaceDark }}>
                          <div className="flex items-center gap-1 mb-1">
                            <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" style={{ color: colors.accent }} />
                            <span style={{ color: textFade, fontSize: "9px", letterSpacing: typography.wider, textTransform: "uppercase" }}>{label}</span>
                          </div>
                          <div style={{ color: textOn, fontWeight: typography.bold, fontSize: typography.sm }}>{val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Stops */}
                    <div className="mb-3">
                      <div style={{ color: textFade, fontSize: "10px", fontWeight: typography.semibold, letterSpacing: typography.wider, textTransform: "uppercase", marginBottom: 6 }}>Route Stops</div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {route.stops.map((stop, idx) => (
                          <span key={idx} className="flex items-center gap-1">
                            <span style={{ background: surfaceMid, color: textSub, fontSize: typography.xs, padding: "2px 8px", borderRadius: 5 }}>{stop}</span>
                            {idx < route.stops.length - 1 && <span style={{ color: textFade, fontSize: typography.xs }}>→</span>}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* AI reason */}
                    {active && (
                      <div className="rounded-xl p-3 mb-3" style={{ background: "rgba(108,99,255,0.12)", border: "1px solid rgba(108,99,255,0.25)" }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <SparklesIcon className="w-3.5 h-3.5" style={{ color: "#A5B4FC" }} />
                          <span style={{ color: "#A5B4FC", fontSize: "10px", fontWeight: 700, letterSpacing: typography.wider }}>AI INSIGHT</span>
                        </div>
                        <p style={{ color: textSub, fontSize: typography.xs }}>{route.reason}</p>
                      </div>
                    )}

                    {/* Features */}
                    <div className="flex flex-wrap gap-1.5">
                      {route.features.map((f, idx) => (
                        <span key={idx} style={{ background: surfaceDark, border: `1px solid ${border}`, color: textFade, fontSize: "10px", padding: "2px 8px", borderRadius: 5 }}>{f}</span>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
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
                <p style={{ color: textFade, fontSize: typography.xs }}>Additional route options</p>
              </div>
            </div>
            <div className="space-y-3">
              {normalRoutes.map((route, i) => {
                const active = selectedRoute === route.id
                return (
                  <motion.div
                    key={route.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16 + i * 0.07 }}
                    onClick={() => { setSelectedRoute(route.id); setShowMap(true) }}
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
                      <div style={{ color: textOn, fontWeight: typography.bold, fontSize: typography.lg, shrink: 0 }}>₹{route.cost.toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
                      {[["Transit", `${route.transitDays}d`], ["Distance", `${route.distance}km`], ["On-Time", `${route.onTimeRate}%`]].map(([label, val]) => (
                        <div key={label}>
                          <div style={{ color: textFade, fontSize: "9px", textTransform: "uppercase", letterSpacing: typography.wider, marginBottom: 2 }}>{label}</div>
                          <div style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.sm }}>{val}</div>
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
              })}
            </div>
          </section>
        </div>

        {/* Right — map */}
        <div
          className="xl:col-span-7 rounded-2xl overflow-hidden flex flex-col"
          style={{ background: surface, border: `1px solid ${border}`, height: 560, display: showMap ? "flex" : "none", flexDirection: "column" }}
          // On xl screens always show via xl:flex override handled by className below
        >
          <div className="px-4 sm:px-5 py-4 flex items-center justify-between shrink-0" style={{ borderBottom: `1px solid ${border}` }}>
            <div className="min-w-0">
              <h3 style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.base }}>Route Visualization</h3>
              <p style={{ color: textFade, fontSize: typography.xs, marginTop: 3 }} className="truncate">
                {selectedRouteData ? selectedRouteData.name : "Select a route to view on map"}
              </p>
            </div>
            {selectedRouteData && (
              <span className="shrink-0 ml-3" style={{
                background: selectedRouteData.aiRecommended ? "linear-gradient(135deg,#6C63FF,#5B52D8)" : "rgba(0,180,216,0.15)",
                color: "white", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: 6
              }}>
                {selectedRouteData.aiRecommended ? "AI PICK" : selectedRouteData.type}
              </span>
            )}
          </div>

          <div className="flex-1 min-h-0" style={{ position: "relative" }}>
            {selectedRouteData && (
              <RouteMap key={`${selectedRoute}-${showMap}`} origin={origin} destination={destination} route={selectedRouteData} />
            )}
          </div>

          <div
            className="px-4 sm:px-5 py-4 shrink-0 flex flex-wrap items-center justify-between gap-3"
            style={{ borderTop: `1px solid ${border}`, background: surfaceDark }}
          >
            <div>
              <div style={{ color: textFade, fontSize: typography.xs, marginBottom: 4 }}>Total Cost</div>
              <div style={{ color: textOn, fontWeight: typography.bold, fontSize: typography["2xl"] }}>
                ₹{selectedRouteData?.cost.toLocaleString()}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => console.log("Booking route:", selectedRoute)}
              className="px-6 sm:px-7 py-3 rounded-xl font-semibold transition-all"
              style={{ background: colors.gradientAccent, color: colors.textWhite, fontSize: typography.sm }}
            >
              Book This Route
            </motion.button>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

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