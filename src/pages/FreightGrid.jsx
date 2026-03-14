import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MagnifyingGlassIcon, FunnelIcon, ArrowTrendingDownIcon,
  SignalIcon, XMarkIcon, BoltIcon, GlobeAsiaAustraliaIcon, MapPinIcon,
} from "@heroicons/react/24/outline"
import { colors, typography } from "../styles"

const surface    = "#332B7A"
const surfaceMid = "#3D3585"
const surfaceHi  = "#453D9A"
const border     = "rgba(255,255,255,0.1)"
const borderHi   = "rgba(255,255,255,0.18)"
const textOn     = "rgba(255,255,255,0.95)"
const textSub    = "rgba(255,255,255,0.65)"
const textFade   = "rgba(255,255,255,0.35)"
const bg         = "#2D2566"

// ── All world hubs ──────────────────────────────────────────
export const HUBS = [
  // India
  { id:"delhi",       name:"Delhi",          lat:28.614,  lng:77.209,  routes:6100, volume:"₹3,210Cr", type:"Road Hub",   status:"normal",   congestion:38, region:"india" },
  { id:"mumbai",      name:"Mumbai",         lat:19.076,  lng:72.878,  routes:4820, volume:"₹2,840Cr", type:"Port+Road",  status:"moderate", congestion:52, region:"india" },
  { id:"jnpt",        name:"JNPT",           lat:18.948,  lng:72.953,  routes:1200, volume:"₹2,100Cr", type:"Port",       status:"moderate", congestion:58, region:"india" },
  { id:"chennai",     name:"Chennai",        lat:13.083,  lng:80.271,  routes:2480, volume:"₹1,380Cr", type:"Port+Rail",  status:"normal",   congestion:36, region:"india" },
  { id:"bangalore",   name:"Bangalore",      lat:12.972,  lng:77.595,  routes:2940, volume:"₹1,620Cr", type:"Air+Road",   status:"normal",   congestion:28, region:"india" },
  { id:"kolkata",     name:"Kolkata",        lat:22.573,  lng:88.364,  routes:2100, volume:"₹1,180Cr", type:"Port+Rail",  status:"moderate", congestion:44, region:"india" },
  { id:"hyderabad",   name:"Hyderabad",      lat:17.385,  lng:78.487,  routes:2260, volume:"₹1,040Cr", type:"Air+Road",   status:"normal",   congestion:30, region:"india" },
  { id:"ahmedabad",   name:"Ahmedabad",      lat:23.023,  lng:72.571,  routes:3120, volume:"₹1,780Cr", type:"Road Hub",   status:"moderate", congestion:42, region:"india" },
  { id:"pune",        name:"Pune",           lat:18.520,  lng:73.857,  routes:1840, volume:"₹890Cr",   type:"Road Hub",   status:"normal",   congestion:25, region:"india" },
  { id:"surat",       name:"Surat",          lat:21.170,  lng:72.831,  routes:1540, volume:"₹960Cr",   type:"Road Hub",   status:"normal",   congestion:33, region:"india" },
  // Global gateways
  { id:"dubai",       name:"Dubai",          lat:25.205,  lng:55.271,  routes:3400, volume:"$4.8B",    type:"Transship",  status:"moderate", congestion:57, region:"middleeast" },
  { id:"singapore",   name:"Singapore",      lat:1.352,   lng:103.820, routes:5800, volume:"$9.2B",    type:"Transship",  status:"moderate", congestion:48, region:"sea" },
  { id:"colombo",     name:"Colombo",        lat:6.927,   lng:79.862,  routes:1800, volume:"$2.1B",    type:"Transship",  status:"high",     congestion:68, region:"sea" },
  // China
  { id:"shanghai",    name:"Shanghai",       lat:31.230,  lng:121.474, routes:8200, volume:"$18.4B",   type:"Port",       status:"normal",   congestion:41, region:"china" },
  { id:"shenzhen",    name:"Shenzhen",       lat:22.543,  lng:114.058, routes:6400, volume:"$14.2B",   type:"Port",       status:"moderate", congestion:55, region:"china" },
  { id:"guangzhou",   name:"Guangzhou",      lat:23.130,  lng:113.264, routes:5800, volume:"$12.8B",   type:"Port+Air",   status:"normal",   congestion:44, region:"china" },
  { id:"beijing",     name:"Beijing",        lat:39.905,  lng:116.391, routes:4200, volume:"$8.6B",    type:"Air+Rail",   status:"normal",   congestion:36, region:"china" },
  { id:"chengdu",     name:"Chengdu",        lat:30.572,  lng:104.066, routes:2800, volume:"$4.2B",    type:"Rail Hub",   status:"normal",   congestion:28, region:"china" },
  { id:"ningbo",      name:"Ningbo",         lat:29.868,  lng:121.544, routes:4600, volume:"$10.1B",   type:"Port",       status:"moderate", congestion:49, region:"china" },
  { id:"tianjin",     name:"Tianjin",        lat:39.343,  lng:117.361, routes:3200, volume:"$6.4B",    type:"Port",       status:"normal",   congestion:38, region:"china" },
  { id:"wuhan",       name:"Wuhan",          lat:30.593,  lng:114.305, routes:2100, volume:"$3.8B",    type:"Rail Hub",   status:"normal",   congestion:31, region:"china" },
  // Europe
  { id:"rotterdam",   name:"Rotterdam",      lat:51.924,  lng:4.478,   routes:7200, volume:"€18.2B",   type:"Port",       status:"normal",   congestion:31, region:"europe" },
  { id:"hamburg",     name:"Hamburg",        lat:53.551,  lng:9.993,   routes:5400, volume:"€11.8B",   type:"Port",       status:"normal",   congestion:28, region:"europe" },
  { id:"antwerp",     name:"Antwerp",        lat:51.221,  lng:4.402,   routes:4800, volume:"€9.4B",    type:"Port",       status:"normal",   congestion:34, region:"europe" },
  { id:"london",      name:"London",         lat:51.507,  lng:-0.128,  routes:4200, volume:"£8.6B",    type:"Air+Port",   status:"normal",   congestion:29, region:"europe" },
  { id:"frankfurt",   name:"Frankfurt",      lat:50.110,  lng:8.682,   routes:3800, volume:"€7.2B",    type:"Air Hub",    status:"normal",   congestion:26, region:"europe" },
  { id:"paris",       name:"Paris",          lat:48.857,  lng:2.347,   routes:3200, volume:"€6.4B",    type:"Air+Road",   status:"normal",   congestion:24, region:"europe" },
  { id:"barcelona",   name:"Barcelona",      lat:41.388,  lng:2.154,   routes:2400, volume:"€4.8B",    type:"Port",       status:"normal",   congestion:32, region:"europe" },
  { id:"felixstowe",  name:"Felixstowe",     lat:51.960,  lng:1.351,   routes:2800, volume:"£5.6B",    type:"Port",       status:"normal",   congestion:38, region:"europe" },
  // USA
  { id:"la",          name:"Los Angeles",    lat:33.942,  lng:-118.408,routes:9800, volume:"$22.4B",   type:"Port",       status:"moderate", congestion:61, region:"usa" },
  { id:"newyork",     name:"New York",       lat:40.714,  lng:-74.006, routes:7600, volume:"$18.8B",   type:"Port+Air",   status:"moderate", congestion:54, region:"usa" },
  { id:"chicago",     name:"Chicago",        lat:41.878,  lng:-87.630, routes:6200, volume:"$14.2B",   type:"Rail+Road",  status:"normal",   congestion:42, region:"usa" },
  { id:"houston",     name:"Houston",        lat:29.760,  lng:-95.370, routes:5400, volume:"$12.8B",   type:"Port",       status:"normal",   congestion:38, region:"usa" },
  { id:"savannah",    name:"Savannah",       lat:32.083,  lng:-81.100, routes:3800, volume:"$8.2B",    type:"Port",       status:"normal",   congestion:44, region:"usa" },
  { id:"dallas",      name:"Dallas",         lat:32.779,  lng:-96.809, routes:4200, volume:"$9.6B",    type:"Air+Road",   status:"normal",   congestion:35, region:"usa" },
  { id:"seattle",     name:"Seattle",        lat:47.606,  lng:-122.332,routes:3200, volume:"$7.4B",    type:"Port",       status:"normal",   congestion:29, region:"usa" },
  { id:"miami",       name:"Miami",          lat:25.770,  lng:-80.194, routes:2800, volume:"$6.8B",    type:"Port",       status:"normal",   congestion:31, region:"usa" },
  // Other global
  { id:"tokyo",       name:"Tokyo",          lat:35.689,  lng:139.692, routes:4800, volume:"¥2.1T",    type:"Port+Air",   status:"normal",   congestion:33, region:"asia" },
  { id:"busan",       name:"Busan",          lat:35.180,  lng:129.075, routes:5200, volume:"$11.4B",   type:"Port",       status:"normal",   congestion:38, region:"asia" },
  { id:"hongkong",    name:"Hong Kong",      lat:22.319,  lng:114.169, routes:5600, volume:"$13.2B",   type:"Port+Air",   status:"moderate", congestion:51, region:"asia" },
  { id:"sydney",      name:"Sydney",         lat:-33.869, lng:151.209, routes:2400, volume:"A$4.8B",   type:"Port+Air",   status:"normal",   congestion:24, region:"oceania" },
  { id:"bandarabbas", name:"Bandar Abbas",   lat:27.183,  lng:56.270,  routes:420,  volume:"$0.8B",    type:"Port",       status:"high",     congestion:98, region:"middleeast" },
]

