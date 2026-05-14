# Foundry — Design System

> Modern, elegant, premium. Built to communicate trust on first contact.

This is the visual and interaction language for everything Foundry ships. The system is **token-first** (every value lives in `packages/design-tokens`), **component-driven**, and **motion-aware** (animation is part of the design, not decoration). All tokens are CSS variables; Tailwind is configured against them.

The reference quality bar is **Linear × Vercel × Cartier**: restraint over decoration, density over whitespace bloat, motion that feels engineered.

---

## 1. Design principles

1. **Restraint over decoration.** A page with one perfect motion beats a page with five competing ones. Negative space is a feature.
2. **Density without clutter.** Foundry is a financial-grade protocol — show data, but rank it ruthlessly. Hero numbers earn their size; everything else is tertiary.
3. **Motion is engineered, never sprinkled.** Every animation has a reason: confirm a state change, draw the eye to new data, reveal a relationship. No looping ambient animation.
4. **Surfaces feel forged.** Subtle metallic gradients, micro-grain, soft inner light on hero artifacts. Never glossy, never glassy, never neon.
5. **One temperature.** The palette has a single warm focal (ember) on a cool, achromatic stage (ink/platinum). No second hue competes.
6. **Accessibility is the baseline, not a layer.** AA contrast everywhere; AAA on body text. Motion respects `prefers-reduced-motion`.

---

## 2. Color

The palette has **three families**: `ink` (cool dark), `platinum` (cool light), `ember` (the focal warm). One semantic chain (`signal`) handles success/warn/danger.

### 2.1 Tokens

All values are CSS variables registered in `packages/design-tokens/src/colors.css` and consumed via Tailwind as `bg-ink-900`, `text-ember-500`, etc.

```css
/* Ink — cool dark, the stage */
--ink-950: #07080a;   /* page background, default */
--ink-900: #0c0e12;   /* card / panel */
--ink-800: #14171d;   /* elevated card */
--ink-700: #1d2129;   /* border on dark */
--ink-600: #2a2f3a;   /* hairline / divider */
--ink-500: #424857;   /* placeholder text on dark */
--ink-400: #6c7384;   /* secondary text on dark */
--ink-300: #8d94a3;   /* tertiary */

/* Platinum — cool light, the type */
--platinum-100: #f3f4f6;  /* body text on dark */
--platinum-200: #e3e5ea;
--platinum-300: #c8ccd4;  /* muted text on dark */
--platinum-400: #a0a6b2;
--platinum-50:  #fafbfc;  /* page bg on light */
--platinum-0:   #ffffff;

/* Ember — the focal warm. Molten metal. */
--ember-300: #ffd9a6;  /* highlight on dark */
--ember-400: #ffb260;  /* hover */
--ember-500: #ff8a1a;  /* primary — the FOUNDRY orange */
--ember-600: #e26a00;  /* pressed */
--ember-700: #a64a00;  /* primary on light */
--ember-900: #4a1f00;  /* deep ember, ambient washes */

/* Signal — single semantic chain */
--signal-positive: #2bd07c;
--signal-warn:     #f5b400;
--signal-danger:   #ff5a5a;
--signal-info:     #6fa7ff;
```

### 2.2 Semantic mappings

Always use semantic names in components; never hard-code palette tokens.

```css
--bg-page:        var(--ink-950);
--bg-surface:     var(--ink-900);
--bg-elevated:    var(--ink-800);
--bg-hairline:    var(--ink-600);
--text-primary:   var(--platinum-100);
--text-secondary: var(--platinum-300);
--text-muted:     var(--ink-400);
--text-accent:    var(--ember-500);
--ring-focus:     var(--ember-400);
```

### 2.3 Usage rules

