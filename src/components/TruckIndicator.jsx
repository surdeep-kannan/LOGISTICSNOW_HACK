import { TruckIcon } from "@heroicons/react/24/solid"

export function TruckIndicator({ position, status }) {
  const colorMap = {
    "in-transit": "#22D3EE",
    delayed:      "#FBBF24",
    delivered:    "#4ADE80",
  }
  const color = colorMap[status] || "#22D3EE"

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 ease-linear"
      style={{ left: `${position}%` }}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full opacity-30 blur-lg animate-pulse" style={{ background: color }} />
        <TruckIcon style={{ width: 32, height: 32, color, position: "relative", zIndex: 10 }} />
      </div>
    </div>
  )
}