# Native components and surfaces to imitate (Desktop 5.11492.5.0)

CODE: read by two helpers in the renderer bundle (a Desktop bundle file, a Desktop bundle file, the Code-tab chunks) and spot-checked by the coordinator (12 constants re-read: tooltip delay and width, toast timeout, list caps, rail width, desktop cursor). Sizes are compact | comfortable px; Desktop runs comfortable with the second color layer, so take the second figure (and 28, not 32, for a control height with a mouse: `harness-measurements.md`). More components: `native-catalog.md`; the surfaces around a mod: `codetab-surfaces.md`. This is the look to match; a mod reaches it only through the elements in `desktop-elements.md`.

## Controls

| Control | Height | Pad x | Radius | Text | Rest | Hover |
|---|---|---|---|---|---|---|
| Button secondary | 24 \| 32 | 8 \| 12 | 6 \| 8 | body, 400 | `fill-secondary` + 1 px ring + faint drop shadow | `fill-secondary-hover` |
| Button primary | same | same | same | body, 500 | `fill-primary` | `fill-primary-hover` |
| Button ghost | same | same | same | body, 400 | transparent | `fill-ghost-hover` |
| Button danger | same | same | same | body, 500 | `fill-danger` | `fill-danger-hover` |
| Icon-only button | square | 0 | same | | per variant | tooltip from its `aria-label` |
| TextInput | 24 \| 32 | 8 \| 12 | 6 \| 8 | body | `fill-field` + 1 px ring | stronger ring |
| TextArea | auto | 8 × 6 \| 12 × 8 | 6 \| 8 | body | same | same |
| Combobox | 24 \| 32 | 6 \| 8 | 6 \| 8 | body | field (outline) or transparent (ghost) | |
| Checkbox / Radio | 16 \| 20 | | 4 \| 5, full | | 1 px `border-strong`; checked `fill-accent` | |
| Switch | 16 \| 20 high, 1.8× wide | 2 | full | | track 20% ink; on `fill-accent`; knob white | 120 ms overshoot |
| SegmentedControl | 24 \| 32 | 8 \| 12 | 6 \| 8 | body | track 5% ink, thumb white with ring | item `fill-ghost-hover` |
| Tabs | 24 \| 32 | 8 \| 12 | | body; active 500 | 2 px underline in text-primary | muted to primary |
| Menu item | 24 \| 32 | 8 \| 10 | 6 \| 8 | body | transparent | `fill-ghost-hover` |
| Tooltip | min 24 | 8 × 3 | 6 fixed | 13/18 fixed | `tooltip-bg`, dark in both modes | |
| Kbd | 1em + 6 px | 3 | 4 | caption | 1 px border at 18% | |

Button sizes come from `data-size` scopes, not classes: xs 20 | 24, sm 20 | 28, base 24 | 32, lg 28 | 40. Inner gap 6 px. Button text is 400 except primary and danger (500).

On screen (OBS, build 4.16336, `native-screens.md`): a default secondary Button is 28 px high with 10 px side padding and a 5% ink fill; a large one 40 px; the small action in the rail 24 px; a menu item 28 px; a field 28 px; the destructive confirm is a red tint with red text, not a solid fill; switches are 20, 18 and 16 px high in Settings, menus and the rail.

What a mod Button matches: `variant="secondary"` is the native secondary without ring on generic sites; `variant="primary"` is the native primary; `plain` is close to ghost but only 1 line high (20 px) with 6 px padding. There is no danger, brand or icon-only variant for mods.

### States shared by every control

- **Focus**: one ring, `--cds-focus-shadow` (1 px page-colored inset, 1 px accent ring, 6 px soft glow), on keyboard focus only. Native outline is hidden.
- **Hover**: ghost things take 5% ink (7.5% dark). **Pressed / selected / menu open**: 10% (15% dark). **Active row**: 10%.
- **Disabled**: opacity .4, no pointer events. A disabled control with a reason is wrapped so its tooltip still shows.
- **Busy**: label hidden, a 12 px spinner in its place after a short delay.
- **Cursor**: the arrow, not a pointer, on the desktop platform.
- **Motion**: color changes 60 ms; tooltips, checks, knobs 120 ms; dialogs, toasts, collapsibles 200 ms. Overlays enter from `scale(.98)` and opacity 0. Everything stops under reduced motion.

