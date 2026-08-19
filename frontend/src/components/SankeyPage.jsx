import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPollStatus, getResults } from '../lib/api.js'
import Sankey from './Sankey.jsx'

export default function SankeyPage() {
  const { contestId } = useParams()
  const [state, setState] = useState({ loading: true })

  useEffect(() => {
    let alive = true
    ;(async () => {
      const status = await getPollStatus()
      if (!alive) return
      if (status.networkError) return setState({ error: 'server' })
      if (!status.data?.closed) return setState({ notClosed: true })
      const res = await getResults(contestId)
      if (alive) setState({ result: res.data })
    })()
    return () => {
      alive = false
    }
  }, [contestId])

  const result = state.result

  return (
    <div className="screen wide-screen">
      <header className="app-header compact">
        <h1>How voters decided</h1>
        {result && (
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

      {state.loading && <p className="results-msg">Loading…</p>}
      {state.error && (
        <p className="results-msg">Results are unavailable — is the server running on :5055?</p>
      )}
      {state.notClosed && (
        <p className="polls-msg">Polls have not yet closed! Please try again later.</p>
      )}
      {result && (
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
