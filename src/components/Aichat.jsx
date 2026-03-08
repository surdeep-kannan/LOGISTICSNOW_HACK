import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { colors, typography } from "../styles"
import { getToken } from "../lib/api"
import assistantImg from "../assets/assistant.png"

// Calls YOUR backend → which calls Gemini
// Never calls any AI API directly from the browser
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001"

const C = {
  surface:    "#1A1756",
  surfaceMid: "#231F6B",
  surfaceHi:  "#2D2880",
  border:     "rgba(255,255,255,0.1)",
  textOn:     "rgba(255,255,255,0.95)",
  textSub:    "rgba(255,255,255,0.6)",
  textFade:   "rgba(255,255,255,0.3)",
  purple:     "#6C63FF",
  cyan:       "#00B4D8",
  grad:       "linear-gradient(135deg, #6C63FF 0%, #00B4D8 100%)",
}

const SUGGESTED = [
  "What's the best route from Mumbai to Chennai?",
  "How can I reduce my freight costs by 30%?",
  "Which ports have congestion right now?",
  "Explain Scope 3 emissions tracking",
  "Compare VRL vs Blue Dart Cargo",
]

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "10px 14px" }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
          style={{ width: 6, height: 6, borderRadius: "50%", background: C.cyan }} />
      ))}
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === "user"
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex", gap: 10,
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 14,
      }}
    >
      {!isUser && (
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          overflow: "hidden", flexShrink: 0, marginTop: 2,
        }}><img src={assistantImg} alt="LoRRI" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
      )}
      <div style={{
        maxWidth: "78%", padding: "10px 14px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        background: isUser ? C.grad : C.surfaceMid,
        border: isUser ? "none" : `1px solid ${C.border}`,
        color: C.textOn, fontSize: 13, lineHeight: 1.6,
        whiteSpace: "pre-wrap", wordBreak: "break-word",
      }}>
        {msg.content}
      </div>
      {isUser && (
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2,
        }}>
          YOU
        </div>
      )}
    </motion.div>
  )
}

const GREETING = {
  role: "assistant",
  content: "Hi! I'm LoRRI, your AI freight intelligence assistant. Ask me anything about freight rates, routes, port congestion, or carrier performance. How can I help you today? 🚢",
}

export default function AIChat() {
  const [open,     setOpen]     = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [input,    setInput]    = useState("")
  const [loading,  setLoading]  = useState(false)
  const [hasNew,   setHasNew]   = useState(true)
  const [error,    setError]    = useState("")
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    if (open) {
      setHasNew(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const userText = (text || input).trim()
    if (!userText || loading) return

    setInput("")
    setError("")
    const newMessages = [...messages, { role: "user", content: userText }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const token = getToken()

      // Send to YOUR backend — it calls Gemini with your API key
      // Backend loads history from Supabase itself, we only send the message
      const res = await fetch(`${BASE}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          message: userText,
          // Optional: pass shipment context if you want AI to know the current shipment
          // shipment_context: null,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || errData.message || `Server error ${res.status}`)
      }

      const data = await res.json()

      // Backend can return: { reply } or { message } or { response }
      const reply = data.reply || data.message || data.response
        || "I couldn't get a response. Please try again."

      setMessages(prev => [...prev, { role: "assistant", content: reply }])
    } catch (err) {
      const msg = err.message || "Unknown error"
      // Show the actual error so you can debug it
      setError(msg)
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Sorry, I ran into an issue: ${msg}\n\nMake sure your backend is running on port 3001.`,
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([GREETING])
    setError("")
  }

  return (
    <>
      {/* ── Floating button ── */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 1100,
          width: 58, height: 58, borderRadius: "50%",
          background: C.grad, border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 32px rgba(108,99,255,0.45)",
          fontSize: 24,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={open ? "close" : "open"}
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}>
            {open ? "✕" : <img src={assistantImg} alt="LoRRI" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />}
          </motion.span>
        </AnimatePresence>
        {hasNew && !open && (
          <span style={{
            position: "absolute", top: 4, right: 4,
            width: 12, height: 12, borderRadius: "50%",
            background: "#EF4444", border: "2px solid #07051A",
          }} />
        )}
      </motion.button>

      {/* ── Chat window ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            style={{
              position: "fixed", bottom: 96, right: 28, zIndex: 1099,
              width: 360, height: 520,
              borderRadius: 20, overflow: "hidden",
              background: C.surface, border: `1px solid ${C.border}`,
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "14px 16px", borderBottom: `1px solid ${C.border}`,
              background: C.surfaceMid, display: "flex", alignItems: "center",
              gap: 10, flexShrink: 0,
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: "50%",
                overflow: "hidden",
              }}><img src={assistantImg} alt="LoRRI" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ color: C.textOn, fontWeight: 700, fontSize: 14 }}>
                  LoRRI AI Assistant
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
                  <span style={{ color: "#22C55E", fontSize: 11 }}>Online · Powered by Gemini</span>
                </div>
              </div>
              <button onClick={clearChat}
                style={{ color: C.textFade, background: "none", border: "none", cursor: "pointer", fontSize: 12, padding: "4px 8px", borderRadius: 6 }}
                onMouseEnter={e => e.target.style.color = C.textSub}
                onMouseLeave={e => e.target.style.color = C.textFade}>
                Clear
              </button>
            </div>

            {/* Error bar — shows actual backend error for debugging */}
            {error && (
              <div style={{
                padding: "6px 12px", background: "rgba(239,68,68,0.15)",
                borderBottom: `1px solid rgba(239,68,68,0.3)`,
                color: "#FCA5A5", fontSize: 11, flexShrink: 0,
              }}>
                ⚠ {error}
              </div>
            )}

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px" }}>
              {messages.map((msg, i) => <Message key={i} msg={msg} />)}
              {loading && (
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    overflow: "hidden", flexShrink: 0,
                  }}><img src={assistantImg} alt="LoRRI" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                  <div style={{ background: C.surfaceMid, border: `1px solid ${C.border}`, borderRadius: "16px 16px 16px 4px" }}>
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggested prompts — only when on greeting */}
            {messages.length === 1 && (
              <div style={{
                padding: "0 14px 10px",
                display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0,
              }}>
                {SUGGESTED.slice(0, 3).map(s => (
                  <button key={s} onClick={() => sendMessage(s)}
                    style={{
                      padding: "5px 10px", borderRadius: 999,
                      background: C.surfaceMid, border: `1px solid ${C.border}`,
                      color: C.textSub, fontSize: 11, cursor: "pointer", textAlign: "left",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.cyan; e.currentTarget.style.color = C.textOn }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSub }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{
              padding: "10px 12px", borderTop: `1px solid ${C.border}`,
              display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0,
            }}>
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about freight, routes, rates..."
                style={{
                  flex: 1, background: C.surfaceMid, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: "10px 14px", color: C.textOn,
                  fontSize: 13, outline: "none", resize: "none", lineHeight: 1.5,
                  maxHeight: 80, overflow: "auto", fontFamily: "inherit",
                }}
                onFocus={e => e.target.style.borderColor = C.cyan}
                onBlur={e => e.target.style.borderColor = C.border}
              />
              <motion.button
                onClick={() => sendMessage()}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                disabled={!input.trim() || loading}
                style={{
                  width: 38, height: 38, borderRadius: "50%",
                  border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  background: input.trim() && !loading ? C.grad : "rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0, transition: "background 0.2s",
                }}>
                ➤
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}