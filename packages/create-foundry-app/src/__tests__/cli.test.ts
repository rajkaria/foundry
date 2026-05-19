import { describe, it, expect } from "vitest";
import { parseArgs } from "../cli.js";

describe("parseArgs", () => {
  it("defaults to current dir, interactive", () => {
    const c = parseArgs([]);
    expect(c).toEqual({ dir: ".", demo: false, yes: false });
  });

  it("takes the first positional as the target dir", () => {
    expect(parseArgs(["my-app"]).dir).toBe("my-app");
    expect(parseArgs(["--yes", "my-app"]).dir).toBe("my-app");
  });

  it("parses --archetype/--network in space and = forms", () => {
    expect(parseArgs(["--archetype", "B", "--network", "galileo"])).toMatchObject({
      archetype: "B",
      network: "galileo",
    });
    expect(parseArgs(["--archetype=C", "--network=local"])).toMatchObject({
      archetype: "C",
      network: "local",
    });
  });

  it("--demo forces demo archetype, galileo, non-interactive", () => {
    const c = parseArgs(["my-demo", "--demo"]);
    expect(c).toMatchObject({
      dir: "my-demo",
      archetype: "demo",
      network: "galileo",
      yes: true,
    });
  });

  it("--demo respects an explicit --network override", () => {
    expect(parseArgs(["--demo", "--network", "aristotle"]).network).toBe("aristotle");
  });

  it("-y is an alias for --yes", () => {
    expect(parseArgs(["-y"]).yes).toBe(true);
  });
});
