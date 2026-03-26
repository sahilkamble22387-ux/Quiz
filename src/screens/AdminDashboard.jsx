import { useEffect, useMemo, useState } from 'react'
import { fetchRemoteEngagementEvents } from '../../lib/engagementTracker'

const ADMIN_CODE_STORAGE_KEY = 'confession_admin_code'

function formatDate(value) {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function summarizeSessions(events) {
  const grouped = new Map()

  events.forEach((event) => {
    const existing = grouped.get(event.sessionId) ?? {
      sessionId: event.sessionId,
      startedAt: event.timestamp,
      latestAt: event.timestamp,
      browser: 'Unknown Browser',
      os: 'Unknown OS',
      deviceType: 'unknown',
      deviceModel: 'Unknown Device',
      screen: 'unknown',
      language: 'unknown',
      timeZone: 'unknown',
      latestHref: event.href,
      referrer: event.referrer || 'Direct',
      visitedScenes: [],
      clickedButtons: [],
      events: [],
      completed: false,
    }

    existing.events.push(event)
    if (new Date(event.timestamp).getTime() < new Date(existing.startedAt).getTime()) {
      existing.startedAt = event.timestamp
    }
    if (new Date(event.timestamp).getTime() >= new Date(existing.latestAt).getTime()) {
      existing.latestAt = event.timestamp
      existing.latestHref = event.href
      existing.referrer = event.referrer || existing.referrer || 'Direct'
    }

    const client = event.payload?.client
    if (client && typeof client === 'object') {
      existing.browser = client.browser ?? existing.browser
      existing.os = client.os ?? existing.os
      existing.deviceType = client.deviceType ?? existing.deviceType
      existing.deviceModel = client.deviceModel ?? existing.deviceModel
      existing.screen = client.screen ?? existing.screen
      existing.language = client.language ?? existing.language
      existing.timeZone = client.timeZone ?? existing.timeZone
    }

    if (typeof event.payload?.sceneId === 'string' && !existing.visitedScenes.includes(event.payload.sceneId)) {
      existing.visitedScenes.push(event.payload.sceneId)
    }

    if (typeof event.payload?.buttonId === 'string') {
      existing.clickedButtons.push(event.payload.buttonId)
    }

    if (event.name === 'journey_completed') {
      existing.completed = true
    }

    grouped.set(event.sessionId, existing)
  })

  return [...grouped.values()].sort((a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime())
}

export default function AdminDashboard() {
  const [adminCode, setAdminCode] = useState('')
  const [submittedCode, setSubmittedCode] = useState('')
  const [reloadToken, setReloadToken] = useState(0)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastLoadedAt, setLastLoadedAt] = useState('')

  useEffect(() => {
    const stored = window.sessionStorage.getItem(ADMIN_CODE_STORAGE_KEY) || ''
    if (stored) {
      setAdminCode(stored)
      setSubmittedCode(stored)
    }
  }, [])

  useEffect(() => {
    if (!submittedCode) return

    let cancelled = false
    setLoading(true)
    setError('')

    fetchRemoteEngagementEvents(submittedCode, 500)
      .then((rows) => {
        if (cancelled) return
        setEvents(rows)
        setLastLoadedAt(new Date().toISOString())
      })
      .catch((loadError) => {
        if (cancelled) return
        setError(loadError instanceof Error ? loadError.message : 'Could not load admin data.')
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [reloadToken, submittedCode])

  const sessions = useMemo(() => summarizeSessions(events), [events])
  const completedCount = sessions.filter((session) => session.completed).length

  const handleSubmit = (event) => {
    event.preventDefault()
    window.sessionStorage.setItem(ADMIN_CODE_STORAGE_KEY, adminCode)
    setSubmittedCode(adminCode.trim())
    setReloadToken((current) => current + 1)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, rgba(73,25,40,0.45), transparent 38%), linear-gradient(180deg, #12060D 0%, #080308 100%)',
        color: '#FFF8F2',
        padding: '24px clamp(16px, 4vw, 40px) 48px',
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gap: 20 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.24em', color: 'rgba(255,248,242,0.55)' }}>
            Private Dashboard
          </div>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(34px, 6vw, 60px)', fontStyle: 'italic', lineHeight: 0.95 }}>
            Engagement Admin
          </div>
          <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 14, color: 'rgba(255,248,242,0.72)', maxWidth: 720 }}>
            Read recent visitor sessions from Supabase, grouped by session, with browser, device, scenes visited, and the buttons they pressed.
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
            padding: 16,
            borderRadius: 18,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <input
            type="password"
            value={adminCode}
            onChange={(event) => setAdminCode(event.target.value)}
            placeholder="Enter admin passcode"
            style={{
              flex: '1 1 280px',
              minWidth: 220,
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(12, 5, 9, 0.72)',
              color: '#FFF8F2',
              padding: '13px 18px',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 14,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              borderRadius: 999,
              border: '1px solid rgba(255,220,230,0.24)',
              background: 'rgba(255,107,157,0.18)',
              color: '#FFF8F2',
              padding: '12px 18px',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {loading ? 'Loading...' : 'Load Sessions'}
          </button>
          {submittedCode ? (
            <button
              type="button"
              onClick={() => setReloadToken((current) => current + 1)}
              style={{
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.05)',
                color: '#FFF8F2',
                padding: '12px 18px',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Refresh
            </button>
          ) : null}
        </form>

        {error ? (
          <div
            style={{
              padding: 14,
              borderRadius: 16,
              background: 'rgba(255,120,130,0.1)',
              border: '1px solid rgba(255,160,170,0.18)',
              color: '#FFCCD2',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 14,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {error}
          </div>
        ) : null}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { label: 'Sessions', value: sessions.length },
            { label: 'Total Events', value: events.length },
            { label: 'Completed Journeys', value: completedCount },
            { label: 'Last Sync', value: lastLoadedAt ? formatDate(lastLoadedAt) : 'Not loaded yet' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: 16,
                borderRadius: 18,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,248,242,0.56)' }}>
                {item.label}
              </div>
              <div style={{ marginTop: 8, fontFamily: '"Cormorant Garamond", serif', fontSize: 30, fontStyle: 'italic' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          {!loading && !error && submittedCode && sessions.length === 0 ? (
            <div
              style={{
                padding: 18,
                borderRadius: 18,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 14,
                color: 'rgba(255,248,242,0.78)',
              }}
            >
              No sessions found yet. If you just added tracking, open the main site once, interact with it, then refresh this dashboard.
            </div>
          ) : null}

          {sessions.map((session) => (
            <div
              key={session.sessionId}
              style={{
                padding: 18,
                borderRadius: 22,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'grid',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start', flexWrap: 'wrap' }}>
                <div style={{ display: 'grid', gap: 4 }}>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,248,242,0.58)' }}>
                    Session
                  </div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: 'rgba(255,248,242,0.88)', wordBreak: 'break-all' }}>
                    {session.sessionId}
                  </div>
                </div>
                <div
                  style={{
                    borderRadius: 999,
                    padding: '8px 12px',
                    background: session.completed ? 'rgba(126, 236, 182, 0.14)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${session.completed ? 'rgba(126,236,182,0.24)' : 'rgba(255,255,255,0.08)'}`,
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: 12,
                    color: session.completed ? '#B8FFD4' : 'rgba(255,248,242,0.76)',
                  }}
                >
                  {session.completed ? 'Completed Journey' : 'In Progress'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                {[
                  ['Browser', session.browser],
                  ['OS', session.os],
                  ['Device', `${session.deviceType} • ${session.deviceModel}`],
                  ['Screen', session.screen],
                  ['Language', session.language],
                  ['Time Zone', session.timeZone],
                  ['Started', formatDate(session.startedAt)],
                  ['Last Seen', formatDate(session.latestAt)],
                ].map(([label, value]) => (
                  <div key={label} style={{ padding: 12, borderRadius: 14, background: 'rgba(255,255,255,0.04)' }}>
                    <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(255,248,242,0.52)' }}>
                      {label}
                    </div>
                    <div style={{ marginTop: 6, fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: 'rgba(255,248,242,0.84)' }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
                <div style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.04)' }}>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(255,248,242,0.52)' }}>
                    Scenes Visited
                  </div>
                  <div style={{ marginTop: 8, fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: 'rgba(255,248,242,0.84)' }}>
                    {session.visitedScenes.length ? session.visitedScenes.join(', ') : 'No scene data'}
                  </div>
                </div>

                <div style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.04)' }}>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(255,248,242,0.52)' }}>
                    Buttons Clicked
                  </div>
                  <div style={{ marginTop: 8, fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: 'rgba(255,248,242,0.84)' }}>
                    {session.clickedButtons.length ? session.clickedButtons.join(', ') : 'No button clicks'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(255,248,242,0.52)' }}>
                  Latest URL
                </div>
                <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: 'rgba(255,248,242,0.84)', wordBreak: 'break-all' }}>
                  {session.latestHref}
                </div>
                <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: 'rgba(255,248,242,0.62)' }}>
                  Referrer: {session.referrer || 'Direct'}
                </div>
                <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: 'rgba(255,248,242,0.62)' }}>
                  Event count: {session.events.length}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
