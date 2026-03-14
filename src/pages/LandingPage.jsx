import { useState, useEffect, lazy, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import Lottie from "lottie-react"
import botAnimation from "../assets/bot.json"
import lorriLogo from "../assets/lorri.png"
import containerTruck from "../assets/container-truck.png"
import truckMove from "../assets/truck_move.png"
import shipMoving from "../assets/ship_moving.png"
import cargoImg from "../assets/cargo.png"
const FreightGrid = lazy(() => import("./FreightGrid"))

// ── Design tokens ─────────────────────────────────────────
const C = {
  bg: "#393185",
  surface: "#453D9A",
  surfaceMid: "#4F47AA",
  card: "#3D3592",
  border: "rgba(255,255,255,0.1)",
  borderUp: "rgba(255,255,255,0.18)",
  accent: "#00B4D8",
  accentDim: "rgba(0,180,216,0.15)",
  accentGlow: "rgba(0,180,216,0.25)",
  primary: "#0077B6",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  textHi: "rgba(255,255,255,0.95)",
  textMid: "rgba(255,255,255,0.6)",
  textLow: "rgba(255,255,255,0.35)",
  grad: "linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)",
}

const TICKER_ITEMS = [
  { tag: "LIVE", tagColor: C.success, text: "MSC AURORA  ·  JNPT → Dubai  ·  ETA Mar 14" },
  { tag: "SAVED", tagColor: C.accent, text: "AI saved ₹4.2L  ·  Mumbai → Delhi  ·  2 min ago" },
  { tag: "ALERT", tagColor: C.warning, text: "Port congestion  ·  Chennai  ·  +1.2 day delay" },
  { tag: "AI", tagColor: C.accent, text: "Procurement Agent locked ₹38,900 vs ₹46,200 market" },
  { tag: "DONE", tagColor: C.success, text: "SHP-2026-089  ·  Delivered 4hr ahead of schedule" },
]

const STATS = [
  { val: "50M+", label: "Freight Data Points" },
  { val: "₹1.2Cr", label: "Saved per Enterprise/Month" },
  { val: "180+", label: "Ports Monitored Live" },
  { val: "32%", label: "Avg Cost Reduction" },
]

const FEATURES = [
  { tag: "Rates", title: "National Rate Benchmark", desc: "India's first ₹10,000Cr freight dataset across 20,000+ routes. Know instantly if you're overpaying.", stat: "20,000+ routes" },
  { tag: "Ports", title: "Live Port Intelligence", desc: "Real-time congestion feeds from 180+ global ports. Predictive alerts 48hrs before disruptions hit your cargo.", stat: "48hr prediction" },
  { tag: "AI", title: "Autonomous Procurement", desc: "AI agents negotiate, book, and track across 2,000+ carriers 24/7. Your team focuses on strategy.", stat: "2,000+ carriers" },
  { tag: "ESG", title: "Scope 3 ESG Engine", desc: "Every shipment's carbon footprint auto-calculated. Compliance reports generated with zero manual effort.", stat: "100% tracked" },
]

const PROCESS = [
  { n: "01", title: "Connect your data", desc: "API or CSV — onboard in under 10 minutes" },
  { n: "02", title: "AI benchmarks your rates", desc: "Instant comparison against ₹10,000Cr dataset" },
  { n: "03", title: "Agents optimise shipments", desc: "Procurement, routing, sustainability — automated" },
  { n: "04", title: "Watch savings compound", desc: "Average 32% cost reduction within 30 days" },
]

const TESTIMONIALS = [
  { quote: "LoRRI cut our freight procurement from 3 days to 4 hours. The AI recommendations alone saved ₹2.3Cr in Q1.", name: "Priya Menon", role: "VP Logistics, Kiran Freight Solutions", init: "PM" },
  { quote: "First platform that actually understands Indian freight complexity. District-level intelligence is unmatched.", name: "Arjun Kapoor", role: "Supply Chain Head, NovaMoves India", init: "AK" },
  { quote: "Our Scope 3 compliance went from a nightmare to fully automated. ESG reporting alone justifies the cost.", name: "Sunita Rao", role: "CFO, Vridhi Cargo Pvt. Ltd.", init: "SR" },
]


// ── 4 Agents data (mirrors AgentArchitecture.jsx) ─────────
const AGENTS_LP = [
  {
    id: "procurement", name: "Procurement Agent", short: "PROCURE",
    img: containerTruck, color: "#00B4D8",
    tagBg: "rgba(0,180,216,0.12)", tagBdr: "rgba(0,180,216,0.3)",
    stat: "32% avg savings", desc: "Autonomously negotiates rates across 2,000+ carriers 24/7.",
  },
  {
    id: "optimization", name: "Optimization Engine", short: "OPTIMIZE",
    img: truckMove, color: "#8B5CF6",
    tagBg: "rgba(139,92,246,0.12)", tagBdr: "rgba(139,92,246,0.3)",
    stat: "48hr delay prediction", desc: "Re-routes shipments live using port congestion & weather feeds.",
  },
  {
    id: "sustainability", name: "Sustainability AI", short: "ESG",
    img: shipMoving, color: "#22C55E",
    tagBg: "rgba(34,197,94,0.12)", tagBdr: "rgba(34,197,94,0.3)",
    stat: "100% CO₂ tracked", desc: "Auto-calculates Scope 3 emissions and generates ESG reports instantly.",
  },
  {
    id: "intelligence", name: "Global Freight Grid", short: "INTEL",
    img: cargoImg, color: "#F59E0B",
    tagBg: "rgba(245,158,11,0.12)", tagBdr: "rgba(245,158,11,0.3)",
    stat: "50M+ data points", desc: "Real-time intelligence from 180+ ports and 20,000+ freight lanes.",
  },
]

// ── Pricing tiers ─────────────────────────────────────────
const PRICING = [
  {
    name: "Starter", price: "₹20,000", period: "/month",
    desc: "For growing logistics teams",
    features: ["Up to 200 shipments/month", "Rate benchmarking", "Basic AI routing", "Email support", "2 users"],
    highlight: false, tag: null,
  },
  {
    name: "Pro", price: "₹50,000", period: "/month",
    desc: "For mid-size enterprises",
    features: ["Unlimited shipments", "Full AI agent suite", "Live port intelligence", "Scope 3 ESG tracking", "Priority support", "10 users", "API access"],
    highlight: true, tag: "Most Popular",
  },
  {
    name: "Enterprise", price: "Custom", period: "",
    desc: "For large freight operations",
    features: ["Everything in Pro", "Dedicated AI training", "Custom integrations", "SLA guarantee", "Unlimited users", "White-label option"],
    highlight: false, tag: null,
  },
]

// ── Live ticker ───────────────────────────────────────────
function Ticker() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % TICKER_ITEMS.length), 3200)
    return () => clearInterval(t)
  }, [])
  const item = TICKER_ITEMS[idx]
  return (
    <div style={{ background: "rgba(0,0,0,0.15)", borderBottom: `1px solid ${C.border}`, padding: "8px 32px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.success, display: "block", animation: "lp-pulse 1.5s ease-in-out infinite" }} />
        <span style={{ color: C.success, fontSize: 9, fontWeight: 800, letterSpacing: "0.16em" }}>LIVE</span>
      </div>
      <div style={{ width: 1, height: 12, background: C.border }} />
      <div style={{ flex: 1, overflow: "hidden", position: "relative", height: 18 }}>
        <AnimatePresence mode="wait">
          <motion.div key={idx}
            initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ position: "absolute", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ padding: "2px 7px", borderRadius: 4, background: `${item.tagColor}18`, border: `1px solid ${item.tagColor}35`, color: item.tagColor, fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", flexShrink: 0 }}>
              {item.tag}
            </span>
            <span style={{ color: C.textMid, fontSize: 12 }}>{item.text}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Navbar ────────────────────────────────────────────────
function Navbar({ onLogin, onSignup, onDemo }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  const NAV_LINKS = ["Features", "Agents", "How it Works", "Pricing"]

  return (
    <>
      <motion.nav initial={{ y: -52, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.45 }}
        style={{
          position: "fixed", top: "34px", left: 0, right: 0, zIndex: 200, height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px",
          background: "rgba(57, 49, 133, 0.4)",
          backdropFilter: "blur(24px) saturate(150%)",
          borderBottom: `1px solid rgba(255,255,255,0.08)`,
          boxShadow: "0 4px 32px rgba(0,0,0,0.1)",
          transition: "all 0.3s",
        }}>
        <img src={lorriLogo} alt="LoRRI" style={{ height: 32, objectFit: "contain" }} />

        {/* Desktop nav */}
        <div className="hidden sm:flex" style={{ alignItems: "center", gap: 6 }}>
          {NAV_LINKS.map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              style={{ color: C.textMid, fontSize: 13, textDecoration: "none", padding: "5px 12px", borderRadius: 7, transition: "color 0.15s" }}
              onMouseEnter={e => e.target.style.color = C.textHi}
              onMouseLeave={e => e.target.style.color = C.textMid}>{l}</a>
          ))}
          <div style={{ width: 1, height: 16, background: C.border, margin: "0 6px" }} />
          <button onClick={onLogin}
            style={{ color: C.textMid, fontSize: 13, background: "transparent", border: `1px solid ${C.border}`, padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderUp; e.currentTarget.style.color = C.textHi }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMid }}>
            Sign In
          </button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onSignup}
            style={{ color: "#fff", fontSize: 13, fontWeight: 700, background: C.grad, border: "none", padding: "7px 18px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 16px ${C.accentGlow}` }}>
            Get Started
          </motion.button>
        </div>

        {/* Mobile */}
        <div className="flex sm:hidden items-center gap-2">
          <button onClick={onSignup}
            style={{ color: "#fff", fontSize: 12, fontWeight: 700, background: C.grad, border: "none", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>
            Get Started
          </button>
          <button onClick={() => setMobileOpen(o => !o)}
            style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.08)", border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", color: C.textMid }}>
            {mobileOpen
              ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>}
          </button>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
            className="sm:hidden"
            style={{ position: "fixed", top: 58, left: 0, right: 0, zIndex: 199, background: "rgba(57,49,133,0.98)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, padding: "16px 20px 24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
              {NAV_LINKS.map(l => (
                <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
                  onClick={() => setMobileOpen(false)}
                  style={{ color: C.textMid, fontSize: 15, textDecoration: "none", padding: "10px 12px", borderRadius: 8, display: "block" }}>
                  {l}
                </a>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { onLogin(); setMobileOpen(false) }}
                style={{ flex: 1, color: C.textMid, fontSize: 14, background: "transparent", border: `1px solid ${C.border}`, padding: "10px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>
                Sign In
              </button>
              <button onClick={() => { onSignup(); setMobileOpen(false) }}
                style={{ flex: 1, color: "#fff", fontSize: 14, fontWeight: 700, background: C.grad, border: "none", padding: "10px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>
                Sign Up
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Route widget (hero right side) ────────────────────────
function RouteWidget() {
  const [active, setActive] = useState(0)
  const routes = [
    { from: "Mumbai", to: "Delhi", mode: "Road Express", time: "3 days", cost: "₹23,400", saving: "₹4,800" },
    { from: "JNPT", to: "Singapore", mode: "Ocean FCL", time: "12 days", cost: "₹1,84,000", saving: "₹32,000" },
    { from: "Delhi", to: "Bangalore", mode: "Air Cargo", time: "1 day", cost: "₹68,500", saving: "₹9,200" },
  ]
  useEffect(() => {
    const t = setInterval(() => setActive(i => (i + 1) % routes.length), 2800)
    return () => clearInterval(t)
  }, [])
  const r = routes[active]
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", background: C.surface, border: `1px solid ${C.borderUp}`, boxShadow: "0 24px 60px rgba(0,0,0,0.35)", width: "100%", maxWidth: 420 }}>
      <div style={{ background: "rgba(0,0,0,0.2)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 7, borderBottom: `1px solid ${C.border}` }}>
        {["#EF4444", "#F59E0B", "#22C55E"].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.75 }} />)}
        <span style={{ color: C.textLow, fontSize: 11, marginLeft: 4 }}>lorri.ai / dashboard</span>
      </div>
      <div style={{ padding: "18px 18px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ color: C.textLow, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>Active Route</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 99, background: C.accentDim, border: `1px solid rgba(0,180,216,0.3)`, color: C.accent, fontSize: 10, fontWeight: 700 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.accent, display: "block", animation: "lp-pulse 1.5s infinite" }} />
            AI Optimised
          </span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}
            style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: C.textLow, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>From</div>
              <div style={{ color: C.textHi, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>{r.from}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{ width: 72, height: 1, background: `linear-gradient(90deg, ${C.accent}, ${C.accent}50)`, position: "relative" }}>
                <motion.div animate={{ x: [0, 68, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{ position: "absolute", top: -3, left: 0, width: 6, height: 6, borderRadius: "50%", background: C.accent }} />
              </div>
              <span style={{ color: C.textLow, fontSize: 10 }}>{r.mode}</span>
            </div>
            <div style={{ flex: 1, textAlign: "right" }}>
              <div style={{ color: C.textLow, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>To</div>
              <div style={{ color: C.textHi, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>{r.to}</div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
          {[["Transit", r.time], ["AI Rate", r.cost], ["Saved", r.saving]].map(([l, v]) => (
            <div key={l} style={{ padding: "10px", borderRadius: 10, background: "rgba(0,0,0,0.18)", border: `1px solid ${C.border}` }}>
              <div style={{ color: C.textLow, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{l}</div>
              <div style={{ color: l === "Saved" ? C.success : C.textHi, fontSize: 14, fontWeight: 800 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {routes.map((_, i) => (
            <div key={i} onClick={() => setActive(i)} style={{ flex: 1, height: 3, borderRadius: 99, cursor: "pointer", background: i === active ? C.accent : "rgba(255,255,255,0.12)", transition: "background 0.3s" }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Agent Architecture mini section ───────────────────────
function AgentSection({ onDemo }) {
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActiveIdx(i => (i + 1) % AGENTS_LP.length), 3000)
    return () => clearInterval(t)
  }, [])

  const active = AGENTS_LP[activeIdx]

  return (
    <section id="agents" style={{ padding: "72px 20px", background: "rgba(0,0,0,0.18)", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 14px", borderRadius: 999, background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", color: "#A78BFA", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 18 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#A78BFA", display: "inline-block", animation: "lp-pulse 1.5s infinite" }} />
            AUTONOMOUS AI AGENTS
          </div>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 800, letterSpacing: "-0.025em", color: C.textHi, marginBottom: 14 }}>
            Four agents.{" "}
            <span style={{ background: "linear-gradient(135deg, #8B5CF6, #00B4D8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Zero manual effort.
            </span>
          </h2>
          <p style={{ color: C.textMid, fontSize: 16, lineHeight: 1.75, maxWidth: 520, margin: "0 auto" }}>
            LoRRI's AI agent ecosystem works 24/7 — procuring, optimising, tracking emissions, and streaming live freight intelligence simultaneously.
          </p>
        </motion.div>

        {/* Agent cards + live preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* Left: 4 agent cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AGENTS_LP.map((agent, i) => (
              <motion.div key={agent.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.09 }}
                onClick={() => setActiveIdx(i)}
                style={{
                  padding: "20px 18px", borderRadius: 16, cursor: "pointer",
                  background: activeIdx === i
                    ? `linear-gradient(135deg, ${agent.color}18 0%, transparent 100%)`
                    : C.surface,
                  border: `1.5px solid ${activeIdx === i ? agent.color : C.border}`,
                  boxShadow: activeIdx === i ? `0 0 28px ${agent.color}20` : "none",
                  transition: "all 0.3s",
                }}>
                {/* Agent image + badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: agent.tagBg, border: `1px solid ${agent.tagBdr}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <img src={agent.img} alt={agent.name}
                      style={{
                        width: 30, height: 30, objectFit: "contain",
                        filter: activeIdx === i ? `drop-shadow(0 0 5px ${agent.color})` : "brightness(0.65)"
                      }} />
                  </div>
                  <span style={{
                    padding: "2px 7px", borderRadius: 5,
                    background: agent.tagBg, border: `1px solid ${agent.tagBdr}`,
                    color: agent.color, fontSize: 9, fontWeight: 800, letterSpacing: "0.08em",
                  }}>{agent.short}</span>
                </div>
                <div style={{ color: activeIdx === i ? C.textHi : C.textMid, fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                  {agent.name}
                </div>
                <div style={{ color: agent.color, fontSize: 11, fontWeight: 700 }}>{agent.stat}</div>
              </motion.div>
            ))}
          </div>

          {/* Right: live active agent detail */}
          <AnimatePresence mode="wait">
            <motion.div key={active.id}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{
                borderRadius: 20, overflow: "hidden",
                background: C.surface,
                border: `1px solid ${active.color}40`,
                boxShadow: `0 0 48px ${active.color}18`,
              }}>
              {/* Header */}
              <div style={{
                padding: "22px 24px",
                background: `linear-gradient(135deg, ${active.color}15 0%, transparent 70%)`,
                borderBottom: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", gap: 16,
              }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 16, flexShrink: 0,
                  background: active.tagBg, border: `1px solid ${active.tagBdr}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <img src={active.img} alt={active.name}
                    style={{
                      width: 42, height: 42, objectFit: "contain",
                      filter: `drop-shadow(0 0 8px ${active.color})`
                    }} />
                </div>
                <div>
                  <div style={{ color: C.textHi, fontWeight: 800, fontSize: 17, marginBottom: 6 }}>{active.name}</div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "3px 10px", borderRadius: 6, width: "fit-content",
                    background: active.tagBg, border: `1px solid ${active.tagBdr}`,
                    color: active.color, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em"
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%", background: active.color,
                      animation: "lp-pulse 1.5s infinite"
                    }} />
                    AGENT ACTIVE
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: "22px 24px" }}>
                <p style={{ color: C.textMid, fontSize: 14, lineHeight: 1.75, marginBottom: 20 }}>{active.desc}</p>

                {/* Animated data flow bars */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ color: C.textLow, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
                    Live processing
                  </div>
                  {["Rate streams", "Carrier signals", "Route options"].map((label, i) => (
                    <div key={label} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ color: C.textMid, fontSize: 12 }}>{label}</span>
                        <span style={{ color: active.color, fontSize: 12, fontWeight: 700 }}>
                          {["2,400/s", "890/s", "1,200/s"][i]}
                        </span>
                      </div>
                      <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <motion.div
                          animate={{ width: [`${30 + i * 15}%`, `${70 + i * 10}%`, `${30 + i * 15}%`] }}
                          transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                          style={{ height: "100%", borderRadius: 99, background: active.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulated Terminal Demo */}
                <div style={{
                  background: "#140c2e", borderRadius: 10, padding: 14, border: `1px solid ${C.border}`,
                  fontFamily: "monospace", fontSize: 11, color: C.textMid, height: 120, overflow: "hidden", position: "relative"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, borderBottom: `1px solid ${C.border}`, paddingBottom: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: active.color }} />
                    <span style={{ color: C.textHi, fontWeight: "bold" }}>Agent Output Stream</span>
                  </div>
                  <motion.div
                    animate={{ y: [0, -40] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <div>{`[${new Date().toLocaleTimeString()}] Fetching live data...`}</div>
                    <div style={{ color: active.color }}>{`> Optimizing 14,000 lane routes`}</div>
                    <div>{`[${new Date().toLocaleTimeString()}] Analyzing capacity constraints`}</div>
                    <div style={{ color: active.color }}>{`> Rerouting 4 shipments detected`}</div>
                    <div>{`[${new Date().toLocaleTimeString()}] Awaiting telemetry signal...`}</div>
                  </motion.div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: "linear-gradient(transparent, #140c2e)" }} />
                </div>

              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

// ── Pricing section ───────────────────────────────────────
function PricingSection({ onSignup }) {
  return (
    <section id="pricing" style={{ padding: "72px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-flex", gap: 7, padding: "4px 13px", borderRadius: 999, background: C.accentDim, border: `1px solid rgba(0,180,216,0.25)`, color: C.accent, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 18 }}>
            PRICING
          </div>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 800, letterSpacing: "-0.025em", color: C.textHi, marginBottom: 14 }}>
            Simple,{" "}
            <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              transparent pricing
            </span>
          </h2>
          <p style={{ color: C.textMid, fontSize: 15, maxWidth: 420, margin: "0 auto" }}>
            Start saving on freight costs from day one. No setup fees, no hidden charges.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {PRICING.map((plan, i) => (
            <motion.div key={plan.name}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                borderRadius: 18, overflow: "hidden", position: "relative",
                background: plan.highlight
                  ? "linear-gradient(145deg, #1A1456 0%, #231870 50%, #1A1456 100%)"
                  : C.surface,
                border: `${plan.highlight ? "2px" : "1px"} solid ${plan.highlight ? C.accent : C.border}`,
                boxShadow: plan.highlight ? `0 0 40px ${C.accentGlow}` : "none",
              }}>
              {/* Top accent line */}
              {plan.highlight && (
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: C.grad }} />
              )}
              {plan.tag && (
                <div style={{ position: "absolute", top: 16, right: 16, padding: "3px 10px", borderRadius: 6, background: C.grad, color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em" }}>
                  {plan.tag}
                </div>
              )}
              <div style={{ padding: "28px 26px" }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ color: plan.highlight ? C.accent : C.textMid, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                    {plan.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                    <span style={{ color: C.textHi, fontSize: 34, fontWeight: 900, letterSpacing: "-0.03em" }}>{plan.price}</span>
                    {plan.period && <span style={{ color: C.textMid, fontSize: 14 }}>{plan.period}</span>}
                  </div>
                  <div style={{ color: C.textLow, fontSize: 13 }}>{plan.desc}</div>
                </div>

                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, marginBottom: 24 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <span style={{ color: C.success, fontSize: 13, flexShrink: 0 }}>✓</span>
                      <span style={{ color: C.textMid, fontSize: 13 }}>{f}</span>
                    </div>
                  ))}
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={onSignup}
                  style={{
                    width: "100%", padding: "13px", borderRadius: 10,
                    background: plan.highlight ? C.grad : "transparent",
                    border: plan.highlight ? "none" : `1px solid ${C.border}`,
                    color: plan.highlight ? "#fff" : C.textMid,
                    fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    boxShadow: plan.highlight ? `0 4px 20px ${C.accentGlow}` : "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { if (!plan.highlight) { e.currentTarget.style.borderColor = C.borderUp; e.currentTarget.style.color = C.textHi } }}
                  onMouseLeave={e => { if (!plan.highlight) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMid } }}>
                  {plan.name === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Main LandingPage ──────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()

  const onLogin = () => navigate("/login")
  const onSignup = () => navigate("/signup")
  const onDemo = () => navigate("/demo")   // ← FIXED: was /login

  return (
    <div style={{ background: C.bg, color: C.textHi, fontFamily: "inherit", minHeight: "100vh", overflowX: "hidden" }}>

      <style>{`
        @keyframes lp-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        @keyframes lp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>

      {/* ── TOP LIVE TICKER (AI PULSE) ── */}
      <div style={{ background: "#0D0A25", borderBottom: `1px solid ${C.border}`, padding: "8px 0", overflow: "hidden", position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, height: "34px" }}>
        <div style={{ display: "flex", whiteSpace: "nowrap", gap: 50, animation: "ticker-scroll 40s linear infinite" }}>

          {[
            { tag: "LIVE", text: "Optimization Engine rerouted 12 container ships near Suez to avoid 4hr weather delay" },
            { tag: "SAVING", text: "Global Grid just identified 18% lower spot rate for Shanghai → Mumbai corridor" },
            { tag: "INTEL", text: "68,200 freight lanes benchmarked in real-time · System Health: 100%" },
            { tag: "SUSTAIN", text: "AI reduced carbon footprint of 400 shipments by 14.2% through modal shift" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 9, fontWeight: 900, padding: "2px 6px", borderRadius: 4, background: item.tag === "LIVE" ? "rgba(34,197,94,0.15)" : "rgba(0,180,216,0.15)", color: item.tag === "LIVE" ? C.success : C.accent, border: `1px solid ${item.tag === "LIVE" ? C.success : C.accent}40` }}>{item.tag}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{item.text}</span>
            </div>
          ))}
          {/* Repeat for seamless scroll */}
          {[
            { tag: "LIVE", text: "Optimization Engine rerouted 12 container ships near Suez to avoid 4hr weather delay" },
            { tag: "SAVING", text: "Global Grid just identified 18% lower spot rate for Shanghai → Mumbai corridor" },
          ].map((item, i) => (
            <div key={i+"-rep"} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 9, fontWeight: 900, padding: "2px 6px", borderRadius: 4, background: item.tag === "LIVE" ? "rgba(34,197,94,0.15)" : "rgba(0,180,216,0.15)", color: item.tag === "LIVE" ? C.success : C.accent, border: `1px solid ${item.tag === "LIVE" ? C.success : C.accent}40` }}>{item.tag}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <Navbar onLogin={onLogin} onSignup={onSignup} onDemo={onDemo} />

      {/* Spacer for fixed headers (34px ticker + 64px navbar) */}
      <div style={{ height: 98 }} />

      <Ticker />

      {/* ── HERO ── */}
      <section style={{ paddingTop: 60, paddingBottom: 60, paddingLeft: 20, paddingRight: 20 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap", justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 400px", minWidth: 280 }}>
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px", borderRadius: 999, background: C.accentDim, border: `1px solid rgba(0,180,216,0.3)`, marginBottom: 22 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.success, display: "block", animation: "lp-pulse 1.5s infinite" }} />
              <span style={{ color: C.accent, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}>AI-POWERED FREIGHT INTELLIGENCE</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
              style={{ fontSize: "clamp(32px, 4.5vw, 58px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}>
              India's First{" "}
              <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                AI Freight
              </span>
              <br />Intelligence Platform
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}
              style={{ color: C.textMid, fontSize: "clamp(14px, 1.4vw, 16px)", lineHeight: 1.75, marginBottom: 32, maxWidth: 460, fontWeight: 400 }}>
              Autonomous AI agents handle procurement, routing, and sustainability across 50M+ data points and 20,000+ Indian routes. Zero manual effort.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.24 }}
              style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36 }}>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onSignup}
                style={{ padding: "13px 26px", borderRadius: 10, background: C.grad, color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 20px ${C.accentGlow}` }}>
                Start Free Trial
              </motion.button>
              {/* FIXED: View Demo → /demo */}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onDemo}
                style={{ padding: "13px 26px", borderRadius: 10, background: "rgba(255,255,255,0.07)", color: C.textMid, fontWeight: 600, fontSize: 14, border: `1px solid ${C.border}`, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderUp; e.currentTarget.style.color = C.textHi }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMid }}>
                View Demo →
              </motion.button>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
              {["200+ Enterprises", "SOC 2 Certified", "99.9% Uptime", "24/7 AI Support"].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, color: C.textLow, fontSize: 12 }}>
                  <span style={{ color: C.success, fontSize: 11 }}>✓</span> {t}
                </div>
              ))}
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, x: 32, scale: 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden md:flex"
            style={{ flex: "1 1 320px", justifyContent: "center", animation: "lp-float 6s ease-in-out infinite" }}>
            <RouteWidget />
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: "rgba(0,0,0,0.15)" }}>
        <div className="grid grid-cols-2 lg:grid-cols-4 max-w-[1100px] mx-auto">
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className={`padding-[28px 16px] text-center ${i % 2 !== 1 ? "border-r border-white/10" : ""} ${i < 2 ? "lg:border-b-0 border-b border-white/10" : "lg:border-b-0"} lg:border-r border-white/10 last:border-r-0`}
              style={{ padding: "28px 16px" }}>
              <div style={{ fontSize: "clamp(24px, 3.5vw, 44px)", fontWeight: 800, letterSpacing: "-0.03em", color: C.textHi, marginBottom: 6 }}>{s.val}</div>
              <div style={{ color: C.textLow, fontSize: 12, lineHeight: 1.4 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── AI ASSISTANT ── */}
      <section style={{ padding: "60px 20px", background: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 48, flexWrap: "wrap", justifyContent: "center" }}>
          <motion.div initial={{ opacity: 0, scale: 0.88 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.55 }}
            style={{ flex: "0 0 auto", width: 260, height: 260 }}>
            <Lottie animationData={botAnimation} loop={true} style={{ width: "100%", height: "100%" }} />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
            style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 13px", borderRadius: 999, background: C.accentDim, border: `1px solid rgba(0,180,216,0.25)`, color: C.accent, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 20 }}>
              AI ASSISTANT
            </div>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.15, marginBottom: 16 }}>
              Your freight team,<br />
              <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                available 24/7.
              </span>
            </h2>
            <p style={{ color: C.textMid, fontSize: 15, lineHeight: 1.75, maxWidth: 460, marginBottom: 28, fontWeight: 400 }}>
              Ask LoRRI anything — track a shipment, get rate comparisons, file a cancellation, or forecast delays. Our AI agent handles it instantly, no forms, no waiting.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {["Track SHP-2026-089", "Compare Mumbai–Delhi rates", "Flag a delay on JNPT", "Generate ESG report"].map(chip => (
                <div key={chip} style={{ padding: "6px 14px", borderRadius: 999, background: "rgba(255,255,255,0.07)", border: `1px solid ${C.border}`, color: C.textMid, fontSize: 12, fontWeight: 500 }}>
                  {chip}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: "60px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 52, textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 13px", borderRadius: 999, background: C.accentDim, border: `1px solid rgba(0,180,216,0.25)`, color: C.accent, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 18 }}>
              HOW IT WORKS
            </div>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 800, letterSpacing: "-0.025em", color: C.textHi }}>
              From chaos to savings{" "}
              <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>in 30 days</span>
            </h2>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 2 }}>
            {PROCESS.map((p, i) => (
              <motion.div key={p.n}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ padding: "28px 24px", background: C.surface, border: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -20, right: -8, fontSize: 72, fontWeight: 900, color: "rgba(0,180,216,0.05)", pointerEvents: "none", userSelect: "none" }}>{p.n}</div>
                <div style={{ color: C.accent, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", marginBottom: 12 }}>{p.n} ——</div>
                <h3 style={{ color: C.textHi, fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{p.title}</h3>
                <p style={{ color: C.textLow, fontSize: 13, lineHeight: 1.65 }}>{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "60px 20px", background: "rgba(0,0,0,0.12)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 52, textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 13px", borderRadius: 999, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, color: C.textMid, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 18 }}>
              CAPABILITIES
            </div>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 800, letterSpacing: "-0.025em", color: C.textHi }}>
              Everything freight.{" "}
              <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Nothing manual.</span>
            </h2>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
            {FEATURES.map((f, i) => {
              const [hovered, setHovered] = useState(false)
              return (
                <motion.div key={f.title}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.09 }}
                  onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
                  style={{ borderRadius: 14, padding: "24px 22px", background: hovered ? C.surfaceMid : C.surface, border: `1px solid ${hovered ? C.borderUp : C.border}`, transition: "all 0.2s", cursor: "default", position: "relative", overflow: "hidden", boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.2)" : "none" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: C.grad, opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }} />
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ color: C.accent, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 5, background: C.accentDim, border: `1px solid rgba(0,180,216,0.2)` }}>{f.tag}</span>
                    <span style={{ color: C.textLow, fontSize: 9, fontWeight: 600, padding: "3px 8px", borderRadius: 5, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}` }}>{f.stat}</span>
                  </div>
                  <h3 style={{ color: C.textHi, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ color: C.textMid, fontSize: 13, lineHeight: 1.7 }}>{f.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── AGENT ARCHITECTURE (NEW) ── */}
      <AgentSection onDemo={onDemo} />

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "60px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 52, textAlign: "center" }}>
            <div style={{ display: "inline-flex", gap: 7, padding: "4px 13px", borderRadius: 999, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: C.success, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 18 }}>
              CUSTOMERS
            </div>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 800, letterSpacing: "-0.025em", color: C.textHi }}>
              Trusted by India's{" "}
              <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>logistics leaders</span>
            </h2>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ padding: "26px 24px", borderRadius: 14, background: C.surface, border: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: C.grad }} />
                <div style={{ fontSize: 28, color: C.accent, marginBottom: 14, fontWeight: 900, lineHeight: 1 }}>"</div>
                <p style={{ color: C.textMid, fontSize: 14, lineHeight: 1.75, marginBottom: 20, fontWeight: 400 }}>{t.quote}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.grad, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "#fff", flexShrink: 0 }}>{t.init}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: C.textHi }}>{t.name}</div>
                    <div style={{ color: C.textLow, fontSize: 11 }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GLOBAL FREIGHT GRID ── */}
      <section id="grid" style={{ padding: "72px 20px", background: "rgba(0,0,0,0.18)", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 14px", borderRadius: 999, background: "rgba(0,180,216,0.1)", border: "1px solid rgba(0,180,216,0.3)", color: C.accent, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 18 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.success, display: "inline-block", animation: "lp-pulse 1.5s infinite" }} />
              LIVE GLOBAL FREIGHT GRID
            </div>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 800, letterSpacing: "-0.025em", color: C.textHi, marginBottom: 14 }}>
              Every freight lane.{" "}
              <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Tracked in real-time.
              </span>
            </h2>
            <p style={{ color: C.textMid, fontSize: 15, maxWidth: 520, margin: "0 auto" }}>
              68,200+ global routes benchmarked live. Click any hub to explore freight lanes, congestion data, and LoRRI rate savings across India, China, USA, and Europe.
            </p>
          </motion.div>

          {/* Embedded Map */}
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{ borderRadius: 20, overflow: "hidden", border: `1px solid ${C.borderUp}`, boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
            <Suspense fallback={
              <div style={{ height: 680, background: "#2D2566", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
                <div style={{ width: 28, height: 28, border: "2px solid rgba(255,255,255,0.1)", borderTopColor: C.accent, borderRadius: "50%", animation: "lp-pulse 0.75s linear infinite" }} />
                <span style={{ color: C.textLow, fontSize: 13 }}>Loading global freight grid…</span>
              </div>
            }>
            <FreightGrid embedded={true} embeddedHeight="680px" />
            </Suspense>
          </motion.div>

          {/* CTA below map */}
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => window.open("/grid", "_blank")}
              style={{ padding: "12px 28px", borderRadius: 10, background: C.grad, color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 20px ${C.accentGlow}` }}>
              Explore Full Grid →
            </motion.button>
            <p style={{ color: C.textLow, fontSize: 12, marginTop: 12 }}>
              Full-screen interactive map with 68,200+ routes, live congestion & rate benchmarks
            </p>
          </div>
        </div>
      </section>

      {/* ── PRICING (NEW) ── */}

      <PricingSection onSignup={onSignup} />

      {/* ── CTA ── */}
      <section style={{ padding: "60px 20px", background: "rgba(0,0,0,0.12)", borderTop: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 350, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,180,216,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", padding: "8px 20px", borderRadius: 10, background: C.grad, color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 24, boxShadow: `0 8px 32px ${C.accentGlow}` }}>
            LORRI.AI
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 16, color: C.textHi }}>
            Ready to ship{" "}
            <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>smarter?</span>
          </h2>
          <p style={{ color: C.textMid, fontSize: 15, lineHeight: 1.75, marginBottom: 32, fontWeight: 400 }}>
            Join 200+ enterprises saving an average of 32% on freight costs with LoRRI's AI procurement engine.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onSignup}
              style={{ padding: "14px 32px", borderRadius: 10, background: C.grad, color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 20px ${C.accentGlow}` }}>
              Start Free Trial
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onDemo}
              style={{ padding: "14px 32px", borderRadius: 10, background: "transparent", color: C.textMid, fontWeight: 600, fontSize: 15, border: `1px solid ${C.border}`, cursor: "pointer", fontFamily: "inherit", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.borderUp}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              View Demo
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "24px 20px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={lorriLogo} alt="LoRRI" style={{ height: 24, objectFit: "contain" }} />
          <span style={{ color: C.textLow, fontSize: 12 }}>© 2026 LogisticsNow. All rights reserved.</span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms", "Security", "Contact"].map(l => (
            <a key={l} href="#" style={{ color: C.textLow, fontSize: 13, transition: "color 0.15s", textDecoration: "none" }}
              onMouseEnter={e => e.target.style.color = C.textMid}
              onMouseLeave={e => e.target.style.color = C.textLow}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}