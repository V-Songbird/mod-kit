# Native Claude Desktop, measured on screen (builds 4.16336.0 and 5.11492.5)

OBS: 34 screenshots the owner took of the running app on 2026-11-03 and 2026-11-04, dark and light, Windows at 100% scale, with a mouse. Read on 2026-11-14 and measured to the pixel with scripts/harness/scan.ps1 (kept in the source repository, not shipped) (color runs along one row or column). The build is on screen in two of them ("Novedades", 3 de noviembre de 2026, `4.16336.0`; Configuración › Sistema, `4.16336.0`).

This is the only place in the skill where **native** controls were measured on a real screen. The tables down to "Type and layout seen" are build 4.16336, one build behind the code this skill reads. The last three sections are build **5.11492.5**: seventeen captures the owner took on 2026-11-14 (ten dark, seven light), with three mods on screen. Copies of the shots: a private record of the source repository (not shipped) (file names keep the capture time) and a private record of the source repository (not shipped).

How to read a row: "28 px" is a count of pixel rows of one fill, taken through the middle of the box, away from its rounded corners (a scan near a corner reads 2 px short: the first pass made that mistake on two rows, and an independent re-measure caught it).

A value in the first tables is OBS for build 4.16336. Those re-measured on 5.11492 in dark all agree (Button height, padding and fill, switches, meters and their seams, row pitches, inks): the list is in "Build 5.11492.5, native controls". The light theme of 5.11492 was not seen.

## Surfaces

| Surface | Dark | Light |
|---|---|---|
| Page (transcript, panes) | `#191919` | `#ffffff` |
| Sidebar; the content side of the settings dialog | `#1f1f1f` | `#ffffff` |
| Nav column of the settings dialog | `#191919` | `#ffffff` |
| Popover, menu, dialog, tooltip | `#303030`, 1 px ring `#383838` inside | `#ffffff`, 1 px ring outside |
| Composer | `#303030`, 1 px ring `#404040`, 44 px high | |
| Field fill | 5% white over what is behind it: `#252525` on the page, `#2a2a2a` in Settings | `#ffffff` |
| Field ring, 1 px | `#323232` in Settings (about 9% white) | `#ebebeb` (8% black) |
| Card in a pane (background tasks) | `#202020` | `#f9f9f9` |
| Hairline between rail sections | `#252525` | `#f3f3f3` |

The dark popover value matches the token table's second color layer (`#303030`); the ring is inside in dark and outside in light, as the ring tokens say (`native-forms.md`). The field ring does **not** match that layer's token (50% ink in the 5.11492 table): on this build it is a faint 8 to 9% line. Do not read the layer column as proof for field rings.

## Buttons

| Button | Height | Side padding | Fill | Shot |
|---|---|---|---|---|
| Secondary, default size ("Administrar", "Cancelar") | **28 px** | **10 px** | 5% black (`#f2f2f2` on white); 15% white dark (`#4f4f4f` on `#303030`) | settings light, dialogs |
| Secondary, large ("Comprar créditos de uso") | 40 px | | `#404040` on `#1f1f1f` | settings dark |
| Small action in the rail ("Hacer commit de los cambios") | **24 px** | 8 px | `#f2f2f2` | rail light |
| Destructive confirm ("Eliminar") | 28 px | 10 px | a **tint**: `#fbe7e7` with text `#a42528`; focused, a 1 px `#dc3c3d` ring at the box edge, then 1 px of page color, so 26 px of tint show | dialog light |
| Stop, icon only (background task) | 24 × 24 | | `#ececec`, a 10 px black square | tasks light |

Three things the code reading had not shown:

- A native default Button has 10 px of side padding. A mod's Button draws 10 px on the band (the host reshapes it there) and 12 px in a pane (HARNESS): 2 px wider per side in a pane, not visible without a ruler, and no prop changes it.
- The destructive Button on the color layer is a tinted fill with red text, not a solid red.
- The confirm Button takes focus when a dialog opens, so its focus ring shows at once.

## Fields, switches, rows

