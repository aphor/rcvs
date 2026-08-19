// Best-effort backend calls. The app remains a working offline mock: if the
// backend isn't reachable, these fail quietly and the localStorage session is
// unaffected.
//
// The ballot-box (anonymous rankings) and receipt (PII + comments) are two
// independent submissions to two services that share no key.

const BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:5055'

async function post(path, body) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${path} -> ${res.status}`)
  return res.json()
}

// Submit the cast ballot's rankings to the ballot-box and the voter's PII +
// feedback to the receipt service. Returns the ballot-box receipt (signature)
// when available, else null. Never throws.
export async function submitCastBallot(session) {
  let receipt = null
  try {
    const r = await post('/api/ballot', {
      ballot: session.ballot,
      flavorRanks: session.flavorRanks,
    })
    receipt = r.receipt ?? null
  } catch {
    /* offline mock — ignore */
  }
  try {
    await post('/api/receipt', { user: session.user, feedback: session.feedback })
  } catch {
    /* offline mock — ignore */
  }
  return receipt
}
