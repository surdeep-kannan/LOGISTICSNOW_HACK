import { useState } from "react"
import { motion } from "framer-motion"
import {
  UserIcon,
  BuildingOffice2Icon,
  BellIcon,
  LockClosedIcon,
  GlobeAltIcon,
  CheckIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline"
import { colors, typography } from "../styles"

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

export default function Settings() {
  const [active, setActive]   = useState("profile")
  const [saved, setSaved]     = useState(false)
  const [focused, setFocused] = useState("")

  const [form, setForm] = useState({
    fullName:            "John Doe",
    email:               "john@company.com",
    phone:               "+91 98765 43210",
    role:                "Logistics Manager",
    avatar:              "JD",
    companyName:         "TechManufacture India Pvt Ltd",
    companyAddress:      "Plot 45, MIDC Industrial Area, Andheri East",
    companyCity:         "Mumbai",
    companyState:        "Maharashtra",
    companyZip:          "400093",
    companyCountry:      "India",
    taxId:               "27AADCT1234A1Z5",
    emailNotifications:  true,
    shipmentUpdates:     true,
    delayAlerts:         true,
    costAlerts:          true,
    weeklyReports:       false,
    marketInsights:      true,
    currency:            "INR",
    weightUnit:          "kg",
    volumeUnit:          "cbm",
    timezone:            "Asia/Kolkata",
    language:            "en",
    dateFormat:          "DD/MM/YYYY",
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const inputStyle = (name) => ({
    width: "100%",
    background: inputBg,
    border: `1.5px solid ${focused === name ? borderFocus : border}`,
    borderRadius: "0.75rem",
    padding: "0.65rem 1rem",
    color: textOn,
    fontSize: typography.sm,
    outline: "none",
    transition: "border-color 0.15s",
  })

  const selectStyle = {
    ...inputStyle(""),
    cursor: "pointer",
    appearance: "none",
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

  const Toggle = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative inline-flex items-center rounded-full transition-all shrink-0"
      style={{
        width: 44,
        height: 24,
        background: checked ? colors.accent : "rgba(255,255,255,0.12)",
        border: `1px solid ${checked ? colors.accent : border}`,
      }}
    >
      <span
        className="inline-block rounded-full transition-all"
        style={{
          width: 18,
          height: 18,
          background: "white",
          transform: `translateX(${checked ? 22 : 3}px)`,
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  )

  const SectionCard = ({ title, Icon, children }) => (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: surface, border: `1px solid ${border}` }}
    >
      <div className="px-6 py-5 flex items-center gap-3" style={{ borderBottom: `1px solid ${border}` }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,180,216,0.12)", border: `1px solid rgba(0,180,216,0.2)` }}>
          <Icon className="w-5 h-5" style={{ color: colors.accent }} strokeWidth={1.5} />
        </div>
        <h2 style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.lg }}>{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 style={{ color: textOn, fontSize: typography["3xl"], fontWeight: typography.bold, letterSpacing: typography.tight, marginBottom: 6 }}>
            Settings
          </h1>
          <p style={{ color: textSub, fontSize: typography.base }}>
            Manage your account, company and preferences
          </p>
        </div>
      </div>

      {/* Section tabs — horizontal scroll on mobile */}
      <div
        className="flex gap-1 overflow-x-auto pb-1 rounded-2xl p-1.5"
        style={{ background: surface, border: `1px solid ${border}` }}
      >
        {SECTIONS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap shrink-0"
              style={{
                background: isActive ? colors.gradientAccent : "transparent",
                color: isActive ? "#fff" : textSub,
                fontSize: typography.sm,
                fontWeight: isActive ? typography.semibold : typography.normal,
                border: isActive ? "none" : "1px solid transparent",
              }}
            >
              <Icon className="w-4 h-4" strokeWidth={1.5} />
              {label}
            </button>
          )
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-5">

        {/* ── PROFILE ── */}
        {active === "profile" && (
          <SectionCard title="Profile Information" Icon={UserIcon}>
            {/* Avatar */}
            <div className="flex items-center gap-5 mb-6 pb-6" style={{ borderBottom: `1px solid ${border}` }}>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0"
                style={{ background: colors.gradientAccent, color: "#fff" }}
              >
                {form.avatar}
              </div>
              <div>
                <p style={{ color: textOn, fontWeight: typography.semibold, marginBottom: 4 }}>{form.fullName}</p>
                <p style={{ color: textSub, fontSize: typography.sm, marginBottom: 8 }}>{form.role} · {form.email}</p>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={{ background: surfaceMid, border: `1px solid ${border}`, color: textSub }}
                >
                  Change Avatar
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Full Name",     key: "fullName",  type: "text"  },
                { label: "Email Address", key: "email",     type: "email" },
                { label: "Phone Number",  key: "phone",     type: "tel"   },
                { label: "Role / Title",  key: "role",      type: "text"  },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    onFocus={() => setFocused(key)}
                    onBlur={() => setFocused("")}
                    style={inputStyle(key)}
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── COMPANY ── */}
        {active === "company" && (
          <SectionCard title="Company Information" Icon={BuildingOffice2Icon}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label style={labelStyle}>Company Name</label>
                <input type="text" value={form.companyName} onChange={e => set("companyName", e.target.value)}
                  onFocus={() => setFocused("companyName")} onBlur={() => setFocused("")} style={inputStyle("companyName")} />
              </div>
              <div className="sm:col-span-2">
                <label style={labelStyle}>Address</label>
                <input type="text" value={form.companyAddress} onChange={e => set("companyAddress", e.target.value)}
                  onFocus={() => setFocused("companyAddress")} onBlur={() => setFocused("")} style={inputStyle("companyAddress")} />
              </div>
              {[
                { label: "City",          key: "companyCity"    },
                { label: "State",         key: "companyState"   },
                { label: "Postal Code",   key: "companyZip"     },
                { label: "Country",       key: "companyCountry" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input type="text" value={form[key]} onChange={e => set(key, e.target.value)}
                    onFocus={() => setFocused(key)} onBlur={() => setFocused("")} style={inputStyle(key)} />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label style={labelStyle}>GST / Tax ID</label>
                <input type="text" value={form.taxId} onChange={e => set("taxId", e.target.value)}
                  onFocus={() => setFocused("taxId")} onBlur={() => setFocused("")} style={inputStyle("taxId")} />
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── NOTIFICATIONS ── */}
        {active === "notifications" && (
          <SectionCard title="Notification Preferences" Icon={BellIcon}>
            <div className="space-y-0 divide-y" style={{ borderColor: border }}>
              {[
                { key: "emailNotifications", label: "Email Notifications",  desc: "Receive email updates about your account activity"      },
                { key: "shipmentUpdates",    label: "Shipment Updates",     desc: "Get notified when shipment status changes"               },
                { key: "delayAlerts",        label: "Delay Alerts",         desc: "Instant alerts when shipments are delayed or disrupted"  },
                { key: "costAlerts",         label: "Cost Alerts",          desc: "Notifications about pricing changes and cost savings"    },
                { key: "weeklyReports",      label: "Weekly Reports",       desc: "Receive weekly performance summary every Monday"         },
                { key: "marketInsights",     label: "Market Insights",      desc: "AI-generated freight market intelligence updates"        },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-4 py-4" style={{ borderColor: border }}>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: textOn, fontWeight: typography.medium, fontSize: typography.sm, marginBottom: 3 }}>{label}</p>
                    <p style={{ color: textFade, fontSize: typography.xs }}>{desc}</p>
                  </div>
                  <Toggle checked={form[key]} onChange={v => set(key, v)} />
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── PREFERENCES ── */}
        {active === "preferences" && (
          <SectionCard title="Regional Preferences" Icon={GlobeAltIcon}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  label: "Currency", key: "currency",
                  options: [["INR","₹ Indian Rupee"],["USD","$ US Dollar"],["EUR","€ Euro"],["GBP","£ British Pound"],["AED","AED UAE Dirham"]],
                },
                {
                  label: "Weight Unit", key: "weightUnit",
                  options: [["kg","Kilograms (kg)"],["lbs","Pounds (lbs)"],["mt","Metric Tons (mt)"]],
                },
                {
                  label: "Volume Unit", key: "volumeUnit",
                  options: [["cbm","Cubic Metres (CBM)"],["cft","Cubic Feet (CFT)"]],
                },
                {
                  label: "Timezone", key: "timezone",
                  options: [["Asia/Kolkata","IST (UTC+5:30)"],["America/New_York","ET (UTC-5)"],["Europe/London","GMT (UTC+0)"],["Asia/Dubai","GST (UTC+4)"],["Asia/Singapore","SGT (UTC+8)"]],
                },
                {
                  label: "Language", key: "language",
                  options: [["en","English"],["hi","Hindi"],["mr","Marathi"],["gu","Gujarati"],["ta","Tamil"]],
                },
                {
                  label: "Date Format", key: "dateFormat",
                  options: [["DD/MM/YYYY","DD/MM/YYYY"],["MM/DD/YYYY","MM/DD/YYYY"],["YYYY-MM-DD","YYYY-MM-DD"]],
                },
              ].map(({ label, key, options }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <select
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    style={selectStyle}
                  >
                    {options.map(([val, lbl]) => (
                      <option key={val} value={val} style={{ background: "#332B7A" }}>{lbl}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── SECURITY ── */}
        {active === "security" && (
          <SectionCard title="Security Settings" Icon={LockClosedIcon}>
            <div className="space-y-3">
              {[
                { Icon: KeyIcon,              label: "Change Password",          desc: "Update your account password"                    },
                { Icon: DevicePhoneMobileIcon,label: "Two-Factor Authentication",desc: "Add an extra layer of security via SMS or app"   },
                { Icon: ShieldCheckIcon,      label: "Active Sessions",          desc: "Manage devices where you're currently signed in" },
              ].map(({ Icon, label, desc }) => (
                <button
                  key={label}
                  type="button"
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 rounded-2xl transition-all text-left"
                  style={{ background: surfaceMid, border: `1px solid ${border}` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = "#453D9A" }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.background = surfaceMid }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <Icon className="w-5 h-5" style={{ color: textSub }} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p style={{ color: textOn, fontWeight: typography.medium, fontSize: typography.sm, marginBottom: 3 }}>{label}</p>
                      <p style={{ color: textFade, fontSize: typography.xs }}>{desc}</p>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 shrink-0" style={{ color: textFade }} />
                </button>
              ))}
            </div>

            {/* Danger zone */}
            <div className="mt-6 pt-6" style={{ borderTop: `1px solid ${border}` }}>
              <h3 style={{ color: colors.error, fontWeight: typography.semibold, fontSize: typography.sm, marginBottom: 12 }}>
                Danger Zone
              </h3>
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl text-sm transition-all"
                style={{ background: "rgba(239,68,68,0.08)", border: `1px solid rgba(239,68,68,0.25)`, color: colors.error, fontWeight: typography.medium }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)" }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)" }}
              >
                Delete Account
              </button>
            </div>
          </SectionCard>
        )}

        {/* Save / Cancel — shown for all tabs except security */}
        {active !== "security" && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl text-sm transition-all"
              style={{ background: "transparent", border: `1px solid ${border}`, color: textSub }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = textOn }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textSub }}
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: saved ? `linear-gradient(135deg, ${colors.success}, #16A34A)` : colors.gradientAccent,
                color: "#fff",
              }}
            >
              {saved ? (
                <><CheckIcon className="w-4 h-4" strokeWidth={2.5} /> Saved!</>
              ) : (
                "Save Changes"
              )}
            </motion.button>
          </div>
        )}
      </form>
    </div>
  )
}