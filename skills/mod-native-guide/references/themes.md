# Themes: what shipped theme mods teach

What three published theme mods do that the bundled `look.md` does not say, and what building one theme taught. Read `look.md` first: it holds the API, `makeColors`, the scene rules, sound and style. This page never repeats it. Most lines are DOC or MOD. The lines from Telar are CODE, read in the 2.1.330 types, or OBS, seen or heard by Telar's author. A look still needs the person's screenshot in light and dark, and their ears for sound.

This page is written by hand, like `doc-only.md`, and is not regenerated.

## Sources

| Mod | Licence | Commit read | Build it names | Label |
|---|---|---|---|---|
| `theme-examples`, in `anthropics/claude-plugins-official` | Apache-2.0 | `0fbfda5`, 2026-11-25 | none; it tries the current shape and two older ones (INF) | DOC |
| `cktang88/claude-garden-theme` | MIT | `d3cb730`, 2026-11-19 | engine 2.1.325, macOS only | MOD |
| `spaut33/claude-pixel-office` | MIT | `9ccab43`, 2026-11-23 | Claude Code 2.1.330 | MOD |

Telar, a loom with a `Shader`, glass and sound, was built against engine 2.1.330 on Desktop 6.28899.6 on Windows, on 2026-11-26. Its lines name what was seen and what was only read.

`theme-examples` is Anthropic's, so its source and README count as DOC. **MOD** means: stated in a community mod's source or README at the commit named, and not measured here. Ideas are restated in this page's own words; no code is copied.

What each one is:

- `theme-examples`: 38 scenes, 26 of them in light and dark twins. 9 pictures run a `Shader` over a still Svg, and 2 of those have sound. A `/custom-theme` command and a picker card. A fireworks show over the scene.
- garden: one light paper theme with `makeColors` colors. Four dials draw real session numbers. A garden grows one step per turn from a per-session seed.
- pixel office: a pixel-art office with no colors of its own. Claude and its subagents walk to a station for each tool they run.

## Kinds of theme

Pick the kind before drawing. Each costs more than the one above it.

| Kind | What changes | Example |
|---|---|---|
| Colors only | `colors` from `makeColors`, no backdrop | `look.md`'s Paper |
| Still or looping scene | a scene whose own CSS loops, built once | most `theme-examples` scenes |
| Scene driven by the session | the scene is rebuilt from state at chosen moments | garden (per turn), pixel office (per tool call) |
| Scene with a shader | a `Shader` over a still Svg, answering the pointer | `theme-examples` Koi Pond, Ripple Tank |
| Any of these plus sound or style | `sound`, `style` in the same set | `theme-examples` Koi Pond, Falling Sand |

## Setting the theme

- **A set at `session.start` may answer `isDrawn: false`, and the sources disagree on what follows.** Garden says the window attaches later and the first set is not drawn, so it sets the look again on `session.attach` with `{ surface: 'desktop' }` (MOD, 2.1.325). `theme-examples` says the engine hands the theme that stands to a window that joins later, and sets once (DOC). Pixel office sets once at `session.start` (MOD, 2.1.330). A second set on attach is harmless, since a set replaces the whole look; it is allowed, not required. `theme-examples` also re-reads the stored choice on `prompt.submit`, to take a change another session made to the project. Its README says a new session or `/clear` shows no theme until a message is sent (DOC).
- **Check `problems` before setting.** Garden refuses to set when a `makeColors` line starts with "Desktop won't paint", and says that line instead (MOD).
- **Sound gets its own try, first.** A build without sound refuses the whole set; `theme-examples` reads that refusal as `does not know the attribute "sound"` (DOC). It tries the full set with sound, and on any failure sets the theme again without it. It keeps that try apart from its other fallbacks, so the refusal is not read as a wrong shape (DOC). `look.md` asks the same catch for `style`. Sound and style each need Claude Code 2.1.329 or later in the Code tab (DOC, interface page).
- **Name the scene twice for older engines.** Before 2.1.323 a backdrop named `id` and the hook read `e.props.id` (DOC). `theme-examples` and garden send `backdrop: { scene, id }`, and `theme-examples` reads `scene` first, then `id`, in the hook (DOC, MOD). Its comment says each engine keeps the members of `backdrop` it knows and drops the rest; an unknown top-level attribute is refused by name (DOC, types). The 2.1.330 `ThemeScene` type has `scene` and `glass` alone, so a mod that writes `id` casts its look to `ThemeSetArgs`.
- **Learn the engine's shape once.** `theme-examples` tries the newest shape, then `colorScheme` inside `backdrop`, then the older `$.ui.backdrop`, and remembers the one that worked until a reload (DOC). It moves on only for a `TypeError` or a refusal of the attribute; any other error is thrown. An old shape tried only after the newest one is a fallback, not a removed API.
- **Write each possibly absent call plainly.** The loader reads `$` calls off the source. `theme-examples` writes `$.theme.set(shape)` as is, under a `// @ts-expect-error` line, with its argument in a `const` above. Its comment says a call that is read, bound or passed keeps the whole module from loading (DOC; `doc-only.md`, create, has the static reading rules).
- **Type sound against older types.** `theme-examples` reads the sound type off `ThemeSetArgs` with `infer`, so the mod still compiles where `ThemeSound` does not exist (DOC).
- **Never name the command `theme`.** It is the engine's own command for the terminal's colors (DOC, `theme-examples` comment).
- **Clear only your own theme.** `$.theme.clear()` takes away whatever theme stands, another mod's too (DOC). `theme-examples` clears only on the person's word, at a preview's end or a show's end.

