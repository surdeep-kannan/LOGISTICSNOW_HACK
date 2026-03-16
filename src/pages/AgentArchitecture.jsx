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

const surface    = "rgba(51, 43, 122, 0.6)"
const surfaceMid = "rgba(61, 53, 133, 0.85)"
const border     = "rgba(255,255,255,0.12)"
const textOn     = "rgba(255,255,255,1)"
const textSub    = "rgba(255,255,255,0.7)"
const textFade   = "rgba(255,255,255,0.4)"

function FloatingObjects() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {[...Array(6)].map((_, i) => (
        <motion.div key={i}
          initial={{ x: Math.random() * 800, y: Math.random() * 500, opacity: 0 }}
          animate={{ 
            x: [null, Math.random() * 800], 
            y: [null, Math.random() * 500],
            opacity: [0, 0.6, 0]
          }}
          transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "linear" }}
          style={{ 
            position: "absolute", width: 2, height: 2, 
            borderRadius: "50%", background: "#00B4D8", filter: "blur(1px)" 
          }}
        />
      ))}
    </div>
  )
}
const primaryAccent = "#00B4D8"

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

function curvePath(fromId, toId) {
  const f = POS[fromId]
  const t = POS[toId]
  const cx = CX
  const cy = CY
  return `M ${f.x} ${f.y} Q ${cx} ${cy} ${t.x} ${t.y}`
}

function ConnectionLine({ conn, activeAgent }) {
  const isActive = activeAgent === conn.from || activeAgent === conn.to
  const target = AGENTS.find(a => a.id === conn.to)
  return (
    <g>
      <path d={curvePath(conn.from, conn.to)} fill="none"
        stroke={isActive ? target.color : "rgba(255,255,255,0.08)"}
        strokeWidth={isActive ? 1.5 : 0.8}
        strokeDasharray={isActive ? "none" : "4 8"}
        style={{ transition: "stroke 0.4s, stroke-width 0.4s" }}
      />
      {isActive && (
        <path d={curvePath(conn.from, conn.to)} fill="none"
          stroke={target.color} strokeWidth="1.5" strokeDasharray="160 500" strokeDashoffset="0"
          opacity="0.8">
          <animate attributeName="stroke-dashoffset" from="660" to="0" dur="4s" repeatCount="indefinite" />
        </path>
      )}
    </g>
  )
}

// Removed PulseDot component to eliminate animation lag

