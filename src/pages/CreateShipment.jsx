import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CubeIcon,
  MapPinIcon,
  ArchiveBoxIcon,
  TruckIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  BookmarkIcon,
  CheckIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { RouteSelection } from "../components/RouteSelection"
import AILoadingScreen from "../components/AILoadingScreen"
import { colors, typography } from "../styles"
import { auth, shipments as shipmentsApi } from "../lib/api"
import { getCached } from "../lib/prefetchCache"

const surface     = "#332B7A"
const surfaceDark = "#1E1856"
const border      = "rgba(255,255,255,0.1)"
const borderFocus = "rgba(0,180,216,0.7)"
const textOn      = "rgba(255,255,255,0.95)"
const textSub     = "rgba(255,255,255,0.65)"
const textFade    = "rgba(255,255,255,0.35)"
const inputBg     = "#1E1A4E"
const selectBg    = "#251E5C"

const inputStyle = {
  width: "100%",
  background: inputBg,
  border: `1.5px solid ${border}`,
  borderRadius: "0.75rem",
  padding: "0.65rem 1rem",
  color: textOn,
  fontSize: typography.sm,
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
}

const selectStyle = {
  ...inputStyle,
  background: selectBg,
  appearance: "none",
  cursor: "pointer",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='none' stroke='rgba(255,255,255,0.4)' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: "2.2rem",
}

const labelStyle = {
  display: "block",
  color: textSub,
  fontSize: typography.xs,
  fontWeight: typography.semibold,
  letterSpacing: typography.wider,
  textTransform: "uppercase",
  marginBottom: "0.4rem",
}

// ── Helpers ────────────────────────────────────────────────
const todayISO = () => new Date().toISOString().split("T")[0]
const daysLater = (n) => {
  const d = new Date(); d.setDate(d.getDate() + n)
  return d.toISOString().split("T")[0]
}

// Convert a raw DB shipment row → a profile override object
function shipmentToProfile(s) {
  return {
    id:    s.id,
    label: `${s.origin_city || "?"} → ${s.dest_city || "?"}`,
    tag:   s.carrier || s.transport_mode || "Past Shipment",
    color: "#6C63FF",
    trackingNumber: s.tracking_number,
    overrides: {
      serviceLevel:         s.service_level      || "standard",
      transportMode:        s.transport_mode      || "road",
      incoterms:            s.incoterms           || "ddp",
      originCompany:        s.origin_company      || "",
      originContact:        s.origin_contact      || "",
      originPhone:          s.origin_phone        || "",
      originEmail:          s.origin_email        || "",
      originAddress:        s.origin_address      || "",
      originCity:           s.origin_city         || "",
      originState:          s.origin_state        || "",
      originZip:            s.origin_zip          || "",
      originCountry:        s.origin_country      || "India",
      destCompany:          s.dest_company        || "",
      destContact:          s.dest_contact        || "",
      destPhone:            s.dest_phone          || "",
      destEmail:            s.dest_email          || "",
      destAddress:          s.dest_address        || "",
      destCity:             s.dest_city           || "",
      destState:            s.dest_state          || "",
      destZip:              s.dest_zip            || "",
      destCountry:          s.dest_country        || "India",
      cargoType:            s.cargo_type          || "general",
      commodityDescription: s.commodity           || "",
      hsCode:               s.hs_code             || "",
      numberOfPieces:       s.pieces != null ? String(s.pieces) : "",
      totalWeight:          s.weight != null ? String(s.weight) : "",
      weightUnit:           s.weight_unit         || "kg",
      dimensions:           s.dimensions          || "",
      volume:               s.volume != null ? String(s.volume) : "",
      volumeUnit:           s.volume_unit         || "cbm",
      declaredValue:        s.declared_value != null ? String(s.declared_value) : "",
      currency:             s.currency            || "INR",
      preferredCarrier:     s.carrier             || "",
      equipmentType:        s.equipment_type      || "20ft",
      specialHandling:      s.special_handling    || "",
      temperatureControl:   s.temperature_control || "",
      readyDate:            todayISO(),
      requiredDeliveryDate: daysLater(5),
      invoiceNumber:        "",
      poNumber:             s.po_number           || "",
      specialInstructions:  s.special_instructions || "",
      insuranceRequired:    s.insurance_required  || false,
      insuranceValue:       s.insurance_value != null ? String(s.insurance_value) : "",
    },
  }
}

