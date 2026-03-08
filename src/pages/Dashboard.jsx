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
import cargoImg from "../assets/cargo.png"
import truckImg from "../assets/container-truck.png"
import clockImg from "../assets/clock.png"
import rupeeImg from "../assets/rupee-indian.png"

const surface    = "#332B7A"
const surfaceMid = "#3D3585"
const border     = "rgba(255,255,255,0.1)"
const textOn     = "rgba(255,255,255,0.95)"
const textSub    = "rgba(255,255,255,0.65)"

const STATUS_STYLE = {
  "in-transit": { bg: "rgba(0,180,216,0.12)",  color: colors.accent,  border: "rgba(0,180,216,0.25)",  label: "In Transit", Icon: SignalIcon              },
  "customs":    { bg: "rgba(245,158,11,0.12)",  color: colors.warning, border: "rgba(245,158,11,0.25)", label: "Customs",    Icon: ExclamationTriangleIcon },
  "delivered":  { bg: "rgba(34,197,94,0.12)",   color: colors.success, border: "rgba(34,197,94,0.25)",  label: "Delivered",  Icon: CheckCircleIcon         },
  "pending":    { bg: "rgba(165,180,252,0.12)", color: "#A5B4FC",      border: "rgba(165,180,252,0.25)",label: "Pending",    Icon: InformationCircleIcon   },
  "delayed":    { bg: "rgba(239,68,68,0.12)",   color: colors.error,   border: "rgba(239,68,68,0.25)",  label: "Delayed",    Icon: ExclamationTriangleIcon },
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
      // Cache-first: if LoadingScreen prefetched this, apply instantly
      const cachedStats  = getCached("dashboard:stats")
      const cachedRecent = getCached("dashboard:recent")
      const cachedAlerts = getCached("dashboard:alerts")

      if (cachedStats && cachedRecent && cachedAlerts) {
        setStats(cachedStats.stats ?? cachedStats)
        setRecent(cachedRecent.shipments ?? [])
        setAlerts((cachedAlerts.alerts ?? []).slice(0, 3))
        setLoading(false)
        // Silent background revalidation
        try {
          const [s, sh, al] = await Promise.all([
            shipmentsApi.stats(),
            shipmentsApi.list({ limit: 4 }),
            intelligence.alerts(),
          ])
          setCached("dashboard:stats", s)
          setCached("dashboard:recent", sh)
          setCached("dashboard:alerts", al)
          setStats(s.stats ?? s)
          setRecent(sh.shipments ?? [])
          setAlerts((al.alerts ?? []).slice(0, 3))
        } catch (_) {}
        return
      }

      // No cache — normal fetch
      try {
        const [s, sh, al] = await Promise.all([
          shipmentsApi.stats(),
          shipmentsApi.list({ limit: 4 }),
          intelligence.alerts(),
        ])
        setCached("dashboard:stats", s)
        setCached("dashboard:recent", sh)
        setCached("dashboard:alerts", al)
        setStats(s.stats ?? s)
        setRecent(sh.shipments ?? [])
        setAlerts((al.alerts ?? []).slice(0, 3))
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const kpi = [
    { name: "Active Shipments", value: stats?.active_shipments ?? "—", change: stats?.active_change  ?? "+0%",  trend: "up",   img: cargoImg, color: colors.accent,  bg: "rgba(0,180,216,0.12)",  bdr: "rgba(0,180,216,0.2)",   large: true  },
    { name: "In Transit",       value: stats?.in_transit       ?? "—", change: stats?.transit_change ?? "+0%",  trend: "up",   img: truckImg, color: "#A5B4FC",      bg: "rgba(165,180,252,0.1)", bdr: "rgba(165,180,252,0.2)", large: true  },
    { name: "Avg. Transit Time",value: stats?.avg_transit_days ? `${stats.avg_transit_days}d` : "—", change: stats?.time_change ?? "—", trend: "up", img: clockImg, color: colors.warning, bg: "rgba(245,158,11,0.1)", bdr: "rgba(245,158,11,0.2)", large: false },
    { name: "Monthly Spend",    value: stats?.monthly_spend ? `₹${(stats.monthly_spend/10000000).toFixed(2)}Cr` : "—", change: stats?.spend_change ?? "—", trend: "down", img: rupeeImg, color: colors.success, bg: "rgba(34,197,94,0.1)", bdr: "rgba(34,197,94,0.2)", large: false },
  ]

  return (
    <div className="space-y-7 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ color: textOn, fontSize: typography["3xl"], fontWeight: typography.bold, letterSpacing: typography.tight, marginBottom: 6 }}>
            Dashboard Overview
          </h1>
          <p style={{ color: textSub, fontSize: typography.base }}>Monitor your freight operations in real-time</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/dashboard/create")}
          className="flex items-center gap-2 px-5 py-3 rounded-xl"
          style={{ background: colors.gradientAccent, color: "#fff", fontWeight: typography.semibold, fontSize: typography.sm }}>
          <PlusIcon className="w-4 h-4" strokeWidth={2.5} /> New Shipment
        </motion.button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5" }}>
          {error}
        </div>
      )}

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

      {/* Bottom grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Shipments */}
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

          {loading ? (
            <div className="p-6 space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} />)}</div>
          ) : recent.length === 0 ? (
            <div className="p-12 text-center">
              <p style={{ color: textSub, fontSize: typography.base }}>No shipments yet</p>
              <button onClick={() => navigate("/dashboard/create")} className="mt-4 px-4 py-2 rounded-xl text-sm"
                style={{ background: colors.gradientAccent, color: "#fff", fontWeight: typography.semibold }}>
                Create First Shipment
              </button>
            </div>
          ) : (
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
                          <div style={{ color: textOn, fontSize: typography.sm, fontWeight: typography.medium }}>{s.origin_city}, {s.origin_state}</div>
                          <div style={{ color: textSub, fontSize: typography.sm, marginTop: 2 }}>→ {s.dest_city}, {s.dest_state}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                            style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, fontSize: typography.sm, fontWeight: typography.medium }}>
                            <ss.Icon className="w-3.5 h-3.5" />{ss.label}
                          </span>
                        </td>
                        <td className="px-6 py-4" style={{ color: textSub, fontSize: typography.sm }}>
                          {s.eta ? new Date(s.eta).toLocaleDateString("en-IN") : "—"}
                        </td>
                        <td className="px-6 py-4" style={{ color: textSub, fontSize: typography.sm }}>{s.carrier || "—"}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

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
            {loading ? Array(3).fill(0).map((_, i) => <Skeleton key={i} h={20} />)
              : alerts.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircleIcon className="w-10 h-10 mx-auto mb-3" style={{ color: colors.success, opacity: 0.4 }} />
                  <p style={{ color: textSub, fontSize: typography.sm }}>No new alerts</p>
                </div>
              ) : alerts.map((alert, i) => {
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
                          {alert.created_at ? new Date(alert.created_at).toLocaleDateString("en-IN") : ""}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            }
          </div>
        </motion.div>
      </div>
    </div>
  )
}