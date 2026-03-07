import { useState } from "react"
import { motion } from "framer-motion"
import {
  CubeIcon,
  MapPinIcon,
  ArchiveBoxIcon,
  TruckIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline"
import { RouteSelection } from "../components/RouteSelection"
import AILoadingScreen from "../components/AILoadingScreen"
import { colors, typography } from "../styles"

const surface    = "#332B7A"
const surfaceMid = "#3D3585"
const border     = "rgba(255,255,255,0.1)"
const borderFocus = "rgba(255,255,255,0.4)"
const textOn     = "rgba(255,255,255,0.95)"
const textSub    = "rgba(255,255,255,0.65)"
const textFade   = "rgba(255,255,255,0.35)"
const inputBg    = "rgba(255,255,255,0.06)"

export default function CreateShipment() {
  const [formData, setFormData] = useState({
    serviceLevel: "express",
    transportMode: "road",
    incoterms: "ddp",
    originCompany: "TechManufacture India Pvt Ltd",
    originContact: "Rajesh Kumar",
    originPhone: "+91 98765 43210",
    originEmail: "rajesh.kumar@techmanufacture.in",
    originAddress: "Plot 45, MIDC Industrial Area, Andheri East",
    originCity: "Mumbai",
    originState: "Maharashtra",
    originZip: "400093",
    originCountry: "India",
    destCompany: "Electronics Distribution Chennai Ltd",
    destContact: "Priya Sharma",
    destPhone: "+91 98765 12345",
    destEmail: "priya.sharma@elecdist.in",
    destAddress: "156, Ambattur Industrial Estate",
    destCity: "Chennai",
    destState: "Tamil Nadu",
    destZip: "600058",
    destCountry: "India",
    cargoType: "general",
    commodityDescription: "Electronic Components - Semiconductors and Circuit Boards",
    hsCode: "8542.31.00",
    numberOfPieces: "24",
    totalWeight: "8400",
    weightUnit: "kg",
    dimensions: "120 × 100 × 80 cm",
    volume: "32",
    volumeUnit: "cbm",
    declaredValue: "185000",
    currency: "INR",
    preferredCarrier: "VRL Logistics",
    equipmentType: "20ft",
    specialHandling: "Fragile - Handle with care, shock-sensitive equipment",
    temperatureControl: "",
    readyDate: "2026-03-06",
    requiredDeliveryDate: "2026-03-09",
    invoiceNumber: "INV-2024-7823",
    poNumber: "PO-2024-MUM-456",
    specialInstructions: "Cargo contains sensitive electronic components. Avoid exposure to extreme temperatures or moisture. Delivery requires signature confirmation.",
    insuranceRequired: true,
    insuranceValue: "200000",
  })

  // State controls
  const [isAnalysing, setIsAnalysing] = useState(false)
  const [showRouteSelection, setShowRouteSelection] = useState(false)

  const set = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    // Trick: Mount map in background to pre-fetch OSRM data
    setShowRouteSelection(true)
    // Trick: Cover the screen with the AI loader while it fetches
    setIsAnalysing(true)
  }

  const inputStyle = {
    width: "100%",
    background: inputBg,
    border: `1.5px solid ${border}`,
    borderRadius: "0.75rem",
    padding: "0.65rem 1rem",
    color: textOn,
    fontSize: typography.sm,
    outline: "none",
    transition: "border-color 0.15s",
  }

  const selectStyle = {
    ...inputStyle,
    appearance: "none",
    cursor: "pointer",
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

  function SectionCard({ icon: Icon, iconColor, title, children, delay = 0 }) {
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
        style={{
          ...selectStyle,
          borderColor: focused ? borderFocus : border,
        }}
      >
        {children}
      </select>
    )
  }

  return (
    <>
      {/* 1. The Global Overlay AI Loader */}
      {isAnalysing && (
        <AILoadingScreen 
          onComplete={() => {
            setIsAnalysing(false)
            // THE FIX: Force Leaflet to paint the map tiles immediately
            setTimeout(() => window.dispatchEvent(new Event('resize')), 50)
            setTimeout(() => window.dispatchEvent(new Event('resize')), 300)
          }} 
        />
      )}

      {/* 2. Route Selection (Full Width Container) */}
      {showRouteSelection ? (
        <div className="w-full h-full pb-10">
          <RouteSelection formData={formData} onBack={() => setShowRouteSelection(false)} />
        </div>
      ) : (

        /* 3. The Original Form (Constrained max-w-5xl Width) */
        <div className="max-w-5xl mx-auto py-6">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
            <h1 style={{ color: textOn, fontSize: typography["3xl"], fontWeight: typography.bold, letterSpacing: typography.tight, marginBottom: 6 }}>
              Create New Shipment
            </h1>
            <p style={{ color: textSub, fontSize: typography.base }}>
              Enter shipment details to generate a quote and book
            </p>
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
                    <option value="cif">CIF — Cost, Insurance & Freight</option>
                    <option value="ddp">DDP — Delivered Duty Paid</option>
                    <option value="dap">DAP — Delivered at Place</option>
                  </Select>
                </Field>
              </div>
            </SectionCard>

            {/* Origin & Destination */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <SectionCard icon={MapPinIcon} iconColor={colors.accent} title="Origin Details" delay={0.1}>
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

              <SectionCard icon={MapPinIcon} iconColor={colors.success} title="Destination Details" delay={0.15}>
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
                    <input
                      type="number" value={formData.totalWeight} onChange={(e) => set("totalWeight", e.target.value)}
                      placeholder="0" required style={{ ...inputStyle, flex: 1 }}
                    />
                    <select
                      value={formData.weightUnit} onChange={(e) => set("weightUnit", e.target.value)}
                      style={{ ...selectStyle, width: "72px", padding: "0.65rem 0.5rem" }}
                    >
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
                    <input
                      type="number" value={formData.volume} onChange={(e) => set("volume", e.target.value)}
                      placeholder="0" required style={{ ...inputStyle, flex: 1 }}
                    />
                    <select
                      value={formData.volumeUnit} onChange={(e) => set("volumeUnit", e.target.value)}
                      style={{ ...selectStyle, width: "72px", padding: "0.65rem 0.5rem" }}
                    >
                      <option value="cbm">CBM</option>
                      <option value="cft">CFT</option>
                    </select>
                  </div>
                </Field>
                <Field label="Declared Value">
                  <div className="flex gap-2">
                    <input
                      type="number" value={formData.declaredValue} onChange={(e) => set("declaredValue", e.target.value)}
                      placeholder="0.00" required style={{ ...inputStyle, flex: 1 }}
                    />
                    <select
                      value={formData.currency} onChange={(e) => set("currency", e.target.value)}
                      style={{ ...selectStyle, width: "80px", padding: "0.65rem 0.5rem" }}
                    >
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

                <div className="flex items-start gap-4 p-4 rounded-xl" style={{ background: surfaceMid, border: `1px solid ${border}` }}>
                  <div className="relative mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      id="insurance"
                      checked={formData.insuranceRequired}
                      onChange={(e) => set("insuranceRequired", e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: colors.accent, cursor: "pointer" }}
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="insurance" style={{ color: textOn, fontSize: typography.sm, fontWeight: typography.medium, cursor: "pointer", display: "block", marginBottom: 4 }}>
                      Cargo Insurance Required
                    </label>
                    <p style={{ color: textSub, fontSize: typography.xs, marginBottom: formData.insuranceRequired ? 12 : 0 }}>
                      Protect your shipment against loss or damage in transit
                    </p>
                    {formData.insuranceRequired && (
                      <div style={{ maxWidth: 280 }}>
                        <label style={{ ...labelStyle, marginBottom: "0.4rem" }}>Coverage Amount (INR)</label>
                        <Input
                          type="number" value={formData.insuranceValue}
                          onChange={(e) => set("insuranceValue", e.target.value)}
                          placeholder="Insurance coverage amount"
                        />
                      </div>
                    )}
                  </div>
                  <ShieldCheckIcon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: formData.insuranceRequired ? colors.success : textFade }} />
                </div>
              </div>
            </SectionCard>

            {/* Action Buttons */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center justify-end gap-3 pb-4">
              <button
                type="button"
                className="px-6 py-3 rounded-xl transition-all"
                style={{
                  border: `1.5px solid ${border}`, color: textSub, fontSize: typography.sm, fontWeight: typography.medium, background: "transparent",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = surfaceMid; e.currentTarget.style.color = textOn }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = textSub }}
              >
                Save as Draft
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all"
                style={{ background: colors.gradientAccent, color: colors.textWhite, fontSize: typography.sm, fontWeight: typography.bold }}
              >
                Get Quote & Book
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </motion.div>
          </form>
        </div>
      )}
    </>
  )
}