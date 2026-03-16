import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { colors, typography } from "../styles"

// ── Real asset imports ────────────────────────────────────
import lorriLogo      from "../assets/lorri.png"
import containerTruck from "../assets/container-truck.png"
import truckMove      from "../assets/truck_move.png"
import shipMoving     from "../assets/ship_moving.png"
import cargoImg       from "../assets/cargo.png"
import leafImg        from "../assets/leaf.png"

const textFade = "rgba(255,255,255,0.3)"
const textSub  = "rgba(255,255,255,0.6)"

const AGENTS = [
  {
    id: "procurement", name: "Procurement Agent", short: "PROCURE",
    img: containerTruck, color: "#00B4D8",
    desc: "Autonomous rate negotiation & lane benchmarking across 2,000+ carriers.",
    metrics: [{ label: "Efficiency", val: "+32%" }, { label: "Carriers", val: "2,000+" }],
    status: "Benchmarking Lanes...",
    signal: [40, 70, 45, 90, 65, 80, 50, 75, 55, 85, 60, 92, 70, 88, 48]
  },
  {
    id: "optimization", name: "Optimization Engine", short: "OPTIMIZE",
    img: truckMove, color: "#8B5CF6",
    desc: "Continuous live rerouting based on port congestion & weather telemetry.",
    metrics: [{ label: "On-time", val: "98.2%" }, { label: "Reroutes", val: "1,420" }],
    status: "Re-routing active...",
    signal: [60, 40, 85, 30, 95, 20, 75, 45, 88, 35, 90, 25, 70, 50, 80]
  },
  {
    id: "sustainability", name: "Sustainability AI", short: "ESG",
    img: shipMoving, color: "#22C55E",
    desc: "Real-time Scope 3 calculation & green alternative recommendations.",
    metrics: [{ label: "CO₂ Saved", val: "38%" }, { label: "Compliance", val: "100%" }],
    status: "Audit in progress...",
    signal: [30, 50, 40, 60, 55, 70, 65, 40, 60, 50, 75, 60, 80, 70, 90]
  },
  {
    id: "intelligence", name: "Global Freight Grid", short: "INTEL",
    img: cargoImg, color: "#F59E0B",
    desc: "Dataset aggregator monitoring 180+ ports & 20,000+ freight lanes.",
    metrics: [{ label: "Data Points", val: "50M+" }, { label: "Latency", val: "12ms" }],
    status: "Grid Syncing...",
    signal: [90, 85, 95, 80, 90, 85, 98, 75, 88, 92, 80, 96, 85, 99, 78]
  },
]

function Waveform({ color, active, agent }) {
  return (
    <div className="flex items-end gap-1 h-12 w-full opacity-40 group-hover:opacity-100 transition-opacity">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i} 
          animate={{ height: active ? [4, agent.signal[i], 4] : [4, 12, 4] }}
          transition={{ 
            duration: 1 + Math.random(), 
            repeat: Infinity, 
            delay: i * 0.1 
          }}
          className="w-1 rounded-full"
          style={{ background: color }}
        />
      ))}
    </div>
  )
}

