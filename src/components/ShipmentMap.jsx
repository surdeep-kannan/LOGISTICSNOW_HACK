import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// ── Asset imports — Vite resolves these to correct hashed URLs ──
import imgSmoving    from "../assets/smoving.png"
import imgTruckMove  from "../assets/truck_move.png"
import imgLoading    from "../assets/loading.png"
import imgLcomplete  from "../assets/lcomplete.png"
import imgShipMoving from "../assets/ship_moving.png"
/**
 * shipmentState values:
 *   "truck-departed"  → smoving.png       (truck just left a hub)
 *   "truck-moving"    → truck_move.png    (truck on road, LIVE)
 *   "loading-ship"    → loading.gif       (container being loaded at port)
 *   "loaded-complete" → lcomplete.png     (container fully loaded, ready)
 *   "ship-moving"     → ship_moving.png   (vessel at sea)
 *   "customs"         → loading.gif       (held at customs)
 *
 * transportMode: "road" | "sea" | "multimodal"
 */

const STATE_CONFIG = {
  "truck-departed":  { img: imgSmoving,    size: 64, label: "DEPARTED",   labelBg: "#F59E0B", pulse: "#F59E0B" },
  "truck-moving":    { img: imgTruckMove,  size: 64, label: "LIVE",       labelBg: "#EF4444", pulse: "#F59E0B" },
  "loading-ship":    { img: imgLoading,    size: 72, label: "LOADING",    labelBg: "#6C63FF", pulse: "#6C63FF" },
  "loaded-complete": { img: imgLcomplete,  size: 68, label: "LOADED",     labelBg: "#10B981", pulse: "#10B981" },
  "ship-moving":     { img: imgShipMoving, size: 80, label: "AT SEA",     labelBg: "#3B82F6", pulse: "#3B82F6" },
  "customs":         { img: imgLoading,    size: 68, label: "CUSTOMS",    labelBg: "#6C63FF", pulse: "#6C63FF" },
  "checkpoint":      { img: imgSmoving,    size: 64, label: "CHECKPOINT", labelBg: "#F59E0B", pulse: "#F59E0B" },
}

function makeMovingIcon(state) {
  const cfg = STATE_CONFIG[state] || STATE_CONFIG["truck-moving"]
  const s = cfg.size
  return L.divIcon({
    html: `
      <div class="lorri-gif-icon" style="position:relative;width:${s}px;height:${s}px;">
        <img src="${cfg.img}" style="width:${s}px;height:${s}px;object-fit:contain;filter:drop-shadow(0 4px 14px ${cfg.pulse}88)" />
        <div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:${cfg.labelBg};color:white;padding:2px 8px;border-radius:5px;font-size:9px;font-weight:800;white-space:nowrap;box-shadow:0 2px 6px ${cfg.labelBg}88;border:2px solid white;letter-spacing:0.6px">${cfg.label}</div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${s+16}px;height:${s+16}px;border:2px solid ${cfg.pulse};border-radius:50%;opacity:0.5;animation:shpmap-pulse 2s ease-out infinite"></div>
      </div>
      <style>@keyframes shpmap-pulse{0%{transform:translate(-50%,-50%) scale(0.8);opacity:0.7}100%{transform:translate(-50%,-50%) scale(1.5);opacity:0}}</style>`,
    className: "", iconSize: [s, s], iconAnchor: [s / 2, s / 2],
  })
}

function makeDotIcon(color) {
  return L.divIcon({
    html: `<div style="width:14px;height:14px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
    className: "", iconSize: [14, 14], iconAnchor: [7, 7],
  })
}

function makePortIcon(label) {
  return L.divIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:3px">
      <div style="width:18px;height:18px;background:#6C63FF;border:3px solid white;border-radius:4px;box-shadow:0 2px 8px rgba(108,99,255,0.5)"></div>
      <div style="background:white;color:#1F2937;font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.2)">${label}</div>
    </div>`,
    className: "", iconSize: [18, 32], iconAnchor: [9, 9],
  })
}

