---
name: mod-native-guide
description: Measured design rules for Claude Code mods, so what a mod draws looks native on Desktop and in the terminal, plus what Anthropic's mods pages say that the bundled plugin-authoring skill does not. Use when you design, build, restyle, audit or maintain anything a mod draws (ui.render trees for the band, a Pane, the footer chip, transcript rows, status lines, toasts, a theme's colors, backdrop, sound or style), choose its colors, spacing, type or wording, troubleshoot a mod that does not load or draw, or check whether a documented promise holds on screen. Not for the hook API itself, which the bundled plugin-authoring skill covers; this skill points to it.
---

# Mod native guide

How Claude draws itself, and what a mod has to write so the host draws it the same way. It adds to the bundled `plugin-authoring` skill and never repeats it. Read that skill first for the API: its `reference.md`, `look.md`, `types/claude-code.d.ts` and `examples/`. Trust your build's types over any page and over this file.

## What was measured, and what is installed now

| Thing | Measured | Where |
|---|---|---|
| Claude Desktop (Code tab) | 5.11492.5 | its renderer bundle, read and drawn on a test page |
| Engine inside Desktop | 2.1.325 | its binary and its bundled `plugin-authoring` types |
| Native app and mods on screen | Desktop 4.16336 and 5.11492.5 | 51 screenshots, light and dark, measured to the pixel |
| Docs pages | 2026-11-24 | the nine mods pages, compared with `plugin-authoring` 2.1.330 (`references/doc-only.md`) |

On 2026-11-24 the installed build was Desktop 6.28899.6 with engine 2.1.330. No measurement here was repeated on it. Building one theme added OBS on that build for themes alone: a `Shader` over an `Svg` draws in light and in dark, the Svg's `@media` follows the mode, the glass frosts the chat column, and the shader plays live (`references/themes.md`). Sound, the click effect and reduced motion stay unseen there. Every px, color and behavior below holds for the build its label names. Check `$.session.version()` (or `claude --version`) and treat a value on a newer build as likely, not certain.

Every claim carries one label. Trust them in this order.

- **OBS**: seen on screen, in a screenshot or a live run.
- **HARNESS**: drawn by Desktop's own tree builder and stylesheets on a test page, outside the app, and measured. Real code, not the real app.
- **CODE**: read in the binary of the build named. Re-check after an update.
- **DOC**: stated by Anthropic's pages or the bundled skill, and not measured.
- **MOD**: stated in a community mod's source or README at the commit named, and not measured (`references/themes.md` only).
- **INF**: inferred from code or records.
- **UNVERIFIED**: stated by types or inferred, and nobody has seen it on screen. Never ship a look that rests on one without a screenshot.

The references were written in the repository where they were measured. There, *the owner* is the person who maintained them and took the screenshots, and *the project checks* are that repository's scripts. Names marked "not shipped" are files of that repository. Read them as your own project's checks and your own list of approved exceptions.

Desktop draws at the comfortable density with the second color layer (neutral grays, alpha inks); every px and color below is that variant unless it says compact or base.

## The contract

A mod cannot write CSS, fonts, pixels or DOM. It returns a tree of `Box`, `Text`, `Button`, `Input`, `Select`, `Svg`, `Link`, `Code`, `Markdown`, `Client` with a closed set of props. Desktop turns that tree into its own DOM and styles it with its design tokens; the terminal turns it into cells. So "native" means two things:

1. Pick the tree shape, steps and theme keys that the host maps to its own tokens. Never approximate a native control with glyphs or raw hex when an element or key exists.
2. Know where the host's mapping breaks, and write around it. `references/traps.md` is the list.

## Workflow

1. **Find the native twin.** What does Claude already draw that does this job? Look it up in `references/native-components.md`. If Claude already shows the same information, do not draw it again.
2. **Pick the site** from the table below. One job, one site.
3. **Take a recipe** from `references/recipes.md` before composing your own. Each one records where it was seen.
4. **Branch on the surface** only where the recipe says so (`e.surface === 'terminal'`), and take elements from `$.ui.resolve(e)`. `'Svg' in ui` only says this engine knows the element; it is true on the terminal too, so the surface test comes first.
5. **Space with steps, color with keys, size with roles** (tables below). No raw px, no hex, no all-caps.
6. **Write every state**: loading, empty, zero, error, narrow, both themes, both surfaces.
7. **Word it natively**: sentence case, "…", curly apostrophes, the interface language.
8. **Run the checks** under Verification. Tests and checks never prove a look.
9. **Get screenshots**: Desktop light and dark, and the terminal. Record what was and was not seen.

