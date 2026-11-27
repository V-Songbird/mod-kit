# The terminal side (engine 2.1.325, partly re-read on 2.1.330)

CODE: read by a helper in the carved engine modules of 2.1.325 (an engine module renderer, an engine module validators and tables, an engine module themes, an engine module sites) and spot-checked by the coordinator (spacing table, Progress lowering, Button drawing, 8 constants). OBS lines are owner screenshots of Windows Terminal. Theme values: data/terminal-themes-2.1.330.tsv (kept in the source repository, not shipped).

2.1.330 re-read (2026-11-26): the validators, element tables and Progress lowering are in an engine module, the themes in an engine module. Confirmed there: the 12-element table, the depth, node and character limits, Progress lowering, the toast bounds and default, the band controls. The Ink drawing of each element (Button brackets, Input hint, Select window, Markdown rows, border styles) was not located: the carve was narrow and searched literal glyphs, which the code writes escaped. Those rows stay 2.1.325 readings.

## Elements

Terminal table: `Box`, `Text`, `Button`, `Input`, `Select`, `Link`, `Code`, `Markdown`, `Progress`, `Client`, `Raster`, `Image`. No `Svg`: `$.ui.resolve(e)` gives a stub that draws nothing for it, and `'Svg' in ui` is still true (probe, `engine-behaviour.md` section 0), so test `e.surface === 'terminal'` and draw a glyph instead. Limits: depth 32, 20,000 nodes, 100,000 characters (then "… N more characters, not drawn").

| Element | How it draws |
|---|---|
| Box | Ink box. Numbers are cells on both axes. Steps: `xs`/`sm` 1 across, **0 down**; `md` 2/1; `lg` 3/1; `xl` 4/2. `height: 0.3` is a full row. A bordered Box is three rows tall |
| `borderStyle` | `single`, `double`, `round`, `bold`, `classic`, `arrow`, plus `dashed` (`╌ ╎`, no corners) and `quote` (a left `▎` bar). An unknown style is dropped silently |
| Text | `size`, `mono`, `tabular` dropped; `weight` semibold or bold becomes bold. `dimColor` **replaces** `color` with the theme's `inactive`. Default `wrap` is `"wrap"` |
| Button | not plain: bold `[ label ]`; `variant="primary"` colors it `suggestion`; `secondary` and none look the same. Plain: `1: label` with the hotkey in `suggestion`, or just the label. Focus, pointer or site focus: `inverse`. `dimColor` only at rest. `role` ignored. The hotkey is invisible on a non-plain Button |
| Input | at rest `label: value` (dim placeholder), one row, truncated. Focused: an editor at least 12 columns wide, then a dim hint ` ⏎ submit` (or the `submitLabel`); several rows add ` · shift+⏎ new line` |
| Select | closed: `label: value ▾` (dim `none`); open: `▴` and a window of 8 rows, each indented two spaces, the highlighted one inverse, then dim `  … N more` |
| Link | the label as an OSC 8 link; without support, the label plus the dim URL |
| Code | measured width, else the site's columns, else 80; `startLine` turns on numbers |
| Markdown | the CLI's renderer; tables in single box lines, 200 rows at most, then "… N more rows not shown" |
| Progress | lowered by the engine: a line `label` + dim figure (`valueText`, or a percent clamped to 1..99 between the ends, or "Running…"), then a one-row bar: track `userMessageBackground`, fill `color ?? "suggestion"`. No bar and no animation without a fraction |
| Client | a clipped box; elements inside exclude Client, Raster, Image, Progress |

- A long Button label wraps onto a second row: cut it yourself, `cut(title, bodyColumns − reserved)`, with "…".
- The terminal pads a glyph Button with a space each side, so the press area is three cells (OBS). A hit area the width of one glyph is too small: pad it.
- A keyed Box is a hover scope here too (pointer reporting needed). There is no hover card worth relying on: draw tooltips only on Desktop, and make the terminal control self-explanatory.
- Hover prop sets are the same as Desktop's. A Button's `hover` needs a keyed Box around it or a named `scope`.

## Colors

Six themes: dark, light, dark-ansi, light-ansi, dark-daltonized, light-daltonized; 72 keys each. Any of the 72 works as a color (`hasOwn(darkTheme, key)`); only 23 are typed. Literals `rgb()`, `#hex`, `ansi256()`, `ansi:name` pass through. An unknown key draws no color.

| Key | dark | light | dark-ansi | Notes |
|---|---|---|---|---|
| `text` | 255,255,255 | 0,0,0 | whiteBright | |
| `inverseText` | 0,0,0 | 255,255,255 | black | |
| `inactive` (= `dimColor`) | 153,153,153 | 102,102,102 | white | |
| `subtle` | 80,80,80 | 175,175,175 | white | very low contrast: values only |
| `suggestion`, `permission` | 177,185,249 | 87,105,247 | blueBright | the terminal's "blue" is periwinkle |
| `success` | 78,186,101 | 44,122,57 | greenBright | blue in the daltonized themes |
| `warning` | 255,193,7 | 150,108,30 | yellowBright | |
| `error` | 255,107,128 | 171,43,63 | redBright | |
| `claude` | 215,119,87 | 215,119,87 | redBright | brand |
| `promptBorder` | 136,136,136 | 138,138,138 | white | |
| `rate_limit_fill` | 177,185,249 | 87,105,247 | **yellow** | untyped; lavender in dark (OBS 2.1.325); light-ansi turned from yellow to blue in 2.1.330 |
| `rate_limit_empty` | 80,83,112 | 213,218,253 | blackBright | untyped; in 2.1.330 the light themes got a pale track (was 39,47,111, a dark one) and the ANSI themes swapped white and black. Seen in Windows Terminal (OBS 2.1.330): 80,83,112 under fill 177,185,249 in dark, 213,218,253 under 87,105,247 in light; the terminal kept its own dark ground under the light theme |
| `userMessageBackground` | 55,55,55 | 240,240,240 | blackBright | untyped; the Progress track |
| `composerSidebarBackground` | 38,38,38 | 245,245,245 | blackBright | untyped |

