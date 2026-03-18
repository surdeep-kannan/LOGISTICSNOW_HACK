import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { colors, typography } from "../styles"

// ── Real asset imports ────────────────────────────────────
import lorriLogo      from "../assets/lorri.png"
import containerTruck from "../assets/container-truck.png"
import truckMove      from "../assets/truck_move.png"
import shipMoving     from "../assets/ship_moving.png"
import cargoImg       from "../assets/cargo.png"

const textFade = "rgba(255,255,255,0.3)"
const textSub  = "rgba(255,255,255,0.6)"

const AGENTS = [
  {
    id: "procurement", name: "Procurement Agent", short: "PROCURE",
    img: containerTruck, color: "#00B4D8",
    desc: "Autonomous rate negotiation & lane benchmarking across 2,000+ carriers.",
    metrics: [{ label: "Efficiency", val: "+32%" }, { label: "Carriers Active", val: "2,041" }],
    status: "Benchmarking Lanes...",
    signal: [40, 70, 45, 90, 65, 80, 50, 75, 55, 85, 60, 92, 70, 88, 48],
    logs: [
      "SYN_ACK: Carriers established",
      "Parsing 4,500 rate sheets...",
      "Negotiating lane BOM->DXB",
      "Benchmarking yield parameters",
      "Optimizing contract spot rates",
      "Executing smart procurement 0x9A",
      "Validating logistics compliance"
    ]
  },
  {
    id: "optimization", name: "Optimization Engine", short: "OPTIMIZE",
    img: truckMove, color: "#8B5CF6",
    desc: "Continuous live rerouting based on port congestion & weather telemetry.",
    metrics: [{ label: "On-time Probability", val: "98.2%" }, { label: "Reroutes EXCD", val: "1,420" }],
    status: "Re-routing active...",
    signal: [60, 40, 85, 30, 95, 20, 75, 45, 88, 35, 90, 25, 70, 50, 80],
    logs: [
      "Geospatial routing matrix loaded",
      "Weather anomaly detected at JNPT",
      "Initiating vessel rerouting proc",
      "Calculating transit ETA delta",
      "Congestion warning: High severity",
      "Dynamic load balancing complete",
      "Syncing telemetry to satellite array"
    ]
  },
  {
    id: "sustainability", name: "Sustainability AI", short: "ESG",
    img: shipMoving, color: "#22C55E",
    desc: "Real-time Scope 3 calculation & green alternative recommendations.",
    metrics: [{ label: "CO₂ Offset Ratio", val: "38%" }, { label: "ESG Compliance", val: "100%" }],
    status: "Audit in progress...",
    signal: [30, 50, 40, 60, 55, 70, 65, 40, 60, 50, 75, 60, 80, 70, 90],
    logs: [
      "Calculating Scope 3 emissions...",
      "Analyzing bio-fuel alternatives",
      "Green corridor routing enabled",
      "Offsetting 4,200kg CO2 footprint",
      "Cross-checking EU regulations",
      "Validating carbon credit ledger",
      "Sustainability audit: PASSED"
    ]
  },
  {
    id: "intelligence", name: "Global Freight Grid", short: "INTEL",
    img: cargoImg, color: "#F59E0B",
    desc: "Dataset aggregator monitoring 180+ ports & 20,000+ freight lanes.",
    metrics: [{ label: "Node Data Pts", val: "50M+" }, { label: "Grid Latency", val: "12ms" }],
    status: "Grid Syncing...",
    signal: [90, 85, 95, 80, 90, 85, 98, 75, 88, 92, 80, 96, 85, 99, 78],
    logs: [
      "Syncing global intelligence grid...",
      "Ingesting 1.2M market data pts",
      "Cross-referencing maritime APIs",
      "Updating predictive lane models",
      "Neural weight adjustment +0.02",
      "Establishing predictive baselines",
      "Model accuracy verified: 99.4%"
    ]
  },
]

