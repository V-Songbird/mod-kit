# Harness measurements (Desktop 5.11492.5.0)

What Desktop's own DOM builder and stylesheet draw for a mod tree, measured in a browser with `getComputedStyle` and `getBoundingClientRect`, and checked against two owner screenshots of the real app.

Label **HARNESS**: the engine chunk's builder, the app's three stylesheets, and the site wrapper copied from the engine's own React wrapper, mounted on a loopback page. It is the real code, not the real app: the Code tab's own page CSS, the pane chrome and the schema check before the builder are not in it. How to run it: regenerate.md (kept in the source repository, not shipped), step 10. Cases: scripts/harness/harness-cases.js (kept in the source repository, not shipped).

## Which variant is the real app

**Desktop draws at `comfortable` density with the second color layer.** Evidence, in order of strength:

- OBS, pixel scan of `2026-11-03-4.16336-panel-band-footer-light.png` (owner shot, 96 dpi, read with scripts/harness/scan.ps1 (kept in the source repository, not shipped)): a mod's default Button is 28 px tall with fill `#f2f2f2` (5% black on white); an Input is 28 px tall with a 1 px `#ebebeb` ring; the band is a 40 px card `#f3f3f3`; the band meter is 6 px tall with fill `#257de0`. Each equals the harness at comfortable + layer and none equals compact or the base colors (24 px, `#2a78d6`).
- OBS, `036-owner-66col-light.png` and `-dark.png` (git-pane, a later build), pixel scan: the mod's "filtrar" Button is 28 px tall, fill `#f2f2f2` in light and `#3b3b3b` on a `#191919` surface in dark (15% white over the layer's dark surface); the Input is 28 px tall with fill `#252525` (5% white). The mod measured that pane as 66 columns; its text spans about 510 px, 7.7 px per column (the comfortable `ch` is 7.55; compact would give 462 px).
- OBS, a reviewer's independent scan of `2026-11-03-4.16336-panel-band-footer-dark.png`: mod Buttons 28 px tall with fill `#3b3b3b` on `#191919`, the band card `#252525` and 40 px, the band meter 6 px of `#257de0`.
- CODE: `index.html` ships `<html class="cds-root" data-density="comfortable" data-cds-fizzy-lake="color panels type">`; the root component falls back to `comfortable`; `densityOverride` occurs twice in the bundle, once in that fallback and once in a list of retired storage keys; nothing sets `data-density`. The color layer is off only on `/mobile/` paths, an embedded context, or a non-Electron `Claude/` user agent.

So read the **comfortable + layer** column first. Compact and base values are kept because the CSS still carries them and a later build may switch.

The two shots are builds 4.16336 and a later one before 5.11492. The running 5.11492 app was measured later from seventeen owner captures, ten dark and seven light: `native-screens.md`, last sections; lines below marked OBS 5.11492 come from there. The light captures confirm this page's light column where they overlap: Button fill 5% black (`#f2f2f2`), Input 28 px and 183 px wide with a 1 px ring of 8% black (`#ebebeb`), secondary ink 60% black (`#666666`), `rate_limit_fill` `#257de0`, the 8 px gap of `columnGap={1}`.

## Controls

| Thing | comfortable (Desktop) | compact |
|---|---|---|
| Button, default or `variant="secondary"`: height, side padding, radius, text | 28, 12, 8, 14 px, weight 400 | 24, 8, 6, 13 px |
| Button `variant="primary"` | same box, weight 500, ink-filled | same |
| Button `plain` | 20 tall (`min-height`), 6 padding, 6 radius, transparent | 19, 4, 4 |
| Button in the band (any kind) | 28 tall, 10 padding, 7 radius, 14 px | 20, 6, 5, 12 px |
| Button `role="dismiss"` in the band | 28 × 28 close control at the trailing edge, muted ink | 24 × 24 |
| Input, one line | 28 tall, 12 side padding, 183 wide by default, submit Button beside it | 24, 8, 163 |
| Input `rows={3}` | 76 tall, padding 8 × 12, full width | 69, 6 × 8 |
| Select trigger | 28 tall, padding 12 left 8 right | 24, 8 and 6 |
| Label of an Input or Select | secondary ink, body size, before the field | same |

Colors of those controls (light, then dark):

| Thing | layer (Desktop) | base |
|---|---|---|
| Default and secondary Button fill | 5% black; 15% white | 10% white in both |
| Default Button ring | none inside a site (the host sets `--engine-button-edge:none`) | none |
| Primary fill, ink | `#191919` on white ink; `#efefef` with `#191919` ink | `#0b0b0b`; `#fff` |
| Plain Button ink | primary text; `dimColor` gives secondary text | same roles |
| Input fill, ring | 50% white, 1 px 8% black; 5% white, 1 px 4% white | ring 10% |

