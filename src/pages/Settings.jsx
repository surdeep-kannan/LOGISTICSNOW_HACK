import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  UserIcon, BuildingOffice2Icon, BellIcon,
  LockClosedIcon, GlobeAltIcon, CheckIcon,
  ChevronRightIcon, ShieldCheckIcon, KeyIcon,
} from "@heroicons/react/24/outline"
import { colors, typography } from "../styles"
import { auth, upload } from "../lib/api"

const surface     = "#332B7A"
const surfaceMid  = "#3D3585"
const surfaceDark = "#2D2566"
const border      = "rgba(255,255,255,0.1)"
const textOn      = "rgba(255,255,255,0.95)"
const textSub     = "rgba(255,255,255,0.65)"
const textFade    = "rgba(255,255,255,0.35)"
const inputBg     = "rgba(255,255,255,0.06)"
const borderFocus = "rgba(255,255,255,0.4)"

const SECTIONS = [
  { id: "profile",       label: "Profile",       Icon: UserIcon            },
  { id: "company",       label: "Company",       Icon: BuildingOffice2Icon },
  { id: "notifications", label: "Notifications", Icon: BellIcon            },
  { id: "preferences",   label: "Preferences",   Icon: GlobeAltIcon        },
  { id: "security",      label: "Security",      Icon: LockClosedIcon      },
]

const EMPTY = {
  fullName: "", email: "", phone: "", role: "",
  companyName: "", companyAddress: "", companyCity: "",
  companyState: "", companyZip: "", companyCountry: "India", taxId: "",
  emailNotifications: true, shipmentUpdates: true, delayAlerts: true,
  costAlerts: true, weeklyReports: false, marketInsights: true,
  currency: "INR", weightUnit: "kg", volumeUnit: "cbm",
  timezone: "Asia/Kolkata", language: "en", dateFormat: "DD/MM/YYYY",
}

// ── Standalone sub-components (MUST be outside Settings) ──
// Defining these inside Settings() causes remount on every
// keystroke → input loses focus. Keep them here permanently.

