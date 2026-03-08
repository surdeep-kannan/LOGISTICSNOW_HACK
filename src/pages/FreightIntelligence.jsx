import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid"
import { colors, typography } from "../styles"
import { intelligence as intelApi } from "../lib/api"

const surface    = "#332B7A"
const surfaceMid = "#3D3585"
const border     = "rgba(255,255,255,0.1)"
const textOn     = "rgba(255,255,255,0.95)"
const textSub    = "rgba(255,255,255,0.65)"
const textFade   = "rgba(255,255,255,0.35)"

const STATUS_COLOR = { normal: colors.success, moderate: colors.warning, high: colors.error }
const STATUS_LABEL = { normal: "Normal", moderate: "Moderate", high: "High" }
const ALERT_COLOR  = { warning: colors.warning, success: colors.success, info: colors.accent, error: colors.error }
const ALERT_ICON   = {
  warning: ExclamationTriangleIcon,
  success: CheckCircleIcon,
  info:    InformationCircleIcon,
  error:   XCircleIcon,
}

function Skeleton({ h = 16 }) {
  return <div className={`h-${h} rounded-xl animate-pulse`} style={{ background: "rgba(255,255,255,0.05)" }} />
}

function CongestionBar({ value, status }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ height: "100%", borderRadius: 99, background: STATUS_COLOR[status] || colors.accent }} />
      </div>
      <span style={{ color: textOn, fontWeight: 700, fontSize: 13, minWidth: 36 }}>{value}%</span>
    </div>
  )
}

