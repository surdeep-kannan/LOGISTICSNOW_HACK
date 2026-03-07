import { useEffect, useState } from "react"
import { TruckIndicator } from "./TruckIndicator"
import { colors, typography } from "../styles"

const textOn  = "rgba(255,255,255,0.95)"
const textSub = "rgba(255,255,255,0.65)"
const textFade = "rgba(255,255,255,0.35)"

export function TrackingRoute({ origin, destination, currentLocation, distance, estimatedArrival, status, waypoints = [] }) {
  const [truckPosition, setTruckPosition] = useState(20)

  useEffect(() => {
    const interval = setInterval(() => {
      setTruckPosition((prev) => (prev >= 85 ? 20 : prev + 0.5))
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const colorMap = {
    "in-transit": { line: colors.accent,   badge: `rgba(0,180,216,0.12)`,   text: colors.accent,   border: "rgba(0,180,216,0.25)"   },
    delayed:      { line: colors.warning,  badge: `rgba(245,158,11,0.12)`,  text: colors.warning,  border: "rgba(245,158,11,0.25)"  },
    delivered:    { line: colors.success,  badge: `rgba(34,197,94,0.12)`,   text: colors.success,  border: "rgba(34,197,94,0.25)"   },
  }
  const c = colorMap[status] || colorMap["in-transit"]
  const statusLabel = { "in-transit": "In Transit", delayed: "Delayed", delivered: "Delivered" }[status]

  return (
    <div className="space-y-6">
      {/* Route line */}
      <div className="relative py-8">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-4 h-4 rounded-full shadow-lg" style={{ background: colors.accent, boxShadow: `0 0 10px ${colors.accent}` }} />
          <span style={{ color: textOn, fontSize: typography.sm, fontWeight: typography.medium, marginTop: 8 }}>{origin}</span>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-4 h-4 rounded-full shadow-lg" style={{ background: colors.accent, boxShadow: `0 0 10px ${colors.accent}` }} />
          <span style={{ color: textOn, fontSize: typography.sm, fontWeight: typography.medium, marginTop: 8 }}>{destination}</span>
        </div>

        <div className="mx-12 relative" style={{ height: 2, background: "rgba(255,255,255,0.1)" }}>
          <div className="absolute left-0 top-0 h-full transition-all duration-1000" style={{ width: `${truckPosition}%`, background: `linear-gradient(90deg, ${c.line}, ${c.line}99)` }} />
          {waypoints.map((wp, i) => (
            <div key={i} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center" style={{ left: `${((i + 1) / (waypoints.length + 1)) * 100}%` }}>
              <div className="w-2 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.3)" }} />
              <span style={{ color: textFade, fontSize: "10px", marginTop: 6, whiteSpace: "nowrap" }}>{wp}</span>
            </div>
          ))}
        </div>
        <TruckIndicator position={truckPosition} status={status} />
      </div>

      {/* Details row */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        {[
          { label: "Distance",         val: distance         },
          { label: "Est. Arrival",     val: estimatedArrival },
          { label: "Current Location", val: currentLocation  },
        ].map(({ label, val }) => (
          <div key={label}>
            <div style={{ color: textFade, fontSize: typography.xs, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
            <div style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.sm }}>{val}</div>
          </div>
        ))}
        <div>
          <div style={{ color: textFade, fontSize: typography.xs, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Status</div>
          <span style={{ background: c.badge, color: c.text, border: `1px solid ${c.border}`, fontSize: typography.xs, fontWeight: typography.semibold, padding: "3px 10px", borderRadius: 999, display: "inline-block" }}>
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  )
}