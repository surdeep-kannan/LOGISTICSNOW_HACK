import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

export function RouteMap({ origin, destination, route }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [realRouteCoordinates, setRealRouteCoordinates] = useState([])
  const [isLoadingRoute, setIsLoadingRoute] = useState(true)

  const isAir = route.mode === "air"
  const isRail = route.mode === "rail"

  useEffect(() => {
    // ── Air routes: straight great-circle line between origin and destination ──
    if (isAir) {
      // Generate a curved arc to simulate flight path (not a road)
      const points = []
      const steps  = 30
      const lat1 = origin.lat, lng1 = origin.lng
      const lat2 = destination.lat, lng2 = destination.lng
      // Add slight curve upward to simulate flight arc
      const midLat = (lat1 + lat2) / 2 + Math.abs(lat2 - lat1) * 0.15
      const midLng = (lng1 + lng2) / 2
      for (let i = 0; i <= steps; i++) {
        const t   = i / steps
        const lat = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * midLat + t * t * lat2
        const lng = (1 - t) * (1 - t) * lng1 + 2 * (1 - t) * t * midLng + t * t * lng2
        points.push([lat, lng])
      }
      setRealRouteCoordinates(points)
      setIsLoadingRoute(false)
      return
    }

    // ── Road/rail routes: use OSRM with real origin → destination coords ──
    const fetchOSRMRoute = async () => {
      try {
        setIsLoadingRoute(true)
        // Use real origin/destination coords instead of frontend-generated waypoints
        const waypoints = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`
        )
        if (!response.ok) throw new Error("OSRM failed")
        const data = await response.json()
        if (data.code === "Ok" && data.routes?.[0]) {
          setRealRouteCoordinates(data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]))
        } else throw new Error("No route")
      } catch {
        // Fallback: straight line between real coords
        setRealRouteCoordinates([[origin.lat, origin.lng], [destination.lat, destination.lng]])
      } finally {
        setIsLoadingRoute(false)
      }
    }
    fetchOSRMRoute()
  }, [route.id, origin.lat, origin.lng, destination.lat, destination.lng, isAir])

  useEffect(() => {
    if (!mapRef.current || isLoadingRoute || realRouteCoordinates.length === 0) return
    if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null }

    const timer = setTimeout(() => {
      if (!mapRef.current || mapInstanceRef.current) return
      try {
        const map = L.map(mapRef.current, {
          center: [16.5, 76.5], zoom: 6, zoomControl: false,
          fadeAnimation: true, zoomAnimation: true, markerZoomAnimation: false,
        })
        mapInstanceRef.current = map

        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { attribution: "", maxZoom: 19, subdomains: "abcd" }).addTo(map)
        L.control.zoom({ position: "topright" }).addTo(map)

        const dotIcon = (color) => L.divIcon({
          html: `<div style="width:14px;height:14px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
          className: "", iconSize: [14, 14], iconAnchor: [7, 7],
        })

        // Origin marker — click to zoom in
        const originMarker = L.marker([origin.lat, origin.lng], { icon: dotIcon("#10B981") }).addTo(map)
        originMarker.bindPopup(`
          <div style="font-family:system-ui;padding:2px">
            <div style="font-weight:700;color:#10B981;font-size:11px;margin-bottom:3px">ORIGIN</div>
            <div style="font-weight:600;color:#1F2937;font-size:12px">${origin.name}</div>
          </div>`)
        originMarker.on("click", () => {
          if (!mapInstanceRef.current) return
          try { map.flyTo([origin.lat, origin.lng], 14, { duration: 0.8 }) } catch (_) {}
          originMarker.openPopup()
        })

        // Destination marker — click to zoom in
        const destMarker = L.marker([destination.lat, destination.lng], { icon: dotIcon("#3B82F6") }).addTo(map)
        destMarker.bindPopup(`
          <div style="font-family:system-ui;padding:2px">
            <div style="font-weight:700;color:#3B82F6;font-size:11px;margin-bottom:3px">DESTINATION</div>
            <div style="font-weight:600;color:#1F2937;font-size:12px">${destination.name}</div>
          </div>`)
        destMarker.on("click", () => {
          if (!mapInstanceRef.current) return
          try { map.flyTo([destination.lat, destination.lng], 14, { duration: 0.8 }) } catch (_) {}
          destMarker.openPopup()
        })

        // ── Style based on transport mode ──
        let routeColor  = route.aiRecommended ? "#6C63FF" : "#3B82F6"
        let routeWeight = route.aiRecommended ? 5 : 4
        let dashArray   = null

        if (isAir) {
          routeColor  = "#F59E0B"   // amber for air
          routeWeight = 3
          dashArray   = "8,6"       // dashed = flight path
        } else if (isRail) {
          routeColor  = "#8B5CF6"   // purple for rail
          routeWeight = 4
          dashArray   = "12,4"
        }

        const routeLine = L.polyline(realRouteCoordinates, {
          color: routeColor, weight: routeWeight, opacity: 0.85,
          dashArray,
        }).addTo(map)

        // White inner line for AI recommended road routes
        if (route.aiRecommended && !isAir && !isRail) {
          L.polyline(realRouteCoordinates, { color: "#FFFFFF", weight: 2, opacity: 0.45, dashArray: "10,15" }).addTo(map)
        }

        // Plane icon midpoint for air routes
        if (isAir) {
          const mid = Math.floor(realRouteCoordinates.length / 2)
          const midPoint = realRouteCoordinates[mid]
          if (midPoint) {
            L.marker(midPoint, {
              icon: L.divIcon({
                html: `<div style="font-size:22px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">✈</div>`,
                className: "", iconSize: [24, 24], iconAnchor: [12, 12],
              })
            }).addTo(map)
          }
        }

        map.fitBounds(routeLine.getBounds(), { padding: [60, 60] })

        // Route info control
        const InfoCtrl = L.Control.extend({
          options: { position: "topleft" },
          onAdd() {
            const el = L.DomUtil.create("div")
            el.style.cssText = "background:white;padding:10px 14px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-family:system-ui;min-width:200px"
            const modeIcon  = isAir ? "Air" : isRail ? "Rail" : "Road"
            const modeColor = isAir ? "#F59E0B" : isRail ? "#8B5CF6" : "#3B82F6"
            el.innerHTML = `
              <div style="font-weight:700;font-size:12px;color:#1F2937;margin-bottom:8px;display:flex;align-items:center;gap:6px">
                ${route.name}
                ${route.aiRecommended ? `<span style="padding:2px 6px;background:linear-gradient(135deg,#6C63FF,#5B52D8);color:white;font-size:9px;font-weight:700;border-radius:4px">AI</span>` : ""}
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;margin-bottom:7px">
                <div><div style="color:#9CA3AF;margin-bottom:2px">Distance</div><div style="font-weight:700;color:#1F2937">${route.distance} km</div></div>
                <div><div style="color:#9CA3AF;margin-bottom:2px">Transit</div><div style="font-weight:700;color:#1F2937">${route.transitDays} days</div></div>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px">
                <div><div style="color:#9CA3AF;margin-bottom:2px">Carrier</div><div style="font-weight:600;color:#1F2937">${route.carrier}</div></div>
                <span style="padding:2px 8px;background:${modeColor}18;color:${modeColor};border:1px solid ${modeColor}40;border-radius:20px;font-size:10px;font-weight:700">${modeIcon}</span>
              </div>`
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
      if (mapInstanceRef.current) {
        try {
          // Stop any ongoing zoom/pan animation before removing
          mapInstanceRef.current.stop()
          mapInstanceRef.current.remove()
        } catch (_) {}
        mapInstanceRef.current = null
      }
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