// ── Fallback profiles used when user has no shipments yet ─
const FALLBACK_PROFILES = [
  {
    id: "axiom-to-nexora",
    label: "Axiom → Nexora",
    tag: "Frequent Shipper",
    color: "#6C63FF",
    trackingNumber: null,
    overrides: {
      serviceLevel: "express", transportMode: "road", incoterms: "ddp",
      originCompany:        "Axiom Industrial Supplies Pvt Ltd",
      originContact:        "Surdeep Kannan",
      originPhone:          "",
      originEmail:          "",
      originAddress:        "Plot 12, MIDC Taloja Industrial Area",
      originCity:           "Navi Mumbai",
      originState:          "Maharashtra",
      originZip:            "410208",
      originCountry:        "India",
      destCompany:          "Nexora Electronics Pvt Ltd",
      destContact:          "Surdeep",
      destPhone:            "",
      destEmail:            "",
      destAddress:          "42, Ambattur Industrial Estate, Phase 2",
      destCity:             "Chennai",
      destState:            "Tamil Nadu",
      destZip:              "600058",
      destCountry:          "India",
      cargoType:            "general",
      commodityDescription: "Industrial Control Panels and Switchgear Components",
      hsCode:               "8537.10.00",
      numberOfPieces:       "18",
      totalWeight:          "5400",
      weightUnit:           "kg",
      dimensions:           "120 × 100 × 90 cm",
      volume:               "22",
      volumeUnit:           "cbm",
      declaredValue:        "340000",
      currency:             "INR",
      preferredCarrier:     "VRL Logistics",
      equipmentType:        "20ft",
      specialHandling:      "Fragile electrical components — keep upright",
      temperatureControl:   "",
      readyDate:            todayISO(),
      requiredDeliveryDate: daysLater(5),
      invoiceNumber:        "INV-2026-4412",
      poNumber:             "PO-2026-NM-089",
      specialInstructions:  "Delivery requires signature. Keep away from moisture. Do not stack more than 2 units high.",
      insuranceRequired:    true,
      insuranceValue:       "380000",
    },
  },
  {
    id: "nexora-return",
    label: "Nexora → Axiom (Return)",
    tag: "Return Shipment",
    color: "#00B4D8",
    trackingNumber: null,
    overrides: {
      serviceLevel: "standard", transportMode: "road", incoterms: "exw",
      originCompany:        "Nexora Electronics Pvt Ltd",
      originContact:        "Surdeep",
      originPhone:          "",
      originEmail:          "",
      originAddress:        "42, Ambattur Industrial Estate, Phase 2",
      originCity:           "Chennai",
      originState:          "Tamil Nadu",
      originZip:            "600058",
      originCountry:        "India",
      destCompany:          "Axiom Industrial Supplies Pvt Ltd",
      destContact:          "Surdeep Kannan",
      destPhone:            "",
      destEmail:            "",
      destAddress:          "Plot 12, MIDC Taloja Industrial Area",
      destCity:             "Navi Mumbai",
      destState:            "Maharashtra",
      destZip:              "410208",
      destCountry:          "India",
      cargoType:            "general",
      commodityDescription: "Return — Defective Switchgear Units",
      hsCode:               "8537.10.00",
      numberOfPieces:       "4",
      totalWeight:          "1200",
      weightUnit:           "kg",
      dimensions:           "120 × 100 × 90 cm",
      volume:               "5",
      volumeUnit:           "cbm",
      declaredValue:        "80000",
      currency:             "INR",
      preferredCarrier:     "VRL Logistics",
      equipmentType:        "lcl",
      specialHandling:      "Handle with care — return goods",
      temperatureControl:   "",
      readyDate:            todayISO(),
      requiredDeliveryDate: daysLater(7),
      invoiceNumber:        "RET-2026-0089",
      poNumber:             "PO-2026-NM-089",
      specialInstructions:  "Return shipment. Attach RMA label on each unit.",
      insuranceRequired:    false,
      insuranceValue:       "",
    },
  },
]

