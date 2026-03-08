import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon,
  CheckCircleIcon, TruckIcon, ClockIcon,
  ExclamationCircleIcon, ChevronUpDownIcon,
  ChevronLeftIcon, ChevronRightIcon, CubeIcon,
  XMarkIcon, EyeSlashIcon, EyeIcon,
} from "@heroicons/react/24/outline"
import { colors, typography } from "../styles"
import { orders as ordersApi, shipments as shipmentsApi } from "../lib/api"
import cargoImg     from "../assets/cargo.png"
import truckImg     from "../assets/container-truck.png"
import pendingImg   from "../assets/clock.png"
import deliveredImg from "../assets/delivered.png"
import delayedImg   from "../assets/file.png"

const surface    = "#332B7A"
const surfaceMid = "#3D3585"
const border     = "rgba(255,255,255,0.1)"
const textOn     = "rgba(255,255,255,0.95)"
const textSub    = "rgba(255,255,255,0.65)"
const textFade   = "rgba(255,255,255,0.35)"
const inputBg    = "rgba(255,255,255,0.06)"

const STATUS = {
  delivered:  { label: "Delivered",  color: colors.success, Icon: CheckCircleIcon       },
  in_transit: { label: "In Transit", color: colors.accent,  Icon: TruckIcon             },
  pending:    { label: "Pending",    color: colors.warning, Icon: CubeIcon              },
  delayed:    { label: "Delayed",    color: colors.error,   Icon: ExclamationCircleIcon },
  cancelled:  { label: "Cancelled",  color: "#A78BFA",      Icon: ExclamationCircleIcon },
}

const PAGE_SIZE = 6

function Skeleton() {
  return <div className="h-14 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
}

