import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { colors, typography } from "../styles"

// ── Real asset imports ────────────────────────────────────
import lorriLogo      from "../assets/lorri.png"
import containerTruck from "../assets/container-truck.png"
import truckMove      from "../assets/truck_move.png"
import shipMoving     from "../assets/ship_moving.png"
import cargoImg       from "../assets/cargo.png"

// Using requested replacements:
import leafImg        from "../assets/leaf.png"
import warningImg     from "../assets/warning.png"
import radarAnim      from "../assets/radar.json"
import Lottie         from "lottie-react"

const surface    = "#332B7A"
const surfaceMid = "#3D3585"
const border     = "rgba(255,255,255,0.1)"
const textOn     = "rgba(255,255,255,0.95)"
const textSub    = "rgba(255,255,255,0.65)"
const textFade   = "rgba(255,255,255,0.35)"

// ── Agent definitions ─────────────────────────────────────
const AGENTS = [
  {
    id: "procurement", name: "Procurement Agent", short: "PROCURE",
    img: containerTruck, imgSize: 44,
    color: "#00B4D8", glow: "rgba(0,180,216,0.35)", dimGlow: "rgba(0,180,216,0.12)",
    tagBg: "rgba(0,180,216,0.12)", tagBdr: "rgba(0,180,216,0.3)",
    desc: "Autonomously negotiates rates, selects optimal carriers, and books freight across 2,000+ carrier network — 24/7 without human intervention.",
    metrics: [
      { label: "Carriers monitored", val: "2,000+" },
      { label: "Avg cost reduction",  val: "32%"   },
      { label: "Booking time",        val: "< 4min" },
    ],
    tasks: [
      "Rate negotiation across carriers",
      "Real-time lane benchmarking",
      "Auto-booking on best route",
      "SLA compliance enforcement",
    ],
    dataFlows: ["optimization", "intelligence"],
  },
  {
    id: "optimization", name: "Optimization Engine", short: "OPTIMIZE",
    img: truckMove, imgSize: 48,
    color: "#8B5CF6", glow: "rgba(139,92,246,0.35)", dimGlow: "rgba(139,92,246,0.12)",
    tagBg: "rgba(139,92,246,0.12)", tagBdr: "rgba(139,92,246,0.3)",
    desc: "Continuously re-routes shipments using live port congestion, geopolitical alerts, and weather data. Currently re-routing 340+ shipments around Strait of Hormuz disruption.",
    metrics: [
      { label: "On-time rate",     val: "98%"   },
      { label: "Delay prediction", val: "48hrs"  },
      { label: "Routes evaluated", val: "1,400+" },
    ],
    tasks: [
      "Live route re-optimization",
      "Hormuz corridor rerouting active",
      "Delay prediction & early alerts",
      "Multi-modal path planning",
    ],
    dataFlows: ["procurement", "sustainability"],
  },
  {
    id: "sustainability", name: "Sustainability AI", short: "ESG",
    img: leafImg, imgSize: 46,
    color: "#22C55E", glow: "rgba(34,197,94,0.35)", dimGlow: "rgba(34,197,94,0.12)",
    tagBg: "rgba(34,197,94,0.12)", tagBdr: "rgba(34,197,94,0.3)",
    desc: "Auto-calculates Scope 3 emissions for every shipment. Recommends greener alternatives and generates ESG compliance reports instantly.",
    metrics: [
      { label: "CO₂ tracked",        val: "100%"   },
      { label: "Avg emission saving", val: "38%"    },
      { label: "ESG report time",     val: "< 1min" },
    ],
    tasks: [
      "Scope 3 emission calculation",
      "Greener route suggestions",
      "ESG compliance reporting",
      "Carbon offset integration",
    ],
    dataFlows: ["intelligence", "optimization"],
  },
  {
    id: "intelligence", name: "Global Freight Grid", short: "INTEL",
    img: cargoImg, imgSize: 50,
    color: "#F59E0B", glow: "rgba(245,158,11,0.35)", dimGlow: "rgba(245,158,11,0.12)",
    tagBg: "rgba(245,158,11,0.12)", tagBdr: "rgba(245,158,11,0.3)",
    desc: "Aggregates real-time data from 180+ ports, 20,000+ lanes, and ₹10,000Cr+ of freight spend — including live Strait of Hormuz crisis monitoring.",
    metrics: [
      { label: "Freight data points", val: "50M+"   },
      { label: "Ports monitored",     val: "180+"    },
      { label: "Lanes covered",       val: "20,000+" },
    ],
    tasks: [
      "Port congestion live feeds",
      "Rate benchmark intelligence",
      "Carrier performance scoring",
      "Geopolitical disruption alerts",
    ],
    dataFlows: ["procurement", "optimization"],
  },
]

