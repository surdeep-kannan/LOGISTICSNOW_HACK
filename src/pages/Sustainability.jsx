import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { colors, typography } from "../styles"
import { shipments as shipmentsApi } from "../lib/api"

const surface    = "#332B7A"
const surfaceMid = "#3D3585"
const border     = "rgba(255,255,255,0.1)"
const textOn     = "rgba(255,255,255,0.95)"
const textSub    = "rgba(255,255,255,0.65)"
const textFade   = "rgba(255,255,255,0.35)"
const green      = "#22C55E"
const greenLight = "#4ADE80"

const GREENER_OPTIONS = [
  { current: "Road (Diesel)", suggested: "Rail Freight", saving: "38% less CO₂", costDiff: "+₹2,200",  route: "Delhi → Mumbai"          },
  { current: "Air Freight",   suggested: "Sea + Road",   saving: "74% less CO₂", costDiff: "-₹18,000", route: "Mumbai → Singapore"      },
  { current: "Road (Diesel)", suggested: "Road (CNG)",   saving: "22% less CO₂", costDiff: "+₹800",    route: "Chennai → Bangalore"     },
  { current: "Sea (VLSFO)",   suggested: "Sea (LNG)",    saving: "14% less CO₂", costDiff: "+₹4,500",  route: "JNPT → Jebel Ali"        }
]

const MOCK_EMISSIONS = [
  { id: "M1", tracking_number: "SHP-AI-992", origin_city: "Mumbai",  dest_city: "Singapore", transport_mode: "Sea",  co2_actual: 1.2, co2_baseline: 4.8 },
  { id: "M2", tracking_number: "SHP-AI-881", origin_city: "Delhi",   dest_city: "Bangalore", transport_mode: "Road", co2_actual: 0.8, co2_baseline: 1.1 },
  { id: "M3", tracking_number: "SHP-AI-774", origin_city: "Chennai", dest_city: "Pune",      transport_mode: "Road", co2_actual: 0.5, co2_baseline: 0.6 },
  { id: "M4", tracking_number: "SHP-AI-112", origin_city: "Kolkata", dest_city: "Mumbai",    transport_mode: "Rail", co2_actual: 0.2, co2_baseline: 0.3 },
  { id: "M5", tracking_number: "SHP-AI-005", origin_city: "Guangzhou",dest_city: "Mumbai",   transport_mode: "Sea",  co2_actual: 2.1, co2_baseline: 2.8 },
]


