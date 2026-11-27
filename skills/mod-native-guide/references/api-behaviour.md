# What the types say about behaviour: events, state, limits, test kit (engine 2.1.325, anchors re-found in 2.1.330)

CODE: the rest of `types/claude-code.d.ts` (24,261 lines) and `reference.md` lines 1-149, read by a helper on 2026-11-14 (third pass). "D:n" is a line of the types file, "R:n" of `reference.md`. In 2.1.330 the types file has 28,577 lines and `reference.md` 367, restructured. A second helper found about twenty of the anchors below with the same wording on 2026-11-26; those now give the 2.1.330 number (D:49, 1051, 3309, 4153, 4174, 6944, 7759, 8787, 11128, 14718, 18160, 18813, 21723, 22655; R:97, 122). Every other D: or R: number, and the coverage ranges, are 2.1.325 lines. api-digest.md (kept in the source repository, not shipped) holds elements, props and sites; this file holds everything else that changes what a mod shows.

Every line here is a **promise in the types**, not something seen on a surface. Treat each as UNVERIFIED on Desktop unless `traps.md` or `engine-behaviour.md` says otherwise.

Coverage: read in full D:1-99, 140-705, 760-890, 1230-1440, 1830-2395, 2900-3145, 3420-4040, 4440-5160, 5380-5690, 6470-6515, 7345-7700, 7800-7960, 8115-8330, 8850-8980, 9005-9095, 9603-9683, 10160-10230, 11816-12045, 12154-12374, 12444-12485, 12631-12661, 13015-13120, 13147-13280, 13454-13500, 13870-14050, 14673-14768, 15004-15110, 15185-15330, 15383-15535, 15700-15805, 16810-17320, 17380-17855, 18140-18400, 18455-18505, 18815-18895, 24160-24261. Skimmed by keyword only: the gaps between those ranges up to 18400. Not read: most of D:18895-24160 (the built-in tools' input schemas, about 5,000 lines with no bearing on a mod's tree).

## Events and calls that change what is shown

| Thing | What the types say | Line |
|---|---|---|
| `classic.MessageDisplay` (`displayContent`) | display-only hook, "fired with each batch of newly completed lines while an assistant message streams"; stored text and what the model reads are untouched | D:7759 |
| `turn.complete` | a returned `{text}` that differs from the answer is shown beneath it, with the plugins that wrote it; the record is never rewritten | D:4797, 15454 |
| `turn.step` | "What leaves the outermost hook is what is shown and recorded" | D:18813 |
| `session.append` hooks | the screen may show a row just before its rewrite: a scrub hook can flash the raw text | D:4685 |
| `$.session.append` | text blocks only; `type 'user'` is read by the model, `'system'` is a notice it never reads | D:3089, 11816 |
| `prompt.autocomplete` | plugin rows draw beneath the engine's, unhighlighted; `description` is "cut to the row by the surface" | D:11128 (4469 2.1.325) |
| `prompt.suggest` | dim text in an empty box, taken with Tab or the right arrow; never while the box has text, a turn runs or the session is headless. On Desktop also not with an attachment, a dictation or bash mode, while the answer still says shown (`engine-behaviour.md` section 1) | D:10168 |
| `prompt.edit` | a burst of keys is one edit | D:4450 |
| `command.describe`, `config.describe` | answers are cached until `$.ui.invalidate(<name>)` | D:4577, 5984 |
| `CommandSpec` | `argumentHint` is drawn dim after the name; `immediate: true` runs while a turn streams | D:1962 |
| `command.run` | `text` is a transcript line; a hook's own `{text}` shows under the plugin names | D:1895 |
| `/config` rows | `describe` gives label, description, `isHidden`; `isLocked` rows refuse a change; kinds boolean, choice, text, number; a `userConfig` string with `options` is a picker | D:1997-2104, 8307 |
| `/context` data | a category `color` is a ThemeKey; a square is drawn hollow under 0.7 full; grid 10 × 10, 20 × 10 for a million-token window, 5 wide under 80 columns | D:2210, 2262, 12184 |
| `ui.open` hooks | may retitle or deny, not rename | D:7572 |
| `ui.notify` | a rewrite by another plugin's hook is marked on a client; `cancelNotify` returns `{isSent}` | D:7612, 7888 |
| `ui.selection` | `undefined` when nothing is selected | D:7876 |
| Image blit | frames "some sixty a second"; `columns`/`rows` must match the mounted size or the blit is refused; a resize is a redraw | D:6944 (10228 2.1.325) |
| `$.audio` | clip from `asset`, `url` or `base64`; gain 0-4; `speak` uses the exact platform voice, first 4,096 characters | D:805, 13459 |

### Numbers a meter can read

