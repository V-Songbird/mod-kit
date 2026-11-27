# What the mods pages say that the bundled skill does not

Source: Anthropic's nine mods pages under https://code.claude.com/docs/en/plugins/mods/ (overview, create, interface, api, events, reference, test, troubleshoot, gallery), read on 2026-11-24 against the bundled `plugin-authoring` skill of Claude Code 2.1.330. Everything here is **DOC**: a page says it and nobody measured it. Each entry names its page and heading. Open that page for the full text before you rely on an entry: this file points, it does not copy. Where a page and a measurement disagree, the last section keeps both.

## overview

- **overview › Decide whether to trust a mod**: a mod runs with the person's own permissions and no sandbox. Read what it does before you install it.
- **overview › What a mod can reach**: files, processes, the network, settings and the session. A mod can approve a tool call that the person's deny or ask rules would stop, unless the built-in guard is loaded. Permission prompts cannot be restyled. A managed `allowManagedModsOnly` limits mods to the organization's own.
- **overview › Turn mods on or off**: mods need Claude Code 2.1.287 in the terminal and 2.1.286 in Desktop. `disableAllHooks`, `--safe-mode` and `--bare` turn them off.
- **overview › See which mods a session loaded**: `/plugin` shows a "mods active" line. Built-in mods are left out of it.
- **overview › Where mods run**: Desktop's WSL and SSH sessions run no hooks. `claude -p` and the Agent SDK run hooks and draw nothing. The VS Code extension needs 2.1.299, or 2.1.304 without feature flags.
- **overview › Compare mods, settings hooks, skills, and MCP servers**: only a mod draws in the interface. When nothing is drawn, a settings hook, a skill or an MCP server may fit better.
- **overview › Mods built into Claude Code**: built-ins are named `cc-plugin-*`. The flags and settings that turn mods off do not stop them.
- **overview › Read the source of built-in mods**: Anthropic publishes reference mods (diff, agents-md, sec-default, telemetry). Read them as worked examples.

## create

- **create › Sessions where a mod Claude writes can't load**: `dontAsk` mode, `claude -p` in default or acceptEdits mode, an untrusted workspace, safe mode, `--bare`, `disableAllHooks` or a managed block.
- **create › Check what Claude Code reads from your mod**: the loader reads the module statically. Event names are literal, `on` is never shadowed, `$` goes only to top-level functions and is never aliased, imports are relative or the bare `claude-code` modules, and a dynamic `import()` fails. `claude plugin validate` prints what it read. An audit checks these first.
- **create › Share your mod**: names starting `claude-` are reserved. Write the Claude Code version you tested in the README. Bump the version on every change, since installs are cached.

## gallery

- **gallery › Try a sample**: a throwaway `/gallery` mod opens a pane that previews one element snippet. Use it to see an element before you compose a recipe.

## interface

- **interface › Draw in the VS Code extension**: extension 2.1.299, or 2.1.304 without feature flags. A dock needs about 800 px, a pane shows 12 rows, Buttons have no hotkeys, `$.prompt.suggest` answers `isShown: false`, and long text is cut at 200 or 500 characters. None of it is measured here.
- **interface › Fix missing mod colors in the Desktop app**: with a third-party provider on Desktop 5.11492.5 or earlier, the Code tab keeps its own colors. Otherwise check the version, that the mod loaded, the `makeColors` problems, and a second `$.theme` call that replaced yours.
- **interface › Remove mod colors from the Desktop app**: turn the mod off first (move its folder out, or disable its plugin in Manage plugins) and start a new session. Colors that stay come off in Settings: search "code appearance", then Remove colors.

## api

- **api › Calls and background work after the user interrupts a turn**: from 2.1.304, after Esc or Stop, calls that start new work (`$.prompt.submit`, `$.command.run`, spawning) are refused until the person types again. The page tables what each call returns and which queued work is dropped. Retry from `turn.complete`.
- **api › Calls refused in `claude -p` runs and Agent SDK sessions**: refused once `--max-turns` or `--max-budget-usd` is spent, the host input has ended or the run was stopped, each with its own reason.
- **api › A `claude -p` run with your mod never exits**: a mod that submits a prompt on every turn loops forever unless the run sets `--max-turns` or `--max-budget-usd`. The refusal starts at 2.1.299.

