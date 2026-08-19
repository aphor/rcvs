import { useEffect, useMemo, useState } from 'react'
import { searchBeers, randomBeers } from '../data/beers.js'
import BeerPreview from './BeerPreview.jsx'

const MAX_RESULTS = 10

export default function BeerPicker() {
  const [query, setQuery] = useState('')
  const isEmpty = query.trim() === ''

  // Suggestions shown while the box is empty; re-rolled each time it empties.
  const [suggestions, setSuggestions] = useState(() => randomBeers(MAX_RESULTS))
  useEffect(() => {
    if (isEmpty) setSuggestions(randomBeers(MAX_RESULTS))
  }, [isEmpty])

  const matches = useMemo(
    () => (isEmpty ? suggestions : searchBeers(query)),
    [isEmpty, query, suggestions]
  )

  return (
    <div className="picker">
      <div className="card search-card">
        <input
          className="input search-input"
          type="search"
          placeholder="Search beer, brewery, or style…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>
      <BeerPreview query={query} matches={matches} max={MAX_RESULTS} />
    </div>
  )
}