function TerminalLogs({ active, agent }) {
  const [activeLogs, setActiveLogs] = useState([])

  useEffect(() => {
    if (!active) {
      setActiveLogs([])
      return
    }
    
    // Simulate high-speed processing
    let count = 0
    const interval = setInterval(() => {
      const ms = new Date().getMilliseconds().toString().padStart(3, '0')
      const hex = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0')
      const msg = agent.logs[Math.floor(Math.random() * agent.logs.length)]
      
      const newLog = `[${hex}:${ms}] ${msg}`
      setActiveLogs(prev => [...prev.slice(-3), newLog])
      count++
    }, 800)
    
    return () => clearInterval(interval)
  }, [active, agent])

  if (!active) return null

  return (
    <div className="mt-6 flex flex-col font-mono text-[9px] lg:text-[11px] h-[64px] lg:h-[80px] overflow-hidden relative">
      <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-[#0F0B29] to-transparent z-10" />
      <AnimatePresence>
        {activeLogs.map((log, i) => (
          <motion.div
            key={log + i}
            initial={{ opacity: 0, x: -10, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="truncate"
            style={{ color: agent.color, opacity: 0.8 }}
          >
            <span className="text-white/30 mr-2">{'>'}</span>{log}
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[#0F0B29] to-transparent z-10" />
    </div>
  )
}

function Waveform({ color, active, agent }) {
  return (
    <div className="flex items-end gap-1 h-8 lg:h-12 w-full opacity-40 group-hover:opacity-100 transition-opacity">
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

function ProcessingRing({ color }) {
  return (
    <motion.svg animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="none" stroke={color} strokeWidth="1" strokeDasharray="10 10" opacity="0.3" />
      <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="2" strokeDasharray="5 20" opacity="0.6" />
      <circle cx="50" cy="50" r="36" fill="none" stroke={color} strokeWidth="0.5" strokeDasharray="2 4" opacity="0.4" />
    </motion.svg>
  )
}

function Pillar({ agent, active, onClick }) {
  return (
    <motion.div
      onClick={onClick} 
      layout
      className={`relative cursor-pointer overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group 
        ${active ? 'h-[500px] lg:h-[580px] lg:flex-[2]' : 'h-[100px] lg:h-[580px] lg:flex-[1]'}
        border-b lg:border-b-0 lg:border-l
      `}
      style={{
        background: active ? "rgba(255,255,255,0.02)" : "transparent",
        borderColor: active ? agent.color : "rgba(255,255,255,0.05)",
      }}
    >
      {/* Background Grid & Scanline */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] lg:opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="h-full w-full" style={{ background: `linear-gradient(transparent, ${agent.color} 50%, transparent)`, backgroundSize: '100% 4px' }} />
      </div>
      
      <div className="relative z-10 p-5 lg:p-8 h-full flex flex-col">
        {/* Top telemetry & Icon Header */}
        <div className="flex justify-between items-start mb-4 lg:mb-12">
          <div className="space-y-1">
            <div className={`text-[10px] font-black tracking-widest uppercase transition-colors ${active ? 'text-white' : 'text-white/20'}`}>
              [ {agent.short}_NODE ]
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${active ? 'animate-pulse' : ''}`} style={{ background: active ? agent.color : 'rgba(255,255,255,0.1)' }} />
              <div className={`text-xs font-mono font-bold ${active ? 'opacity-100' : 'opacity-40'}`} style={{ color: agent.color }}>
                {agent.status}
              </div>
            </div>
          </div>
          
          <div className="relative w-12 h-12 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center transition-all bg-black/20 border z-10" style={{ borderColor: active ? agent.color : "rgba(255,255,255,0.1)", boxShadow: active ? `0 0 20px ${agent.color}30 inset` : 'none' }}>
            {active && <ProcessingRing color={agent.color} />}
            <img src={agent.img} className={`w-6 h-6 lg:w-8 lg:h-8 transition-all duration-700 ${active ? 'grayscale-0 scale-110' : 'grayscale opacity-30 shadow-none'}`} style={{ filter: active ? `drop-shadow(0 0 10px ${agent.color})` : "" }} />
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
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                className="space-y-6 lg:space-y-8"
              >
                <div>
                  <h2 className="text-3xl lg:text-5xl font-black tracking-tighter leading-none mb-3" style={{ textShadow: `0 0 40px ${agent.color}50` }}>{agent.name}</h2>
                  <p className="text-white/70 text-xs lg:text-sm leading-relaxed max-w-[260px] border-l-2 pl-3" style={{ borderColor: agent.color }}>{agent.desc}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6 lg:gap-8 p-4 rounded-xl bg-black/20 border border-white/5 backdrop-blur-sm">
                  {agent.metrics.map(m => (
                    <div key={m.label}>
                      <div className="text-[8px] lg:text-[9px] font-black text-white/40 uppercase tracking-widest tabular-nums mb-1">{m.label}</div>
                      <div className="text-xl lg:text-2xl font-black tracking-tight" style={{ color: agent.color, textShadow: `0 0 15px ${agent.color}40` }}>{m.val}</div>
                    </div>
                  ))}
                </div>

                <TerminalLogs active={active} agent={agent} />

              </motion.div>
            ) : (
              <motion.div
                key="inactive"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="hidden lg:flex flex-col items-center rotate-90 origin-left translate-x-[4.5rem] whitespace-nowrap opacity-40 hover:opacity-100 transition-opacity"
              >
                <span className="text-2xl font-black tracking-[0.2em] text-white/30 uppercase">{agent.short}_ENGINE</span>
                <span className="text-[10px] font-mono tracking-widest text-[#00B4D8]/50 mt-2">AWAITING_UPLINK</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom waveform */}
        {active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-auto space-y-4 hidden lg:block">
            <Waveform color={agent.color} active={active} agent={agent} />
            <div className="flex justify-between items-center text-[9px] font-black text-white/30 tracking-[0.2em] uppercase">
              <span>NET_IFACE_{agent.id.substring(0,4)}</span>
              <span className="animate-pulse flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{ background: agent.color }}/> STREAM_SYNCED</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Active Intense Glow */}
      {active && (
        <motion.div
          layoutId="glow"
          className="absolute inset-0 pointer-events-none mix-blend-screen"
          style={{ background: `radial-gradient(circle at -20% 50%, ${agent.color}25 0%, transparent 60%)` }}
        />
      )}
    </motion.div>
  )
}

export default function AgentArchitecture() {
  const [activeId, setActiveId] = useState("procurement")
  const [stats, setStats] = useState({ iops: 8429, uptime: "99.988", temp: 42.4 })

  useEffect(() => {
    const t = setInterval(() => {
      setStats(s => ({ 
        iops: s.iops + Math.floor(Math.random() * 400 - 150),
        uptime: (parseFloat(s.uptime) + (Math.random() > 0.95 ? 0.001 : 0)).toFixed(3),
        temp: (parseFloat(s.temp) + (Math.random() * 0.4 - 0.2)).toFixed(1)
      }))
    }, 1500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen text-white font-sans overflow-hidden selection:bg-[#00B4D8]/30 relative" style={{ background: "#0F0B29" }}>
      
      {/* Background Deep Space / Brain aura */}
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{ background: 'radial-gradient(ellipse at top right, #39318540 0%, transparent 50%), radial-gradient(ellipse at bottom left, #00B4D820 0%, transparent 50%)' }} />

      {/* ── Header HUD ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 pt-8 lg:pt-12 pb-6 lg:pb-8 border-b border-indigo-500/20 backdrop-blur-md bg-[#0F0B29]/80">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 lg:gap-0">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-2 py-0.5 rounded bg-[#00B4D8]/20 border border-[#00B4D8]/40 text-[#00B4D8] text-[9px] font-black tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#00B4D8] rounded-full animate-ping" /> CORE_ONLINE</div>
              <span className="text-indigo-300 text-[10px] font-mono tracking-widest uppercase">LoRRI / Global Neural Architecture</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter shadow-sm flex flex-col">
              <span className="text-white/90">Autonomous</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B4D8] to-indigo-500 italic mt-[-5px]">Brain Kernel</span>
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-8 lg:gap-16 text-left lg:text-right w-full lg:w-auto p-4 lg:p-0 bg-white/5 lg:bg-transparent rounded-2xl lg:rounded-none border lg:border-none border-white/10">
            <div>
              <div className="text-[9px] font-black text-indigo-300/60 font-mono uppercase tracking-[0.2em] mb-1">Global Throughput</div>
              <div className="text-3xl lg:text-4xl font-black tracking-tighter font-mono" style={{ color: "#E0E7FF", textShadow: '0 0 15px rgba(224,231,255,0.3)' }}>{stats.iops.toLocaleString()} <span className="text-xs text-indigo-400 not-italic">TPS</span></div>
            </div>
            <div>
              <div className="text-[9px] font-black text-indigo-300/60 font-mono uppercase tracking-[0.2em] mb-1">Core Temp</div>
              <div className="text-3xl lg:text-4xl font-black tracking-tighter font-mono" style={{ color: "#F59E0B", textShadow: '0 0 15px rgba(245,158,11,0.3)' }}>{stats.temp}°C</div>
            </div>
            <div>
               <div className="text-[9px] font-black text-indigo-300/60 font-mono uppercase tracking-[0.2em] mb-1">Uptime SLA</div>
               <div className="text-3xl lg:text-4xl font-black tracking-tighter font-mono" style={{ color: "#22C55E", textShadow: '0 0 15px rgba(34,197,94,0.3)' }}>{stats.uptime}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Pillar Interface ── */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row h-auto lg:h-[620px] border-b border-indigo-500/20 bg-[#0F0B29]/90 backdrop-blur-3xl">
        {AGENTS.map(a => (
          <Pillar 
            key={a.id} 
            agent={a}  
            active={activeId === a.id} 
            onClick={() => setActiveId(a.id)} 
          />
        ))}
      </div>

      {/* ── Footer Telemetry ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-0 bg-[#0F0B29]/95 border-b-4 border-indigo-900 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
        <div className="flex flex-wrap gap-4 lg:gap-8 justify-center">
           {["SLA_ENFORCED_0x24", "CRISIS_RADAR_ACTIVE", "EMISSIONS_AUDIT_PASS"].map((t, idx) => (
             <div key={t} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 shadow-inner">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: ['#00B4D8', '#8B5CF6', '#22C55E'][idx] }} />
                <span className="text-[9px] font-mono font-bold text-white/50 tracking-widest uppercase">{t}</span>
             </div>
           ))}
        </div>
        <div className="flex items-center gap-4">
           <img src={lorriLogo} className="h-5 lg:h-6 opacity-30 hover:opacity-100 transition-opacity cursor-pointer hidden lg:block filter drop-shadow-[0_0_8px_white]" />
           <div className="w-[1px] h-4 bg-indigo-500/30 hidden lg:block" />
           <span className="text-[10px] font-mono font-bold text-indigo-400 tabular-nums">LOG.HSH: A9F·2B4·C0E</span>
        </div>
      </div>
    </div>
  )
}
