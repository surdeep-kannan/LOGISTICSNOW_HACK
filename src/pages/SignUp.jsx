import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Building2, Phone, Zap, BarChart3, Globe } from "lucide-react"
import lorriLogo from "../assets/lorri.png"
import { colors, typography } from "../styles"
import { auth, saveToken } from "../lib/api"

const bg       = "#393185"
const surface  = "#453D9A"
const border   = "rgba(255,255,255,0.1)"
const textOn   = "rgba(255,255,255,0.9)"
const textSub  = "rgba(255,255,255,0.55)"
const textFade = "rgba(255,255,255,0.35)"

export default function SignUp() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [loading, setLoading]           = useState(false)
  const [focused, setFocused]           = useState("")
  const [error, setError]               = useState("")
  const [form, setForm] = useState({ name: "", company: "", mobile: "", email: "", password: "", confirm: "" })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirm) {
      setError("Passwords do not match")
      return
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      const data = await auth.signup({
        email:          form.email,
        password:       form.password,
        full_name:      form.name,
        company_name:   form.company,
        mobile_number:  form.mobile,
      })
      saveToken(data.token)
      navigate("/loading")
    } catch (err) {
      setError(err.message || "Could not create account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const features = [
    "India's first National Freight Benchmark — INR 10,000 crores across 20,000+ routes",
    "Autonomous AI agents for procurement, optimization & sustainability",
    "Real-time global freight intelligence & carrier benchmarking",
    "Location intelligence across 750+ districts and growing",
  ]

  const stats = [
    { value: "50M+", label: "Freight Data Points", icon: BarChart3 },
    { value: "180+", label: "Ports Monitored",     icon: Globe     },
    { value: "32%",  label: "Avg Cost Reduction",  icon: Zap       },
  ]

  const inputStyle = (name) => ({
    background: "rgba(255,255,255,0.08)",
    border: `1.5px solid ${focused === name ? "rgba(255,255,255,0.5)" : border}`,
    color: textOn,
    boxShadow: focused === name ? "0 0 0 3px rgba(255,255,255,0.07)" : "none",
  })

  const textFields = [
    { label: "Full Name",     name: "name",    type: "text",  placeholder: "John Doe",           Icon: User      },
    { label: "Company Name",  name: "company", type: "text",  placeholder: "Your Company Ltd.",  Icon: Building2 },
    { label: "Mobile Number", name: "mobile",  type: "tel",   placeholder: "+91 98765 43210",    Icon: Phone     },
    { label: "Email Address", name: "email",   type: "email", placeholder: "you@company.com",    Icon: Mail      },
  ]

  const passwordFields = [
    { label: "Password",         name: "password", show: showPassword, toggle: () => setShowPassword(!showPassword), placeholder: "Create a strong password" },
    { label: "Confirm Password", name: "confirm",  show: showConfirm,  toggle: () => setShowConfirm(!showConfirm),   placeholder: "Repeat your password"      },
  ]

  return (
    <div className="flex min-h-screen w-screen flex-col lg:flex-row overflow-hidden" style={{ background: bg }}>

      {/* ── LEFT PANEL ── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col overflow-hidden" style={{ background: surface, borderRight: `1px solid ${border}` }}>
        <div className="relative z-10 flex flex-col h-full px-8 xl:px-12 py-8 xl:py-10">

          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="flex items-center justify-center" style={{ flex: "0 0 38%" }}>
            <img src={lorriLogo} alt="LoRRI" className="object-contain w-4/5 max-w-sm xl:max-w-md" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="flex flex-col flex-1 justify-between">
            <div>
              <p style={{ color: colors.accent, fontSize: typography.xs, fontWeight: typography.semibold, letterSpacing: typography.widest, textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Join 200+ Enterprises
              </p>
              <h1 style={{ color: textOn, fontSize: typography["3xl"], fontWeight: typography.extrabold, lineHeight: typography.tight_line, marginBottom: "1.25rem" }}>
                Start Shipping.<br />Smarter & Faster.<br /><span style={{ color: colors.accent }}>With AI.</span>
              </h1>
              <div className="space-y-2.5 mb-6">
                {features.map((feature, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: colors.accent }} />
                    </div>
                    <p style={{ color: textSub, fontSize: typography.xs, lineHeight: typography.relaxed }}>{feature}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1 }} className="flex gap-0 pt-5" style={{ borderTop: `1px solid ${border}` }}>
                {stats.map((stat, i) => {
                  const Icon = stat.icon
                  return (
                    <div key={i} className="flex-1 flex flex-col items-start px-4 first:pl-0" style={{ borderRight: i < stats.length - 1 ? `1px solid ${border}` : "none" }}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Icon size={12} style={{ color: colors.accent }} strokeWidth={2} />
                        <p style={{ color: textOn, fontSize: typography.xl, fontWeight: typography.bold }}>{stat.value}</p>
                      </div>
                      <p style={{ color: textSub, fontSize: typography.xs }}>{stat.label}</p>
                    </div>
                  )
                })}
              </motion.div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} style={{ color: textFade, fontSize: typography.xs, marginTop: "1rem" }}>
                Powered by LogisticsNow
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-8 py-8 min-h-screen lg:min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
          className="w-full max-w-sm sm:max-w-md rounded-2xl px-6 sm:px-8 py-8 shadow-2xl"
          style={{ background: surface, border: `1px solid ${border}`, boxShadow: "0 24px 48px rgba(0,0,0,0.3)" }}
        >
          {/* Mobile logo */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center mb-6 lg:hidden">
            <img src={lorriLogo} alt="LoRRI" className="object-contain w-36 sm:w-44 mb-1" />
            <p style={{ color: colors.accent, fontSize: "10px", letterSpacing: typography.widest, textTransform: "uppercase" }}>
              Logistics Intelligence & Ratings Ecosystem
            </p>
          </motion.div>

          <div className="mb-5">
            <h2 style={{ color: textOn, fontSize: typography["2xl"], fontWeight: typography.bold, marginBottom: "0.35rem", letterSpacing: typography.tight }}>
              Create Account
            </h2>
            <p style={{ color: textSub, fontSize: typography.sm, lineHeight: typography.relaxed }}>
              Sign up with your official email to get started
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5" }}>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {textFields.map(({ label, name, type, placeholder, Icon }) => (
              <div key={name}>
                <label style={{ color: textSub, fontSize: typography.xs, fontWeight: typography.semibold, letterSpacing: typography.wider, textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>
                  {label}
                </label>
                <div className="relative">
                  <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: focused === name ? colors.accent : textSub }} />
                  <input
                    type={type} name={name} value={form[name]} onChange={handleChange}
                    onFocus={() => setFocused(name)} onBlur={() => setFocused("")}
                    placeholder={placeholder} required
                    className="w-full rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-all"
                    style={inputStyle(name)}
                  />
                </div>
              </div>
            ))}

            {passwordFields.map(({ label, name, show, toggle, placeholder }) => (
              <div key={name}>
                <label style={{ color: textSub, fontSize: typography.xs, fontWeight: typography.semibold, letterSpacing: typography.wider, textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>
                  {label}
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: focused === name ? colors.accent : textSub }} />
                  <input
                    type={show ? "text" : "password"} name={name} value={form[name]} onChange={handleChange}
                    onFocus={() => setFocused(name)} onBlur={() => setFocused("")}
                    placeholder={placeholder} required
                    className="w-full rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none transition-all"
                    style={inputStyle(name)}
                  />
                  <button type="button" onClick={toggle} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: textSub }}>
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ))}

            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="w-full rounded-xl flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-70 py-3 mt-1"
              style={{ background: colors.gradientAccent, color: colors.textWhite, fontWeight: typography.bold }}
            >
              {loading
                ? <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                : <>Create Account <ArrowRight size={15} strokeWidth={2} /></>
              }
            </motion.button>
          </form>

          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px" style={{ background: border }} />
            <p style={{ color: textFade, fontSize: typography.xs }}>or</p>
            <div className="flex-1 h-px" style={{ background: border }} />
          </div>

          <p className="text-center" style={{ color: textSub, fontSize: typography.sm }}>
            Already have an account?{" "}
            <a href="/" style={{ color: colors.accent, fontWeight: typography.semibold }}>Sign In</a>
          </p>
          <p className="text-center mt-5" style={{ color: textFade, fontSize: typography.xs }}>
            © 2026 LoRRI.ai · LogisticsNow · All rights reserved
          </p>
        </motion.div>
      </div>
    </div>
  )
}