- **Default theme is dark.** A light theme exists for the docs site only — most surfaces stay dark because the brand is an evening brand.
- **Ember is rationed.** No more than one ember element per viewport unless it's a state cluster (e.g. a list of "active" pills). The CTA is ember; the heading is platinum; the body is platinum-300.
- **Hairlines, not borders.** Dividers are `1px` solid `--bg-hairline` at 60–80% opacity. Avoid heavy borders.
- **Gradients are textural, not chromatic.** A 4% radial wash of ember-900 behind the hero artifact is acceptable. A two-color gradient on a button is not.

### 2.4 Contrast targets

| Combo | Ratio | Required |
|---|---|---|
| platinum-100 on ink-950 | 16.8 : 1 | AAA |
| platinum-300 on ink-950 | 9.4 : 1 | AAA |
| ember-500 on ink-950 | 7.1 : 1 | AAA |
| platinum-400 on ink-950 | 6.0 : 1 | AA (large) |
| ember-300 on ember-900 (ambient) | 4.6 : 1 | AA |

---

## 3. Typography

Two families, no more. We use a refined display serif for moments of impact, and a precise neogrotesque for everything else.

### 3.1 Families

| Role | Family | Weights | License note |
|---|---|---|---|
| **Display** | `PP Editorial New` (Ultralight, Light, Italic) | 200, 300 | Pangram Pangram — purchase for web (~$200). Fallback: Tiempos Headline Light. |
| **Sans** | `Söhne` (Buch, Kräftig) | 400, 500 | Klim — license required. Fallback: `Inter`, then `system-ui`. |
| **Mono** | `JetBrains Mono` | 400, 500 | Free, OFL. For code blocks and contract addresses. |

**Hackathon fallback (week 0):** ship with `EB Garamond` (Google) for display + `Inter` for sans until the licensed faces are purchased. The fallbacks are intentionally good enough that the brand still reads premium.

### 3.2 Scale

A modular 4px scale, type follows a perfect-fourth ratio at the display end, minor-third in the body.

```
display-xxl  72/76   serif  300  -0.02em   "hero only — one per page"
display-xl   56/60   serif  300  -0.02em
display-lg   44/48   serif  300  -0.015em
display-md   36/40   serif  300  -0.01em
display-sm   28/34   serif  300  -0.005em
title-lg     22/28   sans   500  -0.005em
title-md     18/24   sans   500  -0.003em
body-lg      17/28   sans   400   0
body         15/24   sans   400   0
body-sm      13/20   sans   400   0
caption      12/16   sans   500   0.02em   uppercase
mono         13/20   mono   400   0
mono-sm      11/16   mono   400   0
```

### 3.3 Typographic rules

- **Display is rationed.** One display-xxl per page (the hero). One display-lg per major section. No two displays adjacent.
- **Numerals are tabular.** All numeric data (cap tables, dashboard counts, addresses) uses `font-variant-numeric: tabular-nums`.
- **Optical letter-spacing.** Display sizes tighten progressively (see the negative tracking column). Captions widen for label-feel.
- **Truncated addresses.** Wallet addresses display as `0x12ab…cd34` in mono, hover reveals full. Never wrap.
- **Numbers > 999 use locale separators.** "12,438 contributions," not "12438 contributions".
- **No italics in body.** Italic is reserved for the serif display, for emphasis in pull quotes only.

---

## 4. Space, grid, and layout

### 4.1 Spacing scale

A 4px base, exponentially friendly: `0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 56, 80, 120`. Tailwind tokens map 1:1.

### 4.2 Grid

- **Page grid:** 12 columns, max content width 1280px, gutter 24px.
- **App grid:** 12-col on ≥1280, 8-col on 768–1279, 4-col below.
- **Content blocks:** 720px max for prose (docs body), 960px for technical pages with code.

### 4.3 Radius

- Cards / panels: `12px`
- Buttons / inputs: `8px`
- Tags / pills: `999px`
- Modal sheets: `16px`
- The Ingot mark and decorative hero shapes: custom

### 4.4 Elevation

We have **two** elevations, period. Anything more elaborate is decoration.

