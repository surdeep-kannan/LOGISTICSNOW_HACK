import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

export function RouteMap({ origin, destination, route }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [realRouteCoordinates, setRealRouteCoordinates] = useState([])
  const [isLoadingRoute, setIsLoadingRoute] = useState(true)

  useEffect(() => {
    const fetchOSRMRoute = async () => {
      try {
        setIsLoadingRoute(true)
        const waypoints = route.routeCoordinates.map((c) => `${c[1]},${c[0]}`).join(";")
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`
        )
        if (!response.ok) throw new Error("OSRM failed")
        const data = await response.json()
        if (data.code === "Ok" && data.routes?.[0]) {
          setRealRouteCoordinates(data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]))
        } else throw new Error("No route")
      } catch {
        setRealRouteCoordinates(route.routeCoordinates)
      } finally {
        setIsLoadingRoute(false)
      }
    }
    fetchOSRMRoute()
  }, [route.id])

  useEffect(() => {
    if (!mapRef.current || isLoadingRoute || realRouteCoordinates.length === 0) return
    if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null }

    const timer = setTimeout(() => {
      if (!mapRef.current) return
      try {
        const map = L.map(mapRef.current, { center: [16.5, 76.5], zoom: 6, zoomControl: false })
        mapInstanceRef.current = map

        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { attribution: "", maxZoom: 19, subdomains: "abcd" }).addTo(map)
        L.control.zoom({ position: "topright" }).addTo(map)

        const dotIcon = (color) => L.divIcon({
          html: `<div style="width:14px;height:14px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
          className: "", iconSize: [14, 14], iconAnchor: [7, 7],
        })

        L.marker([origin.lat, origin.lng], { icon: dotIcon("#10B981") }).addTo(map)
          .bindPopup(`<b style="color:#1F2937">Origin</b><br><span style="color:#6B7280;font-size:12px">${origin.name}</span>`)

        L.marker([destination.lat, destination.lng], { icon: dotIcon("#3B82F6") }).addTo(map)
          .bindPopup(`<b style="color:#1F2937">Destination</b><br><span style="color:#6B7280;font-size:12px">${destination.name}</span>`)

        const routeColor = route.aiRecommended ? "#6C63FF" : "#3B82F6"
        const routeLine = L.polyline(realRouteCoordinates, {
          color: routeColor, weight: route.aiRecommended ? 5 : 4, opacity: route.aiRecommended ? 0.85 : 0.7,
        }).addTo(map)

        if (route.aiRecommended) {
          L.polyline(realRouteCoordinates, { color: "#FFFFFF", weight: 2, opacity: 0.45, dashArray: "10,15" }).addTo(map)
        }

        map.fitBounds(routeLine.getBounds(), { padding: [60, 60] })

        // Route info control
        const InfoCtrl = L.Control.extend({
          options: { position: "topleft" },
          onAdd() {
            const el = L.DomUtil.create("div")
            el.style.cssText = "background:white;padding:10px 14px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-family:system-ui;min-width:200px"
            el.innerHTML = `
              <div style="font-weight:700;font-size:12px;color:#1F2937;margin-bottom:8px">
                ${route.name}
                ${route.aiRecommended ? `<span style="margin-left:5px;padding:2px 6px;background:linear-gradient(135deg,#6C63FF,#5B52D8);color:white;font-size:9px;font-weight:700;border-radius:4px">AI</span>` : ""}
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;margin-bottom:7px">
                <div><div style="color:#9CA3AF;margin-bottom:2px">Distance</div><div style="font-weight:700;color:#1F2937">${route.distance} km</div></div>
                <div><div style="color:#9CA3AF;margin-bottom:2px">Transit</div><div style="font-weight:700;color:#1F2937">${route.transitDays} days</div></div>
              </div>
              <div style="font-size:11px"><div style="color:#9CA3AF;margin-bottom:2px">Carrier</div><div style="font-weight:600;color:#1F2937">${route.carrier}</div></div>`
            return el
          },
        })
        map.addControl(new InfoCtrl())

        // Fit route button
        const FitCtrl = L.Control.extend({
          options: { position: "topright" },
          onAdd() {
            const el = L.DomUtil.create("div", "leaflet-bar leaflet-control")
            el.innerHTML = `<a href="#" style="background:white;color:#1F2937;padding:7px 11px;text-decoration:none;display:block;font-size:11px;font-weight:500">Fit Route</a>`
            el.onclick = (e) => { e.preventDefault(); mapInstanceRef.current?.fitBounds(routeLine.getBounds(), { padding: [60, 60] }) }
            return el
          },
        })
        map.addControl(new FitCtrl())

      } catch (err) { console.error("Map error:", err) }
      // Force Leaflet to recalculate tile layout after the DOM fully paints
      // Essential on mobile where the container size isn't final at mount time
      setTimeout(() => { mapInstanceRef.current?.invalidateSize() }, 500)
      setTimeout(() => { mapInstanceRef.current?.invalidateSize() }, 1200)

    }, 250)

    return () => {
      clearTimeout(timer)
      if (mapInstanceRef.current) { try { mapInstanceRef.current.remove() } catch {} mapInstanceRef.current = null }
    }
  }, [origin, destination, route.id, realRouteCoordinates, isLoadingRoute])

  // ResizeObserver: fires invalidateSize whenever the container resizes
  // Handles mobile layout reflows, orientation changes, panel toggles
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