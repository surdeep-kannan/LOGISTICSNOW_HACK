import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import Lottie from "lottie-react"
import botAnimation from "../assets/bot.json"
import lorriLogo from "../assets/lorri.png"

// ── Design tokens ─────────────────────────────────────────
const C = {
  bg:         "#393185",
  surface:    "#453D9A",
  surfaceMid: "#4F47AA",
  card:       "#3D3592",
  border:     "rgba(255,255,255,0.1)",
  borderUp:   "rgba(255,255,255,0.18)",
  accent:     "#00B4D8",
  accentDim:  "rgba(0,180,216,0.15)",
  accentGlow: "rgba(0,180,216,0.25)",
  primary:    "#0077B6",
  success:    "#22C55E",
  warning:    "#F59E0B",
  error:      "#EF4444",
  textHi:     "rgba(255,255,255,0.95)",
  textMid:    "rgba(255,255,255,0.6)",
  textLow:    "rgba(255,255,255,0.35)",
  grad:       "linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)",
}

const TICKER_ITEMS = [
  { tag: "LIVE",  tagColor: C.success, text: "MSC AURORA  ·  JNPT → Dubai  ·  ETA Mar 14" },
  { tag: "SAVED", tagColor: C.accent,  text: "AI saved ₹4.2L  ·  Mumbai → Delhi  ·  2 min ago" },
  { tag: "ALERT", tagColor: C.warning, text: "Port congestion  ·  Chennai  ·  +1.2 day delay" },
  { tag: "AI",    tagColor: C.accent,  text: "Procurement Agent locked ₹38,900 vs ₹46,200 market" },
  { tag: "DONE",  tagColor: C.success, text: "SHP-2026-089  ·  Delivered 4hr ahead of schedule" },
]

const STATS = [
  { val: "50M+",   label: "Freight Data Points"        },
  { val: "₹1.2Cr", label: "Saved per Enterprise/Month" },
  { val: "180+",   label: "Ports Monitored Live"        },
  { val: "32%",    label: "Avg Cost Reduction"          },
]

const FEATURES = [
  { tag: "Rates", title: "National Rate Benchmark",  desc: "India's first ₹10,000Cr freight dataset across 20,000+ routes. Know instantly if you're overpaying.", stat: "20,000+ routes" },
  { tag: "Ports", title: "Live Port Intelligence",   desc: "Real-time congestion feeds from 180+ global ports. Predictive alerts 48hrs before disruptions hit your cargo.", stat: "48hr prediction" },
  { tag: "AI",    title: "Autonomous Procurement",   desc: "AI agents negotiate, book, and track across 2,000+ carriers 24/7. Your team focuses on strategy.", stat: "2,000+ carriers" },
  { tag: "ESG",   title: "Scope 3 ESG Engine",       desc: "Every shipment's carbon footprint auto-calculated. Compliance reports generated with zero manual effort.", stat: "100% tracked" },
]

const PROCESS = [
  { n: "01", title: "Connect your data",         desc: "API or CSV — onboard in under 10 minutes" },
  { n: "02", title: "AI benchmarks your rates",  desc: "Instant comparison against ₹10,000Cr dataset" },
  { n: "03", title: "Agents optimise shipments", desc: "Procurement, routing, sustainability — automated" },
  { n: "04", title: "Watch savings compound",    desc: "Average 32% cost reduction within 30 days" },
]

