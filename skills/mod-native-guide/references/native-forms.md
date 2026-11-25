# Native form pieces, Counter, Spinner and the class merger (Desktop 5.11492.5.0)

CODE: read by a helper in the renderer bundle on 2026-11-14 (third pass) and spot-checked by the coordinator (see the last section). Offsets are character offsets. Files: SF = a Desktop bundle file, c5fc = a Desktop bundle file, c73f = a Desktop bundle file, c7be = a Desktop bundle file, s20 = a Desktop bundle file, CSS = a Desktop bundle file.

All px are the comfortable density with the second color layer. The helper resolved `h-control` to 32 px from the token table; with a mouse it is **28 px** (the pointer media block, `harness-measurements.md`), so every "control" below is 28 px on the owner's machine and 32 px on touch. The nested control height (22 px) and radius (8 px) do not change with the pointer.

A mod cannot draw any of these. They are here so a mod's `Input`, `Select`, counts and loading states can be judged against them.

## Size scopes

`data-size` rebinds the control tokens for a subtree (CSS @1761276, `.cds-root [data-size=xs]{--cds-h-control:var(--cds-h-control--xs);…}`; a helper at SF @19184 writes the attribute).

| Token | base | xs | sm | lg |
|---|---|---|---|---|
| control height (touch) | 32 | 24 | 28 | 40 |
| nested control height | 22 | 18 | 20 | 28 |
| radius | 8 | 6 | 7 | 10 |
| icon | 20 | 16 | 16 | 24 |
| pad-md | 12 | 8 | 10 | 16 |
| pad-sm | 8 | 6 | 8 | 12 |
| pad-xs | 6 | 4 | 6 | 8 |

## The shared field recipe (TextInput, NumberInput, DateInput)

SF @238153.

- Frame: `h-control ps-md rounded bg-fill-field shadow-field-ring data-[invalid]:shadow-field-invalid font-sans text-body font-normal text-primary transition duration-fast`.
- Inner input: `cds-input cds-reset min-w-0 flex-1 h-full bg-transparent border-0 p-0 outline-none … placeholder:text-muted disabled:opacity-disabled`. It draws no focus ring of its own.
- Box variant (TextArea): `rounded … px-md py-sm` with `focus-within:shadow-focus`.

| State | What draws |
|---|---|
| Rest | control height, 12 px side padding, radius 8, 14/20 weight 400; fill `--cds-fill-field` (`#ffffff80` light, 5% white dark); 1 px inset ring `--cds-fill-field-ring` (CSS @516503) |
| Hover | ring becomes `--cds-fill-field-hover-ring`, falling back to `border-strong`; only when not focused, not invalid, not disabled |
| Focus | `shadow-focus`: 1 px page-colored inset, 1 px accent ring, 6 px soft glow |
| Invalid | 1 px inset ring in `fill-danger`; focused, the danger twin of the focus shadow |
| Disabled | opacity .4, no pointer events, no hover ring |
| Placeholder | `text-muted` |

NumberInput root (c7be @26043) adds `pe-md`, an 8 px gap and `pe-6` when a stepper is present.

What this means for a mod: the engine's `Input` and `Select` use the same tokens (`engine-behaviour.md`, Select and Input), so a mod field already matches at rest, hover, focus and disabled. A mod has no invalid state: say the error in a line under the field, in `error` ink.

## DateInput (c5fc @199639, `data-cds="DateInput"`)

- Frame: the field recipe with `px-0`; the merger drops `ps-md`, and the padding moves to an inner div (`ps-md flex h-full min-w-0 flex-1 cursor-text items-center whitespace-nowrap`, plus `pe-md` when there is no calendar button).
- Calendar button slot (c5fc @192700): a square of the control height holding a ghost icon-only Button (`Calendar` icon, no tooltip) sized to the nested control height: 22 × 22, radius 3.
- Segments (c5fc @192068): `rounded-chip px-[1px] tabular-nums … focus:bg-fill-accent focus:text-on-accent … data-[placeholder]:text-muted`. A focused segment is a solid accent chip with white text; an empty one is muted; separators are in the secondary ink. `rounded-chip` is a quarter of the nested height (5.5 px, CSS @326115).

## Calendar popup (c5fc @95686, `data-cds="Calendar"`)

- Popup: the popover surface (`rounded-card bg-surface-3 shadow-panel`, SF @150606), padding 8 px, offset 6 px, aligned to the field's start.
- Header: `pb-sm flex items-center justify-between`: previous, title, next. Nav buttons are ghost, `xs`, icon-only (`CaretLeft`, `CaretRight`), no tooltip. Title `text-body font-medium text-primary`.
- Weekday cell: a control-sized square, `text-caption`, muted, narrow weekday names.
- Day cell: a control-sized square button, `rounded`, `text-body font-normal text-primary`. Rows are 2 px apart (`gap-y-0.5`). Seven cells make the grid: 196 px with a mouse, 224 px on touch.

| Day state | Look (c5fc @95900) |
|---|---|
| Hover | `fill-ghost-hover` (5% ink) |
| Today, not selected | `font-semibold text-accent` |
| Selected endpoint | solid `fill-accent` square under the number, `text-on-accent` |
| Inside a range | a band in `bg-accent` (12% accent on the color layer) from first to last selected column of the week |
| Disabled or unavailable | `text-disabled`, no hover |
| Keyboard focus | the focus shadow |
| Outside the month | not drawn at all: an empty cell. There is no dimmed outside-month look |