For a new control, layout or theme look nobody has approved, show three mockups first, or one sheet that compares the options, and let the person choose. Building one theme, the looks nobody asked for were undone, and the ones picked from a mockup or a comparison sheet stayed (OBS 6.28899.6).

## Which site

| Job | Site | Notes |
|---|---|---|
| Always-visible state, one line, above the composer | `AbovePrompt` band | One row per plugin; a quiet hook returns `next(e)` |
| A view the person opens and keeps beside the chat | `Pane` (`$.ui.open`) | Dock tile on Desktop; native close X; title is not a native section name |
| One word that opens or toggles the mod | `SessionMode` footer chip | One plain Button after the engine's tree |
| A fact that outlives a turn, no interaction | `$.ui.status` | Host prefixes the plugin name |
| Outcome of an action | `$.ui.toast` | Host prefixes the plugin name; never the only place a result lands |
| Content attached to a reply or tool call | transcript row (`AssistantMessage`, `ToolUse`) | Compose with `next(e)`; quiet until there is a result |
| Suggest text for the composer | Buttons that call `$.prompt.fill` | `$.prompt.suggest` answered "shown" and drew nothing on 4.16336; 5.11492 paints it, unseen |
| The whole session's colors, backdrop, sound, message style | `$.theme.set` | See Themes below; one theme per session, whichever mod set it |

Details per site, both surfaces: `references/desktop-sites.md`, `references/terminal.md`.

## Rules that decide most reviews

1. **Theme keys, not hex.** Each hex needs a reason per value and an entry in your project's list of approved exceptions. On Desktop a key follows light and dark; a hex cannot, since the render event carries no theme.
2. **Steps, not numbers, for vertical space.** `xs sm md lg xl` on the parent's `gap` or the block's margin. A number is half a line on Desktop and a whole row in the terminal.
3. **Give every row of Buttons an explicit `columnGap`** (and `rowGap="xs"` when it wraps). The types promise an automatic gap; Desktop draws 0 px and the Buttons touch (HARNESS, CODE, OBS).
4. **A Button's state lives in its text and `dimColor`**, never in a child Text's ink: Desktop ignores it on a labelled Button (OBS).
5. **An action has a `variant`**: `primary` for the one main action, `secondary` for the others; a Button with no variant draws exactly as `secondary`. `plain` is for text-like controls (rows, toggles, links) and takes `hover={{ underline: true }}`.
6. **Meters are Boxes**: a thin round track with a fill child, never block glyphs, never `Progress`. Desktop draws `Progress` as a square bar in text ink that no native meter looks like (CODE, HARNESS).
7. **Tooltips are hover cards**: a visible keyed Box with an absolute `display="none"` Box inside and `hover={{ display: 'flex' }}`. On the band and the rail the host lifts and restyles the card, so write plain `Text` in it. In a dock pane the card draws as written and needs a border, a solid `backgroundColor` and keyed rows (OBS 5.11492; `references/recipes.md` recipe 5). No hover `scope`.
8. **One line, ends in "…"**: `wrap="truncate-end"` inside `<Box flexGrow={1} minWidth={0}>`. On Desktop let rows wrap with `flexWrap`; tier by column count only in the terminal.
9. **Sentence case, the host's type roles**: `size="footnote"` for secondary lines, `caption` for hints, `weight="medium"` for the selected thing. Never `bold` caps labels.
10. **Mute with `dimColor`** (band and transcript) or `color="subtle"` (inside a pane). On Desktop both draw the same ink today (HARNESS); they differ in the terminal, so keep the distinction.
11. **Every state draws**: a meter at 0 or 100%, an empty list line, a reading line, an error line with a Refresh.
12. **No silent state change, no chat spam**: a press shows its effect in the control, plus a toast when the effect is elsewhere.
13. **Dangerous actions end in the prompt**: fill the composer with the request and let the person press Enter.
14. **Never duplicate native UI**: no diff view, no context breakdown, no effort name, no own close button in a pane.
15. **Language follows the interface**, English by default, with a complete catalog per language.
16. **The plugin's name is added by the host** to toasts, status lines and commands. Keep it out of your text.
17. **Keys on everything in a list**, siblings in a Box (never a fragment), `alt` non-empty on every Svg.
18. **State in `$.state` atoms**, never module variables; a draft atom behind every Input. A `get` during a render subscribes the site, so a later `set` redraws it.
19. **Redraw is the mod's job.** Desktop never re-asks a site on a timer. Invalidate on the event that changes the value. A transcript row is re-asked at most once a second; a band or a pane as fast as it invalidates, so throttle there (CODE, `references/engine-behaviour.md`).
20. **Stay inside the tree limits**: under 2,000 nodes, depth 32 and 262,144 characters, or Desktop refuses the whole answer and the site clears (CODE, 5.11492). The pages give larger numbers, which are the terminal's (`references/doc-only.md`, last section). Cap lists at 4 to 6 rows and a "Show more".
21. **One `hotkey` per Button, unique in the site**: one character `0-9a-z`. It fires only from inside the site, never with Ctrl, Meta or Alt, and never while the person types in a field.