const TESTIMONIALS = [
  { quote: "LoRRI cut our freight procurement from 3 days to 4 hours. The AI recommendations alone saved ₹2.3Cr in Q1.", name: "Priya Menon",  role: "VP Logistics, Tata Steel",    init: "PM" },
  { quote: "First platform that actually understands Indian freight complexity. District-level intelligence is unmatched.", name: "Arjun Kapoor", role: "Supply Chain Head, Reliance",  init: "AK" },
  { quote: "Our Scope 3 compliance went from a nightmare to fully automated. ESG reporting alone justifies the cost.",    name: "Sunita Rao",   role: "CFO, Mahindra Logistics",     init: "SR" },
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
function Navbar({ onLogin, onSignup }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  return (
    <motion.nav initial={{ y: -52, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.45 }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, height: 58,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px",
        background: scrolled ? "rgba(57,49,133,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "none",
        transition: "all 0.3s",
      }}>

      {/* Logo — lorri.png only, no L box */}
      <img src={lorriLogo} alt="LoRRI" style={{ height: 32, objectFit: "contain" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {["Features", "How it Works", "Pricing"].map(l => (
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
    </motion.nav>
  )
}

// ── Route widget ──────────────────────────────────────────
function RouteWidget() {
  const [active, setActive] = useState(0)
  const routes = [
    { from: "Mumbai", to: "Delhi",     mode: "Road Express", time: "3 days",  cost: "₹23,400",  saving: "₹4,800"  },
    { from: "JNPT",   to: "Singapore", mode: "Ocean FCL",    time: "12 days", cost: "₹1,84,000", saving: "₹32,000" },
    { from: "Delhi",  to: "Bangalore", mode: "Air Cargo",    time: "1 day",   cost: "₹68,500",  saving: "₹9,200"  },
  ]
  useEffect(() => {
    const t = setInterval(() => setActive(i => (i + 1) % routes.length), 2800)
    return () => clearInterval(t)
  }, [])
  const r = routes[active]

  return (
    <div style={{ borderRadius: 16, overflow: "hidden", background: C.surface, border: `1px solid ${C.borderUp}`, boxShadow: "0 24px 60px rgba(0,0,0,0.35)", width: "100%", maxWidth: 420 }}>
      <div style={{ background: "rgba(0,0,0,0.2)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 7, borderBottom: `1px solid ${C.border}` }}>
        {["#EF4444","#F59E0B","#22C55E"].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.75 }} />)}
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "Transit", val: r.time,   color: C.textHi  },
            { label: "Rate",    val: r.cost,   color: C.accent  },
            { label: "Saved",   val: r.saving, color: C.success },
          ].map(s => (
            <AnimatePresence key={s.label} mode="wait">
              <motion.div key={`${active}-${s.label}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ background: "rgba(0,0,0,0.2)", borderRadius: 9, padding: "9px 11px", border: `1px solid ${C.border}` }}>
                <div style={{ color: C.textLow, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
                <div style={{ color: s.color, fontWeight: 800, fontSize: 14 }}>{s.val}</div>
              </motion.div>
            </AnimatePresence>
          ))}
        </div>
      </div>
      <div style={{ background: "rgba(0,180,216,0.06)", borderTop: `1px solid rgba(0,180,216,0.15)`, padding: "9px 18px" }}>
        <span style={{ color: C.textLow, fontSize: 11, lineHeight: 1.5 }}>
          <span style={{ color: C.accent, fontWeight: 700 }}>AI:</span> Avoiding NH-48 congestion — saving {active === 0 ? "4hrs & ₹4,800" : active === 1 ? "₹32k via sea" : "1 day & ₹9.2k"}
        </span>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.textHi, overflowX: "hidden", fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
        a { color: inherit; text-decoration: none; }
        @keyframes lp-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes lp-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>

      <Navbar onLogin={() => navigate("/login")} onSignup={() => navigate("/signup")} />

      <div style={{ paddingTop: 58 }}><Ticker /></div>

      {/* ── HERO ── */}
      <section style={{ position: "relative", minHeight: "92vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "10%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,180,216,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,119,182,0.1) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1160, margin: "0 auto", padding: "72px 32px 56px", display: "flex", alignItems: "center", gap: 56 }}>

          {/* Left */}
          <div style={{ flex: "0 0 auto", maxWidth: 520 }}>

            {/* lorri.png — visible in hero */}
            <motion.img
              src={lorriLogo} alt="LoRRI"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              style={{ height: 52, objectFit: "contain", display: "block", marginBottom: 28 }}
            />

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 13px", borderRadius: 999, background: "rgba(0,180,216,0.1)", border: `1px solid rgba(0,180,216,0.25)`, marginBottom: 24 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.success, display: "block", animation: "lp-pulse 1.5s infinite" }} />
                <span style={{ color: C.textMid, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em" }}>India's First AI Freight Intelligence Platform</span>
              </div>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              style={{ fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.025em", marginBottom: 22 }}>
              Freight That<br />
              <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Thinks Itself.
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}
              style={{ color: C.textMid, fontSize: "clamp(14px, 1.4vw, 16px)", lineHeight: 1.75, marginBottom: 32, maxWidth: 460, fontWeight: 400 }}>
              Autonomous AI agents handle procurement, routing, and sustainability across 50M+ data points and 20,000+ Indian routes. Zero manual effort.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.24 }}
              style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36 }}>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/signup")}
                style={{ padding: "13px 26px", borderRadius: 10, background: C.grad, color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 20px ${C.accentGlow}` }}>
                Start Free Trial
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/login")}
                style={{ padding: "13px 26px", borderRadius: 10, background: "rgba(255,255,255,0.07)", color: C.textMid, fontWeight: 600, fontSize: 14, border: `1px solid ${C.border}`, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderUp; e.currentTarget.style.color = C.textHi }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMid }}>
                View Demo
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

          {/* Right — route widget */}
          <motion.div initial={{ opacity: 0, x: 32, scale: 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
            style={{ flex: 1, display: "flex", justifyContent: "center", animation: "lp-float 6s ease-in-out infinite" }}>
            <RouteWidget />
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: "rgba(0,0,0,0.15)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              style={{ padding: "40px 32px", borderRight: i < 3 ? `1px solid ${C.border}` : "none", textAlign: "center" }}>
              <div style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 800, letterSpacing: "-0.03em", color: C.textHi, marginBottom: 6 }}>{s.val}</div>
              <div style={{ color: C.textLow, fontSize: 12, lineHeight: 1.4 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── AI ASSISTANT — bot.json lives here ── */}
      <section style={{ padding: "80px 32px", background: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 64, flexWrap: "wrap" }}>

          {/* Lottie bot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.55 }}
            style={{ flex: "0 0 auto", width: 260, height: 260 }}>
            <Lottie animationData={botAnimation} loop={true} style={{ width: "100%", height: "100%" }} />
          </motion.div>

          {/* Copy */}
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
      <section id="how-it-works" style={{ padding: "88px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 52, textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 13px", borderRadius: 999, background: C.accentDim, border: `1px solid rgba(0,180,216,0.25)`, color: C.accent, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 18 }}>
              HOW IT WORKS
            </div>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 800, letterSpacing: "-0.025em" }}>
              From chaos to savings{" "}
              <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>in 30 days</span>
            </h2>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 2 }}>
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
      <section id="features" style={{ padding: "88px 32px", background: "rgba(0,0,0,0.12)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 52, textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 13px", borderRadius: 999, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, color: C.textMid, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 18 }}>
              CAPABILITIES
            </div>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 800, letterSpacing: "-0.025em" }}>
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

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "88px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 52, textAlign: "center" }}>
            <div style={{ display: "inline-flex", gap: 7, padding: "4px 13px", borderRadius: 999, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: C.success, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 18 }}>
              CUSTOMERS
            </div>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 800, letterSpacing: "-0.025em" }}>
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

      {/* ── CTA ── */}
      <section style={{ padding: "88px 32px", background: "rgba(0,0,0,0.12)", borderTop: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 350, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,180,216,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", padding: "8px 20px", borderRadius: 10, background: C.grad, color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 24, boxShadow: `0 8px 32px ${C.accentGlow}` }}>
            LORRI.AI
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 16 }}>
            Ready to ship{" "}
            <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>smarter?</span>
          </h2>
          <p style={{ color: C.textMid, fontSize: 15, lineHeight: 1.75, marginBottom: 32, fontWeight: 400 }}>
            Join 200+ enterprises saving an average of 32% on freight costs with LoRRI's AI procurement engine.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/signup")}
              style={{ padding: "14px 32px", borderRadius: 10, background: C.grad, color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 20px ${C.accentGlow}` }}>
              Start Free Trial
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/login")}
              style={{ padding: "14px 32px", borderRadius: 10, background: "transparent", color: C.textMid, fontWeight: 600, fontSize: 15, border: `1px solid ${C.border}`, cursor: "pointer", fontFamily: "inherit", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.borderUp}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              View Demo
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "28px 32px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={lorriLogo} alt="LoRRI" style={{ height: 24, objectFit: "contain" }} />
          <span style={{ color: C.textLow, fontSize: 12 }}>© 2026 LogisticsNow. All rights reserved.</span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms", "Security", "Contact"].map(l => (
            <a key={l} href="#" style={{ color: C.textLow, fontSize: 13, transition: "color 0.15s" }}
              onMouseEnter={e => e.target.style.color = C.textMid}
              onMouseLeave={e => e.target.style.color = C.textLow}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}