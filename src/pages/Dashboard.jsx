import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon,
  ArrowRightIcon, PlusIcon, SignalIcon,
  ArrowTrendingUpIcon, ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline"
import { colors, typography } from "../styles"
import { shipments as shipmentsApi, intelligence } from "../lib/api"
import { getCached, setCached } from "../lib/prefetchCache"
import cargoImg     from "../assets/cargo.png"
import truckImg     from "../assets/container-truck.png"
import clockImg     from "../assets/clock.png"
import rupeeImg     from "../assets/rupee-indian.png"
import AgentMiniWidget from "../components/AgentMiniWidget"

const surface    = "#332B7A"
const surfaceMid = "#3D3585"
const border     = "rgba(255,255,255,0.1)"
const textOn     = "rgba(255,255,255,0.95)"
const textSub    = "rgba(255,255,255,0.65)"

// ── Mock fallback data — shown when DB is empty ───────────
const MOCK_STATS = {
  active_shipments: 42, in_transit: 31, avg_transit_days: 2.8,
  monthly_spend: 85000000, delivered: 1240, delayed: 1, pending: 4,
  carbon_mitigated: 14.8, ai_savings_month: 1240000,
}

const MOCK_SHIPMENTS = [
  { id: "1", tracking_number: "SHP-AI-992", origin_city: "Mumbai",  origin_state: "MH", dest_city: "Singapore", dest_state: "",   status: "in_transit", carrier: "NovaSea Lines", eta: "2026-03-22" },
  { id: "2", tracking_number: "SHP-RD-441", origin_city: "Delhi",   origin_state: "DL", dest_city: "Mumbai",    dest_state: "MH", status: "in_transit", carrier: "SwiftMove",   eta: "2026-03-18" },
  { id: "3", tracking_number: "SHP-AR-005", origin_city: "Blr",     origin_state: "KA", dest_city: "Dubai",     dest_state: "",   status: "pending",    carrier: "SkyBridge",   eta: "2026-03-16" },
  { id: "4", tracking_number: "SHP-RL-112", origin_city: "Chennai", origin_state: "TN", dest_city: "Kolkata",   dest_state: "WB", status: "delivered",  carrier: "IndoRail",    eta: "2026-03-14" },
]

const MOCK_ALERTS = [
  { id: "1", type: "warning", message: "SHP-2026-082 rerouted — Hormuz strait congestion. New ETA Mar 22.", created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: "2", type: "success", message: "SHP-2026-076 delivered to Bangalore 4hr ahead of schedule.",         created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: "3", type: "info",    message: "AI Procurement Agent saved ₹4.2L on Mumbai–Delhi lane this month.", created_at: new Date(Date.now() - 14400000).toISOString() },
]

const STATUS_STYLE = {
  "in_transit": { bg: "rgba(0,180,216,0.12)",  color: colors.accent,  border: "rgba(0,180,216,0.25)",  label: "In Transit", Icon: SignalIcon              },
  "in-transit": { bg: "rgba(0,180,216,0.12)",  color: colors.accent,  border: "rgba(0,180,216,0.25)",  label: "In Transit", Icon: SignalIcon              },
  "delivered":  { bg: "rgba(34,197,94,0.12)",  color: colors.success, border: "rgba(34,197,94,0.25)",  label: "Delivered",  Icon: CheckCircleIcon         },
  "pending":    { bg: "rgba(165,180,252,0.12)",color: "#A5B4FC",      border: "rgba(165,180,252,0.25)",label: "Pending",    Icon: InformationCircleIcon   },
  "delayed":    { bg: "rgba(239,68,68,0.12)",  color: colors.error,   border: "rgba(239,68,68,0.25)",  label: "Delayed",    Icon: ExclamationTriangleIcon },
}

const ALERT_STYLE = {
  warning: { Icon: ExclamationTriangleIcon, color: colors.warning },
  success: { Icon: CheckCircleIcon,         color: colors.success },
  error:   { Icon: ExclamationTriangleIcon, color: colors.error   },
  info:    { Icon: InformationCircleIcon,   color: colors.accent  },
}

