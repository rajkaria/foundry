"""Leave-One-Out attribution — the honest v1 method.

Given a baseline score and per-contribution scores (each measured on
baseline + contribution_i vs. the secret holdout), compute the marginal
delta for each contribution. The output vector is what gets written
on-chain via Forge.submitEvalResult.
"""

from __future__ import annotations

from dataclasses import dataclass


SCORE_SCALE = 1_000_000  # the contract stores score × 1e6 in a uint64


@dataclass(frozen=True)
class AttributionResult:
    baseline: float
    scores: list[float]
    deltas: list[float]
    deltas_scaled: list[int]

    @property
    def attribution_sum(self) -> float:
        return sum(d for d in self.deltas if d > 0)


def leave_one_out(baseline: float, contribution_scores: list[float]) -> AttributionResult:
    """Compute marginal-delta attribution.

    A non-positive marginal delta means a contribution did not improve the
    baseline; we clamp such deltas to zero so they receive zero share. This
    is the documented v1 behaviour — see docs/00-build-spec.md §5.4.
    """
    deltas = [max(0.0, score - baseline) for score in contribution_scores]
    scaled = [int(round(delta * SCORE_SCALE)) for delta in deltas]
    return AttributionResult(
        baseline=baseline,
        scores=list(contribution_scores),
        deltas=deltas,
        deltas_scaled=scaled,
    )
