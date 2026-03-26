const SESSION_ID_KEY = 'confession_session_id'
const SESSION_STARTED_KEY = 'confession_session_started'
const SEEN_SCENES_KEY = 'confession_seen_scenes'
const JOURNEY_COMPLETE_KEY = 'confession_journey_complete'
export const EVENTS_KEY = 'confession_engagement_events'
export const STATUS_KEY = 'confession_engagement_status'
const MAX_STORED_EVENTS = 250
const REQUIRED_SCENES = ['portal', 'firstSight', 'assignment', 'snapchat', 'almostMeet', 'confession', 'together'] as const

type TrackerEventName =
  | 'session_started'
  | 'scene_viewed'
  | 'scene_revisited'
  | 'button_clicked'
  | 'journey_completed'

type TrackerPayload = Record<string, unknown>

type ClientInfo = {
  browser: string
  os: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
  deviceModel: string
  screen: string
  language: string
  timeZone: string
}

type TrackerEvent = {
  name: TrackerEventName
  payload: TrackerPayload
  sessionId: string
  href: string
  timestamp: string
  referrer: string
  userAgent: string
}

type DeliveryStatus = {
  target: 'supabase' | 'webhook' | 'local-only'
  lastAttemptAt: string | null
  lastSuccessAt: string | null
  lastErrorAt: string | null
  lastError: string | null
  lastStatusCode: number | null
}

export type StoredTrackerEvent = TrackerEvent

function isBrowser() {
  return typeof window !== 'undefined'
}