// ── Lanes ────────────────────────────────────────────────────
export const LANES = [
  // India domestic
  { from:"delhi",    to:"mumbai",    vol:4820, color:"#00B4D8", rate:"₹22,800",  saving:"20%" },
  { from:"delhi",    to:"bangalore", vol:1620, color:"#22C55E", rate:"₹38,400",  saving:"21%" },
  { from:"delhi",    to:"chennai",   vol:1380, color:"#22C55E", rate:"₹42,100",  saving:"18%" },
  { from:"delhi",    to:"kolkata",   vol:1940, color:"#A78BFA", rate:"₹18,600",  saving:"17%" },
  { from:"delhi",    to:"ahmedabad", vol:2100, color:"#00B4D8", rate:"₹14,200",  saving:"19%" },
  { from:"mumbai",   to:"bangalore", vol:2240, color:"#22C55E", rate:"₹24,400",  saving:"22%" },
  { from:"mumbai",   to:"chennai",   vol:1820, color:"#22C55E", rate:"₹22,100",  saving:"19%" },
  { from:"mumbai",   to:"pune",      vol:3200, color:"#00B4D8", rate:"₹4,200",   saving:"24%" },
  { from:"mumbai",   to:"ahmedabad", vol:2560, color:"#00B4D8", rate:"₹9,800",   saving:"18%" },
  { from:"chennai",  to:"bangalore", vol:2840, color:"#22C55E", rate:"₹8,400",   saving:"23%" },
  { from:"chennai",  to:"hyderabad", vol:1640, color:"#F59E0B", rate:"₹12,800",  saving:"21%" },
  { from:"kolkata",  to:"mumbai",    vol:1660, color:"#F59E0B", rate:"₹31,200",  saving:"20%" },
  { from:"ahmedabad",to:"surat",     vol:1840, color:"#00B4D8", rate:"₹4,800",   saving:"25%" },
  // India → International
  { from:"jnpt",     to:"dubai",     vol:3200, color:"#F59E0B", rate:"₹1,84,000",saving:"21%" },
  { from:"jnpt",     to:"singapore", vol:2800, color:"#00B4D8", rate:"₹1,45,000",saving:"21%" },
  { from:"jnpt",     to:"rotterdam", vol:1800, color:"#A78BFA", rate:"₹3,80,000",saving:"19%" },
  { from:"mumbai",   to:"dubai",     vol:2100, color:"#F59E0B", rate:"₹1,62,000",saving:"18%" },
  { from:"chennai",  to:"singapore", vol:1640, color:"#00B4D8", rate:"₹1,28,000",saving:"20%" },
  { from:"kolkata",  to:"singapore", vol:1200, color:"#00B4D8", rate:"₹1,34,000",saving:"17%" },
  // China → World
  { from:"shanghai",  to:"rotterdam",  vol:5800, color:"#00B4D8", rate:"$2,400",   saving:"16%" },
  { from:"shanghai",  to:"la",         vol:6200, color:"#A78BFA", rate:"$1,840",   saving:"18%" },
  { from:"shanghai",  to:"newyork",    vol:4200, color:"#A78BFA", rate:"$2,100",   saving:"14%" },
  { from:"shanghai",  to:"singapore",  vol:4800, color:"#00B4D8", rate:"$680",     saving:"15%" },
  { from:"shenzhen",  to:"rotterdam",  vol:4200, color:"#00B4D8", rate:"$2,280",   saving:"17%" },
  { from:"shenzhen",  to:"la",         vol:5400, color:"#A78BFA", rate:"$1,760",   saving:"19%" },
  { from:"guangzhou", to:"singapore",  vol:3200, color:"#00B4D8", rate:"$620",     saving:"16%" },
  { from:"guangzhou", to:"la",         vol:3800, color:"#A78BFA", rate:"$1,920",   saving:"18%" },
  { from:"beijing",   to:"frankfurt",  vol:1800, color:"#F59E0B", rate:"$3,200",   saving:"14%" },
  { from:"ningbo",    to:"rotterdam",  vol:3600, color:"#00B4D8", rate:"$2,160",   saving:"15%" },
  { from:"chengdu",   to:"rotterdam",  vol:1200, color:"#22C55E", rate:"$1,840",   saving:"12%" },
  { from:"tianjin",   to:"hamburg",    vol:2100, color:"#A78BFA", rate:"$2,400",   saving:"13%" },
  // China domestic
  { from:"shanghai",  to:"beijing",   vol:3200, color:"#A78BFA", rate:"$280",     saving:"22%" },
  { from:"shanghai",  to:"guangzhou", vol:4100, color:"#22C55E", rate:"$380",     saving:"20%" },
  { from:"beijing",   to:"chengdu",   vol:1800, color:"#22C55E", rate:"$420",     saving:"18%" },
  { from:"guangzhou", to:"shenzhen",  vol:5200, color:"#00B4D8", rate:"$140",     saving:"25%" },
  { from:"shanghai",  to:"wuhan",     vol:2400, color:"#F59E0B", rate:"$240",     saving:"21%" },
  // Europe internal
  { from:"rotterdam", to:"hamburg",   vol:4200, color:"#A78BFA", rate:"€680",     saving:"18%" },
  { from:"rotterdam", to:"antwerp",   vol:3800, color:"#A78BFA", rate:"€320",     saving:"22%" },
  { from:"rotterdam", to:"london",    vol:3200, color:"#00B4D8", rate:"€420",     saving:"19%" },
  { from:"hamburg",   to:"frankfurt", vol:2800, color:"#F59E0B", rate:"€580",     saving:"17%" },
  { from:"antwerp",   to:"paris",     vol:2100, color:"#22C55E", rate:"€380",     saving:"20%" },
  { from:"felixstowe",to:"rotterdam", vol:2400, color:"#00B4D8", rate:"€520",     saving:"16%" },
  { from:"london",    to:"paris",     vol:1800, color:"#22C55E", rate:"€280",     saving:"21%" },
  { from:"barcelona", to:"rotterdam", vol:1600, color:"#A78BFA", rate:"€1,240",   saving:"15%" },
  // Europe → World
  { from:"rotterdam", to:"newyork",   vol:2800, color:"#A78BFA", rate:"$1,680",   saving:"16%" },
  { from:"hamburg",   to:"newyork",   vol:2100, color:"#A78BFA", rate:"$1,720",   saving:"14%" },
  { from:"rotterdam", to:"singapore", vol:1800, color:"#00B4D8", rate:"$2,840",   saving:"15%" },
  // USA internal
  { from:"la",        to:"newyork",   vol:5600, color:"#A78BFA", rate:"$2,800",   saving:"19%" },
  { from:"la",        to:"chicago",   vol:4200, color:"#00B4D8", rate:"$1,960",   saving:"22%" },
  { from:"la",        to:"houston",   vol:3400, color:"#F59E0B", rate:"$2,200",   saving:"18%" },
  { from:"la",        to:"seattle",   vol:2800, color:"#22C55E", rate:"$1,200",   saving:"24%" },
  { from:"newyork",   to:"chicago",   vol:4800, color:"#00B4D8", rate:"$1,640",   saving:"20%" },
  { from:"newyork",   to:"savannah",  vol:2400, color:"#22C55E", rate:"$1,080",   saving:"17%" },
  { from:"newyork",   to:"miami",     vol:2200, color:"#22C55E", rate:"$960",     saving:"21%" },
  { from:"chicago",   to:"dallas",    vol:3100, color:"#F59E0B", rate:"$1,380",   saving:"19%" },
  { from:"houston",   to:"savannah",  vol:1800, color:"#22C55E", rate:"$1,480",   saving:"16%" },
  // Trans-Pacific / Trans-Atlantic
  { from:"la",        to:"tokyo",     vol:3800, color:"#F59E0B", rate:"$1,640",   saving:"15%" },
  { from:"la",        to:"busan",     vol:2800, color:"#00B4D8", rate:"$1,480",   saving:"16%" },
  { from:"newyork",   to:"london",    vol:3200, color:"#A78BFA", rate:"$2,200",   saving:"14%" },
  { from:"newyork",   to:"hamburg",   vol:2400, color:"#A78BFA", rate:"$2,480",   saving:"13%" },
  { from:"houston",   to:"rotterdam", vol:2100, color:"#A78BFA", rate:"$2,840",   saving:"15%" },
  // Asia
  { from:"tokyo",     to:"singapore", vol:3200, color:"#00B4D8", rate:"$1,280",   saving:"17%" },
  { from:"tokyo",     to:"busan",     vol:2800, color:"#22C55E", rate:"$620",     saving:"20%" },
  { from:"busan",     to:"singapore", vol:2400, color:"#00B4D8", rate:"$1,180",   saving:"16%" },
  { from:"hongkong",  to:"singapore", vol:3600, color:"#00B4D8", rate:"$480",     saving:"18%" },
  { from:"hongkong",  to:"rotterdam", vol:2800, color:"#A78BFA", rate:"$2,640",   saving:"17%" },
  { from:"sydney",    to:"singapore", vol:1800, color:"#00B4D8", rate:"$1,480",   saving:"14%" },
  { from:"sydney",    to:"hongkong",  vol:1400, color:"#22C55E", rate:"$1,320",   saving:"13%" },
  // Gulf crisis lanes
  { from:"dubai",     to:"rotterdam", vol:2400, color:"#A78BFA", rate:"$2,400",   saving:"16%" },
  { from:"dubai",     to:"london",    vol:1800, color:"#A78BFA", rate:"$2,800",   saving:"15%" },
  { from:"dubai",     to:"singapore", vol:2200, color:"#00B4D8", rate:"$1,840",   saving:"17%" },
  { from:"colombo",   to:"singapore", vol:1600, color:"#00B4D8", rate:"$840",     saving:"16%" },
  { from:"colombo",   to:"rotterdam", vol:1200, color:"#A78BFA", rate:"$2,980",   saving:"14%" },
]