// ── Live activity feed — includes real Hormuz crisis events ──
const ACTIVITY = [
  { agent: "intelligence",  color: "#F59E0B", tag: "CRITICAL", msg: "Bandar Abbas (Iran) — operations halted · 85% of Iran container traffic disrupted · 26 Apr 2025" },
  { agent: "optimization",  color: "#8B5CF6", tag: "REROUTING", msg: "340+ shipments diverted from Hormuz Strait · Alternative: Colombo → Jebel Ali via Cape of Good Hope" },
  { agent: "intelligence",  color: "#F59E0B", tag: "ALERT", msg: "Strait of Hormuz tanker traffic ↓70% · 150+ ships at anchorage · War-risk premiums +240%" },
  { agent: "procurement",   color: "#00B4D8", tag: "SAVED", msg: "Locked ₹38,900 vs ₹46,200 market · Mumbai → Delhi · Delhivery secured" },
  { agent: "optimization",  color: "#8B5CF6", tag: "LIVE", msg: "Mundra port congestion ↑ · Vessels rerouting from Gulf · +1.4 day avg wait" },
  { agent: "sustainability",color: "#22C55E", tag: "ESG", msg: "ESG report auto-generated · Cape route adds 4,200km · CO₂ offset calculated" },
  { agent: "intelligence",  color: "#F59E0B", tag: "LIVE", msg: "Singapore, Port Klang anchorage activity surging · Cargo diverting from Hormuz" },
  { agent: "procurement",   color: "#00B4D8", tag: "BOOKED", msg: "Auto-booked Blue Dart · 32% below market rate · Mumbai → Bangalore" },
]

// ── Real port congestion data (Hormuz crisis + India impact) ──
const PORT_CONGESTION = [
  { name: "Bandar Abbas, Iran", country: "Iran", pct: 98, status: "CRITICAL", color: "#EF4444", trend: "↑", detail: "Operations halted — explosion Apr 26. 85% Iran container traffic disrupted." },
  { name: "Strait of Hormuz", country: "International", pct: 94, status: "CRITICAL", color: "#EF4444", trend: "↑", detail: "Traffic ↓70%. 150+ ships anchored. War-risk premiums surged 240%." },
  { name: "Mundra Port",  country: "India", pct: 71, status: "HIGH", color: "#F59E0B", trend: "↑", detail: "Surge from Hormuz diversions. Avg berth wait +1.4 days." },
  { name: "Colombo Port", country: "Sri Lanka", pct: 68, status: "HIGH", color: "#F59E0B", trend: "↑", detail: "Transshipment hub overloaded. Vessels rerouting from Gulf." },
  { name: "JNPT Mumbai",  country: "India", pct: 52, status: "MODERATE", color: "#00B4D8", trend: "→", detail: "Moderate congestion. India-Gulf freight delays 3–5 days." },
  { name: "Singapore",    country: "Singapore", pct: 48, status: "MODERATE", color: "#00B4D8", trend: "↑", detail: "Anchorage activity rising. Diverted Gulf cargo increasing." },
  { name: "Chennai Port", country: "India", pct: 38, status: "NORMAL", color: "#22C55E", trend: "→", detail: "Operating normally. Minor congestion on India-Middle East lanes." },
  { name: "Karachi Port", country: "Pakistan", pct: 61, status: "HIGH", color: "#F59E0B", trend: "↑", detail: "Vessel bunching. Ships waiting 2–2.5 days for berths." },
]