Default and `secondary` are the same drawing. Only `primary` and `plain` differ.

## Buttons in a row

- No gap: Buttons touch, `0 px`, in a pane and in the band (HARNESS, 8 variants). The types promise `xs`. The engine's row rule only centers the children of a row that holds a control (`[data-engine-row] > … {align-self:center}`, CODE).
- `columnGap={1}`: 7.5 px (7 compact). `gap="xs"`: 8 px (6 compact).
- A row Box that holds a Button gets `data-engine-row`: text and Button centers line up. With `alignItems="flex-start"` it does not, and the Button sits 5.5 px lower than the text's middle.

## Type

| `size` | comfortable: size / line | compact |
|---|---|---|
| `caption` | 12 / 17 | 11 / 17 |
| `footnote` | 13 / 17 | 12 / 15 |
| `body` | 14 / 20 | 13 / 19 |
| `heading` | 15 / 20 | 14 / 18 |
| `title` | 22 / 28, display face | 20 / 25 |

Weights as drawn: `medium` 500, `semibold` 580, `bold={true}` 580 (it is read as semibold). `mono` is `anthropic-mono` at the same size. Sans is `anthropic-sans`.

A Text whose string holds a run of two or more spaces is drawn as a grid line: mono face, `white-space: pre`, `display: block`. Its sibling lines in the same column Box go mono too, including a plain sentence (HARNESS, case `grid-mono`). Keep column-aligned text in its own Box.

## Space

| Step | `gap`, margin: comfortable | compact | padding: comfortable | compact |
|---|---|---|---|---|
| `xs` | 8 | 6 | 6 | 4 |
| `sm` | 12 | 8 | 8 | 6 |
| `md` | 16 | 12 | 12 | 8 |
| `lg` | 28 | 20 | 16 | 12 |
| `xl` | 40 | 32 | 24 | 20 |

A number: down, `n × 10 px` (half a 20 px line; 9.5 compact); across, `n × 7.55 px` (one `ch` of the sans face at 14 px; 7.0 compact). `padding={1}` is 10 px top and bottom, 7.55 px left and right.

## Borders, cards, meters

- A Box with `borderStyle` gets padding by itself: 12 × 16 px (8 × 12 compact). `paddingX={1}` replaces the sides only.
- `round`: 1 px, radius 12 (10 compact). `single`: radius 8 (6). `bold`: 2 px. No `borderColor`: the border token (8% black in light, 4% white in dark, layer). `borderColor="promptBorder"`: 20% ink in both modes.
- Meter recipe (`height={0.3}`, round track, fill child): 6 px tall (5.7 compact), track radius 12, fill `rgb(37,125,224)` in both modes (layer; `rgb(42,120,214)` base). The mod's own band meter measures exactly that in the owner shots.
- **It is not the native meter's size.** The session panel's Context meter in the same dark shot is 4 px tall, fill `#338ced` (the first chart color); the native usage bar is `h-[4px] rounded-[3px]` on alpha-1 with the accent fill (CODE). `height={0.2}` is 4 px at Desktop's 20 px line (INF from the row unit, not rendered).
- Segmented bar with `columnGap={0.15}`: seams 1.1 px (1 compact).
- Every color key resolves to the same color as `borderColor` and as `backgroundColor` (case `border-keys`, 22 keys, both modes). An unknown key as a border falls back to the text ink; as a background, to nothing.
- The bar of recipe 2 (case `bar-ring`): 6.4 px high, ring 1 px in `composerSidebarBackground` (`#1f1f1f` dark, white light), track 20% ink, pieces 4.4 px high, seam 1.1 px. This bar has not been captured in the app. The capture once read as a mismatch (rim `#6c6c6c`, OBS 5.11492) is another mod, Foreman's Roadmap pane, whose ring and track share `promptBorder`: it shows the doubling of the line above, not this case (`native-screens.md`, item 2). The harness also has no pane ground: in a real dock pane that key is the pane's `#191919`, not `#1f1f1f` (`desktop-tokens.md`).

## Progress