const TICKER = [
  { tag:"LIVE",     color:"#22C55E", text:"MSC AURORA · JNPT → Dubai · ETA Mar 18 · On time" },
  { tag:"SAVED",    color:"#00B4D8", text:"AI saved ₹4.2L · Mumbai → Delhi · 2 min ago" },
  { tag:"ALERT",    color:"#EF4444", text:"Bandar Abbas CRITICAL · 340+ shipments rerouting globally" },
  { tag:"AI",       color:"#A78BFA", text:"AI locked $1,840 vs $2,240 market · Shanghai → LA" },
  { tag:"DONE",     color:"#22C55E", text:"SHP-2026-089 · Delivered Bangalore 4hr ahead of ETA" },
  { tag:"INTEL",    color:"#00B4D8", text:"68,200 global routes benchmarked · dataset refreshed" },
  { tag:"REROUTE",  color:"#F59E0B", text:"Hormuz alt route: Colombo → Jebel Ali via Cape of Good Hope" },
]

const RATES = [
  { route:"Shanghai → Rotterdam", mode:"Sea",  lorri:2400,  market:2860,  saving:16.1 },
  { route:"Mumbai → Delhi",       mode:"Road", lorri:22800, market:28600, saving:20.3 },
  { route:"LA → New York",        mode:"Road", lorri:2800,  market:3450,  saving:18.8 },
  { route:"JNPT → Singapore",     mode:"Sea",  lorri:145000,market:184000,saving:21.2 },
  { route:"Rotterdam → Hamburg",  mode:"Sea",  lorri:680,   market:820,   saving:17.1 },
  { route:"Shenzhen → LA",        mode:"Sea",  lorri:1760,  market:2140,  saving:17.8 },
  { route:"Tokyo → Singapore",    mode:"Sea",  lorri:1280,  market:1540,  saving:16.9 },
  { route:"New York → London",    mode:"Sea",  lorri:2200,  market:2560,  saving:14.1 },
]

