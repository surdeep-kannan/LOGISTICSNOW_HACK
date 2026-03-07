import { useState } from "react"
import { motion } from "framer-motion"
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  TruckIcon,
  ClockIcon,
  ExclamationCircleIcon,
  MapPinIcon,
  ChevronUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CubeIcon,
} from "@heroicons/react/24/outline"
import { colors, typography } from "../styles"

// PNG assets
import cargoImg from "../assets/cargo.png"           // Total Orders
import truckImg from "../assets/container-truck.png" // In Transit
import pendingImg from "../assets/clock.png"        // Pending
import deliveredImg from "../assets/delivered.png"  // Delivered (New)
import delayedImg from "../assets/file.png"        // Delayed (New)

const surface    = "#332B7A"
const surfaceMid = "#3D3585"
const border     = "rgba(255,255,255,0.1)"
const textOn     = "rgba(255,255,255,0.95)"
const textSub    = "rgba(255,255,255,0.65)"
const textFade   = "rgba(255,255,255,0.35)"
const inputBg    = "rgba(255,255,255,0.06)"

// Table Status Icons (Heroicons)
const STATUS = {
  delivered:  { label: "Delivered",  color: colors.success, Icon: CheckCircleIcon  },
  "in-transit":{ label: "In Transit", color: colors.accent,  Icon: TruckIcon        },
  pending:    { label: "Pending",     color: colors.warning, Icon: CubeIcon         }, 
  delayed:    { label: "Delayed",     color: colors.error,   Icon: ExclamationCircleIcon },
}