function safeParse<T>(value: string | null, fallback: T) {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function getEnv() {
  const meta = import.meta as ImportMeta & {
    env?: Record<string, string | undefined>
  }
  return meta.env ?? {}
}

function getEnvEndpoint() {
  return getEnv().VITE_ENGAGEMENT_WEBHOOK?.trim()
}

function getSupabaseConfig() {
  const env = getEnv()
  const url = env.VITE_SUPABASE_URL?.trim()
  const anonKey = env.VITE_SUPABASE_ANON_KEY?.trim()
  const table = env.VITE_SUPABASE_EVENTS_TABLE?.trim() || 'engagement_events'

  if (!url || !anonKey) return null

  return {
    url,
    anonKey,
    table,
  }
}

type RpcEventRow = {
  id?: number
  name: TrackerEventName
  payload: TrackerPayload
  session_id: string
  href: string
  timestamp: string
  referrer: string
  user_agent: string
  created_at?: string
}

function getSessionId() {
  if (!isBrowser()) return 'server'
  const existing = window.sessionStorage.getItem(SESSION_ID_KEY)
  if (existing) return existing

  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

  window.sessionStorage.setItem(SESSION_ID_KEY, id)
  return id
}

function parseBrowser(userAgent: string) {
  if (/Edg\//.test(userAgent)) return 'Microsoft Edge'
  if (/OPR\//.test(userAgent)) return 'Opera'
  if (/Chrome\//.test(userAgent) && !/Edg\//.test(userAgent)) return 'Google Chrome'
  if (/Firefox\//.test(userAgent)) return 'Mozilla Firefox'
  if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) return 'Safari'
  return 'Unknown Browser'
}

function parseOs(userAgent: string) {
  if (/Windows NT/.test(userAgent)) return 'Windows'
  if (/Mac OS X/.test(userAgent) && !/iPhone|iPad/.test(userAgent)) return 'macOS'
  if (/Android/.test(userAgent)) return 'Android'
  if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS'
  if (/Linux/.test(userAgent)) return 'Linux'
  return 'Unknown OS'
}

function parseDeviceType(userAgent: string): ClientInfo['deviceType'] {
  if (/iPad|Tablet|SM-T|Tab/i.test(userAgent)) return 'tablet'
  if (/Mobi|Android|iPhone/i.test(userAgent)) return 'mobile'
  return 'desktop'
}

function parseDeviceModel(userAgent: string) {
  const androidModel = userAgent.match(/Android.*?;\s*([^)]+?)\s+Build\//i)?.[1]
  if (androidModel) return androidModel.trim()
  if (/iPhone/.test(userAgent)) return 'iPhone'
  if (/iPad/.test(userAgent)) return 'iPad'
  if (/Macintosh/.test(userAgent)) return 'Mac'
  if (/Windows/.test(userAgent)) return 'Windows PC'
  return 'Unknown Device'
}

function getClientInfo(): ClientInfo {
  if (!isBrowser()) {
    return {
      browser: 'Unknown Browser',
      os: 'Unknown OS',
      deviceType: 'desktop',
      deviceModel: 'Unknown Device',
      screen: 'unknown',
      language: 'unknown',
      timeZone: 'unknown',
    }
  }

  const userAgent = navigator.userAgent
  return {
    browser: parseBrowser(userAgent),
    os: parseOs(userAgent),
    deviceType: parseDeviceType(userAgent),
    deviceModel: parseDeviceModel(userAgent),
    screen: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language || 'unknown',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
  }
}

function storeStatus(status: Partial<DeliveryStatus>) {
  if (!isBrowser()) return
  const existing = safeParse<DeliveryStatus>(window.localStorage.getItem(STATUS_KEY), {
    target: 'local-only',
    lastAttemptAt: null,
    lastSuccessAt: null,
    lastErrorAt: null,
    lastError: null,
    lastStatusCode: null,
  })

  window.localStorage.setItem(
    STATUS_KEY,
    JSON.stringify({
      ...existing,
      ...status,
    }),
  )
}

function postEvent(event: TrackerEvent) {
  if (!isBrowser()) return
  const supabase = getSupabaseConfig()
  if (supabase) {
    const restUrl = `${supabase.url.replace(/\/$/, '')}/rest/v1/${supabase.table}`
    storeStatus({
      target: 'supabase',
      lastAttemptAt: new Date().toISOString(),
      lastError: null,
      lastStatusCode: null,
    })
    void fetch(restUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabase.anonKey,
        Authorization: `Bearer ${supabase.anonKey}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        name: event.name,
        payload: event.payload,
        session_id: event.sessionId,
        href: event.href,
        timestamp: event.timestamp,
        referrer: event.referrer,
        user_agent: event.userAgent,
      }),
      keepalive: true,
    })
      .then(async (response) => {
        if (!response.ok) {
          const message = (await response.text()).trim() || `Supabase request failed with ${response.status}`
          throw new Error(message)
        }

        storeStatus({
          target: 'supabase',
          lastSuccessAt: new Date().toISOString(),
          lastError: null,
          lastErrorAt: null,
          lastStatusCode: response.status,
        })
      })
      .catch((error: unknown) => {
        storeStatus({
          target: 'supabase',
          lastErrorAt: new Date().toISOString(),
          lastError: error instanceof Error ? error.message : 'Unknown Supabase error',
        })
      })
    return
  }

  const endpoint = getEnvEndpoint()
  if (!endpoint) {
    storeStatus({
      target: 'local-only',
      lastAttemptAt: null,
      lastSuccessAt: null,
      lastErrorAt: null,
      lastError: null,
      lastStatusCode: null,
    })
    return
  }

  const body = JSON.stringify(event)
  if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    const blob = new Blob([body], { type: 'application/json' })
    const success = navigator.sendBeacon(endpoint, blob)
    storeStatus({
      target: 'webhook',
      lastAttemptAt: new Date().toISOString(),
      lastSuccessAt: success ? new Date().toISOString() : null,
      lastErrorAt: success ? null : new Date().toISOString(),
      lastError: success ? null : 'sendBeacon returned false',
      lastStatusCode: null,
    })
    return
  }

  void fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  })
    .then(async (response) => {
      if (!response.ok) {
        const message = (await response.text()).trim() || `Webhook request failed with ${response.status}`
        throw new Error(message)
      }

      storeStatus({
        target: 'webhook',
        lastAttemptAt: new Date().toISOString(),
        lastSuccessAt: new Date().toISOString(),
        lastErrorAt: null,
        lastError: null,
        lastStatusCode: response.status,
      })
    })
    .catch((error: unknown) => {
      storeStatus({
        target: 'webhook',
        lastAttemptAt: new Date().toISOString(),
        lastErrorAt: new Date().toISOString(),
        lastError: error instanceof Error ? error.message : 'Unknown webhook error',
        lastStatusCode: null,
      })
    })
}

function storeEvent(event: TrackerEvent) {
  if (!isBrowser()) return
  const existing = safeParse<TrackerEvent[]>(window.localStorage.getItem(EVENTS_KEY), [])
  const trimmed = [...existing, event].slice(-MAX_STORED_EVENTS)
  window.localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed))
}

function trackEvent(name: TrackerEventName, payload: TrackerPayload = {}) {
  if (!isBrowser()) return
  const client = getClientInfo()
  const event: TrackerEvent = {
    name,
    payload: {
      ...payload,
      client,
    },
    sessionId: getSessionId(),
    href: window.location.href,
    timestamp: new Date().toISOString(),
    referrer: document.referrer,
    userAgent: navigator.userAgent,
  }

  storeEvent(event)
  postEvent(event)
}

export function startTrackingSession() {
  if (!isBrowser()) return
  if (window.sessionStorage.getItem(SESSION_STARTED_KEY) === '1') return
  window.sessionStorage.setItem(SESSION_STARTED_KEY, '1')
  trackEvent('session_started')
}

export function trackButtonClick(buttonId: string, payload: TrackerPayload = {}) {
  trackEvent('button_clicked', { buttonId, ...payload })
}

export function trackSceneView(sceneId: string, payload: TrackerPayload = {}) {
  if (!isBrowser()) return

  const seenScenes = safeParse<string[]>(window.sessionStorage.getItem(SEEN_SCENES_KEY), [])
  const firstVisit = !seenScenes.includes(sceneId)
  const nextSeenScenes = firstVisit ? [...seenScenes, sceneId] : seenScenes

  if (firstVisit) {
    window.sessionStorage.setItem(SEEN_SCENES_KEY, JSON.stringify(nextSeenScenes))
  }

  trackEvent(firstVisit ? 'scene_viewed' : 'scene_revisited', {
    sceneId,
    ...payload,
  })

  const completedJourney = REQUIRED_SCENES.every((requiredScene) => nextSeenScenes.includes(requiredScene))
  if (completedJourney && window.sessionStorage.getItem(JOURNEY_COMPLETE_KEY) !== '1') {
    window.sessionStorage.setItem(JOURNEY_COMPLETE_KEY, '1')
    trackEvent('journey_completed', {
      visitedScenes: nextSeenScenes,
    })
  }
}

export function getTrackingStatus() {
  if (!isBrowser()) return null
  return safeParse<DeliveryStatus | null>(window.localStorage.getItem(STATUS_KEY), null)
}

export function getTrackedEvents() {
  if (!isBrowser()) return []
  return safeParse<TrackerEvent[]>(window.localStorage.getItem(EVENTS_KEY), [])
}

export async function fetchRemoteEngagementEvents(adminCode: string, limit = 300) {
  const supabase = getSupabaseConfig()
  if (!supabase) {
    throw new Error('Supabase is not configured in the frontend environment.')
  }

  const response = await fetch(`${supabase.url.replace(/\/$/, '')}/rest/v1/rpc/get_engagement_events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabase.anonKey,
      Authorization: `Bearer ${supabase.anonKey}`,
    },
    body: JSON.stringify({
      admin_code: adminCode,
      max_rows: limit,
    }),
  })

  if (!response.ok) {
    const message = (await response.text()).trim() || `Dashboard request failed with ${response.status}`
    throw new Error(message)
  }

  const rows = (await response.json()) as RpcEventRow[]
  return rows.map((row) => ({
    id: row.id ?? null,
    name: row.name,
    payload: row.payload ?? {},
    sessionId: row.session_id,
    href: row.href,
    timestamp: row.timestamp,
    referrer: row.referrer,
    userAgent: row.user_agent,
    createdAt: row.created_at ?? row.timestamp,
  }))
}
