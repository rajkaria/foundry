import { test, expect } from "@playwright/test";

/**
 * Golden path (spec §11.7 acceptance): the console loads, attestation verify
 * runs live in-browser against the prefilled valid sample, and copy-code
 * works for all four forms across all three actions.
 */

const MARKERS: Record<string, Record<string, RegExp>> = {
  upload: {
    cli: /@0gkit\/cli storage put/,
    ts: /from "@0gkit\/storage"/,
    curl: /no stable public REST endpoint/,
    mcp: /"og_storage_put"/,
  },
  infer: {
    cli: /@0gkit\/cli infer/,
    ts: /from "@0gkit\/compute"/,
    curl: /\/v1\/chat\/completions/,
    mcp: /"og_infer"/,
  },
  attest: {
    cli: /@0gkit\/cli attest verify/,
    ts: /from "@0gkit\/attestation"/,
    curl: /local \+ offline/,
    mcp: /"og_attest_verify"/,
  },
};

test("golden path: console renders, verify runs live, copy-code in all 4 forms", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "0gkit playground" })).toBeVisible();

  // Attestation verify runs live (pure crypto, no key/network).
  await page.getByTestId("run-attest").click();
  await expect(page.getByTestId("attest-result")).toContainText("verified ✓");

  // Copy-code: every action × every form renders the right snippet and copies.
  for (const action of ["upload", "infer", "attest"] as const) {
    for (const form of ["cli", "ts", "curl", "mcp"] as const) {
      await page.getByTestId(`tab-${action}-${form}`).click();
      await expect(page.getByTestId(`code-${action}`)).toContainText(
        MARKERS[action][form]
      );
      await page.getByTestId(`copy-${action}`).click();
      await expect(page.getByTestId(`copy-${action}`)).toHaveText("Copied");
    }
  }
});
