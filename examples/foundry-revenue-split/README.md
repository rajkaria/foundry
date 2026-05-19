# foundry-revenue-split

Read claimable revenue for an Ingot you co-own and claim it.

> **Foundry (revenue) recipe.** Opts you into the Foundry revenue layer — not
> the default. For the neutral path see
> [`../inference-quickstart`](../inference-quickstart).

```bash
npm install
cp .env.example .env   # paste the co-owner key + tokenId
npm start
```

Revenue accrues to Ingot holders as buyers run inference. This reads your
claimable balance and, if non-zero, claims it through the RevenueSplitter.
