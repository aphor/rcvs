// Live poll status, shared by the ballot pages and the admin page.
//
// Countdowns run against the server's clock, not the device's: /api/polls/status
// returns server_time, and the offset it implies is applied to every scheduled
// time so a phone with a wrong clock still counts down correctly.
//
// The server fires due transitions lazily when its status is read, so the
// refetch cadence is also what makes the poll open and close on time: slow while
// nothing is imminent, every 30-60s (randomized, to stagger a room full of
// phones) once a scheduled operation is under five minutes away.

import { useCallback, useEffect, useRef, useState } from 'react'
import { getPollStatus } from './api.js'

const IMMINENT = 5 * 60 * 1000 // treat as "soon" under five minutes
const SLOW_POLL = 5 * 60 * 1000
const fastPoll = () => 30000 + Math.random() * 30000

export function formatCountdown(ms) {
  if (ms == null || ms < 0) return ''
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

export function usePollStatus() {
  const [data, setData] = useState(null)
  const [unreachable, setUnreachable] = useState(false)
  const skewRef = useRef(0) // serverTime - deviceTime, in ms
  const [now, setNow] = useState(() => Date.now())

  const refresh = useCallback(async () => {
    const r = await getPollStatus()
    if (r.networkError) {
      setUnreachable(true)
      return null
    }
    setUnreachable(false)
    if (r.data?.server_time) {
      skewRef.current = new Date(r.data.server_time).getTime() - Date.now()
    }
    setData(r.data)
    return r.data
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // One tick a second drives the countdown text.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const serverNow = now + skewRef.current
  const openAt = data?.scheduled_open_at ? new Date(data.scheduled_open_at).getTime() : null
  const closeAt = data?.scheduled_close_at ? new Date(data.scheduled_close_at).getTime() : null

  // The next operation is the open unless it has passed or polls are already open.
  let scheduledOp = null
  let scheduledAt = null
  if (openAt && data?.status !== 'open') {
    scheduledOp = 'open'
    scheduledAt = openAt
  } else if (closeAt) {
    scheduledOp = 'close'
    scheduledAt = closeAt
  }
  const msRemaining = scheduledAt == null ? null : scheduledAt - serverNow

  // Refetch on a cadence that tightens as the moment approaches, and once more
  // the instant a countdown runs out — that read is what fires the transition.
  useEffect(() => {
    const soon = msRemaining != null && msRemaining < IMMINENT
    const delay = msRemaining != null && msRemaining <= 0 ? 1000 : soon ? fastPoll() : SLOW_POLL
    const id = setTimeout(refresh, delay)
    return () => clearTimeout(id)
    // Re-armed whenever a fetch lands or the countdown crosses a threshold.
  }, [refresh, data, msRemaining != null && msRemaining <= 0, msRemaining != null && msRemaining < IMMINENT])

  return {
    status: unreachable ? 'unreachable' : (data?.status ?? null),
    isOpen: data?.status === 'open',
    scheduledOp,
    scheduledAt,
    msRemaining,
    scheduledOpenAt: openAt,
    scheduledCloseAt: closeAt,
    unreachable,
    refresh,
  }
}
