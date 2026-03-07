import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import {
  MagnifyingGlassIcon,
  TruckIcon,
  CheckCircleIcon,
  SignalIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid"
import { ShipmentMap } from "../components/ShipmentMap"
import { colors, typography } from "../styles"

const surface    = "#332B7A"
const surfaceMid = "#3D3585"
const border     = "rgba(255,255,255,0.1)"
const textOn     = "rgba(255,255,255,0.95)"
const textSub    = "rgba(255,255,255,0.65)"
const textFade   = "rgba(255,255,255,0.35)"
const inputBg    = "rgba(255,255,255,0.06)"

const recentlyViewed = ["SHP-2024-001", "SHP-2024-003", "SHP-2024-004", "SHP-2024-005", "SHP-2024-006"]

const SHIPMENT_DB = {
  "SHP-2024-001": {
    id: "SHP-2024-001", status: "In Transit", statusColor: "cyan",
    route: "Mumbai → Chennai", carrier: "VRL Logistics", eta: "Mar 8, 2026",
    transportMode: "road", shipmentState: "truck-moving",
    vehicle: "TRK-7823456", completedKm: 350, remainingKm: 650,
    origin:      { lat: 19.076,  lng: 72.8777, name: "Mumbai" },
    current:     { lat: 17.6599, lng: 75.9064, name: "Solapur" },
    destination: { lat: 13.0827, lng: 80.2707, name: "Chennai" },
    ports: [],
    timeline: [
      { label: "Order Booked",  sub: "Mumbai • Mar 1, 09:30 AM",           status: "done"    },
      { label: "Picked Up",     sub: "Mumbai Warehouse • Mar 2, 06:00 AM", status: "done"    },
      { label: "In Transit",    sub: "Near Solapur • Current",             status: "active"  },
      { label: "Delivered",     sub: "Chennai • Est. Mar 8",               status: "pending" },
    ],
    cargo: [
      { label: "Container ID", value: "TRK-7823456"   },
      { label: "Weight",       value: "8,400 kg"       },
      { label: "Commodity",    value: "Electronics"    },
      { label: "Trip Number",  value: "VRL-2024-089"   },
      { label: "Carrier",      value: "VRL Logistics"  },
      { label: "Equipment",    value: "20ft Container" },
    ],
  },
  "SHP-2024-003": {
    id: "SHP-2024-003", status: "Departed Hub", statusColor: "cyan",
    route: "Pune → Kolkata", carrier: "Blue Dart Cargo", eta: "Mar 10, 2026",
    transportMode: "road", shipmentState: "truck-departed",
    vehicle: "TRK-9934512", completedKm: 15, remainingKm: 1585,
    origin:      { lat: 18.5204, lng: 73.8567, name: "Pune" },
    current:     { lat: 18.6298, lng: 73.9231, name: "Pune Hub — Just Departed" },
    destination: { lat: 22.5726, lng: 88.3639, name: "Kolkata" },
    ports: [],
    timeline: [
      { label: "Order Booked", sub: "Pune • Mar 5, 11:00 AM",          status: "done"    },
      { label: "Picked Up",    sub: "Pune Warehouse • Mar 6, 08:00 AM", status: "done"    },
      { label: "Departed Hub", sub: "Pune Hub • Mar 7, 05:30 AM",      status: "active"  },
      { label: "Delivered",    sub: "Kolkata • Est. Mar 10",            status: "pending" },
    ],
    cargo: [
      { label: "Container ID", value: "TRK-9934512"    },
      { label: "Weight",       value: "12,000 kg"      },
      { label: "Commodity",    value: "Textiles"       },
      { label: "Trip Number",  value: "BDC-2024-044"   },
      { label: "Carrier",      value: "Blue Dart Cargo" },
      { label: "Equipment",    value: "32ft Container" },
    ],
  },
  "SHP-2024-004": {
    id: "SHP-2024-004", status: "At Checkpoint", statusColor: "amber",
    route: "Ahmedabad → Hyderabad", carrier: "Gati KWE", eta: "Mar 12, 2026",
    transportMode: "road", shipmentState: "truck-departed",
    vehicle: "TRK-6610023", completedKm: 480, remainingKm: 80,
    origin:      { lat: 23.0225, lng: 72.5714, name: "Ahmedabad" },
    current:     { lat: 17.8500, lng: 78.1200, name: "Shadnagar Toll Plaza" },
    destination: { lat: 17.3850, lng: 78.4867, name: "Hyderabad" },
    ports: [],
    timeline: [
      { label: "Order Booked",  sub: "Ahmedabad • Mar 8, 10:00 AM", status: "done"    },
      { label: "Picked Up",     sub: "Ahmedabad Depot • Mar 9",     status: "done"    },
      { label: "At Checkpoint", sub: "Shadnagar Toll • Current",    status: "active"  },
      { label: "Delivered",     sub: "Hyderabad • Est. Mar 12",     status: "pending" },
    ],
    cargo: [
      { label: "Container ID", value: "TRK-6610023"    },
      { label: "Weight",       value: "6,200 kg"       },
      { label: "Commodity",    value: "Auto Parts"     },
      { label: "Trip Number",  value: "GKW-2024-112"   },
      { label: "Carrier",      value: "Gati KWE"       },
      { label: "Equipment",    value: "20ft Container" },
    ],
  },
  "SHP-2024-005": {
    id: "SHP-2024-005", status: "At Sea", statusColor: "blue",
    route: "Mumbai → Singapore", carrier: "Maersk Line", eta: "Mar 15, 2026",
    transportMode: "sea", shipmentState: "ship-moving",
    vehicle: "MSC LEANDRA", completedKm: 1800, remainingKm: 2400,
    origin:      { lat: 18.9322, lng: 72.8375, name: "JNPT Mumbai" },
    current:     { lat: 6.5,    lng: 87.2,    name: "Indian Ocean" },
    destination: { lat: 1.2966,  lng: 103.852, name: "Singapore Port" },
    ports: [{ lat: 8.0883, lng: 77.5385, name: "Tuticorin" }],
    timeline: [
      { label: "Loaded at Port",  sub: "JNPT Mumbai • Mar 5",    status: "done"    },
      { label: "Vessel Departed", sub: "Mumbai • Mar 6, 14:00",  status: "done"    },
      { label: "At Sea",          sub: "Indian Ocean • Current", status: "active"  },
      { label: "Arrived",         sub: "Singapore • Est. Mar 15",status: "pending" },
    ],
    cargo: [
      { label: "Container ID",   value: "MSCU-4421890"      },
      { label: "Weight",         value: "22,000 kg"         },
      { label: "Commodity",      value: "Machinery"         },
      { label: "Bill of Lading", value: "BL-2024-0054"      },
      { label: "Vessel",         value: "MSC LEANDRA"       },
      { label: "Equipment",      value: "40ft HC Container" },
    ],
  },
  "SHP-2024-006": {
    id: "SHP-2024-006", status: "Loading at Port", statusColor: "purple",
    route: "JNPT Mumbai → Dubai", carrier: "MSC Shipping", eta: "Mar 14, 2026",
    transportMode: "sea", shipmentState: "loading-ship",
    vehicle: "MSC AURORA", completedKm: 0, remainingKm: 1960,
    origin:      { lat: 18.9322, lng: 72.8375, name: "JNPT Mumbai" },
    current:     { lat: 18.9322, lng: 72.8375, name: "JNPT — Loading Bay 4" },
    destination: { lat: 25.2697, lng: 55.3095, name: "Jebel Ali Port, Dubai" },
    ports: [],
    timeline: [
      { label: "Order Confirmed",   sub: "Mar 6, 09:00 AM",          status: "done"    },
      { label: "Container at Port", sub: "JNPT Mumbai • Mar 7",      status: "done"    },
      { label: "Loading",           sub: "Loading Bay 4 • Current",  status: "active"  },
      { label: "Vessel Departure",  sub: "JNPT • Est. Mar 9",        status: "pending" },
      { label: "Arrived Dubai",     sub: "Jebel Ali • Est. Mar 14",  status: "pending" },
    ],
    cargo: [
      { label: "Container ID",   value: "MSCU-8812345"      },
      { label: "Weight",         value: "18,500 kg"         },
      { label: "Commodity",      value: "Pharmaceuticals"   },
      { label: "Bill of Lading", value: "BL-2024-0061"      },
      { label: "Vessel",         value: "MSC AURORA"        },
      { label: "Equipment",      value: "Reefer 40ft"       },
    ],
  },
}

const STATUS_COLOR_MAP = {
  cyan:   { bg: "rgba(0,180,216,0.12)",  bdr: "rgba(0,180,216,0.25)",  text: colors.accent  },
  amber:  { bg: "rgba(245,158,11,0.12)", bdr: "rgba(245,158,11,0.25)", text: colors.warning },
  green:  { bg: "rgba(34,197,94,0.12)",  bdr: "rgba(34,197,94,0.25)",  text: colors.success },
  blue:   { bg: "rgba(59,130,246,0.12)", bdr: "rgba(59,130,246,0.25)", text: "#60A5FA"      },
  purple: { bg: "rgba(108,99,255,0.12)", bdr: "rgba(108,99,255,0.25)", text: "#A5B4FC"      },
}

export default function TrackShipment() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get("id") || "")
  const [showTracking, setShowTracking]     = useState(!!searchParams.get("id"))
  const [focused, setFocused]               = useState(false)
  const [mapExpanded, setMapExpanded]       = useState(false)

  const handleTrack = (e) => {
    if (e) e.preventDefault()
    if (trackingNumber.trim()) {
      setShowTracking(true)
      setSearchParams({ id: trackingNumber })
    }
  }

  const handleQuickAccess = (id) => {
    setTrackingNumber(id)
    setSearchParams({ id })
    setShowTracking(true)
  }

  const shipment = SHIPMENT_DB[trackingNumber] || SHIPMENT_DB["SHP-2024-001"]
  const sc = STATUS_COLOR_MAP[shipment?.statusColor] || STATUS_COLOR_MAP.cyan

  // Map height: explicit pixel value so Leaflet always gets a real dimension
  const mapHeight = mapExpanded ? "70vh" : 480

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* Header */}
      <div>
        <h1 style={{ color: textOn, fontSize: typography["3xl"], fontWeight: typography.bold, letterSpacing: typography.tight, marginBottom: 6 }}>
          Track Shipment
        </h1>
        <p style={{ color: textSub, fontSize: typography.base }}>
          Enter a tracking number to view real-time shipment status
        </p>
      </div>

      {/* Search bar */}
      <div className="rounded-2xl p-4 sm:p-5" style={{ background: surface, border: `1px solid ${border}` }}>
        <form onSubmit={handleTrack} className="flex gap-3 mb-4">
          <div className="flex-1 relative min-w-0">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: textFade }} />
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Enter tracking number (e.g. SHP-2024-001)"
              required
              style={{
                width: "100%",
                background: inputBg,
                border: `1.5px solid ${focused ? "rgba(255,255,255,0.4)" : border}`,
                borderRadius: "0.75rem",
                padding: "0.7rem 1rem 0.7rem 2.75rem",
                color: textOn,
                fontSize: typography.sm,
                outline: "none",
                transition: "border-color 0.15s",
              }}
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl transition-all shrink-0"
            style={{ background: colors.gradientAccent, color: colors.textWhite, fontWeight: typography.semibold, fontSize: typography.sm }}
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Track</span>
          </button>
        </form>

        {/* Quick access chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ color: textFade, fontSize: typography.xs, fontWeight: typography.medium, letterSpacing: typography.wider, textTransform: "uppercase" }}>
            Recent:
          </span>
          {recentlyViewed.map((id) => (
            <QuickChip key={id} id={id} active={trackingNumber === id} onClick={() => handleQuickAccess(id)} />
          ))}
        </div>
      </div>

      {/* Tracking results */}
      {showTracking ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── MAP: order-first on mobile so it renders at top with known dimensions ── */}
          <div
            className="lg:col-span-2 rounded-2xl overflow-hidden flex flex-col order-first lg:order-last"
            style={{
              background: surface,
              border: `1px solid ${border}`,
              height: mapHeight,
            }}
          >
            {/* Map header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ borderBottom: `1px solid ${border}`, height: 48 }}
            >
              <div style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.sm }}>
                Live Map — {shipment.id}
              </div>
              <button
                onClick={() => setMapExpanded(!mapExpanded)}
                className="px-3 py-1 rounded-lg text-xs transition-all"
                style={{ background: "rgba(255,255,255,0.07)", color: textSub, border: `1px solid ${border}` }}
                onMouseEnter={(e) => { e.currentTarget.style.background = surfaceMid; e.currentTarget.style.color = textOn }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = textSub }}
              >
                {mapExpanded ? "Collapse" : "Expand"}
              </button>
            </div>

            {/* Map fill — flex-1 + min-h-0 is the correct pattern for "fill remaining height" */}
            <div className="flex-1 min-h-0">
              <ShipmentMap
                origin={shipment.origin}
                current={shipment.current}
                destination={shipment.destination}
                shipmentState={shipment.shipmentState}
                transportMode={shipment.transportMode}
                ports={shipment.ports}
                shipmentId={shipment.id}
                carrier={shipment.carrier}
                vehicle={shipment.vehicle}
                completedKm={shipment.completedKm}
                remainingKm={shipment.remainingKm}
              />
            </div>
          </div>

          {/* ── INFO PANELS: order-last on mobile, order-first on desktop ── */}
          <div className="lg:col-span-1 space-y-4 order-last lg:order-first">

            {/* Shipment header */}
            <div className="rounded-2xl p-5" style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div style={{ color: textOn, fontFamily: "monospace", fontSize: typography.lg, fontWeight: typography.bold, marginBottom: 4 }}>
                    {shipment.id}
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{ background: sc.bg, border: `1px solid ${sc.bdr}`, color: sc.text, fontSize: typography.xs, fontWeight: typography.semibold }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sc.text }} />
                    {shipment.status}
                  </span>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: sc.bg, border: `1px solid ${sc.bdr}` }}
                >
                  {shipment.transportMode === "sea"
                    ? <svg className="w-5 h-5" fill="none" stroke={sc.text} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l2.5-5h13l2.5 5M3 13.5h18M3 13.5l-1 4.5h20l-1-4.5M8 8.5V5h8v3.5" /></svg>
                    : <TruckIcon className="w-5 h-5" style={{ color: sc.text }} />
                  }
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "Route",   value: shipment.route   },
                  { label: "Carrier", value: shipment.carrier },
                  { label: "ETA",     value: shipment.eta     },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center gap-4">
                    <span style={{ color: textFade, fontSize: typography.xs, fontWeight: typography.medium, letterSpacing: typography.wider, textTransform: "uppercase", flexShrink: 0 }}>{label}</span>
                    <span style={{ color: textOn, fontSize: typography.sm, fontWeight: typography.medium, textAlign: "right" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-2xl p-5" style={{ background: surface, border: `1px solid ${border}` }}>
              <h3 style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.base, marginBottom: 16 }}>
                Timeline
              </h3>
              <div>
                {shipment.timeline.map((step, i) => {
                  const isLast   = i === shipment.timeline.length - 1
                  const isDone   = step.status === "done"
                  const isActive = step.status === "active"
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center" style={{ width: 24 }}>
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10"
                          style={{
                            background: isDone ? colors.success : isActive ? "rgba(0,180,216,0.15)" : surfaceMid,
                            border: `2px solid ${isDone ? colors.success : isActive ? colors.accent : border}`,
                          }}
                        >
                          {isDone
                            ? <CheckCircleSolid className="w-3.5 h-3.5 text-white" />
                            : isActive
                              ? <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: colors.accent }} />
                              : <span className="w-2 h-2 rounded-full" style={{ background: border }} />
                          }
                        </div>
                        {!isLast && <div className="w-px flex-1 my-1" style={{ background: isDone ? colors.success : "rgba(255,255,255,0.08)", minHeight: 20 }} />}
                      </div>
                      <div className="pb-4 flex-1 min-w-0">
                        <div style={{ color: isDone ? textOn : isActive ? colors.accent : textFade, fontSize: typography.sm, fontWeight: typography.semibold, marginBottom: 2 }}>
                          {step.label}
                        </div>
                        <div style={{ color: textFade, fontSize: typography.xs }}>{step.sub}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Cargo details */}
            <div className="rounded-2xl p-5" style={{ background: surface, border: `1px solid ${border}` }}>
              <h3 style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.base, marginBottom: 14 }}>
                Cargo Details
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                {shipment.cargo.map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ color: textFade, fontSize: typography.xs, fontWeight: typography.medium, letterSpacing: typography.wider, textTransform: "uppercase", marginBottom: 3 }}>
                      {label}
                    </div>
                    <div style={{ color: textOn, fontSize: typography.sm, fontWeight: typography.medium }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* Empty state */
        <div
          className="rounded-2xl flex flex-col items-center justify-center py-20 sm:py-28"
          style={{ background: surface, border: `1px solid ${border}` }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: surfaceMid, border: `1px solid ${border}` }}
          >
            <MagnifyingGlassIcon className="w-7 h-7" style={{ color: textFade }} />
          </div>
          <h3 style={{ color: textOn, fontSize: typography.lg, fontWeight: typography.semibold, marginBottom: 8 }}>
            Enter a tracking number
          </h3>
          <p style={{ color: textSub, fontSize: typography.sm, textAlign: "center", maxWidth: 320, padding: "0 1rem" }}>
            Search above or select a recent shipment to view real-time tracking details
          </p>
        </div>
      )}
    </div>
  )
}

function QuickChip({ id, active, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="px-3 py-1 rounded-full transition-all"
      style={{
        background: active ? "rgba(255,255,255,0.15)" : hovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${active ? "rgba(255,255,255,0.3)" : hovered ? "rgba(255,255,255,0.2)" : border}`,
        color: active ? textOn : hovered ? textOn : "rgba(255,255,255,0.55)",
        fontSize: typography.xs,
        fontFamily: "monospace",
        fontWeight: typography.medium,
      }}
    >
      {id}
    </button>
  )
}