// ── Saved Profile Dropdown (dynamic — loads from DB) ─────
function SavedProfilePicker({ activeId, onSelect, onClear }) {
  const [open,     setOpen]     = useState(false)
  const [profiles, setProfiles] = useState([])
  const [loading,  setLoading]  = useState(false)
  const ref = useRef(null)

  const active = profiles.find(p => p.id === activeId)

  // Load past shipments from DB and convert to profiles
  useEffect(() => {
  let mounted = true

  async function load() {
    setLoading(true)
    try {
      const data = await shipmentsApi.list({ limit: 10, offset: 0 })

      if (!mounted) return

      const shipmentList = data.shipments ?? []
        if (shipmentList.length === 0) {
          // No real shipments yet — show hardcoded demo profiles
          setProfiles(FALLBACK_PROFILES)
        } else {
          // Deduplicate by route so we don't show 10 identical entries
          const seen = new Set()
          const unique = []
          for (const s of shipmentList) {
            const key = `${s.origin_city}|${s.dest_city}`
            if (!seen.has(key)) {
              seen.add(key)
              unique.push(shipmentToProfile(s))
            }
          }
          setProfiles(unique)
        }
      } catch (_) {
        // On any error also fall back to demo profiles
        setProfiles(FALLBACK_PROFILES)
      } finally {
        setLoading(false)
      }
    }
      load()

  return () => {
    mounted = false
  }
}, [])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "9px 14px",
          borderRadius: "0.75rem",
          background: active ? `${active.color}12` : "rgba(255,255,255,0.06)",
          border: `1.5px solid ${active ? active.color + "45" : border}`,
          color: active ? textOn : textSub,
          fontSize: typography.sm,
          fontWeight: typography.semibold,
          cursor: "pointer",
          transition: "all 0.18s",
        }}
      >
        <BookmarkIcon style={{ width: 15, height: 15, color: active ? active.color : textFade }} />
        <span>{active ? active.label : "Repeat Past Shipment"}</span>
        <ChevronDownIcon style={{
          width: 13, height: 13, color: textFade,
          transform: open ? "rotate(180deg)" : "none",
          transition: "transform 0.2s",
        }} />
      </button>

      {active && (
        <button
          type="button"
          onClick={onClear}
          title="Clear profile"
          style={{
            padding: "9px 11px",
            borderRadius: "0.75rem",
            background: "rgba(239,68,68,0.08)",
            border: "1.5px solid rgba(239,68,68,0.2)",
            color: "#F87171",
            cursor: "pointer",
            display: "flex", alignItems: "center",
          }}
        >
          <XMarkIcon style={{ width: 14, height: 14 }} />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              minWidth: "min(320px, 90vw)",
              zIndex: 200,
              borderRadius: "1rem",
              background: "#14113A",
              border: `1px solid ${border}`,
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "8px 14px 6px", borderBottom: `1px solid ${border}` }}>
              <span style={{ color: textFade, fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Repeat a Past Shipment
              </span>
            </div>

            {loading ? (
              <div style={{ padding: "20px 14px", textAlign: "center", color: textFade, fontSize: typography.sm }}>
                Loading…
              </div>
            ) : (
              profiles.map((profile, i) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => { onSelect(profile); setOpen(false) }}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    display: "flex", alignItems: "center", gap: 12,
                    background: activeId === profile.id ? `${profile.color}10` : "transparent",
                    border: "none",
                    borderBottom: i < profiles.length - 1 ? `1px solid ${border}` : "none",
                    cursor: "pointer",
                    transition: "background 0.15s",
                    textAlign: "left",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = `${profile.color}0E`}
                  onMouseLeave={e => e.currentTarget.style.background = activeId === profile.id ? `${profile.color}10` : "transparent"}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: "0.6rem", flexShrink: 0,
                    background: `${profile.color}15`,
                    border: `1px solid ${profile.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <BookmarkIcon style={{ width: 16, height: 16, color: profile.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: textOn, fontWeight: 600, fontSize: typography.sm, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {profile.label}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                      <span style={{
                        color: profile.color, fontSize: "10px", fontWeight: 700,
                        padding: "1px 8px", borderRadius: 99,
                        background: `${profile.color}12`,
                        border: `1px solid ${profile.color}25`,
                      }}>
                        {profile.tag}
                      </span>
                      {profile.trackingNumber && (
                        <span style={{ color: textFade, fontSize: "10px", fontFamily: "monospace" }}>
                          {profile.trackingNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  {activeId === profile.id && <CheckIcon style={{ width: 15, height: 15, color: profile.color, flexShrink: 0 }} />}
                </button>
              ))
            )}

            <div style={{ padding: "8px 14px", borderTop: `1px solid ${border}` }}>
              <span style={{ color: textFade, fontSize: "11px" }}>
                Fills all fields from selected shipment — dates reset to today
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────
function SectionCard({ icon: Icon, iconColor, title, children, delay = 0, badge = null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl overflow-hidden"
      style={{ background: surface, border: `1px solid ${border}` }}
    >
      <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${border}` }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${iconColor}15`, border: `1px solid ${iconColor}25` }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
        <h2 style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.base }}>
          {title}
        </h2>
        {badge && (
          <span className="ml-auto text-xs px-2.5 py-1 rounded-full" style={{
            color: badge.color,
            background: `${badge.color}18`,
            border: `1px solid ${badge.color}40`,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}>
            {badge.label}
          </span>
        )}
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, type = "text", placeholder, required }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputStyle,
        borderColor: focused ? borderFocus : border,
        boxShadow: focused ? "0 0 0 3px rgba(255,255,255,0.05)" : "none",
      }}
    />
  )
}

function Select({ value, onChange, children, required }) {
  const [focused, setFocused] = useState(false)
  return (
    <select
      value={value}
      onChange={onChange}
      required={required}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...selectStyle, borderColor: focused ? borderFocus : border }}
    >
      {children}
    </select>
  )
}

// ── Main Component ────────────────────────────────────────
export default function CreateShipment() {
  const today    = new Date().toISOString().split("T")[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]

  const [formData, setFormData] = useState(() => {
    try {
      const saved = sessionStorage.getItem("lorri_form_data")
      if (saved) return JSON.parse(saved)
    } catch {}
    return {
      serviceLevel: "express",
      transportMode: "road",
      incoterms: "ddp",
      originCompany: "", originContact: "", originPhone: "", originEmail: "",
      originAddress: "", originCity: "", originState: "", originZip: "", originCountry: "India",
      destCompany: "", destContact: "", destPhone: "", destEmail: "",
      destAddress: "", destCity: "", destState: "", destZip: "", destCountry: "India",
      cargoType: "general",
      commodityDescription: "", hsCode: "",
      numberOfPieces: "", totalWeight: "", weightUnit: "kg",
      dimensions: "", volume: "", volumeUnit: "cbm",
      declaredValue: "", currency: "INR",
      preferredCarrier: "", equipmentType: "20ft",
      specialHandling: "", temperatureControl: "",
      readyDate: today, requiredDeliveryDate: tomorrow,
      invoiceNumber: "", poNumber: "",
      specialInstructions: "",
      insuranceRequired: false, insuranceValue: "",
    }
  })

  const [isAnalysing, setIsAnalysing]           = useState(false)
  const [routeReady,  setRouteReady]            = useState(false)
  const [profileLoaded, setProfileLoaded]       = useState(false)
  const [activeProfileId, setActiveProfileId]   = useState(null)
  const [activeProfileLabel, setActiveProfileLabel] = useState("")

  // ── Persist route-selection state across reloads ──────────
  const [showRouteSelection, setShowRouteSelection] = useState(() => {
    try { return sessionStorage.getItem("lorri_show_route") === "true" } catch { return false }
  })

  const goToRouteSelection = () => {
    try { sessionStorage.setItem("lorri_show_route", "true") } catch {}
    setShowRouteSelection(true)
  }

  const goBackToForm = () => {
    try {
      sessionStorage.removeItem("lorri_show_route")
      sessionStorage.removeItem("lorri_form_data")
      sessionStorage.removeItem("lorri_route_cache")
    } catch {}
    setShowRouteSelection(false)
    setRouteReady(false)
    setIsAnalysing(false)
  }

  // Pre-fill origin from logged-in user's profile/company
  useEffect(() => {
  let mounted = true

  async function prefill() {
    try {
      let data = getCached("auth:me")
      if (!data) data = await auth.me()

      if (!mounted) return

      const u  = data?.user
      const p  = u?.profile ?? u
      const co = p?.companies ?? {}

      setFormData(prev => ({
        ...prev,
        originContact: prev.originContact || p?.full_name || "",
        originPhone: prev.originPhone || p?.mobile_number || "",
        originEmail: prev.originEmail || u?.email || "",
        originCompany: prev.originCompany || co?.name || "",
        originAddress: prev.originAddress || co?.address || "",
        originCity: prev.originCity || co?.city || "",
        originState: prev.originState || co?.state || "",
        originZip: prev.originZip || co?.zip || "",
        originCountry: prev.originCountry || co?.country || "India",
      }))
    } catch (_) {}
    finally {
      if (mounted) setProfileLoaded(true)
    }
  }

  prefill()

  return () => {
    mounted = false
  }
}, []) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key, val) => setFormData(prev => {
    const next = { ...prev, [key]: val }
    try { sessionStorage.setItem("lorri_form_data", JSON.stringify(next)) } catch {}
    return next
  })

  const handleSelectProfile = (profile) => {
    const next = { ...formData, ...profile.overrides }
    setFormData(next)
    try { sessionStorage.setItem("lorri_form_data", JSON.stringify(next)) } catch {}
    setActiveProfileId(profile.id)
    setActiveProfileLabel(profile.label)
  }

  const handleClearProfile = () => {
    setActiveProfileId(null)
    setActiveProfileLabel("")
    setFormData(prev => ({
      ...prev,
      serviceLevel: "express", transportMode: "road", incoterms: "ddp",
      destCompany: "", destContact: "", destPhone: "", destEmail: "",
      destAddress: "", destCity: "", destState: "", destZip: "", destCountry: "India",
      cargoType: "general", commodityDescription: "", hsCode: "",
      numberOfPieces: "", totalWeight: "", weightUnit: "kg",
      dimensions: "", volume: "", volumeUnit: "cbm", declaredValue: "", currency: "INR",
      preferredCarrier: "", equipmentType: "20ft", specialHandling: "", temperatureControl: "",
      readyDate: today, requiredDeliveryDate: tomorrow,
      invoiceNumber: "", poNumber: "", specialInstructions: "",
      insuranceRequired: false, insuranceValue: "",
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setRouteReady(false)
    setIsAnalysing(true)
    goToRouteSelection()
  }

  return (
    <>
      {isAnalysing && (
        <AILoadingScreen
          routeReady={routeReady}
          onComplete={() => {
            setIsAnalysing(false)
            setTimeout(() => window.dispatchEvent(new Event("resize")), 50)
            setTimeout(() => window.dispatchEvent(new Event("resize")), 300)
          }}
        />
      )}

      {showRouteSelection ? (
        <div className="w-full h-full pb-10">
          <RouteSelection formData={formData} onBack={goBackToForm} onReady={() => setRouteReady(true)} />
        </div>
      ) : (
        <div className="max-w-5xl mx-auto py-6">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
            {/* Header row */}
            <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
              <div>
                <h1 style={{ color: textOn, fontSize: typography["3xl"], fontWeight: typography.bold, letterSpacing: typography.tight, marginBottom: 6 }}>
                  Create New Shipment
                </h1>
                <p style={{ color: textSub, fontSize: typography.base }}>
                  Enter shipment details to generate a quote and book
                </p>
              </div>
              <SavedProfilePicker
                activeId={activeProfileId}
                onSelect={handleSelectProfile}
                onClear={handleClearProfile}
              />
            </div>

            {/* Active profile banner */}
            <AnimatePresence>
              {activeProfileId && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden" }}
                >
                  <div
                    className="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: "rgba(108,99,255,0.1)", border: "1.5px solid rgba(108,99,255,0.28)" }}
                  >
                    <BookmarkIcon style={{ width: 15, height: 15, color: "#A5B4FC", flexShrink: 0 }} />
                    <p style={{ color: "rgba(196,181,253,0.9)", fontSize: typography.sm }}>
                      <strong style={{ color: textOn }}>
                        {activeProfileLabel || "Saved profile"}
                      </strong>{" "}
                      loaded — all fields pre-filled from past shipment.{" "}
                      <span style={{ color: "rgba(255,255,255,0.4)" }}>
                        Dates have been reset to today. Review all fields before submitting.
                      </span>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Shipment Type */}
            <SectionCard icon={CubeIcon} iconColor={colors.accent} title="Shipment Type" delay={0.05}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Service Level">
                  <Select value={formData.serviceLevel} onChange={(e) => set("serviceLevel", e.target.value)} required>
                    <option value="">Select service</option>
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                    <option value="economy">Economy</option>
                    <option value="priority">Priority</option>
                  </Select>
                </Field>
                <Field label="Transport Mode">
                  <Select value={formData.transportMode} onChange={(e) => set("transportMode", e.target.value)} required>
                    <option value="">Select mode</option>
                    <option value="ocean">Ocean Freight</option>
                    <option value="air">Air Freight</option>
                    <option value="road">Road Freight</option>
                    <option value="rail">Rail Freight</option>
                    <option value="multimodal">Multimodal</option>
                  </Select>
                </Field>
                <Field label="Incoterms">
                  <Select value={formData.incoterms} onChange={(e) => set("incoterms", e.target.value)} required>
                    <option value="">Select incoterm</option>
                    <option value="exw">EXW — Ex Works</option>
                    <option value="fob">FOB — Free on Board</option>
                    <option value="cif">CIF — Cost, Insurance &amp; Freight</option>
                    <option value="ddp">DDP — Delivered Duty Paid</option>
                    <option value="dap">DAP — Delivered at Place</option>
                  </Select>
                </Field>
              </div>
            </SectionCard>

            {/* Origin & Destination */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <SectionCard
                icon={MapPinIcon}
                iconColor={colors.accent}
                title="Origin Details"
                delay={0.1}
                badge={
                  activeProfileId
                    ? { label: "Loaded from saved profile", color: "#6C63FF" }
                    : profileLoaded && formData.originCompany
                    ? { label: "Auto-filled from your profile", color: colors.success }
                    : profileLoaded
                    ? { label: "Fill your company in Settings to auto-fill", color: "rgba(255,255,255,0.35)" }
                    : null
                }
              >
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Company Name">
                      <Input value={formData.originCompany} onChange={(e) => set("originCompany", e.target.value)} placeholder="Origin company" required />
                    </Field>
                    <Field label="Contact Person">
                      <Input value={formData.originContact} onChange={(e) => set("originContact", e.target.value)} placeholder="Contact name" required />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Phone">
                      <Input type="tel" value={formData.originPhone} onChange={(e) => set("originPhone", e.target.value)} placeholder="+91 00000 00000" required />
                    </Field>
                    <Field label="Email">
                      <Input type="email" value={formData.originEmail} onChange={(e) => set("originEmail", e.target.value)} placeholder="contact@company.com" required />
                    </Field>
                  </div>
                  <Field label="Street Address">
                    <Input value={formData.originAddress} onChange={(e) => set("originAddress", e.target.value)} placeholder="Street address" required />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="City">
                      <Input value={formData.originCity} onChange={(e) => set("originCity", e.target.value)} placeholder="City" required />
                    </Field>
                    <Field label="State">
                      <Input value={formData.originState} onChange={(e) => set("originState", e.target.value)} placeholder="State" required />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Postal Code">
                      <Input value={formData.originZip} onChange={(e) => set("originZip", e.target.value)} placeholder="ZIP / Postal" required />
                    </Field>
                    <Field label="Country">
                      <Input value={formData.originCountry} onChange={(e) => set("originCountry", e.target.value)} placeholder="Country" required />
                    </Field>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                icon={MapPinIcon}
                iconColor={colors.success}
                title="Destination Details"
                delay={0.15}
                badge={activeProfileId ? { label: "Loaded from saved profile", color: "#6C63FF" } : null}
              >
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Company Name">
                      <Input value={formData.destCompany} onChange={(e) => set("destCompany", e.target.value)} placeholder="Destination company" required />
                    </Field>
                    <Field label="Contact Person">
                      <Input value={formData.destContact} onChange={(e) => set("destContact", e.target.value)} placeholder="Contact name" required />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Phone">
                      <Input type="tel" value={formData.destPhone} onChange={(e) => set("destPhone", e.target.value)} placeholder="+91 00000 00000" required />
                    </Field>
                    <Field label="Email">
                      <Input type="email" value={formData.destEmail} onChange={(e) => set("destEmail", e.target.value)} placeholder="contact@company.com" required />
                    </Field>
                  </div>
                  <Field label="Street Address">
                    <Input value={formData.destAddress} onChange={(e) => set("destAddress", e.target.value)} placeholder="Street address" required />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="City">
                      <Input value={formData.destCity} onChange={(e) => set("destCity", e.target.value)} placeholder="City" required />
                    </Field>
                    <Field label="State">
                      <Input value={formData.destState} onChange={(e) => set("destState", e.target.value)} placeholder="State" required />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Postal Code">
                      <Input value={formData.destZip} onChange={(e) => set("destZip", e.target.value)} placeholder="ZIP / Postal" required />
                    </Field>
                    <Field label="Country">
                      <Input value={formData.destCountry} onChange={(e) => set("destCountry", e.target.value)} placeholder="Country" required />
                    </Field>
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* Cargo Information */}
            <SectionCard icon={ArchiveBoxIcon} iconColor="#A5B4FC" title="Cargo Information" delay={0.2}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Cargo Type">
                  <Select value={formData.cargoType} onChange={(e) => set("cargoType", e.target.value)} required>
                    <option value="">Select type</option>
                    <option value="general">General Cargo</option>
                    <option value="hazardous">Hazardous Materials</option>
                    <option value="perishable">Perishable Goods</option>
                    <option value="oversized">Oversized Cargo</option>
                    <option value="fragile">Fragile Items</option>
                  </Select>
                </Field>
                <div className="md:col-span-2">
                  <Field label="Commodity Description">
                    <Input value={formData.commodityDescription} onChange={(e) => set("commodityDescription", e.target.value)} placeholder="Detailed description of goods" required />
                  </Field>
                </div>
                <Field label="HS Code">
                  <Input value={formData.hsCode} onChange={(e) => set("hsCode", e.target.value)} placeholder="Harmonized System Code" />
                </Field>
                <Field label="Number of Pieces">
                  <Input type="number" value={formData.numberOfPieces} onChange={(e) => set("numberOfPieces", e.target.value)} placeholder="0" required />
                </Field>
                <Field label="Total Weight">
                  <div className="flex gap-2">
                    <input type="number" value={formData.totalWeight} onChange={(e) => set("totalWeight", e.target.value)} placeholder="0" required style={{ ...inputStyle, flex: 1 }} />
                    <select value={formData.weightUnit} onChange={(e) => set("weightUnit", e.target.value)} style={{ ...selectStyle, width: "72px", padding: "0.65rem 0.5rem" }}>
                      <option value="kg">KG</option>
                      <option value="lbs">LBS</option>
                      <option value="mt">MT</option>
                    </select>
                  </div>
                </Field>
                <Field label="Dimensions (L×W×H)">
                  <Input value={formData.dimensions} onChange={(e) => set("dimensions", e.target.value)} placeholder="100 × 80 × 60 cm" required />
                </Field>
                <Field label="Volume">
                  <div className="flex gap-2">
                    <input type="number" value={formData.volume} onChange={(e) => set("volume", e.target.value)} placeholder="0" required style={{ ...inputStyle, flex: 1 }} />
                    <select value={formData.volumeUnit} onChange={(e) => set("volumeUnit", e.target.value)} style={{ ...selectStyle, width: "72px", padding: "0.65rem 0.5rem" }}>
                      <option value="cbm">CBM</option>
                      <option value="cft">CFT</option>
                    </select>
                  </div>
                </Field>
                <Field label="Declared Value">
                  <div className="flex gap-2">
                    <input type="number" value={formData.declaredValue} onChange={(e) => set("declaredValue", e.target.value)} placeholder="0.00" required style={{ ...inputStyle, flex: 1 }} />
                    <select value={formData.currency} onChange={(e) => set("currency", e.target.value)} style={{ ...selectStyle, width: "80px", padding: "0.65rem 0.5rem" }}>
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CNY">CNY</option>
                    </select>
                  </div>
                </Field>
              </div>
            </SectionCard>

            {/* Transport & Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <SectionCard icon={TruckIcon} iconColor={colors.warning} title="Transport Details" delay={0.25}>
                <div className="space-y-4">
                  <Field label="Preferred Carrier">
                    <Input value={formData.preferredCarrier} onChange={(e) => set("preferredCarrier", e.target.value)} placeholder="Any carrier or specify" />
                  </Field>
                  <Field label="Equipment Type">
                    <Select value={formData.equipmentType} onChange={(e) => set("equipmentType", e.target.value)} required>
                      <option value="">Select equipment</option>
                      <option value="20ft">20ft Container</option>
                      <option value="40ft">40ft Container</option>
                      <option value="40ft-hc">40ft High Cube</option>
                      <option value="reefer">Refrigerated Container</option>
                      <option value="flatbed">Flatbed</option>
                      <option value="lcl">Less than Container Load</option>
                    </Select>
                  </Field>
                  <Field label="Special Handling">
                    <Input value={formData.specialHandling} onChange={(e) => set("specialHandling", e.target.value)} placeholder="Any special requirements" />
                  </Field>
                  <Field label="Temperature Control">
                    <Input value={formData.temperatureControl} onChange={(e) => set("temperatureControl", e.target.value)} placeholder="e.g. 2–8°C" />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard icon={CalendarDaysIcon} iconColor={colors.accent} title="Schedule & Documentation" delay={0.3}>
                <div className="space-y-4">
                  <Field label="Ready Date">
                    <Input type="date" value={formData.readyDate} onChange={(e) => set("readyDate", e.target.value)} required />
                  </Field>
                  <Field label="Required Delivery Date">
                    <Input type="date" value={formData.requiredDeliveryDate} onChange={(e) => set("requiredDeliveryDate", e.target.value)} required />
                  </Field>
                  <Field label="Invoice Number">
                    <Input value={formData.invoiceNumber} onChange={(e) => set("invoiceNumber", e.target.value)} placeholder="INV-2024-001" />
                  </Field>
                  <Field label="PO Number">
                    <Input value={formData.poNumber} onChange={(e) => set("poNumber", e.target.value)} placeholder="PO-2024-001" />
                  </Field>
                </div>
              </SectionCard>
            </div>

            {/* Additional Info */}
            <SectionCard icon={DocumentTextIcon} iconColor={textSub} title="Additional Information" delay={0.35}>
              <div className="space-y-5">
                <Field label="Special Instructions">
                  <textarea
                    value={formData.specialInstructions}
                    onChange={(e) => set("specialInstructions", e.target.value)}
                    rows={4}
                    placeholder="Any special handling instructions or notes..."
                    style={{ ...inputStyle, resize: "none", lineHeight: typography.relaxed }}
                  />
                </Field>

                <div
                  className="rounded-xl p-4 cursor-pointer"
                  onClick={() => set("insuranceRequired", !formData.insuranceRequired)}
                  style={{
                    background: formData.insuranceRequired ? "rgba(34,197,94,0.08)" : surfaceDark,
                    border: `1.5px solid ${formData.insuranceRequired ? "rgba(34,197,94,0.35)" : border}`,
                    transition: "all 0.2s",
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: formData.insuranceRequired ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                          border: `1px solid ${formData.insuranceRequired ? "rgba(34,197,94,0.3)" : border}`,
                          transition: "all 0.2s",
                        }}
                      >
                        <ShieldCheckIcon className="w-4 h-4" style={{ color: formData.insuranceRequired ? colors.success : textFade }} />
                      </div>
                      <div>
                        <p style={{ color: textOn, fontSize: typography.sm, fontWeight: typography.semibold }}>Cargo Insurance</p>
                        <p style={{ color: textSub, fontSize: typography.xs, marginTop: 2 }}>Protect against loss or damage in transit</p>
                      </div>
                    </div>
                    <div
                      className="shrink-0 relative rounded-full"
                      style={{
                        width: 44, height: 24,
                        background: formData.insuranceRequired ? colors.success : "rgba(255,255,255,0.12)",
                        border: `1.5px solid ${formData.insuranceRequired ? colors.success : border}`,
                        transition: "all 0.25s",
                      }}
                    >
                      <div style={{
                        position: "absolute", top: 2,
                        left: formData.insuranceRequired ? 22 : 2,
                        width: 16, height: 16,
                        borderRadius: "50%", background: "white",
                        transition: "left 0.25s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                      }} />
                    </div>
                  </div>
                  {formData.insuranceRequired && (
                    <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(34,197,94,0.2)" }} onClick={(e) => e.stopPropagation()}>
                      <label style={{ ...labelStyle, color: "rgba(34,197,94,0.8)" }}>Coverage Amount (INR)</label>
                      <Input type="number" value={formData.insuranceValue} onChange={(e) => set("insuranceValue", e.target.value)} placeholder="e.g. 200000" />
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Submit */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center justify-end pb-4">
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-3 rounded-xl transition-all"
                style={{ background: colors.gradientAccent, color: colors.textWhite, fontSize: typography.sm, fontWeight: typography.bold }}
              >
                Get Quote &amp; Book
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </motion.div>
          </form>
        </div>
      )}
    </>
  )
}