### Tooltip (the thing a mod cannot have)

Open delay 300 ms; a group shares it and closes 200 ms after; side top, offset 4 px; max width 240 px; one open at a time; opens on keyboard focus; closes on click; no arrow; 120 ms fade and scale. Text 13/18, radius 6, always in a dark scope (`tooltip-bg` `#0b0b0b` light; dark `#303030` on the color layer Desktop ships, `#20201f` on the base colors). A second "detail" line is 11/14 in text-secondary. A shortcut shows as plain 12 px key text. `OverflowTooltip` shows only when the text is truncated.

A mod's hover card differs in every one of these: no delay to open, 150 ms to close, light surface, 360 px, popover shadow. Keep hover text short (one line, a noun phrase or one sentence) so the difference stays small.

### Menu and popover

Popup: min 128, max 320 px wide, radius 10 | 12, `surface-3`, ring plus `shadow-popover`, 4 px gutter. Item: gap 6 | 8, 13 | 14 px text; highlighted `fill-ghost-hover`; danger item in text-danger. Group label: footnote, medium, muted. Separator: 1 px `border`, 4 px above and below. Trailing text: footnote, muted, max 160 px. Popover offset 6 px.

### Dialog and confirmation

Panel `surface-3`, radius 10 | 12, padding 20 | 24; widths 400 (sm) to 1152. Title 20 | 22 semibold (alert: heading, medium); description body, text-secondary. Footer right-aligned, 8 px gap, **Cancel (secondary) first, confirm last**; destructive confirm is the danger variant; focus starts on confirm. Backdrop `#0006` light, `#00000080` dark. A mod has no dialog: `$.ui.ask` is the host's, and the project's pattern for a dangerous action is to fill the prompt.

### Toast and banner

Toast: 360 px column, 16 px from the right and bottom, `surface-3`, radius 10 | 12, padding 12 × 8 | 16 × 8, 6 s default, neutral / warning / danger, leading 16 px icon, body text, title medium, a ghost X. Stacks with a 14 px offset and 4% shrink per older toast.

Banner: radius 10 | 12, padding 12 × 8, `surface-1` (neutral), `bg-warning` + text-warning, `bg-danger` + text-danger; icon, text, then actions (ghost for dismiss).

### Small pieces

| Piece | Spec |
|---|---|
| Counter | pill 18 | 22 px high, caption, medium; caps at "99+"; hidden at 0; dot mode 8 px; variants in `native-forms.md` |
| Pulse | 6 px dot, `fill-accent`, pulsing |
| Spinner | 12 / 16 / 20 px ring, 1 s linear |
| Separator | 1 px `border` |
| Skeleton | 1em high, radius, 5% ink, 2 s sheen |
| Meter | track 4 px (xs, sm) or 8 px, `rounded-full`; label body; value footnote, text-secondary, tabular, right |
| StackedMeter | 4 px (sm), 8 px, 28 px (lg); round outer ends, **2 px seams, square joints** by the code; **1 px** seams in the track color on screen in 4.16336 (OBS); a segment is never under 1 px |
| ChartLegend | swatch 12 × 12 rx 3 (10 × 10 rx 2 in the Context legend); label footnote, text-secondary; value caption, tabular |
| DiffIndicator | caption, medium, tabular; `+N` in git-added, `−N` (U+2212) in git-removed; zero omitted |
| Collapsible trigger | body, text-secondary to primary on hover, caret rotates, panel height 200 ms |
| Field | label body medium; hint footnote muted; error footnote text-danger with a warning icon |

## Session panel (right rail): the model for a pane

Width 320 px. Sections in order: Environment, Goal, Connectors, Context, Progress, Outputs, Changes, Servers, Background tasks. The person can reorder and hide them.

**Section card**: padding 8 px top and bottom; a 1 px hairline at 5% ink, inset 16 px, between cards.

**Section head** (24 px: the class merger is tailwind-merge, CODE, so the later `min-h-6` wins; which constant is that later class is INF, and no screenshot shows the box: `native-forms.md`): title `footnote`, **medium**, text-primary; then a caret in muted ink (shown on hover or focus while open, always while closed); then a right-aligned summary in footnote, muted, hidden while open; actions and a drag grip appear on hover. Alt-click toggles all.

