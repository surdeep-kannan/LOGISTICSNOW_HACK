import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Player } from "@lottiefiles/react-lottie-player"
import forkliftAnimation from "../assets/forklift.json"
import { colors, typography } from "../styles"

export default function LoadingScreen() {
  const [phase, setPhase] = useState("loading")
  const navigate = useNavigate()

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("ready"), 3000)
    const t2 = setTimeout(() => navigate("/dashboard"), 4000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: colors.bgPurple }}
    >
      {/* Lottie animation */}
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

      {/* Status area */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col items-center gap-4 mt-2"
      >
        <p style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: typography.xs,
          fontWeight: typography.semibold,
          letterSpacing: typography.widest,
          textTransform: "uppercase",
        }}>
          LoRRI.ai · Logistics Intelligence Platform
        </p>

        {/* Status message with crossfade */}
        <div style={{ height: "1.5rem", position: "relative", minWidth: 260, textAlign: "center" }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              style={{
                color: colors.textWhite,
                fontSize: typography.sm,
                fontWeight: typography.medium,
                letterSpacing: typography.wide,
                position: "absolute",
                inset: 0,
              }}
            >
              {phase === "loading" ? "Loading Freight Intelligence..." : "✓ Welcome Aboard"}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div
          className="rounded-full overflow-hidden"
          style={{ width: 240, height: 3, background: "rgba(255,255,255,0.15)" }}
        >
          <motion.div
            animate={{ width: phase === "loading" ? "68%" : "100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${colors.accent}, ${colors.textWhite})` }}
          />
        </div>

        {/* Bouncing dots */}
        <div className="flex items-center gap-1.5 mt-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.7)" }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}