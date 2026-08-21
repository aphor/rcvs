import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getContests, getResults } from '../lib/api.js'
import { usePollStatus } from '../lib/usePollStatus.js'
import PollStatusBar from './PollStatusBar.jsx'

const MEDALS = ['🥇', '🥈', '🥉']
const MAX_RANK_COLS = 8

function ordinal(n) {
  const suffix = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'
  return `${n}${suffix}`
}

// Highest choice-position (1-based) any shown candidate actually received.
function lastRankUsed(rows) {
  let max = 1
  for (const s of rows) {
    const t = s.rank_tallies || []
    for (let i = t.length - 1; i >= 0; i--) {
      if (t[i] > 0) {
        max = Math.max(max, i + 1)
        break
      }
    }
  }
  return Math.min(max, MAX_RANK_COLS)
}

function ResultCard({ contest, result }) {
  const top = (result?.standings || []).slice(0, 3)
  const rankCols = Array.from({ length: lastRankUsed(top) }, (_, i) => i + 1)

  return (
    <div className="card result-card">
      <h2>{contest.name}</h2>
      <p className="winner-line">
        🏆 Winner: <strong>{result?.winner_name || '—'}</strong>
        {result?.winner_by && <span className="by-tag">by {result.winner_by} of continuing ballots</span>}
      </p>

      <div className="standings-scroll">
        <table className="standings-table">
          <thead>
            <tr>
              <th className="cand-col">Candidate</th>
              {rankCols.map((r) => (
                <th key={r}>{ordinal(r)}</th>
              ))}
              <th className="final-col">Final</th>
            </tr>
          </thead>
          <tbody>
            {top.map((s, i) => (
              <tr key={s.candidate}>
                <td className="cand-col">
                  <span className="medal">{MEDALS[i]}</span> {s.name}
                </td>
                {rankCols.map((r) => (
                  <td key={r}>{s.rank_tallies?.[r - 1] || 0}</td>
                ))}
                <td className="final-col">{s.votes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="ballots-note">
        {result?.ballots_counted ?? 0} ballots counted · &ldquo;Final&rdquo; is the winning-round
        tally after transfers
      </p>
      <Link className="decided-link" to={`/results/${contest.id}`}>
        How voters decided this contest →
      </Link>
    </div>
  )
}

export default function ResultsSummary() {
  const [state, setState] = useState({ loading: true })
  // The shared hook also keeps the status fresh, so a page left open while the
  // polls are still running loads the results by itself once they close.
  const poll = usePollStatus()

  useEffect(() => {
    if (poll.unreachable) return setState({ error: 'server' })
    if (poll.status === null) return
    if (poll.status !== 'closed') return setState({ notClosed: true })

    let alive = true
    ;(async () => {
      const contests = (await getContests()).data || []
      const results = await Promise.all(contests.map((c) => getResults(c.id)))
      if (alive) setState({ contests, results: results.map((r) => r.data) })
    })()
    return () => {
      alive = false
    }
  }, [poll.status, poll.unreachable])

  return (
    <div className="screen">
      <header className="app-header">
        <h1>🍺 Election Results</h1>
        <p className="subtitle">Oak Park Microbrew Review 2026</p>
      </header>

      <PollStatusBar
        status={poll.status}
        scheduledOp={poll.scheduledOp}
        msRemaining={poll.msRemaining}
      />

      {state.loading && <p className="results-msg">Loading results…</p>}
      {state.error && (
        <p className="results-msg">Results are unavailable — is the server running on :5055?</p>
      )}
      {state.notClosed && (
        <p className="polls-msg">Polls have not yet closed! Please try again later.</p>
      )}
      {state.contests &&
        state.contests.map((c, i) => (
          <ResultCard key={c.id} contest={c} result={state.results[i]} />
        ))}
    </div>
  )
}