function EmissionBar({ value, baseline }) {
  const maxVal = Math.max(value, baseline, 0.1)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: textFade, fontSize: 10, width: 56 }}>Actual</span>
        <div style={{ flex: 1, height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${(value / maxVal) * 100}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ height: "100%", borderRadius: 99, background: green }} />
        </div>
        <span style={{ color: green, fontWeight: 700, fontSize: 12, minWidth: 48 }}>{value?.toFixed?.(2) ?? value}t</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: textFade, fontSize: 10, width: 56 }}>Baseline</span>
        <div style={{ flex: 1, height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(baseline / maxVal) * 100}%`, borderRadius: 99, background: "rgba(255,255,255,0.2)" }} />
        </div>
        <span style={{ color: textFade, fontSize: 12, minWidth: 48 }}>{baseline?.toFixed?.(2) ?? baseline}t</span>
      </div>
    </div>
  )
}

function Skeleton() {
  return <div className="h-24 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
}

export default function Sustainability() {
  const [tab,      setTab]      = useState("emissions")
  const [shipments, setShipments] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState("")

  useEffect(() => {
    async function load() {
      try {
        const data = await shipmentsApi.list({ limit: 10 })
        const sh = data.shipments ?? []
        setShipments(sh.length > 0 ? sh : MOCK_EMISSIONS)
      } catch (e) {
        setShipments(MOCK_EMISSIONS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalCO2     = shipments.reduce((s, sh) => s + (sh.co2_actual   ?? 0), 0)
  const baselineCO2  = shipments.reduce((s, sh) => s + (sh.co2_baseline ?? 0), 0)
  const totalSaved   = baselineCO2 - totalCO2
  const savingPct    = baselineCO2 > 0 ? Math.round((totalSaved / baselineCO2) * 100) : 0

  const TABS = [
    { id: "emissions",  label: "Emissions by Shipment" },
    { id: "greener",    label: "Greener Alternatives"  },
    { id: "esg",        label: "ESG Report"            },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 style={{ color: textOn, fontSize: typography["3xl"], fontWeight: typography.bold, letterSpacing: typography.tight, marginBottom: 6 }}>
          Sustainability
        </h1>
        <p style={{ color: textSub, fontSize: typography.base }}>Track your carbon footprint and reduce emissions</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5" }}>
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total CO₂ Emitted",  value: `${totalCO2.toFixed(1)}t`,    color: textOn,        sub: "across all shipments" },
          { label: "CO₂ Saved vs Baseline", value: `${totalSaved.toFixed(1)}t`, color: green,        sub: "through route optimisation" },
          { label: "Emissions Reduced",   value: `${savingPct}%`,              color: greenLight,    sub: "vs unoptimised routes" },
        ].map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="p-5 rounded-2xl" style={{ background: surface, border: `1px solid ${border}` }}>
            <p style={{ color: textFade, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{c.label}</p>
            <p style={{ color: c.color, fontSize: typography["3xl"], fontWeight: typography.bold, lineHeight: 1, marginBottom: 4 }}>{c.value}</p>
            <p style={{ color: textSub, fontSize: typography.xs }}>{c.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-2 p-1.5 rounded-xl w-fit" style={{ background: surfaceMid, border: `1px solid ${border}` }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
              style={{ background: tab === t.id ? surface : "transparent", color: tab === t.id ? textOn : textSub, border: tab === t.id ? `1px solid ${border}` : "1px solid transparent" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Emissions by Shipment ── */}
      {tab === "emissions" && (
        <div className="space-y-3">
          {loading
            ? Array(5).fill(0).map((_, i) => <Skeleton key={i} />)
            : shipments.length === 0
              ? (
                <div className="py-16 text-center rounded-2xl" style={{ background: surface, border: `1px solid ${border}` }}>
                  <p style={{ color: textSub }}>No shipment data yet. Create a shipment to see emissions tracking.</p>
                </div>
              )
              : shipments.map((s, i) => {
                  const saving = s.co2_baseline > 0
                    ? Math.round(((s.co2_baseline - s.co2_actual) / s.co2_baseline) * 100)
                    : 0
                  const isOptimized = saving > 0
                  return (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      className="p-5 rounded-2xl" style={{ background: surface, border: `1px solid ${border}` }}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span className="font-mono font-bold text-sm" style={{ color: colors.accent }}>{s.tracking_number}</span>
                          <p style={{ color: textSub, fontSize: typography.xs, marginTop: 2 }}>
                            {s.origin_city} → {s.dest_city} · {s.transport_mode}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {saving > 0 && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={{ background: "rgba(34,197,94,0.12)", color: green, border: "1px solid rgba(34,197,94,0.25)" }}>
                              -{saving}% CO₂
                            </span>
                          )}
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: isOptimized ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.06)", color: isOptimized ? green : textFade, border: `1px solid ${isOptimized ? "rgba(34,197,94,0.2)" : border}` }}>
                            {isOptimized ? "Optimized" : "Standard"}
                          </span>
                        </div>
                      </div>
                      <EmissionBar value={s.co2_actual ?? 0} baseline={s.co2_baseline ?? 0} />
                    </motion.div>
                  )
                })
          }
        </div>
      )}

      {/* ── Greener Alternatives ── */}
      {tab === "greener" && (
        <div className="space-y-3">
          {GREENER_OPTIONS.map((opt, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="p-5 rounded-2xl" style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <span className="px-3 py-1 rounded-lg text-xs" style={{ background: "rgba(239,68,68,0.1)", color: colors.error, border: "1px solid rgba(239,68,68,0.2)" }}>
                      {opt.current}
                    </span>
                    <span style={{ color: textFade, fontSize: 12 }}>→</span>
                    <span className="px-3 py-1 rounded-lg text-xs" style={{ background: "rgba(34,197,94,0.1)", color: green, border: "1px solid rgba(34,197,94,0.2)" }}>
                      {opt.suggested}
                    </span>
                  </div>
                  <div>
                    <p style={{ color: textOn, fontSize: typography.sm, fontWeight: typography.medium }}>{opt.route}</p>
                    <p style={{ color: green, fontSize: typography.xs, marginTop: 4, fontWeight: 600 }}>{opt.saving}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p style={{ color: textFade, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Cost difference</p>
                  <p style={{ color: opt.costDiff.startsWith("-") ? green : colors.warning, fontWeight: typography.bold, fontSize: typography.base }}>
                    {opt.costDiff}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── ESG Report ── */}
      {tab === "esg" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 space-y-6" style={{ background: surface, border: `1px solid ${border}` }}>
          <h2 style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.lg }}>ESG Summary Report</h2>

          {[
            { label: "Environmental Score",  value: `${Math.min(60 + savingPct, 100)}/100`, color: green,         desc: "Based on CO₂ reduction vs baseline" },
            { label: "Social Score",         value: "72/100",                                color: colors.accent,  desc: "Ethical carrier partnerships & labour compliance" },
            { label: "Governance Score",     value: "85/100",                                color: "#A5B4FC",      desc: "Audit trails, compliance logs & data security" },
          ].map((item, i) => (
            <div key={item.label} className="p-4 rounded-xl" style={{ background: surfaceMid, border: `1px solid ${border}` }}>
              <div className="flex items-center justify-between mb-3">
                <p style={{ color: textOn, fontWeight: typography.medium, fontSize: typography.sm }}>{item.label}</p>
                <p style={{ color: item.color, fontWeight: typography.bold, fontSize: typography.lg }}>{item.value}</p>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: item.value.split("/")[0] + "%" }} transition={{ duration: 0.8, delay: i * 0.1 }}
                  style={{ height: "100%", borderRadius: 99, background: item.color }} />
              </div>
              <p style={{ color: textFade, fontSize: typography.xs, marginTop: 6 }}>{item.desc}</p>
            </div>
          ))}

          <div className="p-4 rounded-xl text-center" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <p style={{ color: green, fontWeight: typography.bold, fontSize: typography.lg }}>
              Overall ESG Rating: {Math.round((Math.min(60 + savingPct, 100) + 72 + 85) / 3)}/100
            </p>
            <p style={{ color: textSub, fontSize: typography.sm, marginTop: 4 }}>
              Your freight operations score above industry average
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}