import { useMemo, useState } from 'react'
import { searchBeers } from '../data/beers.js'
import BeerPreview from './BeerPreview.jsx'

const MAX_RESULTS = 10

export default function BeerPicker() {
  const [query, setQuery] = useState('')

  const matches = useMemo(() => (query.trim() ? searchBeers(query) : []), [query])

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
