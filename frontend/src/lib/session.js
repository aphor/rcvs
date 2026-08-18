// Client-side session layer for the beer-voting mock.
//
// This module stands in for the real login session cookie described in the
// story. State is persisted to localStorage under a single key so it survives
// reloads exactly like a session cookie would. When the real backend lands
// (backlog/03), this file is the seam to replace with axios + a real cookie.

const SESSION_KEY = 'rcvs_session'

export const emptySession = () => ({
  user: null, // { firstname, lastname, mobile, phone, email }
  ballot: [], // ordered list of beer ids; index 0 === rank 1 (top of ballot)
  flavorRanks: {}, // { [flavor]: rankNumber } — grid ballot, one flavor per rank
  feedback: { text: '', contactMe: false }, // questions/suggestions card
  ballotCast: false,
})

export function loadSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return emptySession()
    const parsed = JSON.parse(raw)
    return { ...emptySession(), ...parsed }
  } catch {
    // Corrupt / unavailable storage -> start fresh rather than crash.
    return emptySession()
  }
}

export function saveSession(session) {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // Storage disabled (e.g. private mode): the app still works in-memory.
  }
}

export function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    /* no-op */
  }
}
