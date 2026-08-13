import { useApp } from '../context/AppContext.jsx'
import BeerImage from './BeerImage.jsx'

export default function BeerResultCard({ beer }) {
  const { state, pickBeer } = useApp()
  const onBallot = state.ballot.includes(beer.id)

  return (
    <div className="card beer-card">
      <BeerImage beer={beer} className="beer-thumb" />
      <div className="beer-info">
        <p className="beer-name">{beer.name}</p>
        <p className="beer-brewery">{beer.brewery}</p>
        <p className="beer-meta">
          {beer.style} · {beer.abv.toFixed(1)}% ABV
        </p>
      </div>
      <button
        type="button"
        className={onBallot ? 'btn btn-added' : 'btn btn-primary'}
        onClick={() => pickBeer(beer.id)}
        disabled={onBallot}
      >
        {onBallot ? '✓ Tasted' : '+ Taste'}
      </button>
    </div>
  )
}