function AgentNode({ agent, isActive, dimmed, onClick }) {
  const pos = POS[agent.id]
  const opacity = dimmed ? 0.35 : 1
  return (
    <g style={{ cursor: "pointer", transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)" }} opacity={opacity} onClick={onClick}>
      {/* Outer focus rings */}
      {isActive && (
        <>
          <circle cx={pos.x} cy={pos.y} r={R + 24} fill="none"
            stroke={agent.color} strokeWidth="0.8" strokeDasharray="4 6" opacity="0.3" />
          <circle cx={pos.x} cy={pos.y} r={R + 12} fill="none"
            stroke={agent.color} strokeWidth="1.2" opacity="0.2" />
        </>
      )}
      
      {/* Node Shadow / Glow */}
      <defs>
        <radialGradient id={`glow-${agent.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={agent.color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={agent.color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={pos.x} cy={pos.y} r={R + 30} fill={`url(#glow-${agent.id})`} opacity={isActive ? 1 : 0.4} />

      {/* Main Glass Circle */}
      <circle cx={pos.x} cy={pos.y} r={R}
        fill={isActive ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)"}
        stroke={isActive ? agent.color : "rgba(255,255,255,0.1)"} 
        strokeWidth={isActive ? 3 : 1.5}
        style={{ transition: "all 0.4s" }}
      />
      
      {/* Inner decorative circle */}
      <circle cx={pos.x} cy={pos.y} r={R - 10} fill="none"
        stroke={agent.color} strokeWidth="0.5" opacity={isActive ? 0.6 : 0.1}
      />

      <foreignObject
        x={pos.x - agent.imgSize / 2} y={pos.y - agent.imgSize / 2 - 6}
        width={agent.imgSize} height={agent.imgSize}
        style={{ pointerEvents: "none" }}>
        <img src={agent.img} alt={agent.name} style={{
          width: agent.imgSize, height: agent.imgSize, objectFit: "contain",
          filter: isActive ? `drop-shadow(0 0 12px ${agent.color})` : "grayscale(0.6) brightness(0.7)",
          transform: isActive ? "scale(1.1) translateY(-2px)" : "scale(1)",
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }} />
      </foreignObject>

      <text x={pos.x} y={pos.y + agent.imgSize / 2 + 10}
        textAnchor="middle" fontSize="11" fontWeight="1000" letterSpacing="0.18em"
        fill={isActive ? agent.color : "rgba(255,255,255,0.3)"}
        style={{ transition: "all 0.4s", pointerEvents: "none", textShadow: isActive ? `0 0 12px ${agent.color}` : "none" }}>
        {agent.short}
      </text>

      {/* Connection terminal dots */}
      <circle cx={pos.x} cy={pos.y} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="1 10" />
    </g>
  )
}

function CenterHub({ activeAgent }) {
  const active = AGENTS.find(a => a.id === activeAgent)
  return (
    <g>
      <circle cx={CX} cy={CY} r={52} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 8" />
      <circle cx={CX} cy={CY} r={40} fill="#1E1856"
        stroke={active ? active.color : "rgba(255,255,255,0.12)"}
        strokeWidth="1.5" style={{ transition: "stroke 0.4s" }} />
      <circle cx={CX} cy={CY} r={33} fill="none"
        stroke={active ? active.color : "rgba(255,255,255,0.05)"}
        strokeWidth="0.5" style={{ transition: "stroke 0.4s" }} />
      <foreignObject x={CX - 28} y={CY - 28} width={56} height={56} style={{ pointerEvents: "none" }}>
        <img src={lorriLogo} alt="LoRRI" style={{
          width: 56, height: 56, objectFit: "contain",
          filter: active
            ? `drop-shadow(0 0 8px ${active.color}) brightness(1.2)`
            : "brightness(0.7) saturate(0.6)",
          transition: "all 0.4s",
          transform: active ? "scale(1.08)" : "scale(1)",
          animation: active ? "center-breathe 2.5s ease-in-out infinite" : "none"
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
      <div className="space-y-5">
        <nav className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-[#00B4D8]/60 uppercase">
          <span className="hover:text-[#00B4D8] cursor-pointer transition-colors">DASHBOARD</span>
          <span className="text-white/20">/</span>
          <span className="text-white/90">AI CORE <span className="text-[#8B5CF6]">(BRAIN)</span></span>
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 style={{ 
              color: "#fff", 
              fontSize: "32px", 
              fontWeight: 950, 
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              textShadow: "0 0 30px rgba(0,180,216,0.3)" 
            }}>
              AI Agent <span style={{ background: "linear-gradient(to right, #00B4D8, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Architecture</span>
            </h1>
            <p style={{ color: textFade, fontSize: "14px", marginTop: "4px" }}>
              Four autonomous agents managing global disruptions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(0,180,216,0.08)", border: "1px solid rgba(0,180,216,0.2)", backdropFilter: "blur(8px)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22C55E", animation: "arch-pulse 1s ease-in-out infinite" }} />
              <span style={{ color: "#00B4D8", fontSize: 10, fontWeight: 900, letterSpacing: "0.12em" }}>
                SYSTEM ONLINE · 4 AGENTS
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", backdropFilter: "blur(8px)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#EF4444", animation: "arch-pulse 0.8s ease-in-out infinite" }} />
              <span style={{ color: "#FCA5A5", fontSize: 10, fontWeight: 900, letterSpacing: "0.12em" }}>
                CRISIS: HORMUZ STRAIT
              </span>
            </div>
          </div>
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
          <div key={s.label} className="p-5 rounded-2xl relative overflow-hidden group transition-all hover:scale-[1.02]"
            style={{ 
              background: "rgba(255,255,255,0.03)", 
              backdropFilter: "blur(12px)",
              border: `1px solid ${s.color === "#EF4444" ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)"}`,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}>
            {/* Background Glow */}
            <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "50%", height: "50%", background: s.color, filter: "blur(40px)", opacity: 0.1, pointerEvents: "none" }} />
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                <img src={s.img} alt="" style={{ width: 22, height: 22, objectFit: "contain", filter: `drop-shadow(0 0 4px ${s.color})` }} />
              </div>
              <div style={{ color: textFade, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {s.label}
              </div>
            </div>
            <div style={{ color: s.color, fontSize: 24, fontWeight: 950, letterSpacing: "-0.03em" }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* ── Main layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

        {/* SVG diagram — Col span 2 ── */}
        <div className="xl:col-span-2 rounded-2xl overflow-hidden relative"
          style={{ 
            background: "radial-gradient(circle at 50% 50%, #1A1440 0%, #0F092A 100%)", 
            border: `1px solid ${border}`,
            boxShadow: "inset 0 0 100px rgba(0,0,0,0.8)",
            minHeight: "520px"
          }}>
          
          <FloatingObjects />

          {/* Scanline Effect */}
          <div style={{
            position: "absolute", inset: 0, 
            background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.15) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))",
            backgroundSize: "100% 3px, 3px 100%", pointerEvents: "none", zIndex: 10, opacity: 0.3
          }} />

          {/* Subtle Radar/Grid background Pattern */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.2, pointerEvents: "none" }}>
            <svg width="100%" height="100%">
               <pattern id="radarGrid" width="80" height="80" patternUnits="userSpaceOnUse">
                 <circle cx="40" cy="40" r="1.5" fill="#00B4D8" opacity="0.4" />
                 <path d="M 80 40 L 0 40 M 40 0 L 40 80" stroke="rgba(0,180,216,0.15)" strokeWidth="0.5" />
               </pattern>
               <rect width="100%" height="100%" fill="url(#radarGrid)" />

               {/* Large concentric rings */}
               <circle cx="50%" cy="50%" r="160" fill="none" stroke="rgba(0,180,216,0.06)" strokeWidth="1" />
               <circle cx="50%" cy="50%" r="280" fill="none" stroke="rgba(0,180,216,0.04)" strokeWidth="1" />
               <circle cx="50%" cy="50%" r="400" fill="none" stroke="rgba(0,180,216,0.02)" strokeWidth="1" />
            </svg>
          </div>

          <svg width="100%" viewBox={`-40 0 ${SVG_W + 80} ${SVG_H}`} style={{ display: "block", position: "relative", zIndex: 5 }}>
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

            {/* Static lines replace the animated flowing dots */}

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
              <motion.div key={selected.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                className="rounded-3xl overflow-hidden relative"
                style={{ 
                  background: "rgba(10, 8, 32, 0.4)", 
                  backdropFilter: "blur(40px) saturate(180%)",
                  border: `1.5px solid ${selected.color}60`,
                  boxShadow: `0 30px 100px rgba(0,0,0,0.8), 0 0 40px ${selected.color}15`,
                  minHeight: "520px", display: "flex", flexDirection: "column"
                }}>
                
                {/* Holographic Scanning Scanline */}
                <motion.div 
                  animate={{ y: [0, 520, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  style={{ position: "absolute", left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${selected.color}, transparent)`, opacity: 0.3, zIndex: 10, pointerEvents: "none" }}
                />

                {/* Tactical Header */}
                <div style={{
                  padding: "28px 24px",
                  background: `linear-gradient(135deg, ${selected.color}25 0%, transparent 80%)`,
                  borderBottom: `1px solid rgba(255,255,255,0.08)`,
                  position: "relative"
                }}>
                  <div className="flex items-center gap-5">
                    <div style={{ 
                      width: 72, height: 72, borderRadius: 22, flexShrink: 0, 
                      background: selected.tagBg, border: `1.5px solid ${selected.tagBdr}`, 
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: `0 12px 30px rgba(0,0,0,0.3)`
                    }}>
                      <img src={selected.img} alt={selected.name} style={{ width: 44, height: 44, objectFit: "contain", filter: `drop-shadow(0 0 10px ${selected.color})` }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: textOn, fontWeight: 950, fontSize: 20, letterSpacing: "-0.02em", textTransform: "uppercase" }}>{selected.short} CORE</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 8px #22C55E" }} />
                        <span style={{ color: "#22C55E", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em" }}>NEURAL SYNC CRYSTALIZED</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-7 flex-1">
                  {/* Thought Stream */}
                  <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", padding: 12 }}>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div style={{ color: selected.color, fontSize: 9, fontWeight: 900, letterSpacing: "0.1em" }}>THOUGHT_STREAM.LOG</div>
                      <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 8, fontFamily: "monospace" }}>0xC42A9...</div>
                    </div>
                    <div className="space-y-1.5 h-20 overflow-hidden relative">
                      {[
                        `INITIALIZING ${selected.short} ARCHITECTURE...`,
                        `BENCHMARKING 6,200+ DATA VECTORS...`,
                        `NEURAL WEIGHTS OPTIMIZED AT 99.2%`,
                        `DECODING SUB-LAYER TELEMETRY...`,
                        `ACTIVE HUB CLUSTER DETECTED: ASIA-PAC`
                      ].map((log, i) => (
                        <motion.div key={i}
                          initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                          style={{ color: i === 4 ? selected.color : "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.02em" }}>
                          <span style={{ opacity: 0.3 }}>[{new Date().toLocaleTimeString('en-US', { hour12: false })}]</span> {log}
                        </motion.div>
                      ))}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent, rgba(10,8,30,0.8))" }} />
                    </div>
                  </div>

                  {/* Core Metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    {selected.metrics.map((m, i) => (
                      <div key={m.label} style={{ padding: "14px 10px", borderRadius: 18, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                        <div style={{ color: selected.color, fontWeight: 950, fontSize: 18, letterSpacing: "-0.02em" }}>{m.val}</div>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 8, fontWeight: 800, textTransform: "uppercase", marginTop: 4 }}>{m.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Operational Tasks */}
                  <div className="space-y-2.5">
                    {selected.tasks.slice(0, 3).map((task, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div style={{ width: 12, height: 12, borderRadius: 4, border: `1px solid ${selected.color}60`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <motion.div animate={{ scale: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }} style={{ width: 4, height: 4, borderRadius: "50%", background: selected.color }} />
                        </div>
                        <span style={{ color: textSub, fontSize: 13, fontWeight: 600 }}>{task}</span>
                        <div style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.2)", fontWeight: 700 }}>PROCESSED</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tactical Footer */}
                <div className="px-6 py-5 bg-black/30 border-t border-white/5 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {selected.dataFlows.map(id => {
                      const t = AGENTS.find(a => a.id === id);
                      return (
                        <div key={id} style={{ width: 24, height: 24, borderRadius: 7, background: t.tagBg, border: `1px solid ${t.tagBdr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img src={t.img} alt="" style={{ width: 14, height: 14, objectFit: "contain" }} />
                        </div>
                      )
                    })}
                  </div>
                  <button onClick={() => setActiveAgent(null)}
                    style={{ background: `${selected.color}20`, border: `1px solid ${selected.color}40`, color: selected.color, padding: "6px 14px", borderRadius: 10, fontSize: 10, fontWeight: 900, letterSpacing: "0.05em" }}>
                    RELEASE UNIT
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="placeholder"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="rounded-3xl overflow-hidden relative"
                style={{ 
                  background: "rgba(15, 12, 50, 0.3)", 
                  backdropFilter: "blur(20px)",
                  border: `1.5px solid ${border}`,
                  padding: "60px 24px",
                  textAlign: "center",
                  minHeight: "520px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                
                {/* Visual Core Diagnostic */}
                <div style={{ position: "relative", marginBottom: 30 }}>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    style={{ position: "absolute", inset: -40, border: "1px dashed rgba(255,255,255,0.05)", borderRadius: "50%" }}
                  />
                  <div style={{ position: "relative", zIndex: 2 }}>
                    <div style={{ width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,180,216,0.1) 0%, transparent 70%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <motion.img 
                        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        src={lorriLogo} alt="LoRRI" style={{ width: 64, height: 64, objectFit: "contain", filter: "brightness(0.6) grayscale(0.5)" }} 
                      />
                    </div>
                  </div>
                  
                  {/* Floating Hexagon Grid */}
                  <div style={{ position: "absolute", inset: -60, pointerEvents: "none", opacity: 0.1 }}>
                    <svg width="100%" height="100%" viewBox="0 0 200 200">
                      <path d="M100 20 L160 55 L160 125 L100 160 L40 125 L40 55 Z" fill="none" stroke="white" strokeWidth="0.5" />
                      <path d="M100 40 L140 65 L140 115 L100 140 L60 115 L60 65 Z" fill="none" stroke="white" strokeWidth="0.5" />
                    </svg>
                  </div>
                </div>

                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 900, letterSpacing: "0.2em", marginBottom: 12 }}>NEURAL HUB OFFLINE</div>
                <h3 style={{ color: textOn, fontSize: 20, fontWeight: 950, marginBottom: 14, letterSpacing: "-0.01em" }}>LoRRI CORE</h3>
                <p style={{ color: textFade, fontSize: 13, lineHeight: 1.7, maxWidth: 280, fontWeight: 500 }}>
                  Select an agent entity from the neural map to establish a deep intelligence uplink.
                </p>

                <div className="mt-12 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, fontWeight: 900, letterSpacing: "0.1em" }}>READY FOR INTERROGATION</div>
                </div>
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
              className="p-5 rounded-2xl text-left transition-all hover:translate-y-[-4px]"
              style={{
                background: activeAgent === agent.id ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                backdropFilter: "blur(10px)",
                border: `1.5px solid ${activeAgent === agent.id ? agent.color : border}`,
                boxShadow: activeAgent === agent.id ? `0 15px 35px rgba(0,0,0,0.3), 0 0 20px ${agent.dimGlow}` : "none",
              }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: agent.tagBg, border: `1px solid ${agent.tagBdr}` }}>
                  <img src={agent.img} alt={agent.name} style={{ width: 28, height: 28, objectFit: "contain",
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
        @keyframes center-breathe {
          0%, 100% { filter: brightness(1.2) drop-shadow(0 0 8px currentColor); transform: scale(1.08); }
          50%       { filter: brightness(1.4) drop-shadow(0 0 15px currentColor); transform: scale(1.15); }
        }
      `}</style>
    </div>
  )
}
