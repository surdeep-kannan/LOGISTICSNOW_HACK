import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { colors, typography } from "../styles"
import containerTruck from "../assets/container-truck.png"
import truckMove      from "../assets/truck_move.png"
import shipMoving     from "../assets/ship_moving.png"
import cargoImg       from "../assets/cargo.png"

const surface    = "#332B7A"
const surfaceMid = "#3D3585"
const border     = "rgba(255,255,255,0.1)"
const textOn     = "rgba(255,255,255,0.95)"
const textSub    = "rgba(255,255,255,0.65)"
const textFade   = "rgba(255,255,255,0.35)"

const AGENTS = [
  { id: "procurement",   name: "Procurement",  img: containerTruck, color: "#00B4D8", status: "Booking routes",          val: "2,000+ carriers" },
  { id: "optimization",  name: "Optimization", img: truckMove,      color: "#8B5CF6", status: "Rerouting Hormuz traffic", val: "340 shipments"   },
  { id: "sustainability",name: "ESG",          img: shipMoving,     color: "#22C55E", status: "Calculating Scope 3",      val: "100% tracked"    },
  { id: "intelligence",  name: "Intel Grid",   img: cargoImg,       color: "#F59E0B", status: "Scanning 180+ ports",      val: "50M+ data pts"   },
]

const FEED = [
  { color: "#EF4444", tag: "CRITICAL", msg: "Bandar Abbas halted — 340+ shipments rerouting" },
  { color: "#00B4D8", tag: "SAVED",    msg: "Locked ₹38,900 vs ₹46,200 · Mumbai → Delhi"    },
  { color: "#8B5CF6", tag: "REROUTE",  msg: "Hormuz alt. route secured · Cape of Good Hope"  },
  { color: "#22C55E", tag: "ESG",      msg: "Scope 3 report generated · 38% CO₂ reduced"     },
  { color: "#F59E0B", tag: "ALERT",    msg: "Mundra Port congestion ↑71% · India diversion"  },
  { color: "#00B4D8", tag: "BOOKED",   msg: "Blue Dart secured · 32% below market rate"      },
]

