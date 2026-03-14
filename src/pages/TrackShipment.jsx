import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import {
  MagnifyingGlassIcon,
  TruckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid"
import { ShipmentMap } from "../components/ShipmentMap"
import { colors, typography } from "../styles"
import { shipments as shipmentsApi } from "../lib/api"

const surface    = "#332B7A"
const surfaceMid = "#3D3585"
const border     = "rgba(255,255,255,0.1)"
const textOn     = "rgba(255,255,255,0.95)"
const textSub    = "rgba(255,255,255,0.65)"
const textFade   = "rgba(255,255,255,0.35)"
const inputBg    = "rgba(255,255,255,0.06)"

// ─────────────────────────────────────────────────────────
//  DEMO shipments — one per transport mode / state
// ─────────────────────────────────────────────────────────
const DEMO_SHIPMENTS = {
  "DEMO-SEA-001": {
    id:            "DEMO-SEA-001",
    status:        "At Sea",
    statusColor:   "blue",
    route:         "JNPT Mumbai → Singapore",
    carrier:       "NovaSea Lines",
    eta:           "Mar 22, 2026",
    transportMode: "sea",
    shipmentState: "ship-moving",
    vehicle:       "MSC LEANDRA",
    completedKm:   2100,
    remainingKm:   2200,
    origin:      { lat: 18.932, lng: 72.837, name: "JNPT Mumbai" },
    current:     { lat: 6.5,   lng: 87.2,   name: "Indian Ocean" },
    destination: { lat: 1.296, lng: 103.852, name: "Singapore Port" },
    ports: [{ lat: 8.088, lng: 77.538, name: "Tuticorin" }],
    timeline: [
      { label: "Order Confirmed",   sub: "JNPT Mumbai · Mar 10, 09:00 AM",  status: "done"    },
      { label: "Loaded at Port",    sub: "JNPT Mumbai · Mar 11, 14:00",     status: "done"    },
      { label: "Vessel Departed",   sub: "JNPT Mumbai · Mar 12, 06:00",     status: "done"    },
      { label: "At Sea",            sub: "Indian Ocean · Current",           status: "active"  },
      { label: "Singapore Customs", sub: "Est. Mar 20",                      status: "pending" },
      { label: "Delivered",         sub: "Singapore Port · Est. Mar 22",     status: "pending" },
    ],
    cargo: [
      { label: "Container ID",   value: "MSCU-4421890"       },
      { label: "Weight",         value: "22,000 kg"          },
      { label: "Commodity",      value: "Industrial Machinery"},
      { label: "Bill of Lading", value: "BL-2024-0054"       },
      { label: "Vessel",         value: "MSC LEANDRA"        },
      { label: "Equipment",      value: "40ft HC Container"  },
    ],
  },
  "DEMO-RD-002": {
    id:            "DEMO-RD-002",
    status:        "In Transit",
    statusColor:   "cyan",
    route:         "Delhi → Mumbai",
    carrier:       "SwiftMove Express",
    eta:           "Mar 15, 2026",
    transportMode: "road",
    shipmentState: "truck-moving",
    vehicle:       "HR-38-AK-4421",
    completedKm:   820,
    remainingKm:   560,
    origin:      { lat: 28.613, lng: 77.209, name: "Delhi ICD" },
    current:     { lat: 23.022, lng: 72.571, name: "Ahmedabad Hub" },
    destination: { lat: 19.076, lng: 72.877, name: "Mumbai Warehouse" },
    ports: [{ lat: 25.594, lng: 85.137, name: "Bhopal Checkpoint" }],
    timeline: [
      { label: "Order Booked",  sub: "Delhi ICD · Mar 12, 08:00",     status: "done"    },
      { label: "Picked Up",     sub: "Delhi Warehouse · Mar 12, 11:00",status: "done"    },
      { label: "Delhi Depot",   sub: "Departed · Mar 12, 23:00",       status: "done"    },
      { label: "Ahmedabad Hub", sub: "En route · Current",             status: "active"  },
      { label: "Mumbai APMC",   sub: "Est. Mar 15, 06:00",             status: "pending" },
      { label: "Delivered",     sub: "Mumbai Warehouse · Est. Mar 15", status: "pending" },
    ],
    cargo: [
      { label: "Tracking No",  value: "DEMO-RD-002"         },
      { label: "Weight",       value: "4,200 kg"            },
      { label: "Commodity",    value: "Auto Components"     },
      { label: "Carrier",      value: "SwiftMove Express"   },
      { label: "Equipment",    value: "20ft Container Truck"},
      { label: "Incoterms",    value: "DAP"                 },
    ],
  },
  "DEMO-AIR-003": {
    id:            "DEMO-AIR-003",
    status:        "At Customs",
    statusColor:   "purple",
    route:         "Bangalore → Dubai Intl",
    carrier:       "SkyBridge Cargo",
    eta:           "Mar 14, 2026",
    transportMode: "air",
    shipmentState: "customs",
    vehicle:       "AI-1401",
    completedKm:   2420,
    remainingKm:   80,
    origin:      { lat: 12.972, lng: 77.595, name: "Bangalore KEA" },
    current:     { lat: 25.010, lng: 55.060, name: "Dubai Customs" },
    destination: { lat: 25.205, lng: 55.271, name: "Dubai World Central" },
    ports: [],
    timeline: [
      { label: "Booking Confirmed", sub: "Bangalore KEA · Mar 12, 15:00", status: "done"    },
      { label: "Cargo Acceptance",  sub: "BLR Airport · Mar 13, 06:00",   status: "done"    },
      { label: "Flight Departed",   sub: "AI-1401 · Mar 13, 22:45",        status: "done"    },
      { label: "Landed Dubai",      sub: "DWC Airport · Mar 14, 01:30",    status: "done"    },
      { label: "Customs Clearance", sub: "In Progress · Current",          status: "active"  },
      { label: "Delivered",         sub: "Dubai Warehouse · Est. Mar 14",  status: "pending" },
    ],
    cargo: [
      { label: "AWB No",      value: "SB-4421890-03"      },
      { label: "Weight",      value: "680 kg"             },
      { label: "Commodity",   value: "Pharmaceutical"     },
      { label: "Carrier",     value: "SkyBridge Cargo"    },
      { label: "Equipment",   value: "ULD Container"      },
      { label: "Incoterms",   value: "CIF"                },
    ],
  },
  "DEMO-DONE-004": {
    id:            "DEMO-DONE-004",
    status:        "Delivered",
    statusColor:   "green",
    route:         "Chennai → Kolkata",
    carrier:       "IndoRail Logistics",
    eta:           "Delivered",
    transportMode: "rail",
    shipmentState: "loaded-complete",
    vehicle:       "CONCOR-BOXX-12",
    completedKm:   1680,
    remainingKm:   0,
    origin:      { lat: 13.082, lng: 80.270, name: "Chennai Rail ICD" },
    current:     { lat: 22.572, lng: 88.363, name: "Kolkata Dankuni" },
    destination: { lat: 22.572, lng: 88.363, name: "Kolkata Dankuni ICD" },
    ports: [{ lat: 17.686, lng: 83.218, name: "Visakhapatnam" }],
    timeline: [
      { label: "Order Placed",     sub: "Chennai ICD · Mar 6, 09:00",      status: "done" },
      { label: "Loaded on Rake",   sub: "Chennai Rail · Mar 7, 04:00",      status: "done" },
      { label: "Departed Chennai", sub: "Mar 7, 06:00",                     status: "done" },
      { label: "Visakhapatnam",    sub: "Transit stop · Mar 8, 14:00",      status: "done" },
      { label: "Arrived Kolkata",  sub: "Dankuni ICD · Mar 10, 11:30",      status: "done" },
      { label: "Delivered",        sub: "Kolkata Dankuni · Mar 10, 15:00",  status: "done" },
    ],
    cargo: [
      { label: "Tracking No",  value: "DEMO-DONE-004"          },
      { label: "Weight",       value: "38,500 kg"              },
      { label: "Commodity",    value: "Steel Coils"            },
      { label: "Carrier",      value: "IndoRail Logistics"    },
      { label: "Equipment",    value: "BOXX Wagon × 4"         },
      { label: "Incoterms",    value: "EXW"                    },
    ],
  },
}

const SEA_DEMO = DEMO_SHIPMENTS["DEMO-SEA-001"]
const ALL_DEMO_IDS = Object.keys(DEMO_SHIPMENTS)


// ─────────────────────────────────────────────────────────
//  Status metadata
// ─────────────────────────────────────────────────────────
const STATUS_META = {
  pending:           { label: "Pending",          color: "amber",  state: "truck-departed"  },
  in_transit:        { label: "In Transit",       color: "cyan",   state: "truck-moving"    },
  delivered:         { label: "Delivered",        color: "green",  state: "loaded-complete" },
  delayed:           { label: "Delayed",          color: "amber",  state: "truck-moving"    },
  cancelled:         { label: "Cancelled",        color: "red",    state: "truck-departed"  },
  "truck-departed":  { label: "Departed Hub",     color: "cyan",   state: "truck-departed"  },
  "truck-moving":    { label: "In Transit",       color: "cyan",   state: "truck-moving"    },
  "loading-ship":    { label: "Loading at Port",  color: "purple", state: "loading-ship"    },
  "loaded-complete": { label: "Loaded",           color: "green",  state: "loaded-complete" },
  "ship-moving":     { label: "At Sea",           color: "blue",   state: "ship-moving"     },
  "customs":         { label: "At Customs",       color: "purple", state: "customs"         },
  "checkpoint":      { label: "At Checkpoint",    color: "amber",  state: "checkpoint"      },
}

const STATUS_COLOR_MAP = {
  cyan:   { bg: "rgba(0,180,216,0.12)",  bdr: "rgba(0,180,216,0.25)",  text: colors.accent  },
  amber:  { bg: "rgba(245,158,11,0.12)", bdr: "rgba(245,158,11,0.25)", text: colors.warning },
  green:  { bg: "rgba(34,197,94,0.12)",  bdr: "rgba(34,197,94,0.25)",  text: colors.success },
  blue:   { bg: "rgba(59,130,246,0.12)", bdr: "rgba(59,130,246,0.25)", text: "#60A5FA"      },
  purple: { bg: "rgba(108,99,255,0.12)", bdr: "rgba(108,99,255,0.25)", text: "#A5B4FC"      },
  red:    { bg: "rgba(239,68,68,0.12)",  bdr: "rgba(239,68,68,0.25)",  text: "#FCA5A5"      },
}

// ─────────────────────────────────────────────────────────
//  City coords
// ─────────────────────────────────────────────────────────
const COORDS = {
  "navi mumbai": { lat: 19.033, lng: 73.029 },
  mumbai:        { lat: 19.076, lng: 72.877 },
  chennai:       { lat: 13.082, lng: 80.270 },
  delhi:         { lat: 28.613, lng: 77.209 },
  "new delhi":   { lat: 28.613, lng: 77.209 },
  bangalore:     { lat: 12.971, lng: 77.594 },
  bengaluru:     { lat: 12.971, lng: 77.594 },
  hyderabad:     { lat: 17.385, lng: 78.486 },
  pune:          { lat: 18.520, lng: 73.856 },
  kolkata:       { lat: 22.572, lng: 88.363 },
  ahmedabad:     { lat: 23.022, lng: 72.571 },
  surat:         { lat: 21.170, lng: 72.831 },
  jaipur:        { lat: 26.912, lng: 75.787 },
  lucknow:       { lat: 26.846, lng: 80.946 },
  nagpur:        { lat: 21.145, lng: 79.088 },
  indore:        { lat: 22.719, lng: 75.857 },
  coimbatore:    { lat: 11.016, lng: 76.955 },
  kochi:         { lat: 9.931,  lng: 76.267 },
  cochin:        { lat: 9.931,  lng: 76.267 },
  visakhapatnam: { lat: 17.686, lng: 83.218 },
  vadodara:      { lat: 22.307, lng: 73.181 },
  bhopal:        { lat: 23.259, lng: 77.412 },
  patna:         { lat: 25.594, lng: 85.137 },
  chandigarh:    { lat: 30.733, lng: 76.779 },
  nashik:        { lat: 19.997, lng: 73.789 },
  madurai:       { lat: 9.925,  lng: 78.119 },
  rajkot:        { lat: 22.303, lng: 70.802 },
  jnpt:          { lat: 18.932, lng: 72.837 },
  singapore:     { lat: 1.296,  lng: 103.852 },
  dubai:         { lat: 25.269, lng: 55.309  },
  "jebel ali":   { lat: 25.010, lng: 55.060  },
}

function getCityCoords(city) {
  if (!city) return { lat: 19.076, lng: 72.877 }
  const key = city.toLowerCase().trim()
  if (COORDS[key]) return COORDS[key]
  const found = Object.keys(COORDS).find(k => key.includes(k) || k.includes(key))
  return found ? COORDS[found] : { lat: 20.593, lng: 78.962 }
}

// ─────────────────────────────────────────────────────────
//  Convert real DB shipment → display shape
// ─────────────────────────────────────────────────────────
function dbToDisplay(s) {
  // Use shipment_state if available (richer), else fall back to status
  const stateKey = s.shipment_state || s.status || "pending"
  const meta     = STATUS_META[stateKey] || STATUS_META[s.status] || STATUS_META.pending

  // Timeline — use real timeline from DB if present
  const tl = s.shipment_timeline?.length > 0
    ? s.shipment_timeline.map(t => ({
        label:  t.label,
        sub:    t.sub || "",
        status: t.status || "done",
      }))
    : buildTimeline(s)

  // Coordinates
  const oCoord = (s.origin_lat && s.origin_lng)
    ? { lat: s.origin_lat, lng: s.origin_lng }
    : getCityCoords(s.origin_city)

  const dCoord = (s.dest_lat && s.dest_lng)
    ? { lat: s.dest_lat, lng: s.dest_lng }
    : getCityCoords(s.dest_city)

  // Current position — midpoint estimate if no GPS
  const progress = s.status === "delivered" ? 0.95
    : s.status === "in_transit" ? 0.35
    : 0.02
  const curCoord = (s.current_lat && s.current_lng)
    ? { lat: s.current_lat, lng: s.current_lng }
    : {
        lat: oCoord.lat + (dCoord.lat - oCoord.lat) * progress,
        lng: oCoord.lng + (dCoord.lng - oCoord.lng) * progress,
      }

  const distanceKm = Math.round(
    111 * Math.sqrt(
      Math.pow(oCoord.lat - dCoord.lat, 2) +
      Math.pow((oCoord.lng - dCoord.lng) * Math.cos(oCoord.lat * Math.PI / 180), 2)
    ) * 1.35
  )
  const completedKm = s.completed_km || Math.round(distanceKm * progress)
  const remainingKm = s.remaining_km || (distanceKm - completedKm)

  // Extract saved route name from special_instructions
  const routeMatch = (s.special_instructions || "").match(/^Route: ([^|]+)/)
  const routeName  = routeMatch ? routeMatch[1].trim() : `${s.origin_city} → ${s.dest_city}`

  const etaLabel = s.status === "delivered"
    ? "Delivered"
    : s.eta
      ? new Date(s.eta).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      : "TBD"

  return {
    id:            s.tracking_number,
    status:        meta.label,
    statusColor:   meta.color,
    route:         routeName,
    carrier:       s.carrier || "—",
    eta:           etaLabel,
    transportMode: s.transport_mode || "road",
    shipmentState: meta.state,
    vehicle:       s.vehicle_id || s.equipment_type || "—",
    completedKm,
    remainingKm,
    origin:      { ...oCoord,  name: s.origin_city || "Origin"      },
    current:     { ...curCoord, name: s.current_location || s.origin_city || "En Route" },
    destination: { ...dCoord,  name: s.dest_city   || "Destination" },
    ports:       s.ports || [],
    timeline:    tl,
    cargo: [
      { label: "Tracking No",  value: s.tracking_number },
      { label: "Weight",       value: s.weight ? `${Number(s.weight).toLocaleString("en-IN")} ${s.weight_unit || "kg"}` : "—" },
      { label: "Commodity",    value: s.commodity || s.cargo_type || "—" },
      { label: "Carrier",      value: s.carrier || "—" },
      { label: "Equipment",    value: s.equipment_type || "—" },
      { label: "Incoterms",    value: (s.incoterms || "").toUpperCase() || "—" },
    ],
  }
}

function buildTimeline(s) {
  const isSea       = s.transport_mode === "sea"
  const isDelivered = s.status === "delivered"
  const isTransit   = s.status === "in_transit" || s.status === "delayed"
  const isPending   = s.status === "pending"

  const created = new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })

  if (isSea) {
    return [
      { label: "Order Confirmed",   sub: `${s.origin_city} · ${created}`,      status: "done"    },
      { label: "Container at Port", sub: `${s.origin_city}`,                    status: "done"    },
      { label: "Vessel Departed",   sub: isPending ? "Pending" : s.origin_city, status: isPending ? "active" : "done" },
      { label: "At Sea",            sub: isTransit ? "En route · Current" : "Pending",            status: isTransit ? "active" : isDelivered ? "done" : "pending" },
      { label: "Delivered",         sub: `${s.dest_city} · ${s.eta ? new Date(s.eta).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "TBD"}`, status: isDelivered ? "done" : "pending" },
    ]
  }

  return [
    { label: "Order Booked",     sub: `${s.origin_city} · ${created}`,    status: "done"    },
    { label: "Picked Up",        sub: `${s.origin_city} Warehouse`,        status: isPending ? "active" : "done" },
    { label: "In Transit",       sub: isTransit ? "En route · Current" : "Pending", status: isTransit ? "active" : isDelivered ? "done" : "pending" },
    { label: "Delivered",        sub: `${s.dest_city} · ${s.eta ? new Date(s.eta).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "TBD"}`, status: isDelivered ? "done" : "pending" },
  ]
}

