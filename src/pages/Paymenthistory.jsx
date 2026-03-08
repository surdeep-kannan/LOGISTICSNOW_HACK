import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CreditCardIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon,
  TruckIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid"
import { colors, typography } from "../styles"
import { payments as paymentsApi } from "../lib/api"

const surface    = "#1A1744"
const surfaceMid = "#231F6B"
const border     = "rgba(255,255,255,0.1)"
const textOn     = "rgba(255,255,255,0.95)"
const textSub    = "rgba(255,255,255,0.65)"
const textFade   = "rgba(255,255,255,0.35)"

const STATUS_CONFIG = {
  completed: { label: "Completed", bg: "rgba(34,197,94,0.12)",  text: "#4ADE80", border: "rgba(34,197,94,0.25)",  icon: CheckCircleSolid },
  refunded:  { label: "Refunded",  bg: "rgba(245,158,11,0.12)", text: "#FCD34D", border: "rgba(245,158,11,0.25)", icon: ArrowPathIcon },
  failed:    { label: "Failed",    bg: "rgba(239,68,68,0.12)",  text: "#FCA5A5", border: "rgba(239,68,68,0.25)",  icon: ExclamationTriangleIcon },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.completed
  const Icon = cfg.icon
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text, fontSize: "11px", fontWeight: 700 }}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

