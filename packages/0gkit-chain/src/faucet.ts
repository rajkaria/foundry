import {
  ConfigError,
  NetworkError,
  type NetworkPreset,
  type Receipt,
} from "@0gkit/core";

/**
 * Request testnet funds. If the preset has a programmatic `faucetUrl`, POST
 * `{ address }` to it. Otherwise throw a ConfigError whose hint points the
 * user at the human faucet page (no silent failure, no guessed endpoint).
 */
export async function faucet(
  network: NetworkPreset,
  address: `0x${string}` | string
): Promise<Receipt> {
  if (!network.faucetUrl) {
    const where = network.faucetWebUrl
      ? `Visit ${network.faucetWebUrl} and request funds for ${address}.`
      : `No faucet is configured for '${network.name}'. See ` +
        `docs/superpowers/DECISIONS.md (D2) for the verified 0G faucet.`;
    throw new ConfigError(
      `No programmatic faucet endpoint for network '${network.name}'.`,
      where
    );
  }

  const startedAt = Date.now();
  let res: Response;
  try {
    res = await fetch(network.faucetUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ address }),
    });
  } catch (err) {
    throw new NetworkError(
      `Faucet request failed: ${(err as Error).message}`,
      network.faucetWebUrl
        ? `Try the web faucet: ${network.faucetWebUrl}`
        : `Check connectivity and retry.`
    );
  }

  if (!res.ok) {
    throw new NetworkError(
      `Faucet returned HTTP ${res.status}.`,
      network.faucetWebUrl
        ? `Try the web faucet: ${network.faucetWebUrl}`
        : `Retry later; testnet faucets rate-limit per address/IP.`
    );
  }

  const body = (await res.json().catch(() => ({}))) as { txHash?: string };
  return { txHash: body.txHash, latencyMs: Date.now() - startedAt };
}
