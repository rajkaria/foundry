"""TEE attestation envelope.

The eval runs inside a TEE on 0G Compute. The enclave decrypts the
holdout, runs the eval, and produces a hardware-signed attestation
bound to:

  - the forge address being evaluated,
  - the baseline score,
  - the delta vector (LOO marginals * SCORE_SCALE),
  - the holdout's encrypted-content digest,
  - a nonce + timestamp for replay protection.

The bytes32 digest committed via Forge.submitEvalResult is
``keccak256(canonical_payload)``. The signature lives off-chain on the
indexer for any verifier to fetch + recheck.

This module implements three layers:

  1. Canonical payload encoding (deterministic).
  2. ECDSA signature over the keccak256 digest, using the eth_account
     secp256k1 scheme - same as Ethereum transactions, so any chain
     consumer can recover the signer with ecrecover.
  3. The labeled non-TEE fallback for local dev / CI.

Production wiring (Sprint 6): replace ``pack_attestation`` with a real
TDX / SGX DCAP quote produced inside the enclave; the canonical payload
format stays unchanged so verifiers don't need to migrate.
"""

from __future__ import annotations

import json
import secrets
from dataclasses import asdict, dataclass, field
from hashlib import sha256
from typing import Sequence

from eth_account import Account
from eth_account.messages import encode_defunct
from eth_keys.main import KeyAPI
from eth_utils.address import to_checksum_address
from eth_utils.crypto import keccak

_keys = KeyAPI()

_SIG_LEN = 65


@dataclass(frozen=True)
class AttestationPayload:
    """The canonical, signed payload."""

    forge: str
    baseline_scaled: int
    deltas_scaled: tuple[int, ...]
    holdout_digest: str
    nonce: str
    timestamp: int

    def canonical_bytes(self) -> bytes:
        """Stable byte encoding - never depends on dict ordering."""
        if not (
            isinstance(self.forge, str)
            and self.forge.startswith("0x")
            and len(self.forge) == 42
        ):
            raise ValueError(f"invalid forge address: {self.forge!r}")
        if not (
            isinstance(self.holdout_digest, str)
            and self.holdout_digest.startswith("0x")
            and len(self.holdout_digest) == 66
        ):
            raise ValueError("holdout_digest must be 0x-prefixed 32 bytes")

        ordered = {
            "forge": to_checksum_address(self.forge),
            "baseline_scaled": int(self.baseline_scaled),
            "deltas_scaled": [int(d) for d in self.deltas_scaled],
            "holdout_digest": self.holdout_digest.lower(),
            "nonce": self.nonce.lower(),
            "timestamp": int(self.timestamp),
        }
        return json.dumps(ordered, separators=(",", ":"), sort_keys=False).encode()

    def digest(self) -> bytes:
        return keccak(self.canonical_bytes())


@dataclass(frozen=True)
class Attestation:
    """A signed envelope ready to be persisted + posted on-chain."""

    payload: AttestationPayload
    signature: bytes
    signer: str
    measurement: str
    is_real_tee: bool

    @property
    def hex_digest(self) -> str:
        """The bytes32 string committed on-chain via Forge.submitEvalResult."""
        return "0x" + self.payload.digest().hex()

    @property
    def hex_signature(self) -> str:
        return "0x" + self.signature.hex()

    def to_dict(self) -> dict[str, object]:
        return {
            "payload": asdict(self.payload),
            "signature": self.hex_signature,
            "signer": self.signer,
            "digest": self.hex_digest,
            "measurement": self.measurement,
            "is_real_tee": self.is_real_tee,
        }


def pack_attestation(
    *,
    forge: str,
    baseline_scaled: int,
    deltas_scaled: Sequence[int],
    holdout_digest: str,
    signer_private_key: str,
    timestamp: int,
    measurement: str = "tee",
    is_real_tee: bool = True,
    nonce: str | None = None,
) -> Attestation:
    """Build a signed attestation envelope.

    The signer key is the enclave-resident signing key. In production this
    key never leaves the TEE; the public counterpart is registered on-chain
    via the provider registry so verifiers can match the recovered signer.
    """
    payload = AttestationPayload(
        forge=forge,
        baseline_scaled=int(baseline_scaled),
        deltas_scaled=tuple(int(d) for d in deltas_scaled),
        holdout_digest=holdout_digest,
        nonce=nonce or "0x" + secrets.token_hex(32),
        timestamp=int(timestamp),
    )
    digest = payload.digest()
    signable = encode_defunct(primitive=digest)
    signed = Account.sign_message(signable, private_key=signer_private_key)
    signer_addr = Account.from_key(signer_private_key).address
    return Attestation(
        payload=payload,
        signature=bytes(signed.signature),
        signer=signer_addr,
        measurement=measurement,
        is_real_tee=is_real_tee,
    )


def verify_attestation(att: Attestation, expected_signer: str) -> bool:
    """Recover the signer from the signature and compare.

    Returns True iff the envelope is well-formed AND was signed by
    ``expected_signer``. This is the same check a Solidity verifier would
    perform with ecrecover.
    """
    if len(att.signature) != _SIG_LEN:
        return False
    try:
        digest = att.payload.digest()
        signable = encode_defunct(primitive=digest)
        recovered = Account.recover_message(signable, signature=att.signature)
    except Exception:
        return False
    return to_checksum_address(recovered) == to_checksum_address(expected_signer)


def derive_provider_address(public_key_hex: str) -> str:
    """Compute the on-chain address that pairs with a TEE signing public key.

    The provider registry stores public keys; verifiers use this helper to
    derive the address that ``verify_attestation`` should match.
    """
    pk = _keys.PublicKey(bytes.fromhex(public_key_hex.removeprefix("0x")))
    return pk.to_checksum_address()


@dataclass(frozen=True)
class FallbackAttestation:
    """Labeled non-TEE attestation - dashboard surfaces this clearly."""

    digest: str
    measurement: str = field(default="fallback")
    is_real_tee: bool = field(default=False)

    @property
    def hex_bytes32(self) -> str:
        return "0x" + self.digest.zfill(64)


def fallback_attestation(score_payload: bytes) -> FallbackAttestation:
    """Non-TEE labeled fallback for local dev / CI runs.

    DO NOT use this on mainnet. The Forge contract still accepts the digest
    (the only on-chain check is "non-zero"), but the dashboard surfaces
    ``is_real_tee=False`` so downstream consumers can refuse the result.
    """
    h = sha256(b"FALLBACK::" + score_payload).hexdigest()
    return FallbackAttestation(digest=h)


def parse_tee_attestation(raw: bytes) -> FallbackAttestation:
    """Backwards-compat shim - prefer ``pack_attestation`` directly."""
    return FallbackAttestation(digest=sha256(raw).hexdigest(), measurement="legacy")