The CLI lowers `Progress` for every surface but a mobile app that names it (CODE, the engine's lowering of `Progress`, non-terminal branch): a Text line with the label and a dim figure, then a Box bar `height={0.3}` with track `userMessageBackground` and fill `color ?? 'suggestion'`.

Drawn in the harness: a 6 px **square** bar, full width; fill `rgb(23,87,172)` in light and `rgb(106,171,241)` in dark, the accent **text** ink, not the meter fill; track white in light and `#191919` in dark, the same as a card surface, so the track is invisible on a card. It draws, and it does not match a native meter. A raw `Progress` node handed to the builder draws nothing, and the tree schema has no `Progress` key; the CLI never sends one.

## Hover card

- In the band (`liftsHoverCards`): the card becomes a `popover="manual"` element: surface white in light and `#1f1f1f` in dark (layer), padding 12 × 16 (8 × 12 compact), radius 12 (10), max width 360 px, ring and shadow from the panel shadow token. The mod's own border, background and offsets are gone.
- A Text in that card with `color="inverseText"` is white on white in light: invisible. Use no color or `text`.
- A card whose hover names a `scope` stays `display: none` in the band.
- On screen (OBS 5.11492, dark) the lifted card is 360 px with its ring, `#1f1f1f`, ring `#282828`: as above. A one-word card is 71 × 44 px with its ring: one 20 px line plus 12 px above and below and about 16 px at the sides, which is the 12 × 16 read here.
- In a dock pane (case `hover-card-pane-solid`): the card stays in place (`popover` absent, `z-index: auto`). With `borderStyle="round"`, `borderColor="promptBorder"`, `backgroundColor="composerSidebarBackground"`, `paddingX={1}` and four keyed rows it is 106 px high (12 px vertical padding from the border) and it is the top element at all 13 points sampled down its middle, over a plain row, a `position: relative` row and a Button row, in both modes. Without the background the app shows the rows through it (OBS 5.11492). With it the app draws the card opaque in the pane's `#191919` (OBS 5.11492), not the `#1f1f1f` read here.

## Band

- The band region is a card: 8 px padding, 10 px radius, `min-height` 40 px, alpha-1 fill (`#f3f3f3` on white in the owner shot), children gap 5 px. It scrolls after 11 lines.
- `dimColor` in the band resolves through the band's own dim-ink variable, not the secondary-ink token. On the color layer it measured 60% black in light and 57% white in dark, the same as `subtle` and the same numbers as the table's `text-secondary`. The table's `text-muted` on that layer is lighter (47% black, 40% white) and is **not** what any of the three drew. The names differ only on the base colors.
- A row of text and Buttons is reshaped: the text flows left, Buttons move to the trailing edge, a `role="dismiss"` Button becomes the close control.

## Theme keys as drawn (layer; light, dark)

| Key | Ink or fill |
|---|---|
| (none), `text` | 90% black; 93% white |
| `inverseText` | `#fff`; `#191919` |
| `dimColor`, `inactive`, `subtle` | 60% black; 57% white. One ink for all three on the layer |
| `suggestion`, `permission` | `rgb(23,87,172)`; `rgb(106,171,241)` |
| `success`, `planMode` | `rgb(0,108,16)`; `rgb(83,197,86)` |
| `warning` | `rgb(137,89,2)`; `rgb(228,156,6)` |
| `error` | `rgb(164,37,40)`; `rgb(241,119,120)` |
| `autoAccept` | `rgb(84,55,184)`; `rgb(168,154,240)` |
| `claude` | `rgb(198,97,63)` in both |
| `promptBorder` | 20% ink |
| `rate_limit_fill` | `rgb(37,125,224)` in both |
| `rate_limit_empty` | 12% of that blue |
| `userMessageBackground` | `#fff`; `#191919` |
| `composerSidebarBackground` | `#fff`; `#1f1f1f` |
| `merged` | `rgb(142,107,217)`; `rgb(183,150,255)` |
| `diffAdded`, `diffRemoved` | `rgb(30,158,60)`, `rgb(205,32,84)`; `rgb(50,215,75)`, `rgb(255,44,86)` |
| an unknown key as `color` | primary text |
| an unknown key as `backgroundColor` | nothing painted |
| a hex | that hex, in both modes |

These are for comparison when reading a screenshot. A mod writes the key, never the value.

## Other

- `Svg` with a non-empty `alt` draws an `<img>` with a data URL at the given size. The app's schema refuses an `alt` that is empty after trimming (`alt: trim().min(1)`, CODE); the harness skips the schema, so it cannot show a refusal.
- `wrap="truncate-end"` on a plain Button inside `<Box flexGrow={1} minWidth={0}>` ends in "…" at the pane edge.
- The cursor over every control is the arrow (`--cds-cursor-interactive: default` on Desktop).
- Pointer devices get smaller controls than touch: `--cds-h-control` is 28 px under `@media (hover:hover) and (pointer:fine)` and 32 px otherwise at comfortable. data/desktop-tokens-5.11492.tsv (kept in the source repository, not shipped) holds the 32 (it does not apply media blocks).
