"""TEE attestation handling.

The eval runs inside a TEE on 0G Compute. The enclave decrypts the
holdout, runs the eval, and produces a hardware-signed attestation
that we submit on-chain with the score vector.

Sprint 1 ships the structure + non-TEE fallback path. Sprint 2 wires
the real 0G Compute TEE dispatch — see docs/04-sprint-plan.md.
"""

from __future__ import annotations

from dataclasses import dataclass
from hashlib import sha256


@dataclass(frozen=True)
class Attestation:
    digest: str          # hex string, 32 bytes — what we write on-chain
    measurement: str     # the TEE-measured enclave hash (informational)
    is_real_tee: bool    # False for the labeled non-TEE fallback

    @property
    def hex_bytes32(self) -> str:
        return "0x" + self.digest.zfill(64)


def fallback_attestation(score_payload: bytes) -> Attestation:
    """Non-TEE labeled fallback — the dashboard surfaces this clearly."""
    h = sha256(b"FALLBACK::" + score_payload).hexdigest()
    return Attestation(digest=h, measurement="fallback", is_real_tee=False)


def parse_tee_attestation(raw: bytes) -> Attestation:
    """Parse a real 0G Compute TEE attestation envelope (stub for Sprint 2)."""
    # TODO(sprint-2): integrate with 0G Compute TEE attestation format.
    h = sha256(raw).hexdigest()
    return Attestation(digest=h, measurement="tee", is_real_tee=True)
