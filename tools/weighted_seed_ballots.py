#!/usr/bin/env python3
"""Seed the ballot box with popularity-weighted test ballots.

Unlike uniform_random_seed_ballots.py, breweries here get Zipf-distributed
popularity and each beer a per-beer twist on its brewery's draw, so a handful of
front-runners emerge, the tail is eliminated quickly, and results look like a
real contest instead of a 35-way near-tie.

Selection and rank order both come from weighted sampling without replacement
(Efraimidis-Spirakis: draw key = U^(1/w) per item, keep the largest), so a
popular beer is both likelier to appear and likelier to appear high.

    python tools/weighted_seed_ballots.py [count] [--seed N] [--alpha F] [--api URL]

Polls must be OPEN (POST /api/admin/open) before casting.
"""

import argparse
import random
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from _seedlib import DEFAULT_API, cast_all, load_resources  # noqa: E402

# Flavor popularity for a microbrew crowd — hoppy leads, sour trails.
FLAVOR_WEIGHTS = {"Hoppy": 3.0, "Crisp": 2.0, "Malty": 1.8, "Fruity": 1.3, "Exotic": 1.0, "Sour": 0.8}


def weighted_sample(items, weights, k, rng):
    """k items sampled without replacement, returned in weighted-random order."""
    keyed = [(rng.random() ** (1.0 / w) if w > 0 else 0.0, item) for item, w in zip(items, weights)]
    keyed.sort(reverse=True)
    return [item for _, item in keyed[:k]]


def build_weights(beers, alpha, rng):
    """Zipf popularity per brewery (random rank order), jittered per beer."""
    breweries = sorted(set(beers.values()))
    rng.shuffle(breweries)
    brewery_weight = {slug: 1.0 / (i + 1) ** alpha for i, slug in enumerate(breweries)}
    return {beer: brewery_weight[slug] * rng.uniform(0.5, 1.5) for beer, slug in beers.items()}


def build_ballots(count, beers, flavors, alpha, rng):
    """Each ballot ranks 7-15 beers and 3-6 flavors, weighted by popularity."""
    beer_weight = build_weights(beers, alpha, rng)
    beer_ids = list(beer_weight)
    beer_ws = [beer_weight[b] for b in beer_ids]
    flavor_ws = [FLAVOR_WEIGHTS.get(f, 1.0) for f in flavors]

    ballots = []
    for _ in range(count):
        picks = weighted_sample(beer_ids, beer_ws, rng.randint(7, 15), rng)
        chosen = weighted_sample(flavors, flavor_ws, rng.randint(3, len(flavors)), rng)
        ballots.append(
            {
                "ballot": picks,
                "flavorRanks": {name: i + 1 for i, name in enumerate(chosen)},
            }
        )
    return ballots


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("count", nargs="?", type=int, default=200, help="ballots to cast (default 200)")
    ap.add_argument("--seed", type=int, default=20260819, help="RNG seed for reproducible data")
    ap.add_argument("--alpha", type=float, default=0.9, help="Zipf exponent; higher = steeper (default 0.9)")
    ap.add_argument("--api", default=DEFAULT_API, help=f"backend base URL (default {DEFAULT_API})")
    args = ap.parse_args()

    beers, flavors = load_resources()
    rng = random.Random(args.seed)
    ballots = build_ballots(args.count, beers, flavors, args.alpha, rng)
    return 0 if cast_all(args.api, ballots) else 1


if __name__ == "__main__":
    raise SystemExit(main())
