import {
  DocsLayout,
  H2,
  H3,
  P,
  Lead,
  Code,
  CodeBlock,
  Callout,
  Table,
  PageNav,
} from "@/components/docs/DocsLayout";
import { Pill } from "@/components/ui/Pill";

export const metadata = {
  title: "0G APAC submission — chain-verifiable proof",
  description:
    "Every contract address, EOA, deployment transaction, npm package, and live URL Foundry Protocol shipped for the 0G APAC hackathon review.",
};

const EXPLORER = "https://chainscan.0g.ai";
const CHAIN_ID = "16661";
const DEPLOY_BLOCK = "33325628";
const DEPLOY_BLOCK_HEX = "0x1fc823c";
const DEPLOY_DATE = "2026-05-15 13:17 UTC";
const COMMIT = "9675b5c";

const DEPLOYER = "0x4f1866324c7F42E175794C864E649ECBAe07CfE8";
const TREASURY = "0x6B130682699955932F4E07aF91581e94920606d7";
const COMPUTE_BROKER = "0xAE64220d1639b0E6F9D78Aa2954a84e8B3f557Cd";
const COMPUTE_PROVIDER = "0xd9966e13a6026Fcca4b13E7ff95c94DE268C471C";

const CONTRACTS = [
  {
    name: "ForgeFactory",
    address: "0x636109264EBF6cFD18CC38bD43eDf9cCad7ae23D",
    tx: "0xe307da04576e3a695aa05d83a60b1f0d82b0029fd5da7ef46b17e96eba5818d0",
    role: "Entry point. createForge(...) spins up a new Forge.",
    main: true,
  },
  {
    name: "Ingot",
    address: "0x39B736f424754d05a0da186d89015b74d1DDe1d3",
    tx: "0x9f29bf63b497767fd7e7c0fcb72b2bc16021a26d54a5606442dd5891ed711c65",
    role: "ERC-721 cap table. Holders earn revenue per share.",
    main: true,
  },
  {
    name: "RevenueSplitter",
    address: "0xC58E0F32BD43e43153D3CA8ee8F25C8198789289",
    tx: "0x813d2ed42e270c8db8fb61c61864149b8aa89e28b91b8bdb6b18deec73778dd4",
    role: "Routes inference payments to Ingot holders.",
    main: false,
  },
  {
    name: "ContributionRegistry",
    address: "0x05235Ba0F2a77bcaB87371E4d797D6830ddC2d86",
    tx: "0xfdd4331b06bf1a089f82e7b52ecacb5e3e27fa9f7ea0693d5fea8f295b75ad46",
    role: "Logs Smith contributions to each Forge.",
    main: false,
  },
  {
    name: "IngotRegistry",
    address: "0xF8f3fAE648A8d7ee4Df0A7b10a0F759938aab7e1",
    tx: "0x40d8df433a7813195989eb2fc9da9a2008b83f9c54ac56377c9ef0fbba5ac48c",
    role: "Canonical directory of all minted Ingots.",
    main: false,
  },
  {
    name: "FORGEToken",
    address: "0xE716B0260f462b2A1789cB6cfCBd825736b920Ca",
    tx: "0xf7d67458f582b366906e93c60c4f222a99685351ab84320ef1299b43b5198450",
    role: "ERC-20 protocol token; denominates Ingot shares.",
    main: false,
  },
];

const LINK_CLASS =
  "text-ember-400 underline decoration-ember-400/40 underline-offset-2 hover:text-ember-300 hover:decoration-ember-300";