## reference

- **reference › Render sites**: the page lists `BesidePrompt`, `Underlay`, `BesidePromptList` and `UnderlayList` (2.1.331), which the 2.1.330 types lack. `ContextMenu` is in the 2.1.330 types and not on the page. Check `RenderComponent` in your build's types.
- **reference › Limits**: limits the bundled skill does not list: nesting 28,000, values 100 deep and 1,000,000 in all, 2,000 scopes per file, 500 placed rows, a Raster of 262,144 cells, and the `$.process.run` and `$.http.fetch` caps. Its tree limits differ from Desktop's measured ones: see the last section.

## test

- **test › Look up what a stub returns**: a table of what each call and event stub returns, so a test stubs the right shape. The types hold the result types and no such table.

## troubleshoot

Each entry is a symptom and its cause.

- **troubleshoot › Check whether mods can load**: `claude plugin test` outside a mod folder prints one of four states: no module, hooks turned off, rollout off, saved off.
- **troubleshoot › The `mods active` line doesn't name the mod**: look for `hooks module <name> not loaded: <reason>` in the debug log.
- **troubleshoot › Refusal messages**: six refusal prefixes: rollout off, a managed `disableAllHooks`, `allowManagedHooksOnly`, `--bare`, and a name clash.
- **troubleshoot › Messages from the built-in guard**: `allowManagedModsOnly`, a hook that tried to lift or reword a rule, `env.set`, a tool name clash. The page says where each one shows.
- **troubleshoot › `validate` passes and lists no `hooks` line**: `hooks/hooks.json` has no `modules` key, or misspells it.
- **troubleshoot › `options do not fit plugin.json userConfig`**: the options fail the mod's `userConfig` schema. Fix them in `pluginConfigs`.
- **troubleshoot › `code nested too deep to scan: more than 2000 scopes`**: one file nests more than 2,000 scopes. `validate` reports it.
- **troubleshoot › `the engine ran out of stack linking the file and its imports`**: nesting or an import chain is too deep.
- **troubleshoot › `the parser stopped` or `the engine ran out of stack loading the file`**: a syntax error, or a file nested too deep. No line number is given.
- **troubleshoot › No mod loads in a directory you opened for the first time**: the trust prompt is still unanswered.
- **troubleshoot › No installed plugin loads at all**: the session runs with `--safe-mode`.
- **troubleshoot › Claude Code stops asking to enable hot reloading**: after three unanswered questions it stays off. Use `--plugin-dir`.
- **troubleshoot › `no command.run hook answered it`**: a registered command reached the end of the chain. `$.ui.open` with `focus: false` is one way there.
- **troubleshoot › `it crashed the hooks worker`**: installed mods share one worker, and a blocking loop gets the mod unloaded.
- **troubleshoot › `its session.start ran again in a fresh copy`**: the repeated `$.prompt.submit`, `$.command.run` or `$.agent.spawn` resolves to the first result.
- **troubleshoot › `This mod's change didn't load` or `the earlier version is no longer running`**: transcript lines Claude cannot see. Paste them in.
- **troubleshoot › `reload failed`**: one form keeps the previous version and one does not. Check the `mods active` line.
- **troubleshoot › `$.agent.register refused: the hooks module that made the call is no longer loaded`**: a stale copy made the call. Register agents in `session.start`.
- **troubleshoot › `mods that run in the hooks worker are off for this session`**: three crashes with no culprit unload every mod that is not built in. `/reload-plugins` brings them back.
- **troubleshoot › `a hook changed this call's input after the model wrote it`**: auto mode denies a call whose input a `tool.call`, `turn.step` or `PreToolUse` hook rewrote after review.
- **troubleshoot › `stopped · type a message to continue`**: a mod tried to start work after Esc and was refused. Nothing to fix.
- **troubleshoot › Another mod's band shows and yours doesn't**: each mod has its own band row. `past the limits of the band` means yours is too big. Before 2.1.323 mods shared one drawing.
- **troubleshoot › `needs a key`, `is drawn twice`, or `key each once`**: four key errors. Give each control a unique `key` and draw it once.
- **troubleshoot › A key your `settings.read` hook returns doesn't take effect**: permission rules and `env` returned on Claude Code's own read are not applied.
- **troubleshoot › `the answer for <key> is no value the key can hold`**: an answer that fails the key's schema is refused, for that key alone.
- **troubleshoot › `settings.read: refused to the engine`**: a mod refused the engine's own read. Find which one with `--debug-file`.

