// Floating "VOTE" button pinned to the upper edge of the UI. Rendered only once
// the taster has picked at least one beer.
export default function VoteButton({ onClick }) {
  return (
    <button type="button" className="floating floating-top btn btn-vote" onClick={onClick}>
      VOTE →
    </button>
  )
}