function shortAddr(a: string): string {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

const SETUP_CALL = {
  name: "Ingot.setFactory(ForgeFactory)",
  tx: "0x7492e97cbe9f2fb6381b6e1891500953db7e8088083dc93fa67bd758d07b887c",
};

const FOUNDRY_PACKAGES = [
  ["@foundryprotocol/sdk", "Foundry class — viem-based, OpenAI-compatible inference"],
  ["@foundryprotocol/mcp", "MCP server (npx @foundryprotocol/mcp)"],
  ["@foundryprotocol/indexer", "Event indexer for ForgeCreated / IngotMinted / RevenueClaimed"],
  ["@foundryprotocol/design-tokens", "Shared design tokens"],
];

const OGKIT_PACKAGES = [
  ["@foundryprotocol/0gkit-core", "Env validation, network presets, define0GConfig"],
  ["@foundryprotocol/0gkit-chain", "createClient, balance, faucet, explorerUrl"],
  ["@foundryprotocol/0gkit-storage", "0G Storage wrapper — upload, download, computeRoot"],
  ["@foundryprotocol/0gkit-compute", "0G Compute broker + OpenAI-compatible shim"],
  ["@foundryprotocol/0gkit-da", "Data Availability publish / verify"],
  ["@foundryprotocol/0gkit-attestation", "TEE attestation envelopes (EIP-191)"],
  ["@foundryprotocol/0gkit-react", "React hooks for storage / compute / chain"],
  ["@foundryprotocol/0gkit-cli", "0g doctor / 0g dev / 0g traces / 0g cost forecast"],
  ["@foundryprotocol/0gkit-mcp", "0gkit MCP server"],
  ["@foundryprotocol/0gkit-devnet", "Local 0G devnet harness"],
  ["@foundryprotocol/0gkit-playground", "Interactive sandbox"],
  ["@foundryprotocol/0gkit-jobs", "Durable job runner"],
  ["@foundryprotocol/0gkit-testing", "Mocks + fakes for tests"],
  ["@foundryprotocol/0gkit-observability", "OpenTelemetry traces + cost forecast"],
  ["@foundryprotocol/0gkit-indexer", "Reorg-safe event indexer"],
  ["@foundryprotocol/0gkit-contracts", "Typed contract clients"],
  ["create-0gkit-app", "Scaffolder (npx create-0gkit-app)"],
  ["create-0g-app", "Alias scaffolder (npx create-0g-app)"],
];

const toc = [
  { id: "tldr", label: "TL;DR" },
  { id: "network", label: "Network + deploy" },
  { id: "contracts", label: "Deployed contracts" },
  { id: "user-facing", label: "Main user-facing contracts" },
  { id: "agent-id", label: "Agent ID adaptor" },
  { id: "storage", label: "0G Storage" },
  { id: "compute", label: "0G Compute deposit wallet" },
  { id: "eoas", label: "All EOAs" },
  { id: "txs", label: "Deployment transactions" },
  { id: "infra", label: "0G infrastructure" },
  { id: "dapp", label: "Live dApp" },
  { id: "api", label: "API endpoints" },
  { id: "source", label: "Source code" },
  { id: "npm", label: "Published npm packages" },
  { id: "verify", label: "How to verify" },
];

export default function ZeroGApacSubmissionPage() {
  return (
    <DocsLayout
      active="/docs/0g-apac-submission"
      eyebrow="Submission · 0G APAC Hackathon"
      title="Chain-verifiable proof — every contract, EOA, and link Foundry shipped."
      intro={
        <Lead>
          This page is the single source of truth for the 0G APAC hackathon
          data-validation review. Every contract address, deployer EOA, transaction
          hash, npm package, and live URL below is verifiable on{" "}
          <a
            href={EXPLORER}
            target="_blank"
            rel="noreferrer noopener"
            className={LINK_CLASS}
          >
            chainscan.0g.ai
          </a>{" "}
          (chain {CHAIN_ID}) and on npm. We follow our own honesty rule: nothing on
          this page is aspirational.
        </Lead>
      }
      toc={toc}
    >
      <H2 id="tldr">TL;DR</H2>
      <P>
        Foundry Protocol is live on <strong>0G Aristotle mainnet (chain 16661)</strong>.
        Six contracts deployed in block {DEPLOY_BLOCK} on {DEPLOY_DATE}, all
        transactions succeeded. The main user-facing contract is{" "}
        <Code>ForgeFactory</Code> (entry point for creating Forges), and users hold the
        ERC-721 <Code>Ingot</Code> (cap table) when they earn revenue from a model. 0G
        Storage upload proxy and 0G Compute broker integration are wired into the web
        app, with the deposit wallet and on-chain provider listed below.
      </P>
      <H2 id="network">Network + deployment</H2>
      <Table
        head={["Field", "Value"]}
        rows={[
          ["Network", "0G Aristotle Mainnet"],
          [
            "Chain ID",
            <Code key="chain">{CHAIN_ID}</Code>,
          ],
          ["EVM RPC", <Code key="rpc">https://evmrpc.0g.ai</Code>],
          [
            "Block explorer",
            <a
              key="exp"
              href={EXPLORER}
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              {EXPLORER}
            </a>,
          ],
          [
            "Deploy block",
            <a
              key="blk"
              href={`${EXPLORER}/block/${DEPLOY_BLOCK}`}
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              {DEPLOY_BLOCK} ({DEPLOY_BLOCK_HEX})
            </a>,
          ],
          ["Deploy date", DEPLOY_DATE],
          [
            "Source commit",
            <Code key="c">{COMMIT}</Code>,
          ],
          [
            "Deployer EOA",
            <a
              key="d"
              href={`${EXPLORER}/address/${DEPLOYER}`}
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              <Code>{DEPLOYER}</Code>
            </a>,
          ],
        ]}
      />

      <H2 id="contracts">Deployed contracts (mainnet, chain 16661)</H2>
      <P>
        All six contracts below were deployed by Foundry script{" "}
        <Code>contracts/script/Deploy.s.sol</Code> from commit{" "}
        <Code>{COMMIT}</Code>. The deployment artifact is checked in at{" "}
        <a
          href="https://github.com/rajkaria/foundry/blob/main/contracts/deployments/aristotle.json"
          target="_blank"
          rel="noreferrer noopener"
          className={LINK_CLASS}
        >
          <Code>contracts/deployments/aristotle.json</Code>
        </a>
        . Click any address to verify on chainscan.
      </P>
      <Table
        head={["Contract", "Address", "Role"]}
        rows={CONTRACTS.map((c) => [
          <span key={`${c.name}-n`} className="inline-flex items-center gap-2">
            <strong>{c.name}</strong>
            {c.main && (
              <Pill tone="positive" dot>
                user-facing
              </Pill>
            )}
          </span>,
          <a
            key={`${c.name}-a`}
            href={`${EXPLORER}/address/${c.address}`}
            target="_blank"
            rel="noreferrer noopener"
            title={c.address}
            className={LINK_CLASS}
          >
            <Code>{shortAddr(c.address)}</Code>
          </a>,
          <span key={`${c.name}-r`} className="text-platinum-200">
            {c.role}
          </span>,
        ])}
      />

      <H2 id="user-facing">Main user-facing contracts — the ones to count users on</H2>
      <P>
        Two contracts emit the events that map 1:1 to real users:
      </P>
      <Table
        head={["Contract", "Counts as", "Event"]}
        rows={[
          [
            <a
              key="ff"
              href={`${EXPLORER}/address/0x636109264EBF6cFD18CC38bD43eDf9cCad7ae23D`}
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              <strong>ForgeFactory</strong>
            </a>,
            "A user who creates a Forge (founder / collective initiator).",
            <Code key="fc">ForgeCreated(forge, creator, …)</Code>,
          ],
          [
            <a
              key="ing"
              href={`${EXPLORER}/address/0x39B736f424754d05a0da186d89015b74d1DDe1d3`}
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              <strong>Ingot</strong>
            </a>,
            "A user who holds a share in a co-owned model (data / compute / capital Smith).",
            <Code key="im">IngotMinted / ShareMinted</Code>,
          ],
        ]}
      />
      <P>
        The indexer at{" "}
        <a
          href="https://github.com/rajkaria/foundry/blob/main/packages/indexer/src/index.ts"
          target="_blank"
          rel="noreferrer noopener"
          className={LINK_CLASS}
        >
          <Code>packages/indexer/src/index.ts</Code>
        </a>{" "}
        listens to both event ABIs from block 0; the live dashboard at{" "}
        <a
          href="https://foundryprotocol.xyz/dashboard"
          target="_blank"
          rel="noreferrer noopener"
          className={LINK_CLASS}
        >
          foundryprotocol.xyz/dashboard
        </a>{" "}
        renders the same stream.
      </P>

      <H2 id="agent-id">Agent ID adaptor</H2>
      <Callout tone="warn" title="Not deployed yet">
        Foundry's architecture references an Agent ID identity for each Ingot, but{" "}
        <strong>no Agent-ID adapter contract is deployed</strong> on Aristotle today.
        Agent ID is on the post-v1 roadmap; the Ingot ERC-721 currently functions as
        the model identity.
      </Callout>

      <H2 id="storage">0G Storage</H2>
      <Table
        head={["Field", "Value"]}
        rows={[
          [
            "Storage indexer",
            <Code key="i">https://indexer-storage.0g.network</Code>,
          ],
          ["Storage SDK", <Code key="ss">@0gfoundation/0g-storage-ts-sdk ^1.2.9</Code>],
          [
            "Upload signer (EOA)",
            <a
              key="us"
              href={`${EXPLORER}/address/${DEPLOYER}`}
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              <Code>{DEPLOYER}</Code>
            </a>,
          ],
          [
            "Upload proxy",
            <a
              key="up"
              href="https://github.com/rajkaria/foundry/blob/main/apps/web/app/api/storage/upload/route.ts"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              POST /api/storage/upload
            </a>,
          ],
          [
            "Published root hashes",
            "0 today — Ingot.weightsRoot is set when a Forge mints; no Forge has minted yet.",
          ],
        ]}
      />
      <Callout tone="note" title="Honest status">
        Storage integration is fully wired (proxy + SDK + neutral{" "}
        <Code>@foundryprotocol/0gkit-storage</Code> client), but no concrete root hash
        is on-chain yet because no Ingot has been minted. Once the first Forge calls{" "}
        <Code>setWeightsAndGoLive(weightsRoot)</Code>, that root will appear in the{" "}
        <Code>IngotMinted</Code> event on the Ingot contract above.
      </Callout>

      <H2 id="compute">0G Compute deposit wallet</H2>
      <Table
        head={["Field", "Value"]}
        rows={[
          [
            "Deposit wallet (EOA)",
            <a
              key="dep"
              href={`${EXPLORER}/address/${COMPUTE_BROKER}`}
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              <Code>{COMPUTE_BROKER}</Code>
            </a>,
          ],
          [
            "On-chain provider counterparty",
            <a
              key="pro"
              href={`${EXPLORER}/address/${COMPUTE_PROVIDER}`}
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              <Code>{COMPUTE_PROVIDER}</Code>
            </a>,
          ],
          ["Compute SDK", <Code key="cs">@0gfoundation/0g-compute-ts-sdk ^0.8.3</Code>],
          [
            "Broker RPC",
            <Code key="br">https://evmrpc.0g.ai</Code>,
          ],
          [
            "Used by",
            <span key="used">
              <Code>apps/web/lib/zg-compute.ts</Code>,{" "}
              <Code>apps/eval-coordinator/src/index.ts</Code>
            </span>,
          ],
        ]}
      />

      <H2 id="eoas">All EOAs involved</H2>
      <Table
        head={["Role", "Address"]}
        rows={[
          [
            "Deployer + coordinator + storage uploader",
            <a
              key="d1"
              href={`${EXPLORER}/address/${DEPLOYER}`}
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              <Code>{DEPLOYER}</Code>
            </a>,
          ],
          [
            "Treasury (FORGE supply + 2.5% protocol fee)",
            <a
              key="t"
              href={`${EXPLORER}/address/${TREASURY}`}
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              <Code>{TREASURY}</Code>
            </a>,
          ],
          [
            "0G Compute broker (deposit wallet)",
            <a
              key="cb"
              href={`${EXPLORER}/address/${COMPUTE_BROKER}`}
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              <Code>{COMPUTE_BROKER}</Code>
            </a>,
          ],
          [
            "0G Compute provider (on-chain counterparty)",
            <a
              key="cp"
              href={`${EXPLORER}/address/${COMPUTE_PROVIDER}`}
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              <Code>{COMPUTE_PROVIDER}</Code>
            </a>,
          ],
        ]}
      />

      <H2 id="txs">Deployment transactions</H2>
      <P>
        All seven transactions landed in block {DEPLOY_BLOCK} from deployer{" "}
        <Code>{DEPLOYER}</Code>. Every receipt has <Code>status=0x1</Code> (success).
      </P>
      <Table
        head={["Step", "Action", "Tx hash"]}
        rows={[
          ...CONTRACTS.map((c, i) => [
            String(i + 1),
            `Deploy ${c.name}`,
            <a
              key={c.tx}
              href={`${EXPLORER}/tx/${c.tx}`}
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              <Code>
                {c.tx.slice(0, 18)}…{c.tx.slice(-6)}
              </Code>
            </a>,
          ]),
          [
            "7",
            SETUP_CALL.name,
            <a
              key={SETUP_CALL.tx}
              href={`${EXPLORER}/tx/${SETUP_CALL.tx}`}
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              <Code>
                {SETUP_CALL.tx.slice(0, 18)}…{SETUP_CALL.tx.slice(-6)}
              </Code>
            </a>,
          ],
        ]}
      />

      <H2 id="infra">0G infrastructure used</H2>
      <Table
        head={["Layer", "Endpoint / package"]}
        rows={[
          ["0G Chain (EVM L1)", <Code key="ec">https://evmrpc.0g.ai</Code>],
          ["0G Storage", <Code key="es">https://indexer-storage.0g.network</Code>],
          [
            "0G Storage SDK",
            <Code key="ess">@0gfoundation/0g-storage-ts-sdk ^1.2.9</Code>,
          ],
          [
            "0G Compute SDK",
            <Code key="ecs">@0gfoundation/0g-compute-ts-sdk ^0.8.3</Code>,
          ],
          [
            "0G docs",
            <a
              key="od"
              href="https://docs.0g.ai"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              docs.0g.ai
            </a>,
          ],
        ]}
      />

      <H2 id="dapp">Live dApp</H2>
      <H3 id="dapp-marketing">Marketing &amp; discovery</H3>
      <Table
        head={["Route", "URL"]}
        rows={[
          [
            "Landing",
            <a
              key="land"
              href="https://foundryprotocol.xyz"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              foundryprotocol.xyz
            </a>,
          ],
          [
            "Build on Foundry",
            <a
              key="bof"
              href="https://foundryprotocol.xyz/build-on-foundry"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              foundryprotocol.xyz/build-on-foundry
            </a>,
          ],
          [
            "Ecosystem map",
            <a
              key="eco"
              href="https://foundryprotocol.xyz/ecosystem"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              foundryprotocol.xyz/ecosystem
            </a>,
          ],
          [
            "Judges page",
            <a
              key="j"
              href="https://foundryprotocol.xyz/judges"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              foundryprotocol.xyz/judges
            </a>,
          ],
        ]}
      />

      <H3 id="dapp-live">Live chain state (reads the 6 contracts above)</H3>
      <Table
        head={["Route", "URL"]}
        rows={[
          [
            "Dashboard (event stream)",
            <a
              key="d"
              href="https://foundryprotocol.xyz/dashboard"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              /dashboard
            </a>,
          ],
          [
            "All Forges",
            <a
              key="fs"
              href="https://foundryprotocol.xyz/forges"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              /forges
            </a>,
          ],
          [
            "Create a Forge",
            <a
              key="fn"
              href="https://foundryprotocol.xyz/forges/new"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              /forges/new
            </a>,
          ],
          [
            "All Ingots",
            <a
              key="i"
              href="https://foundryprotocol.xyz/ingots"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              /ingots
            </a>,
          ],
          [
            "All Smiths",
            <a
              key="s"
              href="https://foundryprotocol.xyz/smiths"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              /smiths
            </a>,
          ],
          [
            "Lineage graph",
            <a
              key="l"
              href="https://foundryprotocol.xyz/lineage"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              /lineage
            </a>,
          ],
        ]}
      />

      <H2 id="api">API endpoints</H2>
      <Table
        head={["Endpoint", "Purpose"]}
        rows={[
          [
            <Code key="cc">POST /api/v1/chat/completions</Code>,
            "OpenAI-compatible chat completions, attestation-tagged.",
          ],
          [
            <Code key="ml">GET /api/v1/models</Code>,
            "List of live Foundry Ingots.",
          ],
          [
            <Code key="dr">GET /api/v1/demo/receipt</Code>,
            "Sample TEE attestation + revenue receipt envelope.",
          ],
          [
            <Code key="su">POST /api/storage/upload</Code>,
            "0G Storage upload proxy (browsers can't sign directly).",
          ],
          [
            <Code key="fd">POST /api/forge/draft</Code>,
            "Forge metadata draft (modelSpec + evalSpec).",
          ],
          [
            <Code key="fm">POST /api/forge/manifest</Code>,
            "Pin a Forge manifest to 0G Storage.",
          ],
        ]}
      />
      <P>
        Base URL: <Code>https://foundryprotocol.xyz</Code> (or the dedicated subdomain{" "}
        <Code>https://api.foundryprotocol.xyz</Code>).
      </P>

      <H2 id="source">Source code</H2>
      <Table
        head={["Repo / path", "Link"]}
        rows={[
          [
            "Main monorepo (rajkaria/foundry)",
            <a
              key="repo"
              href="https://github.com/rajkaria/foundry"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              github.com/rajkaria/foundry
            </a>,
          ],
          [
            "Contracts source",
            <a
              key="cs"
              href="https://github.com/rajkaria/foundry/tree/main/contracts/src"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              contracts/src/
            </a>,
          ],
          [
            "Deploy script",
            <a
              key="ds"
              href="https://github.com/rajkaria/foundry/blob/main/contracts/script/Deploy.s.sol"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              contracts/script/Deploy.s.sol
            </a>,
          ],
          [
            "Mainnet deployment artifact",
            <a
              key="da"
              href="https://github.com/rajkaria/foundry/blob/main/contracts/deployments/aristotle.json"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              contracts/deployments/aristotle.json
            </a>,
          ],
          [
            "SDK",
            <a
              key="sdk"
              href="https://github.com/rajkaria/foundry/tree/main/packages/sdk"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              packages/sdk/
            </a>,
          ],
          [
            "MCP server",
            <a
              key="mcp"
              href="https://github.com/rajkaria/foundry/tree/main/packages/mcp-foundry"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              packages/mcp-foundry/
            </a>,
          ],
          [
            "Indexer",
            <a
              key="idx"
              href="https://github.com/rajkaria/foundry/tree/main/packages/indexer"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              packages/indexer/
            </a>,
          ],
          [
            "Web app",
            <a
              key="web"
              href="https://github.com/rajkaria/foundry/tree/main/apps/web"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              apps/web/
            </a>,
          ],
          [
            "Eval coordinator",
            <a
              key="ec"
              href="https://github.com/rajkaria/foundry/tree/main/apps/eval-coordinator"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              apps/eval-coordinator/
            </a>,
          ],
          [
            "Sister toolkit (rajkaria/0gkit)",
            <a
              key="kit"
              href="https://github.com/rajkaria/0gkit"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              github.com/rajkaria/0gkit
            </a>,
          ],
          [
            "0gkit docs",
            <a
              key="kd"
              href="https://docs.0gkit.com"
              target="_blank"
              rel="noreferrer noopener"
              className={LINK_CLASS}
            >
              docs.0gkit.com
            </a>,
          ],
        ]}
      />

      <H2 id="npm">Published npm packages</H2>
      <H3 id="npm-foundry">Foundry SDK &amp; tooling</H3>
      <Table
        head={["Package", "Purpose"]}
        rows={FOUNDRY_PACKAGES.map(([name, role]) => [
          <a
            key={name}
            href={`https://www.npmjs.com/package/${name}`}
            target="_blank"
            rel="noreferrer noopener"
            className={LINK_CLASS}
          >
            <Code>{name}</Code>
          </a>,
          role,
        ])}
      />

      <H3 id="npm-0gkit">0gkit primitives (neutral 0G toolkit)</H3>
      <P>
        Eighteen packages shipped under the <Code>@foundryprotocol/0gkit-*</Code>{" "}
        namespace. Full list searchable on{" "}
        <a
          href="https://www.npmjs.com/search?q=%40foundryprotocol"
          target="_blank"
          rel="noreferrer noopener"
          className={LINK_CLASS}
        >
          npm
        </a>
        .
      </P>
      <Table
        head={["Package", "Purpose"]}
        rows={OGKIT_PACKAGES.map(([name, role]) => [
          <a
            key={name}
            href={`https://www.npmjs.com/package/${name}`}
            target="_blank"
            rel="noreferrer noopener"
            className={LINK_CLASS}
          >
            <Code>{name}</Code>
          </a>,
          role,
        ])}
      />

      <H2 id="verify">How to verify (commands a reviewer can run)</H2>
      <CodeBlock lang="bash">{`# 1. Bytecode exists for every contract (non-empty hex output → success)
for a in 0x636109264EBF6cFD18CC38bD43eDf9cCad7ae23D \\
         0x39B736f424754d05a0da186d89015b74d1DDe1d3 \\
         0xC58E0F32BD43e43153D3CA8ee8F25C8198789289 \\
         0x05235Ba0F2a77bcaB87371E4d797D6830ddC2d86 \\
         0xF8f3fAE648A8d7ee4Df0A7b10a0F759938aab7e1 \\
         0xE716B0260f462b2A1789cB6cfCBd825736b920Ca; do
  echo -n "$a  "; cast code --rpc-url https://evmrpc.0g.ai $a | head -c 12; echo "…"
done

# 2. Hit the OpenAI-compatible inference API
curl https://foundryprotocol.xyz/api/v1/chat/completions \\
  -H "content-type: application/json" \\
  -d '{"messages":[{"role":"user","content":"hello"}]}'

# 3. List live Ingots
curl https://foundryprotocol.xyz/api/v1/models

# 4. Install the SDK + dry-run construct the client
npm i @foundryprotocol/sdk
node -e "import('@foundryprotocol/sdk').then(({Foundry}) => \\
  console.log(new Foundry({contracts:'aristotle'}).contracts))"`}</CodeBlock>

      <PageNav
        prev={{ href: "/docs/0g-hackathon", label: "Integrate Foundry (0G)" }}
        next={{ href: "/docs/real-vs-roadmap", label: "Real vs Roadmap" }}
      />
    </DocsLayout>
  );
}