export default function OrderHistory() {
  const [search,       setSearch]   = useState("")
  const [filterStatus, setFilter]   = useState("all")
  const [sortField,    setSortField] = useState("created_at")
  const [sortDir,      setSortDir]   = useState("desc")
  const [page,         setPage]      = useState(1)
  const [focused,      setFocused]   = useState(false)

  const [orders,     setOrders]   = useState([])
  const [total,      setTotal]    = useState(0)
  const [counts,     setCounts]   = useState({ total: 0, delivered: 0, inTransit: 0, pending: 0, delayed: 0, cancelled: 0 })
  const [loading,    setLoading]  = useState(true)
  const [error,      setError]    = useState("")

  // Cancel state
  const [confirmId,   setConfirmId]  = useState(null)   // order id awaiting confirm
  const [cancelling,  setCancelling] = useState(null)   // order id being cancelled
  const [showCancelled, setShowCancelled] = useState(false)

  const handleCancel = async (order) => {
    setCancelling(order.id)
    try {
      await shipmentsApi.update(order.id, { status: "cancelled" })
      // Update row in-place immediately
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "cancelled" } : o))
      setCounts(prev => ({
        ...prev,
        cancelled: prev.cancelled + 1,
        // decrement previous status count
        pending:    order.status === "pending"    ? prev.pending - 1    : prev.pending,
        inTransit:  order.status === "in_transit" ? prev.inTransit - 1  : prev.inTransit,
        delayed:    order.status === "delayed"    ? prev.delayed - 1    : prev.delayed,
      }))
    } catch (e) {
      setError(e.message || "Could not cancel order")
    } finally {
      setCancelling(null)
      setConfirmId(null)
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        ...(filterStatus !== "all" && { status: filterStatus }),
        ...(search && { search }),
        sort: sortField,
        dir:  sortDir,
      }
      const data = await ordersApi.list(params)
      setOrders(data.orders ?? [])
      setTotal(data.total ?? 0)
      setCounts(data.counts ?? { total: 0, delivered: 0, inTransit: 0, pending: 0, delayed: 0 })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, filterStatus, search, sortField, sortDir])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortField(field); setSortDir("asc") }
    setPage(1)
  }

  const handleExport = () => {
    const url = ordersApi.exportUrl()
    const a = document.createElement("a")
    a.href = url
    a.download = "orders.csv"
    a.click()
  }

  const statCards = [
    { label: "Total Orders", value: counts.total,     color: colors.accent,  img: cargoImg,     bg: "rgba(0,180,216,0.12)",   bdr: "rgba(0,180,216,0.2)"   },
    { label: "Delivered",    value: counts.delivered,  color: colors.success, img: deliveredImg, bg: "rgba(34,197,94,0.1)",    bdr: "rgba(34,197,94,0.2)"   },
    { label: "In Transit",   value: counts.inTransit,  color: "#A5B4FC",      img: truckImg,     bg: "rgba(165,180,252,0.1)",  bdr: "rgba(165,180,252,0.2)" },
    { label: "Pending",      value: counts.pending,    color: colors.warning, img: pendingImg,   bg: "rgba(245,158,11,0.1)",   bdr: "rgba(245,158,11,0.2)"  },
    { label: "Cancelled",    value: counts.cancelled,  color: "#A78BFA",      img: delayedImg,   bg: "rgba(167,139,250,0.1)",  bdr: "rgba(167,139,250,0.2)" },
  ]

  const SortBtn = ({ field, children }) => (
    <button onClick={() => toggleSort(field)} className="flex items-center gap-1 group"
      style={{ color: sortField === field ? textOn : textSub }}>
      {children}
      <ChevronUpDownIcon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
    </button>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 style={{ color: textOn, fontSize: typography["3xl"], fontWeight: typography.bold, letterSpacing: typography.tight, marginBottom: 6 }}>
            Order History
          </h1>
          <p style={{ color: textSub, fontSize: typography.base }}>Track and manage all your shipment orders</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleExport}
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl transition-all"
            style={{ background: surfaceMid, border: `1px solid ${border}`, color: textSub, fontSize: typography.sm }}>
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => setShowCancelled(v => !v)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl transition-all"
            style={{ background: showCancelled ? "rgba(167,139,250,0.12)" : surfaceMid, border: `1px solid ${showCancelled ? "rgba(167,139,250,0.3)" : border}`, color: showCancelled ? "#A78BFA" : textSub, fontSize: typography.sm }}>
            {showCancelled ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            <span className="hidden sm:inline">{showCancelled ? "Hide Cancelled" : "Show Cancelled"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5" }}>
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{ background: surface, border: `1px solid ${border}` }}>
            <div className="flex items-start justify-between mb-5">
              <div className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center"
                style={{ background: s.bg, border: `1px solid ${s.bdr}` }}>
                <motion.img whileHover={{ scale: 1.15, rotate: 3 }} src={s.img} alt={s.label}
                  style={{ width: 48, height: 48, objectFit: "contain" }} />
              </div>
            </div>
            <div style={{ color: textSub, fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
              {s.label}
            </div>
            <div style={{ color: textOn, fontSize: typography["3xl"], fontWeight: typography.bold, lineHeight: 1 }}>
              {loading ? "—" : s.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="rounded-2xl p-4 sm:p-5" style={{ background: surface, border: `1px solid ${border}` }}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative min-w-0">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: textFade }} />
            <input type="text" placeholder="Search by ID, origin, destination, cargo..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{ width: "100%", background: inputBg, border: `1.5px solid ${focused ? "rgba(255,255,255,0.4)" : border}`, borderRadius: "0.75rem", padding: "0.65rem 1rem 0.65rem 2.75rem", color: textOn, fontSize: typography.sm, outline: "none" }}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <FunnelIcon className="w-4 h-4 shrink-0" style={{ color: textFade }} />
            <select value={filterStatus} onChange={e => { setFilter(e.target.value); setPage(1) }}
              style={{ background: inputBg, border: `1.5px solid ${border}`, borderRadius: "0.75rem", padding: "0.65rem 1rem", color: textOn, fontSize: typography.sm, outline: "none", cursor: "pointer" }}>
              <option value="all">All Status</option>
              <option value="delivered">Delivered</option>
              <option value="in_transit">In Transit</option>
              <option value="pending">Pending</option>
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-2xl overflow-hidden" style={{ background: surface, border: `1px solid ${border}` }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${border}` }}>
                <th className="pl-6 pr-4 py-4 text-left" style={{ color: textSub, fontSize: typography.xs, fontWeight: typography.semibold, textTransform: "uppercase" }}>
                  <SortBtn field="tracking_number">Order ID</SortBtn>
                </th>
                <th className="px-4 py-4 text-left" style={{ color: textSub, fontSize: typography.xs, fontWeight: typography.semibold, textTransform: "uppercase" }}>Route</th>
                <th className="px-4 py-4 text-left" style={{ color: textSub, fontSize: typography.xs, fontWeight: typography.semibold, textTransform: "uppercase" }}>Cargo</th>
                <th className="px-4 py-4 text-left" style={{ color: textSub, fontSize: typography.xs, fontWeight: typography.semibold, textTransform: "uppercase" }}>
                  <SortBtn field="declared_value">Value</SortBtn>
                </th>
                <th className="px-4 py-4 text-left" style={{ color: textSub, fontSize: typography.xs, fontWeight: typography.semibold, textTransform: "uppercase" }}>ETA</th>
                <th className="px-4 pr-6 py-4 text-left" style={{ color: textSub, fontSize: typography.xs, fontWeight: typography.semibold, textTransform: "uppercase" }}>Status</th>
                <th className="px-4 pr-6 py-4 text-left" style={{ color: textSub, fontSize: typography.xs, fontWeight: typography.semibold, textTransform: "uppercase" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(PAGE_SIZE).fill(0).map((_, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${border}` }}>
                      <td colSpan={7} className="px-6 py-3"><Skeleton /></td>
                    </tr>
                  ))
                : orders.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center" style={{ color: textSub }}>
                        <CubeIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>No orders found</p>
                        {(search || filterStatus !== "all") && (
                          <button onClick={() => { setSearch(""); setFilter("all") }}
                            className="mt-3 text-sm" style={{ color: colors.accent }}>
                            Clear filters
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                  : orders
                      .filter(o => showCancelled || o.status !== "cancelled")
                      .map(o => {
                      const s = STATUS[o.status] ?? STATUS.pending
                      const isCancelled = o.status === "cancelled"
                      const isConfirming = confirmId === o.id
                      const isCancelling = cancelling === o.id
                      return (
                        <tr key={o.id}
                          style={{ borderBottom: `1px solid ${border}`, opacity: isCancelled ? 0.55 : 1, transition: "opacity 0.2s" }}
                          onMouseEnter={e => e.currentTarget.style.background = surfaceMid}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <td className="pl-6 pr-4 py-4 font-mono font-bold text-sm" style={{ color: colors.accent }}>
                            {o.tracking_number}
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm" style={{ color: textOn }}>{o.origin_city}, {o.origin_state}</div>
                            <div className="text-xs" style={{ color: textSub }}>→ {o.dest_city}, {o.dest_state}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium" style={{ color: textOn }}>{o.commodity || o.cargo_type || "—"}</div>
                            <div className="text-xs" style={{ color: textFade }}>{o.weight ? `${o.weight} ${o.weight_unit || "kg"}` : ""}</div>
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold" style={{ color: textOn }}>
                            {o.declared_value ? `₹${Number(o.declared_value).toLocaleString("en-IN")}` : "—"}
                          </td>
                          <td className="px-4 py-4 text-xs" style={{ color: textSub }}>
                            {o.eta ? new Date(o.eta).toLocaleDateString("en-IN") : "—"}
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap"
                              style={{ background: `${s.color}15`, border: `1px solid ${s.color}35`, color: s.color, fontSize: "11px", fontWeight: 600 }}>
                              <s.Icon className="w-3.5 h-3.5" strokeWidth={2.5} />{s.label}
                            </span>
                          </td>
                          <td className="px-4 pr-6 py-3">
                            {isCancelled ? (
                              <span style={{ color: textFade, fontSize: typography.xs }}>—</span>
                            ) : isConfirming ? (
                              <div className="flex items-center gap-1.5">
                                <button onClick={() => handleCancel(o)} disabled={isCancelling}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                                  style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)", color: "#FCA5A5" }}>
                                  {isCancelling ? "…" : "Confirm"}
                                </button>
                                <button onClick={() => setConfirmId(null)}
                                  className="px-2.5 py-1 rounded-lg text-xs transition-all"
                                  style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${border}`, color: textSub }}>
                                  Keep
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => setConfirmId(o.id)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all"
                                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171" }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
                                onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}>
                                <XMarkIcon className="w-3.5 h-3.5" /> Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: `1px solid ${border}` }}>
            <p style={{ color: textFade, fontSize: typography.sm }}>
              {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-1.5">
              <PageBtn disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeftIcon className="w-3.5 h-3.5" />
              </PageBtn>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <PageBtn key={p} active={p === page} onClick={() => setPage(p)}>{p}</PageBtn>
              ))}
              <PageBtn disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </PageBtn>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function PageBtn({ children, active, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm"
      style={{
        background: active ? colors.gradientAccent : "rgba(255,255,255,0.06)",
        border: `1px solid ${active ? "transparent" : border}`,
        color: active ? "#fff" : disabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.65)",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: active ? 700 : 400,
      }}>
      {children}
    </button>
  )
}