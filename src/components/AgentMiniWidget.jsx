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
    }, 2800)
    const t2 = setInterval(() => {
      setActiveNode(n => (n + 1) % AGENTS.length)
    }, 2200)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])

  const current = FEED[feedIdx]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-[28px] overflow-hidden relative"
      style={{ 
        background: "rgba(30, 24, 86, 0.4)", 
        backdropFilter: "blur(32px) saturate(160%)",
        border: `1.5px solid rgba(255,255,255,0.08)`,
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)"
      }}
    >
      {/* Holographic Scanline Sweep */}
      <motion.div 
        animate={{ y: [-200, 400] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute", left: 0, right: 0, height: 1.5, background: "linear-gradient(90deg, transparent, rgba(0,180,216,0.5), transparent)", zIndex: 10, pointerEvents: "none", opacity: 0.4 }}
      />

      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid rgba(255,255,255,0.06)`, background: "rgba(0,0,0,0.2)" }}>
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h2 style={{ color: textOn, fontWeight: 900, fontSize: 15, letterSpacing: "-0.01em" }}>
              NEURAL UPLINK
            </h2>
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-md"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22C55E", boxShadow: "0 0 8px #22C55E", animation: "agent-pulse 1.5s infinite" }} />
              <span style={{ color: "#22C55E", fontSize: 9, fontWeight: 900, letterSpacing: "0.15em" }}>OPERATIONAL</span>
            </div>
          </div>
          <p style={{ color: textFade, fontSize: 10, fontWeight: 600, letterSpacing: "0.02em" }}>
            {requests.toLocaleString("en-IN")} PACKETS PROCESSED · CORE LOAD LEVEL 04
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/architecture")}
          style={{ 
            background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, 
            color: textOn, padding: "6px 12px", borderRadius: 10, fontSize: 10, fontWeight: 800, transition: "all 0.2s"
          }}
          className="hover:bg-white/[0.1] active:scale-95"
        >
          EXPLORE CORE
        </button>
      </div>

      <div className="p-6">
        {/* 4 agent nodes — Redesigned as Core units */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {AGENTS.map((agent, i) => {
            const isActive = activeNode === i
            return (
              <motion.div key={agent.id}
                onClick={() => navigate("/dashboard/architecture")}
                className="relative flex flex-col items-center cursor-pointer group"
              >
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
                  style={{
                    background: isActive ? `${agent.color}25` : "rgba(0,0,0,0.3)",
                    border: `1.5px solid ${isActive ? agent.color : "rgba(255,255,255,0.08)"}`,
                    boxShadow: isActive ? `0 0 20px ${agent.color}20` : "none",
                    position: "relative", zIndex: 2
                  }}
                >
                  <img src={agent.img} alt={agent.name}
                    style={{
                      width: 28, height: 28, objectFit: "contain",
                      filter: isActive ? `drop-shadow(0 0 8px ${agent.color})` : "grayscale(0.8) brightness(0.6)",
                      transition: "all 0.3s"
                    }}
                  />
                  {isActive && (
                    <motion.div 
                      layoutId="active-glow"
                      className="absolute inset-0 rounded-2xl"
                      style={{ border: `2px solid ${agent.color}`, opacity: 0.5 }}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
                <div className="mt-2.5">
                  <span style={{ 
                    color: isActive ? agent.color : textFade, 
                    fontSize: 8, fontWeight: 950, letterSpacing: "0.14em", textTransform: "uppercase" 
                  }}>
                    {agent.name.split(' ')[0]}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Active Node Intelligence Detail */}
        <AnimatePresence mode="wait">
          <motion.div key={activeNode}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
            className="rounded-2xl p-4 mb-6 relative overflow-hidden"
            style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${AGENTS[activeNode].color}30` }}
          >
            <div style={{ position: "absolute", top: 0, right: 0, padding: 8 }}>
              <SignalIcon style={{ width: 14, height: 14, color: AGENTS[activeNode].color, opacity: 0.4 }} />
            </div>
            
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" 
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${AGENTS[activeNode].color}50` }}>
                <img src={AGENTS[activeNode].img} alt="" style={{ width: 34, height: 34, filter: `drop-shadow(0 0 10px ${AGENTS[activeNode].color})` }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color: textOn, fontSize: 13, fontWeight: 900 }}>{AGENTS[activeNode].name}</span>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: AGENTS[activeNode].color, boxShadow: `0 0 8px ${AGENTS[activeNode].color}` }} />
                </div>
                <div className="truncate" style={{ color: textSub, fontSize: 11, fontWeight: 500 }}>{AGENTS[activeNode].status}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span style={{ color: textFade, fontSize: 9, fontWeight: 800, letterSpacing: "0.05em" }}>TELEMETRY.VAL</span>
                  <span style={{ color: AGENTS[activeNode].color, fontSize: 12, fontWeight: 950, fontFamily: "monospace" }}>{AGENTS[activeNode].val}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Live System Log Ticker */}
        <div className="rounded-2xl overflow-hidden border border-white/[0.05]" style={{ background: "rgba(0,0,0,0.2)" }}>
          <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
            <div className="flex items-center gap-2">
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22C55E" }} />
              <span style={{ color: textFade, fontSize: 9, fontWeight: 900, letterSpacing: "0.15em" }}>SYSTEM_ENGINE.STREAM</span>
            </div>
            <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 8, fontFamily: "monospace" }}>SEC_LINK_08</span>
          </div>
          <div style={{ padding: "14px 16px", height: 60, position: "relative", overflow: "hidden" }}>
            <AnimatePresence mode="wait">
              <motion.div key={feedIdx}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                style={{ position: "absolute", inset: "14px 16px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ 
                  flexShrink: 0, padding: "2px 8px", borderRadius: 4, fontSize: 9, fontWeight: 900, 
                  background: current.color === "#EF4444" ? "rgba(239,68,68,0.2)" : `${current.color}15`,
                  border: `1px solid ${current.color === "#EF4444" ? "rgba(239,68,68,0.4)" : `${current.color}30`}`,
                  color: current.color === "#EF4444" ? "#FCA5A5" : current.color 
                }}>
                  {current.tag}
                </div>
                <div style={{ color: textSub, fontSize: 11, lineHeight: 1.5, flex: 1, fontWeight: 500 }}>{current.msg}</div>
              </motion.div>
            </AnimatePresence>
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 40, background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.2))", pointerEvents: "none" }} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function SignalIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}