| Thing | Measure |
|---|---|
| Search field, Select, filter field | 28 px high; focused: 1 px `#257de0` ring one pixel outside, plus a glow that fades over 7 px (the code says 6 px of blur) |
| Shortcut recorder field | 30 px with its ring; fill `#f9f9f9`, ring `#cfcfcf` |
| Switch in Settings | 20 × 36; off track `#cccccc` (20% ink); on `#257de0`; white knob |
| Switch in a menu | 18 × 33 |
| Switch in the rail ("Remote Control") | 16 × 29 |
| Menu item (session menu, model menu) | **28 px** pitch; highlighted row `#3f3f3f` on `#303030`; a separator takes 9-10 px with a 1 px `#383838` line |
| Sidebar nav row ("Crear", "Buscar") | 32 px, 2 px apart (34 px pitch); selected fill `#404040` on `#1f1f1f` |
| Settings nav row | 32 px; selected fill `#e5e5e5` (10% ink) |
| File-tree row | 28 px pitch |
| Rail "Entorno" row (icon, label) | 32 px pitch |
| Rail legend row (swatch, name, tokens, percent) | 24 px pitch; a 6 px larger gap before the deferred group |
| Rail disclosure row ("Herramientas MCP 139") | 24 px pitch |
| Task-list row in the transcript (plan widget) | 30 px pitch, 14 px icon |
| Finished background task row | 44 px card, 8 px apart (light and dark) |
| Usage table row (`/usage` card) | 24 px pitch, 1 px rules: `#cecece` light, `#474747` dark |

A switch is 1.8 times as wide as it is high in all three sizes, as the code says.

## Meters

| Meter | Height | Fill | Track | Shot |
|---|---|---|---|---|
| Context (rail), stacked | **4 px**, round outer ends | segments below | `#ededed` light, `#2b2b2b` dark | rail light and dark |
| Usage popover (footer ring) | **4 px** | `#257de0` | `#e6e6e6` light (10% black) with 1 px outer rows of `#dbdbdb`; `#454545` on `#303030` dark (10% white) with 1 px outer rows of `#4f4f4f` | popover light and dark |
| Usage in Settings | 4 px | `#257de0` | | settings dark |
| `/usage` card, plan limits | **8 px**, round | `#257de0` | `#e4effb` (the accent at 12%) | usage card light |
| `/usage` card, "what is contributing" | 4 px | `#257de0` | | usage card light |

- Stacked segments are separated by a **1 px** seam in the track color (five seams measured in each theme). The 5.11492 code reads as 2 px (`native-components.md`); on screen it is 1 px on 5.11492 too (five seams, dark, 100% scale).
- Segment colors, light / dark: Messages `#257de0` / `#338ced`; System tools `#f47230` / `#e76624`; MCP tools `#00b894` / `#00a888`; Memory files or System prompt `#f2a600` / `#d28e05`; the gray group `#878787` / `#959595`; Autocompact buffer `#c2c2c2` / `#5e5e5e`; Free space is the track.
- Legend swatch: 10 × 10, radius about 2.
- A mod's meter in the shipped mods is 6 px (`THIN = 0.3`). Native thin meters are 4 px; only the `/usage` card uses 8 px. The owner kept the shipped 6 px as the standard on 2026-11-14 (`recipes.md`, meter height).

## Text: ink and size measured

Measured with scripts/harness/ink.ps1 (kept in the source repository, not shipped) (the pixel farthest from the background in a rectangle, and the rows the glyphs cover), 33 text runs. Gray inks are reliable; thin colored glyphs are not (subpixel rendering tints them: the red of `−90` read as `#cd2054`).

