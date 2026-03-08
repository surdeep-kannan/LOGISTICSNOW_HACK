import { useState, useEffect } from "react"
import { useNavigate, useLocation, Outlet } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Squares2X2Icon, PlusCircleIcon, MapPinIcon,
  ClipboardDocumentListIcon, Cog6ToothIcon,
  ArrowRightOnRectangleIcon, Bars3Icon, BellIcon,
  ChevronRightIcon, XMarkIcon, CpuChipIcon,
  GlobeAltIcon, CalculatorIcon, CreditCardIcon,
} from "@heroicons/react/24/outline"
import { colors, typography } from "../styles"
import lorriLogo from "../assets/lorri.png"
import AIChat from "../components/Aichat"
import { auth, clearToken } from "../lib/api"

const bg         = "#2D2566"
const surface    = "#332B7A"
const surfaceMid = "#3D3585"
const border     = "rgba(255,255,255,0.1)"
const textOn     = "rgba(255,255,255,0.95)"
const textSub    = "rgba(255,255,255,0.55)"

const navItems = [
  { label: "Dashboard",       Icon: Squares2X2Icon,            path: "/dashboard"                },
  { label: "Create Shipment", Icon: PlusCircleIcon,            path: "/dashboard/create"         },
  { label: "Track Shipment",  Icon: MapPinIcon,                path: "/dashboard/track"          },
  { label: "Order History",   Icon: ClipboardDocumentListIcon, path: "/dashboard/orders"         },
  { label: "Payments",        Icon: CreditCardIcon,            path: "/dashboard/payments"       },
  { label: "Freight Intel",   Icon: GlobeAltIcon,              path: "/dashboard/intelligence"   },
  { label: "Sustainability",  Icon: CpuChipIcon,               path: "/dashboard/sustainability" },
  { label: "ROI Calculator",  Icon: CalculatorIcon,            path: "/dashboard/roi"            },
  { label: "Settings",        Icon: Cog6ToothIcon,             path: "/dashboard/settings"       },
]

function initials(name) {
  if (!name) return "?"
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

function NavButton({ item, active, onClick }) {
  const [hovered, setHovered] = useState(false)
  const lit = active || hovered
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
      style={{
        background: active ? "rgba(255,255,255,0.14)" : hovered ? "rgba(255,255,255,0.07)" : "transparent",
        color: lit ? textOn : textSub,
        fontSize: typography.sm,
        fontWeight: active ? typography.semibold : typography.normal,
        border: active ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
      }}
    >
      <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-all"
        style={{ background: active ? "rgba(255,255,255,0.12)" : hovered ? "rgba(255,255,255,0.06)" : "transparent" }}>
        <item.Icon className="w-4 h-4" style={{ color: lit ? textOn : textSub }} />
      </div>
      <span className="flex-1 truncate">{item.label}</span>
      {active && <ChevronRightIcon className="w-3.5 h-3.5 shrink-0" style={{ color: "rgba(255,255,255,0.4)" }} />}
    </button>
  )
}

