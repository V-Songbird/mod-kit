# Themes: what shipped theme mods teach

What three published theme mods do that the bundled `look.md` does not say, and what building one theme taught. Read `look.md` first: it holds the API, `makeColors`, the scene rules, sound and style. This page never repeats it. Most lines are DOC or MOD. The lines from Telar are CODE, read in the 2.1.330 types, or OBS, seen or heard by Telar's author. A look still needs the person's screenshot in light and dark, and their ears for sound.

This page is written by hand, like `doc-only.md`, and is not regenerated.

## Sources

| Mod | Licence | Commit read | Build it names | Label |
|---|---|---|---|---|
| `theme-examples`, in `anthropics/claude-plugins-official` | Apache-2.0 | `0fbfda5`, 2026-11-25 | none; it tries the current shape and two older ones (INF) | DOC |
| `cktang88/claude-garden-theme` | MIT | `d3cb730`, 2026-11-19 | engine 2.1.325, macOS only | MOD |
| `spaut33/claude-pixel-office` | MIT | `9ccab43`, 2026-11-23 | Claude Code 2.1.330 | MOD |

Telar, a loom with a `Shader`, glass and sound, was built against engine 2.1.330 on Desktop 6.28899.6 on Windows, on 2026-11-26. It was later renamed Loom; both names below are that one mod. Its lines name what was seen and what was only read. A line marked "CODE, renderer" was read in that Desktop's renderer, and nobody saw it on screen unless the line says so.

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
- **An installed mod runs its cached copy.** `/reload-plugins` reads a mod again from its folder only when the session loaded it from that folder. A mod installed from a marketplace runs the copy cached at its version. To try a change there: bump the version, run `claude plugin update <mod>@<marketplace>`, and restart (OBS 2.1.330: the update answered "Restart to apply changes"). Sessions opened before keep the older copy, so two sessions can run two versions of one theme (INF). Telar's cached copy was one version behind its folder, and its builder blamed it for highlights that turned white. That symptom came back after the update: it was the link rule under glass (Light, dark and layout).
- **A rename leaves the open session without its theme.** After Telar became Loom, the owner's open session lost its backdrop. The theme is set at `session.start`, and a reload does not run that again. Offer a command that sets the theme, or open a new session (INF, not confirmed). A rename also starts the stored choices over.

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
- **Under glass, links take the text color.** While a theme's `glass` lies over the conversation and the backdrop plays, the app's stylesheet sets the link color of every reply to the primary text color (CODE, renderer). The owner saw links in the accent for a moment, then white, in dark mode (OBS 6.28899.6). `ThemeColors` has no link key and `ThemeStyle` no link rule; only `glass: false` leaves the rule off. Check the palette's accent by script first, then stop: no palette fixes it. The rule sits in a stylesheet, which a search of the bundle's scripts never finds.
- **Decide glass on or off before building around it.** Glass costs the link color. No glass leaves the scene sharp under the words. Loom built a no-glass mode over seven versions, with a gap, a mirrored edge and an entrance, and the owner then asked for glass always on; all of it was removed (OBS).
- **The reading column's glass is wider than the prompt box.** It is the composer column plus 24 px a side, fading over those 24 px, and its blur is half of `max(6, blur)` (CODE, renderer). Telar guessed the margin at 12 pt, read 45 pt off one screenshot and about 15 pt off the next: the first reading had taken the blur's own soft edge for glass (OBS, at the wide conversation width only).
- **Keep the subject off the left edge.** The scene runs under the sidebar (MOD, garden), under the chat column and the session rail (DOC, `theme-examples`). Garden pins each layer to a corner with nested `<svg>`s under a root with no `viewBox` (MOD). Halftone Dawn draws its hills at a third of their weight under the reading column (DOC).

## Shaders

