# Desktop tokens (Claude Desktop 5.11492.5.0)

All values CODE: read from the main stylesheet a Desktop bundle file with scripts/cssvars.mjs (kept in the source repository, not shipped) and resolved with scripts/tokens.mjs (kept in the source repository, not shipped). Full table: data/desktop-tokens-5.11492.tsv (kept in the source repository, not shipped). A mod never writes these; it writes steps, roles and theme keys, and the engine emits `var(--cds-…)`. Use this file to understand what a step or key becomes and to compare a screenshot with the native look.

## How the tokens are layered

| Layer | Selector | What it sets |
|---|---|---|
| Palette | `:where(:root,:host)` | raw scales (`--cds-gray-*`, blue, red…) |
| Roles, compact sizes | `.cds-root` | every `--cds-*` role, sizes for the default density |
| Dark | `[data-mode=dark] .cds-root…`, and the same under `prefers-color-scheme:dark` for `data-mode=system` | re-points roles |
| Comfortable density | `.cds-root[data-density=comfortable]` | larger sizes |
| Size scopes | `.cds-root [data-size=xs|sm|lg]`, `[data-step="1".."5"]` | the `--xs/--sm/--lg` variants |
| Second color layer | `[data-cds-fizzy-lake~=color]` | re-points most colors to a neutral-gray set |
| Inactive window | `.cds-root[data-window-active=false]` | accent turns gray |

Two switches change the px and hex a screenshot shows. Both are settled (evidence in `harness-measurements.md`):

- **Density: comfortable.** The app document ships `data-density="comfortable"`, the root component falls back to it, the old user override is a retired storage key, and nothing sets the attribute (CODE). Two owner screenshots measure comfortable (OBS). Read the **second** figure of every `compact | comfortable` pair. The 4.16336 notes assumed compact and were wrong on this.
- **Second color layer: on.** `data-cds-fizzy-lake="color panels type"` is on unless the page is a `/mobile/` path, an embedded context or a non-Electron `Claude/` user agent; no flag is read (CODE). The owner shots show its accent and its 5% black fills (OBS). Read the "second layer" color table first; the base table is what the CSS falls back to.
- **Pointer block.** Under `@media (hover:hover) and (pointer:fine)` the root lowers control heights. scripts/tokens.mjs (kept in the source repository, not shipped) and the TSV do not apply media blocks, so they hold the touch values. With a mouse, compact | comfortable: `--cds-h-control` 24 | **28**; `--xs` 20 | 24; `--sm` 20 | 28; `--lg` 28 | 40; `--cds-button-pad-max` 8 | 9; `--cds-toolbar-icon-box` 0 | 28 (HARNESS, read from the live CSSOM).

None of this changes what a mod writes. It matters when you compare a mod's pixel to a native pixel.

`--cds-rem-scale` is 16/17 only on Apple system fonts; on Windows it is 1, so 1 rem = 16 px.

## Sizes (compact | comfortable)

| Token | px | Mod prop that uses it |
|---|---|---|
| `--cds-pad-xs sm md lg xl` | 4 6 8 12 20 \| 6 8 12 16 24 | `padding*` steps; bordered Box padding (`md lg`) |
| `--cds-gap-xs sm md lg xl` | 6 8 12 20 32 \| 8 12 16 28 40 | `gap`, `margin*` steps |
| `--cds-radius` | 6 \| 8 | Button, Input, bordered Box; `round` adds 4 (card radius 10 \| 12) |
| `--cds-h-control` | 24 \| 28 with a mouse (32 on touch) | Button, Input, Select height |
| `--cds-h-control--sm` | 20 \| 28 | controls on the AbovePrompt band |
| `--cds-h-control--xs`, `--lg` | 20 \| 24, 28 \| 40 | native only |
| `--cds-h-control-nested` | 18 \| 22 | native buttons inside a field, counters |
| `--cds-icon` | 16 \| 20 | native icons (`--sm`/`--xs` 12 \| 16) |
| `--cds-checkbox`, `--cds-switch-h` | 16 \| 20 | native only |

