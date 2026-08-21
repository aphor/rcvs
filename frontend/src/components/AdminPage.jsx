import { useState } from 'react'
import { adminOpen, adminClose, adminCancel } from '../lib/api.js'
import { usePollStatus, formatCountdown } from '../lib/usePollStatus.js'

// The time field defaults to "now": submitting it unchanged runs the operation
// immediately, exactly as the buttons always have. Pick a future time instead
// and the operation is scheduled — the server enforces the timing rules, this
// only keeps the button labels honest.
const localNow = () => {
  const d = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  return d.toISOString().slice(0, 16) // yyyy-mm-ddThh:mm for datetime-local
}

const asLocalText = (ms) =>
  new Date(ms).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [when, setWhen] = useState(localNow)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const poll = usePollStatus()

  // A time still in the past (including the untouched default) means "now".
  const picked = when ? new Date(when).getTime() : Date.now()
  const isFuture = picked > Date.now() + 1000
  const at = isFuture ? new Date(picked).toISOString() : undefined

  const run = (fn) => async () => {
    setError('')
    setBusy(true)
    const r = await fn(password, at)
    setBusy(false)
    if (r.networkError) return setError('Server unreachable (is it running on :5055?)')
    if (r.status === 401) return setError('Incorrect password.')
    if (!r.ok) return setError(r.data?.message || 'Something went wrong.')
    poll.refresh()
  }

  const cancel = (op) => async () => {
    setError('')
    const r = await adminCancel(password, op)
    if (r.status === 401) return setError('Incorrect password.')
    if (!r.ok) return setError(r.data?.message || 'Nothing to cancel.')
    poll.refresh()
  }

  const schedule = (label, ms, op) => (
    <p className="admin-schedule" key={op}>
      <span>
        {label} <strong>{asLocalText(ms)}</strong>
        {poll.scheduledOp === op && poll.msRemaining > 0 && (
          <span className="poll-countdown">in {formatCountdown(poll.msRemaining)}</span>
        )}
      </span>
      <button type="button" className="btn btn-ghost btn-small" onClick={cancel(op)}>
        Cancel
      </button>
    </p>
  )

  return (
    <div className="screen">
      <header className="app-header">
        <h1>🔒 Election Admin</h1>
        <p className="subtitle">Oak Park Microbrew Review 2026</p>
      </header>

      <div className="card admin-card">
        <p className="admin-status">
          Polls are currently:{' '}
          <strong className={`poll-badge poll-${poll.status || 'unknown'}`}>
            {poll.status || '…'}
          </strong>
        </p>

        {poll.scheduledOpenAt && poll.status !== 'open' && schedule('Opens', poll.scheduledOpenAt, 'open')}
        {poll.scheduledCloseAt && schedule('Closes', poll.scheduledCloseAt, 'close')}

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

        <label className="field">
          <span className="field-label">When (defaults to now)</span>
          <input
            className="input"
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
          />
        </label>
        <p className="admin-hint">
          {isFuture
            ? `Scheduled for ${asLocalText(picked)}.`
            : 'Runs immediately. Pick a future time to schedule instead.'}
          <button type="button" className="btn-link" onClick={() => setWhen(localNow())}>
            reset to now
          </button>
        </p>

        {error && <p className="field-error">{error}</p>}

        <div className="admin-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={run(adminOpen)}
            disabled={busy || poll.status === 'open'}
          >
            {isFuture ? 'Schedule open' : 'Open polls'}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={run(adminClose)}
            disabled={busy || poll.status === 'closed'}
          >
            {isFuture ? 'Schedule close' : 'Close polls'}
          </button>
        </div>

        <p className="admin-note">
          Voting is accepted only while polls are <em>open</em>; results are released only once polls
          are <em>closed</em>. A scheduled open must be more than a minute out, and a close more than
          five minutes after the polls open. Closing archives the cycle; opening clears the ballots
          for a fresh one.
        </p>
      </div>
    </div>
  )
}
