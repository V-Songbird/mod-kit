# What each element becomes on Desktop (5.11492.5.0; re-read on 6.28899.6)

CODE unless marked: read in the mod engine chunk a Desktop bundle file (248 KB). A helper re-read it as a Desktop bundle file (209 KB) in 6.28899 on 2026-11-26: about 36 values held as written; the changes are marked "6.28899". The tree is validated against a schema, turned into DOM inside a shadow root, and styled by one engine stylesheet that only uses `--cds-*` tokens. OBS lines come from owner screenshots in the project record.

## The frame every tree lives in

- Shadow-root host: `font-family` sans, weight regular, color text-primary, `isolation:isolate`, `contain:paint`. `b` is semibold. Scrollbars are thin.
- Site region: `min-h-0 min-w-0 text-body text-primary`. The root Box's vertical margins are zeroed on every site.
- Schema accepts only: `Box`, `Text` (and `div`, `span`, `b`), `Button`, `Input`, `Select`, `Link`, `Code`, `Markdown`, `Svg`, `Client`. **`Progress` is not in it**, and does not need to be: the CLI lowers a `Progress` to Box and Text before the tree reaches Desktop (CODE, engine). What that draws is a square bar that matches no native meter: `harness-measurements.md`, Progress.

Sizes in this file were read from the CSS at the compact density, which 6.28899 removed. Desktop runs comfortable with the second color layer; the measured boxes, inks and gaps of every element are in `harness-measurements.md` and win where the two differ.
- Limits: more than 2,000 nodes, depth over 32, or over 262,144 characters, and the tree is refused; the host draws without the mod. Transcript tool groups: 1,500 nodes, 196,608 characters. 6.28899 adds a third count, refused past 66 (CODE; what it counts was not traced).
- 6.28899: the element validators moved to their own chunk (a Desktop bundle file); the accepted set is unchanged and `Progress` is still not in it.
- `paint` containment clips anything a mod draws past its region, including a focus glow at the top edge (OBS: an Input's glow was cut; start its row `0.4` lower).

## Box

A `div`, always `display:flex; box-sizing:border-box`, row by default.

| Prop | CSS |
|---|---|
| `width`, `minWidth` number | `N ch` |
| `height`, `minHeight` number | `N lh` (fractions allowed: `0.3` is a thin bar) |
| `"N%"` on any of them | as written |
| `gap`, `margin*` step | `var(--cds-gap-*)` |
| `padding*` step | `var(--cds-pad-*)` |
| vertical number | `calc(N * var(--engine-row-unit, .5lh))`: one unit is half a line |
| horizontal number | `N ch` |
| `top/left/right/bottom` | integers, `lh` and `ch` |
| `borderStyle` (any) | `border:1px solid var(--cds-border)`, radius `--cds-radius`, **plus padding `pad-md pad-lg`** (12 × 16 px on Desktop; 8 × 12 compact) |
| `borderStyle="round"` | radius `calc(var(--cds-radius) + .25rem)`: the native card radius |
| `borderStyle="bold"` / `"double"` | 2 px / 3 px double |
| `borderColor` | that color; `borderDimColor` mixes it to 60% |
| `backgroundColor` | that color |
| `overflow="hidden"`, `display`, `position`, flex props | as named |

- A bordered Box brings its own padding. Pass `padding={0}` (or `paddingX`) when the border is only a shape, as in a meter track.
- A **row Box with no `alignItems`** is marked `data-engine-row`: its inline children (Text, Button, Input, Select, image) get `align-self:center`. So a plain row centers its controls on the text line without help. Set `alignItems` yourself and you own the alignment.
- A keyed Box is a hover scope (below). A keyless element in a list is drawn as a fragment, which stacks its children as a column (OBS): key every Box in a `.map`.
- Number vs step: a vertical `1` is half a line (10 px at body size), which is neither `xs` (8 px) nor `sm` (12 px). Steps match the native rhythm; numbers do not.
- An empty or hidden row still keeps a slot of about 15 px in the transcript (OBS, 2026-11-02).

## Text

A `span`.

| Case | CSS |
|---|---|
| default | `white-space:pre-wrap; overflow-wrap:anywhere` |
| one token of 24 characters or fewer | `white-space:pre`, never broken |
| every word 24 characters or fewer | `overflow-wrap:break-word` |
| any truncating `wrap` | `display:inline-block; white-space:pre; text-overflow:ellipsis` |
| `dimColor` | `var(--engine-dim-ink, text-secondary)`; with `color`, that color at 60% |
| `size` | the role's size and line height; `title` uses the display face |
| `weight`, `bold` | regular 400, medium 500, semibold 580; `bold` is read as semibold (580, HARNESS). 6.28899 also accepts `weight="bold"` (the token is 600; not drawn in the harness) while `bold` still means semibold |
| `mono`, `tabular` | mono font; tabular figures |
| `maxLines` (6.28899) | a line clamp (`-webkit-line-clamp`) |
| `wrap="clip"` (6.28899) | cut with no ellipsis |
| `inverse` (6.28899) | ink and background swapped: background `color ?? text-primary`, ink `backgroundColor ?? surface-0`; `dimColor` gives opacity .6 |

- A truncating Text needs a parent that can shrink: `<Box flexGrow={1} minWidth={0}>` or `flexShrink={1} minWidth={0}`. Without it the row grows past the pane (OBS).
- **Auto-mono grid**: non-wrapping Texts stacked in a column that look like a table (box-drawing characters, `---`, or two or more multi-space gaps), or one multi-line grid Text, are switched to the mono font. Aligning columns with spaces therefore changes the font. In 6.28899 one gap of three or more spaces is enough, and one matching line of a multi-line Text is enough (CODE; INF that this is looser than before, since the 5.11492 rule was not kept). Mono turns ligatures off.
- `overflowX="scroll"` (6.28899, Box and Text): children keep their width and scroll sideways together. Use rows of Boxes with fixed widths instead.
- `dir` and `lang` are dropped (CODE, 4.4212); mixed-direction text follows the Unicode algorithm.
- `~~strike~~` inside a bold line drew with no strike (OBS, 4.16336).
- Nested Text for mixed ink in one line works (OBS).

## Button

A `button`. Props in the schema: `key`, `label`, `hotkey`, `action`, `plain`, `dimColor`, `autoFocus`, `variant`, `role`, plus `hover`. There is **no** `title`, tooltip, icon or disabled prop.

| Form | Look |
|---|---|
| base | body size, regular, `inline-flex`, inner gap 6 px, `nowrap`, `width:fit-content; max-width:100%`, label in one span with ellipsis |
| default and `variant="secondary"` | height `h-control`, padding `0 pad-md`, radius, `fill-secondary`; hover `fill-secondary-hover`. Identical: only `primary` has a rule of its own |
| edge | `var(--engine-button-edge, inset 0 0 0 1px fill-secondary-ring, 0 1px 2px rgb(0 0 0/.05))`. Generic site hosts set `--engine-button-edge:none`, so **there the secondary Button has no ring or shadow**, only its faint fill |
| `variant="primary"` | `fill-primary` with `on-primary` ink, medium weight, no shadow; hover `fill-primary-hover`. Black in light, white in dark |
| `plain` | `min-height:1lh` (20 px), padding `0 pad-xs` (6 px; 4 compact), radius − 2 px (6 px), no fill; hover `fill-ghost-hover` |
| `dimColor` | ink `var(--engine-button-dim-ink, dim ink)`; primary ink on hover and focus |
| `role="dismiss"` | a close X, `h-control` square, muted |
| `hotkey` | a key cap: `1em + 6px` square, 1 px border at 20%, radius 4 px, caption size, uppercase, muted; drawn first in a plain Button |
| focus | `--cds-focus-shadow` |
| transitions | `dur-fast ease-out`; none under reduced motion |

- Children are flattened into the label span. With a `label`, the label is what draws and a child Text's ink is ignored (OBS). Carry state in the glyph's shape (`◉`/`○`, `▾`/`▸`) and in the Button's own `dimColor`.
- A plain Button's text starts 6 px in from its row (its padding; 4 px compact). Rows under a head need `paddingLeft` to line up (OBS).
- **No gap is added between adjacent Buttons.** No adjacency rule exists in the engine stylesheet and nothing inserts `gap` in the 2.1.325 engine. Set `columnGap`.
- A Button draws at its natural width on one line. To truncate its label, wrap it: `<Box flexGrow={1} minWidth={0}><Button …/></Box>` (OBS).
- A Button with `hover` must sit inside a keyed, visible Box (engine refusal otherwise).

States as the engine's stylesheet writes them (CODE, engine chunk @164737, values from the color layer of the token table). The dark hover values were also measured under a real pointer in the harness (HARNESS: 21.6% white, `#d7d7d7`, 7.5% white, and `dimColor` turning to the full ink); the fill moves over 60 ms (`transition: background-color, box-shadow, color .06s`), so a reading taken at once is mid-way. None seen in the app:

| Form | Rest, light / dark | Hover, light / dark | Focus | Pressed |
|---|---|---|---|---|
| default, `secondary` | 5% black / 15% white | 7.5% black / 21.6% white | the native focus shadow | **no rule**: the fill does not change while the pointer is down |
| `primary` | `#191919` / `#efefef`, ink white / `#191919` | `#3c3c3c` / `#d7d7d7` | same | no rule |
| `plain` | none | 5% black / 7.5% white behind the text | same | no rule |
| `dimColor` | the dim ink | the plain ink (also on focus) | | |
| `primary` with `dimColor` | ink at 70% | full ink | | |
| close control (`role="dismiss"`, band) | `var(--muted-as-secondary, text-muted)`: the secondary ink on the color layer Desktop ships, the lighter muted ink on the base colors; a 28 × 28 px box (`h-control`), no fill | 5% / 7.5% fill, plain ink | same | no rule |

- A native Button has the same rest and hover fills; the native pressed and menu-open fill (10% black, 15% white) has no counterpart on a mod Button. Show a press through what the mod redraws (the word, the `primary` variant moving, a toast), never by expecting a pressed look.
- `button:disabled{opacity:.4;pointer-events:none}` exists in the stylesheet, but the schema has no `disabled` prop: a mod cannot disable a Button. Draw an unavailable action as `dimColor` text with the reason beside it or in its hover card, or do not draw it.
- A `hotkey` draws a cue before the label: a square key cap of `1em + 6px`, 1 px line at 20% of its ink, radius 4, caption size, uppercase, muted ink. It is the same shape as the native key cap (`composer-and-pr.md`, key caps) and the only key cap a mod can have.
- Inside a Button the label and any child sit 6 px apart (`gap:.375rem`), on one line, cut with an ellipsis at the Button's `max-width:100%`.
- Inside a `Client`, a Button draws as bare text whatever its `variant` (OBS, 4.16336). A bordered Box around it gives it an edge.
- On the band the look changes: see `desktop-sites.md`.

## Input

A `form[data-engine-input]`, `inline-flex`, gap `xs`.

- One line: height `h-control`, padding `0 pad-md`, `fill-field`, inset 1 px `fill-field-ring`; hover ring `border-strong`; focus `--cds-focus-shadow`; placeholder `text-muted`. Same recipe as the native TextInput.
- `rows > 1`: a textarea, `flex:1 1 auto`, padding `pad-sm pad-md`. It fills its row.
- `label`: a caption span, body size, `text-secondary`, before the field.
- `submitLabel`: a submit Button after the field, always drawn.
- Limit: 16,384 characters.
- A one-line field has a width of its own that no prop changes (OBS). Put it alone in its row, or last; a `submitLabel` spills past a narrow parent.
- The field shows only the value drawn. A redraw erases half-typed text unless each `onInput` writes an atom the `value` reads.
- The focus glow reaches about 8 px out; at a pane's top edge it is clipped. Give the row `marginTop={0.4}` on Desktop.

## Select

Not a native `select`. A combobox Button (height `h-control`, padding `0 pad-sm 0 pad-md`, a 14 px caret) and a popover list: min width 128 px, max `min(320px, 100vw − 16px)`, max height 20 rem, padding `pad-xs`, `surface-3` with ring and `shadow-popover`; option rows with a 12 px check on the chosen one; typeahead resets after 600 ms; at most 500 options. It matches the native menu popup. No mod in the project uses it yet: UNVERIFIED on screen.

## Link

`text-accent`, underline on hover, radius 3 px. For a mod (a "remote" author) only public `https:` hosts are live; anything else draws as text. Inside a `Client` it draws nothing (CODE, 4.4212).

## Svg

An `img` with a data URI, or a sandboxed, scriptless iframe when `isInteractive`.

- The host injects its ink and the system font, so `currentColor` follows the theme. Use `currentColor` with `fill-opacity`/`stroke-opacity` for neutral shapes: divider `.06`, lanes `.32`, dashed ends `.2`, hollow dot `.6` (OBS).
- `alt` must be non-empty after a trim, or the Svg is refused (OBS).
- Source at most 131,072 characters; width and height at most 4,096.
- A press never reaches the mod from inside an Svg. Keep the Button beside it.
- Text inside an Svg draws in the system font: keep text out.
- One width for every row's Svg, or the text after it shifts per row (OBS). Stacked per-row Svgs join without seams; use `stroke-linecap="butt"`, since round caps double the ink at each join (OBS).
- A literal color in an Svg cannot follow the theme. Each one needs approval and an allow-list entry.

## Code and Markdown

- `Code format="diff"` uses the native diff renderer.
- Markdown from a mod: public `https:` links only; images may draw. Control characters are refused in Text and Markdown: strip everything except tab and newline from external text before drawing.
- Both draw nothing inside a `Client` (CODE, 4.4212).

## Client

A mod-owned component with its own frame clock. Desktop caps its tree at the same 2,000 nodes.

- Elements inside: no `Progress`, no nested `Client`.
- Absolute layers with `width/height="100%"` fill the whole region and draw one solid block (OBS). Keep meters in plain flow there.
- A local named `h` or `Fragment` shadows the JSX factory: Desktop shows "h is not a function", and neither `tsc` nor the test kit catches it.
- In a transcript tool row the widget disappears when Desktop collapses the tool group.

## Hover

- A keyed Box is the scope: `data-hover-box`. Hover rules are injected as `!important` under `@media (hover:hover)`.
- Box hover may change: `borderStyle`, `borderColor`, `borderDimColor`, `backgroundColor`, `display` (only `'flex'`), `top/left/right/bottom`. Text and Button hover: `color`, `backgroundColor`, `dimColor`, `bold`, `italic`, `underline`, `strikethrough`, `inverse`.
- **Hover card**: a Box with `position="absolute"`, `display="none"` and `hover={{ display: 'flex' }}`, inside a visible keyed Box. The engine refuses a keyed Box that is itself hidden.
- **Lifted card**: where the site passes `liftsHoverCards` (the band and the rail pane do; the dock pane does not) and the hover has no `scope`, the card becomes a `popover="manual"` element in the top layer. The host then:
  - strips the card Box's own position, size, margin, padding, border and background props;
  - paints `surface-3`, text-primary, radius + 4 px, ring and `shadow-popover`, padding `pad-md pad-lg`, `max-width: min(360px, 100vw − 16px)`;
  - places it above or below the anchor with 8 px margins;
  - shows it on pointer enter or focus, hides it 150 ms after leave, closes on Escape;
  - makes the anchor focusable (`tabindex=0`, `aria-describedby`).
- In a dock pane the card draws in place, exactly as the mod wrote it: there the mod owns border, background, padding and position, and the card can be clipped by the pane. Seen on 5.11492 (OBS): a card with a `round` border and no `backgroundColor` is transparent, so the rows under it read through its text; unkeyed rows inside it draw on top of each other. With `backgroundColor="composerSidebarBackground"` and keyed rows it covers what is under it (HARNESS; OBS 5.11492 in dark after the fix in `git-pane`: opaque `#191919`, ring `#474747`). `recipes.md` recipe 5 has the form.
- The lifted card on screen (OBS 5.11492, dark): 360 px with its ring, fill `#1f1f1f`, ring `#282828`, left edge on the anchor's left edge, 4 px above a 28 px Button.
- The lifted card looks like a native popover (light in light mode), not like the native Tooltip, which is dark in both modes. A mod cannot get the native Tooltip.
- Known results (OBS, 2026-11-09): `inverseText` in a lifted card vanished; moving across adjacent anchors leaves a stair of cards for 150 ms each; a card with a hover `scope` never showed; the card anchors at the keyed Box and ignores `left`/`right`.
