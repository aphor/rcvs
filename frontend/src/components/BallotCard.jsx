import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import BeerImage from './BeerImage.jsx'

// A single ranked beer on the ballot.
//  - up arrow (left) promotes rank, down arrow (right) demotes rank
//  - the central body IS the drag handle: it holds the logo, name, description
//    and drag icon, and fills the space between the up/down buttons
//    (mouse + touch reorder via dnd-kit)
//  - X removes the card (gated by a confirm modal in the parent)
// When the ballot is cast, all controls are disabled and greyed out.
export default function BallotCard({
  beer,
  rank,
  total,
  cutoff,
  disabled,
  onPromote,
  onDemote,
  onRemove,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: beer.id,
    disabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  // Drag listeners only apply when the ballot is still editable.
  const dragProps = disabled ? {} : { ...attributes, ...listeners }

  // Ranks beyond the number of participating breweries carry no brewery weight:
  // they get no ordinal number and the card is greyed out.
  const withinCutoff = rank <= cutoff

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={withinCutoff ? 'card ballot-card' : 'card ballot-card beyond-cutoff'}
    >
      <button
        type="button"
        className="icon-btn"
        aria-label={`Promote ${beer.name}`}
        disabled={disabled || rank === 1}
        onClick={onPromote}
      >
        ▲
      </button>

      <button
        type="button"
        className="drag-body"
        aria-label={disabled ? beer.name : `Drag ${beer.name} to reorder`}
        disabled={disabled}
        {...dragProps}
      >
        <span className={withinCutoff ? 'rank-badge' : 'rank-badge rank-badge-muted'}>
          {withinCutoff ? rank : '–'}
        </span>
        <BeerImage beer={beer} className="beer-thumb small" />
        <span className="beer-info">
          <span className="ballot-line1">
            <span className="ballot-brewery">{beer.brewery}</span>
            <span className={`flavor-pill flavor-${beer.flavor.toLowerCase()}`}>{beer.flavor}</span>
          </span>
          <span className="ballot-beer">
            {beer.name} · {beer.style} · {beer.abv.toFixed(1)}% ABV
          </span>
        </span>
        {!disabled && (
          <span className="drag-icon" aria-hidden="true">
            ⠿
          </span>
        )}
      </button>

      <button
        type="button"
        className="icon-btn"
        aria-label={`Demote ${beer.name}`}
        disabled={disabled || rank === total}
        onClick={onDemote}
      >
        ▼
      </button>

      <button
        type="button"
        className="icon-btn remove-btn"
        aria-label={`Remove ${beer.name}`}
        disabled={disabled}
        onClick={onRemove}
      >
        ✕
      </button>
    </div>
  )
}