## Quick tables

### Spacing steps (HARNESS for Desktop, CODE for the terminal)

| Step | Desktop `gap`/margin | Desktop padding | Terminal across | Terminal down |
|---|---|---|---|---|
| `xs` | 8 px | 6 px | 1 cell | 0 rows |
| `sm` | 12 px | 8 px | 1 | 0 |
| `md` | 16 px | 12 px | 2 | 1 |
| `lg` | 28 px | 16 px | 3 | 1 |
| `xl` | 40 px | 24 px | 4 | 2 |

Desktop numbers: horizontal `n` is `n ch` (7.5 px each); a vertical margin, padding or gap `n` is `n × 0.5 lh` (10 px each); a `height={n}` is `n` whole lines (20 px each). The step is the contract; a mod never needs the px. The pages say step names need 2.1.299 or later (DOC).

### Text roles (HARNESS: size / line height)

| `size` | Desktop | Native use |
|---|---|---|
| `caption` | 12 / 17 px | hint under a value, key cap, counter |
| `footnote` | 13 / 17 px | section title (medium), row value, summary, legend |
| `body` (default) | 14 / 20 px | row label, button, input |
| `heading` | 15 / 20 px | user message, alert title |
| `title` | 22 / 28 px | hero number, dialog title |

Weights: regular 400, medium 500, semibold 580; `bold={true}` draws as semibold. Numbers that change take `tabular`. The terminal drops `size`, `mono`, `tabular`, and maps `semibold` and `bold` to bold.

### Color keys that are safe on both surfaces

| Key | Desktop token | Terminal dark | Use |
|---|---|---|---|
| (none) | text-primary | default ink | main text |
| `dimColor` | text-secondary | `inactive` | secondary text |
| `subtle` | the same ink as `dimColor` on the color layer (HARNESS) | dark gray | values, counts inside a pane |
| `suggestion` | text-accent | periwinkle | "on" ink, links, primary Button in terminal |
| `success` / `warning` / `error` | text-success / text-warning / text-danger | green / yellow / red | state words and marks |
| `promptBorder` | border-strong | gray | card and track borders |
| `rate_limit_fill` | fill-accent | periwinkle | meter fill (a fill, not an ink) |
| `claude` | fill-brand | orange | brand mark only |

Full maps, light and dark values, and the keys to avoid: `references/desktop-tokens.md`, `references/terminal.md`.

## Types say, the host does

The ones that cost the most time. Full list with evidence: `references/traps.md`. Where the pages disagree with a measurement: `references/doc-only.md`, last section.