// ── SVG layout ────────────────────────────────────────────
const SVG_W = 680
const SVG_H = 680
const R     = 58
const CX    = 340
const CY    = 340

const POS = {
  procurement:   { x: 148, y: 172 },
  optimization:  { x: 532, y: 172 },
  sustainability:{ x: 148, y: 508 },
  intelligence:  { x: 532, y: 508 },
}

const CONNS = [
  { from: "procurement",    to: "optimization",   id: "c1" },
  { from: "optimization",   to: "intelligence",   id: "c2" },
  { from: "intelligence",   to: "sustainability", id: "c3" },
  { from: "sustainability", to: "procurement",    id: "c4" },
  { from: "procurement",    to: "intelligence",   id: "c5" },
  { from: "optimization",   to: "sustainability", id: "c6" },
]

function curvePath(from, to) {
  const f = POS[from], t = POS[to]
  const mx = (f.x + t.x) / 2
  const my = (f.y + t.y) / 2
  const cx = mx * 0.5 + CX * 0.5
  const cy = my * 0.5 + CY * 0.5
  return `M ${f.x} ${f.y} Q ${cx} ${cy} ${t.x} ${t.y}`
}

function PulseDot({ pathId, color, delay, dur = 3 }) {
  return (
    <circle r="4.5" fill={color} opacity="0">
      <animateMotion dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1">
        <mpath href={`#${pathId}`} />
      </animateMotion>
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
      <animate attributeName="r" values="3;5.5;3" dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
    </circle>
  )
}