| Role, as seen | Light | Dark | Equals |
|---|---|---|---|
| Primary: section title, row label, percent, Button and menu text | `#191919` on white | `#efefef` on `#191919`; `#f0f0f0` on a popover | 90% black, 93% white: the color layer's `text-primary` |
| Secondary: legend name, token count, path, description, dialog body, group label, the "120.7k / 350k" figure | `#666666` | `#9c9c9c` | 60% black, 57% white: the layer's `text-secondary`, and exactly what a mod's `dimColor` and `subtle` draw (HARNESS) |
| Muted: the count at the far end of a disclosure row ("139") | `#888888` | `#757575` | 47% black, 40% white: the layer's lighter `text-muted`. A mod has no key for it |
| Shortcut in a menu, keys in a tooltip | | `#a6a6a6` on `#303030` | 57% white |
| Destructive menu item | | `#f17778` | the layer's `text-danger`. On 6.28899.6 that ink is `#fa8080`, seen on a destructive Button (Settings, the delete Button of stored sessions, Spanish interface, on `#1f1f1f`, fill `#452525`: `bg-danger` 20% over the ground); a menu item itself was not captured there |
| Added lines `+338` | `#1e9e3c` | | `text-git-added` |

So native secondary text and a mod's muted text are the same ink on this build. The one native ink a mod cannot reach is the lighter muted of far-end counts; `subtle` there is one step darker than native.

Glyph heights (capitals and digits, no descender): 9 px for the rail section title, legend figures, group labels and menu shortcuts; 10 px for row labels, "34% usado", nav labels and Button text; 11 px for a Settings heading. Capitals run at about 0.7 of the font size here, so those are 13, 14 and 15 px text: the `footnote`, `body` and `heading` roles of the code. On-screen sizes agree with the role table in `SKILL.md`.

## Type and layout seen

- Rail section title ("Entorno", "Contexto", "Cambios", "Resultados"): small, medium weight, sentence case, no icon; the hairline sits 16 px in from each side.
- Context head line: "48% usado" at the left in primary ink, "167.7k / 350k" at the right in secondary ink.
- Legend: name in secondary ink (underlined when it opens something), tokens in the same secondary ink and right-aligned, percent in primary ink with one decimal, "—" for none.
- Diffstat: `+338` green, `−90` red, tabular, beside a small secondary Button.
- Tooltip with a shortcut: label in primary ink, then the keys in secondary ink ("Modelo  Ctrl+Shift+I"), 28 px high plus its ring, dark surface in the dark theme.
- Menu section label ("Modelo · esta sesión", "Modo rápido"): small, medium, secondary ink. A shortcut letter sits at the far end in secondary ink.
- Badges in a menu ("Predeterminado", "Recomendado"): a transparent pill with a 1 px line, small text. The warning one ("3.5× o más de uso") has an icon and a yellow tint.
- "Necesita tu intervención" chip: 22 px, yellow tint (`#fef3d9` light, `#2b2519` dark), orange-brown text, beside a 12 px ring mark.
- Dialog: title semibold, body in secondary ink with an underlined link, buttons right-aligned, Cancel first, the confirm last.
- Empty states: one centered line ("No hay cambios para mostrar"), or an icon, a medium line and a two-line hint in secondary ink ("Los archivos abiertos aparecen aquí").
- Running tool line in the transcript: an animated three-dot mark, the action in secondary ink, a lighter duration ("3min 14s", ink not measured), a small caret.

"Muted" in this file means only the lighter 47% / 40% ink of the far-end count; everything else that reads as gray was measured as the secondary ink.
- Interface language: Spanish (es-419) for the app's own strings; the `/usage` tooltip from the engine stayed in English.

## Build 5.11492.5, native controls (dark)

OBS, 2026-11-14: seven owner captures, dark, 100% scale; the version reads `5.11492.5` in Configuración › Sistema. 182 scans and ink runs with `scan.ps1` and `ink.ps1`; the raw runs are in a private record of the source repository (not shipped) and `scan2-5.11492.txt`.