export default function AgentMiniWidget() {
  const navigate     = useNavigate()
  const [feedIdx,    setFeedIdx]    = useState(0)
  const [activeNode, setActiveNode] = useState(0)
  const [requests,   setRequests]   = useState(1284)

  useEffect(() => {
    const t1 = setInterval(() => {
      setFeedIdx(i => (i + 1) % FEED.length)
      setRequests(r => r + Math.floor(Math.random() * 3 + 1))
    }, 2600)
    const t2 = setInterval(() => {
      setActiveNode(n => (n + 1) % AGENTS.length)
    }, 2000)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])

  const current = FEED[feedIdx]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: surface, border: `1px solid ${border}` }}
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${border}` }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.base }}>
              AI Agent Network
            </h2>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
              style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors.success, animation: "agent-pulse 1.5s ease-in-out infinite" }} />
              <span style={{ color: colors.success, fontSize: 9, fontWeight: 800, letterSpacing: "0.1em" }}>ALL ACTIVE</span>
            </div>
            {/* Hormuz crisis badge */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#EF4444", animation: "agent-pulse 1s ease-in-out infinite" }} />
              <span style={{ color: "#FCA5A5", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em" }}>HORMUZ CRISIS</span>
            </div>
          </div>
          <p style={{ color: textSub, fontSize: typography.xs }}>
            {requests.toLocaleString("en-IN")} requests processed · 340+ shipments rerouting
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/agents")}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", color: "#A78BFA" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(139,92,246,0.22)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(139,92,246,0.12)"}
        >
          Full Architecture →
        </button>
      </div>

      <div className="p-5">
        {/* 4 agent nodes */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {AGENTS.map((agent, i) => {
            const isActive = activeNode === i
            return (
              <motion.div key={agent.id}
                animate={{ scale: isActive ? 1.04 : 1 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl p-3 text-center cursor-pointer"
                style={{
                  background: isActive ? `${agent.color}15` : surfaceMid,
                  border: `1px solid ${isActive ? agent.color + "50" : border}`,
                  boxShadow: isActive ? `0 0 16px ${agent.color}20` : "none",
                  transition: "all 0.3s",
                }}
                onClick={() => navigate("/dashboard/agents")}
              >
                {/* Agent image */}
                <div className="flex items-center justify-center mb-2 mx-auto"
                  style={{ width: 36, height: 36 }}>
                  <img src={agent.img} alt={agent.name}
                    style={{
                      width: 32, height: 32, objectFit: "contain",
                      filter: isActive
                        ? `drop-shadow(0 0 6px ${agent.color})`
                        : "brightness(0.55) saturate(0.4)",
                      transition: "filter 0.3s",
                    }}
                  />
                </div>

                {/* Pulse ring when active */}
                {isActive && (
                  <div className="relative flex items-center justify-center mb-1">
                    <motion.div
                      animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                      className="absolute w-3 h-3 rounded-full"
                      style={{ background: agent.color }}
                    />
                    <div className="w-2 h-2 rounded-full" style={{ background: agent.color, position: "relative" }} />
                  </div>
                )}
                {!isActive && (
                  <div className="flex justify-center mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                  </div>
                )}

                <div style={{ color: isActive ? agent.color : textFade, fontSize: 9, fontWeight: 800, letterSpacing: "0.08em" }}>
                  {agent.name}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Active agent status */}
        <AnimatePresence mode="wait">
          <motion.div key={activeNode}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl p-3 mb-4 flex items-center gap-3"
            style={{ background: `${AGENTS[activeNode].color}10`, border: `1px solid ${AGENTS[activeNode].color}25` }}
          >
            <img src={AGENTS[activeNode].img} alt=""
              style={{ width: 28, height: 28, objectFit: "contain", filter: `drop-shadow(0 0 4px ${AGENTS[activeNode].color})`, flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <span style={{ color: AGENTS[activeNode].color, fontSize: 11, fontWeight: 700 }}>
                  {AGENTS[activeNode].name} Agent
                </span>
                <span style={{ color: AGENTS[activeNode].color, fontSize: 9, fontWeight: 800,
                  padding: "1px 6px", borderRadius: 4,
                  background: `${AGENTS[activeNode].color}18`, border: `1px solid ${AGENTS[activeNode].color}30` }}>
                  LIVE
                </span>
              </div>
              <div style={{ color: textSub, fontSize: 11 }}>{AGENTS[activeNode].status}</div>
            </div>
            <div style={{ color: AGENTS[activeNode].color, fontSize: 11, fontWeight: 700, flexShrink: 0, textAlign: "right" }}>
              {AGENTS[activeNode].val}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Live feed ticker */}
        <div className="rounded-xl overflow-hidden" style={{ background: surfaceMid, border: `1px solid ${border}` }}>
          <div className="px-3 py-2 flex items-center gap-2" style={{ borderBottom: `1px solid ${border}` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors.success, animation: "agent-pulse 1.5s ease-in-out infinite" }} />
            <span style={{ color: textFade, fontSize: 9, fontWeight: 800, letterSpacing: "0.1em" }}>LIVE AGENT FEED</span>
          </div>
          <div style={{ padding: "10px 12px", height: 52, overflow: "hidden", position: "relative" }}>
            <AnimatePresence mode="wait">
              <motion.div key={feedIdx}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                style={{ position: "absolute", inset: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  padding: "2px 7px", borderRadius: 4, fontSize: 8, fontWeight: 800,
                  letterSpacing: "0.1em", flexShrink: 0,
                  background: current.color === "#EF4444" ? "rgba(239,68,68,0.2)" : `${current.color}18`,
                  border: `1px solid ${current.color === "#EF4444" ? "rgba(239,68,68,0.4)" : `${current.color}30`}`,
                  color: current.color === "#EF4444" ? "#FCA5A5" : current.color,
                }}>
                  {current.tag}
                </span>
                <span style={{ color: textSub, fontSize: 11, lineHeight: 1.4, flex: 1, minWidth: 0 }}>
                  {current.msg}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes agent-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </motion.div>
  )
}