- **Write the module path as a string in the element.** `<Shader module="./scenes/koi-pond/scene.ts">`, one `case` a scene, with `satisfies never` after the switch. A path from a list or a renamed `Shader` leaves the Svg alone (DOC, types and `theme-examples`).
- **The still is a finished picture.** It shows alone on an older build, under reduced motion and on a weak GPU (DOC).
- **The language is `claude-code/shader`.** A file declares `buffer`s stepped with `dt`, reads `pointers`, `time` and `size`, and keeps small data in a `table` (DOC, `theme-examples` Ripple Tank). The file is a subset of TypeScript with no `while` loops, no recursion and no imports from other files (DOC, interface page). `claude plugin validate` prints each shader's cost (DOC, `look.md`).
- **Mind the published limits.** A `scene` name is letters, digits, `_` and `-`, up to 64 characters. A `Shader` takes eight `values` at most. `ui.pointer` hears two clicks a second, and the app drops the rest. The reference page states no limit on a scene's size (DOC, reference page, Limits).
- **Send state through `values`, never a stream.** A redraw that changes only `values` keeps the shader running and eases it (DOC, types). The ease is `1 - e^(-dt/0.3)` a frame, so a value takes about a second to arrive. Each changed value is charged 10 bits, and past 16,384 bits the player clears every buffer and starts its frame count again. A value is rounded to about a 1024th of its range, so a tight range gives a finer value (CODE, renderer).
- **A new Svg source restarts the shader.** A changed source string stops the running shader and starts another, no sooner than 1 s later. The old picture stays frozen until the new first frame, which fades in over 500 ms. No buffer survives. A slow start delays the next one: each millisecond past 500 adds four of rest, 60 s at most (CODE, renderer). Loom changed its Svg on every tool call, and the owner saw a still cloth through a working turn (INF). Change the Svg on rare events, such as a turn's end, and send the rest as `values`.
- **The Svg shows alone for about a second.** At each start the Svg is drawn with no shader over it. The owner saw the whole cloth behind the chat while a session loaded (OBS 6.28899.6). So the still must be presentable there too, and a layout only the shader draws, such as a frame around the column, is missing in it.
- **Draw in the still what the shader will show.** Loom's still drew a running turn's threads as woven cloth, and the shader then parted them: the owner saw a finished cloth come apart. The shader also capped loose threads at 48 where the still's layout capped them at 80, so rows hid. One shared constant and a test that the still parts the same threads fixed it; the owner confirmed it (OBS 6.28899.6).
- **Keep the Svg under a shader still.** An Svg with `animation`, `transition`, `@keyframes` or SMIL is copied and sent to the GPU again every other frame, up to 1.43 million points each time, for as long as it is the source, a finished `fill="freeze"` included (CODE, renderer). Animate in the shader.
- **What the Svg leaves unpainted is the app's surface.** The Svg is drawn over the app's own surface color, in its current mode, and the canvas is opaque (CODE, renderer). A scene needs no ground rect, and a hole in a figure, such as lace, is left unpainted (not seen on screen).
- **The player rests when nothing changes.** After more than 90 frames with no change and no pointer in the window, it draws one frame every 250 ms until something changes (CODE, renderer). A shader with any motion that never ends draws at full rate for as long as the window is open. The owner found a scene that moved only on session events "barely animated" (OBS). Loom's answer was motion that plays only while a turn runs.
- **Answer the pointer in the shader.** Hover, drag and spring come from `pointers` and a buffer, in the same frame. The `ui.pointer` hook hears clicks alone, and an answer through `values` is eased. The owner called the hook-driven version slow to respond (OBS). `over` is 1 while the pointer is over part of the app, so `1 - over` keeps a reaction to the bare backdrop (CODE, types; not seen).
- **`still` was never set.** The types say `still` is 1 under Reduce Motion. On Desktop 6.28899.6 nothing sets it: under Reduce Motion no player starts and the Svg shows alone (CODE, renderer; INF for the gate). No player starts on a software renderer either, nor for 60 s after a stop for flashing, or 300 s after one for slowness (CODE, renderer).
- **A held press is `down` 1 with `gone` 0.** `down` stays 1 after the press lifts, and `gone` counts the seconds since. `where.zw` is the last frame's place, so a drag is `where.xy` minus `where.zw` (CODE, `Pointer` in the 2.1.330 types).
- **Make a click target bigger than one step.** `ui.pointer` gives `x` and `y` in steps of 1/64 of the backdrop (CODE). On a window about 960 points tall a step is about 15 points. Telar's threads were each thinner than a step, so a click named the wrong thread or none. It picks a whole turn's rows instead. Its tests had used exact heights, which hid this (INF, Telar's audit, not seen on screen).
- **`composer` is a last sighting, not the layout.** The shader's `composer` is the prompt box, left, bottom, right and top from 0 to 1, y up (CODE). Telar frames the chat column with its width, and the frame showed on the owner's screenshot (OBS 6.28899.6). The app looks for the box every 250 ms while a shader runs. It sends nothing while a dialog, a menu, an approval card or a question is open. The shader starts at all zeros and keeps the last box it got, however old (CODE, renderer). After a restart the owner saw the frame at a wrong width until the first message (OBS).
- **Never guess the column.** The column is not centred when the sidebar or a side pane is open. Loom's fallback, a centred 512-point column, sat about 113 points left of the real one (OBS 6.28899.6). An earlier guess of 768 points was too wide. Loom now draws its frame only around a reported box, and the owner confirmed it (OBS). Draw nothing that needs the column until `composer` is not zeros.

### Shader cost

`look.md` says `claude plugin validate` prints each shader's cost. Run it before and after each shader change, and compare the two. Building Telar, these were the costs it printed and what brought them down. They are validator estimates on 2.1.330, read from the session records and not re-checked, and the GPU class of each figure was not recorded:

| What | Cost printed |
|---|---|
| `theme-examples` Koi Pond, for reference | 4.97 ms |
| a loop over `pointers` for every pixel | 3.77 ms, 9.8 ms before it was bounded |
| two `scene` samples | 9.96 ms, which is the 30 fps cap below, so likely a sharpness drop rather than a cost (INF) |
| a float buffer with no bound on its values | 3.28 ms |
| `exp` and `pow` | about 1.77 ms |

- What fixed them: the buffer at a quarter of the resolution, one `scene` sample, a `clamp` on the displacement, and linear ramps in place of `exp` and `pow`. A `smoothstep` costs as much as a `pow` (table below), so it saves nothing there. Telar went from 2.76 ms to 1.34 ms, against a target of 1.5 ms.
- Read the weak-GPU sharpness too. One extra scene read dropped it from 0.87 to 0.62, and removing it brought it back to 0.84.
- A weak-GPU total is not a free budget. In `theme-examples`, the weak-GPU sums sit near 4.96 ms at 60 fps and 9.96 ms at 30 fps whenever sharpness drops below 2 (INF: the player lowers sharpness to fit a frame cap). Budget on the verdict, the weak-GPU sharpness, the fast-GPU ms and the fps.

What the estimate is made of (CODE, Desktop 6.28899.6):

| Operation | Price per vector lane |
|---|---|
| `add sub mul min max step mix clamp floor fract abs` | 1 |
| `div sqrt sin cos exp log` | 4 |
| `mod` | 6 |
| `pow smoothstep` | 9 |
| `tanh` | 12 |
| `atan` | 20 |

- A loop costs its body times its turns, and a loop over `pointers` is charged for 4.
- The frame budget is `300 / fps` ms: 5 at 60 fps, 10 at 30. A printed figure at that top means sharpness was cut to fit. Sharpness runs from 0.5 to 2; under 0.5 on a fast GPU the shader is refused.
- Memory counts too, against 20 MB on a weak GPU and 60 MB on a fast one. A buffer is doubled. One with a `size` or a `scale` does not shrink with sharpness.
- **Read the cost per line.** `validate` prints each costly line's share, such as `44% at hooks/loom.ts:79` (OBS 2.1.330). Start there.
- **Multiply by a constant; never divide by one.** A division costs four multiplications.
- **Compute a helper once per pixel.** A mirror function called several times took Loom from 3.80 ms to 4.98 ms; one variable holding its result gave 4.05 ms (validator, 2.1.330).
- **Move pointer work into a small buffer.** Loom moved its per-pixel pointer loop into a 1 by 128 buffer, drew a string's shape with parabolas, and multiplied by constants. Together they took it from 4.98 ms at the cap to 3.74 ms, and weak-GPU sharpness from 0.72 to 0.94 (validator, 2.1.330).

## Sound

- **Quiet, sparse, never a chime.** Koi Pond takes all its notes from one pentatonic scale; Falling Sand is mostly noise. Both `ask` cues slide or drop their notes fast, so they do not ring like a system chime (DOC).
- **Pitch a press by where it lands.** Its `click` cues pick a note by the press's place from left to right (DOC).
- **A `click` cue cannot keep to one zone.** It plays for a click anywhere on the bare backdrop. Telar wanted sound on the cloth alone, so it dropped its `click` cue (OBS 6.28899.6).
- **The `click` cue plays when the click ends.** A shader sees the press on its first frame, before the sound. Telar's string moved on press and sounded on release, and the owner heard that as a delay. It now shows the pluck on release, as `gone` starts, and the sound lines up (OBS, by ear, 6.28899.6).
- **`$.audio.play` plays nothing on Windows.** Engine 2.1.330 logs "no audio player on windows; not played" and raises no error (CODE, not heard). A theme's sound goes in `sound`.
- **Share one sound between twins.** Both entries of a scene take one sound, so switching between them keeps the ambience playing (DOC).
- **Make frequent cues faint.** Falling Sand's `tool` cue is one grain, about as loud as the ambience (DOC).

## Recipes from building Telar

Recipes, not rules: most fixed a look the owner rejected on Desktop 6.28899.6 (OBS). The lines on measuring, reference photos, logos, variants and tests are working habits from those sessions, not looks. `makeColors` checks the app's text, not a scene's own figures.

- **Check figure against ground by script, in both modes.** An indigo palette measured a contrast of 1.00 between ground and figure in dark mode, and an oat one 1.03. Telar's script now requires at least 2.5 in light and in dark, with a dimmer ground and a lighter figure in dark.
- **Generate palettes by rule, then check they fit.** 14 grounds by 18 tints gave 109 pairs that pass the contrast check. Passing contrast was not enough: the owner said a navy ground did not go with its red. A harmony rule cut the set to 77: lightness and chroma set per role in OKLCH, a ground of low chroma, figures that carry the color, and hue pairs either within 45 degrees or between 150 and 210 apart. The owner said those fit.
- **Take the dark ground from the cloth's own ground.** Blending every light ground toward one blue-black turned a red cloth muddy brown. A near-neutral dark ground from the cloth's own hue was accepted.
- **Ship colors with the scene, at a low dose.** With a backdrop alone, the owner said everything was still white and the theme had no point. A tint of up to 30% then turned the whole app brown under a red cloth. Loom tints surfaces 5 to 8% and text 2 to 4%, and keeps the strongest color for the accent. A `colors off` choice keeps the backdrop and gives the app its own colors back.
- **The glass frosts the chat column.** The scene shows sharp only in the side margins, blurred behind the messages. So a frame without the chat panels misjudges how heavy the scene reads.
- **Near-transparent glass shows what is painted behind it.** A light band Telar blamed on the frame margin came from the glass's own `blur` of 48. Its glass went to `blur` 6, opacity 0.45. For a time it painted a flat ground inside the chat column. The owner then saw that column "totally dark" and asked for the cloth at 10% behind it. Loom keeps the cloth there under glass at opacity 0.9 (the fix was not confirmed on screen).
- **Say opacity as how much of the scene shows.** Opacity 0.9 shows 10% of the scene. Asked to "lower the transparency", the assistant raised opacity when the owner meant the opposite, and six values followed. A glass at blur 32 and opacity 0.88 read as a flat gray slab, and the owner rejected it. Opacity 0.85 hid the still during the first second of a session, and the owner confirmed that (OBS).
- **Measure on two screenshots; never guess a second number.** Ask for the same frame before and after the change you wait for. Divide screenshot pixels by the display scale: 767 px at 150% is about 512 points. Loom's border then sat within 2 px of the column.
- **Ask for a reference photo of a material.** Three rounds of guessing at "cloth" all came back as "bricks". Two photos from the owner then set the redesign.
- **Draw objects a person can name.** The owner rejected abstract nods to a reference and asked for swords, mushrooms, rings. Render each figure at its real size first: a puzzle piece read as a blot until its notch was redrawn. Draw generic objects, never a registered logo.
- **End a painted area flush and in one color.** A shaded border read as a lighter red. Cloth that stopped short of the glass looked frayed. A hard wooden beam was called ugly after a fade the owner had liked, and was removed.
- **No zoom on hover.** The owner rejected a loupe under the pointer. A plucked string on a click, the owner's own idea, drew no complaint.
- **Give the person a way to see every variant.** The owner reviewed designs with a seed command, one number at a time.
- **Keep an unapproved look out of the tests.** One beam's test was rewritten four times as the look changed. Test what must hold, such as contrast and size.
- **Keep texture grain near 4 pt.** Threads 9 pt wide read as bricks. A grain of about 4 pt, overlapping threads and a ground layer in the cloth's own color fixed it.
- **Nothing thinner than one row.** Threads squashed thinner than one row broke the figures into dashes. Telar keeps a minimum thickness of one row.
- **Dose the interaction low.** The owner found the first click effect far too strong. The ring went from 14 pt to 6 pt, and the other effects were toned down.

## Staying out of the way

- **A theme fault never blocks the session.** Pixel office ends every hook with `.catch(($, e, next) => next(e))`; garden does it on `tool.call` and its command (MOD). `theme-examples` wraps every background step so a fault never costs the person their prompt, and tells it in one dim transcript line (DOC).
- **Log to debug.** `$.ui.log(text)` with no option adds a line to the transcript; `{ to: 'debug' }` keeps it off screen (DOC, types).
- **Register commands outside the theme's try.** Telar registered `/telar` in the same `try` as `$.theme.set`. When the set failed, the command never existed (INF, Telar's audit).
- **Say what the set answered.** `/telar sound on` said "Sound on" even when the build refused the sound. Report a refusal as a refusal (INF, Telar's audit).
- **Cancel the timer you replace.** Telar's `clock.after` timers were never cancelled, so an old note erased a newer one (INF, Telar's audit).
- **Never `await` inside `tool.call`.** An `await` there slows every tool the session runs. Read the state once, in the backdrop hook (INF, Telar's audit).
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
- [ ] `claude plugin validate` ran before and after the last shader change, and neither the cost nor the weak-GPU sharpness got worse without a reason.
- [ ] The Svg source changes only on rare events, never on each tool call, and holds no animation under a `Shader`.
- [ ] The still shows the same state the shader will draw, from shared constants, and reads well alone for the first second.
- [ ] Nothing is drawn around a guessed column while `composer` is zeros.
- [ ] Nothing moves forever at rest, and nothing promises a link color under glass.
- [ ] Commands register outside the theme's `try`; no timer is left running when a newer one replaces it; no `await` sits in `tool.call`.
- [ ] Figure and ground reach the contrast you chose in light and in dark, checked by script.
- [ ] Light and dark were both looked at, with a long code block and a larger text size.
- [ ] `$.theme.clear()` runs only on the person's request.