export default function FreightIntelligence() {
  const [tab,    setTab]    = useState("ports")
  const [ports,  setPorts]  = useState([])
  const [rates,  setRates]  = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError("")
      try {
        const [pd, rd, ad] = await Promise.all([
          intelApi.ports(),
          intelApi.rates(),
          intelApi.alerts(),
        ])
        setPorts(pd.ports  ?? pd  ?? [])
        setRates(rd.rates  ?? rd  ?? [])
        setAlerts(ad.alerts ?? ad ?? [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleMarkRead = async (id) => {
    try {
      await intelApi.markRead(id)
      setAlerts(a => a.map(al => al.id === id ? { ...al, is_read: true } : al))
    } catch (_) {}
  }

  const TABS = [
    { id: "ports",  label: "Port Congestion"   },
    { id: "rates",  label: "Rate Benchmarks"   },
    { id: "alerts", label: "Live Alerts", count: alerts.filter(a => !a.is_read).length },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 style={{ color: textOn, fontSize: typography["3xl"], fontWeight: typography.bold, letterSpacing: typography.tight, marginBottom: 6 }}>
          Freight Intelligence
        </h1>
        <p style={{ color: textSub, fontSize: typography.base }}>
          Real-time global freight data, port congestion & rate benchmarks
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5" }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 rounded-xl w-fit" style={{ background: surfaceMid, border: `1px solid ${border}` }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === t.id ? surface : "transparent",
              color: tab === t.id ? textOn : textSub,
              border: tab === t.id ? `1px solid ${border}` : "1px solid transparent",
            }}>
            {t.label}
            {t.count > 0 && (
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: colors.error, color: "#fff" }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Port Congestion ── */}
      {tab === "ports" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {loading
            ? Array(8).fill(0).map((_, i) => <Skeleton key={i} />)
            : ports.length === 0
              ? <div className="col-span-2 py-16 text-center" style={{ color: textSub }}>No port data available</div>
              : ports.map((port, i) => {
                  const statusKey = port.status || "normal"
                  const sc = STATUS_COLOR[statusKey] || colors.success
                  return (
                    <motion.div key={port.id ?? port.port_name ?? i}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      className="p-5 rounded-2xl" style={{ background: surface, border: `1px solid ${border}` }}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.base }}>
                            {port.port_name}
                          </h3>
                          <p style={{ color: textSub, fontSize: typography.xs, marginTop: 2 }}>{port.country}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span style={{ color: sc, fontSize: typography.xs, fontWeight: 600 }}>
                            {port.trend === "up" ? "↑" : port.trend === "down" ? "↓" : "→"} {port.trend}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: `${sc}15`, color: sc, border: `1px solid ${sc}30` }}>
                            {STATUS_LABEL[statusKey]}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <CongestionBar value={port.congestion_pct ?? port.congestion ?? 0} status={statusKey} />
                      </div>
                      <div className="flex gap-6">
                        <div>
                          <p style={{ color: textFade, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>Volume</p>
                          <p style={{ color: textOn, fontSize: typography.sm, fontWeight: 600, marginTop: 2 }}>
                            {port.volume ?? "—"}
                          </p>
                        </div>
                        <div>
                          <p style={{ color: textFade, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>Avg Delay</p>
                          <p style={{ color: textOn, fontSize: typography.sm, fontWeight: 600, marginTop: 2 }}>
                            {port.avg_delay_days != null ? `${port.avg_delay_days} days` : "—"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
          }
        </div>
      )}

      {/* ── Rate Benchmarks ── */}
      {tab === "rates" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden" style={{ background: surface, border: `1px solid ${border}` }}>
          <div className="px-6 py-5" style={{ borderBottom: `1px solid ${border}` }}>
            <h2 style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.lg }}>Rate Benchmarks</h2>
            <p style={{ color: textSub, fontSize: typography.sm, marginTop: 3 }}>LoRRI rates vs market average</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {["Route", "Mode", "LoRRI Rate", "Market Rate", "Saving"].map(h => (
                    <th key={h} className="px-6 py-4 text-left"
                      style={{ color: textSub, fontSize: typography.xs, fontWeight: typography.semibold, textTransform: "uppercase", letterSpacing: typography.wider }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(6).fill(0).map((_, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${border}` }}>
                        <td colSpan={5} className="px-6 py-3"><Skeleton h={8} /></td>
                      </tr>
                    ))
                  : rates.length === 0
                    ? (
                      <tr><td colSpan={5} className="px-6 py-12 text-center" style={{ color: textSub }}>No rate data available</td></tr>
                    )
                    : rates.map((r, i) => {
                        const change = r.change_pct ?? 0
                        const isDown = change < 0
                        const cc = isDown ? colors.success : colors.error
                        return (
                          <tr key={r.id ?? i} style={{ borderBottom: `1px solid ${border}` }}
                            onMouseEnter={e => e.currentTarget.style.background = surfaceMid}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <td className="px-6 py-4" style={{ color: textOn, fontSize: typography.sm, fontWeight: typography.medium }}>
                              {r.route}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                                style={{ background: "rgba(255,255,255,0.06)", color: textSub, border: `1px solid ${border}` }}>
                                {r.transport_mode ?? r.mode}
                              </span>
                            </td>
                            <td className="px-6 py-4" style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.sm }}>
                              {r.lorri_rate ? `₹${Number(r.lorri_rate).toLocaleString("en-IN")}` : r.rate ?? "—"}
                              <span style={{ color: textFade, fontSize: typography.xs }}> /{r.unit ?? "unit"}</span>
                            </td>
                            <td className="px-6 py-4" style={{ color: textSub, fontSize: typography.sm }}>
                              {r.market_rate ? `₹${Number(r.market_rate).toLocaleString("en-IN")}` : r.benchmark ?? "—"}
                            </td>
                            <td className="px-6 py-4">
                              <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: cc }}>
                                {isDown ? "▼" : "▲"} {Math.abs(change).toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        )
                      })
                }
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ── Live Alerts ── */}
      {tab === "alerts" && (
        <div className="space-y-3">
          {loading
            ? Array(5).fill(0).map((_, i) => <Skeleton key={i} h={20} />)
            : alerts.length === 0
              ? (
                <div className="py-16 text-center rounded-2xl" style={{ background: surface, border: `1px solid ${border}` }}>
                  <p style={{ color: textSub }}>No alerts at this time</p>
                </div>
              )
              : alerts.map((alert, i) => {
                  const type = alert.type ?? "info"
                  const ac = ALERT_COLOR[type] ?? colors.accent
                  const IconComponent = ALERT_ICON[type] ?? InformationCircleIcon
                  return (
                    <motion.div key={alert.id ?? i}
                      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                      className="p-5 rounded-2xl flex items-start gap-4"
                      style={{ background: surface, border: `1px solid ${alert.is_read ? border : ac + "40"}`, opacity: alert.is_read ? 0.6 : 1 }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${ac}15` }}>
                        <IconComponent className="w-5 h-5" style={{ color: ac }} />
                      </div>
                      <div className="flex-1">
                        <p style={{ color: textOn, fontSize: typography.sm, fontWeight: typography.medium, lineHeight: typography.relaxed }}>
                          {alert.message}
                        </p>
                        <p style={{ color: textFade, fontSize: typography.xs, marginTop: 6 }}>
                          {alert.created_at ? new Date(alert.created_at).toLocaleString("en-IN") : alert.time ?? ""}
                        </p>
                      </div>
                      {!alert.is_read && (
                        <button onClick={() => handleMarkRead(alert.id)}
                          className="text-xs px-2.5 py-1 rounded-lg shrink-0"
                          style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${border}`, color: textSub }}>
                          Mark read
                        </button>
                      )}
                    </motion.div>
                  )
                })
          }
        </div>
      )}
    </div>
  )
}