function Field({ label, name, type = "text", placeholder = "", disabled = false,
                 loading, form, set, focused, setFocused, inp, children }) {
  return (
    <div>
      <label style={{ color: textSub, fontSize: typography.xs, fontWeight: typography.semibold,
        letterSpacing: typography.wider, textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>
        {label}
      </label>
      {children ?? (
        <input
          type={type}
          value={form[name] ?? ""}
          placeholder={placeholder}
          disabled={disabled || loading}
          onChange={e => set(name, e.target.value)}
          onFocus={() => setFocused(name)}
          onBlur={() => setFocused("")}
          style={{ ...inp(name), opacity: disabled ? 0.5 : 1 }}
        />
      )}
    </div>
  )
}

function Toggle({ label, sub, name, form, set }) {
  const bdr = "rgba(255,255,255,0.1)"
  return (
    <div className="flex items-center justify-between py-4" style={{ borderBottom: `1px solid ${bdr}` }}>
      <div>
        <p style={{ color: "rgba(255,255,255,0.95)", fontSize: typography.sm, fontWeight: typography.medium }}>{label}</p>
        {sub && <p style={{ color: "rgba(255,255,255,0.65)", fontSize: typography.xs, marginTop: 2 }}>{sub}</p>}
      </div>
      <button type="button" onClick={() => set(name, !form[name])}
        className="relative w-11 h-6 rounded-full transition-all"
        style={{ background: form[name] ? colors.accent : "rgba(255,255,255,0.1)",
          border: `1px solid ${form[name] ? colors.accent : bdr}` }}>
        <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
          style={{ background: "#fff", left: form[name] ? "calc(100% - 22px)" : "2px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
      </button>
    </div>
  )
}

function SettingsSelect({ label, name, options, form, set, focused, setFocused, inp }) {
  return (
    <div>
      <label style={{ color: textSub, fontSize: typography.xs, fontWeight: typography.semibold,
        letterSpacing: typography.wider, textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>
        {label}
      </label>
      <select value={form[name] ?? ""} onChange={e => set(name, e.target.value)}
        onFocus={() => setFocused(name)} onBlur={() => setFocused("")}
        style={{ ...inp(name), cursor: "pointer", appearance: "none", width: "100%" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

export default function Settings() {
  const [active,          setActive]          = useState("profile")
  const [saved,           setSaved]           = useState(false)
  const [saving,          setSaving]          = useState(false)
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState("")
  const [focused,         setFocused]         = useState("")
  const [form,            setForm]            = useState(EMPTY)
  const [avatarUrl,       setAvatarUrl]       = useState("")
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarError,     setAvatarError]     = useState("")

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    setAvatarError("")
    try {
      const data = await upload.avatar(file)
      setAvatarUrl(data.avatar_url)
    } catch (err) {
      setAvatarError("Upload failed — " + (err.message || "please try again"))
    } finally {
      setUploadingAvatar(false)
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const data = await auth.me()
        const u = data.user
        const p = u?.profile ?? u
        const c = p?.companies ?? {}
        const pref = p?.user_preferences ?? {}
        setForm({
          fullName:           p?.full_name || u?.email?.split("@")[0]?.replace(/[._-]/g, " ")?.replace(/\b\w/g, c => c.toUpperCase()) || "",
          email:              u?.email              ?? "",
          phone:              p?.mobile_number      ?? "",
          role:               p?.role               ?? "",
          companyName:        c?.name               ?? "",
          companyAddress:     c?.address            ?? "",
          companyCity:        c?.city               ?? "",
          companyState:       c?.state              ?? "",
          companyZip:         c?.zip                ?? "",
          companyCountry:     c?.country            ?? "India",
          taxId:              c?.tax_id             ?? "",
          emailNotifications: pref.email_notifications  ?? true,
          shipmentUpdates:    pref.shipment_updates      ?? true,
          delayAlerts:        pref.delay_alerts          ?? true,
          costAlerts:         pref.cost_alerts           ?? true,
          weeklyReports:      pref.weekly_reports        ?? false,
          marketInsights:     pref.market_insights       ?? true,
          currency:           pref.currency              ?? "INR",
          weightUnit:         pref.weight_unit           ?? "kg",
          volumeUnit:         pref.volume_unit           ?? "cbm",
          timezone:           pref.timezone              ?? "Asia/Kolkata",
          language:           pref.language              ?? "en",
          dateFormat:         pref.date_format           ?? "DD/MM/YYYY",
        })
        setAvatarUrl(p?.avatar_url || "")
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const [passwordLinkSent, setPasswordLinkSent] = useState(false)

  const handleSendPasswordLink = async () => {
    try {
      await auth.resetPassword()
      setPasswordLinkSent(true)
      setTimeout(() => setPasswordLinkSent(false), 10000)
    } catch (err) {
      setError("Could not send reset link: " + err.message)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      await auth.updateProfile({
        full_name:            form.fullName,
        mobile_number:        form.phone,
        role:                 form.role,
        company_name:         form.companyName,
        company_address:      form.companyAddress,
        company_city:         form.companyCity,
        company_state:        form.companyState,
        company_zip:          form.companyZip,
        company_country:      form.companyCountry,
        tax_id:               form.taxId,
        email_notifications:  form.emailNotifications,
        shipment_updates:     form.shipmentUpdates,
        delay_alerts:         form.delayAlerts,
        cost_alerts:          form.costAlerts,
        weekly_reports:       form.weeklyReports,
        market_insights:      form.marketInsights,
        currency:             form.currency,
        weight_unit:          form.weightUnit,
        volume_unit:          form.volumeUnit,
        timezone:             form.timezone,
        language:             form.language,
        date_format:          form.dateFormat,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const fp = { form, set, focused, setFocused, inp: (n) => inp(n), loading } // shared field props
  const inp = (name) => ({
    width: "100%", background: inputBg,
    border: `1.5px solid ${focused === name ? borderFocus : border}`,
    borderRadius: "0.75rem", padding: "0.65rem 1rem",
    color: textOn, fontSize: typography.sm, outline: "none",
  })

  // Field / Toggle / Select defined outside — see bottom of file

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-10 w-48 rounded-xl animate-pulse" style={{ background: surface }} />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="h-64 rounded-2xl animate-pulse" style={{ background: surface }} />
          <div className="lg:col-span-3 h-96 rounded-2xl animate-pulse" style={{ background: surface }} />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 style={{ color: textOn, fontSize: typography["3xl"], fontWeight: typography.bold, letterSpacing: typography.tight, marginBottom: 6 }}>
          Settings
        </h1>
        <p style={{ color: textSub, fontSize: typography.base }}>Manage your account, company and preferences</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5" }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Sidebar nav */}
        <div className="rounded-2xl p-3 h-fit" style={{ background: surface, border: `1px solid ${border}` }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left mb-1"
              style={{ background: active === s.id ? surfaceMid : "transparent", border: `1px solid ${active === s.id ? "rgba(255,255,255,0.12)" : "transparent"}` }}>
              <s.Icon className="w-4 h-4 shrink-0" style={{ color: active === s.id ? textOn : textSub }} />
              <span style={{ color: active === s.id ? textOn : textSub, fontSize: typography.sm, fontWeight: active === s.id ? typography.semibold : typography.normal }}>
                {s.label}
              </span>
              {active === s.id && <ChevronRightIcon className="w-3.5 h-3.5 ml-auto" style={{ color: textFade }} />}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <form onSubmit={handleSave} className="lg:col-span-3 rounded-2xl overflow-hidden" style={{ background: surface, border: `1px solid ${border}` }}>
          <div className="px-6 py-5" style={{ borderBottom: `1px solid ${border}` }}>
            <h2 style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.lg }}>
              {SECTIONS.find(s => s.id === active)?.label}
            </h2>
          </div>

          <div className="p-6 space-y-5">

            {/* ── Profile ── */}
            {active === "profile" && (
              <>
                <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: surfaceMid, border: `1px solid ${border}` }}>
                  {/* Avatar — click to upload */}
                  <label style={{ cursor: "pointer", position: "relative", flexShrink: 0 }} title="Click to change photo">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ display: "none" }}
                    />
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold overflow-hidden"
                      style={{ background: avatarUrl ? "transparent" : colors.gradientAccent, color: "#fff", position: "relative" }}>
                      {avatarUrl
                        ? <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : (form.fullName ? form.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?")
                      }
                      {/* Hover overlay */}
                      <div style={{
                        position: "absolute", inset: 0, borderRadius: "inherit",
                        background: "rgba(0,0,0,0.45)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        opacity: 0, transition: "opacity 0.2s",
                      }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        onMouseLeave={e => e.currentTarget.style.opacity = 0}
                      >
                        {uploadingAvatar
                          ? <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
                          : <span style={{ color: "#fff", fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em" }}>EDIT</span>
                        }
                      </div>
                    </div>
                  </label>
                  <div>
                    <p style={{ color: textOn, fontWeight: typography.semibold }}>{form.fullName || "Your Name"}</p>
                    <p style={{ color: textSub, fontSize: typography.sm }}>{form.email}</p>
                    <p style={{ color: textFade, fontSize: "11px", marginTop: 3 }}>
                      {uploadingAvatar ? "Uploading…" : "Click photo to change · JPG, PNG up to 5MB"}
                    </p>
                    {avatarError && <p style={{ color: "#FCA5A5", fontSize: "11px", marginTop: 3 }}>{avatarError}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field {...fp} label="Full Name"     name="fullName" placeholder="Your full name" />
                  <Field {...fp} label="Email Address" name="email"    type="email" disabled />
                  <Field {...fp} label="Phone Number"  name="phone"    placeholder="+91 98765 43210" />
                  <Field {...fp} label="Job Title / Role" name="role"  placeholder="e.g. Logistics Manager" />
                </div>
              </>
            )}

            {/* ── Company ── */}
            {active === "company" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field {...fp} label="Company Name" name="companyName" placeholder="Your company name" />
                </div>
                <div className="sm:col-span-2">
                  <Field {...fp} label="Address" name="companyAddress" placeholder="Street address" />
                </div>
                <Field {...fp} label="City"    name="companyCity"    placeholder="Mumbai" />
                <Field {...fp} label="State"   name="companyState"   placeholder="Maharashtra" />
                <Field {...fp} label="ZIP / Postal Code" name="companyZip" placeholder="400001" />
                <Field {...fp} label="Country" name="companyCountry" placeholder="India" />
                <div className="sm:col-span-2">
                  <Field {...fp} label="GST / Tax ID" name="taxId" placeholder="27AADCT1234A1Z5" />
                </div>
              </div>
            )}

            {/* ── Notifications ── */}
            {active === "notifications" && (
              <div>
                <Toggle {...fp} label="Email Notifications"  sub="Receive updates via email"             name="emailNotifications" />
                <Toggle {...fp} label="Shipment Updates"     sub="Status changes for your shipments"     name="shipmentUpdates" />
                <Toggle {...fp} label="Delay Alerts"         sub="Get notified when shipments are late"  name="delayAlerts" />
                <Toggle {...fp} label="Cost Alerts"          sub="Alerts when costs exceed thresholds"   name="costAlerts" />
                <Toggle {...fp} label="Weekly Reports"       sub="Summary of activity every Monday"      name="weeklyReports" />
                <Toggle {...fp} label="Market Insights"      sub="Freight rate & intelligence updates"   name="marketInsights" />
              </div>
            )}

            {/* ── Preferences ── */}
            {active === "preferences" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <SettingsSelect {...fp} label="Currency" name="currency" options={[
                  { value: "INR", label: "₹ Indian Rupee (INR)" },
                  { value: "USD", label: "$ US Dollar (USD)" },
                  { value: "EUR", label: "€ Euro (EUR)" },
                  { value: "AED", label: "د.إ UAE Dirham (AED)" },
                ]} />
                <SettingsSelect {...fp} label="Weight Unit" name="weightUnit" options={[
                  { value: "kg",  label: "Kilograms (kg)"  },
                  { value: "lbs", label: "Pounds (lbs)"    },
                  { value: "mt",  label: "Metric Tons (mt)"},
                ]} />
                <SettingsSelect {...fp} label="Volume Unit" name="volumeUnit" options={[
                  { value: "cbm", label: "Cubic Meters (CBM)" },
                  { value: "cft", label: "Cubic Feet (CFT)"   },
                ]} />
                <SettingsSelect {...fp} label="Timezone" name="timezone" options={[
                  { value: "Asia/Kolkata",    label: "IST — Asia/Kolkata"      },
                  { value: "Asia/Dubai",      label: "GST — Asia/Dubai"        },
                  { value: "Asia/Singapore",  label: "SGT — Asia/Singapore"    },
                  { value: "Europe/London",   label: "GMT — Europe/London"     },
                  { value: "America/New_York",label: "EST — America/New_York"  },
                ]} />
                <SettingsSelect {...fp} label="Language" name="language" options={[
                  { value: "en", label: "English"  },
                  { value: "hi", label: "Hindi"    },
                  { value: "ta", label: "Tamil"    },
                ]} />
                <SettingsSelect {...fp} label="Date Format" name="dateFormat" options={[
                  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
                ]} />
              </div>
            )}

            {/* ── Security ── */}
            {active === "security" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl flex items-center gap-4" style={{ background: surfaceMid, border: `1px solid ${border}` }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(34,197,94,0.12)" }}>
                    <ShieldCheckIcon className="w-5 h-5" style={{ color: colors.success }} />
                  </div>
                  <div>
                    <p style={{ color: textOn, fontSize: typography.sm, fontWeight: typography.medium }}>Account Secured</p>
                    <p style={{ color: textSub, fontSize: typography.xs }}>Your account is protected with a strong password</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: surfaceMid, border: `1px solid ${border}` }}>
                  <div className="flex items-center gap-3">
                    <KeyIcon className="w-5 h-5" style={{ color: textSub }} />
                    <div>
                      <p style={{ color: textOn, fontSize: typography.sm, fontWeight: typography.medium }}>Change Password</p>
                      <p style={{ color: textSub, fontSize: typography.xs }}>
                        {passwordLinkSent ? "Reset link sent — check your email" : "We'll email you a secure reset link"}
                      </p>
                    </div>
                  </div>
                  <button type="button"
                    disabled={passwordLinkSent}
                    onClick={handleSendPasswordLink}
                    className="px-3 py-1.5 rounded-lg text-sm transition-all"
                    style={{
                      background: passwordLinkSent ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${passwordLinkSent ? "rgba(34,197,94,0.3)" : border}`,
                      color: passwordLinkSent ? colors.success : textSub,
                    }}>
                    {passwordLinkSent ? "✓ Sent" : "Send Link"}
                  </button>
                </div>
                <div className="mt-6 p-4 rounded-xl" style={{ border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)" }}>
                  <p style={{ color: "#FCA5A5", fontSize: typography.sm, fontWeight: typography.semibold, marginBottom: 6 }}>Danger Zone</p>
                  <p style={{ color: textFade, fontSize: typography.xs, marginBottom: 12 }}>Deleting your account is permanent and cannot be undone.</p>
                  <button type="button" className="px-4 py-2 rounded-lg text-sm"
                    style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", fontWeight: typography.medium }}>
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Save button */}
          {active !== "security" && (
            <div className="px-6 py-4 flex justify-end" style={{ borderTop: `1px solid ${border}` }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-70"
                style={{ background: saved ? "rgba(34,197,94,0.2)" : colors.gradientAccent, color: saved ? colors.success : "#fff", border: saved ? `1px solid ${colors.success}` : "none" }}>
                {saving
                  ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
                  : saved
                    ? <><CheckIcon className="w-4 h-4" /> Saved!</>
                    : "Save Changes"
                }
              </motion.button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}