export default function OrderHistory() {
  const [search, setSearch]         = useState("")
  const [filterStatus, setFilter]   = useState("all")
  const [sortField, setSortField]   = useState("id")
  const [sortDir, setSortDir]       = useState("asc")
  const [page, setPage]             = useState(1)
  const [focusedSearch, setFocused] = useState(false)

  const statsCount = {
    total:      ORDERS.length,
    delivered:  ORDERS.filter(o => o.status === "delivered").length,
    inTransit:  ORDERS.filter(o => o.status === "in-transit").length,
    pending:    ORDERS.filter(o => o.status === "pending").length,
    delayed:    ORDERS.filter(o => o.status === "delayed").length,
  }

  // Header Stat Cards with specific PNGs and scaled sizes
  const statCards = [
    { label: "Total Orders", value: statsCount.total,     color: colors.accent,   img: cargoImg,     bg: "rgba(0,180,216,0.12)", border: "rgba(0,180,216,0.2)"   },
    { label: "Delivered",    value: statsCount.delivered,  color: colors.success,  img: deliveredImg, bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.2)"   },
    { label: "In Transit",   value: statsCount.inTransit,  color: "#A5B4FC",       img: truckImg,     bg: "rgba(165,180,252,0.1)", border: "rgba(165,180,252,0.2)" },
    { label: "Pending",      value: statsCount.pending,    color: colors.warning,  img: pendingImg,   bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)"  },
    { label: "Delayed",      value: statsCount.delayed,    color: colors.error,    img: delayedImg,   bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.2)"   },
  ]

  const PAGE_SIZE = 6
  const filtered = ORDERS
    .filter(o => {
      const q = search.toLowerCase()
      const matchSearch = !q || o.id.toLowerCase().includes(q) ||
        o.container.toLowerCase().includes(q) || o.cargo.toLowerCase().includes(q) ||
        o.origin.toLowerCase().includes(q) || o.destination.toLowerCase().includes(q)
      const matchFilter = filterStatus === "all" || o.status === filterStatus
      return matchSearch && matchFilter
    })
    .sort((a, b) => {
      let va = a[sortField], vb = b[sortField]
      if (sortField === "value") { va = Number(va); vb = Number(vb) }
      if (va < vb) return sortDir === "asc" ? -1 : 1
      if (va > vb) return sortDir === "asc" ? 1 : -1
      return 0
    })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortField(field); setSortDir("asc") }
  }

  const handleExport = () => {
    const csv = [
      ["Order ID", "Container", "Status", "Origin", "Destination", "Cargo", "Weight", "Value", "Carrier", "Shipped", "ETA"].join(","),
      ...filtered.map(o => [o.id, o.container, o.status, o.origin, o.destination, o.cargo, o.weight, o.value, o.carrier, o.shipped, o.eta].join(","))
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a"); a.href = url; a.download = "orders.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  const SortBtn = ({ field, children }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 group"
      style={{ color: sortField === field ? textOn : textSub }}
    >
      {children}
      <ChevronUpDownIcon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
    </button>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 style={{ color: textOn, fontSize: typography["3xl"], fontWeight: typography.bold, letterSpacing: typography.tight, marginBottom: 6 }}>
            Order History
          </h1>
          <p style={{ color: textSub, fontSize: typography.base }}>
            Track and manage all your shipment orders
          </p>
        </div>
        <button
          onClick={handleExport}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
          style={{ background: surfaceMid, border: `1px solid ${border}`, color: textSub, fontSize: typography.sm }}
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stat cards - BIGGER PNG Icons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{ background: surface, border: `1px solid ${border}` }}
          >
            <div className="flex items-start justify-between mb-5">
              <div
                className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center transition-transform"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}
              >
                <motion.img 
                  whileHover={{ scale: 1.15, rotate: 3 }}
                  src={s.img} 
                  alt={s.label} 
                  style={{ width: 48, height: 48, objectFit: "contain" }} 
                />
              </div>
            </div>
            <div>
              <div style={{ color: textSub, fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                {s.label}
              </div>
              <div style={{ color: textOn, fontSize: typography["3xl"], fontWeight: typography.bold, lineHeight: 1 }}>
                {s.value}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl p-4 sm:p-5" style={{ background: surface, border: `1px solid ${border}` }}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative min-w-0">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: textFade }} />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                width: "100%",
                background: inputBg,
                border: `1.5px solid ${focusedSearch ? "rgba(255,255,255,0.4)" : border}`,
                borderRadius: "0.75rem",
                padding: "0.65rem 1rem 0.65rem 2.75rem",
                color: textOn,
                fontSize: typography.sm,
                outline: "none",
              }}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <FunnelIcon className="w-4 h-4 shrink-0" style={{ color: textFade }} />
            <select
              value={filterStatus}
              onChange={e => { setFilter(e.target.value); setPage(1) }}
              style={{
                background: inputBg,
                border: `1.5px solid ${border}`,
                borderRadius: "0.75rem",
                padding: "0.65rem 1rem",
                color: textOn,
                fontSize: typography.sm,
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="all">All Status</option>
              <option value="delivered">Delivered</option>
              <option value="in-transit">In Transit</option>
              <option value="pending">Pending</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: surface, border: `1px solid ${border}` }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${border}` }}>
                <th className="pl-6 pr-4 py-4 text-left" style={{ color: textSub, fontSize: typography.xs, fontWeight: typography.semibold, textTransform: "uppercase" }}>
                   <SortBtn field="id">Order ID</SortBtn>
                </th>
                <th className="px-4 py-4 text-left" style={{ color: textSub, fontSize: typography.xs, fontWeight: typography.semibold, textTransform: "uppercase" }}>Route</th>
                <th className="px-4 py-4 text-left" style={{ color: textSub, fontSize: typography.xs, fontWeight: typography.semibold, textTransform: "uppercase" }}>Cargo</th>
                <th className="px-4 py-4 text-left" style={{ color: textSub, fontSize: typography.xs, fontWeight: typography.semibold, textTransform: "uppercase" }}>
                   <SortBtn field="value">Value</SortBtn>
                </th>
                <th className="px-4 py-4 text-left" style={{ color: textSub, fontSize: typography.xs, fontWeight: typography.semibold, textTransform: "uppercase" }}>Timeline</th>
                <th className="px-4 pr-6 py-4 text-left" style={{ color: textSub, fontSize: typography.xs, fontWeight: typography.semibold, textTransform: "uppercase" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((o, i) => {
                const s = STATUS[o.status]
                return (
                  <tr
                    key={o.id}
                    style={{ borderBottom: `1px solid ${border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = surfaceMid}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td className="pl-6 pr-4 py-4 font-mono font-bold text-sm" style={{ color: colors.accent }}>{o.id}</td>
                    <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm" style={{ color: textOn }}>{o.origin}</span>
                            <span className="text-xs" style={{ color: textSub }}>→ {o.destination}</span>
                        </div>
                    </td>
                    <td className="px-4 py-4">
                        <div className="text-sm font-medium" style={{ color: textOn }}>{o.cargo}</div>
                        <div className="text-xs" style={{ color: textFade }}>{o.weight}</div>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold" style={{ color: textOn }}>₹{o.value.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-4 text-xs" style={{ color: textSub }}>
                        ETA: {new Date(o.eta).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 pr-6 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap"
                        style={{
                          background: `${s.color}15`,
                          border: `1px solid ${s.color}35`,
                          color: s.color,
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        <s.Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                        {s.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

const ORDERS = [
  { id: "LR-2024-001", container: "TCLU3456789", status: "delivered",  origin: "Mumbai, MH",    destination: "Chennai, TN",      shipped: "2024-02-15", delivered: "2024-02-18", eta: "2024-02-18", cargo: "Electronic Components",   weight: "8,400 kg",  value: 18500000, carrier: "VRL Logistics",    progress: 100 },
  { id: "LR-2024-002", container: "MSCU7891234", status: "in-transit", origin: "Delhi, DL",     destination: "Bangalore, KA",    shipped: "2024-03-01", delivered: "",           eta: "2024-03-05", cargo: "Automobile Parts",        weight: "12,500 kg", value: 24750000, carrier: "TCI Freight",      progress: 65  },
  { id: "LR-2024-003", container: "PONU2345678", status: "in-transit", origin: "Pune, MH",      destination: "Kolkata, WB",      shipped: "2024-03-02", delivered: "",           eta: "2024-03-07", cargo: "Textile Materials",        weight: "6,800 kg",  value: 8925000,  carrier: "Blue Dart Cargo",  progress: 45  },
  { id: "LR-2024-004", container: "CMAU5678901", status: "pending",    origin: "Ahmedabad, GJ", destination: "Hyderabad, TS",    shipped: "2024-03-04", delivered: "",           eta: "2024-03-08", cargo: "Pharmaceutical Products",  weight: "3,200 kg",  value: 16500000, carrier: "Gati KWE",         progress: 15  },
  { id: "LR-2024-005", container: "HLBU9012345", status: "delivered",  origin: "Jaipur, RJ",    destination: "Mumbai, MH",       shipped: "2024-02-20", delivered: "2024-02-23", eta: "2024-02-23", cargo: "Handicraft Items",         weight: "4,500 kg",  value: 5625000,  carrier: "Agarwal Packers",  progress: 100 },
  { id: "LR-2024-006", container: "TEMU6789012", status: "delayed",    origin: "Surat, GJ",     destination: "Delhi, DL",        shipped: "2024-02-28", delivered: "",           eta: "2024-03-03", cargo: "Diamond Jewelry",          weight: "1,200 kg",  value: 45000000, carrier: "VRL Logistics",    progress: 70  },
  { id: "LR-2024-007", container: "OOLU3456789", status: "delivered",  origin: "Chennai, TN",   destination: "Pune, MH",         shipped: "2024-02-12", delivered: "2024-02-15", eta: "2024-02-15", cargo: "Leather Products",         weight: "5,600 kg",  value: 7425000,  carrier: "TCI Freight",      progress: 100 },
  { id: "LR-2024-008", container: "MAEU8901234", status: "in-transit", origin: "Bangalore, KA", destination: "Ahmedabad, GJ",   shipped: "2024-03-03", delivered: "",           eta: "2024-03-06", cargo: "IT Equipment",             weight: "9,800 kg",  value: 32625000, carrier: "Blue Dart Cargo",  progress: 55  },
  { id: "LR-2024-009", container: "NYKU1234567", status: "delivered",  origin: "Hyderabad, TS", destination: "Chennai, TN",     shipped: "2024-02-08", delivered: "2024-02-11", eta: "2024-02-11", cargo: "Chemical Products",        weight: "7,200 kg",  value: 11250000, carrier: "Gati KWE",         progress: 100 },
  { id: "LR-2024-010", container: "SUDU4567890", status: "delayed",    origin: "Kolkata, WB",   destination: "Jaipur, RJ",      shipped: "2024-03-01", delivered: "",           eta: "2024-03-06", cargo: "Steel Coils",              weight: "22,000 kg", value: 9800000,  carrier: "VRL Logistics",    progress: 40  },
]

function PaginationBtn({ children, active, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm"
      style={{
        background: active ? colors.gradientAccent : "rgba(255,255,255,0.06)",
        border: `1px solid ${active ? "transparent" : border}`,
        color: active ? "#fff" : disabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.65)",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: active ? 700 : 400,
      }}
    >
      {children}
    </button>
  )
}