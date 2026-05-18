import { describe, it, expect } from "vitest";
import {
  ZeroGError,
  ConfigError,
  NetworkError,
  ChainError,
  AttestationError,
} from "../errors.js";

describe("ZeroGError taxonomy", () => {
  it("ConfigError carries code, message, hint and is a ZeroGError", () => {
    const e = new ConfigError("RPC_ARISTOTLE is not set", "Set RPC_ARISTOTLE in .env");
    expect(e).toBeInstanceOf(ZeroGError);
    expect(e).toBeInstanceOf(Error);
    expect(e.code).toBe("CONFIG");
    expect(e.name).toBe("ConfigError");
    expect(e.message).toBe("RPC_ARISTOTLE is not set");
    expect(e.hint).toBe("Set RPC_ARISTOTLE in .env");
  });

  it("each subclass has the right code", () => {
    expect(new NetworkError("x", "y").code).toBe("NETWORK");
    expect(new ChainError("x", "y").code).toBe("CHAIN");
    expect(new AttestationError("x", "y").code).toBe("ATTESTATION");
  });

  it("subclasses are catchable as ZeroGError", () => {
    try {
      throw new NetworkError("unreachable", "run `0g doctor`");
    } catch (err) {
      expect(err).toBeInstanceOf(ZeroGError);
      if (err instanceof ZeroGError) expect(err.hint).toBe("run `0g doctor`");
    }
  });
});