export function ShipmentMap({
  origin,
  current,
  destination,
  shipmentState = "truck-moving",
  transportMode = "road",
  ports = [],
  shipmentId = "SHP-2024-001",
  carrier = "VRL Logistics",
  vehicle = "TRK-7823456",
  completedKm = 350,
  remainingKm = 650,
}) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [routeCoords, setRouteCoords] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const isSea = transportMode === "sea"

    if (isSea) {
      setRouteCoords([
        [origin.lat, origin.lng],
        ...ports.map((p) => [p.lat, p.lng]),
        [destination.lat, destination.lng],
      ])
      setIsLoading(false)
      return
    }

    const fetchRoute = async () => {
      try {
        setIsLoading(true)
        const wps = [
          `${origin.lng},${origin.lat}`,
          `${current.lng},${current.lat}`,
          `${destination.lng},${destination.lat}`,
        ].join(";")
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${wps}?overview=full&geometries=geojson`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (data.code === "Ok" && data.routes?.[0]) {
          setRouteCoords(data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]))
        } else throw new Error()
      } catch {
        setRouteCoords([[origin.lat, origin.lng], [current.lat, current.lng], [destination.lat, destination.lng]])
      } finally {
        setIsLoading(false)
      }
    }
    fetchRoute()
  }, [origin.lat, origin.lng, current.lat, current.lng, destination.lat, destination.lng, transportMode])

  useEffect(() => {
    if (!mapRef.current || isLoading || routeCoords.length === 0) return
    if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null }

    const timer = setTimeout(() => {
      if (!mapRef.current) return
      try {
        const isSea = transportMode === "sea"
        const centerLat = (origin.lat + destination.lat) / 2
        const centerLng = (origin.lng + destination.lng) / 2
        const map = L.map(mapRef.current, { center: [centerLat, centerLng], zoom: 5, zoomControl: false })
        mapInstanceRef.current = map

        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          attribution: "", maxZoom: 19, subdomains: "abcd",
        }).addTo(map)
        L.control.zoom({ position: "topright" }).addTo(map)

        // Inject global style to remove white bg from GIF markers
        if (!document.getElementById("lorri-marker-style")) {
          const styleEl = document.createElement("style")
          styleEl.id = "lorri-marker-style"
          styleEl.textContent = `
            .lorri-gif-icon { background: transparent !important; border: none !important; }
            .lorri-gif-icon img {
              mix-blend-mode: multiply;
              background: transparent;
            }
            .leaflet-marker-icon.leaflet-zoom-animated { background: transparent !important; }
          `
          document.head.appendChild(styleEl)
        }

        // Route lines
        const splitIdx = Math.floor(routeCoords.length / 2)
        const completed = routeCoords.slice(0, splitIdx + 1)
        const remaining = routeCoords.slice(splitIdx)

        if (isSea) {
          if (completed.length > 1) L.polyline(completed, { color: "#3B82F6", weight: 3, opacity: 0.8, dashArray: "8,8" }).addTo(map)
          if (remaining.length > 1) L.polyline(remaining, { color: "#93C5FD", weight: 3, opacity: 0.5, dashArray: "4,12" }).addTo(map)
        } else {
          if (completed.length > 1) L.polyline(completed, { color: "#10B981", weight: 5, opacity: 0.85 }).addTo(map)
          if (remaining.length > 1) L.polyline(remaining, { color: "#3B82F6", weight: 5, opacity: 0.6, dashArray: "10,10" }).addTo(map)
        }

        // Markers
        L.marker([origin.lat, origin.lng], { icon: makeDotIcon("#10B981") }).addTo(map)
          .bindPopup(`<b style="color:#1F2937">Origin</b><br><span style="color:#6B7280;font-size:12px">${origin.name}</span>`)

        L.marker([destination.lat, destination.lng], { icon: makeDotIcon("#3B82F6") }).addTo(map)
          .bindPopup(`<b style="color:#1F2937">Destination</b><br><span style="color:#6B7280;font-size:12px">${destination.name}</span>`)

        // Port markers
        ports.forEach((port) => {
          L.marker([port.lat, port.lng], { icon: makePortIcon(port.name) }).addTo(map)
            .bindPopup(`<b style="color:#6C63FF">Port — ${port.name}</b>`)
        })

        // Current position icon based on state
        const cfg = STATE_CONFIG[shipmentState] || STATE_CONFIG["truck-moving"]
        L.marker([current.lat, current.lng], { icon: makeMovingIcon(shipmentState) }).addTo(map)
          .bindPopup(`
            <div style="font-family:system-ui;padding:4px 2px">
              <div style="font-weight:700;color:${cfg.labelBg};margin-bottom:3px">${cfg.label}</div>
              <div style="font-size:12px;color:#1F2937;font-weight:600">${current.name}</div>
              <div style="font-size:11px;color:#6B7280;margin-top:2px">${isSea ? "Speed: 18 knots" : "Speed: 65 km/h"}</div>
            </div>`)

        // Fit all points
        const allPoints = [
          [origin.lat, origin.lng],
          [current.lat, current.lng],
          [destination.lat, destination.lng],
          ...ports.map((p) => [p.lat, p.lng]),
        ]
        map.fitBounds(L.latLngBounds(allPoints), { padding: [60, 60] })

        // Apply multiply blend to all marker icons after render
        map.on("layeradd", () => {
          document.querySelectorAll(".lorri-gif-icon").forEach(el => {
            el.style.background = "transparent"
            el.style.mixBlendMode = "multiply"
            const img = el.querySelector("img")
            if (img) img.style.mixBlendMode = "multiply"
          })
        })

        // Info panel
        const InfoCtrl = L.Control.extend({
          options: { position: "topleft" },
          onAdd() {
            const el = L.DomUtil.create("div")
            el.style.cssText = "background:white;padding:10px 14px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.15);font-family:system-ui;min-width:220px"
            el.innerHTML = `
              <div style="font-weight:700;font-size:12px;color:#1F2937;margin-bottom:8px;display:flex;align-items:center;gap:6px">
                ${shipmentId}
                <span style="padding:2px 6px;background:${cfg.labelBg};color:white;font-size:9px;font-weight:700;border-radius:4px">${cfg.label}</span>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;margin-bottom:7px">
                <div><div style="color:#10B981;font-weight:600;margin-bottom:2px">Completed</div><div style="font-weight:700;color:#1F2937">${completedKm} km</div></div>
                <div><div style="color:#3B82F6;font-weight:600;margin-bottom:2px">Remaining</div><div style="font-weight:700;color:#1F2937">${remainingKm} km</div></div>
              </div>
              <div style="padding-top:7px;border-top:1px solid #E5E7EB;font-size:11px">
                <div style="color:#9CA3AF;margin-bottom:2px">${isSea ? "Vessel" : "Vehicle"}</div>
                <div style="font-weight:600;color:#1F2937">${vehicle} · ${carrier}</div>
              </div>`
            return el
          },
        })
        map.addControl(new InfoCtrl())

      } catch (err) { console.error("Map init error:", err) }
          // invalidateSize forces Leaflet to recalculate tile layout after DOM settles
      // This is critical on mobile where dimensions aren't final at paint time
      setTimeout(() => { mapInstanceRef.current?.invalidateSize() }, 350)
      setTimeout(() => { mapInstanceRef.current?.invalidateSize() }, 900)

    }, 150)

    return () => {
      clearTimeout(timer)
      if (mapInstanceRef.current) { try { mapInstanceRef.current.remove() } catch {} mapInstanceRef.current = null }
    }
  }, [origin, current, destination, routeCoords, isLoading, shipmentState, transportMode, ports])

  // ResizeObserver: re-fires invalidateSize whenever the map container changes size
  // Handles mobile layout reflows, orientation changes, sidebar toggles, etc.
  useEffect(() => {
    if (!mapRef.current) return
    const ro = new ResizeObserver(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize()
    })
    ro.observe(mapRef.current)
    return () => ro.disconnect()
  }, [])

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
}