```css
--elev-1: 0 1px 0 0 rgb(255 255 255 / 0.04) inset,
          0 0 0 1px rgb(255 255 255 / 0.04);

--elev-2: 0 1px 0 0 rgb(255 255 255 / 0.06) inset,
          0 0 0 1px rgb(255 255 255 / 0.06),
          0 24px 48px -16px rgb(0 0 0 / 0.6);
```

Elev-1 is the default card. Elev-2 is reserved for modals, the hero artifact, and the active state of the Forge card.

### 4.5 Hairlines

```css
--hairline: 1px solid color-mix(in oklab, var(--bg-hairline) 80%, transparent);
```

All dividers, table rules, and panel borders use `--hairline`. Heavy 2px borders are forbidden except on focused inputs.

---

## 5. Components

The component library lives in `apps/web/components/ui/`. It is *not* shadcn out-of-the-box — it is custom-built on Radix primitives so visual quality is non-negotiable.

### 5.1 Buttons

| Variant | When | Style |
|---|---|---|
| `primary` | Single CTA on a screen | Ember-500 fill, ink-950 text, weight 500, 40px height |
| `secondary` | Supporting action | Transparent fill, platinum-100 text, hairline border |
| `ghost` | Tertiary action | Transparent, text-only with hover state |
| `destructive` | Irreversible, rare | Signal-danger border + text, ink fill |

**Interaction states (always):**
- Hover: 100ms ease-out, brightness shift only (no scale, no shadow)
- Focus-visible: 2px ember-400 ring offset 2px
- Active: 80ms inward press, brightness -4%
- Disabled: opacity 0.38, no pointer events

### 5.2 Cards

`card` is the workhorse surface — every Forge, Ingot, Smith, dashboard tile is a card.

```
ink-900 fill · hairline border · elev-1 · 24px padding · 12px radius
hover: brightness +2%, hairline brightens to platinum-400 at 20% opacity, 180ms
```

The card has named regions: `<Card.Eyebrow>`, `<Card.Title>`, `<Card.Body>`, `<Card.Stats>`, `<Card.Footer>`. Hero stats inside cards use `display-sm` with `font-variant-numeric: tabular-nums`.

### 5.3 Data table

Tables are the second-most-important pattern after cards. Used for cap tables, contribution lists, dashboard logs.

- Header: caption-style, platinum-400, sticky on scroll
- Row: 56px height, hairline dividers
- First column: identity (wallet truncation, name)
- Numeric columns: right-aligned, tabular-nums
- Hover: row background shifts to ink-800
- Row link: entire row clickable; cursor changes; right-side `›` chevron appears on hover

### 5.4 Forms

- Inputs: 44px height, ink-800 fill, hairline border, 8px radius, 15px sans
- Focus: hairline → ember-400, no glow
- Labels: caption uppercase, platinum-400, 6px below caption
- Helper text: body-sm, platinum-300
- Errors: signal-danger underline + helper text, no banner

### 5.5 Stat tile

Used in the Forge in Public dashboard.

```
Caption (eyebrow)         — caption · platinum-400
Hero number                — display-md · tabular-nums · platinum-100
Delta vs. last 7d          — body-sm · signal-positive or signal-danger
Sparkline                  — 64px tall, ember-500 stroke 1.5px, no fill
```

### 5.6 Pills & badges

- Forge state pill: `OPEN` `EVALUATING` `MINTING` `TRAINING` `LIVE` — each gets a single color + the `state-dot` pattern (4px circle leading the label)
- Smith type chip: `data` `compute` `capital` — outline only, no fill
- "Real vs. Roadmap" pill: ✅ Real (signal-positive) / 🔜 Roadmap (signal-warn)

### 5.7 The Ingot card (custom)

The flagship component. Each Ingot has a hero card on its detail page and a compact card in lists.

The hero card features the **metal-pour animation** (see §6.2), the cap-table preview (top 3 holders + count), live revenue, lineage thumbnail (mini graph), and a single primary CTA (`Run inference`).

### 5.8 The Lineage Graph (custom)