function StatCard({ label, value, sub, color = textOn }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5" style={{ background: surface, border: `1px solid ${border}` }}>
      <div style={{ color: textFade, fontSize: typography.xs, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
      <div style={{ color, fontWeight: 800, fontSize: typography["2xl"], marginBottom: 2 }}>{value}</div>
      {sub && <div style={{ color: textFade, fontSize: typography.xs }}>{sub}</div>}
    </motion.div>
  )
}

// Payment detail drawer
function PaymentDrawer({ payment, onClose }) {
  if (!payment) return null
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex justify-end"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-md h-full overflow-y-auto"
          style={{ background: "#13104A", borderLeft: `1px solid ${border}` }}
        >
          {/* Drawer header */}
          <div className="sticky top-0 z-10 px-6 py-5 flex items-center justify-between" style={{ background: "#1A1756", borderBottom: `1px solid ${border}` }}>
            <div>
              <div style={{ color: textOn, fontWeight: 700, fontSize: typography.base }}>Payment Details</div>
              <div style={{ color: textFade, fontSize: typography.xs, marginTop: 2, fontFamily: "monospace" }}>#{payment.paypal_capture_id || payment.paypal_order_id}</div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg" style={{ color: textFade }} onMouseEnter={e => e.currentTarget.style.color = textOn} onMouseLeave={e => e.currentTarget.style.color = textFade}>
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Status + amount */}
            <div className="rounded-2xl p-5 text-center" style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="mb-3"><StatusBadge status={payment.status} /></div>
              <div style={{ color: textOn, fontWeight: 800, fontSize: "2rem" }}>₹{payment.amount_inr?.toLocaleString("en-IN") || "—"}</div>
              <div style={{ color: textFade, fontSize: typography.xs, marginTop: 4 }}>≈ ${payment.amount_usd?.toFixed(2)} USD</div>
            </div>

            {/* Route info */}
            {(payment.route_from || payment.route_name) && (
              <div className="rounded-2xl p-5" style={{ background: surface, border: `1px solid ${border}` }}>
                <div style={{ color: textFade, fontSize: typography.xs, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Route</div>
                <div className="space-y-3">
                  {payment.route_name && (
                    <div className="flex justify-between gap-3">
                      <span style={{ color: textFade, fontSize: typography.xs }}>Route</span>
                      <span style={{ color: textOn, fontSize: typography.xs, fontWeight: 600, textAlign: "right" }}>{payment.route_name}</span>
                    </div>
                  )}
                  {payment.route_carrier && (
                    <div className="flex justify-between gap-3">
                      <span style={{ color: textFade, fontSize: typography.xs }}>Carrier</span>
                      <span style={{ color: textOn, fontSize: typography.xs, fontWeight: 600, textAlign: "right" }}>{payment.route_carrier}</span>
                    </div>
                  )}
                  {payment.route_from && (
                    <div className="flex justify-between gap-3">
                      <span style={{ color: textFade, fontSize: typography.xs }}>From</span>
                      <span style={{ color: textOn, fontSize: typography.xs, fontWeight: 600, textAlign: "right" }}>{payment.route_from}</span>
                    </div>
                  )}
                  {payment.route_to && (
                    <div className="flex justify-between gap-3">
                      <span style={{ color: textFade, fontSize: typography.xs }}>To</span>
                      <span style={{ color: textOn, fontSize: typography.xs, fontWeight: 600, textAlign: "right" }}>{payment.route_to}</span>
                    </div>
                  )}
                  {payment.transit_days && (
                    <div className="flex justify-between gap-3">
                      <span style={{ color: textFade, fontSize: typography.xs }}>Transit</span>
                      <span style={{ color: textOn, fontSize: typography.xs, fontWeight: 600 }}>{payment.transit_days} day{payment.transit_days !== 1 ? "s" : ""}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tracking */}
            {payment.tracking_number && (
              <div className="rounded-2xl p-5" style={{ background: "rgba(0,180,216,0.08)", border: "1px solid rgba(0,180,216,0.2)" }}>
                <div style={{ color: textFade, fontSize: typography.xs, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Tracking Number</div>
                <div style={{ color: colors.accent, fontWeight: 800, fontSize: typography.base, fontFamily: "monospace" }}>{payment.tracking_number}</div>
              </div>
            )}

            {/* Transaction IDs */}
            <div className="rounded-2xl p-5" style={{ background: surface, border: `1px solid ${border}` }}>
              <div style={{ color: textFade, fontSize: typography.xs, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Transaction Info</div>
              <div className="space-y-3">
                <div>
                  <div style={{ color: textFade, fontSize: "10px", marginBottom: 3 }}>PayPal Order ID</div>
                  <div style={{ color: textSub, fontSize: "11px", fontFamily: "monospace", wordBreak: "break-all" }}>{payment.paypal_order_id}</div>
                </div>
                {payment.paypal_capture_id && (
                  <div>
                    <div style={{ color: textFade, fontSize: "10px", marginBottom: 3 }}>Capture ID</div>
                    <div style={{ color: textSub, fontSize: "11px", fontFamily: "monospace", wordBreak: "break-all" }}>{payment.paypal_capture_id}</div>
                  </div>
                )}
                <div>
                  <div style={{ color: textFade, fontSize: "10px", marginBottom: 3 }}>Date & Time</div>
                  <div style={{ color: textSub, fontSize: typography.xs }}>
                    {new Date(payment.created_at).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}
                  </div>
                </div>
              </div>
            </div>

            {/* PayPal link */}
            <a
              href={`https://www.sandbox.paypal.com/activity/payment/${payment.paypal_capture_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl transition-all"
              style={{ background: "rgba(255,196,57,0.1)", border: "1px solid rgba(255,196,57,0.25)", color: "#FCD34D", fontSize: typography.sm, fontWeight: 600, textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,196,57,0.18)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,196,57,0.1)"}
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              View on PayPal
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────
export default function PaymentHistory() {
  const [allPayments,  setAllPayments]  = useState([])
  const [filtered,     setFiltered]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState("")
  const [search,       setSearch]       = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selected,     setSelected]     = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError("")
      try {
        const data = await paymentsApi.list()
        setAllPayments(data.payments || [])
        setFiltered(data.payments || [])
      } catch (err) {
        setError(err.message || "Failed to load payments")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Filter whenever search or status changes
  useEffect(() => {
    let result = allPayments
    if (statusFilter !== "all") result = result.filter(p => p.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.tracking_number?.toLowerCase().includes(q) ||
        p.route_name?.toLowerCase().includes(q) ||
        p.route_carrier?.toLowerCase().includes(q) ||
        p.route_from?.toLowerCase().includes(q) ||
        p.route_to?.toLowerCase().includes(q) ||
        p.paypal_order_id?.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [search, statusFilter, allPayments])

  // Stats
  const totalSpentINR = allPayments.filter(p => p.status === "completed").reduce((s, p) => s + (p.amount_inr || 0), 0)
  const totalSpentUSD = allPayments.filter(p => p.status === "completed").reduce((s, p) => s + (p.amount_usd || 0), 0)
  const completedCount = allPayments.filter(p => p.status === "completed").length
  const lastPayment = allPayments[0]

  // Export CSV
  const exportCSV = () => {
    const headers = ["Date", "Tracking No.", "Route", "Carrier", "From", "To", "Amount (INR)", "Amount (USD)", "Status", "PayPal Order ID"]
    const rows = filtered.map(p => [
      new Date(p.created_at).toLocaleDateString("en-IN"),
      p.tracking_number || "",
      p.route_name || "",
      p.route_carrier || "",
      p.route_from || "",
      p.route_to || "",
      p.amount_inr || "",
      p.amount_usd || "",
      p.status,
      p.paypal_order_id || "",
    ])
    const csv  = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = `lorri-payments-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">

      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 style={{ color: textOn, fontSize: typography["3xl"], fontWeight: typography.bold, letterSpacing: typography.tight, marginBottom: 6 }}>
            Payment History
          </h1>
          <p style={{ color: textSub, fontSize: typography.base }}>
            All your shipment payments, tracked in one place
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
          style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${border}`, color: textSub, fontSize: typography.sm, cursor: filtered.length === 0 ? "not-allowed" : "pointer", opacity: filtered.length === 0 ? 0.5 : 1 }}
          onMouseEnter={e => { if (filtered.length > 0) e.currentTarget.style.background = "rgba(255,255,255,0.12)" }}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
        >
          <DocumentArrowDownIcon className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats row */}
      {!loading && allPayments.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Spent" value={`₹${Math.round(totalSpentINR).toLocaleString("en-IN")}`} sub={`≈ $${totalSpentUSD.toFixed(0)} USD`} color={colors.accent} />
          <StatCard label="Transactions" value={completedCount} sub="completed payments" />
          <StatCard label="Last Payment" value={lastPayment ? `₹${lastPayment.amount_inr?.toLocaleString("en-IN") || "—"}` : "—"} sub={lastPayment ? new Date(lastPayment.created_at).toLocaleDateString("en-IN") : "No payments yet"} />
          <StatCard label="Avg. Shipment" value={completedCount > 0 ? `₹${Math.round(totalSpentINR / completedCount).toLocaleString("en-IN")}` : "—"} sub="per booking" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: surface, border: `1px solid ${border}` }}>
          <MagnifyingGlassIcon className="w-4 h-4 shrink-0" style={{ color: textFade }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by tracking, route, carrier…"
            style={{ background: "none", border: "none", outline: "none", color: textOn, fontSize: typography.sm, flex: 1, minWidth: 0 }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ color: textFade, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {["all", "completed", "refunded", "failed"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-2 rounded-xl transition-all capitalize"
              style={{
                background: statusFilter === s ? "rgba(255,255,255,0.14)" : surface,
                border: `1px solid ${statusFilter === s ? "rgba(255,255,255,0.25)" : border}`,
                color: statusFilter === s ? textOn : textFade,
                fontSize: typography.sm, fontWeight: statusFilter === s ? 600 : 400,
              }}
            >
              {s === "all" ? `All (${allPayments.length})` : s}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl animate-pulse h-20" style={{ background: surface }} />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: surface, border: `1px solid rgba(239,68,68,0.2)` }}>
          <ExclamationTriangleIcon className="w-10 h-10 mx-auto mb-3" style={{ color: "#FCA5A5" }} />
          <div style={{ color: "#FCA5A5", fontWeight: 600, marginBottom: 4 }}>Failed to load payments</div>
          <div style={{ color: textFade, fontSize: typography.sm }}>{error}</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: surface, border: `1px solid ${border}` }}>
          <CreditCardIcon className="w-12 h-12 mx-auto mb-4" style={{ color: textFade }} />
          <div style={{ color: textSub, fontWeight: 600, fontSize: typography.lg, marginBottom: 8 }}>
            {search || statusFilter !== "all" ? "No payments match your filters" : "No payments yet"}
          </div>
          <div style={{ color: textFade, fontSize: typography.sm }}>
            {search || statusFilter !== "all" ? "Try adjusting your search or filter." : "Book a shipment to see your payment history here."}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Table header — desktop only */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-5 pb-2" style={{ color: textFade, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <div className="col-span-2">Date</div>
            <div className="col-span-3">Route</div>
            <div className="col-span-2">Carrier</div>
            <div className="col-span-2">Tracking</div>
            <div className="col-span-1">Amount</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1" />
          </div>

          {filtered.map((payment, i) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelected(payment)}
              className="rounded-2xl cursor-pointer transition-all"
              style={{ background: surface, border: `1px solid ${border}` }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = border}
            >
              {/* Desktop row */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-4 items-center">
                <div className="col-span-2">
                  <div style={{ color: textOn, fontSize: typography.xs, fontWeight: 600 }}>
                    {new Date(payment.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                  <div style={{ color: textFade, fontSize: "10px", marginTop: 2 }}>
                    {new Date(payment.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>

                <div className="col-span-3 min-w-0">
                  <div style={{ color: textOn, fontSize: typography.xs, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {payment.route_from && payment.route_to ? `${payment.route_from} → ${payment.route_to}` : payment.route_name || "—"}
                  </div>
                  {payment.route_name && (
                    <div style={{ color: textFade, fontSize: "10px", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{payment.route_name}</div>
                  )}
                </div>

                <div className="col-span-2 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <TruckIcon className="w-3.5 h-3.5 shrink-0" style={{ color: textFade }} />
                    <span style={{ color: textSub, fontSize: typography.xs, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {payment.route_carrier || "—"}
                    </span>
                  </div>
                </div>

                <div className="col-span-2">
                  {payment.tracking_number ? (
                    <span style={{ color: colors.accent, fontSize: "11px", fontFamily: "monospace", fontWeight: 600 }}>
                      {payment.tracking_number}
                    </span>
                  ) : (
                    <span style={{ color: textFade, fontSize: typography.xs }}>—</span>
                  )}
                </div>

                <div className="col-span-1">
                  <div style={{ color: textOn, fontWeight: 700, fontSize: typography.sm }}>
                    ₹{payment.amount_inr?.toLocaleString("en-IN") || "—"}
                  </div>
                  <div style={{ color: textFade, fontSize: "10px" }}>${payment.amount_usd?.toFixed(2)}</div>
                </div>

                <div className="col-span-1">
                  <StatusBadge status={payment.status} />
                </div>

                <div className="col-span-1 flex justify-end">
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" style={{ color: textFade }} />
                </div>
              </div>

              {/* Mobile card */}
              <div className="lg:hidden p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div style={{ color: textOn, fontWeight: 700, fontSize: typography.sm, marginBottom: 2 }}>
                      {payment.route_from && payment.route_to ? `${payment.route_from} → ${payment.route_to}` : payment.route_name || "Shipment"}
                    </div>
                    <div style={{ color: textFade, fontSize: typography.xs }}>
                      {new Date(payment.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      {payment.route_carrier && ` · ${payment.route_carrier}`}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div style={{ color: textOn, fontWeight: 800, fontSize: typography.base }}>₹{payment.amount_inr?.toLocaleString("en-IN") || "—"}</div>
                    <div style={{ color: textFade, fontSize: "10px" }}>${payment.amount_usd?.toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={payment.status} />
                  {payment.tracking_number && (
                    <span style={{ color: colors.accent, fontSize: "11px", fontFamily: "monospace" }}>{payment.tracking_number}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Payment detail drawer */}
      <PaymentDrawer payment={selected} onClose={() => setSelected(null)} />
    </div>
  )
}