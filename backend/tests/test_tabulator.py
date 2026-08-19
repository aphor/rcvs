from backend.services.tabulator import tabulate


def test_first_round_majority():
    ballots = [["A"]] * 3 + [["B"], ["C"]]
    r = tabulate(ballots, ["A", "B", "C"])
    assert r["winner"] == "A"
    assert r["winner_by"] == "majority"
    assert len(r["rounds"]) == 1


def test_elimination_then_majority_via_transfer():
    ballots = [["A"], ["A"], ["B"], ["B"], ["C", "A"]]
    r = tabulate(ballots, ["A", "B", "C"])
    # C is eliminated; its ballot transfers to A, giving A a majority.
    assert r["winner"] == "A"
    assert r["winner_by"] == "majority"
    assert len(r["rounds"]) == 2
    assert r["rounds"][0]["eliminated"] == ["C"]


def test_winner_without_absolute_majority_of_electorate():
    # 10 ballots. B and C are truncated bullet votes that will exhaust.
    ballots = [["A"]] * 4 + [["B"]] * 3 + [["C"]] * 3
    total = len(ballots)
    r = tabulate(ballots, ["A", "B", "C"])
    assert r["winner"] == "A"
    assert r["winner_by"] == "majority"  # majority of *continuing*, not original
    final = r["rounds"][-1]["tallies"]["A"]
    # A wins with only 4 of 10 — an absolute majority of the electorate is
    # impossible here, and the tabulator must not require one.
    assert 2 * final <= total
    assert r["rounds"][-1]["exhausted"] > 0


def test_terminates_and_is_deterministic_on_total_tie():
    ballots = [["A"], ["B"], ["C"]]
    r1 = tabulate(ballots, ["A", "B", "C"])
    r2 = tabulate(ballots, ["A", "B", "C"])
    assert r1 == r2  # fully deterministic tie-breaking
    assert r1["winner"] == "C"  # A then B eliminated by stable tie-break
    assert r1["winner_by"] == "sole"
    assert len(r1["rounds"]) <= 3


def test_all_ballots_exhausted_has_no_winner():
    r = tabulate([[], [], []], ["A", "B"])
    assert r["winner"] is None
    assert r["winner_by"] == "exhausted"
    assert len(r["rounds"]) == 1


def test_single_candidate_is_sole_winner():
    r = tabulate([["A"], ["A"]], ["A"])
    assert r["winner"] == "A"
    assert r["winner_by"] == "sole"


def test_zero_vote_candidates_are_batch_eliminated():
    # C and D receive no votes; they should be eliminated together in round 1.
    ballots = [["A"], ["A"], ["B"], ["B"]]
    r = tabulate(ballots, ["A", "B", "C", "D"])
    assert sorted(r["rounds"][0]["eliminated"]) == ["C", "D"]
    assert r["winner"] in ("A", "B")  # tie broken deterministically to a sole winner
    assert r["winner_by"] == "sole"


def test_never_exceeds_candidate_count_in_rounds():
    # Termination guarantee: at most one elimination per round beyond batching.
    ballots = [["A"], ["B"], ["C"], ["D"], ["A", "B"]]
    r = tabulate(ballots, ["A", "B", "C", "D"])
    assert len(r["rounds"]) <= len(["A", "B", "C", "D"])
