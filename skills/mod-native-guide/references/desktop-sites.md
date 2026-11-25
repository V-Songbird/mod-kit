# Render sites on Desktop (5.11492.5.0, engine 2.1.325)

CODE unless marked: engine chunk a Desktop bundle file, Code-tab sites a Desktop bundle file, and the 2.1.325 types and `reference.md`. OBS lines are from owner screenshots.

## AbovePrompt (the band)

What the host does to a tree there:

- **One row per plugin** (2.1.325): the hook is asked once per plugin (`e.plugin`), and `AbovePromptList` stacks the rows with `gap sm`. Another mod's answer or invalid tree cannot blank yours. A hook with nothing to show returns `next(e)`. The older rule "compose the band with `await next(e)`" is stale for this build, but harmless.
- Props: `hasSurvey`, `isWorking`, `maxRows: 12`, `bodyColumns`, `scroll`, `view` (and `isCollapsed` in the types). Return `next(e)` untouched when `hasSurvey`.
- Row: a card with 8 px padding, 10 px radius and the alpha-1 fill; min height 40 px, max `11lh + 40px` (CODE; 40 px and the fill measured on owner shots, light `#f3f3f3`, dark `#252525`).
- Ink: `--engine-dim-ink` is `var(--muted-as-secondary, text-muted)` there (CODE: the band's own `:host` rule; where no site sets the variable, `dimColor` falls back to text-secondary). The color layer Desktop ships sets `--muted-as-secondary` to the secondary ink, so `dimColor` text measures the same as elsewhere (60% black, 57% white: HARNESS, and OBS 5.11492 in dark); it is the lighter muted ink only on the base colors; `--engine-button-dim-ink` is text-secondary.
- Controls use the `--sm` token set and are centered on the text line: every Button is 28 px tall with 10 px side padding, 7 px radius and 14 px text (HARNESS; compact: 20, 6, 5, 12).
- A **plain Button is forced to that same control shape** on the band (28 px tall, 10 px padding, `min-height: 0`). It no longer hugs its text.
- Input, Select and submit: `1lh` tall, `pad-sm`; a textarea grows to 12 lines.
- Hover cards are lifted to native popovers (see `desktop-elements.md`).
- On screen (OBS 5.11492, dark): the row is 40 px on `#252525`, as wide as the composer and 8 px above it; text and controls start 15 to 16 px inside the card; `dimColor` text is `#a1a1a1` (57% white over the fill); a hovered `plain` Button is 28 px high with a shade of about 7% white.
- `bodyColumns` is not the band's real width on Desktop (OBS, 2026-11-07/08: a band about 60 columns wide laid out as if under 42). Draw one `flexWrap="wrap"` row with `rowGap="xs"` and let the surface wrap.

**Native notice layout.** The host reshapes a tree into its own notice only when it has one of two shapes:

1. a row whose children are text, then only Buttons, as direct children;
2. a column of text whose last child is a Button, or a row that starts with Buttons.

Then: copy goes left, actions go right with `gap-sm`, a `role="dismiss"` Button becomes the close X at the band's trailing edge, and a first-child Box with `flexShrink={0}` in a two-child column becomes the lead slot. Buttons wrapped in their own Box with props do not match, and the tree draws as written. Use the shape when the band is a notice with actions; a status ribbon is drawn as written.

- The host's "Turn off" Button and "Plugin turned off / Undo" toast apply only to `@builtin` plugins: the resolver returns an id only for `<name>@builtin` (CODE, the resolver in the Code-tab chunk). A third-party mod's band never gets it.
- A tree with a Box (a meter, a keyed tooltip anchor) between the text and the Buttons does not match either shape, so it is drawn as written: Buttons stay where the tree puts them and no close control appears. That is the case for a status ribbon with a meter.
- A band that sits under a host card can touch it (OBS, 2026-11-03, cause not diagnosed).
- Redraw on a clock when the band shows time: `$.clock.every(ms, () => $.ui.invalidate('ui.render'))`.

## Pane

`$.ui.open({ id, title, focus, closeOnEscape, holdToasts, backgroundColor, rows, columns, placement })`.

| Seat | Frame | Hover cards |
|---|---|---|
| `dock` | a tile beside the chat, `h-full w-full p-lg` (16 px; 12 compact); a tab row "Plugin panes" when several are open | drawn in place |
| `rail` | a section of the session panel, `w-full px-xs py-1`, at most `min(rows ?? 12, 24)` lines | lifted |
| `widget` (`placement: 'widget'`) | a minimized small form; clicks may not reach it | not checked |

- Dock pane on screen (OBS 5.11492, dark): it shares the page color `#191919` with the session panel (317 px wide), behind a 1 px line `#303030`. The host's head is 44 px to its hairline `#353535`, with the title in primary ink and an expand icon and a close X at the right. Content starts 16 px in and rows end 24 px before the right edge, where a 6 px scrollbar thumb lives. A hover card there is see-through unless it has a `backgroundColor`.
- Scroll region: `overflow-y-auto`, `scrollbar-gutter: stable`.
- The host draws the title and a native close X. Do not draw your own close; catch `ui.close` to reset your "open" atom.
- Empty pane: "Nothing to show yet" / "{plugin} has not drawn in this pane". In the rail the line is footnote, muted.
- `e.props.bodyColumns` tracked a drag of the pane's width (OBS). `e.props.scroll.bodyRows` counts the same row unit a Box `height` does: `minHeight: bodyRows` pins a footer to the foot; `height: bodyRows` with a `flexGrow:1, minHeight:0, overflow:'hidden'` list clips the list when a card is open (OBS).
- `columns` is typed for the terminal dock. Whether Desktop honors it is UNVERIFIED.
- An unasked pane needs 144 terminal columns (110 once the person opened it before). On Desktop it opens when asked.
- A title must not be a word the host uses for its own sections ("Context", "Changes", …): `check-mod-look` holds the list.
- Inside a pane, mute with `color="subtle"`; rows are `plain` Buttons with `hover={{ underline: true }}`; sections follow the session panel (`native-components.md`).

## SessionMode (footer)

The hook returns the engine's tree plus one Button:

```tsx
<Box flexDirection="row" gap={1}>{r}<Button key="x-toggle" plain dimColor={!isOpen} onPress={toggle}>Name</Button></Box>
```

- Buttons with a string `key` and `label` are pulled out first and become chips; the rest is inline text.
- Chip CSS (`!important`): `inline-flex`, `max-height:1lh`, margin `0 .25ch`, padding `0 .5ch`, radius 4 px, `bg-neutral`; hover `bg-neutral-hover`. The hotkey cue is hidden.
- The strip is `text-body text-secondary`, one line, max width 24ch, min 3ch. A native tooltip shows the full text (300 characters at most) only when it overflows: the one place a mod gets the native Tooltip.
- On screen (OBS 5.11492, dark): the chip "Git" is 23 × 13 px, a little over its 10 px capitals and well under the `1lh` the rule allows; fill `#252525` (5% white), text `#a1a1a1` when off; 16 px before the model name.
- So: one short word, sentence case, `dimColor` when off. Show the chip only when the mod applies to this project.

## Status lines (`$.ui.status`)

`text-footnote text-muted-as-secondary`; the plugin name in caption size before the text; each text capped at 32ch when crowded; overflow behind a `+N` ghost button whose popover is titled "Plugin status lines" (width 20 rem). Write the text without the plugin name.

## Toast (`$.ui.toast`)

A native info toast: `<plugin>: <text>`, cut at 240 characters (CODE, re-read in 5.11492: 239 plus "…"), on screen for at least 6 s: the Code tab shows it for `Math.max(timeoutMs, 6000)` (CODE, 5.11492: the floor is a 6e3 constant in the shared chunk, imported by the engine chunk), so the engine's 4 s default and any shorter `timeoutMs` become 6 s, the same as a native toast; 60 s at most (a 6e4 constant in the engine chunk). One live toast per session and plugin (`uniqueKey: engine-notice:<session>:<plugin>`) (a new one replaces it), delivered only while the session is visible. Native toasts sit bottom-right in a 360 px column. Write a full sentence with a period, without the plugin name. A toast is never the only record of a result.

`$.ui.log`: a line shown for 10 s. `$.ui.notify` resolves `no-surface` in a Desktop-hosted session (CODE, 4.4212).

## Transcript rows

- No surface CSS: `dimColor` is text-secondary there. Frame `max-height: 70vh`. A withheld row shows "…" after 5 s.
- `AssistantMessage` on Desktop gets only `text` and `isFirstOfReply` (OBS). Wrapping it with `next(e)` puts added content under the reply.
- A plain dim line is easy to miss; a bordered `round` Box gives a result weight. A pending state is one dim line, never a colored card: a green card read as a verdict before there was one (OBS).
- Spinner site: `1lh`, `nowrap`.

## Sites added in the 2.1.325 types (not used by the project yet: UNVERIFIED on screen)

- `Placed`: a row in the conversation, from `$.ui.place({ id })`.
- `Backdrop`: a scene behind the chat (`absolute inset-0 -z-10`, inert), with blur, tint and opacity for the glass over it.
- `Theme`: `$.theme.set({ colors, backdrop, overrideColorScheme })` with `makeColors` (bundled `look.md`, `make-colors.js`). A look never reaches the terminal. Re-coloring Claude is the opposite of blending in: only on the owner's explicit request.

## Not mounted or not drawn in the Code tab

`PromptHint` (Cowork only), `$.prompt.suggest` (reported shown, not drawn, on 4.16336; the 5.11492 code paints it, unseen: `engine-behaviour.md`), `$.ui.selection`, `Raster`, `Image`, `ToolProgress`, `TurnDuration`, `InfoNotice` (terminal only). CODE, 4.4212; re-check before relying on any of them.

## Host additions to remember

- The host prefixes the plugin id on toasts, status lines and command text.
- A command name equal to another plugin's command is refused; a command that opens a pane answers `{}`.
- `$.prompt.submit` of a text starting with `/` is refused; run commands with `$.command.run`.
- Alt+1..5 reach Desktop on Windows as the glyphs `☺ ☻ ♥ ♦ ♣` with no key attached (OBS); a `prompt.edit` hook must accept both forms.