const STATUS_COLOR = { normal:"#22C55E", moderate:"#F59E0B", high:"#EF4444" }
const MODE_COLOR   = { Road:"#00B4D8", Sea:"#A78BFA", Air:"#F59E0B", Rail:"#22C55E" }

function hubTooltipHTML(hub) {
  const sc = STATUS_COLOR[hub.status] || "#22C55E"
  return `<div style="background:#332B7A;border:1px solid rgba(255,255,255,0.18);border-radius:12px;padding:12px 14px;color:#fff;font-family:sans-serif;min-width:190px;box-shadow:0 8px 32px rgba(0,0,0,0.5)">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:9px">
      <div style="width:8px;height:8px;border-radius:50%;background:${sc};box-shadow:0 0 8px ${sc};flex-shrink:0"></div>
      <span style="font-weight:700;font-size:13px">${hub.name}</span>
      <span style="margin-left:auto;padding:2px 7px;border-radius:4px;background:${sc}18;border:1px solid ${sc}35;color:${sc};font-size:9px;font-weight:700">${hub.type}</span>
    </div>
    ${[["Volume/mo",hub.volume,"#00B4D8"],["Routes",hub.routes.toLocaleString("en-IN"),"rgba(255,255,255,0.85)"],["Congestion",hub.congestion+"%",sc]].map(([l,v,c])=>`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:5px">
      <span style="color:rgba(255,255,255,0.4);font-size:11px">${l}</span>
      <span style="color:${c};font-size:11px;font-weight:600;font-family:monospace">${v}</span>
    </div>`).join("")}
    <div style="margin-top:9px;height:4px;border-radius:99px;background:rgba(255,255,255,0.07);overflow:hidden">
      <div style="width:${hub.congestion}%;height:100%;border-radius:99px;background:${sc}"></div>
    </div>
  </div>`
}

function laneTooltipHTML(lane, f, t) {
  return `<div style="background:#332B7A;border:1px solid rgba(255,255,255,0.18);border-radius:12px;padding:12px 14px;color:#fff;font-family:sans-serif;min-width:200px;box-shadow:0 8px 32px rgba(0,0,0,0.5)">
    <div style="font-weight:700;font-size:13px;margin-bottom:9px">${f.name} → ${t.name}</div>
    ${[["LoRRI Rate",lane.rate,"#00B4D8"],["Saving vs market",lane.saving+" below","#22C55E"],["Monthly volume",lane.vol.toLocaleString("en-IN")+" TEU","rgba(255,255,255,0.8)"]].map(([l,v,c])=>`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:5px">
      <span style="color:rgba(255,255,255,0.4);font-size:11px">${l}</span>
      <span style="color:${c};font-size:11px;font-weight:600;font-family:monospace">${v}</span>
    </div>`).join("")}
  </div>`
}

