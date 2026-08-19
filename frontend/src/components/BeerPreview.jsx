import BeerResultCard from './BeerResultCard.jsx'

// Preview pane logic:
//  - no query yet: a random sample of beers to browse (passed in as `matches`)
//  - query matches nothing: empty state
//  - otherwise: up to `max` result cards, best-match-first (searchBeers ranks
//    them: whole-string, then AND, then OR). When more than `max` match, the
//    top `max` are shown with a "too many choices" note to keep refining.
export default function BeerPreview({ query, matches, max }) {
  if (!query.trim()) {
    if (matches.length === 0) {
      return (
        <div className="preview preview-empty">
          <p className="preview-hint">Start typing to find beers to taste.</p>
        </div>
      )
    }
    return (
      <div className="preview">
        <p className="preview-note">Not sure where to start? A few to try:</p>
        {matches.map((beer) => (
          <BeerResultCard key={beer.id} beer={beer} />
        ))}
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="preview preview-empty">
        <p className="preview-hint">No beers match “{query}”.</p>
      </div>
    )
  }

  const shown = matches.slice(0, max)
  const overflow = matches.length > max

  return (
    <div className="preview">
      {overflow && (
        <p className="preview-note">
          <strong className="too-many">Too many choices</strong> — showing the {max} closest of{' '}
          {matches.length}. Keep typing to narrow.
        </p>
      )}
      {shown.map((beer) => (
        <BeerResultCard key={beer.id} beer={beer} />
      ))}
    </div>
  )
}