## Type (compact | comfortable)

| Role | Size px | Line px | Notes |
|---|---|---|---|
| caption | 11 \| 12 | 17 \| 17 | |
| footnote | 12 \| 13 | 15 \| 17 | 16 when `data-font=system` |
| code | 12 \| 13 | 17 \| 19 | mono |
| body | 13 \| 14 | 19 \| 20 | default for mod text and controls |
| body `--sm` | 12 \| 14 | 17 \| 20 | band controls |
| prose | 14 \| 16 | 20 \| 24 | assistant text |
| heading | 14 \| 15 | 18 \| 20 | |
| title | 20 \| 22 | 25 \| 28 | display face in a mod `Text size="title"` |

Weights: regular 400, medium 500, semibold 580, bold 600 (a mod's `bold` is read as semibold, 580). Font: `--cds-font-sans` (Anthropic Sans, system fallback), `--cds-font-mono`.

## Motion, opacity, layers

| Token | Value |
|---|---|
| `--cds-dur-fast` | 60 ms (hover, focus color) |
| `--cds-dur-snap` | 120 ms (tooltip, checkbox, knob) |
| `--cds-dur-base` | 200 ms (dialog, toast, collapsible) |
| `--cds-dur-sheet` / `--cds-dur-slow` | 300 ms / 450 ms |
| `--cds-ease-out` | `cubic-bezier(.165,.84,.44,1)` |
| `--cds-ease-snap` | `cubic-bezier(.32,.72,0,1)` |
| `--cds-ease-overshoot` | `cubic-bezier(.34,1.3,.64,1)` |
| `--cds-opacity-disabled` | .4 |
| `--cds-cursor-interactive` | `pointer` in the stylesheet, **`default` on the desktop platform** (`.cds-root[data-platform=desktop]`): native controls keep the arrow cursor |
| z | coachmark 35, modal 40, popover 50, tooltip 50, toast 60 |

Mod Buttons transition at `dur-fast ease-out`; reduced motion removes it.

## Colors (base layer: light | dark)

`a N%` means the ink (`#0b0b0b` light, `#fff` dark) at that alpha.

| Token | Light | Dark |
|---|---|---|
| `text-primary` | `#0b0b0b` | `#f0efec` |
| `text-secondary` | `#52514e` | `#c3c2b7` |
| `text-muted` | `#898781` | `#898781` |
| `text-disabled` | a 35% | a 35% |
| `text-accent` | `#184f95` | `#6da7ec` |
| `text-danger` | `#8e2626` | `#ec7e7e` |
| `text-success` | `#006300` | `#0ca30c` |
| `text-warning` | `#734500` | `#db9300` |
| `text-pro` | `#4a3aa7` | `#a096eb` |
| `fill-primary` / hover | `#0b0b0b` / `#2c2c2a` | `#fff` / `#e1e0d9` |
| `on-primary` | `#fff` | `#0b0b0b` |
| `fill-secondary` / hover | `#ffffff1a` / a 5% | a 10% / a 14% |
| `fill-secondary-ring` | a 10% | transparent |
| `fill-ghost-hover` / selected | a 5% / a 10% | a 7.5% / a 15% |
| `fill-field` | `#ffffff80` | a 5% |
| `fill-field-ring` | a 10% | a 10% |
| `fill-accent` / hover | `#2a78d6` / `#3987e5` | same |
| `fill-brand` / hover | `#c6613f` / `#d97757` | same |
| `fill-warning` / hover | `#fab219` / `#eda100` | same |
| `fill-danger` / hover | `#d03b3b` / `#e34948` | same |
| `fill-success` | `#009300` | same |
| `bg-accent` | `#cde2fb` | `#032042` |
| `bg-neutral` / hover | a 5% / a 10% | a 5% / a 10% |
| `border` | a 10% | a 10% |
| `border-strong` / stronger | a 20% / a 40% | a 20% / a 40% |
| `page-bg`, `surface-0` | `#f9f9f7` | `#0b0b0b` |
| `surface-1` | `#fcfcfb` | `#151515` |
| `surface-2`, `surface-panel` | `#fff` | `#1a1a19` |
| `surface-3`, `surface-popover` | `#fff` | `#20201f` (base; the layer Desktop ships: `surface-3` `#1f1f1f`, `surface-popover` `#303030`) |
| `tooltip-bg` / `tooltip-fg` | `#0b0b0b` / `#fff` | `#20201f` / `#f0efec` (base; the layer's dark `tooltip-bg` is `#303030`, from the TSV) |
| `backdrop` | `#0006` | `#00000080` |
| `chart-categorical-1..8` | `#2a78d6 #eb6834 #1baf7a #eda100 #e87ba4 #008300 #6250d6 #e34948` | `#3987e5 #d95926 #199e70 #c98500 #d55181 #008300 #9085e9 #e66767` |
| `chart-reference` | `#898781` | `#97958d` |
| `shadow-popover` | `0 8px 24px #0000001f, 0 2px 6px #00000014` | `0 8px 24px #00000052, 0 2px 6px #0003` |
| ring | outer 1 px, inner 0 | inner 1 px, outer 0 |
| `focus-shadow` | `inset 0 0 0 1px page-bg, 0 0 0 1px #2a78d6, 0 0 6px 1px #cde2fb` | same shape, glow `#184f95` at 60% |

The native session panel's Context legend uses `chart-categorical-1` (Messages), `-2` (System tools), `-3` (MCP tools) and `chart-reference` (Other). The usage meters use `fill-accent`, `fill-warning`, `fill-danger`.

## Colors, second layer (`data-cds-fizzy-lake~=color`; this is what Desktop shows)

| Token | Light | Dark |
|---|---|---|
| `text-primary` | `#000000e6` | `#ffffffed` |
| `text-secondary` | `#0009` | `#ffffff91` |
| `text-muted` | `#0007` | `#fff6` |
| `text-accent` | `#1757ac` | `#6aabf1` |
| `text-danger` | `#a42528` | `#f17778` |
| `text-success` | `#006c10` | `#53c556` |
| `text-warning` | `#895902` | `#e49c06` |
| `fill-primary` / hover | `#191919` / `#3c3c3c` | `#efefef` / `#d7d7d7` |
| `fill-secondary` / hover | `#0000000d` / `#00000013` | `#ffffff26` / `#ffffff37` |
| `fill-ghost-hover` / selected | `#0000000d` / `#0000001a` | `#ffffff13` / `#ffffff26` |
| `fill-accent` / hover | `#257de0` / `#2171ca` | same |
| `fill-warning` | `#fbb315` | same |
| `fill-danger` | `#c83839` | `#dc3c3d` |
| `fill-success` | `#10a122` | same |
| `border` | `#00000014` | `#ffffff0a` |
| `page-bg` | `#f9f9f9` | (base) |
| `surface-1 / 2 / 3 / popover` | `#fff` | `#191919 / #1f1f1f / #1f1f1f / #303030` |
| `chart-categorical-1..3` | `#257de0 #f47230 #00b894` | `#338ced #e76624 #00a888` |
| `chart-reference` | `#878787` | `#959595` |

**Inside a pane the surfaces collapse** (CODE, main stylesheet @1857301, color layer): under `.cds-pane-ground` or a contained native `Panel`, `--cds-surface-2`, `--cds-surface-3` and `--cds-surface-panel` are all set to `--cds-surface-1`. The frame's panes carry that class (`cds-pane-ground … bg-surface-2` in the frame chunks), and a dock pane and the session panel both measure `#191919` in dark (OBS 5.11492) where the Settings dialog, outside a pane, keeps `#1f1f1f`. The rule does not apply inside a `[data-cds-theme]` subtree. So, by the code, the theme key `composerSidebarBackground` (the panel surface) should draw the pane's own color inside a dock pane. As a background it does (OBS 5.11492, dark: `git-pane`'s legend card reads `#191919`). The constant that wraps a mod's dock pane was not traced. The values are `#191919` in dark, white in light. The rule is for the color layer in both themes; only dark was seen. As a **border** the key did not behave so on screen (`recipes.md` recipe 2). The harness has no pane ground and reads `#1f1f1f` there.

Consequence for mods: a hex copied from one layer is wrong under the other, and wrong again in the other theme. That is the measured reason behind "theme keys, not hex". The four hex values the project's mods carry (`#fab219`, `#d03b3b`, `#1baf7a`, `#eb6834`, each owner-approved, listed in scripts/mod-colors.allow.json (kept in the source repository, not shipped)) match the base layer only.

## Theme key to token (Desktop engine chunk, CODE)

A `color`, `backgroundColor` or `borderColor` string is resolved in this order: this table, then a fixed-hex table (rainbow and subagent colors), then ANSI names, then a literal `#hex`/`rgb()`/`hsl()`, else `currentColor`.

| Theme key | Token | Reads as |
|---|---|---|
| `text` | text-primary | main ink |
| `inverseText` | on-primary | white in light, near-black in dark. Vanishes on a native popover card |
| `inactive` | text-secondary | |
| `subtle`, `inactiveShimmer` | muted text (INF: a shared variable in the chunk; the 4.16336 notes read it as text-muted) | value and count ink |
| `suggestion`, `permission`, `remember`, `ide`, `briefLabelYou` | text-accent | blue ink |
| `success`, `planMode` | text-success | green ink |
| `warning`, `warningShimmer` | text-warning | **brown in light mode**, amber in dark: an ink, not a fill |
| `error` | text-danger | dark red in light: an ink |
| `autoAccept`, `skill`, `effortUltra` | text-pro | violet ink |
| `merged` | text-git-merged | |
| `claude`, `clawd_body`, `briefLabelClaude` | fill-brand | brand orange |
| `rate_limit_fill` | fill-accent | the meter blue: a fill |
| `rate_limit_empty`, `background` | bg-accent | pale blue: a tint |
| `promptBorder` | border-strong | 20% ink |
| `promptBorderShimmer` | border | 10% ink |
| `userMessageBackground`, `bashMessageBackgroundColor`, `memoryBackgroundColor` | surface-1 | |
| `userMessageBackgroundHover` | surface-2 | |
| `composerSidebarBackground` | surface-panel | |
| `clawd_background` | surface-0 | page |
| `selectionBg` | bg-accent-muted | |
| `diffAdded` / `diffRemoved` | text-git-added / removed | |
| `diffAddedDimmed` / `diffRemovedDimmed` | bg-git-added / removed | 20% tints |
| `diffAddedWord` / `diffRemovedWord` | fill-git-added / removed | |

Gaps a mod meets (OBS, project record):

- There is no key for the warning or danger **fill**. `warning` and `error` are inks, and in light mode `warning` is brown. The amber and red meter fills are owner-approved hex.
- There is no key for the chart palette beyond `rate_limit_fill` (categorical-1).
- `subtle` as a border drew white, and a translucent `promptBorder` background under a round border drew a gray rim (4.4212). For a track use `borderColor` and `backgroundColor` of the same key.
- Only 23 keys are typed (`ThemeKey`); the rest type-check as strings. `check-mod-colors` holds the list the project allows.

## Derived rules the engine applies

- `dimColor` on Text: `var(--engine-dim-ink, text-secondary)`; with a `color`, a 60% mix of that color. The band sets `--engine-dim-ink` to `var(--muted-as-secondary, text-muted)`. The theme key `subtle` is that same expression (engine chunk: `subtle` maps to a shared variable), and so are the close control, the hotkey cue and the "more" button. Under the color layer the main stylesheet sets `--muted-as-secondary` to the secondary ink (@1874460), which is why `subtle`, `dimColor` and `inactive` all draw one gray on Desktop.
- `borderDimColor`: the border color at 60%.
- An unknown color string: `currentColor`.
- Bordered Box: `1px solid var(--cds-border)` unless `borderColor` is set.
- Focus on any mod control: `--cds-focus-shadow`. Disabled: opacity .4.