Force-directed graph of all Ingots. Nodes are Ingot mini-cards (mark + name + share count). Edges are lineage relationships. Hover a node → highlight subtree + dim the rest. Click → route to Ingot detail.

Library: `d3-force` for layout, `@react-spring/web` for node animations. Renders to SVG (not Canvas) so it's screenshot-ready.

---

## 6. Motion

Motion is part of the brand. Every animation answers a question: "what just changed?"

### 6.1 Motion library

- **Engine:** `motion` (the modern Framer Motion fork)
- **Easing tokens:** four curves, full stop
  - `--ease-standard`: `cubic-bezier(0.32, 0.72, 0, 1)` — UI motion default
  - `--ease-decel`: `cubic-bezier(0.2, 0.9, 0.3, 1)` — entering
  - `--ease-accel`: `cubic-bezier(0.6, 0, 1, 0.4)` — exiting
  - `--ease-springy`: motion's `spring({ stiffness: 240, damping: 28 })` — for the metal pour and TEE reveal
- **Duration tokens:**
  - `--dur-instant`: 80ms (press)
  - `--dur-quick`: 180ms (hover, secondary state)
  - `--dur-base`: 320ms (route segments, card reveals)
  - `--dur-slow`: 560ms (hero ingredient reveals)
  - `--dur-statement`: 1200ms (the metal pour, the lineage assemble)

### 6.2 Signature animations

These are the **brand moments**. They appear in the demo video and on the landing page.

**Metal Pour** — landing hero
The Ingot mark assembles by molten metal "pouring" from offscreen-top into the ingot silhouette: a small ember-500 stroke draws the outline, then a downward-filling ember-700 → ember-500 gradient fills inside-out, ending with a 220ms platinum-100 specular highlight sweep. Total duration 1.4s, `--ease-springy`. Triggered once on load; never on subsequent route changes. On `prefers-reduced-motion`, the mark fades in over 320ms.

**Attribution Bloom** — eval/Ingot pages
When the TEE eval result arrives, each contribution's marginal Δ animates into a horizontal bar from 0 → measured value over 420ms staggered 60ms per contribution. As bars fill, the share-of-Ingot percentage counts up via tabular-nums, and a soft ember halo pulses at each share's final position. This is the **"shares minting from deltas"** moment — the demo wow.

**Lineage Assemble** — lineage graph mount
The graph starts with all nodes converged at the center; edges materialize first (1px ember stroke fading in), then nodes spring outward to their force-directed positions over 800ms with 30ms per-node stagger. Looks like an alchemy diagram condensing.

**Live Counter Tick** — dashboard
When a real on-chain event updates a dashboard stat (new contribution, new mint, new revenue claim), the number animates with a 320ms count-up + a 1px ember bottom underline pulse. Implement as a websocket-driven counter so the dashboard *literally moves* while a judge watches.

**Route transitions**
Default page transitions are subtle: fade-through over 220ms (`--dur-quick`, `--ease-standard`) with a 4px Y translate. App routes share the same shell; only content swaps.

### 6.3 Motion principles

- **Reversible.** Every exit reverses its entrance.
- **Direction = causality.** Things that come from where the action originated. (A new contribution row animates *down* from where the user clicked submit.)
- **No loop animations on the page.** Background ambient motion is forbidden — it competes with data.
- **`prefers-reduced-motion`:** all `--dur-statement` animations degrade to fades; all `--dur-base` and below remain but with motion reduced (no Y/X translate, only opacity).

---

## 7. Iconography & illustration

### 7.1 Icons

- **Library:** `lucide-react` (deduplicated set)
- **Weight:** 1.5px stroke, never filled
- **Sizes:** 16, 20, 24 only
- **Color:** inherits `currentColor`; never colored independently
- **Custom icons:** Ingot, Forge, Smith, Lineage — drawn to match Lucide's stroke language

### 7.2 Illustration