| The types or docs say | What happens |
|---|---|
| Buttons in a gapless row get `xs` between them | No gap on Desktop: they touch (HARNESS, CODE, OBS) |
| `Progress` is the surface's progress bar | Desktop gets the CLI's lowering: a square bar in text ink, its track invisible on a card (CODE, HARNESS) |
| A plain sentence stays in the sans face | One Text with a run of two spaces turns its sibling lines mono (HARNESS) |
| A hover card is what the mod drew | On the band the host strips its border, background, padding and offsets and paints a native popover (CODE, OBS). In a dock pane it draws as written, and without a background it is transparent (OBS 5.11492) |
| One key for a Box's border and its background gives one flat color | A translucent key doubles where the border lies over the background. Give the ring the surface's key (recipe 2) or put the background on a child (recipe 1) (OBS 5.11492) |
| `hover.scope` shares a hover | A scoped card never shows on the band (CODE, OBS) |
| A child Text's color shows in a Button | Ignored on a labelled Desktop Button (OBS) |
| A toast shows for 4 s | The Code tab shows it at least 6 s (CODE, 5.11492) |
| `$.ui.invalidate` is throttled to 10 a second | A Desktop band or pane redraws as fast as it invalidates (CODE, 5.11492) |
| `$.session.compact` compacts | Refused as headless; use `$.command.run({ command: 'compact' })` (OBS) |
| A Button inside a `Client` is a button | Bare text on Desktop whatever its `variant` (OBS) |

## Themes

The API is in the bundled `look.md`; this section says what changed and what was seen. Nothing below was seen on screen here, so each part is DOC or UNVERIFIED: ask the person for a screenshot, and to listen for sound. `references/themes.md` adds what one theme's author saw and heard on Desktop 6.28899.6. What three shipped theme mods do beyond `look.md`, with a checklist before shipping: `references/themes.md`.

