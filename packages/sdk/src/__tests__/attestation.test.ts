import { describe, it, expect } from "vitest";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  digestEnvelope,
  signEnvelope,
  recoverEnvelopeSigner,
  verifyEnvelope,
  type AttestationEnvelope,
} from "../attestation.js";

function makeEnv(overrides: Partial<AttestationEnvelope> = {}): AttestationEnvelope {
  return {
    kind: "foundry/eval-result/v1",
    forge: "0xdEAD000000000000000000000000000000000123",
    scores: [0.42, 0.18, 0.0],
    baseline: 0.5,
    teeAttestation: ("0x" + "ab".repeat(32)) as `0x${string}`,
    coordinator: "0xCAFE000000000000000000000000000000000456",
    timestamp: 1747200000,
    ...overrides,
  };
}

describe("attestation envelope", () => {
  it("digest is deterministic + order-insensitive over object keys", () => {
    const a = makeEnv();
    const b = makeEnv();
    // shuffle key order via re-construction
    const reordered: AttestationEnvelope = {
      timestamp: b.timestamp,
      teeAttestation: b.teeAttestation,
      scores: b.scores,
      forge: b.forge,
      coordinator: b.coordinator,
      baseline: b.baseline,
      kind: b.kind,
    };
    expect(digestEnvelope(a)).toBe(digestEnvelope(reordered));
  });

  it("digest changes when scores change", () => {
    const a = makeEnv();
    const b = makeEnv({ scores: [0.0, 0.18, 0.0] });
    expect(digestEnvelope(a)).not.toBe(digestEnvelope(b));
  });

  it("signEnvelope → recover round-trips", async () => {
    const pk = generatePrivateKey();
    const account = privateKeyToAccount(pk);
    const env = makeEnv({ coordinator: account.address });
    const signed = await signEnvelope(env, pk);
    const recovered = await recoverEnvelopeSigner(signed);
    expect(recovered.toLowerCase()).toBe(account.address.toLowerCase());
  });

  it("verifyEnvelope succeeds for matching coordinator", async () => {
    const pk = generatePrivateKey();
    const account = privateKeyToAccount(pk);
    const env = makeEnv({ coordinator: account.address });
    const signed = await signEnvelope(env, pk);
    await expect(verifyEnvelope(signed, account.address)).resolves.toBeDefined();
  });

  it("verifyEnvelope throws on coordinator mismatch", async () => {
    const pk = generatePrivateKey();
    const env = makeEnv();
    const signed = await signEnvelope(env, pk);
    await expect(
      verifyEnvelope(signed, "0x0000000000000000000000000000000000000001")
    ).rejects.toThrow(/signer mismatch/);
  });

  it("verifyEnvelope throws on digest mismatch", async () => {
    const pk = generatePrivateKey();
    const account = privateKeyToAccount(pk);
    const env = makeEnv({ coordinator: account.address });
    const signed = await signEnvelope(env, pk);
    const tampered = { ...signed, envelope: { ...signed.envelope, baseline: 0.99 } };
    await expect(verifyEnvelope(tampered, account.address)).rejects.toThrow(/digest mismatch/);
  });
});