| Thing | 5.11492.5 | Against 4.16336 |
|---|---|---|
| Page, session panel, dock pane | `#191919` | same |
| Settings content; its nav column; the line between | `#1f1f1f`; `#191919`; 1 px `#303030` | same |
| Default Button ("Administrar") | 28 px high, 90 px wide for 72 px of ink: 10 px side padding; fill `#404040` on `#1f1f1f` (15% white); label `#f2f2f2` | same |
| Two Buttons side by side | 12 px apart | new |
| Button with a leading icon ("Cambiar") | the icon's ink starts 6 px from the edge | new |
| Select ("Estable") | 28 px, 160 px wide, fill `#2a2a2a` (5% white), no ring to see, text 8 px in | height and fill same; the 9% ring of the 4.16336 field is not on this control |
| Search field in the nav column | 28 px, fill `#252525` (5% white), no ring | same |
| Shortcut recorder field | 30 px with its ring; fill `#0b0b0b`, ring `#4c4c4c` | size same; dark values new |
| Switch in Settings | 20 × 36; off track `#363636` (10% white); on `#257de0`; white 16 px knob, 2 px in | same size |
| Switch in the rail | 16 × 29 | same |
| Settings row with a description | 69 px pitch; 1 px hairline `#2a2a2a` (5% white) | new |
| Settings nav row | 32 px; selected fill `#3b3b3b` on `#191919` (15% white) | same height |
| Scrollbar thumb | 6 px, `#5e5e5e` | new |
| Rail "Entorno" row; legend row | 32 px pitch; 24 px pitch | same |
| Rail hairline between sections | `#252525` | same |
| Context meter | 4 px; 1 px seams `#2b2b2b`; segments `#338ced`, `#e76624`, `#00a888`, `#959595`, `#5e5e5e` | same |
| Legend swatch | 10 × 10, round corners, gray edges with no color fringe | same |
| Small action in the rail ("Hacer commit de los cambios") | 24 px; fill `#252525` (5% white) | same height |
| Composer | `#303030`, 1 px ring `#404040`; an attachment tile is 120 px wide | ring and fill same; the tile agrees with the code (`composer-and-pr.md`) |
| Primary ink | `#efefef` (`#f0f0f0` to `#f2f2f2` on a fill) | same |
| Secondary ink | `#9c9c9c` on `#191919`, `#9e9e9e` on `#1f1f1f` (57% white) | same |
| Muted far-end count ("158") | `#757575` | same |
| Link in a description | `#6aabf1` | new |
| Composer placeholder | `#878787` on `#303030` (42% white) | new |
| Capital heights | 11 px Settings heading, 10 px labels and Button text, 9 px rail section title | same |

The rail section title ("Entorno", "Contexto", "Resultados", "Cambios") is in the **primary** ink at 9 px capitals (13 px text). A mod's section head by recipe 6 is secondary ink at 10 px capitals: the two sit side by side in capture 4 and differ in both.

## Build 5.11492.5, mod sites beside native controls (dark)

OBS, the same seven captures, plus three taken after fixes (08 the legend, 09 and 10 the commit graph). The mods are this project's `usage-ribbon` (band) and `git-pane` (dock pane, footer chip), and in capture 06 the Roadmap pane of the Foreman plugin 4.5.0, the descendant of this project's former mod `roadmap-pane`, which now lives in Foreman and is no longer in this repository (see the two corrected items at the end of this section). This is the first time a mod site was measured in the running app; each line says what agrees with the harness and what does not.

**Band (AbovePrompt).**

- One row: 40 px high, fill `#252525` on `#191919`, as wide as the composer, 8 px above it. The first and last ink sit 15 to 16 px inside the card. Agrees with CODE and HARNESS.
- Text: 10 px capitals (14 px). `dimColor` label and value `#a1a1a1`, which is 57% white over the band's fill: the same strength as native secondary text. Bold labels `#f0f0f0`.
- Meter of recipe 1: 6 px high, 76 px wide for 10 cells, fill `#257de0`, track `#515151` (20% white over the band), centered with 17 px above and below. Agrees with HARNESS.
- Segmented pill of recipe 3: five segments of 14 px, 1 px seams in the band's color, 74 px in all. It is 6 px high, but the fill is only the middle 4 px: the top and bottom rows are the round ring in the track color.
- A hovered `plain` Button (the `◉` toggle): 28 px high, 31 px wide (11 px of glyph and 10 px each side), hover shade about 7% white. Agrees with the 7.5% the harness read.
- A hovered segment of the pill: the shade is 20 px high and 15 px wide (one 14 px segment and the seam beside it), and the fill under it lightens (`#257de0` to `#3080da`).
- Lifted hover card: 360 px wide with its ring (358 px of fill), fill `#1f1f1f`, ring `#282828`, a soft shadow, text in the plain ink `#efefef`, lines of 20 px. Its left edge is the anchor's left edge and it sits above: 4 px over a 28 px Button, 8 px over the 20 px hit box of a segment. A one-word card is 71 × 44 px with its ring (69 × 42 of fill): one 20 px line plus 12 px above and below and about 16 px at the sides, as the harness read from the stylesheet. A first reading of 68 px ran through the rounded corner; an independent re-measure caught it.