export default function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState({ name: "", email: "" })

  // Load real user from backend
  useEffect(() => {
    auth.me()
      .then(data => {
        const u = data.user
        const p = u?.profile ?? u
        setUser({
          name:  p?.full_name || u?.email?.split("@")[0] || "User",
          email: u?.email || "",
        })
      })
      .catch(() => {})
  }, [])

  const isActive = (path) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(path)

  const currentPage = navItems.find(item => isActive(item.path))

  const handleSignOut = async () => {
    try { await auth.logout() } catch (_) {}
    clearToken()
    navigate("/")
  }

  // Sidebar content extracted — used for both desktop & mobile
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 shrink-0"
        style={{ borderBottom: `1px solid ${border}` }}>
        <div className="w-12 h-12 flex items-center justify-center shrink-0 drop-shadow-md">
          <img src={lorriLogo} alt="LoRRI" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div className="min-w-0">
          <div style={{ color: textOn, fontWeight: typography.bold, fontSize: typography.lg, letterSpacing: typography.tight }}>
            LoRRI.ai
          </div>
          <div style={{ color: textSub, fontSize: "10px", letterSpacing: typography.wider, marginTop: 1, textTransform: "uppercase", fontWeight: 600 }}>
            Freight Intelligence
          </div>
        </div>
        {/* Close button — mobile only */}
        <button className="ml-auto lg:hidden w-7 h-7 flex items-center justify-center rounded-lg"
          style={{ background: "rgba(255,255,255,0.08)", color: textSub }}
          onClick={() => setSidebarOpen(false)}>
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Live badge */}
      <div className="px-4 pt-5 pb-2 shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: colors.success }} />
          <span style={{ color: colors.success, fontSize: typography.xs, fontWeight: typography.medium }}>
            Live Tracking Active
          </span>
        </div>
      </div>

      {/* Section label */}
      <div style={{ color: textSub, fontSize: "10px", fontWeight: typography.semibold, letterSpacing: typography.widest, textTransform: "uppercase", padding: "0.75rem 1.25rem 0.25rem" }}>
        Navigation
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavButton key={item.path} item={item} active={isActive(item.path)}
            onClick={() => { navigate(item.path); setSidebarOpen(false) }} />
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 shrink-0" style={{ borderTop: `1px solid ${border}` }}>
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: colors.gradientAccent, color: "#fff" }}>
            {initials(user.name)}
          </div>
          <div className="min-w-0">
            <div className="truncate" style={{ color: textOn, fontSize: typography.sm, fontWeight: typography.medium }}>
              {user.name || "Loading..."}
            </div>
            <div className="truncate" style={{ color: textSub, fontSize: "10px" }}>
              {user.email}
            </div>
          </div>
        </div>
        <SignOutButton onClick={handleSignOut} />
      </div>
    </>
  )

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: bg }}>

      {/* ── Mobile backdrop ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 lg:hidden"
            style={{ zIndex: 1000, background: "rgba(0,0,0,0.55)" }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col shrink-0"
        style={{ width: 240, background: surface, borderRight: `1px solid ${border}` }}>
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar (slide-in) ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed top-0 left-0 flex flex-col h-full lg:hidden"
            style={{ zIndex: 1001, width: 240, background: surface, borderRight: `1px solid ${border}` }}>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 shrink-0"
          style={{ borderBottom: `1px solid ${border}`, background: surface }}>
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-all"
              onClick={() => setSidebarOpen(true)}
              style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${border}` }}
              onMouseEnter={e => e.currentTarget.style.background = surfaceMid}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}>
              <Bars3Icon className="w-4 h-4" style={{ color: textSub }} />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline" style={{ color: textSub, fontSize: typography.sm }}>
                LoRRI.ai
              </span>
              <ChevronRightIcon className="hidden sm:block w-3.5 h-3.5" style={{ color: textSub, opacity: 0.4 }} />
              <span style={{ color: textOn, fontSize: typography.sm, fontWeight: typography.medium }}>
                {currentPage?.label ?? "Dashboard"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TopBarButton>
              <BellIcon className="w-4 h-4" style={{ color: textSub }} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border"
                style={{ background: colors.accent, borderColor: surface }} />
            </TopBarButton>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer"
              style={{ background: colors.gradientAccent, color: "#fff" }}>
              {initials(user.name)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* ── Floating AI Chatbot — appears on every dashboard page ── */}
      <AIChat />

    </div>
  )
}

function SignOutButton({ onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-all"
      style={{
        color: hovered ? "#FCA5A5" : textSub,
        background: hovered ? "rgba(239,68,68,0.12)" : "transparent",
        fontSize: typography.sm,
        border: "1px solid transparent",
      }}>
      <ArrowRightOnRectangleIcon className="w-4 h-4" />
      Sign out
    </button>
  )
}

function TopBarButton({ children }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? surfaceMid : "rgba(255,255,255,0.08)",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.2)" : border}`,
      }}>
      {children}
    </button>
  )
}