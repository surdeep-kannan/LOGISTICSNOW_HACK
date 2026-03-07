import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlusIcon,
  SignalIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline"
import { colors, typography } from "../styles"
import cargoImg from "../assets/cargo.png"
import truckImg from "../assets/container-truck.png"
import clockImg from "../assets/clock.png"
import rupeeImg from "../assets/rupee-indian.png"

const surface = "#332B7A"
const surfaceMid = "#3D3585"
const border = "rgba(255,255,255,0.1)"
const textOn = "rgba(255,255,255,0.95)"
const textSub = "rgba(255,255,255,0.65)"

export default function Dashboard() {
  const navigate = useNavigate()

  const stats = [
    { name: "Active Shipments", value: "247", change: "+12.5%", trend: "up", img: cargoImg, color: colors.accent, bg: "rgba(0,180,216,0.12)", border: "rgba(0,180,216,0.2)" },
    { name: "In Transit", value: "189", change: "+8.2%", trend: "up", img: truckImg, color: "#A5B4FC", bg: "rgba(165,180,252,0.1)", border: "rgba(165,180,252,0.2)" },
    { name: "Avg. Transit Time", value: "6.2 days", change: "-0.8 days", trend: "up", img: clockImg, color: colors.warning, bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" },
    { name: "Monthly Spend", value: "₹3.52Cr", change: "-5.4%", trend: "down", img: rupeeImg, color: colors.success, bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)" },
  ]

  const shipments = [
    { id: "SHP-2024-001", origin: "Mumbai, MH", destination: "Chennai, TN", status: "In Transit", statusColor: "cyan", eta: "Mar 8, 2026", carrier: "VRL Logistics", Icon: SignalIcon },
    { id: "SHP-2024-002", origin: "Delhi, DL", destination: "Bangalore, KA", status: "Customs", statusColor: "amber", eta: "Mar 5, 2026", carrier: "TCI Freight", Icon: ExclamationTriangleIcon },
    { id: "SHP-2024-003", origin: "Pune, MH", destination: "Kolkata, WB", status: "Delivered", statusColor: "green", eta: "Mar 4, 2026", carrier: "Blue Dart Cargo", Icon: CheckCircleIcon },
    { id: "SHP-2024-004", origin: "Ahmedabad, GJ", destination: "Hyderabad, TS", status: "In Transit", statusColor: "cyan", eta: "Mar 10, 2026", carrier: "Gati KWE", Icon: SignalIcon },
  ]

  const alerts = [
    { Icon: ExclamationTriangleIcon, color: colors.warning, message: "Port congestion in Los Angeles — 2–3 day delays expected", time: "2 hours ago" },
    { Icon: InformationCircleIcon, color: colors.accent, message: "Alternative route via Singapore available — save 12% on SHP-2024-005", time: "4 hours ago" },
    { Icon: CheckCircleIcon, color: colors.success, message: "Shipment SHP-2024-003 delivered ahead of schedule", time: "6 hours ago" },
  ]

  const statusStyle = {
    cyan: { bg: "rgba(0,180,216,0.12)", color: colors.accent, border: "rgba(0,180,216,0.25)" },
    amber: { bg: "rgba(245,158,11,0.12)", color: colors.warning, border: "rgba(245,158,11,0.25)" },
    green: { bg: "rgba(34,197,94,0.12)", color: colors.success, border: "rgba(34,197,94,0.25)" },
  }

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 style={{ color: textOn, fontSize: typography["3xl"], fontWeight: typography.bold, letterSpacing: typography.tight, marginBottom: 6 }}>
            Dashboard Overview
          </h1>
          <p style={{ color: textSub, fontSize: typography.base, lineHeight: typography.normal_line }}>
            Monitor your freight operations in real-time
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/dashboard/create")}
          className="hidden sm:flex items-center gap-2 px-5 py-3 rounded-xl transition-all"
          style={{ background: colors.gradientAccent, color: colors.textWhite, fontWeight: typography.semibold, fontSize: typography.sm }}
        >
          <PlusIcon className="w-4 h-4" strokeWidth={2.5} />
          New Shipment
        </motion.button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat, i) => {
          const TrendIcon = stat.trend === "up" ? ArrowTrendingUpIcon : ArrowTrendingDownIcon
          const trendColor = stat.trend === "up" ? colors.success : colors.error
          
          // SIGNIFICANTLY BIGGER icons for these two
          const isLargeIcon = stat.name === "Active Shipments" || stat.name === "In Transit"
          
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl p-6 overflow-hidden relative"
              style={{ background: surface, border: `1px solid ${border}` }}
            >
              <div className="flex items-start justify-between mb-5">
                <div
                  className="rounded-2xl flex items-center justify-center transition-all"
                  style={{ 
                    // Container: 72px for large, 48px for standard
                    width: isLargeIcon ? 72 : 48, 
                    height: isLargeIcon ? 72 : 48, 
                    background: stat.bg, 
                    border: `1px solid ${stat.border}` 
                  }}
                >
                  <motion.img 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    src={stat.img} 
                    alt={stat.name} 
                    style={{ 
                      // Icon: 48px for large, 28px for standard
                      width: isLargeIcon ? 48 : 28, 
                      height: isLargeIcon ? 48 : 28, 
                      objectFit: "contain" 
                    }} 
                  />
                </div>
                <span
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                  style={{ color: trendColor, background: `${trendColor}15`, fontSize: typography.sm, fontWeight: typography.medium }}
                >
                  <TrendIcon className="w-3.5 h-3.5" strokeWidth={2} />
                  {stat.change}
                </span>
              </div>
              <h3 style={{ color: textOn, fontSize: typography["3xl"], fontWeight: typography.bold, letterSpacing: typography.tight, marginBottom: 6, lineHeight: 1 }}>
                {stat.value}
              </h3>
              <p style={{ color: textSub, fontSize: typography.sm, fontWeight: typography.medium }}>
                {stat.name}
              </p>
            </motion.div>
          )
        })}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Shipments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          className="xl:col-span-2 rounded-2xl overflow-hidden"
          style={{ background: surface, border: `1px solid ${border}` }}
        >
          <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${border}` }}>
            <div>
              <h2 style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.lg }}>Recent Shipments</h2>
              <p style={{ color: textSub, fontSize: typography.sm, marginTop: 3 }}>{shipments.length} active records</p>
            </div>
            <button
              onClick={() => navigate("/dashboard/orders")}
              className="flex items-center gap-1.5"
              style={{ color: colors.accent, fontSize: typography.sm, fontWeight: typography.medium }}
            >
              View all <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {["Shipment ID", "Route", "Status", "ETA", "Carrier"].map((h) => (
                    <th key={h} className="px-6 py-4 text-left" style={{ color: textSub, fontSize: typography.sm, fontWeight: typography.semibold, letterSpacing: typography.wider, textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => {
                  const ss = statusStyle[s.statusColor]
                  return (
                    <tr
                      key={s.id}
                      onClick={() => navigate(`/dashboard/track?id=${s.id}`)}
                      className="cursor-pointer transition-all"
                      style={{ borderBottom: `1px solid ${border}` }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = surfaceMid)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-6 py-4" style={{ color: colors.accent, fontSize: typography.base, fontWeight: typography.semibold, fontFamily: "monospace" }}>
                        {s.id}
                      </td>
                      <td className="px-6 py-4">
                        <div style={{ color: textOn, fontSize: typography.sm, fontWeight: typography.medium }}>{s.origin}</div>
                        <div style={{ color: textSub, fontSize: typography.sm, marginTop: 2 }}>→ {s.destination}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, fontSize: typography.sm, fontWeight: typography.medium }}>
                          <s.Icon className="w-3.5 h-3.5" />
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4" style={{ color: textSub, fontSize: typography.sm }}>{s.eta}</td>
                      <td className="px-6 py-4" style={{ color: textSub, fontSize: typography.sm }}>{s.carrier}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: surface, border: `1px solid ${border}` }}
        >
          <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${border}` }}>
            <div>
              <h2 style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.lg }}>Alerts</h2>
              <p style={{ color: textSub, fontSize: typography.sm, marginTop: 3 }}>{alerts.length} new notifications</p>
            </div>
            <span className="w-6 h-6 rounded-full flex items-center justify-center font-bold" style={{ background: colors.error, color: colors.textWhite, fontSize: typography.xs }}>
              {alerts.length}
            </span>
          </div>

          <div className="p-5 space-y-4">
            {alerts.map((alert, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="p-4 rounded-xl" style={{ background: surfaceMid, border: `1px solid ${border}` }}>
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${alert.color}15` }}>
                    <alert.Icon className="w-5 h-5" style={{ color: alert.color }} />
                  </div>
                  <div>
                    <p style={{ color: textOn, fontSize: typography.sm, lineHeight: typography.relaxed, fontWeight: typography.medium }}>{alert.message}</p>
                    <p style={{ color: textSub, fontSize: typography.xs, marginTop: 5, letterSpacing: typography.wide }}>{alert.time}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}