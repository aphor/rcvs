import BeerResultCard from './BeerResultCard.jsx'

// Preview pane logic:
//  - no query yet: prompt to search
//  - query matches more than `max` beers: "too many choices"
//  - query matches nothing: empty state
//  - otherwise: up to `max` result cards
export default function BeerPreview({ query, matches, max }) {
  if (!query.trim()) {
    return (
      <div className="preview preview-empty">
        <p className="preview-hint">Start typing to find beers to taste.</p>
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

  if (matches.length > max) {
    return (
      <div className="preview preview-empty">
        <p className="preview-hint too-many">Too many choices</p>
        <p className="preview-subhint">
          {matches.length} beers match — narrow your search to see results.
        </p>
      </div>
    )
  }

  return (
    <div className="preview">
      {matches.map((beer) => (
        <BeerResultCard key={beer.id} beer={beer} />
      ))}
    </div>
  )
}
