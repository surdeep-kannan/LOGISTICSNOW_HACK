import {
  ArchiveBoxIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  DocumentCheckIcon,
  ClockIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline"
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid"
import { colors, typography } from "../styles"

const surface    = "#332B7A"
const surfaceMid = "#3D3585"
const border     = "rgba(255,255,255,0.1)"
const textOn     = "rgba(255,255,255,0.95)"
const textSub    = "rgba(255,255,255,0.65)"
const textFade   = "rgba(255,255,255,0.35)"

const iconMap = {
  booked:   ArchiveBoxIcon,
  assigned: CheckCircleIcon,
  departed: PaperAirplaneIcon,
  customs:  DocumentCheckIcon,
  transit:  ClockIcon,
  arrived:  MapPinIcon,
}

// Compact version (used in tracking panels)
export function StatusTimeline({ events, show }) {
  if (!show) return null

  return (
    <div className="rounded-2xl p-5" style={{ background: surfaceMid, border: `1px solid ${border}` }}>
      <h3 style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.sm, marginBottom: 14 }}>
        Shipment Timeline
      </h3>
      <div className="space-y-0">
        {events.map((event, i) => {
          const Icon = iconMap[event.icon]
          const isLast      = i === events.length - 1
          const isActive    = event.status === "active"
          const isCompleted = event.status === "completed"

          return (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center" style={{ width: 22 }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10"
                  style={{
                    background: isCompleted ? colors.success : isActive ? colors.accent : "rgba(255,255,255,0.08)",
                    border: `2px solid ${isCompleted ? colors.success : isActive ? colors.accent : border}`,
                  }}
                >
                  {isCompleted
                    ? <CheckCircleSolid className="w-3 h-3 text-white" />
                    : isActive
                      ? <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "white" }} />
                      : <span className="w-1.5 h-1.5 rounded-full" style={{ background: textFade }} />
                  }
                </div>
                {!isLast && <div className="w-px flex-1 my-1" style={{ background: isCompleted ? colors.success : "rgba(255,255,255,0.08)", minHeight: 16 }} />}
              </div>
              <div className="pb-3 flex-1">
                <div style={{ color: isActive ? colors.accent : isCompleted ? textOn : textFade, fontSize: typography.sm, fontWeight: typography.semibold, marginBottom: 2 }}>
                  {event.title}
                </div>
                <div style={{ color: textFade, fontSize: typography.xs }}>{event.timestamp}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Full version (used in shipment detail views)
export function ShipmentTimeline({ events, show }) {
  if (!show) return null

  return (
    <div className="rounded-2xl p-6" style={{ background: surface, border: `1px solid ${border}` }}>
      <h3 style={{ color: textOn, fontWeight: typography.semibold, fontSize: typography.base, marginBottom: 20 }}>
        Shipment Timeline
      </h3>
      <div className="space-y-0">
        {events.map((event, i) => {
          const Icon = iconMap[event.icon]
          const isLast      = i === events.length - 1
          const isActive    = event.status === "active"
          const isCompleted = event.status === "completed"

          return (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center" style={{ width: 32 }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10"
                  style={{
                    background: isCompleted ? colors.success : isActive ? colors.accent : "rgba(255,255,255,0.08)",
                    border: `2px solid ${isCompleted ? colors.success : isActive ? colors.accent : border}`,
                  }}
                >
                  {isCompleted
                    ? <CheckCircleSolid className="w-4 h-4 text-white" />
                    : <Icon className="w-4 h-4" style={{ color: isActive ? "white" : textFade }} />
                  }
                </div>
                {!isLast && <div className="w-px flex-1 my-1" style={{ background: isCompleted ? colors.success : "rgba(255,255,255,0.08)", minHeight: 20 }} />}
              </div>
              <div className="pb-6 flex-1">
                <div style={{ color: isActive ? colors.accent : textOn, fontWeight: typography.medium, fontSize: typography.sm, marginBottom: 4 }}>
                  {event.title}
                </div>
                <div style={{ color: textFade, fontSize: typography.xs }}>{event.timestamp}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}