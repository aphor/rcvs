// Generates backend resource files from the frontend beer fixture so that the
// backend's candidates map exactly to the choices shown in the UI.
//
//   npm --prefix frontend run export-resources
//
// Emits into backend/resources/:
//   candidates_brewery.json  - one Candidate per distinct brewery (id = brewerySlug)
//   candidates_flavor.json   - one Candidate per flavor           (id = flavor slug)
//   beer_brewery_map.json    - { beerId: brewerySlug } for the ballot-box to fold
//                              a ranked beer list into a ranked brewery list
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import { beers, FLAVORS } from '../src/data/beers.js'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(here, '../../backend/resources')
mkdirSync(outDir, { recursive: true })

const BREWERY_CONTEST = 'favorite-brewery'
const FLAVOR_CONTEST = 'favorite-flavor'

// Distinct breweries in fixture order, keyed by their slug.
const breweryBySlug = new Map()
for (const b of beers) {
  if (!breweryBySlug.has(b.brewerySlug)) breweryBySlug.set(b.brewerySlug, b.brewery)
}

const candidatesBrewery = [...breweryBySlug].map(([slug, name]) => ({
  id: slug,
  contest_id: BREWERY_CONTEST,
  name,
  description: '',
}))

const candidatesFlavor = FLAVORS.map((flavor) => ({
  id: flavor.toLowerCase(),
  contest_id: FLAVOR_CONTEST,
  name: flavor,
  description: '',
}))

const beerBreweryMap = Object.fromEntries(beers.map((b) => [b.id, b.brewerySlug]))

const write = (name, data) => {
  const path = resolve(outDir, name)
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n')
  return path
}

write('candidates_brewery.json', candidatesBrewery)
write('candidates_flavor.json', candidatesFlavor)
write('beer_brewery_map.json', beerBreweryMap)

console.log(
  `Wrote resources to ${outDir}\n` +
    `  breweries: ${candidatesBrewery.length}\n` +
    `  flavors:   ${candidatesFlavor.length}\n` +
    `  beers:     ${Object.keys(beerBreweryMap).length}`
)