## Drawing the backdrop

- **Filter on `e.props.plugin`.** The `Backdrop` props carry `plugin`, who set the backdrop (DOC, types). `theme-examples` and pixel office pass the ask on unless the plugin and scene are theirs.
- **Pass on every surface you do not draw.** `Backdrop` is raised on `desktop` and `mobile`. `theme-examples` and garden draw on `desktop` alone; pixel office draws on both (DOC, MOD).
- **Answer at once.** Garden's hook is not async and answers from a snapshot built in other hooks. Its README says a late answer shows a still picture with every animation stopped, on 2.1.325 (MOD). Pixel office's hook is async and reads an atom, built on 2.1.330 (MOD). Anthropic's pages say nothing on the timing, and their example hooks are async (DOC). Nobody here measured either. The safe form is garden's: build the source in the event hooks and answer from a module variable that caches it. The state itself stays in `$.state`: garden writes each snapshot there, and rebuilds the cache from it at `session.start` after a reload (MOD).
- **Cache the source.** `theme-examples` builds each scene once and keeps it in a map (DOC). Garden rebuilds only when its snapshot changes (MOD).
- **Stay under 131,072 characters.** Over it the app draws nothing (DOC, `look.md`; MOD, garden). Garden drops plants until the picture fits under 122,000 (MOD). Pixel office merges runs of pixels of one class into one `<path>`, so a sprite is a few paths, not hundreds of rects (MOD). This limit is the scene's, not the tree limit in the rules.
- **Give every SVG `id` a hyphen.** The desktop app silently removes an id that is also a built-in name of the web page, such as `open` or `clear`. A gradient, mask or clip that points to it goes missing. No built-in name has a hyphen (DOC, `theme-examples` README).
- **Reuse shapes with `href="#id"`.** Pixel office draws repeated furniture with `<use href="#id">` (MOD). Garden's README says an `href` that is not `#some-id` freezes the scene (MOD, 2.1.325).

## Motion across redraws

- **A redraw restarts every animation.** Garden's README says it shows as a brief flash of the whole picture (MOD, 2.1.325).
- **Redraw rarely.** Garden redraws at a turn's start and end only (MOD). Pixel office redraws when someone moves, checked once a second (MOD).
- **Carry the phase over.** Give each loop a negative `animation-delay` for how far along it already is. Garden passes `--at`, seconds on a shared clock whose period every loop divides, and `--turn`, seconds into the turn (MOD). Pixel office sets `animation-delay: -(now mod 96 s)` on its long loops, and times each walk against `now` (MOD).
- **Keep timed switches at 400 ms or more.** Pixel office says the app's player treats anything quicker as flashing. It starts a short wait part-way through a 400 ms step instead (MOD).
- **Give reduced motion a finished picture.** `theme-examples` and garden end their style with a `prefers-reduced-motion: reduce` rule that stops every animation, and draw a composed resting picture (DOC, MOD).

## Light, dark and layout

- **A mod cannot learn the window's mode.** `theme-examples` makes each scene for one mode, sets `overrideColorScheme` to it, and names its twin in every answer (DOC). Pixel office draws day and night in one scene with `@media (prefers-color-scheme: dark)` (MOD). A `Shader` scene in `theme-examples` follows the window whichever entry was picked (DOC).
- **`@media` changed between builds.** Garden says any `@media` other than reduced motion, and viewport units, froze the scene on 2.1.325 (MOD). `look.md` 2.1.330 says size queries and `prefers-color-scheme` still move on `desktop`, and may draw still on `mobile` (DOC). On a build before 2.1.330, check on screen.
- **Tint the glass per mode.** Across the 38 rows of `theme-examples`, light scenes take a pale `tint` at 0.32 to 0.6 opacity, and dark scenes a near-black tint at 0.3 to 0.6. `blur` runs from 0 to 22, and every shader scene takes 16 and 0.6 (DOC). Pixel office takes `blur: 2, opacity: 0.45` so the office stays visible (MOD). `tint` is a raw color; a theme key is refused (DOC, types).
- **Keep the subject off the left edge.** The scene runs under the sidebar (MOD, garden), under the chat column and the session rail (DOC, `theme-examples`). Garden pins each layer to a corner with nested `<svg>`s under a root with no `viewBox` (MOD). Halftone Dawn draws its hills at a third of their weight under the reading column (DOC).

## Shaders

