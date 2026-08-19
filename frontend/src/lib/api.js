// Backend calls. Cast submission is best-effort (the app stays a working offline
// mock); the results/admin pages genuinely need the server and surface failures.
//
// The ballot-box (anonymous rankings) and receipt (PII + comments) are two
// independent submissions to two services that share no key.

const BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:5055'

// Never throws: returns { ok, status, data, networkError }.
async function request(method, path, body) {
  try {
    const res = await fetch(BASE + path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    let data = null
    try {
      data = await res.json()
    } catch {
      /* no/invalid body */
    }
    return { ok: res.ok, status: res.status, data }
  } catch {
    return { ok: false, status: 0, data: null, networkError: true }
  }
}

// Best-effort: returns the ballot-box receipt (signature) or null.
export async function submitCastBallot(session) {
  const b = await request('POST', '/api/ballot', {
    ballot: session.ballot,
    flavorRanks: session.flavorRanks,
  })
  await request('POST', '/api/receipt', { user: session.user, feedback: session.feedback })
  return b.ok && b.data ? (b.data.receipt ?? null) : null
}

export const getPollStatus = () => request('GET', '/api/polls/status')
export const getContests = () => request('GET', '/api/contests')
export const getResults = (contestId) => request('GET', `/api/results/${contestId}`)
export const adminOpen = (password) => request('POST', '/api/admin/open', { password })
export const adminClose = (password) => request('POST', '/api/admin/close', { password })
