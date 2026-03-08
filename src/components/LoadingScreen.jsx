import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Player } from "@lottiefiles/react-lottie-player"
import forkliftAnimation from "../assets/forklift.json"
import { colors, typography } from "../styles"
import { setCached, preloadImage } from "../lib/prefetchCache"
import { shipments as shipmentsApi, intelligence, auth } from "../lib/api"

// ── All image assets the dashboard uses ──────────────────
// Vite resolves these at build time → real URLs (with hash)
import cargoImg     from "../assets/cargo.png"
import truckImg     from "../assets/container-truck.png"
import clockImg     from "../assets/clock.png"
import rupeeImg     from "../assets/rupee-indian.png"
import deliveredImg from "../assets/delivered.png"
import fileImg      from "../assets/file.png"

const DASHBOARD_IMAGES = [
  cargoImg, truckImg, clockImg, rupeeImg,
  deliveredImg, fileImg,
]

// ── Step labels shown on the progress bar ────────────────
const STEPS = [
  { label: "Connecting to LoRRI servers…",    weight: 10 },
  { label: "Loading your shipment data…",      weight: 25 },
  { label: "Fetching freight intelligence…",   weight: 25 },
  { label: "Pre-loading dashboard assets…",    weight: 20 },
  { label: "Preparing your workspace…",        weight: 20 },
]

export default function LoadingScreen() {
  const navigate    = useNavigate()
  const [progress,  setProgress]  = useState(0)
  const [stepLabel, setStepLabel] = useState(STEPS[0].label)
  const [ready,     setReady]     = useState(false)
  const doneRef     = useRef(false)

  useEffect(() => {
    if (doneRef.current) return
    doneRef.current = true

    async function prefetchAll() {
      let done = 0
      const total = STEPS.reduce((s, st) => s + st.weight, 0)

      function advance(stepIdx) {
        done += STEPS[stepIdx].weight
        setProgress(Math.round((done / total) * 100))
        if (STEPS[stepIdx + 1]) setStepLabel(STEPS[stepIdx + 1].label)
      }

      // Step 0 — connection warmup (just a tick)
      await tick(120)
      advance(0)

      // Step 1 — prefetch shipments stats + recent list + alerts in parallel
      try {
        const [statsData, shipmentsData, alertsData, userData] = await Promise.allSettled([
          shipmentsApi.stats(),
          shipmentsApi.list({ limit: 4 }),
          intelligence.alerts(),
          auth.me(),
        ])

        if (statsData.status     === "fulfilled") setCached("dashboard:stats",     statsData.value)
        if (shipmentsData.status === "fulfilled") setCached("dashboard:recent",    shipmentsData.value)
        if (alertsData.status    === "fulfilled") setCached("dashboard:alerts",    alertsData.value)
        if (userData.status      === "fulfilled") setCached("auth:me",             userData.value)
      } catch (_) { /* non-blocking */ }
      advance(1)

      // Step 2 — prefetch freight intelligence (ports + rates)
      try {
        const [portsData, ratesData] = await Promise.allSettled([
          intelligence.ports(),
          intelligence.rates(),
        ])
        if (portsData.status === "fulfilled") setCached("intelligence:ports", portsData.value)
        if (ratesData.status === "fulfilled") setCached("intelligence:rates", ratesData.value)
      } catch (_) { /* non-blocking */ }
      advance(2)

      // Step 3 — preload all image assets so browser has them decoded
      try {
        await Promise.all(DASHBOARD_IMAGES.map(src => preloadImage(src)))
      } catch (_) { /* non-blocking */ }
      advance(3)

      // Step 4 — small settle delay so progress bar visually completes
      await tick(300)
      setProgress(100)
      setStepLabel("✓ Everything ready!")
      advance(4)

      // Brief pause at 100% so user sees "ready"
      await tick(500)
      setReady(true)

      // Navigate after ready animation plays
      await tick(600)
      navigate("/dashboard")
    }

    prefetchAll()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: colors.bgPurple }}
    >
      {/* Lottie forklift */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Player
          autoplay
          loop
          src={forkliftAnimation}
          style={{ width: 360, height: 360 }}
        />
      </motion.div>

      {/* Status block */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col items-center gap-4 mt-2"
        style={{ width: 320 }}
      >
        {/* Brand label */}
        <p style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: typography.xs,
          fontWeight: typography.semibold,
          letterSpacing: typography.widest,
          textTransform: "uppercase",
        }}>
          LoRRI.ai · Logistics Intelligence Platform
        </p>

        {/* Crossfading step label */}
        <div style={{ height: "1.5rem", position: "relative", width: "100%", textAlign: "center" }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={stepLabel}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              style={{
                color: ready ? colors.success : "rgba(255,255,255,0.9)",
                fontSize: typography.sm,
                fontWeight: typography.medium,
                position: "absolute",
                inset: 0,
                letterSpacing: typography.wide,
              }}
            >
              {stepLabel}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div
          className="rounded-full overflow-hidden w-full"
          style={{ height: 3, background: "rgba(255,255,255,0.12)" }}
        >
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              background: ready
                ? `linear-gradient(90deg, ${colors.success}, #4ADE80)`
                : `linear-gradient(90deg, ${colors.accent}, rgba(255,255,255,0.9))`,
            }}
          />
        </div>

        {/* Percent + dots */}
        <div className="flex items-center justify-between w-full px-1">
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", fontWeight: 600 }}>
            {progress}%
          </span>

          <div className="flex items-center gap-1.5">
            {ready
              ? (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{ color: colors.success, fontSize: 16 }}
                >
                  ✓
                </motion.span>
              )
              : [0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.7)" }}
                  />
                ))
            }
          </div>
        </div>

      </motion.div>
    </div>
  )
}

// tiny helper — avoids importing a lib just for sleep
function tick(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}