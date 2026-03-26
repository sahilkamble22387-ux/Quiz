import { useEffect, useMemo, useState } from 'react'
import { EVENTS_KEY, STATUS_KEY, getTrackedEvents, getTrackingStatus } from '../../lib/engagementTracker'

type StoredEvent = ReturnType<typeof getTrackedEvents>[number]
type StoredStatus = ReturnType<typeof getTrackingStatus>

function useAdminEnabled() {
  return useMemo(() => {
    if (typeof window === 'undefined') return false
    const params = new URLSearchParams(window.location.search)
    return params.get('admin') === '1'
  }, [])
}

export default function EngagementAdmin() {
  const adminEnabled = useAdminEnabled()
  const [events, setEvents] = useState<StoredEvent[]>([])
  const [status, setStatus] = useState<StoredStatus>(null)

  useEffect(() => {
    if (!adminEnabled) return

    const sync = () => {
      setEvents(getTrackedEvents())
      setStatus(getTrackingStatus())
    }

    sync()
    const interval = window.setInterval(sync, 1200)
    const onStorage = (event: StorageEvent) => {
      if (event.key === EVENTS_KEY || event.key === STATUS_KEY) {
        sync()
      }
    }

    window.addEventListener('storage', onStorage)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('storage', onStorage)
    }
  }, [adminEnabled])

  if (!adminEnabled) return null

  const recentEvents = [...events].slice(-12).reverse()
  const latestClient = [...events].reverse().find((event) => typeof event.payload?.client === 'object' && event.payload?.client !== null)?.payload?.client as
    | {
      browser?: string
      os?: string
      deviceType?: string
      deviceModel?: string
      screen?: string
      language?: string
      timeZone?: string
    }
    | undefined
  const visitedScenes = Array.from(
    new Set(
      events
        .map((event) => event.payload?.sceneId)
        .filter((sceneId): sceneId is string => typeof sceneId === 'string'),
    ),
  )
  const clickedButtons = events
    .filter((event) => event.name === 'button_clicked')
    .map((event) => event.payload?.buttonId)
    .filter((buttonId): buttonId is string => typeof buttonId === 'string')

  return (
    <div
      style={{
        position: 'fixed',
        left: 18,
        bottom: 18,
        width: 'min(92vw, 360px)',
        maxHeight: '62vh',
        overflow: 'auto',
        zIndex: 120,
        borderRadius: 18,
        padding: 14,
        background: 'rgba(8, 4, 10, 0.88)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        color: '#FFF8F2',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <strong style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Engagement Admin
        </strong>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: 'rgba(255,248,242,0.74)' }}>
          Target: {status?.target ?? 'unknown'}
        </span>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: 'rgba(255,248,242,0.74)' }}>
          Local events: {events.length}
        </span>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: status?.lastError ? '#FFB0B8' : '#B8FFD4' }}>
          {status?.lastError ? `Last error: ${status.lastError}` : `Last success: ${status?.lastSuccessAt ?? 'none yet'}`}
        </span>
        {status?.lastStatusCode ? (
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: 'rgba(255,248,242,0.68)' }}>
            HTTP status: {status.lastStatusCode}
          </span>
        ) : null}
      </div>

      <div
        style={{
          marginTop: 12,
          padding: 12,
          borderRadius: 14,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'grid',
          gap: 6,
        }}
      >
        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Visitor Summary
        </div>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: 'rgba(255,248,242,0.78)' }}>
          Browser: {latestClient?.browser ?? 'unknown'}
        </span>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: 'rgba(255,248,242,0.78)' }}>
          OS: {latestClient?.os ?? 'unknown'}
        </span>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: 'rgba(255,248,242,0.78)' }}>
          Device type: {latestClient?.deviceType ?? 'unknown'}
        </span>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: 'rgba(255,248,242,0.78)' }}>
          Model: {latestClient?.deviceModel ?? 'unknown'}
        </span>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: 'rgba(255,248,242,0.78)' }}>
          Screen: {latestClient?.screen ?? 'unknown'}
        </span>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: 'rgba(255,248,242,0.78)' }}>
          Language: {latestClient?.language ?? 'unknown'}
        </span>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: 'rgba(255,248,242,0.78)' }}>
          Time zone: {latestClient?.timeZone ?? 'unknown'}
        </span>
      </div>

      <div
        style={{
          marginTop: 12,
          padding: 12,
          borderRadius: 14,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'grid',
          gap: 8,
        }}
      >
        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Journey Summary
        </div>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: 'rgba(255,248,242,0.78)' }}>
          Scenes visited: {visitedScenes.length ? visitedScenes.join(', ') : 'none yet'}
        </span>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: 'rgba(255,248,242,0.78)' }}>
          Buttons clicked: {clickedButtons.length ? clickedButtons.join(', ') : 'none yet'}
        </span>
      </div>

      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {recentEvents.map((event, index) => (
          <div
            key={`${event.timestamp}-${index}`}
            style={{
              padding: '10px 12px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {event.name}
            </div>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 11, color: 'rgba(255,248,242,0.68)', marginTop: 4 }}>
              {event.timestamp}
            </div>
            <pre
              style={{
                margin: '8px 0 0',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: 11,
                lineHeight: 1.45,
                fontFamily: '"DM Sans", sans-serif',
                color: 'rgba(255,248,242,0.82)',
              }}
            >
              {JSON.stringify(event.payload, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}
