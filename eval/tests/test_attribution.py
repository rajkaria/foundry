from foundry_eval.attribution import SCORE_SCALE, leave_one_out


def test_positive_marginals() -> None:
    result = leave_one_out(0.5, [0.7, 0.6, 0.55])
    assert result.deltas == [0.2, 0.1, 0.05]
    assert result.deltas_scaled == [
        int(0.2 * SCORE_SCALE),
        int(0.1 * SCORE_SCALE),
        int(0.05 * SCORE_SCALE),
    ]


def test_negative_clamps_to_zero() -> None:
    result = leave_one_out(0.5, [0.4, 0.5, 0.6])
    assert result.deltas == [0.0, 0.0, 0.1]
    assert result.deltas_scaled[0] == 0