// ─────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export default function TrackShipment() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [trackingInput,   setTrackingInput]   = useState(searchParams.get("id") || "")
  const [showTracking,    setShowTracking]     = useState(!!searchParams.get("id"))
  const [focused,         setFocused]          = useState(false)
  const [mapExpanded,     setMapExpanded]      = useState(false)

  const [shipment,        setShipment]         = useState(null)
  const [loadingShipment, setLoadingShipment]  = useState(false)
  const [shipmentError,   setShipmentError]    = useState("")

  const [recentIds, setRecentIds] = useState(ALL_DEMO_IDS)

  // Load recent shipments for quick chips
  useEffect(() => {
    shipmentsApi.list({ limit: 4 })
      .then(data => {
        const ids = (data.shipments || [])
          .map(s => s.tracking_number)
          .filter(Boolean)
          .slice(0, 4)
        setRecentIds([...ids, ...ALL_DEMO_IDS])
      })
      .catch(() => setRecentIds(ALL_DEMO_IDS))
  }, [])

  // Load shipment when URL param changes
  useEffect(() => {
    const id = searchParams.get("id")
    if (!id) return

    setTrackingInput(id)
    setShowTracking(true)
    setShipment(null)
    setShipmentError("")

    // Immediately resolve any demo shipment without hitting API
    if (DEMO_SHIPMENTS[id]) {
      setShipment(DEMO_SHIPMENTS[id])
      return
    }

    setLoadingShipment(true)
    shipmentsApi.get(id)
      .then(data => {
        if (data?.shipment) {
          setShipment(dbToDisplay(data.shipment))
        } else {
          setShipmentError("Shipment not found")
        }
      })
      .catch(() => setShipmentError("Could not load shipment — check tracking number"))
      .finally(() => setLoadingShipment(false))
  }, [searchParams])

  const handleTrack = (e) => {
    if (e) e.preventDefault()
    const id = trackingInput.trim()
    if (id) setSearchParams({ id })
  }

  const sc        = STATUS_COLOR_MAP[shipment?.statusColor] || STATUS_COLOR_MAP.cyan
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

      {/* Search */}
      <div className="rounded-2xl p-4 sm:p-5" style={{ background: surface, border: `1px solid ${border}` }}>
        <form onSubmit={handleTrack} className="flex gap-3 mb-4">
          <div className="flex-1 relative min-w-0">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: textFade }} />
            <input
              type="text"
              value={trackingInput}
              onChange={e => setTrackingInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Enter tracking number (e.g. TRK-2024-001)"
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

        {/* Quick chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ color: textFade, fontSize: typography.xs, fontWeight: typography.medium, letterSpacing: typography.wider, textTransform: "uppercase" }}>
            Recent:
          </span>
          {recentIds.map(id => {
            const demo = DEMO_SHIPMENTS[id]
            return (
              <QuickChip
                key={id}
                id={id}
                demoData={demo}
                active={trackingInput === id}
                onClick={() => { setTrackingInput(id); setSearchParams({ id }) }}
              />
            )
          })}
        </div>
      </div>

      {/* Results */}
      {showTracking ? (
        loadingShipment ? (
          <div className="rounded-2xl flex flex-col items-center justify-center py-24" style={{ background: surface, border: `1px solid ${border}` }}>
            <div className="w-10 h-10 border-2 rounded-full animate-spin mb-4" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: colors.accent }} />
            <p style={{ color: textSub, fontSize: typography.sm }}>Loading shipment…</p>
          </div>
        ) : shipmentError ? (
          <div className="rounded-2xl flex flex-col items-center justify-center py-24" style={{ background: surface, border: `1px solid ${border}` }}>
            <ExclamationTriangleIcon className="w-10 h-10 mb-4" style={{ color: colors.warning }} />
            <p style={{ color: textOn, fontWeight: 600, marginBottom: 6 }}>{shipmentError}</p>
            <p style={{ color: textSub, fontSize: typography.sm }}>Check the tracking number and try again</p>
          </div>
        ) : shipment ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* ── MAP — always renders first so Leaflet gets a real DOM node ── */}
            <div
              className="lg:col-span-2 rounded-2xl overflow-hidden flex flex-col order-first lg:order-last"
              style={{ background: surface, border: `1px solid ${border}`, height: mapHeight }}
            >
              {/* Map header */}
              <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: `1px solid ${border}`, height: 48 }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.sm }}>
                    Live Map
                  </div>
                  {/* Shipment state badge */}
                  <span
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{
                      background: STATUS_COLOR_MAP[shipment.statusColor]?.bg,
                      border: `1px solid ${STATUS_COLOR_MAP[shipment.statusColor]?.bdr}`,
                      color: STATUS_COLOR_MAP[shipment.statusColor]?.text,
                      fontSize: "10px", fontWeight: 700,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: STATUS_COLOR_MAP[shipment.statusColor]?.text }} />
                    {shipment.status}
                  </span>
                </div>
                <button
                  onClick={() => setMapExpanded(!mapExpanded)}
                  className="px-3 py-1 rounded-lg text-xs transition-all shrink-0"
                  style={{ background: "rgba(255,255,255,0.07)", color: textSub, border: `1px solid ${border}` }}
                  onMouseEnter={e => { e.currentTarget.style.background = surfaceMid; e.currentTarget.style.color = textOn }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = textSub }}
                >
                  {mapExpanded ? "Collapse" : "Expand"}
                </button>
              </div>

              {/* ── Map body ─────────────────────────────────────────────
                  KEY FIX: explicit pixel height on the wrapper so Leaflet
                  never gets height:0. We subtract the 48px header. ── */}
              <div style={{ flex: 1, minHeight: 0, height: typeof mapHeight === "number" ? mapHeight - 48 : `calc(${mapHeight} - 48px)`, position: "relative" }}>
                <ShipmentMap
                  key={`map-${shipment.id}-${mapExpanded}`}
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

            {/* ── Info panels ── */}
            <div className="lg:col-span-1 space-y-4 order-last lg:order-first">

              {/* Shipment header card */}
              <div className="rounded-2xl p-5" style={{ background: surface, border: `1px solid ${border}` }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div style={{ color: textOn, fontFamily: "monospace", fontSize: typography.lg, fontWeight: typography.bold, marginBottom: 6 }}>
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
                  {/* Transport icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: sc.bg, border: `1px solid ${sc.bdr}` }}>
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

                {/* km progress bar */}
                {(shipment.completedKm > 0 || shipment.remainingKm > 0) && (
                  <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${border}` }}>
                    <div className="flex justify-between mb-2">
                      <span style={{ color: colors.success, fontSize: "10px", fontWeight: 700 }}>{shipment.completedKm.toLocaleString("en-IN")} km done</span>
                      <span style={{ color: textFade,       fontSize: "10px", fontWeight: 600 }}>{shipment.remainingKm.toLocaleString("en-IN")} km left</span>
                    </div>
                    <div className="rounded-full overflow-hidden" style={{ height: 4, background: "rgba(255,255,255,0.08)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round((shipment.completedKm / (shipment.completedKm + shipment.remainingKm)) * 100)}%`,
                          background: `linear-gradient(90deg, ${colors.success}, ${colors.accent})`,
                          transition: "width 1s ease",
                        }}
                      />
                    </div>
                  </div>
                )}
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
                                : <span className="w-2 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                            }
                          </div>
                          {!isLast && (
                            <div className="w-px flex-1 my-1" style={{ background: isDone ? colors.success : "rgba(255,255,255,0.08)", minHeight: 20 }} />
                          )}
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
        ) : null
      ) : (
        /* Empty state */
        <div className="rounded-2xl flex flex-col items-center justify-center py-20 sm:py-28" style={{ background: surface, border: `1px solid ${border}` }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: surfaceMid, border: `1px solid ${border}` }}>
            <MagnifyingGlassIcon className="w-7 h-7" style={{ color: textFade }} />
          </div>
          <h3 style={{ color: textOn, fontSize: typography.lg, fontWeight: typography.semibold, marginBottom: 8 }}>
            Enter a tracking number
          </h3>
          <p style={{ color: textSub, fontSize: typography.sm, textAlign: "center", maxWidth: 320, padding: "0 1rem" }}>
            Search above or tap a recent shipment chip to view live tracking details
          </p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
