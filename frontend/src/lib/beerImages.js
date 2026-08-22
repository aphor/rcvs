// Local imagery for beers, scraped and embedded (see scripts note in beers.js):
//  - beer-labels/<beerId>.(jpg|png) : real Untappd label art, where a brewery
//    had uploaded one (~181 of 283 beers)
//  - brewery-logos/<brewerySlug>.(jpg|png) : the brewery's logo, used as the
//    fallback for every beer without its own label (votes are counted by
//    brewery, so the logo is a meaningful stand-in)
//
// Vite resolves these globs to hashed asset URLs at build time, so the images
// are bundled locally — no external requests at runtime.
const labelMods = import.meta.glob('../assets/beer-labels/*.{jpg,jpeg,png}', {
  eager: true,
  import: 'default',
})
const logoMods = import.meta.glob('../assets/brewery-logos/*.{jpg,jpeg,png}', {
  eager: true,
  import: 'default',
})

const stem = (path) => path.split('/').pop().replace(/\.(jpe?g|png)$/i, '')
const byStem = (mods) =>
  Object.fromEntries(Object.entries(mods).map(([path, url]) => [stem(path), url]))

const labels = byStem(labelMods)
const logos = byStem(logoMods)

// Best available local image for a beer: its own label, else the brewery logo,
// else null (the component then shows an inline SVG placeholder).
export function getBeerImage(beer) {
  return labels[beer.id] || logos[beer.brewerySlug] || null
}

// A brewery row on the ballot stands for all of its beers, so it takes the
// logo — never one member beer's label art.
export function getBreweryImage(slug) {
  return logos[slug] || null
}
