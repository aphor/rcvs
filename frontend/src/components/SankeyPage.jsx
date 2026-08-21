import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getResults } from '../lib/api.js'
import { usePollStatus } from '../lib/usePollStatus.js'
import PollStatusBar from './PollStatusBar.jsx'
import Sankey from './Sankey.jsx'

export default function SankeyPage() {
  const { contestId } = useParams()
  const [state, setState] = useState({ loading: true })
  const poll = usePollStatus()

  useEffect(() => {
    if (poll.unreachable) return setState({ error: 'server' })
    if (poll.status === null) return
    if (poll.status !== 'closed') return setState({ notClosed: true })

    let alive = true
    ;(async () => {
      const res = await getResults(contestId)
      if (alive) setState({ result: res.data })
    })()
    return () => {
      alive = false
    }
  }, [contestId, poll.status, poll.unreachable])

  const result = state.result

  return (
    <div className="screen wide-screen">
      <header className="app-header compact">
        <h1>How voters decided</h1>
        {result && Boolean(result.ballots_counted) && (
          <p className="subtitle">
            🏆 {result.winner_name || '—'} won this contest — {result.ballots_counted} ballots
          </p>
        )}
      </header>

      <p>
        <Link className="back-link" to="/results">
          ‹ Back to results
        </Link>
      </p>

      <PollStatusBar
        status={poll.status}
        scheduledOp={poll.scheduledOp}
        msRemaining={poll.msRemaining}
      />

      {state.loading && <p className="results-msg">Loading…</p>}
      {state.error && (
        <p className="results-msg">Results are unavailable — is the server running on :5055?</p>
      )}
      {state.notClosed && (
        <p className="polls-msg">Polls have not yet closed! Please try again later.</p>
      )}
      {result && !result.ballots_counted && <p className="not-counted">Not counted yet.</p>}
      {result && Boolean(result.ballots_counted) && (
        <>
          <p className="sankey-help">
            Each column is a round. Bars are candidates sized by their votes; ribbons show ballots
            staying put or transferring from an eliminated candidate to the voter&rsquo;s next choice
            (grey = exhausted). Scroll right to follow the rounds.
          </p>
          <Sankey sankey={result.sankey} order={result.standings.map((s) => s.candidate)} />
        </>
      )}
    </div>
  )
}
