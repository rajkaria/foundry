"""Foundry eval coordinator.

Watches Forge.state == EVALUATING events, pulls contributed datasets +
encrypted holdout from 0G Storage, dispatches baseline + LOO training jobs
to 0G Compute (inside a TEE for the eval), collects the hardware-signed
attestation + score vector, and calls submitEvalResult on-chain.

See docs/03-tech-architecture.md §7 for the design.
"""

__version__ = "0.1.0-alpha.1"
