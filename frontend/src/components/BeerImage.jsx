import { useState } from 'react'
import { beerImageUrl } from '../data/beers.js'

// A local inline SVG shown when the network placeholder image fails to load,
// so the mock renders fully offline.
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

export default function BeerImage({ beer, className }) {
  const [src, setSrc] = useState(beerImageUrl(beer.id))
  return (
    <img
      className={className}
      src={src}
      alt={`${beer.name} by ${beer.brewery}`}
      loading="lazy"
      onError={() => src !== FALLBACK && setSrc(FALLBACK)}
    />
  )
}