- **Style:** geometric, abstract, monochromatic-with-ember-accent
- **Use:** sparingly — empty states, docs section openers, OG cards
- **Forbidden:** stock 3D, isometric clip-art, robot faces, hand drawings, "AI art" aesthetic

### 7.3 The Foundry mark animated
The full SVG of the mark + the Metal Pour animation lives in `packages/design-tokens/marks/`. Reused as the favicon (animated favicon on tab focus), the deck title-slide, the X profile picture (still frame), and the video intro.

---

## 8. The OG card system

Every Forge, Ingot, and Smith page auto-generates a beautiful 1200×630 OG image. Generated at request time via Next.js `ImageResponse`.

Layout:
- Top-left: Foundry mark, 64px
- Top-right: caption ("FORGE" / "INGOT" / "SMITH"), platinum-400
- Center: the artifact's hero text (Forge name, Ingot title, Smith handle), display-lg
- Lower-center: 2–3 key stats in tabular-nums (e.g. "12 Smiths · 0.47 ETH · LIVE")
- Bottom strip: foundryprotocol.xyz, platinum-300

This is the share-on-Twitter unlock — every page becomes a beautiful, branded share artifact for free.

---

## 9. Accessibility

- **Color contrast:** AA minimum (4.5:1), AAA on body (7:1). Tested in CI via `pa11y`.
- **Focus visible:** every interactive element has a visible focus state; ember-400 ring at 2px offset.
- **Keyboard:** every interaction is keyboard-reachable. Modal traps focus.
- **`prefers-reduced-motion`:** see §6.3.
- **`prefers-color-scheme`:** dark default; light theme available on docs only.
- **Semantic HTML:** headings ordered (h1 → h2 → h3, no skips). Tables for tabular data, not divs.
- **Alt text:** every illustrative image has descriptive alt. The Ingot mark is decorative on landing (`alt=""`), informative in headers (`alt="Foundry"`).

---

## 10. Implementation

### 10.1 File layout

```
packages/design-tokens/
├── src/
│   ├── colors.css         # palette + semantic
│   ├── type.css           # @font-face + scale
│   ├── motion.css         # easings + durations
│   ├── space.css          # spacing scale
│   ├── tokens.ts          # JS export of all tokens (for motion + ImageResponse)
│   └── index.css          # barrel
└── package.json

apps/web/
├── app/
│   ├── globals.css        # imports design-tokens/index.css
│   └── ...
├── components/
│   ├── ui/                # primitives (Button, Card, Input, …)
│   ├── marketing/         # landing-only components
│   └── app/               # in-app components (ForgeCard, IngotCard, LineageGraph)
└── tailwind.config.ts     # consumes tokens
```

### 10.2 Tailwind

Tailwind 4 with `@theme` directive consuming CSS variables — no `tailwind.config.ts` colors duplicated; the variables are the source of truth. `tailwind-merge` for safe class composition.

### 10.3 Storybook (light)

Not full Storybook — a single `/_design` route in the web app shows every component in every state. Used for visual QA. Hidden from production navigation.

### 10.4 Lint

- `stylelint` with custom rule: forbid color hex codes outside `packages/design-tokens`. All color in components must be a token.
- ESLint rule: forbid raw `framer-motion`/`motion` imports outside `components/motion/`; all animation primitives are re-exported.

---

## 11. Brand-design integration checklist

- [ ] Tokens installed and consumed via Tailwind 4 `@theme`
- [ ] Display + sans fonts loading via `next/font` with `swap`
- [ ] Logo mark SVG in `packages/design-tokens/marks/` (mark, wordmark, full lockup, animated)
- [ ] OG card template renders correctly for `/`, `/forges/[id]`, `/ingots/[id]`, `/smiths/[address]`
- [ ] Motion primitives wrapped in `components/motion/` with reduced-motion handling
- [ ] `/_design` route ships with every UI component visible
- [ ] CI lints colors and motion imports
- [ ] Lighthouse mobile ≥ 95 (perf + a11y + best-practices); SEO ≥ 95 on landing
