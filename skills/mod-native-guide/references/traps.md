# Traps: where the types, the docs or common sense are wrong

Read before choosing an approach. Each line: what you would expect, what happens, the evidence, what to do.

## Types and docs versus the host

| # | Expectation (source) | What happens | Evidence | Do this |
|---|---|---|---|---|
| 1 | "A graphical surface draws `xs` between the Buttons of a row Box with no gap" (2.1.325 types, `BoxProps.gap`) | Buttons touch on Desktop | HARNESS: 0 px in a pane and in the band, 8 variants. CODE: the row rule only centers children. OBS: owner shot 2026-11-14 | `columnGap={1}` on every row of Buttons; `rowGap="xs"` when it wraps |
| 2 | `Progress` is the surface's progress bar | The CLI lowers it to Box and Text for every surface but a mobile app that names it. Desktop draws a label line and a square 6 px bar: fill in the accent text ink (`suggestion`), track `userMessageBackground`, which equals a card surface and vanishes on one. Desktop's own schema has no `Progress` and its builder draws nothing for a raw node; the CLI never sends one | CODE (the engine's lowering, skipped only for a mobile surface); HARNESS (the lowered tree, light and dark). An earlier version of this skill said the whole tree is dropped: wrong | Draw a Box meter (recipe 1). `Progress` is acceptable in the terminal |
| 3 | The types say a level against a limit is "a bar of Boxes" | Right, and the native meter is round with the meter fill | types, OBS | Recipe 1 |
| 4 | A hover card draws as written | On the band and rail the host strips border, background, padding, size and offsets and paints a native popover | CODE; OBS 2026-11-09 | Plain-ink Text in the card; no reliance on your own chrome there |
| 5 | `hover.scope` lets several things share one hover | A scoped card is never lifted and never showed on the band. 6.28899 adds a scope-lighting path (`lightsHovers`) that only the dock pane turns on, so a scope may work there; the band still never lifts a scoped card | CODE (re-read 6.28899); OBS 5.11492; the dock case UNVERIFIED | One card per anchor |
| 6 | `inverseText` on a dark chip reads as a tooltip | The host's card is light: the text vanished | OBS 2026-11-09; HARNESS (white ink on a white card in light) | No `inverseText` in cards |
| 7 | `bodyColumns` is the width to lay out in | Wrong for the Desktop band (60 columns reported as under 42); right for a pane and in the terminal | OBS 2026-11-07/08 | Desktop band: one wrapping row |
| 8 | A child Text's `color` shows inside a Button | Ignored on a Desktop Button with a `label` | OBS 2026-11-04 | State in the glyph and `dimColor` |
| 9 | `variant="secondary"` is a distinct look | Identical to no variant: a quiet fill (5% black in light, 15% white in dark), no ring, no shadow inside a site | CODE; HARNESS; OBS (owner shot: fill `#f2f2f2`, 28 px tall) | Still set it: it states intent and the terminal and future builds read it |
| 10 | `variant="primary"` draws the native primary | Ink-filled, weight 500, same box as the others | CODE; HARNESS. Not seen in the app (a toast covered the only shot) | Ask for a screenshot the first time a mod uses it |
| 11 | A Button has a tooltip, `title` or icon | No such prop | CODE (schema, validator) | Hover card (recipe 4) |
| 12 | `$.prompt.suggest` shows a suggestion | Reported shown, never drawn on Desktop 4.16336 (OBS 2026-11-03). The 5.11492 code does paint ghost text, but answers `shown:true` before the paint condition is read (`engine-behaviour.md` section 1); not seen on screen | OBS on the old build; CODE on 5.11492, not re-read on 6.28899; UNVERIFIED on screen | Buttons that call `$.prompt.fill`; treat `shown` as accepted, not visible |
| 13 | `$.session.compact()` compacts | Refused as headless in Desktop sessions | OBS 2026-11-02 | `$.command.run({ command: 'compact' })` |
| 14 | `$.prompt.submit('/cmd')` runs a command | Refused | OBS (test engine) | `$.command.run` |
| 15 | `$.ui.notify` notifies | Resolves `no-surface` in Desktop-hosted sessions | CODE 4.4212 | Toast |
| 16 | `PromptHint` is a footer site | Mounted only in Cowork; replacing it hides the engine's hints | CODE 4.4212 | `SessionMode` |
| 17 | The host offers "Turn off" for a band | Only for `@builtin` plugins: the resolver returns an id only when it is `<name>@builtin`, in the session's plugin list or as an installed plugin's source. A third-party mod never gets the Button | CODE 5.11492 (a Desktop bundle file, re-read twice); the owner shots show none on a mod's band | Give the mod its own off switch if it needs one |
| 18 | A Button in a `Client` is native | Bare text, whatever the `variant` | OBS 2026-11-03 | Bordered Box around it, or draw outside the Client |
| 19 | Link, Code, Markdown work in a `Client` | Draw nothing | CODE 4.4212 | Draw them in the hooks tree |
| 20 | `Text dir`/`lang` are honored | Dropped on Desktop | CODE 4.4212 | Nothing; avoid relying on them |
| 21 | `ui.open({ columns })` widens the pane | Typed for the terminal dock; Desktop UNVERIFIED | types | Do not depend on it |
| 22 | Returning an empty Box hides a transcript row | A slot of about 15 px stays | OBS 2026-11-02 | Do not fold rows by emptying them |
| 23 | Compose the band with `await next(e)` (project rule 6) | Since 2.1.325 the band is asked per plugin and stacked by the host | CODE (types, `reference.md`, Desktop `AbovePromptList`) | Return your row; return `next(e)` when quiet; keep `{await next(e)}` beside it for engines before 2.1.325 (the terminal `claude` is 2.1.319). Rule 6 in the source repository's look rules (not shipped) says this since 2026-11-14 |
| 24 | Read the `language` setting for the UI language (project rule 15) | `language` is the reply language; Desktop's interface locale is in the app's `config.json` | OBS 2026-11-03 and 2026-11-07 (owner: band in Spanish, interface in English) | See owner-standards.md (kept in the source repository, not shipped), language. Rule 15 of the source repository's look rules (not shipped) says this since 2026-11-14; the shipped mods still read `language` |
| 25 | Spacing steps are the same everywhere | `xs` and `sm` are 0 rows down in the terminal | CODE | Branch vertical gaps where a blank row is wanted |
| 26 | `dimColor` dims the given color | Terminal: replaces it with `inactive`. Desktop: 60% mix | CODE | Do not combine `color` and `dimColor` for meaning |
| 27 | Aligning columns with spaces is harmless | Desktop switches such Text to mono, `white-space: pre`, block; and its sibling lines in the same column Box go mono too, a plain sentence included | CODE; HARNESS | Boxes with widths; keep an aligned block in its own Box |
| 28 | A bordered Box is just a border | It brings 12 × 16 px padding on Desktop (8 × 12 compact), and is 3 rows tall in the terminal | CODE, HARNESS, OBS | `padding={0}` for shapes; branch for the terminal |
| 29 | `subtle` works as a border; a translucent track under a round border is clean | White border; gray rim | OBS 4.4212 | Border and background from the same key |
| 30 | The same theme key is the same hue everywhere | `rate_limit_fill`: blue on Desktop, lavender in the dark terminal, yellow in ANSI themes; `warning`: brown in Desktop light | CODE, OBS | Keys for inks, approved hex for the two meter fills |
| 31 | Mods draw from session start | The engine starts with the first prompt; an unasked pane also needs 144 columns in the terminal | OBS 2026-11-09 | Say so in the README; nothing a mod can do |
| 32 | Alt+digit arrives as a key | On Windows Desktop it arrives as `☺ ☻ ♥ ♦ ♣` text | OBS 2026-11-07 | `prompt.edit` accepts both and returns the text unchanged |
| 33 | The token table gives a control's height | `--cds-h-control` at comfortable is 32 px in the table and 28 px on screen: a `(hover:hover) and (pointer:fine)` media block lowers it for mouse users, and the extractor skips media blocks | HARNESS (live CSSOM); OBS (28 px in an owner shot) | Trust `harness-measurements.md` for control sizes |
| 34 | `dimColor` and `subtle` are two strengths | On Desktop's color layer both are 60% black (57% white in dark). They differ only on the base colors and in the terminal. The cause is in the code: `subtle` is `var(--muted-as-secondary, text-muted)` and the color layer sets that variable to the secondary ink | HARNESS; OBS 5.11492; CODE | Do not build a three-level hierarchy out of primary, dim and subtle on Desktop; use size or weight for the third level |
| 35 | A plain Button is "a native button" (types) | No fill, no ring, 20 px tall, 6 px side padding: it reads as text until hovered | HARNESS | Use it for rows, toggles and links; give an action a `variant` |
| 36 | A row with a Button aligns as you wrote it | A row Box holding a control centers its children; `alignItems="flex-start"` turns that off and drops the Button 5.5 px below the text's middle | CODE, HARNESS | Leave `alignItems` unset on rows of text and Buttons |
| 37 | A transcript row hook may take its time | While the hook is pending the native row is laid out invisible; after 5 s the row shows with its text replaced by "…" | CODE (a 5,000 ms constant, `data-engine-withheld`) | Answer transcript rows synchronously from state; never await I/O there |
| 38 | A hook may redraw `ToolResult`, `UserMessage` or `CommandOutput` freely | Those sites accept only a rewrite of the documented props; another shape is refused and logged, the row stays native | CODE (`onlyRewrites`) | Draw in `ToolUse` or `AssistantMessage`; rewrite text only in the three |
| 39 | A tall drawing in a tool result grows the transcript | The host frames it at 70vh with its own vertical scroll | CODE (`"70vh"`) | Keep result drawings short; link to a pane for the long form |
| 40 | A bordered hover card covers what is under it | In a dock pane a card with a border and no `backgroundColor` is transparent: rows, fields and lane lines read through its text | OBS 5.11492 (`git-pane` legend); HARNESS and OBS 5.11492 (dark and light) for the fix | `backgroundColor="composerSidebarBackground"` and a `key` on every row of the card (recipe 5). That key is untyped: the color check fails until the owner approves an allow entry for the mod |
| 41 | A ring in the track's own key is invisible | A translucent key doubles where the border lies over the background. The bar of Foreman's Roadmap pane gives ring and track `promptBorder` and shows a rim of `#6c6c6c` on the dark dock pane: 36% white where the track is 20% | OBS 5.11492 (capture 06) and Foreman's source (4.5.0 to 4.7.1, `hooks/register.tsx`); HARNESS | Give the ring the surface's key (recipe 2), or leave the bordered Box unpainted and put the track on a child (recipe 1) |
| 42 | A `■` glyph passes for a legend swatch | On Desktop the glyph is 10 px with square corners and blue and red subpixel fringes; the native swatch has 2 px corners and gray edges | OBS 5.11492 (Foreman's Roadmap pane, capture 06) and Foreman's source (4.5.0 to 4.7.1, `hooks/register.tsx`) | Recipe 14: an Svg on Desktop, the glyph only when `e.surface === 'terminal'` |
| 43 | A mod Button equals a native Button | Same height (28 px) and fill (15% white), but 12 px side padding in a pane against native 10 px; on the band the host makes it 10 px | OBS 5.11492; HARNESS | Nothing to set; do not pad Buttons by hand to compensate |
| 44 | A straight segment can be written as a curve | In an Svg a cubic whose points lie on one line (`M6 0C6 6 6 6 6 12`) is stroked 2 px wide for 2 px at each end: a bead where two rows meet | OBS 5.11492 (`git-pane` lanes, before and after the fix); HARNESS reproduces it | Write `V`, `H` or `L` for straight segments; keep `C` for real curves |
| 45 | A capture titled like your mod shows your mod | Capture 06 was read as this project's former mod `roadmap-pane` for a day. It was Foreman's Roadmap pane, a fork of it: same title, strings and layout, other fills, a glyph swatch, a one-key bar. Two "engine defects" came from that reading | This skill's own error, 2026-11-14 | Before measuring a mod in a capture, match one literal color or string against the source, and read `claude plugin list` for which plugin is enabled |
| 46 | `'Svg' in ui` tells the surface | It is true on the terminal too: the table a mod gets holds a fragment stub for every element the engine knows and the surface lacks. `in` only says whether this engine version knows the element (`'Progress' in ui` is false on 2.1.319, true on 2.1.325; 2.1.330 adds `Shader`, Desktop and mobile only, so `'Shader' in ui` is likely true on the terminal too, INF) | CODE 2.1.325, the wrapper that hands the table to the mod; probe under `claude plugin test` on 2.1.319 and 2.1.325 | Branch on `e.surface === 'terminal'` first; keep `'X' in ui` only as the guard against an older engine |

## Engine load and state

- Every `$` op is spelled literally as `$.noun.event(...)` at the call site. `$.session.surface?.()` and casts refuse to load.
- A helper in another file that receives `$` must be a `function` declaration, not an arrow.
- `$.env.get` names are string literals.
- Atom keys are declared in `types/index.d.ts`; an undeclared key is refused. Bump the `shape` tag when stored fields change.
- Module variables are lost on reload and may be shared across sessions: state lives in `$.state` atoms.
- `$.store` is shared and not atomic.
- `$.fs.read` refuses files over 4 MiB; there is no file-watch event: refresh after `turn.complete` and after Bash or PowerShell `tool.call`.
- A failed hook is skipped by the engine; `.catch` exists to answer, not to hide.
- A command name equal to another plugin's command is refused.
- Control characters in Text or Markdown are refused: clean external text.

## What the checks and tests cannot see

- The test kit never draws a `Client` (a JSX-factory shadow passed `tsc` and 64 tests).
- It drops the `key` of an Svg and of a Text, and reports `hover` beside `props`.
- Its `$` has no `$.clock`, `$.fs`, `$.ui.close`, `$.state`.
- `check-mod-look` does not read: vertical numeric margins, a missing `variant`, keyless Boxes in a `.map`, Buttons passed in a variable, copy flush against controls.
- No check or test proves a look. Every new element is "not seen on Desktop" until an owner screenshot.
- A new test must fail against the base before it counts.

## Rejected approaches (do not retry without new evidence)

| Approach | Why it was dropped |
|---|---|
| Block-glyph meters (`▰▰▰ 97%`) | Read as terminal, not as Claude |
| All-caps labels (`USO`, `CACHÉ`) | The app writes sentence case |
| Round joints between bar segments | Native seams are square; read as pills |
| A border on a thin bar in a contrasting key | The bar looked white |
| Swatches with a large radius | Became circles; native is 10 × 10, rx 2 |
| Per-category bars in a context pane | Duplicated the session panel, misaligned in a proportional font |
| Raw hex palette, ad-hoc colored squares | "muy sobrio y muy plano"; replaced by the panel's chart colors with approval |
| A mod-drawn Close or `role="dismiss"` in a pane | The host draws its own X |
| A pane titled like a native section (`Contexto`) | Collides with the host |
| A `file:` Link or Markdown card per file | Links are public-https only; nothing draws in a Client |
| Drawing a diff, a changes list, a blame view | Repeats Desktop's Changes |
| An interactive Svg per row | One sandboxed frame per row; presses never cross |
| One shared tooltip listing every option | `scope` shows nothing; the card cannot follow the pointer |
| An inverted chip as a tooltip | Text vanished on the host's card |
| Laying out the Desktop band from `bodyColumns` | Wrong width |
| A colored card for a pending check | Read as a verdict |
| Toggle marks `❄ ☑ ✔ ❆` | Emoji form or wide cell in Windows Terminal |
| Toggle state carried by a child Text's color | Ignored on Desktop |
| Printing a state word the app already shows ("bajo", the effort name) | Duplicates native UI; owner removed it |
| +/- stepper that runs a command per press | Each press wrote to the chat and moved the messages |
| `$.prompt.suggest` variants | Not drawn on 4.16336 (OBS); painted in the 5.11492 code, unseen |
| Copying 40 Desktop token hex values into an Svg palette | Breaks under the other theme and color layer; mod deleted |
| Module-level guards and caches | Lost on reload, shared across sessions |
| Two mods wrapping `AssistantMessage` | One was deferred so they do not stack |

## Open items nobody has seen on screen

In the running app, build 5.11492: nothing (the owner shots are 4.16336 and one later build). Drawn in the harness but never seen in the app: `variant="primary"`, a `Select`, a multi-line `Input`, the lowered `Progress`, the band close control. Seen nowhere: the legend card's placement in a dock pane; `ui.open({ columns })` on Desktop; the gap fix after commit `e516bc7` in three mods; glyph lanes in the owner's terminal font; `Placed`, `Backdrop` and `Theme`; the rail and widget pane seats; any Cowork site.