- History (DOC, interface page): 2.1.319 replaced `$.ui.backdrop` with `$.theme.set` and `$.theme.clear`. Before 2.1.323 a backdrop named `id` instead of `scene`, and `overrideColorScheme` sat in `backdrop` as `colorScheme`. Colors reach the Code tab from 2.1.324.
- New in the 2.1.330 bundled skill, and not in the 2.1.325 one measured here (DOC): `sound` (`ThemeSound`: an ambience and cues, numbers and never a file), `style` (`ThemeStyle`, `ThemeMessageRule`: the conversation's own rows restyled, plus four message colors that go in `colors.inputs` after `makeColors`), and a `Shader` around a scene with the `ui.pointer` event. Read `look.md`, sections Sound, Style and "A scene that answers the pointer".
- Gone in 2.1.330: the `{ image }` still ground (`ThemeImage` has no hit in the 2.1.330 types). A ground is a color, gradient or vector, or draw a scene.
- Stricter in 2.1.330 (DOC): a scene is pure vector with no embedded pictures or fonts, and plain comments; reduced motion draws it with no animation; a refused scene still answers `isDrawn: true`, and only the debug log says why.
- An older build throws on `sound` or `style`: catch it and set the theme again without them, as `look.md` shows.
- Third-party providers on Desktop 5.11492.5 or earlier keep the app's colors (DOC). To take colors off: `references/doc-only.md`, interface.
- Recoloring Claude is for a person who asks for it. Never set a theme as a side effect of another mod's job.

## Verification

Run for each changed mod: `claude plugin validate <mod>`, `claude plugin test <mod>`, and `tsc -p <mod>` once the engine has written the mod's types. `/reload-plugins` reads a local mod again from its folder, so a change shows without a version bump (OBS 2.1.330). The test kit's `expect` has no `toBeCloseTo`. `validate` reports it only as a `TS2339` warning, and the test then fails (OBS 2.1.330).

What building one theme taught about these checks (OBS 2.1.330 unless marked):

- Mock what the mod calls. A theme needed `session.start`, `settings.read` answering `{ value: { language } }`, `command.register` and `ui.log`. Without the `ui.log` mock the test fails with "no implementation for ui.log".
- The test kit cannot raise `ui.pointer`. Test the pure function the hook calls.
- Type a test's body as `TestBody`. `validate` rejected `Parameters<typeof test>`.
- `tsc` needs the types the engine writes for the mod. It lays them in `.claude-plugin/types/` each time it loads a mod from a folder being written in: this session's mods folder, a `--plugin-dir` or a `CLAUDE_CODE_PLUGIN_DIRS` folder (DOC, `reference.md`). When `claude -p --plugin-dir` failed on an expired login, no types were written and `tsc` never ran. Report `tsc` as not run until a session has loaded the mod.
- To preview a scene outside the app, render its Svg to PNG with headless Edge and its own `--user-data-dir`; the browser pane cannot open `file://`. Force dark by rewriting `@media (prefers-color-scheme: dark)` to `@media all`, and light by rewriting it to `@media not all`.
- A preview lacks the chat panels and the glass, so it misleads. A blind critic of such frames never converged in four rounds. Computer use cannot drive Claude's own window, so only the person's screenshot verifies a look.

Then check by hand what no check reads:

- [ ] Every row of Buttons has a gap; every wrapping row has a `rowGap`.
- [ ] No vertical numeric margin where a step fits.
- [ ] Every main action has a `variant`; every `.map` child has a `key`.
- [ ] No `Progress`, no hover `scope`, no `label` plus look-carrying children.
- [ ] Narrow width: nothing cut without "…", nothing pushed out.
- [ ] Empty, zero, loading and error states draw.
- [ ] Text reads in English and in the catalog's other languages; no plugin id in toasts.
- [ ] Nothing repeats what the session panel, footer or composer already show.
- [ ] The module passes the static reading rules (`references/doc-only.md`, create).

A look is verified only by a screenshot of the real surface: Desktop light, Desktop dark, terminal. The test kit never draws a `Client`, drops Svg and Text keys, and cannot see spacing. Say plainly which of the three was not seen. The `mod-auditor` agent of this plugin runs this list over a mod's source and reports; it never edits.

## Reference files

| File | Read it when |
|---|---|
| `references/doc-only.md` | you need what Anthropic's mods pages add to the bundled skill, a troubleshooting message, or where a page and a measurement disagree |
| `references/desktop-tokens.md` | you need a size, color, radius, shadow or motion value, or the theme-key map |
| `references/desktop-elements.md` | you need to know what DOM and CSS an element and prop become on Desktop, and the limits |
| `references/desktop-sites.md` | you draw in the band, a pane, the footer, a toast, a status line or the transcript |
| `references/harness-measurements.md` | you need the px, ink or box a tree really gets on Desktop |
| `references/native-components.md` | you want the native control or surface to imitate: rows, meters, tooltips, menus, dialogs, toasts |
| `references/native-catalog.md` | the rest of the native kit: Badge, tabs, tables, cards, icons, pickers, ring and shadow rules |
| `references/codetab-surfaces.md` | what sits beside a mod in the Code tab: code fences, diffs, sidebar rows, banners, loading and empty states |
| `references/native-screens.md` | what native controls and shipped mods measure on a real screen (4.16336 and 5.11492) |
| `references/native-forms.md` | the field recipe and its states, the date picker, Counter, Spinner, ring and popover constants |
| `references/composer-and-pr.md` | attachment chips, queued messages, the slash popup, PR chips and rows, key caps |
| `references/engine-behaviour.md` | when a site is re-asked, tree limits, hover-card and focus behaviour, `hotkey`, the Select popup, `prompt.suggest` and `prompt.fill` |
| `references/api-behaviour.md` | what the types promise about events, state and reload, meter data, limits, language, and what the test kit cannot prove |
| `references/mounts-and-transcript.md` | where the engine is mounted, how transcript rows are framed, withheld and refused |
| `references/terminal.md` | the terminal side: elements, themes, framing, the CLI's own glyph and hint conventions |
| `references/recipes.md` | you build a meter, tooltip, section, row, card, toggle, field, footer chip, empty state |
| `references/traps.md` | something does not draw as the types promise, or before choosing an approach |
| `references/themes.md` | you build or review a theme: setting it so it shows, the backdrop hook, motion across redraws, light and dark, shaders and their cost, sound, recipes for contrast, glass and texture |
