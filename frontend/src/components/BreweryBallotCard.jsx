import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getBreweryImage } from '../lib/beerImages.js'

// A single ranked brewery on the ballot. Same affordances as the beer card it
// replaced — up promotes, down demotes, the body is the drag handle, X removes
// — but the unit is the brewery, which is what the tabulator actually counts.
// The beers tasted there are named underneath as a recognition cue.
const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
      <rect width="240" height="240" fill="#f3e6c4"/>
      <path d="M96 60h48l-6 120a8 8 0 0 1-8 8h-12a8 8 0 0 1-8-8z" fill="#e0a92b"/>
      <rect x="90" y="52" width="60" height="14" rx="7" fill="#c8901c"/>
      <text x="120" y="220" font-family="sans-serif" font-size="18" fill="#8a6d1f" text-anchor="middle">beer</text>
    </svg>`
  )

export default function BreweryBallotCard({
  group,
  rank,
  total,
  disabled,
  onPromote,
  onDemote,
  onRemove,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: group.slug,
    disabled,
  })
  const [src, setSrc] = useState(getBreweryImage(group.slug) || FALLBACK)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  // Drag listeners only apply while the ballot is still editable.
  const dragProps = disabled ? {} : { ...attributes, ...listeners }
  const tasted = group.beers.map((b) => b.name).join(' · ')

  return (
    <div ref={setNodeRef} style={style} className="card ballot-card">
      <button
        type="button"
        className="icon-btn"
        aria-label={`Promote ${group.brewery}`}
        disabled={disabled || rank === 1}
        onClick={onPromote}
      >
        ▲
      </button>

      <button
        type="button"
        className="drag-body"
        aria-label={disabled ? group.brewery : `Drag ${group.brewery} to reorder`}
        disabled={disabled}
        {...dragProps}
      >
        <span className="rank-badge">{rank}</span>
        <img
          className="beer-thumb small"
          src={src}
          alt={group.brewery}
          loading="lazy"
          onError={() => src !== FALLBACK && setSrc(FALLBACK)}
        />
        <span className="beer-info">
          <span className="ballot-line1">
            <span className="ballot-brewery">{group.brewery}</span>
            {group.flavors.map((f) => (
              <span key={f} className={`flavor-pill flavor-${f.toLowerCase()}`}>
                {f}
              </span>
            ))}
          </span>
          <span className="ballot-beer">{tasted}</span>
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
        aria-label={`Demote ${group.brewery}`}
        disabled={disabled || rank === total}
        onClick={onDemote}
      >
        ▼
      </button>

      <button
        type="button"
        className="icon-btn remove-btn"
        aria-label={`Remove ${group.brewery}`}
        disabled={disabled}
        onClick={onRemove}
      >
        ✕
      </button>
    </div>
  )
}