**Footer chip (SessionMode).** "Git": 23 px wide and 13 px high with its soft edge rows (11 px of flat fill), a little over the 10 px capitals; fill `#252525` (5% white), radius about 4 px, text `#a1a1a1` while the pane is closed (`dimColor`). The native words beside it: model `#efefef`, effort `#9c9c9c`, mode `#efefef`; 16 px from the chip to the model name.

**Dock pane.**

- The session panel is 317 px wide, then a 1 px line `#303030`, then the pane on the same `#191919`.
- Head, drawn by the host: 44 px from the pane's top line to the hairline `#353535` under the title; title in primary ink at 14 px, 20 px in; an expand icon and a close X at the right, the X's ink ending 13 px from the capture's right edge. The top line is in capture 06 only.
- Content starts 16 px from the pane's left edge (the `p-lg` of the code) and rows end 24 px before its right edge; a 6 px scrollbar thumb sits in that margin.
- Inks: plain text `#efefef`; `subtle` and `dimColor` `#9c9c9c`, exactly the native secondary ink of the panel beside it. A count in `footnote subtle` draws `#9c9c9c` where the native far-end count is `#757575`.
- Rows: 20 px pitch for text rows and `plain` Button rows; 24 px for rows that carry a 24 px Svg (the commit list). A `plain` Button's text starts 6 px in; the labels of two neighbors are 21 to 22 px apart with `columnGap={1}`.
- Input: 28 px high, fill `#252525` (5% white), a faint ring `#2e2e2e` (read mid-edge; near a corner it reads `#2a2a2a`), text 13 px in, placeholder `#7c7c7c` (40% white). Same height and fill as the native search field.
- Default Button ("filtrar", "abrir", "Reanudar", "Actualizar"): 28 px high, fill `#3b3b3b` on `#191919` (15% white, as native), label `#f1f1f1`, **12 px** side padding ("Reanudar": 82 px wide for 58 px of ink). Native is 10 px. So the HARNESS reading holds on screen: a mod's Button in a pane is 2 px wider per side.
- An Input and the Button after it are 8 px apart (`columnGap={1}`); two Buttons stacked in the foot are 16 px apart.
- A hairline drawn by the mod over the card foot: `#262626`, one step from the native `#252525`.

**Four things on screen that the recipes did not predict.**