//  Quick chip
// ─────────────────────────────────────────────────────────
const MODE_TAGS = { sea:"SEA", road:"ROAD", air:"AIR", rail:"RAIL" }
const MODE_COLORS = { sea:"#60A5FA", road:"#00B4D8", air:"#F59E0B", rail:"#22C55E" }

function QuickChip({ id, active, demoData, onClick }) {
  const [hovered, setHovered] = useState(false)
  const modeColor = demoData ? (MODE_COLORS[demoData.transportMode] || "#A78BFA") : null
  const modeTag   = demoData ? (MODE_TAGS[demoData.transportMode]   || "DEMO")    : null
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="px-3 py-1 rounded-full transition-all flex items-center gap-1.5"
      style={{
        background: active ? "rgba(255,255,255,0.15)" : hovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${active ? "rgba(255,255,255,0.3)" : hovered ? "rgba(255,255,255,0.2)" : border}`,
        color: active ? textOn : hovered ? textOn : "rgba(255,255,255,0.55)",
        fontSize: typography.xs,
        fontFamily: "monospace",
        fontWeight: typography.medium,
      }}
    >
      {modeColor && (
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: modeColor, display: "inline-block", flexShrink: 0 }} />
      )}
      {id}
      {modeTag && (
        <span style={{ fontSize: "9px", color: modeColor, fontFamily: "inherit", fontWeight: 700, letterSpacing: "0.04em" }}>{modeTag}</span>
      )}
    </button>
  )
}