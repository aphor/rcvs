// Beer fixture for the favorite-beer voting mock.
//
// Rebuilt from real breweries in the OP Microbrew Review 2026 lineup
// (see OPMicrobrewReview2026Brewers.js). Beers, styles, and ABV were sourced
// from each brewery's public Untappd lineup / menu as a current snapshot
// (Aug 2026) — a representative selection of flagship + notable current
// releases per brewery, not an exhaustive live tap list. In the real app
// (backlog/03) this is replaced by a GET /api/beers?q= search endpoint.
//
// Each beer: { id, name, brewery, style, abv }
// imageUrl is derived deterministically from the id (see beerImageUrl).
//
// Off Hours Beer Co. is sourced from its July 2026 draft-beer menu PDF
// (guest taps from other breweries excluded).

const RAW = [
  // Begyle Brewing
  ['Hophazardly IPA', 'Begyle Brewing', 'IPA - American', 7.1],
  ['Free Bird', 'Begyle Brewing', 'Pale Ale - American', 5.6],
  ['Begyle Blonde', 'Begyle Brewing', 'Blonde / Golden Ale', 5.4],
  ['Flannel Pajamas', 'Begyle Brewing', 'Stout - Oatmeal', 5.4],
  ['Neighborly Stout', 'Begyle Brewing', 'Stout - Irish Dry', 4.5],
  ['Boat Shoes', 'Begyle Brewing', 'Kölsch', 5.0],
  ['Crash Landed', 'Begyle Brewing', 'Wheat Beer - American Pale', 7.0],
  ['Imperial Pajamas', 'Begyle Brewing', 'Stout - Imperial Oatmeal', 9.8],

  // Blind Corner Brewery
  ['Booter Hazy IPA', 'Blind Corner Brewery', 'IPA - New England / Hazy', 6.0],
  ['Taper', 'Blind Corner Brewery', 'Lager - American', 4.2],
  ['High Draw', 'Blind Corner Brewery', 'Pale Ale - XPA', 5.2],
  ['Drop Ride', 'Blind Corner Brewery', 'IPA - American', 6.0],
  ['More To Discover', 'Blind Corner Brewery', 'IPA - Double New England / Hazy', 7.5],
  ['Onward & Upward', 'Blind Corner Brewery', 'IPA - New England / Hazy', 6.5],
  ['Autumn Standard', 'Blind Corner Brewery', 'Märzen', 5.2],
  ['John Frank Andy', 'Blind Corner Brewery', 'Scotch Ale / Wee Heavy', 7.0],

  // Burning Bush Brewery
  ["Lion's Den", 'Burning Bush Brewery', 'IPA - New England / Hazy', 7.0],
  ['Smooth Serpent', 'Burning Bush Brewery', 'IPA - American', 7.3],
  ['Tree Wrestler', 'Burning Bush Brewery', 'IPA - American', 6.6],
  ['St. Basil', 'Burning Bush Brewery', 'Red Ale - Amber', 6.2],
  ['New Chicago Translation', 'Burning Bush Brewery', 'Pilsner', 6.0],
  ['Heavenweizen', 'Burning Bush Brewery', 'Wheat Beer - Hefeweizen', 6.3],
  ['Crossroads', 'Burning Bush Brewery', 'Lager - Vienna', 5.4],
  ['Jonah', 'Burning Bush Brewery', 'Cream Ale', 5.2],

  // Corridor Brewery & Provisions
  ['Cosmic Juicebox', 'Corridor Brewery & Provisions', 'IPA - New England / Hazy', 6.8],
  ['Van Hazen', 'Corridor Brewery & Provisions', 'IPA - New England / Hazy', 6.5],
  ['Wizard Fight', 'Corridor Brewery & Provisions', 'IPA - American', 6.2],
  ['SqueezIt OG', 'Corridor Brewery & Provisions', 'IPA - Imperial / Double', 8.0],
  ['Salute Your Simcoe', 'Corridor Brewery & Provisions', 'Pale Ale - American', 5.4],
  ['Rapunzel', 'Corridor Brewery & Provisions', 'Belgian Tripel', 9.5],
  ['Brambi', 'Corridor Brewery & Provisions', 'Sour - Fruited', 5.7],
  ['Pour Le Mineur', 'Corridor Brewery & Provisions', 'Farmhouse Ale - Grisette', 4.2],

  // Crushed by Giants Brewing Company
  ['Neon Werewolf', 'Crushed by Giants Brewing Company', 'IPA - New England / Hazy', 6.8],
  ['Lake Shore Drive', 'Crushed by Giants Brewing Company', 'Lager - American Light', 4.8],
  ["Goliath's Bane", 'Crushed by Giants Brewing Company', 'IPA - Session', 4.2],
  ['Polyphemus', 'Crushed by Giants Brewing Company', 'Pilsner - Italian', 4.0],
  ['Jotunheim Cold IPA', 'Crushed by Giants Brewing Company', 'IPA - Cold', 7.8],
  ['Das Boot', 'Crushed by Giants Brewing Company', 'Märzen', 5.3],
  ['¡Ay Caramba!', 'Crushed by Giants Brewing Company', 'Lager - Mexican', 4.8],
  ['Fool Formula', 'Crushed by Giants Brewing Company', 'Pale Ale - American', 5.5],

  // Double Clutch Brewing
  ['Helles Lager', 'Double Clutch Brewing', 'Lager - Helles', 5.1],
  ['Kölsch', 'Double Clutch Brewing', 'Kölsch', 4.6],
  ['Pilsener', 'Double Clutch Brewing', 'Pilsner - German', 4.9],
  ['Hefeweizen', 'Double Clutch Brewing', 'Wheat Beer - Hefeweizen', 5.4],
  ['Märzen', 'Double Clutch Brewing', 'Lager - Märzen', 5.9],
  ['E-Town Gold Vienna Lager', 'Double Clutch Brewing', 'Lager - Vienna', 5.0],
  ['Little Juice Coupe', 'Double Clutch Brewing', 'IPA - New England / Hazy', 6.4],
  ['Smooth Alternator Doppelbock', 'Double Clutch Brewing', 'Bock - Doppelbock', 8.2],

  // DryHop Brewers
  ['Head Full of Zombies', 'DryHop Brewers', 'Summer Ale', 5.1],
  ['Shark Meets Hipster', 'DryHop Brewers', 'IPA - Wheat', 6.5],
  ['Key Offender', 'DryHop Brewers', 'Pilsner', 5.4],
  ['Celestial Cloud', 'DryHop Brewers', 'Pale Ale - New England / Hazy', 6.1],
  ['Circadian Rhythm', 'DryHop Brewers', 'Lager - Rice', 5.3],
  ['Batch 001', 'DryHop Brewers', 'Cream Ale', 5.3],
  ['Fizzy Gig', 'DryHop Brewers', 'Sour Ale', 5.4],
  ['Super Melodious', 'DryHop Brewers', 'Sour - Dragonfruit', 5.4],

  // ERIS Brewery and Cider house
  ['Foiken Haze', 'ERIS Brewery and Cider House', 'IPA - New England / Hazy', 6.9],
  ['Eepah', 'ERIS Brewery and Cider House', 'IPA - American', 6.7],
  ['Sacred Chao', 'ERIS Brewery and Cider House', 'IPA - Milkshake', 7.0],
  ['PodgeHodge', 'ERIS Brewery and Cider House', 'Pilsner - German', 5.3],
  ['Moral Warptitude', 'ERIS Brewery and Cider House', 'Stout - American', 7.3],
  ['Season of Confusion', 'ERIS Brewery and Cider House', 'Farmhouse Ale - Saison', 6.7],
  ['Pedestrian', 'ERIS Brewery and Cider House', 'Cider - Traditional', 5.6],
  ['Van Van Mojo', 'ERIS Brewery and Cider House', 'Cider - Fruit', 6.2],

  // Flapjack Brewery
  ['Fantasmo', 'Flapjack Brewery', 'Cream Ale', 6.0],
  ['Boltneck', 'Flapjack Brewery', 'Stout - Other', 6.8],
  ['Tick Tock Kytell', 'Flapjack Brewery', 'IPA - American', 7.5],
  ['Gabba Ghoul', 'Flapjack Brewery', 'Farmhouse Ale - Saison', 6.3],
  ['Beerwyn Common', 'Flapjack Brewery', 'California Common', 5.9],
  ['Pancake Face', 'Flapjack Brewery', 'Brown Ale - American', 6.6],
  ['Janweizen', 'Flapjack Brewery', 'Wheat Beer - Hefeweizen', 5.5],
  ['Not Dirty Enough', 'Flapjack Brewery', 'IPA - New England / Hazy', 7.5],

  // Fulcra Brewing
  ['Rock Knoll', 'Fulcra Brewing', 'IPA - American', 6.9],
  ['Bramford', 'Fulcra Brewing', 'Brown Ale - American', 5.8],
  ['Far & Near', 'Fulcra Brewing', 'Pale Ale - New Zealand', 5.4],
  ['Gromit Ale', 'Fulcra Brewing', 'Bitter - Session', 4.0],
  ['Sorachi Gold', 'Fulcra Brewing', 'Belgian Blonde', 6.2],
  ['Slingin', 'Fulcra Brewing', 'Cream Ale', 4.8],
  ['Straight Citra', 'Fulcra Brewing', 'Pale Ale - New England / Hazy', 5.2],
  ['Running Around', 'Fulcra Brewing', 'Kölsch', 4.6],

  // Funkytown Brewing
  ['Hip-Hops and R&Brew', 'Funkytown Brewing', 'Pale Ale - American', 5.5],
  ['Woo-Wap-Da-Bam', 'Funkytown Brewing', 'Lager - Amber', 5.6],
  ['Gym Shoe Weather', 'Funkytown Brewing', 'Pale Ale - Belgian', 5.2],
  ["Cuffin' Season", 'Funkytown Brewing', 'Red Ale - Irish', 5.4],
  ['Summertime Chi', 'Funkytown Brewing', 'Wheat Beer - Witbier', 5.0],
  ['1984 Pale Lager', 'Funkytown Brewing', 'Lager - Pale', 5.0],
  ['Homecoming', 'Funkytown Brewing', 'Märzen', 5.5],
  ['Black Is Beautiful', 'Funkytown Brewing', 'Porter - Baltic', 7.0],

  // Go Brewing (non-alcoholic)
  ['Sunshine State Tropical IPA', 'Go Brewing', 'Non-Alcoholic IPA', 0.4],
  ['The Story', 'Go Brewing', 'Non-Alcoholic IPA', 0.5],
  ['Sunbeam Pilsner', 'Go Brewing', 'Non-Alcoholic Lager', 0.5],
  ['New School Sour: Berry', 'Go Brewing', 'Non-Alcoholic Sour', 0.4],
  ['Disarm', 'Go Brewing', 'Non-Alcoholic IPA', 0.5],
  ['Prophets Hazy IPA', 'Go Brewing', 'Non-Alcoholic IPA', 0.5],
  ['Freedom Cali Pale', 'Go Brewing', 'Non-Alcoholic Pale Ale', 0.5],
  ['Damn Good Oktoberfest', 'Go Brewing', 'Non-Alcoholic Festbier', 0.5],

  // Goose Island Beer Co.
  ['Goose IPA', 'Goose Island Beer Co.', 'IPA - American', 5.9],
  ['312 Wheat Ale', 'Goose Island Beer Co.', 'Wheat Beer - American Pale', 4.2],
  ['Bourbon County Brand Stout', 'Goose Island Beer Co.', 'Stout - Imperial', 15.2],
  ['Honkers Ale', 'Goose Island Beer Co.', 'Bitter - Session', 4.3],
  ['Sofie', 'Goose Island Beer Co.', 'Farmhouse Ale - Saison', 6.5],
  ['Green Line Pale Ale', 'Goose Island Beer Co.', 'Pale Ale - American', 5.4],
  ['Matilda', 'Goose Island Beer Co.', 'Pale Ale - Belgian', 7.0],
  ['Summertime', 'Goose Island Beer Co.', 'Kölsch', 5.0],

  // Half Acre Brewing
  ['Daisy Cutter Pale Ale', 'Half Acre Brewing', 'Pale Ale - American', 5.2],
  ['GoneAway', 'Half Acre Brewing', 'IPA - American', 7.1],
  ['Vallejo', 'Half Acre Brewing', 'IPA - American', 6.7],
  ['Pony', 'Half Acre Brewing', 'Pilsner - German', 5.5],
  ['Tome', 'Half Acre Brewing', 'Pale Ale - New England / Hazy', 5.5],
  ['Space', 'Half Acre Brewing', 'IPA - American', 6.6],
  ['Akari Shogun', 'Half Acre Brewing', 'Wheat Beer - American Pale', 5.1],
  ['Lager Town', 'Half Acre Brewing', 'Märzen', 5.8],

  // Haymarket Beer Company
  ['Hay Z', 'Haymarket Beer Company', 'IPA - New England / Hazy', 7.5],
  ['Secret Alley Tripel', 'Haymarket Beer Company', 'Belgian Tripel', 9.5],
  ['Haymarket XPA', 'Haymarket Beer Company', 'Pale Ale - XPA', 4.8],
  ['Hop of the Ninth', 'Haymarket Beer Company', 'Farmhouse Ale - Saison', 5.0],
  ['Speakerswagon Pilsner', 'Haymarket Beer Company', 'Pilsner - German', 5.0],
  ['Chicago Tavern Beer', 'Haymarket Beer Company', 'Lager - Dortmunder / Export', 5.3],
  ['Aleister', 'Haymarket Beer Company', 'IPA - American', 6.5],
  ['Demonstrator Doppelbock', 'Haymarket Beer Company', 'Bock - Doppelbock', 8.0],

  // Homewood Brewing Company
  ['Hazeologist', 'Homewood Brewing Company', 'IPA - New England / Hazy', 6.2],
  ['Mangolorian', 'Homewood Brewing Company', 'Wheat Beer - Witbier', 6.1],
  ['H.B.C. (Head Beer In Charge)', 'Homewood Brewing Company', 'Pale Ale - American', 5.5],
  ['Light Haus', 'Homewood Brewing Company', 'Lager - Helles', 5.1],
  ['Conversations', 'Homewood Brewing Company', 'Lager - Mexican', 4.3],
  ['Change Order', 'Homewood Brewing Company', 'Märzen', 6.1],
  ['Moonlight Haze', 'Homewood Brewing Company', 'IPA - New England / Hazy', 6.6],
  ['Wishing Well', 'Homewood Brewing Company', 'Pilsner - Czech', 4.0],

  // Hop Butcher For The World
  ['Grid', 'Hop Butcher For The World', 'Pale Ale - American', 5.75],
  ['Snorkel Squad', 'Hop Butcher For The World', 'IPA - New England / Hazy', 6.5],
  ['Blazed Orange', 'Hop Butcher For The World', 'IPA - Double New England / Hazy', 7.5],
  ['Green Moss', 'Hop Butcher For The World', 'IPA - Double New England / Hazy', 7.5],
  ['Tavern Cut', 'Hop Butcher For The World', 'IPA - Double New England / Hazy', 7.5],
  ['Blazed Orange Milkshake', 'Hop Butcher For The World', 'IPA - Milkshake', 7.5],
  ['Double Blazed Orange', 'Hop Butcher For The World', 'IPA - Double Milkshake', 9.5],
  ['Galaxy Bowl', 'Hop Butcher For The World', 'IPA - Double New England / Hazy', 7.5],

  // Horse Thief Hollow
  ['Spoonful', 'Horse Thief Hollow', 'IPA - New England / Hazy', 6.5],
  ['Annexation Ale', 'Horse Thief Hollow', 'IPA - American', 7.2],
  ['Kitchen Sink Pale Ale', 'Horse Thief Hollow', 'Pale Ale - American', 5.7],
  ['Little Wing', 'Horse Thief Hollow', 'Pilsner', 5.2],
  ['Hefewestern', 'Horse Thief Hollow', 'Wheat Beer - Hefeweizen', 5.5],
  ['Pink Pom Pom', 'Horse Thief Hollow', 'Wheat Beer - Hefeweizen', 5.6],
  ['Cinnamon Girl', 'Horse Thief Hollow', 'Stout - Spiced', 9.5],
  ["Pat Mac's", 'Horse Thief Hollow', 'Red Ale - Irish', 5.1],

  // Kinslahger Brewing
  ['Chicago Common', 'Kinslahger Brewing', 'Rye Beer', 7.5],
  ['Prohibition Pilsner', 'Kinslahger Brewing', 'Pilsner', 5.4],
  ['Dunkel', 'Kinslahger Brewing', 'Lager - Munich Dunkel', 5.1],
  ['Alt', 'Kinslahger Brewing', 'Altbier', 5.1],
  ['Helles', 'Kinslahger Brewing', 'Lager - Helles', 5.4],
  ['Baltic Porter', 'Kinslahger Brewing', 'Porter - Baltic', 9.4],
  ['Czech Pils', 'Kinslahger Brewing', 'Pilsner - Czech', 5.5],
  ['Meditator', 'Kinslahger Brewing', 'Bock - Doppelbock', 9.8],

  // Lake Effect Brewing Company
  ['Falcon Dive IPA', 'Lake Effect Brewing Company', 'IPA - American', 7.5],
  ['Lake Effect Snow', 'Lake Effect Brewing Company', 'Wheat Beer - Witbier', 5.2],
  ['Arbor Oak Amber Ale', 'Lake Effect Brewing Company', 'Red Ale - Amber', 5.5],
  ["Bitchin' Blonde", 'Lake Effect Brewing Company', 'Belgian Blonde', 6.3],
  ['Espresso Gone Stout', 'Lake Effect Brewing Company', 'Stout - Milk / Sweet', 6.0],
  ['Super Bier', 'Lake Effect Brewing Company', 'Kölsch', 5.2],
  ['1948 Pale Ale', 'Lake Effect Brewing Company', 'Pale Ale - American', 5.8],
  ['St. Lawrence', 'Lake Effect Brewing Company', 'Sour - Gose', 4.8],

  // Lake Time Brewing and Spirits
  ['Oddfellows Hazy', 'Lake Time Brewing and Spirits', 'IPA - New England / Hazy', 7.0],
  ['Gone Fission IPA', 'Lake Time Brewing and Spirits', 'IPA - American', 6.5],
  ['Astronaut Sauce', 'Lake Time Brewing and Spirits', 'Pale Ale - Belgian', 5.8],
  ['Joe-n-Dave', 'Lake Time Brewing and Spirits', 'Lager - American Light', 4.2],
  ['E Pale', 'Lake Time Brewing and Spirits', 'Pale Ale - American', 5.2],
  ['Pilsner LTB', 'Lake Time Brewing and Spirits', 'Pilsner - Czech', 6.0],
  ['Robust Porter', 'Lake Time Brewing and Spirits', 'Porter - American', 6.5],
  ['Belgian Wit', 'Lake Time Brewing and Spirits', 'Wheat Beer - Witbier', 4.8],

  // Lunar Brewing Company
  ['Moondance IPA', 'Lunar Brewing Company', 'IPA - American', 6.5],
  ['Kosmic Kolsch', 'Lunar Brewing Company', 'Kölsch', 6.2],
  ['Total Eclipse Stout', 'Lunar Brewing Company', 'Stout - Oatmeal', 6.0],
  ['Jumping Cow Cream Ale', 'Lunar Brewing Company', 'Cream Ale', 5.2],
  ['Polaris Porter', 'Lunar Brewing Company', 'Porter', 6.2],
  ['Nebula Nut Brown', 'Lunar Brewing Company', 'Brown Ale - English', 5.8],
  ['Neil Armstrong', 'Lunar Brewing Company', 'Belgian Tripel', 10.5],
  ['Little Green Men', 'Lunar Brewing Company', 'IPA - New England / Hazy', 5.25],

  // Midwest Coast Brewing
  ['Vaguely Stylish', 'Midwest Coast Brewing', 'IPA - American', 6.5],
  ['Elevator to Nowhere', 'Midwest Coast Brewing', 'IPA - New England / Hazy', 6.4],
  ['West Town Brown', 'Midwest Coast Brewing', 'Brown Ale - American', 5.3],
  ['English Sporting Beer', 'Midwest Coast Brewing', 'Bitter - ESB', 5.3],
  ['Volkslager', 'Midwest Coast Brewing', 'Pilsner - German', 4.7],
  ['Holstein Helles', 'Midwest Coast Brewing', 'Lager - Helles', 5.3],
  ['Three From the Tee', 'Midwest Coast Brewing', 'Cream Ale', 4.7],
  ['Fire Watch', 'Midwest Coast Brewing', 'Stout - Oatmeal', 5.8],

  // Mikerphone Brewing
  ['Mikerphone Solo', 'Mikerphone Brewing', 'IPA - New England / Hazy', 6.5],
  ['Check 1, 2', 'Mikerphone Brewing', 'IPA - Double New England / Hazy', 8.0],
  ['Smells Like Bean Spirit', 'Mikerphone Brewing', 'Stout - Coffee', 8.0],
  ['Slim Hazy', 'Mikerphone Brewing', 'Pale Ale - New England / Hazy', 5.5],
  ['Heads Will Roll', 'Mikerphone Brewing', 'IPA - American', 7.0],
  ['crushcrushcrush (Orange)', 'Mikerphone Brewing', 'IPA - Milkshake', 7.25],
  ['Hey Mambo, Mambo Italiano!', 'Mikerphone Brewing', 'Pilsner - Italian', 5.0],
  ['I Want My IPA', 'Mikerphone Brewing', 'IPA - American', 7.25],

  // Moor's Brewing Company
  ['India Pale Ale', "Moor's Brewing Company", 'IPA - American', 6.7],
  ['Session Ale', "Moor's Brewing Company", 'IPA - Session', 5.0],
  ['Helles Lager', "Moor's Brewing Company", 'Lager - Helles', 5.2],
  ['Imperial Porter', "Moor's Brewing Company", 'Porter - Imperial', 8.3],
  ['Kölsch', "Moor's Brewing Company", 'Kölsch', 5.3],
  ['Pilsner', "Moor's Brewing Company", 'Pilsner', 6.0],
  ['The Stroll', "Moor's Brewing Company", 'Brown Ale - American', 6.0],
  ['Moorvolution', "Moor's Brewing Company", 'Pilsner - Italian', 5.0],

  // Off Color Brewing
  ['Apex Predator', 'Off Color Brewing', 'Farmhouse Ale - Saison', 6.5],
  ['Troublesome', 'Off Color Brewing', 'Sour - Gose', 4.5],
  ['Fierce', 'Off Color Brewing', 'Sour - Berliner Weisse', 3.8],
  ['Scurry', 'Off Color Brewing', 'Historical - Kottbusser', 5.3],
  ['Beer for Tacos', 'Off Color Brewing', 'Sour - Gose', 4.8],
  ['Tooth and Claw', 'Off Color Brewing', 'Lager - Pale', 5.0],
  ["Dino S'mores", 'Off Color Brewing', 'Stout - Russian Imperial', 10.5],
  ['Beer for Lounging', 'Off Color Brewing', 'Pale Ale - American', 5.0],

  // Off Hours Beer Co. (from July 2026 draft beer menu; guest taps excluded)
  ['1929', 'Off Hours Beer Co.', 'Lager - Mexican', 3.2],
  ['Devolution', 'Off Hours Beer Co.', 'Sour - Berliner Weisse', 2.9],
  ['Green Note', 'Off Hours Beer Co.', 'IPA - New England / Hazy', 5.5],
  ['Ghost Chicken', 'Off Hours Beer Co.', 'Pale Ale - American', 3.8],
  ['Idle State', 'Off Hours Beer Co.', 'Sour - Catharina', 5.2],
  ['Snaps', 'Off Hours Beer Co.', 'Lager - Pilsner', 4.5],
  ['Forever Ever', 'Off Hours Beer Co.', 'IPA - American', 4.7],
  ['Broccoli', 'Off Hours Beer Co.', 'IPA - Imperial / Double', 7.9],
  ['Backtop Buckets', 'Off Hours Beer Co.', 'IPA - Double New England / Hazy', 8.2],
  ["Ain't Nothing Nice", 'Off Hours Beer Co.', 'IPA - New England / Hazy', 6.2],
  ['BA Green City', 'Off Hours Beer Co.', 'Stout - Imperial Pastry', 12.5],

  // Old Irving Brewing Co
  ['Beezer', 'Old Irving Brewing Co', 'IPA - New England / Hazy', 6.9],
  ['Double Beezer', 'Old Irving Brewing Co', 'IPA - Double New England / Hazy', 8.5],
  ['Della', 'Old Irving Brewing Co', 'Kölsch', 5.2],
  ['Scentinel', 'Old Irving Brewing Co', 'IPA - American', 6.2],
  ['Doji', 'Old Irving Brewing Co', 'Pilsner', 5.5],
  ['Sonne', 'Old Irving Brewing Co', 'Lager - Helles', 5.3],
  ['Lifesblood', 'Old Irving Brewing Co', 'Lager - Dark', 6.0],
  ['Til Death', 'Old Irving Brewing Co', 'Pilsner - German', 4.9],

  // One Lake Brewing
  ['Lando', 'One Lake Brewing', 'IPA - American', 7.5],
  ['Oscar Milde', 'One Lake Brewing', 'Mild', 4.2],
  ['Austin Lager', 'One Lake Brewing', 'Lager - Vienna', 5.6],
  ['Green Bottle', 'One Lake Brewing', 'Pilsner - Czech', 5.6],
  ['OLB Lager Beer', 'One Lake Brewing', 'Lager - American', 5.6],
  ['East Side Lite', 'One Lake Brewing', 'Lager - American Light', 3.9],
  ['Been Czar, Done That — Rye', 'One Lake Brewing', 'Stout - Russian Imperial', 12.7],
  ['Been Czar, Done That — Bourbon', 'One Lake Brewing', 'Stout - Russian Imperial', 12.7],

  // Open Outcry Brewing Company
  ['Open Interest', 'Open Outcry Brewing Company', 'IPA - New England / Hazy', 6.7],
  ['Speculator', 'Open Outcry Brewing Company', 'Cream Ale', 4.5],
  ['Louis Winthorpe', 'Open Outcry Brewing Company', 'IPA - New England / Hazy', 7.1],
  ['Delirio', 'Open Outcry Brewing Company', 'IPA - New England / Hazy', 6.8],
  ['Black Scholes', 'Open Outcry Brewing Company', 'Stout - Irish Dry', 4.0],
  ['Big Board Nut Brown', 'Open Outcry Brewing Company', 'Brown Ale - American', 6.6],
  ['Self Regulator', 'Open Outcry Brewing Company', 'Pale Ale - American', 5.0],
  ['Mosaically Yours', 'Open Outcry Brewing Company', 'IPA - Cold', 6.5],

  // Pilot Project Brewing
  ['Panther Pale Ale', 'Pilot Project Brewing', 'Pale Ale - American', 5.0],
  ['House IPA', 'Pilot Project Brewing', 'IPA - American', 7.0],
  ['All Together', 'Pilot Project Brewing', 'IPA - New England / Hazy', 6.5],
  ['House Lager', 'Pilot Project Brewing', 'Lager - American', 5.0],
  ['House Kolsch', 'Pilot Project Brewing', 'Kölsch', 5.2],
  ['House Pilsner', 'Pilot Project Brewing', 'Pilsner - German', 5.1],
  ['Conquer//Destroy', 'Pilot Project Brewing', 'Stout - Imperial', 11.0],
  ['House Baltic', 'Pilot Project Brewing', 'Porter - Baltic', 10.0],

  // Pipeworks Brewing Co
  ['Ninja vs. Unicorn', 'Pipeworks Brewing Co', 'IPA - Imperial / Double', 8.0],
  ['Lizard King', 'Pipeworks Brewing Co', 'Pale Ale - American', 6.0],
  ['Blood of the Unicorn', 'Pipeworks Brewing Co', 'Red Ale - Amber', 6.5],
  ['Lil Citra', 'Pipeworks Brewing Co', 'Pale Ale - American', 5.1],
  ['Glaucus', 'Pipeworks Brewing Co', 'IPA - Belgian', 6.2],
  ['Infinite Citra', 'Pipeworks Brewing Co', 'IPA - American', 7.0],
  ['Premium Pilsner', 'Pipeworks Brewing Co', 'Pilsner', 4.9],
  ["S'more Money, S'more Problems", 'Pipeworks Brewing Co', 'Stout - Pastry', 10.0],

  // Revolution Brewing
  ['Anti-Hero', 'Revolution Brewing', 'IPA - American', 6.7],
  ['Fist City', 'Revolution Brewing', 'Pale Ale - American', 5.5],
  ['Hazy Hero', 'Revolution Brewing', 'IPA - New England / Hazy', 7.3],
  ['Rev Pils', 'Revolution Brewing', 'Pilsner - German', 5.5],
  ['Cross of Gold', 'Revolution Brewing', 'Blonde / Golden Ale', 4.8],
  ['Eugene', 'Revolution Brewing', 'Porter - American', 6.8],
  ['Fistmas', 'Revolution Brewing', 'Red Ale', 6.5],
  ["Deth's Tar", 'Revolution Brewing', 'Stout - Imperial Oatmeal', 14.8],

  // Stockholm's Restaurant & Brewery
  ['Geneva Pale Ale', "Stockholm's Restaurant & Brewery", 'Pale Ale - American', 6.8],
  ['State Street Pilsner', "Stockholm's Restaurant & Brewery", 'Pilsner - German', 5.4],
  ['Viking Red Ale', "Stockholm's Restaurant & Brewery", 'Red Ale - Amber', 5.2],
  ['Older But Weisser', "Stockholm's Restaurant & Brewery", 'Wheat Beer - Witbier', 5.4],
  ["Doc's Porter", "Stockholm's Restaurant & Brewery", 'Porter - American', 6.5],
  ['Downtown Honey Brown', "Stockholm's Restaurant & Brewery", 'Brown Ale - American', 5.2],
  ['Abbey Ale', "Stockholm's Restaurant & Brewery", 'Belgian Dubbel', 7.0],
  ['Stockholm Saison', "Stockholm's Restaurant & Brewery", 'Farmhouse Ale - Saison', 4.5],

  // Tighthead Brewing Co
  ['Irie IPA', 'Tighthead Brewing Co', 'IPA - American', 7.8],
  ['Scarlet Fire', 'Tighthead Brewing Co', 'Red Ale - Irish', 5.6],
  ['Chilly Water', 'Tighthead Brewing Co', 'Pale Ale - American', 4.8],
  ['Comfortably Blonde', 'Tighthead Brewing Co', 'Blonde / Golden Ale', 4.8],
  ['Pitcher of NEctar', 'Tighthead Brewing Co', 'IPA - New England / Hazy', 7.3],
  ['Boxcar Porter', 'Tighthead Brewing Co', 'Porter - English', 5.6],
  ['Hat Trick Tripel', 'Tighthead Brewing Co', 'Belgian Tripel', 8.9],
  ['Powerful Pils', 'Tighthead Brewing Co', 'Pilsner - Czech', 6.0],
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