1. **A hover card in a dock pane with a border and no background is see-through.** `git-pane`'s legend (recipe 5 as shipped) draws a 1 px ring `#474747` (the 20% `promptBorder`), 418 × 134 px, under the section head, and the commit rows, the Input, the Button and the lane lines read straight through it. The lines of the legend also overlap each other where the rows have no `key`. HARNESS, same day: the same card with `backgroundColor="composerSidebarBackground"` and keyed rows covers plain rows, `position: relative` rows and Button rows at every sample point. **Fixed and seen the same day** (OBS 5.11492, dark, capture 08, after `/reload-plugins`): with that background and keyed rows the card is opaque `#191919`, the pane's own color, inside a 1 px ring `#474747`, 418 × 134 px. The lane column reads `#191919` on all 126 rows inside the card, and the Input and the commit rows under it no longer show. So as a background that key draws the pane's color in a dock pane, as the stylesheet says (`desktop-tokens.md`). As a border that key has not been captured (item 2).
2. **A ring and a track in one translucent key double, and it shows.** The bar in capture 06 reads 6 px: 4 px of fill between two rows of `#6c6c6c`, with `#676767` at both ends and a 2 px seam `#474747`. The seam is one 20% white layer over `#191919`; `#6c6c6c` is 36%, two 20% layers (1 − 0.8 × 0.8). Cause found (CODE of the mod, 2026-11-14): the capture is not the former Roadmap pane mod. It is the Roadmap pane of the Foreman plugin 4.5.0 (`foundry/foreman/4.5.0/hooks/register.tsx` in the plugin cache), a fork whose bar sets `borderColor: 'promptBorder'` and `backgroundColor: 'promptBorder'`. So the app draws the doubling the harness predicted, and nothing is wrong in the engine. Foreman's pane still sets both keys to `promptBorder` in 4.7.1 (`hooks/register.tsx`, identical in 4.5.0 to 4.7.1). The former mod's own bar, whose ring was `composerSidebarBackground`, was never captured in 5.11492 and the mod is no longer in this repository: its ring in the pane's color stays CODE and HARNESS, measured on the former mod and not Foreman's current behavior. A native stacked meter is 4 px with no rim.
3. **A `■` glyph is not a legend swatch.** The square in the section heads of capture 06 is 10 px with square corners and the blue and red edge fringes that subpixel text has and an image does not. The native legend swatch is the same size with round corners and gray edges. Cause found (same source as item 2): Foreman's pane draws `<Text color={color}>■ </Text>` on every surface, where the former Roadmap pane mod drew an Svg on Desktop. Its fills are theme keys, which gave it away (`FILL`, `hooks/register.tsx`, and the glyph at `:510`, both unchanged through 4.7.1): `ide` reads `#6aabf1` (the link ink) and `success` `#53c556` in dark, where the former mod wrote `#2a78d6` and `#1baf7a`. So this is what recipe 14 avoids, seen on screen; the former mod's own Svg swatch was never captured in 5.11492 (`git-pane`'s Svgs drew that day). The engine was never the cause: all three engines on this workstation (2.1.319, 2.1.321, 2.1.325) list `Svg` for the desktop surface (`engine-behaviour.md` section 0). One caution on the source: that file was rewritten at 17:41, after the 16:57 stamp in the capture; fills, rim and glyph all match it.

How items 2 and 3 stayed "cause open" for a day: the capture was read as the former Roadmap pane mod because the two panes share a title, strings and layout, and that mod was disabled on this workstation (`claude plugin list`). Before measuring a mod in a capture, match one literal color or string against the source.
4. **Lane lines in `git-pane` have brighter joints.** A 1.5-unit stroke draws as 2 px at 75% (`#2560a6` for the accent `#2a78d6`); for 4 px at each row boundary the ink is full strength (`#2a78d6`). Visible only enlarged. Cause found the same day (HARNESS, reproduced to the pixel): the mod wrote same-column edges as a cubic curve with all its points on one line, and the renderer strokes such a curve 2 px wide for 2 px at each end; written as a line it is even. Fixed in `git-pane` (`recipes.md` recipe 19). **Fix seen the same day** (OBS 5.11492, dark, captures 09 and 10, after `/reload-plugins`): between two dots the line is an even 2 px of `#2560a6` for 15 to 16 px, with no full-strength pixels at the row boundary. In capture 09 the lane column holds 260 full-strength pixels over 43 rows, which is exactly the dots (one of 8 px, 42 of 6 px). Capture 10 shows the same on a history with branches; its real curves between columns are unchanged.

## Build 5.11492.5, light theme (native and mods)

OBS, seven owner captures of 2026-11-14 (11 to 17): the band with the composer and footer, the session panel beside `git-pane`, a lifted hover card, the History legend, a commit card, a hovered effort segment, Settings › Sistema. Every size equals the dark reading; only colors change, and each color is the value the code and the harness gave for light. Raw runs: a private record of the source repository (not shipped).

**Inks on white.** Primary `#191919` (90% black). Secondary `#666666` (60% black): native descriptions, nav labels, the effort word, and a mod's `subtle` and `dimColor` alike. Muted `#878787` (47% black): placeholders, native far-end counts. On the band's fill the same two inks read `#181818` and `#616161`. A link is `#1757ac`.

| Thing | Light | Dark, for comparison |
|---|---|---|
| Page, panel, pane, dialog | `#ffffff` | `#191919` |
| Line between session panel and pane | `#e5e5e5` (10% black), 1 px | `#303030` |
| Hairline under a pane head or dialog title | `#e0e0e0` | `#353535` |
| Hairline between sections or Settings rows | `#f3f3f3` (5% black) | `#252525` |
| Scrollbar thumb | `#b0b0b0`, 6 px | |
| Band | 40 px, fill `#f3f3f3`, 8 px above the composer | `#252525` |
| Composer ring | `#dddddd` | |
| Meter of recipe 1 | 6 px, 76 px wide, track `#c4c4c4` (20% ink over the band), centered | track `#515151` |
| Pill of recipe 3 | 14 px segments, 1 px seams in the band's color, fill `#257de0`, off `#c4c4c4`; 4 px of fill inside a 6 px ring | same sizes |
| Hovered segment | shade `#e7e7e7`, 20 × 15 px; fill darkens to `#2377d5`, an off segment to `#bababa` | fill lightens |
| Hovered `plain` Button | shade `#f2f2f2` in a pane (5% black), about `#e2e2e2` on the band; 20 px high in a pane | 7% white |
| Footer chip | 23 × 13 px, fill `#f3f3f3`, text `#616161`; two chips 7 px apart; 16 px to the model name | `#252525` |
| Lifted hover card | 360 px of fill, `#ffffff`, a ring near `#d6d6d6` with a soft shadow, text `#191919`, 20 px lines, 12 px above and below; 4 px over a 28 px Button | `#1f1f1f`, ring `#282828` |
| Default Button, mod and native | 28 px, fill `#f2f2f2` (5% black), label `#181818` | `#3b3b3b` |
| Input in a pane | 28 px, 183 px wide, fill `#ffffff`, ring `#ebebeb` (8% black) read mid-edge, text 12 px in, placeholder `#888888` | fill `#252525` |
| Native search field, Select | 28 px, fill `#f3f3f3`, no ring | |
| Native selected nav item | 32 px, fill `#e5e5e5` (10% black) | |
| Toggle | 36 × 20 in Settings, 28 × 16 in the session panel; on `#257de0`, off `#cecece` | |
| Native legend swatch | 10 × 10, `#257de0`, `#f47230`; 24 px pitch | `#338ced` |
| Native context meter | 4 px, track and 1 px seams `#ededed`; fills `#257de0`, `#f47230`, `#00b894`, `#878787`, `#c2c2c2` | |

**What the light captures settle.**

- The dock hover card of recipe 5 is opaque in light too: a white card, a 1 px ring near `#cecece` (the 20% `promptBorder`), about 417 × 132 px. The Input's ring and the "filtrar" Button under it do not show inside the card; the Input's left ring shows only outside it.
- The commit card of recipe 9: white, 1 px ring `#cfcfcf`, 424 × 161 px; title and body `#191919`, author line and the dim actions `#666666`.
- A mod Button is still 2 px wider per side than a native one: "filtrar" has 10 px from its edge to the ink, "Administrar" 8 px. Fill and label are the same.
- A mod count in `footnote subtle` reads `#666666` where the native far-end count is `#888888`: the same one-step difference as in dark.
- An Input and the Button after it are 8 px apart, as in dark. A ring read 4 px from a corner looks lighter (`#f4f4f4`); mid-edge it is `#ebebeb`.
- Lanes in light: the accent line is `#5f9ae0` (the 75% coverage of `#2a78d6` over white), an idle lane `#c8c8c8`, dots 6 px. Captures 12 and 15 still show the bead at each row boundary (`#2a78d6`, `#b5b5b5`, 4 px). INF: that session had loaded `git-pane` before the lane fix and was not reloaded after it; the two dark captures of the fix (09, 10) came from sessions started later.

## What these shots do not show

`variant="primary"` and a mod `Select` in the app; `$.prompt.suggest`; a rail pane; hover and pressed states of native Buttons; the slash popup; queued messages; a toast; the date picker; the rail section head's box (the 24 px in `native-forms.md` stays CODE); the weight of text (ink and size are measured, weight is not).