function AgentNode({ agent, isActive, dimmed, onClick }) {
  const pos = POS[agent.id]
  const opacity = dimmed ? 0.22 : 1
  return (
    <g style={{ cursor: "pointer", transition: "opacity 0.35s" }} opacity={opacity} onClick={onClick}>
      {isActive && (
        <circle cx={pos.x} cy={pos.y} r={R + 18} fill="none"
          stroke={agent.color} strokeWidth="1" strokeDasharray="5 7" opacity="0.55">
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${pos.x} ${pos.y}`} to={`360 ${pos.x} ${pos.y}`}
            dur="7s" repeatCount="indefinite" />
        </circle>
      )}
      {isActive && (
        <>
          <circle cx={pos.x} cy={pos.y} r={R} fill="none" stroke={agent.color} strokeWidth="1.5" opacity="0">
            <animate attributeName="r" values={`${R};${R + 28}`} dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <circle cx={pos.x} cy={pos.y} r={R} fill="none" stroke={agent.color} strokeWidth="0.8" opacity="0">
            <animate attributeName="r" values={`${R};${R + 44}`} dur="2.2s" begin="0.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0" dur="2.2s" begin="0.8s" repeatCount="indefinite" />
          </circle>
        </>
      )}
      <circle cx={pos.x} cy={pos.y} r={R}
        fill={isActive ? `${agent.color}22` : surfaceMid}
        stroke={agent.color} strokeWidth={isActive ? 2 : 1}
        opacity={isActive ? 1 : 0.7}
        style={{ transition: "all 0.35s" }}
      />
      <circle cx={pos.x} cy={pos.y} r={R - 8} fill="none"
        stroke={agent.color} strokeWidth="0.5" opacity={isActive ? 0.4 : 0.15}
        style={{ transition: "opacity 0.35s" }}
      />
      <foreignObject
        x={pos.x - agent.imgSize / 2} y={pos.y - agent.imgSize / 2 - 8}
        width={agent.imgSize} height={agent.imgSize}
        style={{ pointerEvents: "none" }}>
        <img src={agent.img} alt={agent.name} style={{
          width: agent.imgSize, height: agent.imgSize, objectFit: "contain",
          filter: isActive ? `drop-shadow(0 0 8px ${agent.color})` : "brightness(0.65) saturate(0.5)",
          transition: "filter 0.35s",
        }} />
      </foreignObject>
      <text x={pos.x} y={pos.y + agent.imgSize / 2 - 2}
        textAnchor="middle" fontSize="9" fontWeight="800" letterSpacing="0.12em"
        fill={isActive ? agent.color : "rgba(255,255,255,0.35)"}
        style={{ transition: "fill 0.35s", pointerEvents: "none" }}>
        {agent.short}
      </text>
      {(() => {
        const isLeft = pos.x < CX
        const isTop  = pos.y < CY
        const lx = isLeft ? pos.x - R - 14 : pos.x + R + 14
        const ly = isTop  ? pos.y - R - 18  : pos.y + R + 22
        return (
          <text x={lx} y={ly} textAnchor={isLeft ? "end" : "start"}
            fontSize="11" fontWeight="600"
            fill={isActive ? agent.color : "rgba(255,255,255,0.38)"}
            style={{ transition: "fill 0.35s", pointerEvents: "none" }}>
            {agent.name}
          </text>
        )
      })()}
    </g>
  )
}

function CenterHub({ activeAgent }) {
  const active = AGENTS.find(a => a.id === activeAgent)
  return (
    <g>
      <circle cx={CX} cy={CY} r={52} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 8">
        <animateTransform attributeName="transform" type="rotate"
          from={`0 ${CX} ${CY}`} to={`-360 ${CX} ${CY}`} dur="22s" repeatCount="indefinite" />
      </circle>
      <circle cx={CX} cy={CY} r={40} fill="#1E1856"
        stroke={active ? active.color : "rgba(255,255,255,0.12)"}
        strokeWidth="1.5" style={{ transition: "stroke 0.4s" }} />
      <circle cx={CX} cy={CY} r={33} fill="none"
        stroke={active ? active.color : "rgba(255,255,255,0.05)"}
        strokeWidth="0.5" style={{ transition: "stroke 0.4s" }} />
      <foreignObject x={CX - 26} y={CY - 26} width={52} height={52} style={{ pointerEvents: "none" }}>
        <img src={lorriLogo} alt="LoRRI" style={{
          width: 52, height: 52, objectFit: "contain",
          filter: active
            ? `drop-shadow(0 0 6px ${active.color}) brightness(1.1)`
            : "brightness(0.65) saturate(0.5)",
          transition: "filter 0.4s",
        }} />
      </foreignObject>
    </g>
  )
}

// ── Port congestion panel ─────────────────────────────────
function CongestionPanel() {
  const [expanded, setExpanded] = useState(null)
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: surface, border: `1px solid #EF444430` }}>
      {/* Header */}
      <div style={{
        padding: "13px 16px", borderBottom: `1px solid ${border}`,
        background: "rgba(239,68,68,0.08)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 26, height: 26, filter: "drop-shadow(0 0 5px rgba(239,68,68,0.6))" }}>
            <Lottie animationData={radarAnim} loop={true} />
          </div>
          <div>
            <div style={{ color: textOn, fontWeight: 700, fontSize: 13 }}>Live Port Congestion</div>
            <div style={{ color: "#EF4444", fontSize: 10, fontWeight: 600, marginTop: 1 }}>
              ⚠ Hormuz crisis active — 180+ ports monitored
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", display: "inline-block",
            animation: "arch-pulse 1s ease-in-out infinite" }} />
          <span style={{ color: "#EF4444", fontSize: 10, fontWeight: 800 }}>CRITICAL</span>
        </div>
      </div>

      {/* Bandar Abbas crisis banner */}
      <div style={{
        padding: "10px 16px", margin: "12px 12px 0",
        borderRadius: 10, background: "rgba(239,68,68,0.1)",
        border: "1px solid rgba(239,68,68,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <img src={warningImg} alt="" style={{ width: 16, height: 16, flexShrink: 0, filter: "drop-shadow(0 0 3px #EF4444)", marginTop: 2 }} />
          <div>
            <div style={{ color: "#FCA5A5", fontSize: 11, fontWeight: 800, marginBottom: 3 }}>
              BANDAR ABBAS (IRAN) · SHAHID RAJAEE PORT — OPERATIONS HALTED
            </div>
            <div style={{ color: "rgba(252,165,165,0.75)", fontSize: 11, lineHeight: 1.55 }}>
              Explosion Apr 26 destroyed 10,000+ containers. 85% of Iran container traffic disrupted.
              Strait of Hormuz traffic ↓70%. 150+ vessels at anchorage. Indian ports absorbing diverted cargo.
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              {["Mundra congestion ↑71%", "Colombo overflow ↑68%", "War-risk +240%", "340+ shipments rerouted"].map(t => (
                <span key={t} style={{
                  padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                  background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                  color: "#FCA5A5",
                }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Port list */}
      <div style={{ padding: "10px 0 4px" }}>
        {PORT_CONGESTION.map((port, i) => (
          <div key={port.name}
            onClick={() => setExpanded(expanded === i ? null : i)}
            style={{
              padding: "9px 16px", cursor: "pointer",
              background: expanded === i ? "rgba(255,255,255,0.04)" : "transparent",
              transition: "background 0.2s",
              borderBottom: i < PORT_CONGESTION.length - 1 ? `1px solid rgba(255,255,255,0.05)` : "none",
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Status dot */}
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: port.color, flexShrink: 0,
                boxShadow: `0 0 5px ${port.color}` }} />
              {/* Name + country */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: textOn, fontSize: 12, fontWeight: 600, lineHeight: 1 }}>{port.name}</div>
                <div style={{ color: textFade, fontSize: 10, marginTop: 1 }}>{port.country}</div>
              </div>
              {/* Bar */}
              <div style={{ width: 72, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden", flexShrink: 0 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${port.pct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  style={{ height: "100%", borderRadius: 99, background: port.color }}
                />
              </div>
              {/* Pct */}
              <div style={{ color: port.color, fontSize: 12, fontWeight: 800, minWidth: 36, textAlign: "right" }}>
                {port.pct}%
              </div>
              {/* Trend + badge */}
              <div style={{
                padding: "2px 6px", borderRadius: 4,
                background: `${port.color}18`, border: `1px solid ${port.color}35`,
                color: port.color, fontSize: 9, fontWeight: 800,
                letterSpacing: "0.06em", flexShrink: 0,
              }}>
                {port.trend} {port.status}
              </div>
            </div>
            {/* Expanded detail */}
            <AnimatePresence>
              {expanded === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden" }}>
                  <div style={{ marginTop: 8, paddingLeft: 18, color: textSub, fontSize: 11, lineHeight: 1.6 }}>
                    {port.detail}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Activity feed item ────────────────────────────────────
function FeedItem({ item, i }) {
  const agent = AGENTS.find(a => a.id === item.agent)
  const isCritical = item.tag === "CRITICAL" || item.tag === "ALERT"
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3, delay: i * 0.04 }}
      style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        padding: "10px 14px",
        borderBottom: `1px solid ${border}`,
        background: isCritical ? "rgba(239,68,68,0.04)" : "transparent",
      }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: `${item.color}15`, border: `1px solid ${item.color}30`,
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
      }}>
        <img src={agent?.img} alt=""
          style={{ width: 20, height: 20, objectFit: "contain", filter: `drop-shadow(0 0 3px ${item.color})` }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <span style={{ color: item.color, fontSize: 9, fontWeight: 800, letterSpacing: "0.1em" }}>
            {agent?.name?.toUpperCase()}
          </span>
          <span style={{
            padding: "1px 5px", borderRadius: 3,
            background: isCritical ? "rgba(239,68,68,0.2)" : `${item.color}18`,
            border: `1px solid ${isCritical ? "rgba(239,68,68,0.4)" : `${item.color}30`}`,
            color: isCritical ? "#FCA5A5" : item.color,
            fontSize: 8, fontWeight: 800, letterSpacing: "0.08em",
          }}>{item.tag}</span>
        </div>
        <div style={{ color: textSub, fontSize: 11, lineHeight: 1.5 }}>{item.msg}</div>
      </div>
    </motion.div>
  )
}

// ── Main export ───────────────────────────────────────────
export default function AgentArchitecture() {
  const [activeAgent,  setActiveAgent]  = useState(null)
  const [feedItems,    setFeedItems]    = useState(ACTIVITY.slice(0, 4))
  const [feedIdx,      setFeedIdx]      = useState(4)
  const [requestCount, setRequestCount] = useState(1284)
  const [systemLoad,   setSystemLoad]   = useState(72)
  const [tab,          setTab]          = useState("feed")   // "feed" | "ports"

  const selected   = AGENTS.find(a => a.id === activeAgent)
  const relatedSet = new Set(selected?.dataFlows ?? [])

  useEffect(() => {
    const t = setInterval(() => {
      setFeedIdx(i => {
        const next = i % ACTIVITY.length
        setFeedItems(prev => [ACTIVITY[next], ...prev.slice(0, 3)])
        return next + 1
      })
      setRequestCount(c => c + Math.floor(Math.random() * 4 + 1))
      setSystemLoad(l => Math.min(97, Math.max(55, l + (Math.random() - 0.5) * 7)))
    }, 2800)
    return () => clearInterval(t)
  }, [])

  const handleClick = (id) => setActiveAgent(p => p === id ? null : id)

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(0,180,216,0.1)", border: "1px solid rgba(0,180,216,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22C55E", animation: "arch-pulse 1.5s ease-in-out infinite" }} />
            <span style={{ color: "#00B4D8", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em" }}>
              LIVE · ALL 4 AGENTS ACTIVE
            </span>
          </div>
          {/* Hormuz crisis banner */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#EF4444", animation: "arch-pulse 1s ease-in-out infinite" }} />
            <span style={{ color: "#FCA5A5", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em" }}>
              ⚠ HORMUZ STRAIT CRISIS — ACTIVE REROUTING
            </span>
          </div>
        </div>
        <div>
          <h1 style={{ color: textOn, fontSize: typography["3xl"], fontWeight: typography.bold, letterSpacing: typography.tight, marginBottom: 6 }}>
            AI Agent Architecture
          </h1>
          <p style={{ color: textSub, fontSize: typography.base }}>
            Four autonomous agents working in concert — currently managing Strait of Hormuz disruption across 340+ affected shipments
          </p>
        </div>
      </div>

      {/* ── System stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Requests processed", val: requestCount.toLocaleString("en-IN"), color: "#00B4D8", img: containerTruck },
          { label: "System load",        val: `${Math.round(systemLoad)}%`,         color: "#8B5CF6", img: truckMove    },
          { label: "Shipments rerouting",val: "340+",                               color: "#EF4444", img: shipMoving   },
          { label: "Ports in crisis",    val: "2 CRITICAL",                         color: "#F59E0B", img: warningImg   },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl"
            style={{ background: surface, border: `1px solid ${s.color === "#EF4444" ? "rgba(239,68,68,0.3)" : border}` }}>
            <div className="flex items-center gap-3 mb-3">
              <img src={s.img} alt="" style={{ width: 22, height: 22, objectFit: "contain", filter: `drop-shadow(0 0 4px ${s.color})` }} />
              <div style={{ color: textFade, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {s.label}
              </div>
            </div>
            <div style={{ color: s.color, fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em" }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* ── Main layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

        {/* ── SVG diagram — Col span 2 ── */}
        <div className="xl:col-span-2 rounded-2xl overflow-hidden relative"
          style={{ background: "radial-gradient(ellipse at 40% 40%, #2A2070 0%, #140E3A 100%)", border: `1px solid ${border}` }}>
          <svg width="100%" viewBox={`-100 -40 ${SVG_W + 200} ${SVG_H + 80}`} style={{ display: "block" }}>
            <defs>
              {CONNS.map(c => (
                <path key={c.id} id={c.id} d={curvePath(c.from, c.to)} fill="none" />
              ))}
            </defs>

            {/* Dot grid */}
            {Array.from({ length: 11 }, (_, r) =>
              Array.from({ length: 15 }, (_, col) => (
                <circle key={`${r}-${col}`} cx={col * 48 + 20} cy={r * 68 + 20}
                  r="1.2" fill="rgba(255,255,255,0.03)" />
              ))
            )}

            {/* Connection lines */}
            {CONNS.map(c => {
              const fromAgent = AGENTS.find(a => a.id === c.from)
              const lit = activeAgent && (c.from === activeAgent || c.to === activeAgent)
              return (
                <path key={c.id} d={curvePath(c.from, c.to)}
                  fill="none"
                  stroke={lit ? fromAgent.color : "rgba(255,255,255,0.07)"}
                  strokeWidth={lit ? 1.5 : 0.5}
                  style={{ transition: "all 0.35s" }}
                />
              )
            })}

            {/* Pulse dots */}
            <PulseDot pathId="c1" color="#00B4D8" delay={0}   dur={3.4} />
            <PulseDot pathId="c2" color="#8B5CF6" delay={0.7} dur={3.1} />
            <PulseDot pathId="c3" color="#22C55E" delay={1.4} dur={2.9} />
            <PulseDot pathId="c4" color="#F59E0B" delay={2.1} dur={3.6} />
            <PulseDot pathId="c5" color="#EF4444" delay={0.3} dur={2.4} />
            <PulseDot pathId="c6" color="#8B5CF6" delay={1.0} dur={3.8} />

            <CenterHub activeAgent={activeAgent} />

            {AGENTS.map(agent => (
              <AgentNode key={agent.id} agent={agent}
                isActive={activeAgent === agent.id}
                dimmed={activeAgent && activeAgent !== agent.id && !relatedSet.has(agent.id)}
                onClick={() => handleClick(agent.id)}
              />
            ))}
          </svg>

          {!activeAgent && (
            <div style={{
              position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)",
              color: textFade, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
              background: "rgba(0,0,0,0.35)", padding: "6px 16px", borderRadius: 999,
              border: `1px solid ${border}`, whiteSpace: "nowrap", backdropFilter: "blur(8px)",
            }}>
              ↑ Click any agent to inspect
            </div>
          )}
        </div>

        {/* ── Right panel ── */}
        <div className="space-y-4">

          {/* Agent detail / placeholder */}
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: surface, border: `1px solid ${selected.color}45`, boxShadow: `0 0 40px ${selected.dimGlow}` }}>
                <div style={{
                  padding: "18px 20px",
                  background: `linear-gradient(135deg, ${selected.color}14 0%, transparent 70%)`,
                  borderBottom: `1px solid ${border}`,
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, background: selected.tagBg, border: `1px solid ${selected.tagBdr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={selected.img} alt={selected.name} style={{ width: 36, height: 36, objectFit: "contain", filter: `drop-shadow(0 0 6px ${selected.color})` }} />
                  </div>
                  <div>
                    <div style={{ color: textOn, fontWeight: 800, fontSize: 15, marginBottom: 5 }}>{selected.name}</div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md"
                      style={{ background: selected.tagBg, border: `1px solid ${selected.tagBdr}`, color: selected.color, fontSize: 9, fontWeight: 800, letterSpacing: "0.1em" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: selected.color, animation: "arch-pulse 1.5s ease-in-out infinite" }} />
                      AGENT ACTIVE
                    </div>
                  </div>
                </div>
                <div className="p-5 border-b border-white/10">
                  <p style={{ color: textSub, fontSize: 13, lineHeight: 1.7 }}>{selected.desc}</p>
                </div>
                <div className="grid grid-cols-3 border-b border-white/10">
                  {selected.metrics.map((m, i) => (
                    <div key={m.label} className={`p-4 text-center ${i < 2 ? "border-r border-white/10" : ""}`}>
                      <div style={{ color: selected.color, fontWeight: 900, fontSize: 18, lineHeight: 1 }}>{m.val}</div>
                      <div style={{ color: textFade, fontSize: 10, marginTop: 4, lineHeight: 1.4 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
                <div className="p-5 border-b border-white/10">
                  <div style={{ color: textFade, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Active tasks</div>
                  {selected.tasks.map((task, i) => (
                    <motion.div key={task} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-3 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: selected.color, flexShrink: 0, boxShadow: `0 0 5px ${selected.color}` }} />
                      <span style={{ color: textSub, fontSize: 13 }}>{task}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="p-4">
                  <div style={{ color: textFade, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Sends data to</div>
                  <div className="flex flex-wrap gap-2">
                    {selected.dataFlows.map(id => {
                      const t = AGENTS.find(a => a.id === id)
                      return (
                        <button key={id} onClick={() => setActiveAgent(id)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all"
                          style={{ background: t.tagBg, border: `1px solid ${t.tagBdr}`, color: t.color, fontSize: 11, fontWeight: 700 }}>
                          <img src={t.img} alt="" style={{ width: 16, height: 16, objectFit: "contain" }} />
                          {t.short} →
                        </button>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="placeholder"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-8 rounded-2xl text-center" style={{ background: surface, border: `1px solid ${border}` }}>
                <img src={lorriLogo} alt="LoRRI" style={{ width: 60, height: 60, objectFit: "contain", opacity: 0.3, margin: "0 auto 16px" }} />
                <div style={{ color: textSub, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Select an agent</div>
                <p style={{ color: textFade, fontSize: 13, lineHeight: 1.7 }}>
                  Click any node to explore capabilities, metrics, and live data flows.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs: feed / ports */}
          <div className="rounded-2xl overflow-hidden" style={{ background: surface, border: `1px solid ${border}` }}>
            <div className="flex border-b border-white/10">
              {[
                { id: "feed",  label: "Live Activity" },
                { id: "ports", label: "⚠ Port Congestion" },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="flex-1 py-3 text-xs font-bold transition-all"
                  style={{
                    background: tab === t.id ? "rgba(255,255,255,0.06)" : "transparent",
                    borderBottom: tab === t.id ? `2px solid ${tab === "ports" ? "#EF4444" : "#00B4D8"}` : "2px solid transparent",
                    color: tab === t.id ? textOn : textFade,
                  }}>
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "feed" && (
              <div className="divide-y divide-white/5">
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={lorriLogo} alt="" style={{ width: 18, height: 18, objectFit: "contain", opacity: 0.6 }} />
                    <span style={{ color: textSub, fontSize: 12, fontWeight: 600 }}>Agent feed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22C55E", animation: "arch-pulse 1.5s ease-in-out infinite" }} />
                    <span style={{ color: "#22C55E", fontSize: 10, fontWeight: 700 }}>STREAMING</span>
                  </div>
                </div>
                <AnimatePresence>
                  {feedItems.map((item, i) => <FeedItem key={`${item.msg}${i}`} item={item} i={i} />)}
                </AnimatePresence>
              </div>
            )}

            {tab === "ports" && <CongestionPanel />}
          </div>
        </div>
      </div>

      {/* ── Bottom agent cards ── */}
      <div className="space-y-4">
        <div style={{ color: textFade, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>All agents</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {AGENTS.map((agent, i) => (
            <motion.button key={agent.id}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              onClick={() => handleClick(agent.id)}
              className="p-4 rounded-xl text-left transition-all"
              style={{
                background: activeAgent === agent.id ? `linear-gradient(135deg, ${agent.color}16 0%, transparent 100%)` : surface,
                border: `1.5px solid ${activeAgent === agent.id ? agent.color : border}`,
                boxShadow: activeAgent === agent.id ? `0 0 24px ${agent.dimGlow}` : "none",
              }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: agent.tagBg, border: `1px solid ${agent.tagBdr}` }}>
                  <img src={agent.img} alt={agent.name} style={{ width: 26, height: 26, objectFit: "contain",
                    filter: activeAgent === agent.id ? `drop-shadow(0 0 4px ${agent.color})` : "none" }} />
                </div>
                <div className="min-w-0">
                  <div className="truncate" style={{ color: textOn, fontWeight: 700, fontSize: 13 }}>{agent.name}</div>
                  <div style={{ color: agent.color, fontSize: 9, fontWeight: 800, letterSpacing: "0.08em" }}>{agent.short}</div>
                </div>
              </div>
              <div style={{ color: textFade, fontSize: 12, lineHeight: 1.6 }}>
                {agent.metrics[0].val} {agent.metrics[0].label.toLowerCase()} · {agent.metrics[1].val} {agent.metrics[1].label.toLowerCase()}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes arch-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  )
}
