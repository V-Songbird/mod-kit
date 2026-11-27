# How Desktop's engine behaves around a mod's tree (Desktop 5.11492.5.0, engine 2.1.325; about 14 values re-read on 6.28899.6, changes marked "6.28899"; ENG line numbers are 5.11492's)

CODE: read by a helper on 2026-11-14 (third pass) in the engine chunk a Desktop bundle file (one statement per line: "ENG n" is that line), the Code-tab chunk a Desktop bundle file ("CT n"), the composer chunk a Desktop bundle file and the loader chunks; spot-checked by the coordinator (last section). INF marks inference. Nothing here was seen in the running app.

## 0. Which elements a surface gives (`$.ui.resolve(e)`)

CODE, engine 2.1.325, module an engine module (@51515, @53828, @295283, @296615), read by the coordinator on 2026-11-14.

| `e.surface` | Elements in the table |
|---|---|
| `terminal` | Box, Text, Button, Input, Select, Link, Code, Markdown, Progress, Client, Raster, Image |
| `desktop` | Box, Text, Button, Input, Select, **Svg**, Link, Code, Markdown, Progress, Client |
| `mobile`, `vscode` | Box, Text, Button, Input, Select, **Svg**, Link, Code, Markdown, Progress |

- The table is built from the surface alone, frozen, and cached per surface. So every Desktop site has `Svg`; `Client` exists only on terminal and desktop; `Raster` and `Image` only in the terminal.
- **`'Svg' in ui` does not tell the surface.** The wrapper that hands the table to the mod, then the sandbox function, adds a stub that draws a fragment for every element name the engine knows and this surface lacks, and the stub is an ordinary entry of the table. Probed on 2026-11-14 with a scratch copy of the former Roadmap pane mod (since moved to Foreman) under `claude plugin test`, terminal surface: the table's names are `Box, Button, Client, Code, Image, Input, Link, Markdown, Raster, Select, Svg, Text` on 2.1.319 and the same plus `Progress` on 2.1.325; `'Svg' in ui` and `'Raster' in ui` are both true. So `'X' in ui` answers one question only: does this engine version know element X. Whether the surface draws it is `e.surface`: test `e.surface === 'terminal'` first, as `git-pane` and Foreman's Roadmap pane do (Foreman's `hooks/register.tsx`). An `Svg` written on the terminal draws nothing.
- `Progress` is new in 2.1.325. The two older engines on this workstation, 2.1.319 (the `claude` on PATH) and 2.1.321, have the same tables without it (read from the binaries; `'Progress' in ui` is false on 2.1.319 and true on 2.1.325 in the same probe). Rule 6 of `SKILL.md` keeps `Progress` out of a mod's Desktop UI; a mod that still uses it in the terminal must test `'Progress' in ui`: on an older engine `ui.Progress` is undefined. All three engines list `Svg` for desktop.
- Another plugin can change it: a `ui.resolve` hook may answer with its own table. An element it leaves out is "withheld": it draws a fragment and the engine logs `$.ui.resolve: <Name> was withheld by a ui.resolve hook; it draws a fragment`. No plugin in this project or on this workstation registers that hook (searched 2026-11-14).
- There are four surfaces, not two. A mod that branches on `e.surface === 'terminal'` treats `mobile` and `vscode` as Desktop; nothing in this skill was measured on those two.
- The engine checks `color`, `backgroundColor` and `borderColor` as one set of color props: a key that works as a background is not handled differently as a border.

## 1. `$.prompt.suggest`: the 5.11492 code paints it

Earlier builds were reported as "shown, never drawn" (OBS, project record). In 5.11492 the Code-tab composer has the paint path:

- The engine answers the ask with `{shown: t.suggest(e.text)}` (ENG 1368); with no composer registered, `shown:false` (ENG 1363).
- The Code-tab adapter (CT 127) accepts only when the composer exists, is empty and the session is not busy, then stores the text on the session record (`promptSuggestion`, chunk a Desktop bundle file @326465).
- The composer paints it (a Desktop bundle file @337210): `<div aria-hidden data-prompt-suggestion-ghost class="truncate text-muted-as-secondary">` in an overlay, and blanks the placeholder. One line, ellipsis, muted-secondary ink.
- It is accepted with <kbd>Tab</kbd> or the forward arrow (right, or left in a right-to-left layout), no modifiers, on an empty draft (a Desktop bundle file @407917).
- The paint condition is narrower than the answer (a Desktop bundle file @406761): `showPromptSuggestion` is true only with a suggestion, an empty draft (the composer's `hasTextStore` reads false), no bash mode, and none of three more things, traced on 2026-11-14: an attachment on the draft (`hasAttachments`), a voice dictation recording into this editor (status `recording` with insert-on-stop), or a `boxLine` prop (a host line inside the composer box; the Code tab passes `undefined` in 5.11492, so this one never blocks there). The adapter returns `shown:true` as soon as the store write succeeds and never reads that condition. INF: this is how a mod can be told "shown" while nothing is painted.

Rule for a mod: treat `shown` as "accepted", not "visible". Keep the Button that calls `$.prompt.fill` as the reliable path until a 5.11492 screenshot shows the ghost text. UNVERIFIED on screen.

## 2. `$.prompt.fill` decorations (`EngineDraftPaint`)

- Reply shape `{supported:true, text, cursor, decorations?, superseded?}` (ENG 72). Run schema (ENG 1692): `{start, end, color?, backgroundColor?, dimColor?, bold?, italic?, underline?, strikethrough?}`.
- The whole list is dropped, text kept, when: it is not an array; it has more than 500 runs; a run fails the schema; runs overlap, are unordered or have `end <= start`; the last `end` passes the text; or any offset is off a grapheme boundary (`Intl.Segmenter`) (ENG 1693-1697).
- Paint: `color`, `backgroundColor`, underline and strikethrough use the CSS Custom Highlight API (`CSS.highlights` plus an adopted `::highlight(name)` sheet, ENG 1656-1663); if the API is absent nothing is painted and nothing is logged. Bold and italic are ProseMirror inline decorations; **bold is semibold (580), not 700** (a Desktop bundle file @168505).
- Colors go through the engine's resolver (ENG 958): hex and `rgb()/hsl()` pass, theme keys and the fixed ANSI names resolve, anything else becomes `currentColor` (the color is dropped). `dimColor` is the color at 60%, or the dim ink.
- No `virtualText` exists in the bundle (0 hits in every `.js`): Desktop paints no virtual text (INF).
- Refused or dropped: text over 1,000,000 characters (ENG 1688); a rewrite that "would add characters the person cannot see" or "would not read back as written" (debug log, ENG 1718-1721); a fill over an unread non-empty draft the host did not fill (`filled:false`, ENG 1366).

## 3. When a drawn site is asked again

- A site is keyed by the JSON of its props (ENG 330). The DOM is rebuilt only when the answer object changes (ENG 1375-1390).
- Pacing (ENG 331): `AssistantMessage`, `Pane` and `AbovePrompt` **coalesce** (an ask in flight marks the site dirty and one more ask follows the answer); every other component **supersedes** (the new ask aborts the one in flight).
- Minimum gap between asks, `uiRenderPaceMs` (a Desktop bundle file @35161): **1,000 ms** for AskUserQuestion, AssistantMessage, CommandOutput, InfoNotice, Spinner, ToolGroup, ToolProgress, ToolResult, ToolUse, TurnDuration and UserMessage; **0 ms** for AbovePrompt, Pane, SessionMode, PromptHint and Theme. 6.28899 (CODE, re-read; the table moved to a Desktop bundle file): `AgentRow` joins the 1,000 ms set, and `Theme` is now **500 ms**; the coalesce set is unchanged.
- Width: a ResizeObserver, one per animation frame, recomputes `bodyColumns = floor((clientWidth - padding) / cellWidth)`; no-op changes are dropped; while a pointer is down in the site the update is held and sent 200 ms after release (ENG 1423-1448). So a drag does not redraw the tree under the pointer.
- Viewport change re-asks every site of the session; the DOM measure is debounced 150 ms (ENG 416-420, 1470).
- `$.ui.invalidate` with instances re-asks those; without, and on session start, warm and serve events, it re-asks every site (ENG 382-399).
- There is **no clock**: nothing re-asks on a timer. A value that changes with time needs the mod to invalidate (INF).
- An ask times out at 20 s; an unanswered ask is retried once; two misses mark the component unhooked and it draws nothing (ENG 106, 348-365).
- Between asks the old tree stays on screen (a 2,048-entry kept list answers by props key, ENG 341-351). The tree is cleared only by a null answer.
- Empty pane: "Nothing to show yet" with "{plugin} has not drawn in this pane", `role=status` (ENG 1456). No timer in code: the CSS hides it for 0.5 s and fades it in over 0.15 s (`animate-placeholder-reveal`, main CSS @273846). So a pane that answers within half a second never flashes the placeholder.

Rules for a mod: a transcript row cannot animate faster than once a second; a band or pane can redraw as fast as it invalidates, so throttle on the mod's side; never rely on a redraw during a drag.

## 4. Limits on a tree

Whole tree (ENG 30-60): fewer than **2,000 nodes**, depth under **32**, under **262,144** characters (6.28899 adds a third count refused past 66); a shared or cyclic object fails. Over any bound the whole answer is refused (null): the site clears. No host log text was found for it. A `Select` counts its options and a `Markdown` its pressable links as nodes.

Per node (a failing node degrades to its children only; the rest survives):

| Thing | Bound |
|---|---|
| `Select` options | 500 |
| `Input` rows | clamped to 200 |
| `Input` length | 16,384 |
| `Link` href | 2,048 characters, http or https; otherwise drawn as plain text. 6.28899: `https:`, or `http:` only for `localhost`, `127.0.0.1` or `[::1]` (CODE) |
| `Markdown` pressable links | 500, each 2,048 |
| `Svg` | source 131,072 characters, width and height 4,096, no children |
| Client key, module and plugin ids | 256 characters |

Other bounds: 64 panes per roster (more refuses the whole roster, ENG 87); no cap on hover cards beyond the node count; toast and status text of up to 4,096 characters passes the engine's check, empty text drops the message (ENG 91-95); the Code tab then keeps a toast on screen for at least 6 s (`Math.max(timeoutMs, 6000)`) and cuts a toast over 240 characters to 239 plus "…" (CODE, 5.11492, the engine chunk @199532); toast time 4,000 ms default, 60,000 cap (ENG 99-102; in 6.28899 Desktop's schema keeps the 4,000 default but has no cap, a positive whole number only; the 2.1.330 CLI still refuses over 60,000 before the toast is sent, `terminal.md`); a `Client` post over 100,000 characters is not sent, more than 32 timers is refused, a render must answer within 2,000 ms (ENG 941, 1108-1111).

### What the person sees when a mod fails

| Failure | On screen | What the mod should do |
|---|---|---|
| The hook throws, or answers something that is not a tree | the answer is null: the site clears; a pane shows "Nothing to show yet" after half a second | catch inside the hook and return the error state (`recipes.md`, recipe 18) |
| The tree passes 2,000 nodes, depth 32 or 262,144 characters | refused whole, same as above, with no message to the person | cap every list before building it; count about six nodes per row with an Svg |
| One node breaks its own bound (a 501st option, a bad `href`, an oversized Svg) | only that node degrades to its children or to plain text | nothing: the rest draws |
| The hook does not answer in 20 s | the old tree stays; after a retry and a second miss the component is marked unhooked and draws nothing until the session re-asks | never await a slow call inside `ui.render`: read from `$.state`, and fill the state from an event |
| The hook runs past its budget (10 s in the types) | the engine drops the answer; the person may see the skip as a dim transcript line only while the folder hot-reloads | same |
| State of an old shape after an update | reads as absent | the empty state is also the "shape changed" state: make it read well |

The first two rows are CODE; the "on screen" column for the band and the footer is INF (only the pane's placeholder was read).

## 5. Hover cards, exactly

- A card is a Box with `position="absolute"`, `display="none"` and `hover={{ display: 'flex' }}` (ENG 1177). Where the mount lifts hover cards and the Popover API exists it becomes `popover="manual"` with `data-hover-card`; its anchor gets `tabindex=0`, `data-hover-anchor` and `aria-describedby`.
- Stripped from a lifted card (ENG 1178-1179): `position`, `top`, `bottom`, `left`, `right`, `display`, `width`, `height`, `minWidth`, `minHeight`, every `margin*`, every `padding*`, every `border*`, `backgroundColor`.
- Host chrome instead: fixed, `width:max-content`, `max-width:min(360px, 100vw - 16px)`, padding `pad-md` × `pad-lg`, `surface-3`, radius + 4 px, ring plus the popover shadow. A card too tall for the window gets a max height and scrolls.
- Opens **at once** on pointer enter and on keyboard focus. Closes 150 ms after pointer leave, on focus out, on <kbd>Esc</kbd>, on any scroll outside the card and on resize. No cap on how many are open; a card open before a redraw is shown again after it (ENG 1132-1143).
- Position (ENG 1128-1130): **above** the anchor, left edges aligned (not centered), gap at most 16 px, 8 px from the window edges; below when it does not fit above. If it cannot be placed it closes.
- A card that is not lifted is plain CSS hover inside `@media (hover:hover)`: it never opens on touch or keyboard.

Which mounts lift cards was not re-read here (`desktop-sites.md` has the band).

## 6. Focus and keys inside a site

- No roving focus and no arrow navigation: <kbd>Tab</kbd> walks buttons, inputs, selects, links and hover anchors in document order (ENG 1307).
- Focus ring: `outline:0; box-shadow: <the focus shadow>` on `:focus-visible`, the same ring as native controls.
- `autoFocus` focuses the first such element at draw time, only if nothing in the site already has focus (ENG 1302). Focus is restored after a redraw by key, else by index.
- `hotkey` takes one character `0-9a-z` (ENG 1239). The Button gets `aria-keyshortcuts` and a small cue square. It fires only when the keydown comes from inside the site, without Ctrl, Meta or Alt, without Shift unless the key is a digit, not during IME composition, and not while typing in a field (input, textarea, select, contenteditable, combobox). A held key does not repeat the press. If two Buttons of one site share a hotkey the **last** in document order is pressed (ENG 1315-1317; re-read: the handler queries one site's own root, `[...e.querySelectorAll("button[data-press-hotkey]")].filter(…).at(-1)`). The types add a case this code does not show: two plugins on one hotkey press neither (api-digest.md (kept in the source repository, not shipped)); on Desktop each plugin's site is its own root, so they do not meet.
- <kbd>Esc</kbd> in a mod field blurs it and returns focus to the host; it also closes an open hover card or Select list. Elsewhere the engine leaves Esc alone (ENG 1319-1330).
- `Input`: a single line submits on <kbd>Enter</kbd>; a multi-line one only when it has a `submitLabel`, with <kbd>Shift</kbd>+<kbd>Enter</kbd> for a newline and <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to submit (ENG 948-949). IME composition is held until it ends.

## 7. Select and Input as drawn

`Select` is a custom combobox, not a native `<select>` (ENG 1200-1234; CSS in the engine chunk @166300-168800).

- Button: control height, padding `0 pad-sm 0 pad-md`, radius, `fill-field`, 1 px inset field ring (`border-strong` on hover or open), a 14 px caret in the secondary ink.
- List: a `popover` with `surface-3`, radius + 4 px, ring and popover shadow; `min-width` the larger of the button and 128 px, `max-width:min(320px, 100vw - 16px)`, `max-height:20rem`, padding `pad-xs`. Opens 4 px below, left-aligned; above when below does not fit.
- Option: full control height (padding derived from it), `pad-md` sides, radius, one line with ellipsis; the active or hovered option takes `fill-ghost-hover`; a 12 px check mark at the end, its slot reserved on every row.
- Keys: arrows, Home, End, PageUp and PageDown (10 rows) move; Enter or Space choose; Esc closes; typing jumps by prefix within 600 ms. A Select with no options does not open.
- `Input`: `autocomplete=off`, `spellcheck=false`, `aria-label` from `label` else `key`, `maxLength` 16,384. Single line: control height, `pad-md` sides, the field fill and ring. Multi-line: `pad-sm` × `pad-md`, grows, scrolls. Placeholder in muted ink; hover ring `border-strong`; disabled at the disabled opacity.

These are the native field tokens (`native-forms.md`): a mod field and list match native ones without any prop.

## 8. The two mount loaders are not rollout flags

- `engine_surface_mounts` (chunk a Desktop bundle file @15450) and `engine_surface_cowork_mounts` (a Desktop bundle file @310698) are lazy-load registrations: `{id, tier:"T3", fetchBeforeImport, load}`.
- The only gate is `init.when` (a Desktop bundle file @16322); neither defines one, so both are **on by default**. `tier` is a preload label shared with unrelated loaders.

## Not settled

Where the overlay sits relative to the caret; which mounts lift hover cards; Cowork's draft paint (INF: marks for bold, italic, underline only).

## Spot checks by the coordinator (2026-11-14)

48 statements from the four third-pass reports were searched as literal strings: 38 in the bundle, 10 in the types file. 45 matched as written; 3 matched after loosening the pattern (the strip list is assembled from three `String.raw` pieces; the post limit is a template with `${of}`; "never zeroed" wraps across two lines). None missed. A match proves the string is there, not that the helper read its meaning right: the offsets below are where to start re-reading.

| Statement | Found |
|---|---|
| Spinner size table | a Desktop bundle file @65947 |
| The class-name merger | a Desktop bundle file @12329 |
| `="min-h-6"`, `="leading-4"` | a Desktop bundle file @42646, @42659 |
| Rail head `group/railtop relative flex min-h-6.5` | a Desktop bundle file @166488 |
| Counter pill classes | a Desktop bundle file @181912 |
| Field recipe `bg-fill-field shadow-field-ring …` | a Desktop bundle file @238158 |
| Date segment classes; today `font-semibold text-accent` | a Desktop bundle file @192073, @100673 |
| `data-prompt-suggestion-ghost`, its ink class | a Desktop bundle file @237270, @337307 |
| `uiRenderPaceMs`; panes `.max(64)`; hotkey `^[0-9a-z]$` | engine chunk @38852, @4712, @147961 |
| Hover card `max-width:min(360px`; the strip list | engine chunk @161845; line 192 |
| "Nothing to show yet"; the reveal animation | engine chunk @190902; main CSS @273845 |
| Client limits: 32 timers; post limit text | engine chunk @130976; line 192 |
| `aria-keyshortcuts`; `::highlight(`; draft-paint refusal text | engine chunk @150667, @226042, @233078 |
| Select list `max-height:20rem` | engine chunk @169475 |
| Loader ids | a Desktop bundle file @15450, a Desktop bundle file @310698 |
| `virtualText` | 0 files |
| 120 px tile; "Too large to send" | a Desktop bundle file @8880; a Desktop bundle file @150358 |
| PR header texts | a Desktop bundle file @8305, @9063 |
| Key cap height; color-layer Badge padding | a Desktop bundle file @60973, @50712 |
| "unmodified line"; queued status text | a Desktop bundle file @46870; a Desktop bundle file @348478 |
| Slash popup body; "Unread response"; "Not checked yet" | a Desktop bundle file @13428; a Desktop bundle file @252782; a Desktop bundle file @350466 |
| `--cds-text-git-merged` | main CSS @484785 |
| Types: D:6476, 17481, 3655, 13052-13053, 24173, 18468, 5475, 17240, 3012, 1185 | each phrase found at or beside the line |