- **Write the module path as a string in the element.** `<Shader module="./scenes/koi-pond/scene.ts">`, one `case` a scene, with `satisfies never` after the switch. A path from a list or a renamed `Shader` leaves the Svg alone (DOC, types and `theme-examples`).
- **The still is a finished picture.** It shows alone on an older build, under reduced motion and on a weak GPU (DOC).
- **The language is `claude-code/shader`.** A file declares `buffer`s stepped with `dt`, reads `pointers`, `time` and `size`, and keeps small data in a `table` (DOC, `theme-examples` Ripple Tank). The file is a subset of TypeScript with no `while` loops, no recursion and no imports from other files (DOC, interface page). `claude plugin validate` prints each shader's cost (DOC, `look.md`).
- **Mind the published limits.** A `scene` name is letters, digits, `_` and `-`, up to 64 characters. A `Shader` takes eight `values` at most. `ui.pointer` hears two clicks a second, and the app drops the rest. The reference page states no limit on a scene's size (DOC, reference page, Limits).
- **Send state through `values`, never a stream.** A redraw that changes only `values` keeps the shader running and eases it (DOC, types).
- **A held press is `down` 1 with `gone` 0.** `down` stays 1 after the press lifts, and `gone` counts the seconds since. `where.zw` is the last frame's place, so a drag is `where.xy` minus `where.zw` (CODE, `Pointer` in the 2.1.330 types).
- **Make a click target bigger than one step.** `ui.pointer` gives `x` and `y` in steps of 1/64 of the backdrop (CODE). On a window about 960 points tall a step is about 15 points. Telar's threads were each thinner than a step, so a click named the wrong thread or none. It picks a whole turn's rows instead. Its tests had used exact heights, which hid this (INF, Telar's audit, not seen on screen).
- **`composer` places the chat column.** The shader's `composer` is the prompt box, left, bottom, right and top from 0 to 1 (CODE). Telar frames the chat column with its width, and the frame showed on the owner's screenshot (OBS 6.28899.6). That the box follows the sidebar and a narrow window is INF.

## Sound

- **Quiet, sparse, never a chime.** Koi Pond takes all its notes from one pentatonic scale; Falling Sand is mostly noise. Both `ask` cues slide or drop their notes fast, so they do not ring like a system chime (DOC).
- **Pitch a press by where it lands.** Its `click` cues pick a note by the press's place from left to right (DOC).
- **A `click` cue cannot keep to one zone.** It plays for a click anywhere on the bare backdrop. Telar wanted sound on the cloth alone, so it dropped its `click` cue (OBS 6.28899.6).
- **The `click` cue plays when the click ends.** A shader sees the press on its first frame, before the sound. Telar's string moved on press and sounded on release, and the owner heard that as a delay. It now shows the pluck on release, as `gone` starts, and the sound lines up (OBS, by ear, 6.28899.6).
- **`$.audio.play` plays nothing on Windows.** Engine 2.1.330 logs "no audio player on windows; not played" and raises no error (CODE, not heard). A theme's sound goes in `sound`.
- **Share one sound between twins.** Both entries of a scene take one sound, so switching between them keeps the ambience playing (DOC).
- **Make frequent cues faint.** Falling Sand's `tool` cue is one grain, about as loud as the ambience (DOC).

## Staying out of the way

- **A theme fault never blocks the session.** Pixel office ends every hook with `.catch(($, e, next) => next(e))`; garden does it on `tool.call` and its command (MOD). `theme-examples` wraps every background step so a fault never costs the person their prompt, and tells it in one dim transcript line (DOC).
- **Log to debug.** `$.ui.log(text)` with no option adds a line to the transcript; `{ to: 'debug' }` keeps it off screen (DOC, types).
- **Serialize state changes.** Pixel office runs each read-change-write of its atoms through one promise queue, so events and its timer never race (MOD). Its atoms carry a `shape` tag, so a reload declines older values (MOD; `Shaped` in the types).
- **Say what is stored.** `theme-examples` stores the choice per project in `$.store`, with linked worktrees sharing the main tree's key, and per session for the 200 sessions that chose last. Its README lists every value it keeps (DOC).

## Before shipping a theme

- [ ] `makeColors` lists no "Desktop won't paint" line.
- [ ] An `isDrawn: false` at `session.start` is not reported to the person as a failure.
- [ ] `sound` and `style` each have a try of their own, with a set without them after it.
- [ ] The `Backdrop` hook checks `e.props.plugin`, the scene name and the surface, and answers from a prepared source.
- [ ] The scene is under 131,072 characters at its largest state, and every id has a hyphen.
- [ ] Each redraw carries its animations' phase; no timed switch is under 400 ms.
- [ ] Reduced motion shows a finished picture; a `Shader` scene's still is one too.
- [ ] Every target a click picks is larger than a 1/64 step, and a hold is read as `down` 1 with `gone` 0.
- [ ] Light and dark were both looked at, with a long code block and a larger text size.
- [ ] `$.theme.clear()` runs only on the person's request.
