import { useEffect, useState } from 'react'
import { getPollStatus, adminOpen, adminClose } from '../lib/api.js'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState(null) // 'pending' | 'open' | 'closed'
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const refresh = async () => {
    const r = await getPollStatus()
    setStatus(r.networkError ? 'unreachable' : r.data?.status)
  }
  useEffect(() => {
    refresh()
  }, [])

  const run = (fn) => async () => {
    setError('')
    setBusy(true)
    const r = await fn(password)
    setBusy(false)
    if (r.networkError) return setError('Server unreachable (is it running on :5055?)')
    if (r.status === 401) return setError('Incorrect password.')
    if (!r.ok) return setError('Something went wrong.')
    setStatus(r.data.status)
  }

  return (
    <div className="screen">
      <header className="app-header">
        <h1>🔒 Election Admin</h1>
        <p className="subtitle">Oak Park Microbrew Review 2026</p>
      </header>

      <div className="card admin-card">
        <p className="admin-status">
          Polls are currently:{' '}
          <strong className={`poll-badge poll-${status || 'unknown'}`}>{status || '…'}</strong>
        </p>

        <label className="field">
          <span className="field-label">Admin password</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
          />
        </label>

        {error && <p className="field-error">{error}</p>}

        <div className="admin-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={run(adminOpen)}
            disabled={busy || status === 'open'}
          >
            Open polls
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={run(adminClose)}
            disabled={busy || status === 'closed'}
          >
            Close polls
          </button>
        </div>

        <p className="admin-note">
          Voting is accepted only while polls are <em>open</em>; results are released only once polls
          are <em>closed</em>.
        </p>
      </div>
    </div>
  )
}
