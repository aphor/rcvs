#!/usr/bin/env python3
"""Seed the ballot box with uniformly random test ballots.

Every beer is equally likely to appear on a ballot and rank order is random, so
first choices spread thin across all breweries and the brewery contest runs
deep into elimination rounds. Good for exercising the tabulator and the Sankey
view; see weighted_seed_ballots.py for data that looks like a real contest.

    python tools/uniform_random_seed_ballots.py [count] [--seed N] [--api URL]

Polls must be OPEN (POST /api/admin/open) before casting.
"""

import argparse
import random
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from _seedlib import DEFAULT_API, cast_all, load_resources  # noqa: E402


def build_ballots(count, beers, flavors, rng):
    """Each ballot ranks 7-15 random beers and 3-6 flavors, all in random order."""
    ballots = []
    for _ in range(count):
        picks = rng.sample(list(beers), rng.randint(7, 15))
        chosen = rng.sample(flavors, rng.randint(3, len(flavors)))
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
    ap.add_argument("--api", default=DEFAULT_API, help=f"backend base URL (default {DEFAULT_API})")
    args = ap.parse_args()

    beers, flavors = load_resources()
    rng = random.Random(args.seed)
    return 0 if cast_all(args.api, build_ballots(args.count, beers, flavors, rng)) else 1


if __name__ == "__main__":
    raise SystemExit(main())
