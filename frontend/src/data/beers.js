// Static beer fixture for the mock. In the real app (backlog/03) this is
// replaced by a GET /api/beers?q= search endpoint.
//
// Each beer: { id, name, brewery, style, abv }
// imageUrl is derived deterministically from the id (see beerImageUrl) so the
// same beer always shows the same placeholder image, with no external beer API.

const RAW = [
  ['Hazy Horizon', 'Riverbend Brewing', 'Hazy IPA', 6.8],
  ['Copper Kettle', 'Riverbend Brewing', 'Amber Ale', 5.4],
  ['Midnight Stout', 'Riverbend Brewing', 'Imperial Stout', 9.2],
  ['Sunset Saison', 'Golden Fields Co.', 'Saison', 6.1],
  ['Field Day Pils', 'Golden Fields Co.', 'Pilsner', 4.9],
  ['Wheat Wanderer', 'Golden Fields Co.', 'Hefeweizen', 5.0],
  ['Foggy Coast', 'Tidewater Ales', 'West Coast IPA', 7.1],
  ['Salt & Sea Gose', 'Tidewater Ales', 'Gose', 4.4],
  ['Anchor Line Lager', 'Tidewater Ales', 'Helles Lager', 4.8],
  ['Pine Ridge Pale', 'Summit Craft Works', 'Pale Ale', 5.6],
  ['Double Timber', 'Summit Craft Works', 'Double IPA', 8.5],
  ['Trailhead Brown', 'Summit Craft Works', 'Brown Ale', 5.2],
  ['Velvet Porter', 'Old Mill Brewhouse', 'Porter', 6.0],
  ['Harvest Amber', 'Old Mill Brewhouse', 'Amber Ale', 5.5],
  ['Cellar Door Barleywine', 'Old Mill Brewhouse', 'Barleywine', 11.3],
  ['Citra Sunrise', 'Hop Theory', 'Session IPA', 4.6],
  ['Galaxy Quest', 'Hop Theory', 'Hazy IPA', 6.9],
  ['Triple Trouble', 'Hop Theory', 'Triple IPA', 10.4],
  ['Dry Hop Dreams', 'Hop Theory', 'IPA', 6.5],
  ['Barrel No. 7', 'Cooperage & Co.', 'Bourbon Barrel Stout', 12.0],
  ['Sour Cherry Wild', 'Cooperage & Co.', 'Fruited Sour', 5.8],
  ['Farmhouse Reserve', 'Cooperage & Co.', 'Saison', 7.0],
  ['Golden Hour Kolsch', 'Lantern District', 'Kolsch', 4.8],
  ['Nightcap Schwarz', 'Lantern District', 'Schwarzbier', 5.1],
  ['Market Street Marzen', 'Lantern District', 'Marzen', 5.7],
  ['Peach Pit Sour', 'Meadowlark Fermentory', 'Fruited Sour', 5.2],
  ['Elderflower Wit', 'Meadowlark Fermentory', 'Witbier', 5.0],
  ['Meadow Gold Blonde', 'Meadowlark Fermentory', 'Blonde Ale', 4.7],
  ['Iron Anvil Red', 'Forge City Beer', 'Irish Red', 5.3],
  ['Blast Furnace', 'Forge City Beer', 'Imperial Red IPA', 8.9],
  ['Smokestack Rauch', 'Forge City Beer', 'Rauchbier', 5.6],
  ['Cloudbreak', 'Altitude Brewing', 'Hazy Pale Ale', 5.4],
  ['Summit Fog', 'Altitude Brewing', 'Hazy IPA', 6.7],
  ['Alpine Start', 'Altitude Brewing', 'Cold IPA', 6.2],
  ['Cocoa Nib Mild', 'Hearthstone Brewery', 'Dark Mild', 3.8],
  ['Vanilla Cream Ale', 'Hearthstone Brewery', 'Cream Ale', 5.0],
  ['Spiced Pumpkin', 'Hearthstone Brewery', 'Pumpkin Ale', 6.3],
  ['Juniper Grove', 'Wildwood Cellars', 'Herb/Spice Ale', 6.0],
  ['Bramble Berry', 'Wildwood Cellars', 'Fruited Sour', 5.5],
  ['Oak & Ember', 'Wildwood Cellars', 'Barrel-Aged Brown', 7.4],
  ['Lakeside Lager', 'Northshore Brewing', 'American Lager', 4.5],
  ['Boat House Blonde', 'Northshore Brewing', 'Blonde Ale', 4.9],
  ['Cold Snap IPA', 'Northshore Brewing', 'Cold IPA', 6.1],
  ['Ruby Grapefruit', 'Citrus Park Ales', 'Fruited IPA', 6.4],
  ['Tangerine Trip', 'Citrus Park Ales', 'Session IPA', 4.7],
  ['Blood Orange Wit', 'Citrus Park Ales', 'Witbier', 5.1],
  ['Espresso Nitro', 'Daybreak Coffee Beer', 'Coffee Stout', 6.6],
  ['Cold Brew Porter', 'Daybreak Coffee Beer', 'Coffee Porter', 6.0],
  ['Morning Whistle', 'Daybreak Coffee Beer', 'Breakfast Stout', 8.2],
  ['Dunkel Dusk', 'Bavaria House', 'Dunkel', 5.0],
  ['Bock Solid', 'Bavaria House', 'Bock', 6.5],
  ['Doppel Trouble', 'Bavaria House', 'Doppelbock', 7.8],
  ['Sea Glass Pilsner', 'Harbor Point Brewing', 'Pilsner', 4.8],
  ['Lighthouse Lager', 'Harbor Point Brewing', 'Vienna Lager', 5.2],
  ['Riptide DIPA', 'Harbor Point Brewing', 'Double IPA', 8.3],
  ['Honey Bee Braggot', 'Apiary Ales', 'Braggot', 8.0],
  ['Clover Field Blonde', 'Apiary Ales', 'Honey Blonde', 5.3],
  ['Sting & Sweet', 'Apiary Ales', 'Honey IPA', 6.7],
  ['Last Call Amber', 'Closing Time Brewing', 'Amber Ale', 5.4],
  ['One More Round', 'Closing Time Brewing', 'Hazy IPA', 6.8],
]

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const beers = RAW.map(([name, brewery, style, abv], i) => ({
  id: `beer-${String(i + 1).padStart(3, '0')}-${slug(name)}`,
  name,
  brewery,
  style,
  abv,
}))

// Deterministic placeholder image for a beer id. picsum.photos returns a stable
// image per seed; components fall back to a local SVG if the network image fails.
export const beerImageUrl = (id) => `https://picsum.photos/seed/${id}/240/240`

const byId = new Map(beers.map((b) => [b.id, b]))
export const getBeer = (id) => byId.get(id)

// Votes are counted by brewery, not by beer. The number of distinct breweries
// participating in the festival is the number of meaningful ordinal ranks a
// ballot can express; ranks beyond this cutoff carry no brewery weight.
export const breweries = [...new Set(beers.map((b) => b.brewery))]
export const breweryCount = breweries.length

// Case-insensitive match on name, brewery, and style.
export function searchBeers(query) {
  const q = query.trim().toLowerCase()
  if (!q) return beers
  return beers.filter(
    (b) =>
      b.name.toLowerCase().includes(q) ||
      b.brewery.toLowerCase().includes(q) ||
      b.style.toLowerCase().includes(q)
  )
}