`Calendar.Range` was not read (INF: same cells).

## Counter (SF @181478, `data-cds="Counter"`)

`inline-flex shrink-0 items-center justify-center align-middle h-control-nested min-w-[var(--cds-h-control-nested)] rounded-full … font-sans text-caption font-medium proportional-nums`.

- A pill 22 px high, at least 22 px wide (a circle for one digit); two or more digits get side padding of 30% of the height (6.6 px). Text 12/17, weight 500. Size scopes: 18, 20, 22, 28 px.
- Caps at `99+` by default; hidden at zero unless `showZero`; nothing for a non-finite value.
- Dot mode: `size-2 rounded-full`, 8 × 8, `aria-hidden`.

| Variant | Pill | Dot |
|---|---|---|
| neutral | `bg-neutral text-secondary` (5% ink) | `bg-fill-control` |
| accent | `bg-fill-accent text-on-accent` | `bg-fill-accent` |
| success | green fill, white text | `bg-fill-success` |
| warning | `bg-fill-warning`, dark text (`text-on-warning`) | `bg-fill-warning` |
| danger (the default) | `bg-fill-danger text-on-danger` | `bg-fill-danger` |

For a mod: a count is plain text, `size="caption"` or `footnote`, `tabular`, in `subtle` ink beside its label. A filled pill needs a fill a mod does not have without hex; do not fake one with a bordered Box.

## Spinner (SF @65947, `data-cds="Spinner"`)

The size table is `sm` = box 12, stroke 1.5; `md` = box 16, stroke 1.75; `lg` = box 20, stroke 2; the default is `sm`.

- A ring: track `border: <stroke> solid var(--cds-border)`, arc a conic gradient in `var(--cds-text-muted)` masked to the stroke, `animate-[spin_1s_linear_infinite]`, stopped under reduced motion.
- `inheritColor` uses `currentColor` and a 25% track.
- With a `label` it is a `role=status` wrapper with a screen-reader label shown after 100 ms; `delay` defers the spinner itself.

For a mod: there is no spinner element. A loading state is a line of text ending in "…" (owner-standards.md (kept in the source repository, not shipped)), never a glyph animation.

## The class merger and the rail section head

- SF @12329: the class-name helper passes its arguments through clsx, then tailwind-merge. The first step is clsx and the second is `extendTailwindMerge` from the vendor chunk, extended with the design-system groups (`min-h` gains `control`; `px` conflicts with `ps`/`pe`; a `font-size-weight` group such as `text-footnote-medium` conflicts with a later size, weight or `leading`).
- So a later class of the same group wins: `min-h-6` replaces an earlier `min-h-6.5`.
- The session-panel section head (c73f @166587) is built by merging `group/railtop relative flex min-h-6.5 min-w-0 items-center gap-xs` with a shared `min-h-6` constant and its trigger row by merging `flex min-h-6.5 w-full min-w-0 items-center gap-1 px-xs text-footnote-medium text-primary` with that constant and a `leading-4` constant (s20 @42643, imported under other names).
- **The head is 24 px** (`min-h-6`, `--spacing` .25rem), its line box 16 px, its side padding 8 px (`--rail-row-pad`). INF on one point: s20 exports two sets under those names and the helper took the only set that defines rail classes. OBS on build 4.16336 agrees: `native-screens.md`.

## Constants that other references name

| Name | Value | Where |
|---|---|---|
| menu shell radius | `rounded-[calc(var(--cds-radius)+var(--cds-menu-gutter,.25rem))]`: 12 px. A radius for menu, combobox and popup shells, not a surface | SF @255690 |
| popover surface | `rounded-card bg-surface-3 shadow-panel` (panel variant: `bg-surface-2 shadow-panel-sm`) | SF @150606 |
| `shadow-panel` | `inset 0 0 0 var(--cds-ring-inner) ring, 0 0 0 var(--cds-ring-outer) ring, var(--cds-shadow-popover)` | CSS @21548 |
| `--cds-shadow-popover` | light `0 8px 24px #0000001f, 0 2px 6px #00000014`; dark `0 8px 24px #00000052, 0 2px 6px #0003` | tokens |
| ring, light | `--cds-ring-outer:1px; --cds-ring-inner:0px` (the ring sits outside) | CSS @1696431 |
| ring, dark | `--cds-ring-outer:0px; --cds-ring-inner:1px` (the ring sits inside) | CSS @1713720 |
| `--cds-border-line` | unset by default; ring utilities fall back to `--cds-border` | CSS @1694441 |
| Button radius constant | the Button radius: `var(--cds-radius)+var(--cds-button-radius-add,0px)` | SF @70110 |
| focus ring classes | `focus-visible:shadow-focus [&[data-initial-focus]:focus]:shadow-focus` | SF |
| `--cds-radius-composer` | 14 px comfortable, 12 px compact | CSS @1730257, @1693675 |

## Not read

`Calendar.Range`; the CSS that Counter's `xxs` (`data-step="1"`) selects; TextArea beyond the box recipe; the Slider chunk. Switch, Checkbox and Radio are in `native-components.md`.

## Spot checks by the coordinator

See the list at the end of `engine-behaviour.md`: the same pass covered this file.