## Where the pages and the measurements disagree

The measurement stays; the page's claim is written beside it. A page usually describes the terminal or the newest build, and a measurement one build of one surface, so check `e.surface` and your version before you choose.

| Topic | The page says (DOC) | Measured (label, build) |
|---|---|---|
| Tree size | 20,000 elements and text children; the first 100,000 characters drawn; 32 levels below the root (reference, Limits) | Desktop refuses the whole tree past 2,000 nodes, depth 32 or 262,144 characters, and the site clears (CODE, 5.11492 and 6.28899, which adds a third count refused past 66; `engine-behaviour.md`). The page's numbers match the terminal (`terminal.md`; CODE 2.1.330) |
| Refused tree | `ui.render (<site>) refused:` in the debug log (troubleshoot) | Desktop refuses with no host log text and no message to the person (CODE, 5.11492; `engine-behaviour.md`) |
| Toast time | 4 seconds unless `timeoutMs` (reference, Limits) | The Code tab shows it for at least 6 s and cuts text past 240 characters (CODE, 5.11492 and 6.28899; `engine-behaviour.md`) |
| Redraw rate | `$.ui.invalidate` throttled to 10 a second (reference, Limits) | A Desktop band or pane redraws as fast as it invalidates; a transcript row at most once a second, a `Theme` ask at most every 500 ms (CODE, 6.28899; `engine-behaviour.md`) |
| Unknown `borderStyle` | draws with no border (reference, Box border styles) | On Desktop any `borderStyle` draws a 1 px border and padding (CODE, 5.11492; `desktop-elements.md`) |
| `Link` scheme | an `https:` URL or `http://localhost` (interface) | No longer a conflict on Desktop: 6.28899 draws a link only for `https:`, or `http:` on `localhost`, `127.0.0.1` or `[::1]` (CODE; `engine-behaviour.md`). 5.11492 took any http or https |
| Band rows | one row per mod since 2.1.323 (interface, troubleshoot) | one row per plugin since 2.1.325 (CODE; `traps.md`). Not a conflict: 2.1.325 was the build measured |
| Keys in a site | Up and Down move between controls; Esc returns focus to the prompt (interface) | Desktop: no arrow navigation, Tab walks; Esc only blurs a field (CODE, 5.11492; `engine-behaviour.md`). The page's table is the terminal's |
| Toasts on screen | at most three at a time in fullscreen (troubleshoot) | the bundled skill says 50 are held; nobody measured how many draw |
| Module variables | examples keep state in module variables (overview, create, gallery) | a hot reload loses them; keep drawn state in `$.state` (rule 18, and the bundled `reference.md`) |
| Session start | Claude Code waits for the `session.start` hook before the first prompt (api) | the engine starts with the first prompt, so mods do not draw from session start (OBS 2026-11-09; `traps.md` row 31). Probably compatible: the page speaks of hooks, the measurement of drawing |
| Dock width | a dock takes at most 45% of the terminal (interface) | `min(45%, 90, columns − 70)`, never under 24 (`terminal.md`, Pane dock row) |
| Theme still ground | not on the pages | the `{ image }` ground of 2.1.325 is gone from the 2.1.330 types and `look.md`: use a color, gradient, vector or scene |
