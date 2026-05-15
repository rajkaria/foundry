"""Tests for the TEE attestation envelope.

The envelope is a signed payload: pack -> verify must round-trip, and
any single-byte tamper (forge addr, deltas, holdout digest, nonce) must
break verification.
"""

from __future__ import annotations

import time
from dataclasses import replace

import pytest
from eth_account import Account

from foundry_eval.tee import (
    Attestation,
    AttestationPayload,
    fallback_attestation,
    pack_attestation,
    verify_attestation,
)


def _fresh_payload_kwargs(deltas: list[int] | None = None) -> dict[str, object]:
    return {
        "forge": "0x000000000000000000000000000000000000a38D",
        "baseline_scaled": 500_000,
        "deltas_scaled": deltas or [200_000, 100_000, 50_000],
        "holdout_digest": "0x" + "ab" * 32,
        "timestamp": int(time.time()),
    }


def _sign_with(privkey: str, deltas: list[int] | None = None) -> Attestation:
    return pack_attestation(
        **_fresh_payload_kwargs(deltas),
        signer_private_key=privkey,
    )


def test_pack_verify_roundtrip() -> None:
    acct = Account.create()
    att = _sign_with(acct.key.hex())
    assert att.is_real_tee is True
    assert att.measurement == "tee"
    assert att.signer == acct.address
    assert len(att.signature) == 65
    assert verify_attestation(att, expected_signer=acct.address) is True
    # Bytes32 digest is deterministic from the payload, not the signature.
    assert att.hex_digest == "0x" + att.payload.digest().hex()
    assert len(att.hex_digest) == 66


def test_canonical_bytes_are_stable() -> None:
    acct = Account.create()
    kwargs = _fresh_payload_kwargs()
    nonce = "0x" + "cd" * 32
    a = pack_attestation(
        **kwargs, signer_private_key=acct.key.hex(), nonce=nonce
    )
    b = pack_attestation(
        **kwargs, signer_private_key=acct.key.hex(), nonce=nonce
    )
    assert a.payload.canonical_bytes() == b.payload.canonical_bytes()
    assert a.hex_digest == b.hex_digest
    # But two fresh packs without the explicit nonce must differ.
    fresh1 = pack_attestation(**kwargs, signer_private_key=acct.key.hex())
    fresh2 = pack_attestation(**kwargs, signer_private_key=acct.key.hex())
    assert fresh1.hex_digest != fresh2.hex_digest


def test_verify_rejects_wrong_signer() -> None:
    real = Account.create()
    impostor = Account.create()
    att = _sign_with(real.key.hex())
    assert verify_attestation(att, expected_signer=impostor.address) is False


def test_verify_rejects_tampered_deltas() -> None:
    acct = Account.create()
    att = _sign_with(acct.key.hex(), deltas=[200_000, 100_000, 50_000])
    tampered_payload = replace(att.payload, deltas_scaled=(200_001, 100_000, 50_000))
    tampered = Attestation(
        payload=tampered_payload,
        signature=att.signature,
        signer=att.signer,
        measurement=att.measurement,
        is_real_tee=att.is_real_tee,
    )
    assert verify_attestation(tampered, expected_signer=acct.address) is False


def test_verify_rejects_tampered_holdout() -> None:
    acct = Account.create()
    att = _sign_with(acct.key.hex())
    tampered_payload = replace(att.payload, holdout_digest="0x" + "ff" * 32)
    tampered = Attestation(
        payload=tampered_payload,
        signature=att.signature,
        signer=att.signer,
        measurement=att.measurement,
        is_real_tee=att.is_real_tee,
    )
    assert verify_attestation(tampered, expected_signer=acct.address) is False


def test_verify_rejects_wrong_signature_length() -> None:
    acct = Account.create()
    att = _sign_with(acct.key.hex())
    truncated = Attestation(
        payload=att.payload,
        signature=att.signature[:-1],
        signer=att.signer,
        measurement=att.measurement,
        is_real_tee=att.is_real_tee,
    )
    assert verify_attestation(truncated, expected_signer=acct.address) is False


def test_canonical_payload_rejects_bad_forge() -> None:
    bad = AttestationPayload(
        forge="not-an-address",
        baseline_scaled=0,
        deltas_scaled=(),
        holdout_digest="0x" + "00" * 32,
        nonce="0x" + "00" * 32,
        timestamp=0,
    )
    with pytest.raises(ValueError):
        bad.canonical_bytes()


def test_canonical_payload_rejects_bad_holdout() -> None:
    bad = AttestationPayload(
        forge="0x000000000000000000000000000000000000a38D",
        baseline_scaled=0,
        deltas_scaled=(),
        holdout_digest="not-hex",
        nonce="0x" + "00" * 32,
        timestamp=0,
    )
    with pytest.raises(ValueError):
        bad.canonical_bytes()


def test_fallback_is_labeled() -> None:
    fallback = fallback_attestation(b"score-vector")
    assert fallback.is_real_tee is False
    assert fallback.measurement == "fallback"
    assert fallback.hex_bytes32.startswith("0x")
    assert len(fallback.hex_bytes32) == 66
