import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import Globe from 'react-globe.gl';

const STATUS_COLOR = { normal: '#22C55E', moderate: '#F59E0B', high: '#EF4444' };

export default function FreightGlobe({ hubs = [], lanes = [], activeHub, setActiveHub }) {
  const globeRef = useRef();
  const boxRef   = useRef();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [ready, setReady] = useState(false);

  // Responsive sizing
  useEffect(() => {
    const measure = () => {
      if (!boxRef.current) return;
      const { offsetWidth: w, offsetHeight: h } = boxRef.current;
      setSize({ w, h: h || Math.round(w * 0.72) });
    };
    measure();
    const obs = new ResizeObserver(measure);
    if (boxRef.current) obs.observe(boxRef.current);
    return () => obs.disconnect();
  }, []);

  // Globe controls – run once globe is mounted
  const onGlobeReady = useCallback(() => {
    setReady(true);
    const g = globeRef.current;
    if (!g) return;
    const ctrl = g.controls();
    ctrl.autoRotate      = false;   // disabled – reduces GPU load significantly
    ctrl.enablePan       = false;
    ctrl.enableZoom      = true;
    ctrl.minDistance     = 200;
    ctrl.maxDistance     = 480;
    g.pointOfView({ lat: 20, lng: 15, altitude: 2.5 });
  }, []);

  // Fly to selected hub
  useEffect(() => {
    if (!ready) return;
    const g = globeRef.current;
    if (!g) return;
    if (activeHub) {
      const hub = hubs.find(h => h.id === activeHub);
      if (hub) {
        g.pointOfView({ lat: hub.lat, lng: hub.lng, altitude: 1.8 }, 900);
        g.controls().autoRotate = false;
      }
    } else {
      g.pointOfView({ lat: 20, lng: 15, altitude: 2.5 }, 900);
    }
  }, [activeHub, hubs, ready]);

  // ALL lanes, flat on the globe (altitude 0 = surface-hugging like the reference)
  const arcsData = useMemo(() => {
    if (!hubs.length || !lanes.length) return [];
    return lanes.map(lane => {
      const f = hubs.find(h => h.id === lane.from);
      const t = hubs.find(h => h.id === lane.to);
      if (!f || !t) return null;
      const hi = activeHub && (lane.from === activeHub || lane.to === activeHub);
      const dim = activeHub && !hi;
      return {
        ...lane,
        startLat: f.lat, startLng: f.lng,
        endLat:   t.lat, endLng:   t.lng,
        fromName: f.name, toName: t.name,
        // Flat on surface
        altitude:  0,
        arcColor:  dim ? 'rgba(100,160,255,0.05)'
                       : hi  ? 'rgba(0,210,255,1)'
                             : 'rgba(100,180,255,0.4)',
        arcStroke: hi ? 1.4 : dim ? 0.1 : 0.45,
      };
    }).filter(Boolean);
  }, [hubs, lanes, activeHub]);

  // Hub dots
  const pointsData = useMemo(() => {
    if (!hubs.length) return [];
    return hubs.map(hub => ({
      ...hub,
      color:    hub.id === activeHub ? '#00D4FF' : (STATUS_COLOR[hub.status] || '#22C55E'),
      radius:   hub.id === activeHub ? 0.5 : hub.routes > 5000 ? 0.32 : hub.routes > 2000 ? 0.22 : 0.14,
      altitude: hub.id === activeHub ? 0.012 : 0.003,
    }));
  }, [hubs, activeHub]);

  const onPointClick = useCallback(pt  => setActiveHub?.(p => p === pt.id ? null : pt.id), [setActiveHub]);
  const onArcClick   = useCallback(arc => setActiveHub?.(p => (p === arc.from || p === arc.to) ? null : arc.from), [setActiveHub]);

  const arcLabel = arc => `
    <div style="background:rgba(8,6,24,0.97);border:1px solid rgba(100,160,255,0.25);border-radius:10px;padding:10px 14px;color:#fff;font-family:sans-serif;min-width:170px;box-shadow:0 8px 32px rgba(0,0,0,0.8)">
      <div style="font-weight:700;font-size:13px;margin-bottom:7px">${arc.fromName} → ${arc.toName}</div>
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:4px">
        <span style="color:rgba(255,255,255,0.4)">LoRRI Rate</span>
        <span style="color:#00B4D8;font-weight:600">${arc.rate}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:3px">
        <span style="color:rgba(255,255,255,0.4)">AI Saving</span>
        <span style="color:#22C55E;font-weight:700">▼${arc.saving}</span>
      </div>
    </div>`;

  const pointLabel = hub => `
    <div style="background:rgba(8,6,24,0.97);border:1px solid rgba(100,160,255,0.2);border-radius:10px;padding:10px 14px;color:#fff;font-family:sans-serif;min-width:155px;box-shadow:0 8px 32px rgba(0,0,0,0.8)">
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:7px">
        <div style="width:7px;height:7px;border-radius:50%;background:${STATUS_COLOR[hub.status]||'#22C55E'}"></div>
        <span style="font-weight:700;font-size:13px">${hub.name}</span>
        <span style="margin-left:auto;padding:1px 6px;border-radius:4px;background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.4);font-size:9px">${hub.type}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:rgba(255,255,255,0.4)">Volume</span><span style="color:#00B4D8;font-weight:600">${hub.volume}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:3px"><span style="color:rgba(255,255,255,0.4)">Routes</span><span style="color:rgba(255,255,255,0.8)">${hub.routes.toLocaleString('en-IN')}</span></div>
    </div>`;

  return (
    <div ref={boxRef} style={{ width: '100%', height: '100%', minHeight: '300px', overflow: 'hidden' }}>
      {size.w > 0 && (
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          onGlobeReady={onGlobeReady}

          // ── Bright realistic day-view Earth texture ──
          globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl={null}
          backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"

          // ── Atmosphere glow ──
          showAtmosphere={true}
          atmosphereColor="#4488ff"
          atmosphereAltitude={0.16}

          // ── Lower poly for performance ──
          globeSegments={40}

          // ── Arcs (flat, dense, blue) ──
          arcsData={arcsData}
          arcStartLat="startLat" arcStartLng="startLng"
          arcEndLat="endLat"     arcEndLng="endLng"
          arcColor="arcColor"
          arcStroke="arcStroke"
          arcAltitude="altitude"
          onArcClick={onArcClick}
          arcLabel={arcLabel}

          // ── Hub dots ──
          pointsData={pointsData}
          pointLat="lat" pointLng="lng"
          pointColor="color"
          pointRadius="radius"
          pointAltitude="altitude"
          pointResolution={8}
          onPointClick={onPointClick}
          pointLabel={pointLabel}
        />
      )}
    </div>
  );
}