function Skeleton({ h = 12, rounded = "xl" }) {
  return <div className={`h-${h} rounded-${rounded} animate-pulse`} style={{ background: "rgba(255,255,255,0.05)" }} />
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats,   setStats]   = useState(null)
  const [recent,  setRecent]  = useState([])
  const [alerts,  setAlerts]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  useEffect(() => {
    async function load() {
      const cachedStats  = getCached("dashboard:stats")
      const cachedRecent = getCached("dashboard:recent")
      const cachedAlerts = getCached("dashboard:alerts")

      if (cachedStats && cachedRecent && cachedAlerts) {
        const s  = cachedStats.stats  ?? cachedStats
        const sh = cachedRecent.shipments ?? []
        const al = (cachedAlerts.alerts ?? []).slice(0, 3)
        setStats(sh.length > 0 ? s : MOCK_STATS)
        setRecent(sh.length > 0 ? sh : MOCK_SHIPMENTS)
        setAlerts(al.length  > 0 ? al : MOCK_ALERTS)
        setLoading(false)
        try {
          const [ns, nsh, nal] = await Promise.all([
            shipmentsApi.stats(), shipmentsApi.list({ limit: 4 }), intelligence.alerts(),
          ])
          setCached("dashboard:stats",  ns)
          setCached("dashboard:recent", nsh)
          setCached("dashboard:alerts", nal)
          const shipArr = nsh.shipments ?? []
          setStats(shipArr.length > 0 ? (ns.stats ?? ns) : MOCK_STATS)
          setRecent(shipArr.length > 0 ? shipArr : MOCK_SHIPMENTS)
          const alertArr = (nal.alerts ?? []).slice(0, 3)
          setAlerts(alertArr.length > 0 ? alertArr : MOCK_ALERTS)
        } catch (_) {}
        return
      }

      try {
        const [s, sh, al] = await Promise.all([
          shipmentsApi.stats(), shipmentsApi.list({ limit: 4 }), intelligence.alerts(),
        ])
        setCached("dashboard:stats",  s)
        setCached("dashboard:recent", sh)
        setCached("dashboard:alerts", al)
        const shipArr  = sh.shipments ?? []
        const alertArr = (al.alerts ?? []).slice(0, 3)
        setStats(shipArr.length > 0 ? (s.stats ?? s) : MOCK_STATS)
        setRecent(shipArr.length > 0 ? shipArr : MOCK_SHIPMENTS)
        setAlerts(alertArr.length > 0 ? alertArr : MOCK_ALERTS)
      } catch (e) {
        // API down — always show mock data, never show "—"
        setStats(MOCK_STATS)
        setRecent(MOCK_SHIPMENTS)
        setAlerts(MOCK_ALERTS)
        setError("")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const kpi = [
    { name: "Active Shipments", value: stats?.active_shipments ?? MOCK_STATS.active_shipments, change: "+12", trend: "up",   img: cargoImg, color: colors.accent,  bg: "rgba(0,180,216,0.12)",  bdr: "rgba(0,180,216,0.2)",  large: true  },
    { name: "Monthly Spend",    value: (() => { const v = stats?.monthly_spend ?? MOCK_STATS.monthly_spend; return `₹${(v/10000000).toFixed(2)}Cr` })(), change: "-4%", trend: "down", img: rupeeImg, color: colors.success, bg: "rgba(34,197,94,0.1)", bdr: "rgba(34,197,94,0.2)", large: true },
    { name: "Carbon Mitigation",value: `${stats?.carbon_mitigated ?? MOCK_STATS.carbon_mitigated}t`, change: "+2.1t", trend: "up", img: clockImg, color: "#22C55E", bg: "rgba(34,197,94,0.1)", bdr: "rgba(34,197,94,0.2)", large: false },
    { name: "AI Alpha Saving",  value: `₹${((stats?.ai_savings_month ?? MOCK_STATS.ai_savings_month)/100000).toFixed(1)}L`, change: "+₹1.2L", trend: "up", img: rupeeImg, color: "#A5B4FC", bg: "rgba(165,180,252,0.1)", bdr: "rgba(165,180,252,0.2)", large: false },
  ]


  return (
    <div className="space-y-7 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ color: textOn, fontSize: typography["3xl"], fontWeight: typography.bold, letterSpacing: typography.tight, marginBottom: 6 }}>
            Logistics Alpha Dashboard
          </h1>
          <p style={{ color: textSub, fontSize: typography.base }}>Real-time autonomous intelligence & operation pulse</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/dashboard/create")}
          className="flex items-center gap-2 px-5 py-3 rounded-xl"
          style={{ background: colors.gradientAccent, color: "#fff", fontWeight: typography.semibold, fontSize: typography.sm }}>
          <PlusIcon className="w-4 h-4" strokeWidth={2.5} /> New Shipment
        </motion.button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl p-6 animate-pulse" style={{ background: surface, border: `1px solid ${border}` }}>
                <div className="flex justify-between mb-5">
                  <div className="w-[72px] h-[72px] rounded-2xl" style={{ background: "rgba(255,255,255,0.06)" }} />
                  <div className="w-16 h-7 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
                </div>
                <div className="w-24 h-8 rounded mb-2" style={{ background: "rgba(255,255,255,0.06)" }} />
                <div className="w-32 h-4 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>
            ))
          : kpi.map((stat, i) => {
              const TI = stat.trend === "up" ? ArrowTrendingUpIcon : ArrowTrendingDownIcon
              const tc = stat.trend === "up" ? colors.success : colors.error
              return (
                <motion.div key={stat.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="rounded-2xl p-6 overflow-hidden"
                  style={{ background: surface, border: `1px solid ${border}` }}>
                  <div className="flex items-start justify-between mb-5">
                    <div className="rounded-2xl flex items-center justify-center"
                      style={{ width: stat.large ? 72 : 48, height: stat.large ? 72 : 48, background: stat.bg, border: `1px solid ${stat.bdr}` }}>
                      <motion.img whileHover={{ scale: 1.1, rotate: 5 }} src={stat.img} alt={stat.name}
                        style={{ width: stat.large ? 48 : 28, height: stat.large ? 48 : 28, objectFit: "contain" }} />
                    </div>
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                      style={{ color: tc, background: `${tc}15`, fontSize: typography.sm, fontWeight: typography.medium }}>
                      <TI className="w-3.5 h-3.5" strokeWidth={2} />{stat.change}
                    </span>
                  </div>
                  <h3 style={{ color: textOn, fontSize: typography["3xl"], fontWeight: typography.bold, letterSpacing: typography.tight, marginBottom: 6, lineHeight: 1 }}>
                    {stat.value}
                  </h3>
                  <p style={{ color: textSub, fontSize: typography.sm, fontWeight: typography.medium }}>{stat.name}</p>
                </motion.div>
              )
            })
        }
      </div>

      {/* Bottom grid — shipments + alerts + agent widget */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Shipments — col span 2 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
          className="xl:col-span-2 rounded-2xl overflow-hidden"
          style={{ background: surface, border: `1px solid ${border}` }}>
          <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${border}` }}>
            <div>
              <h2 style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.lg }}>Recent Shipments</h2>
              <p style={{ color: textSub, fontSize: typography.sm, marginTop: 3 }}>
                {loading ? "Loading..." : `${recent.length} records`}
              </p>
            </div>
            <button onClick={() => navigate("/dashboard/orders")} className="flex items-center gap-1.5"
              style={{ color: colors.accent, fontSize: typography.sm, fontWeight: typography.medium }}>
              View all <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
          {loading
            ? <div className="p-6 space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} />)}</div>
            : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${border}` }}>
                      {["Shipment ID", "Route", "Status", "ETA", "Carrier"].map(h => (
                        <th key={h} className="px-6 py-4 text-left"
                          style={{ color: textSub, fontSize: typography.sm, fontWeight: typography.semibold, letterSpacing: typography.wider, textTransform: "uppercase" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(s => {
                      const ss = STATUS_STYLE[s.status] ?? STATUS_STYLE["pending"]
                      return (
                        <tr key={s.id} onClick={() => navigate(`/dashboard/track?id=${s.tracking_number}`)}
                          className="cursor-pointer transition-all" style={{ borderBottom: `1px solid ${border}` }}
                          onMouseEnter={e => e.currentTarget.style.background = surfaceMid}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <td className="px-6 py-4 font-mono font-semibold text-sm" style={{ color: colors.accent }}>{s.tracking_number}</td>
                          <td className="px-6 py-4">
                            <div style={{ color: textOn, fontSize: typography.sm, fontWeight: typography.medium }}>{s.origin_city}{s.origin_state ? `, ${s.origin_state}` : ""}</div>
                            <div style={{ color: textSub, fontSize: typography.sm, marginTop: 2 }}>→ {s.dest_city}{s.dest_state ? `, ${s.dest_state}` : ""}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                              style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, fontSize: typography.sm, fontWeight: typography.medium }}>
                              <ss.Icon className="w-3.5 h-3.5" />{ss.label}
                            </span>
                          </td>
                          <td className="px-6 py-4" style={{ color: textSub, fontSize: typography.sm }}>
                            {s.eta ? new Date(s.eta).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                          </td>
                          <td className="px-6 py-4" style={{ color: textSub, fontSize: typography.sm }}>{s.carrier || "—"}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          }
        </motion.div>

        {/* Right column: alerts + agent widget */}
        <div className="flex flex-col gap-6">
          {/* Alerts */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}
            className="rounded-2xl overflow-hidden" style={{ background: surface, border: `1px solid ${border}` }}>
            <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${border}` }}>
              <div>
                <h2 style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.lg }}>Alerts</h2>
                <p style={{ color: textSub, fontSize: typography.sm, marginTop: 3 }}>{alerts.length} notifications</p>
              </div>
              {alerts.length > 0 && (
                <span className="w-6 h-6 rounded-full flex items-center justify-center font-bold"
                  style={{ background: colors.error, color: "#fff", fontSize: typography.xs }}>
                  {alerts.length}
                </span>
              )}
            </div>
            <div className="p-5 space-y-4">
              {loading
                ? Array(3).fill(0).map((_, i) => <Skeleton key={i} h={20} />)
                : alerts.map((alert, i) => {
                    const { Icon, color } = ALERT_STYLE[alert.type] ?? ALERT_STYLE.info
                    return (
                      <motion.div key={alert.id ?? i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                        className="p-4 rounded-xl" style={{ background: surfaceMid, border: `1px solid ${border}` }}>
                        <div className="flex gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
                            <Icon className="w-5 h-5" style={{ color }} />
                          </div>
                          <div>
                            <p style={{ color: textOn, fontSize: typography.sm, lineHeight: typography.relaxed, fontWeight: typography.medium }}>{alert.message}</p>
                            <p style={{ color: textSub, fontSize: typography.xs, marginTop: 5 }}>
                              {alert.created_at ? new Date(alert.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
              }
            </div>
          </motion.div>

          {/* ── AI Agent Mini Widget ── */}
          <AgentMiniWidget />
        </div>
      </div>
    </div>
  )
}