export default function FreightGrid({ embedded = false, embeddedHeight = "520px" }) {
  const mapContainerRef = useRef(null)
  const leafletRef      = useRef(null)
  const mapRef          = useRef(null)
  const linesRef        = useRef([])
  const markersRef      = useRef([])

  const [activeHub,    setActiveHub]   = useState(null)
  const [hubZoomed,    setHubZoomed]   = useState(false)
  const [tab,          setTab]         = useState("hubs")
  const [search,      setSearch]      = useState("")
  const [tickerIdx,   setTickerIdx]   = useState(0)
  const [mapReady,    setMapReady]    = useState(false)
  const [filterMode,  setFilterMode]  = useState("all")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const t = setInterval(() => setTickerIdx(i => (i + 1) % TICKER.length), 3400)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link")
      link.id = "leaflet-css"; link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)
    }
    if (window.L) { leafletRef.current = window.L; initMap(); return }
    if (document.getElementById("leaflet-js")) { return }
    const s = document.createElement("script")
    s.id = "leaflet-js"
    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    s.onload = () => { leafletRef.current = window.L; initMap() }
    document.head.appendChild(s)
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null } }
  }, [])

  const initMap = useCallback(() => {
    if (!mapContainerRef.current || mapRef.current) return
    const L = leafletRef.current
    const map = L.map(mapContainerRef.current, {
      center: [20, 15], zoom: embedded ? 2 : 3,
      zoomControl: false, attributionControl: false, preferCanvas: true,
      minZoom: 2, maxZoom: 12,
    })
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", { maxZoom:18 }).addTo(map)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png", { maxZoom:18, opacity:0.5 }).addTo(map)
    L.control.zoom({ position:"bottomright" }).addTo(map)
    mapRef.current = map
    setMapReady(true)
  }, [embedded])

  useEffect(() => {
    if (!mapReady) return
    drawLanes(); drawMarkers()
  }, [mapReady, activeHub, filterMode])

  const getHub = (id) => HUBS.find(h => h.id === id)

  const regionCheck = (hub) => {
    if (filterMode === "all") return true
    if (filterMode === "india") return hub.region === "india"
    if (filterMode === "china") return hub.region === "china"
    if (filterMode === "europe") return hub.region === "europe"
    if (filterMode === "usa") return hub.region === "usa"
    return true
  }

  const drawLanes = () => {
    const L = leafletRef.current; const map = mapRef.current
    if (!L || !map) return
    linesRef.current.forEach(l => l.remove())
    linesRef.current = []

    LANES.forEach(lane => {
      const f = getHub(lane.from); const t = getHub(lane.to)
      if (!f || !t) return
      if (!regionCheck(f) && !regionCheck(t)) return

      const highlighted = activeHub && (lane.from === activeHub || lane.to === activeHub)
      const dimmed      = activeHub && !highlighted
      const weight  = dimmed ? 0.3 : highlighted ? Math.max(2, lane.vol / 800) : Math.max(0.6, lane.vol / 1600)
      const opacity = dimmed ? 0.05 : highlighted ? 0.92 : 0.35

      const arcLat = (f.lat + t.lat) / 2 - Math.abs(f.lng - t.lng) * 0.04
      const arcLng = (f.lng + t.lng) / 2

      const polyline = L.polyline([[f.lat,f.lng],[arcLat,arcLng],[t.lat,t.lng]], {
        color: lane.color, weight, opacity, smoothFactor:3, lineCap:"round", lineJoin:"round",
      })
      polyline.on("mouseover", (e) => {
        polyline.setStyle({ weight: weight + 2, opacity: 1 })
        L.popup({ className:"lorri-popup", closeButton:false, autoPan:false, offset:[0,-4] })
          .setLatLng(e.latlng).setContent(laneTooltipHTML(lane, f, t)).openOn(map)
      })
      polyline.on("mouseout", () => { polyline.setStyle({ weight, opacity }); map.closePopup() })
      polyline.on("click", () => setActiveHub(prev => (prev === f.id || prev === t.id) ? null : f.id))
      polyline.addTo(map)
      linesRef.current.push(polyline)
    })
  }

  const drawMarkers = () => {
    const L = leafletRef.current; const map = mapRef.current
    if (!L || !map) return
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    HUBS.forEach(hub => {
      const isActive = hub.id === activeHub
      const sc   = STATUS_COLOR[hub.status] || "#22C55E"
      const size = isActive ? 16 : hub.routes > 5000 ? 12 : hub.routes > 2000 ? 9 : 6

      const icon = L.divIcon({
        className: "",
        html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${sc};border:${isActive?"2.5px solid #fff":`1.5px solid ${sc}90`};box-shadow:${isActive?`0 0 18px ${sc},0 0 36px ${sc}60`:`0 0 6px ${sc}70`};cursor:pointer;position:relative">${isActive?`<div style="position:absolute;top:-7px;left:-7px;right:-7px;bottom:-7px;border-radius:50%;border:1.5px solid ${sc}60;animation:hubRing 1.8s ease-in-out infinite"></div>`:""}</div>`,
        iconSize:[size,size], iconAnchor:[size/2,size/2],
      })
      const marker = L.marker([hub.lat, hub.lng], { icon, zIndexOffset: isActive ? 1000 : 0 })
      marker.on("click", () => setActiveHub(prev => prev === hub.id ? null : hub.id))
      marker.on("mouseover", () => {
        L.popup({ className:"lorri-popup", closeButton:false, autoPan:false, offset:[0,-size/2-2] })
          .setLatLng([hub.lat, hub.lng]).setContent(hubTooltipHTML(hub)).openOn(map)
      })
      marker.on("mouseout", () => map.closePopup())
      marker.addTo(map)
      markersRef.current.push(marker)
    })
  }

  // When hub changes, zoom map to it
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const map = mapRef.current
    if (activeHub) {
      const hub = HUBS.find(h => h.id === activeHub)
      if (hub) {
        map.flyTo([hub.lat, hub.lng], embedded ? 4 : 5, { duration: 0.8 })
        setHubZoomed(true)
        setTab("lane")
      }
    } else {
      map.flyTo([20, 15], embedded ? 2 : 3, { duration: 0.8 })
      setHubZoomed(false)
    }
  }, [activeHub, mapReady, embedded])
  const activeHubData  = activeHub ? HUBS.find(h => h.id === activeHub) : null
  const activeHubLanes = activeHub ? LANES.filter(l => l.from === activeHub || l.to === activeHub) : []
  const filteredHubs   = HUBS.filter(h => !search || h.name.toLowerCase().includes(search.toLowerCase()))
  const filteredRates  = RATES.filter(r => !search || r.route.toLowerCase().includes(search.toLowerCase()))

  const height = embedded ? embeddedHeight : "calc(100vh - 60px)"

  return (
    <div style={{ display:"flex", flexDirection:"column", height, background:bg, overflow:"hidden", fontFamily:"sans-serif", borderRadius: embedded ? 16 : 0 }}>
      <style>{`
        .leaflet-container{background:#1a1540!important}
        .lorri-popup .leaflet-popup-content-wrapper{background:transparent!important;border:none!important;box-shadow:none!important;padding:0!important}
        .lorri-popup .leaflet-popup-content{margin:0!important}
        .lorri-popup .leaflet-popup-tip-container{display:none!important}
        .leaflet-control-zoom{border:none!important;box-shadow:none!important;border-radius:10px!important;overflow:hidden}
        .leaflet-control-zoom a{background:${surface}!important;border-bottom:1px solid ${border}!important;color:${textSub}!important;width:28px!important;height:28px!important;line-height:28px!important}
        .leaflet-control-zoom a:hover{background:${surfaceMid}!important;color:${textOn}!important}
        @keyframes hubRing{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.6);opacity:0}}
        @keyframes ldot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.6)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
        .hub-row:hover{background:${surfaceMid}!important}
        .rate-row:hover{background:rgba(255,255,255,0.04)!important}
        .lane-row-s:hover{background:${surfaceMid}!important}
      `}</style>

      {/* TOP BAR */}
      <div style={{ display:"flex", alignItems:"center", padding:"8px 14px", background:surface, borderBottom:`1px solid ${border}`, flexShrink:0, gap:8, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#0077B6,#00B4D8)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <GlobeAsiaAustraliaIcon style={{ width:15, height:15, color:"#fff" }}/>
          </div>
          <div>
            <div style={{ color:textOn, fontWeight:700, fontSize:13, lineHeight:1.1 }}>Global Freight Grid</div>
            <div style={{ color:textFade, fontSize:9, letterSpacing:".1em", textTransform:"uppercase" }}>68,200 routes · worldwide · live</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:5, padding:"3px 9px", borderRadius:999, background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.25)" }}>
          <div style={{ width:5, height:5, borderRadius:"50%", background:"#22C55E", animation:"ldot 1.5s ease-in-out infinite" }}/>
          <span style={{ color:"#22C55E", fontSize:10, fontWeight:600 }}>LIVE</span>
        </div>

        {/* Ticker */}
        <div style={{ flex:1, display:"flex", alignItems:"center", gap:6, overflow:"hidden", minWidth:0 }}>
          <div style={{ width:1, height:12, background:border, flexShrink:0 }}/>
          <div style={{ flex:1, overflow:"hidden", height:17, position:"relative", minWidth:0 }}>
            {TICKER.map((item, i) => (
              <div key={i} style={{ position:"absolute", top:0, left:0, display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap",
                opacity: i===tickerIdx?1:0, transform: i===tickerIdx?"translateY(0)":"translateY(6px)", transition:"opacity .3s,transform .3s" }}>
                <span style={{ padding:"2px 5px", borderRadius:3, background:`${item.color}18`, border:`1px solid ${item.color}35`, color:item.color, fontSize:9, fontWeight:800 }}>{item.tag}</span>
                <span style={{ color:textSub, fontSize:11 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Region filter */}
        <div style={{ display:"flex", gap:2, padding:"2px", borderRadius:7, background:surfaceMid, border:`1px solid ${border}`, flexShrink:0 }}>
          {[["all","World"],["india","India"],["china","China"],["usa","USA"],["europe","EU"]].map(([v,l]) => (
            <button key={v} onClick={() => setFilterMode(v)}
              style={{ padding:"3px 8px", borderRadius:5, fontSize:10, fontWeight:600, cursor:"pointer", border:"none", fontFamily:"inherit",
                background: filterMode===v ? surface : "transparent", color: filterMode===v ? textOn : textSub, transition:"all .15s" }}>{l}</button>
          ))}
        </div>

        <div style={{ position:"relative", flexShrink:0 }}>
          <MagnifyingGlassIcon style={{ position:"absolute", left:7, top:"50%", transform:"translateY(-50%)", width:11, height:11, color:textFade }}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hub…"
            style={{ background:"rgba(255,255,255,0.07)", border:`1px solid ${border}`, color:textOn, fontSize:11,
              padding:"5px 10px 5px 24px", borderRadius:7, outline:"none", width:130, fontFamily:"inherit" }}/>
        </div>

        <button onClick={() => setSidebarOpen(o => !o)}
          style={{ width:28, height:28, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center",
            background: sidebarOpen ? surfaceMid : "rgba(255,255,255,0.07)", border:`1px solid ${border}`, cursor:"pointer",
            color: sidebarOpen ? textOn : textSub, transition:"all .15s", flexShrink:0 }}>
          <FunnelIcon style={{ width:13, height:13 }}/>
        </button>
      </div>

      {/* STAT RIBBON */}
      <div style={{ display:"flex", background:"rgba(0,0,0,0.22)", borderBottom:`1px solid ${border}`, flexShrink:0, overflowX:"auto" }}>
        {[
          { label:"Routes",       val:"68,200+",  color:colors.accent,  Icon:SignalIcon             },
          { label:"Monthly Vol",  val:"$2.1T",    color:"#A78BFA",      Icon:BoltIcon               },
          { label:"Avg Saving",   val:"17.8%",    color:"#22C55E",      Icon:ArrowTrendingDownIcon  },
          { label:"Global Hubs",  val:`${HUBS.length}`,color:"#F59E0B", Icon:MapPinIcon             },
        ].map(({ label, val, color, Icon }) => (
          <div key={label} style={{ flex:"1 0 110px", padding:"7px 12px", borderRight:`1px solid ${border}`, display:"flex", alignItems:"center", gap:7 }}>
            <div style={{ width:22, height:22, borderRadius:6, background:`${color}15`, border:`1px solid ${color}28`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Icon style={{ width:11, height:11, color }}/>
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:800, letterSpacing:"-.02em", lineHeight:1, color }}>{val}</div>
              <div style={{ color:textFade, fontSize:9, marginTop:2 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* BODY */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", position:"relative" }}>
        {/* MAP */}
        <div ref={mapContainerRef} style={{ flex:1, position:"relative" }}>
          {!mapReady && (
            <div style={{ position:"absolute", inset:0, background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:10, zIndex:20 }}>
              <div style={{ width:28, height:28, border:`2px solid ${border}`, borderTopColor:colors.accent, borderRadius:"50%", animation:"spin .75s linear infinite" }}/>
              <span style={{ color:textFade, fontSize:12 }}>Loading freight grid…</span>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside key="sidebar"
              initial={{ x:280, opacity:0 }} animate={{ x:0, opacity:1 }} exit={{ x:280, opacity:0 }}
              transition={{ type:"tween", duration:.18 }}
              style={{ width:270, background:surface, borderLeft:`1px solid ${border}`, display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0, zIndex:20 }}>

              <div style={{ display:"flex", padding:"8px 8px 0", gap:2, borderBottom:`1px solid ${border}`, background:surfaceMid }}>
                {[["hubs","Hubs"],["rates","Rates"],["lane","Lane"]].map(([id,lbl]) => (
                  <button key={id} onClick={() => setTab(id)}
                    style={{ flex:1, padding:"6px 4px", borderRadius:"6px 6px 0 0", fontSize:10, fontWeight:600, cursor:"pointer", border:"none",
                      borderBottom: tab===id ? `2px solid ${colors.accent}` : "2px solid transparent",
                      fontFamily:"inherit", background: tab===id ? surface : "transparent",
                      color: tab===id ? textOn : textSub, transition:"all .15s" }}>
                    {lbl}{id==="lane"&&activeHub&&<span style={{ marginLeft:4, width:5, height:5, borderRadius:"50%", background:colors.accent, display:"inline-block", verticalAlign:"middle" }}/>}
                  </button>
                ))}
              </div>

              <div style={{ flex:1, overflowY:"auto", padding:"10px" }}>
                {/* HUBS */}
                {tab==="hubs" && <>
                  <div style={{ color:textFade, fontSize:9, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", marginBottom:7 }}>
                    Global Hubs · {filteredHubs.length}
                  </div>
                  {filteredHubs.map(hub => {
                    const sc = STATUS_COLOR[hub.status]; const isActive = hub.id === activeHub
                    return (
                      <div key={hub.id} className="hub-row"
                        onClick={() => setActiveHub(p => p===hub.id ? null : hub.id)}
                        style={{ padding:"7px 8px", borderRadius:8, marginBottom:3, display:"flex", alignItems:"center", gap:7, cursor:"pointer", transition:"background .15s",
                          background: isActive ? surfaceMid : "transparent", border:`1px solid ${isActive ? borderHi : "transparent"}` }}>
                        <div style={{ width:7, height:7, borderRadius:"50%", background:sc, flexShrink:0, boxShadow:`0 0 4px ${sc}80` }}/>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ color: isActive ? textOn : textSub, fontSize:11, fontWeight: isActive ? 700 : 500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{hub.name}</div>
                          <div style={{ color:textFade, fontSize:9, marginTop:1 }}>{hub.type} · {hub.routes.toLocaleString("en-IN")}</div>
                        </div>
                        <div style={{ color:colors.accent, fontSize:10, fontWeight:600, fontFamily:"monospace", flexShrink:0 }}>{hub.volume}</div>
                      </div>
                    )
                  })}
                </>}

                {/* RATES */}
                {tab==="rates" && <>
                  <div style={{ color:textFade, fontSize:9, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", marginBottom:7 }}>
                    LoRRI vs Market · {filteredRates.length} routes
                  </div>
                  {filteredRates.map((r, i) => {
                    const mc = MODE_COLOR[r.mode] || colors.accent
                    return (
                      <motion.div key={i} className="rate-row"
                        initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*.04 }}
                        style={{ padding:"9px 8px", borderRadius:9, marginBottom:4, background:"rgba(255,255,255,0.03)", border:`1px solid ${border}`, transition:"background .15s" }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                          <span style={{ color:textSub, fontSize:10, fontWeight:600 }}>{r.route}</span>
                          <span style={{ padding:"1px 5px", borderRadius:3, background:`${mc}18`, border:`1px solid ${mc}30`, color:mc, fontSize:9, fontWeight:700 }}>{r.mode}</span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <div>
                            <div style={{ color:textFade, fontSize:9 }}>LoRRI</div>
                            <div style={{ color:textOn, fontSize:12, fontWeight:700, fontFamily:"monospace" }}>
                              {typeof r.lorri === "number" && r.lorri > 10000 ? `₹${r.lorri.toLocaleString("en-IN")}` : `$${r.lorri.toLocaleString()}`}
                            </div>
                          </div>
                          <div style={{ color:"#22C55E", fontSize:13, fontWeight:800 }}>▼{r.saving.toFixed(1)}%</div>
                          <div style={{ textAlign:"right" }}>
                            <div style={{ color:textFade, fontSize:9 }}>Market</div>
                            <div style={{ color:textFade, fontSize:11, fontFamily:"monospace", textDecoration:"line-through" }}>
                              {typeof r.market === "number" && r.market > 10000 ? `₹${r.market.toLocaleString("en-IN")}` : `$${r.market.toLocaleString()}`}
                            </div>
                          </div>
                        </div>
                        <div style={{ marginTop:7, height:3, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                          <motion.div initial={{ width:0 }} animate={{ width:`${r.saving}%` }} transition={{ duration:.8, delay: i*.05 }}
                            style={{ height:"100%", borderRadius:99, background:"#22C55E" }}/>
                        </div>
                      </motion.div>
                    )
                  })}
                </>}

                {/* LANE */}
                {tab==="lane" && (
                  !activeHub
                    ? <div style={{ textAlign:"center", padding:"32px 12px" }}>
                        <MapPinIcon style={{ width:24, height:24, color:textFade, margin:"0 auto 10px" }}/>
                        <p style={{ color:textFade, fontSize:11, lineHeight:1.6 }}>Click any hub on the map to explore its freight lanes</p>
                      </div>
                    : <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>
                        <div style={{ padding:"10px", borderRadius:10, background:surfaceMid, border:`1px solid ${borderHi}`, marginBottom:10 }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                              <div style={{ width:7, height:7, borderRadius:"50%", background:STATUS_COLOR[activeHubData?.status] }}/>
                              <span style={{ color:textOn, fontSize:13, fontWeight:700 }}>{activeHubData?.name}</span>
                            </div>
                            <button onClick={() => setActiveHub(null)} style={{ background:"transparent", border:"none", cursor:"pointer", color:textFade }}>
                              <XMarkIcon style={{ width:13, height:13 }}/>
                            </button>
                          </div>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
                            {[["Volume",activeHubData?.volume,colors.accent],["Routes",activeHubData?.routes?.toLocaleString("en-IN"),textOn],["Type",activeHubData?.type,textSub],["Congestion",`${activeHubData?.congestion}%`,STATUS_COLOR[activeHubData?.status]]].map(([l,v,c]) => (
                              <div key={l} style={{ padding:"6px 7px", borderRadius:7, background:"rgba(0,0,0,0.2)", border:`1px solid ${border}` }}>
                                <div style={{ color:textFade, fontSize:9, textTransform:"uppercase" }}>{l}</div>
                                <div style={{ color:c, fontSize:11, fontWeight:600, marginTop:2 }}>{v}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={{ color:textFade, fontSize:9, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:7 }}>
                          Connected Lanes · {activeHubLanes.length}
                        </div>
                        {activeHubLanes.map((lane, i) => {
                          const otherId = lane.from === activeHub ? lane.to : lane.from
                          const other   = HUBS.find(h => h.id === otherId)
                          const dir     = lane.from === activeHub ? "→" : "←"
                          return (
                            <motion.div key={i} className="lane-row-s"
                              initial={{ opacity:0, x:6 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*.04 }}
                              style={{ padding:"7px 9px", borderRadius:9, marginBottom:3, background:"rgba(255,255,255,0.025)", border:`1px solid ${border}`, display:"flex", alignItems:"center", gap:7, transition:"background .15s" }}>
                              <div style={{ width:5, height:5, borderRadius:"50%", background:lane.color, flexShrink:0, boxShadow:`0 0 4px ${lane.color}` }}/>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ color:textSub, fontSize:10, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                  {activeHubData?.name} {dir} {other?.name || otherId}
                                </div>
                                <div style={{ color:textFade, fontSize:9, marginTop:1 }}>{lane.vol.toLocaleString("en-IN")} TEU/mo</div>
                              </div>
                              <div style={{ color:"#22C55E", fontSize:10, fontWeight:700, flexShrink:0 }}>{lane.saving}</div>
                            </motion.div>
                          )
                        })}
                      </motion.div>
                )}
              </div>

              <div style={{ padding:"7px 10px", borderTop:`1px solid ${border}`, background:surfaceMid, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ color:textFade, fontSize:10 }}>Dataset: Mar 2026</span>
                <div style={{ display:"flex", alignItems:"center", gap:4, color:"#22C55E", fontSize:10, fontWeight:600 }}>
                  <div style={{ width:5, height:5, borderRadius:"50%", background:"#22C55E", animation:"ldot 1.5s ease-in-out infinite" }}/>
                  Live
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Floating hub connections card — shown when sidebar is closed */}
      <AnimatePresence>
        {activeHub && !sidebarOpen && (
          <motion.div initial={{ opacity:0, y:14, scale:.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:10 }}
            style={{ position:"absolute", bottom:16, left:16, zIndex:200, background:surface, border:`1px solid ${borderHi}`, borderRadius:14, padding:"13px 14px", width:260, boxShadow:"0 16px 48px rgba(0,0,0,0.6)" }}>
            {/* Hub header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:STATUS_COLOR[activeHubData?.status], boxShadow:`0 0 8px ${STATUS_COLOR[activeHubData?.status]}80` }}/>
                <span style={{ color:textOn, fontSize:13, fontWeight:700 }}>{activeHubData?.name}</span>
                <span style={{ padding:"1px 6px", borderRadius:3, background:"rgba(255,255,255,0.08)", color:textFade, fontSize:9, fontWeight:600 }}>{activeHubData?.type}</span>
              </div>
              <button onClick={() => setActiveHub(null)} style={{ background:"transparent", border:"none", cursor:"pointer", color:textFade }}>
                <XMarkIcon style={{ width:13, height:13 }}/>
              </button>
            </div>
            {/* Stats grid */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:5, marginBottom:10 }}>
              {[["Volume", activeHubData?.volume, colors.accent], ["Routes", activeHubData?.routes?.toLocaleString("en-IN"), textOn], ["Congestion", `${activeHubData?.congestion}%`, STATUS_COLOR[activeHubData?.status]]].map(([l,v,c]) => (
                <div key={l} style={{ padding:"6px 7px", borderRadius:7, background:surfaceMid, border:`1px solid ${border}`, textAlign:"center" }}>
                  <div style={{ color:textFade, fontSize:8, textTransform:"uppercase", letterSpacing:".06em" }}>{l}</div>
                  <div style={{ color:c, fontSize:11, fontWeight:700, marginTop:2, fontFamily:"monospace" }}>{v}</div>
                </div>
              ))}
            </div>
            {/* Connections header */}
            <div style={{ color:textFade, fontSize:9, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:6 }}>
              {activeHubLanes.length} connections
            </div>
            {/* Top 5 connected lanes */}
            <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
              {activeHubLanes.slice(0, 5).map((lane, i) => {
                const otherId = lane.from === activeHub ? lane.to : lane.from
                const other   = HUBS.find(h => h.id === otherId)
                const isOut   = lane.from === activeHub
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 7px", borderRadius:7, background:"rgba(255,255,255,0.04)", border:`1px solid ${border}` }}>
                    <div style={{ width:5, height:5, borderRadius:"50%", background:lane.color, flexShrink:0 }}/>
                    <span style={{ color:textSub, fontSize:10, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {isOut ? "→" : "←"} {other?.name || otherId}
                    </span>
                    <span style={{ color:"#22C55E", fontSize:10, fontWeight:700, flexShrink:0 }}>{lane.saving}</span>
                    <span style={{ color:textFade, fontSize:9, flexShrink:0 }}>{(lane.vol/1000).toFixed(1)}K TEU</span>
                  </div>
                )
              })}
              {activeHubLanes.length > 5 && (
                <div style={{ color:textFade, fontSize:9, textAlign:"center", paddingTop:2 }}>+{activeHubLanes.length - 5} more lanes</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