Summaries: a count ("3"), `{done} of {total}`, `{count} running`, a whole percent with a 12 px ring, or a warning in text-warning with a 12 px icon.

**Row** (26 px min, 32 in the lined rail): gap 8 px; a 20 px lead glyph slot in text-secondary; label body, text-primary, truncated with an overflow tooltip; trailing detail footnote, muted, tabular. Pressable rows: radius 6, hover 5% ink, active 10%, menu-open 10%, focus ring.

**"Show more" / "Show less"**: a full-width muted row that turns primary on hover. Caps: Outputs 5, Background tasks 4, Servers 4. Sub-lists scroll at 240 px.

**Context section**: a 4 px StackedMeter with 2 px seams; the line `{used} / {max} ({pct}%)`; legend rows in footnote: 10 px swatch, name in text-secondary, tokens muted tabular ("12k", "1.2M"), percent in text-primary, tabular, right-aligned in 44 px, one decimal ("12.3%"), "—" for none. At most 6 rows: the 5 largest plus "Other" in the reference gray.

**Background tasks**: icon, title, elapsed time (muted, tabular), a ghost stop button; states "Stopping…"; a last row "{count} finished".

**Formats**: counts `1.2B`, `1.2M`, `1.2k`, `.0` stripped; collapsed percents whole, breakdown percents one decimal; durations in narrow units ("now", seconds, "4m 05s", hours and minutes, days and hours); file times hour and 2-digit minute; label and value joined by " · ".

## Composer and footer

- Footer row ("chin"): min height one control, footnote, text-secondary, 6 px above; items are ghost Buttons forced to regular weight and text-secondary; hover 10% ink; order branch, worktree, model and effort, permission mode. A mod's footer chip sits in this row.
- Send: a square primary Button (24 px). Stop: ghost icon-only.
- Usage popover: 360 px wide, padding 12 px; rows label left (footnote, primary), value right (footnote, muted, tabular); bar **4 px high, radius 3 px**, track `bg-alpha-1` in the code (5% ink) but 10% black and 10% white on screen in 4.16336, each with a 1 px edge one step stronger (OBS, `native-screens.md`); fill `fill-accent`, `fill-warning` from 75% used, `fill-danger` from 90% (CODE, re-read, a Desktop bundle file @504135); strings "{percent}% used". The footer ring is 12 px, stroke 2, round caps.

## Transcript

- User bubble: radius 10, padding 12 × 8, max width 85%, heading size (15 px at the comfortable density, 14 compact), tinted `bg-user-message`.
- Assistant text: no bubble, prose size.
- Tool row: padding 10 × 8, body text in muted ink that turns secondary on hover or when open; an xs caret, rotated −90° when closed and hidden until hover; running text shimmers.
- Blocks: 12 px above and below (8 at the ends of a message); inner gap 6 px.
- Steps card: radius 10, inset ring, rows divided by hairlines; title text-primary, detail text-secondary.
- Permission card: `surface-panel`, radius 10, padding 8, shadow; title body medium; description text-secondary; actions wrap with 8 px gaps: "Allow once", "Allow", "Deny".
- Session-proposal card: rows with a top border, 12 px gap, title body, state footnote muted; footer actions right, 6 px apart: ghost "Do it here", primary "Start".
- Errors: text-danger; in the transcript on `bg-danger` with radius and 6 × 2 px padding.

## What this means for a mod

| Native habit | Mod translation |
|---|---|
| Section title footnote medium, summary muted at the right | `Text size="footnote" weight="medium"` in a plain Button with the caret in its label; count in `footnote subtle tabular` |
| Row: glyph, label, muted value | row Box `gap={1}`; mark Text; `<Box flexGrow={1} minWidth={0}>` label; value `footnote subtle tabular` |
| Hover 5% ink on rows | `plain` Button (the host gives `fill-ghost-hover`) plus `hover={{ underline: true }}` |
| 4 px meter, round ends, square seams | thin `round` track Box with `overflow="hidden"`, fill child, `columnGap` seams |
| Values in tabular footnote | `size="footnote" tabular` |
| Lists capped with "Show more" | cap at 4 to 6 rows and add a muted plain "Show more" Button |
| Cancel before confirm, main action last | quiet action left, `variant="primary"` right |
| Arrow cursor, no pointer | nothing to do: the host owns it |
| Tooltip on icon-only buttons | a glyph-only control always gets a hover card that names it |