- `rateLimits[]`: kinds `five_hour`, `seven_day`, `spend_limit`; `percentUsed` 0-100 with one decimal, above 100 on an exceeded spend limit; `resetsAt` ISO (D:12631-12646).
- `rateLimits` is empty off a subscription, and a missing figure is "left out, never zeroed" (D:13052). Draw the absent state; do not draw 0%.
- Context tokens and percent are absent until the first response and just after a compaction (D:12234).
- `session.measure` fires after each main-thread turn and when a window moves a whole point (D:4738, 12444). That is the redraw signal for a usage meter (a types promise); together with Desktop's code never re-asking on a timer (`engine-behaviour.md` section 3, CODE) it means the mod invalidates on this event. A countdown to a reset still needs `$.clock.every` (`desktop-sites.md`).

### Surfaces

- `$.session.surfaces()` lists the terminal first, then remote ones in attach order; a session can draw on several at once and a render hook reads `e.surface` per ask. It is empty in plain `-p`. `$.session.surface()` is deprecated (D:8787-8789).
- `Client` acts (key, pointer, post, advance, resize) work on terminal and desktop only (D:17240).
- "A Progress is Box and Text on every surface but mobile" (D:17481); matches the CLI code (`traps.md` row 2).
- `tool_use_id` on a tool group is "Absent on a desktop host that predates it" (D:18160).

## State, reload and redraw

- `$.state` is host-held, versioned and survives hot reload. A `get` during `ui.render` **subscribes** that instance: a later `set` redraws it "at the redraw rate" with no `invalidate`. A `set` during a render is refused. Only the owner plugin writes (D:4174 area).
- `$.state` is not stated to survive a process restart: "Persist through `$.store`". `$.store` is a JSON file in the Claude config directory, 4 MiB, values round-trip through JSON (D:4153).
- An atom's `shape` tag: a reload that names another tag finds the value absent (D:761, 13258). The bundled example test asserts the pane then shows its empty line. So a mod's empty state is also its "state shape changed" state.
- Hot reload cancels pending timers and runs `register` again; saves during a turn reload at turn end (D:3674 2.1.325; R:122 in 2.1.330 says the old `$.clock.every` timers stop). "A lone save reloads in about 0.25 s" was not re-found in 2.1.330.
- A failed load leaves the previous version loaded (R:97: "At a reload, the previous version stays loaded instead").

## Limits that reach the screen

| Bound | Value | Line |
|---|---|---|
| Hook time | 10,000 ms, 1,000 ms for a catch, 5,000 ms linger; the clock stops during `next` and `$` calls | D:5466 |
| `session.end` | the whole chain shares 1.5 s by default | D:14718 |
| Names (agent, command, tool) | 64 characters | D:489, 1967, 15226 |
| `$.session.messages` | newest 4,096 only | D:3309 |
| Background task description | 1,000 characters, then "... [+N chars]" | D:848 |
| `$.fs`, `$.store` | 4 MiB | D:3472, 3616 |
| AskUserQuestion | 1-4 questions; `header` chip at most 12 characters; 2-4 options; `label` 1-5 words; no "Other" (the host adds it) | D:1051, 22655 |
| Wrap-up box | recap and ask cleaned to one line of at most 500 UTF-16 units and drawn as plain text; a reply button fills the message box and the person sends it | D:24170 |

## Language and accessibility

- The types have **no** locale, interface-language, timezone or reduced-motion API. The only `language` is `Code`'s highlighter id (D:1702).
- `$.settings.read({ key })` reads any settings key by name, but no key is documented for language or theme (D:3826). How the shipped mods find the interface language is a project convention under review (owner-standards.md (kept in the source repository, not shipped)).
- Accessibility in the types: the desktop Button's accessible name is its label (D:1184); `Progress` has a label (D:8788); the band hint is read as a screen reader reads it (D:11345). Nothing else. `engine-behaviour.md` has what the Desktop code adds (roles, `aria-describedby` on hover anchors, focus ring).

## Test kit: what it can and cannot prove

- It mounts a component on a named surface (`terminal`, `desktop`, `vscode`, `mobile`) and acts by key. It exercises hooks and the returned description, "never a surface's paint" (D:49, 21723).
- `press`, `input` and `select` resolve when the chain settles; work asleep on the mocked clock waits for the test to advance it (D:17385).
- `FoundElement.text` is string children plus the prop a leaf draws as text; `ElementQuery` takes type, key, text (string means inclusion) and `in` (D:17494).
- Mocks: clock, store, env, session. **None** for settings, theme, surfaces, viewport or pointer (D:17725-17779). So a test cannot exercise a theme, a width, a hover or the interface language.
- Only `$.state`, `ui.render`, `$.ui.invalidate` and `session.append` exist beneath the plugin (D:18229).
- The bundled example (`pane.test.tsx`): a pane mounted on all four surfaces, found by `{ type: 'Text', text: /Bash/ }` because a Text takes no `key`; a state of an old shape gives "No tool calls yet."

## Promises worth a look on Desktop (none tested)

1. The `/context` grid size and hollow squares under 0.7, and whether a thin client ignores `columns`.
2. Plugin autocomplete rows beneath the engine's, unhighlighted.
3. The dim suggestion accepted with Tab or the right arrow (`engine-behaviour.md` section 1 has the code).
4. `/config` locked rows and deny reasons.
5. The rewritten-notification mark.
6. The task row's duration after the summary ("2m 2s").
