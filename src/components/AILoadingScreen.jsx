import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Player } from "@lottiefiles/react-lottie-player"
import aiAnimation from "../assets/ai-loading.json"
import { colors, typography } from "../styles"

export default function AILoadingScreen({ onComplete, routeReady }) {
  const [statusText, setStatusText] = useState("Initialising AI Neural Engine...")
  const [minDone,    setMinDone]    = useState(false)

  const phases = [
    { text: "Analyzing 1,400+ Route Combinations...", time: 1000 },
    { text: "Optimizing for Fuel & Transit Time...",  time: 2200 },
    { text: "Syncing Real-time Port Congestion Data...", time: 3400 },
    { text: "Finalising Best AI Recommendations...", time: 4200 },
  ]

  useEffect(() => {
    const timers = phases.map(p => setTimeout(() => setStatusText(p.text), p.time))
    // Minimum display time so it never flashes away instantly
    const minTimer = setTimeout(() => setMinDone(true), 4800)
    return () => { timers.forEach(clearTimeout); clearTimeout(minTimer) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Dismiss only when BOTH minimum time is done AND route data is ready
  useEffect(() => {
    if (minDone && routeReady) {
      onComplete?.()
    }
  }, [minDone, routeReady]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden" 
         style={{ background: "#0F0A2A" }}>
      
      {/* Animated Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -top-1/4 -left-1/4 w-full h-full rounded-full"
          style={{ background: "radial-gradient(circle, #6C63FF 0%, transparent 70%)" }}
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute -bottom-1/4 -right-1/4 w-full h-full rounded-full"
          style={{ background: "radial-gradient(circle, #00B4D8 0%, transparent 70%)" }}
        />
      </div>

      {/* Lottie Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <Player
          autoplay
          loop
          src={aiAnimation}
          style={{ width: 450, height: 450 }}
        />
      </motion.div>

      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center gap-6 -mt-10"
      >
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
           <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
           <p style={{
             color: "rgba(255,255,255,0.7)",
             fontSize: "10px",
             fontWeight: 800,
             letterSpacing: "0.3em",
             textTransform: "uppercase",
           }}>
             LoRRI Intelligence Engine
           </p>
        </div>

        <div className="h-10 relative min-w-[400px] text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={statusText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                color: colors.textWhite,
                fontSize: typography.lg,
                fontWeight: 500,
                letterSpacing: "0.02em"
              }}
            >
              {statusText}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* High-Tech Progress Bar */}
        <div className="w-80 space-y-2">
            <div className="h-1 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                <motion.div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500"
                    initial={{ width: "0%" }}
                    animate={{ width: routeReady ? "100%" : "88%" }}
                    transition={{ duration: routeReady ? 0.3 : 4.8, ease: "easeInOut" }}
                />
            </div>
            <div className="flex justify-between px-1">
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px", fontWeight: 700 }}>NEURAL LINK ACTIVE</span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px", fontWeight: 700 }}>
                  {routeReady ? "READY" : "PROCESSING..."}
                </span>
            </div>
        </div>
      </motion.div>
    </div>
  )
}