Lessons (OBS and CODE):

- The same key is a different hue per surface: `rate_limit_fill` is blue on Desktop, lavender in the dark terminal, yellow in dark-ansi and blue in light-ansi (2.1.330). For blue **ink** in the terminal use the typed `suggestion`.
- A fixed hex (`#fab219`, `#d03b3b`) is the same on every theme, which is why the meter's warning and danger fills are hex and the blue is a key.
- Daltonized themes swap green and red for blue and orange: never carry meaning by `success` versus `error` color alone. Pair a mark (`✓`, `✗`, `⚠`) with the color.
- ANSI themes have 16 colors: several keys collapse to the same one. Shape, not hue, must carry state.

## Site framing

| Site | What the engine draws around the mod's tree |
|---|---|
| Pane, inline (above the prompt) | a `round` border, dimmed when not focused, `paddingX: 1`; `bodyColumns = columns − 4`; height a third of the terminal by default; a dim `✕` at the top right of the frame |
| Pane, dock (fullscreen) | no border; width `min(45%, 90, columns − 70)`, never under 24; the transcript keeps 60 columns |
| Pane title | passed to the hook as a prop; with one pane the engine draws no title bar (INF): draw your own heading in the terminal |
| Band | width `columns − 5`; a `[-]` collapse control at the top right; collapsed: dim `▸ plugin panel hidden · <chord> or click to show`; a taller tree scrolls with a dim `↑ N more · ↓ N more`; at most half the terminal's rows |
| Footer (`SessionMode`) | dim text after the engine's segments, joined by a dim ` · ` |
| `PromptHint` | dim, one row, truncated |
| Toast | `plugin: text`, 4,000 ms; a stacked box in fullscreen, else one notification line. `timeoutMs` is a whole number, 1 to 60,000, else the call is refused (CODE, the 60000 maximum and the 4000 default). A toast still waiting gives way, unseen, to the same plugin's newer one (CODE, engine text "gives way to the plugin's newer ones, unseen"). New in 2.1.330 types: the first 2,000 characters are drawn (10,000 remotely); `holdToasts` keeps toasts waiting undrawn, and past 50 waiting the oldest leaves (CODE, the 50) |
| `$.ui.log` | `to` is `transcript` (default) or `debug`; the terminal draws the first 2,000 characters, a remote surface 10,000, the debug log keeps 10,000 (types 2.1.330; the clipping code was not found). The 120 and 1,000 limits earlier read here belong to `$.ui.notify`: title clipped at 120 on one line, text at 1,000 (CODE 2.1.330) |
| Status | a pinned low-priority notification line `plugin: text` |

`bodyColumns` is exact in the terminal: tier layouts by it there (the project uses 78 and 42 for the band, 48 and 32 for a pane).

## The CLI's own conventions

Match these when a mod draws text UI in the terminal.

| Thing | Convention |
|---|---|
| Message or tool bullet | `●` (`⏺` on macOS) |
| Result sub-row | dim `⎿` with the result beside it |
| Status marks | `✓` success, `✗` failure, `⚠` warning, `○` pending, `◐` working, each with its theme key |
| List cursor | `❯` on the selected row, a blank of the same width on the others |
| Disclosure | `▸` closed, `▾` open (Select: `▾` / `▴`) |
| Breadcrumb | `a › b` |
| Marker cell | 2 columns wide: glyph plus a space, so text never jumps |
| Key hints | dim, key first, lower-case action, joined by ` · `: `↑/↓ to navigate · Esc to close`; `(ctrl+o to expand)` |
| Truncation | `…` (U+2026) only; `… +N more lines`; `↑ N more · ↓ N more` |
| In progress | present participle ending in `…`: "Moving to background…" |
| Durations | `12s`, `3m 4s`, no zero padding |
| Spinner | `· ✢ ✳ ✶ ✻ ✽`, or braille frames |
| Close mark | `✕` |
| Frames | `round` for dialogs, panes and the prompt; `single` for tables; `─` rules; `▎` quote bar; tree `├ └ │` |
| Emphasis | dim for meta and hints, bold for the key noun, `inverse` for the focused row, theme color for state; background colors only for message blocks |
| Brand mark | `✻` in `claude` for first-party items: not for mods |

Glyphs that break (OBS, Windows Terminal): `❆` is wider than one cell, `❄` renders as an emoji, `☑ ✔` vary by font. Block-glyph meters (`▰▰▰`) read as "terminal", not as Claude: use a Box meter even here. Safe marks the project uses: `● ○ ◉ ▸ ▾ ★ ↑ ↓ │ ┆ ╮ ╭ ╯ ╰ ─ ⋯ ■`.

## Branching pattern

```tsx
const isTerminal = e.surface === 'terminal'
const columns = e.props.bodyColumns ?? e.viewport?.columns ?? 100
const isWide = !isTerminal || columns >= WIDE_AT   // tiers only where the count is exact
```

Branch on the surface for: meter (one-row track vs thin pill), swatch and divider (glyph or nothing vs Svg), hover cards (none vs card), label cutting (manual vs CSS ellipsis), vertical gaps (`xs` is 0 rows: use a number or `md` where a blank row is wanted), Input offset (`marginTop` 0 vs 0.4), glyph padding (spaces vs none).