function Pillar({ agent, active, onClick }) { // receiving agent here
  return (
    <motion.div
      onClick={onClick} 
      layout
      className={`relative flex-1 min-w-[200px] h-[580px] cursor-pointer overflow-hidden transition-all duration-500 ease-out group ${active ? 'flex-[2]' : 'flex-[1]'}`}
      style={{
        background: active ? "rgba(255,255,255,0.03)" : "transparent",
        borderLeft: `1px solid ${active ? agent.color : "rgba(255,255,255,0.05)"}`,
      }}
    >
      {/* Background scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="h-full w-full" style={{ background: `linear-gradient(transparent, ${agent.color} 50%, transparent)`, backgroundSize: '100% 4px' }} />
      </div>
      
      <div className="relative z-10 p-8 h-full flex flex-col">
        {/* Top telemetry */}
        <div className="flex justify-between items-start mb-12">
          <div className="space-y-1">
            <div className={`text-[10px] font-black tracking-widest uppercase ${active ? 'text-white' : 'text-white/20'}`}>
              {agent.short}
            </div>
            <div className={`text-xs font-bold ${active ? 'opacity-100' : 'opacity-40'}`} style={{ color: agent.color }}>
              {agent.status}
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${active ? 'bg-white/10' : 'bg-transparent'}`} style={{ borderColor: active ? agent.color : "rgba(255,255,255,0.1)" }}>
             <img src={agent.img} className={`w-6 h-6 transition-all ${active ? 'grayscale-0 scale-110' : 'grayscale opacity-30 shadow-none'}`} style={{ filter: active ? `drop-shadow(0 0 8px ${agent.color})` : "" }} />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key="active"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <h2 className="text-4xl font-black tracking-tighter leading-none">{agent.name}</h2>
                <p className="text-white/60 text-sm leading-relaxed max-w-[240px]">{agent.desc}</p>
                
                <div className="grid grid-cols-2 gap-8">
                  {agent.metrics.map(m => (
                    <div key={m.label}>
                      <div className="text-[9px] font-black text-white/30 uppercase tracking-widest">{m.label}</div>
                      <div className="text-2xl font-black" style={{ color: agent.color }}>{m.val}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="inactive"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rotate-90 origin-left translate-x-4 whitespace-nowrap"
              >
                <span className="text-4xl font-black tracking-tighter text-white/10 uppercase">{agent.short}_ENGINE</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom waveform */}
        <div className="mt-auto space-y-4">
          <Waveform color={agent.color} active={active} agent={agent} />
          <div className="flex justify-between items-center text-[9px] font-black text-white/20 tracking-[0.2em]">
            <span>LINK_{agent.id.toUpperCase()}_04</span>
            <span className="animate-pulse">ACTIVE_UPLINK</span>
          </div>
        </div>
      </div>

      {/* Active Glow */}
      {active && (
        <motion.div
          layoutId="glow"
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(circle at 0% 0%, ${agent.color}15 0%, transparent 70%)` }}
        />
      )}
    </motion.div>
  )
}

export default function AgentArchitecture() {
  const [activeId, setActiveId] = useState("procurement")
  const [stats, setStats] = useState({ iops: 8429, uptime: "99.98" })

  useEffect(() => {
    const t = setInterval(() => {
      setStats(s => ({ 
        iops: s.iops + Math.floor(Math.random() * 20),
        uptime: (parseFloat(s.uptime) + (Math.random() > 0.99 ? 0.01 : 0)).toFixed(2)
      }))
    }, 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen text-white font-sans overflow-hidden selection:bg-white/20" style={{ background: "#393185" }}>
      
      {/* ── Header HUD ── */}
      <div className="max-w-7xl mx-auto px-8 pt-12 pb-8 border-b border-white/[0.05]">
        <div className="flex justify-between items-end">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="px-2 py-0.5 rounded bg-[#00B4D8]/20 border border-[#00B4D8]/40 text-[#00B4D8] text-[9px] font-black tracking-widest">SYSTEM_LIVE</div>
              <span className="text-white/20 text-[10px] font-black tracking-widest uppercase">LoRRI / Neural Architecture / Diagnostics</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter italic">
              Neural <span className="text-[#00B4D8]">Network</span>
            </h1>
          </div>
          
          <div className="flex gap-16 text-right mb-2">
            <div>
              <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Global Throughput</div>
              <div className="text-3xl font-black tracking-tighter italic">{stats.iops.toLocaleString()} <span className="text-xs text-white/30 not-italic">TPS</span></div>
            </div>
            <div>
              <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">System Health</div>
              <div className="text-3xl font-black tracking-tighter italic" style={{ color: "#22C55E" }}>{stats.uptime}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Pillar Interface ── */}
      <div className="max-w-7xl mx-auto flex h-[620px] border-b border-white/[0.05]">
        {AGENTS.map(a => (
          <Pillar 
            key={a.id} 
            agent={a}  // <-- Passing the `agent` prop here
            active={activeId === a.id} 
            onClick={() => setActiveId(a.id)} 
          />
        ))}
      </div>

      {/* ── Footer Telemetry ── */}
      <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
        <div className="flex gap-8">
           {["SLA_ENFORCED", "CRISIS_RADAR", "EMISSIONS_AUDIT", "RATE_BENCHMARK"].map(t => (
             <div key={t} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#00B4D8] animate-ping" />
                <span className="text-[9px] font-black text-white/40 tracking-widest uppercase">{t}</span>
             </div>
           ))}
        </div>
        <div className="flex items-center gap-4">
           <img src={lorriLogo} className="h-6 opacity-20 hover:opacity-100 transition-opacity cursor-pointer" />
           <div className="w-[1px] h-4 bg-white/10" />
           <span className="text-[10px] font-bold text-white/20 tabular-nums">EST_LOG_2026_MAR_16</span>
        </div>
      </div>

      <style jsx="true">{`
        @keyframes agent-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.95); }
        }
      `}</style>
    </div>
  )
}
