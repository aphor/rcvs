// Poll status for voters, with a live countdown whenever a scheduled open or
// close is pending. Shown on the ballot pages so nobody has to guess whether
// their vote will be accepted.
import { formatCountdown } from '../lib/usePollStatus.js'

const LABEL = {
  pending: 'not open yet',
  open: 'open',
  closed: 'closed',
  unreachable: 'unreachable',
}

export default function PollStatusBar({ status, scheduledOp, msRemaining }) {
  if (!status) return null
  const counting = scheduledOp && msRemaining != null && msRemaining > 0

  return (
    <p className="poll-status-bar">
      Voting is{' '}
      <strong className={`poll-badge poll-${status}`}>{LABEL[status] || status}</strong>
      {counting && (
        <span className="poll-countdown">
          {scheduledOp === 'open' ? 'opens in' : 'closes in'}{' '}
          <strong>{formatCountdown(msRemaining)}</strong>
        </span>
      )}
    </p>
  )
}
