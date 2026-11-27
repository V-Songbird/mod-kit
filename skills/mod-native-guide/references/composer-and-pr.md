# Composer chips, queued messages, slash popup, PR chips, key caps (Desktop 5.11492.5.0)

CODE: read by a helper on 2026-11-14 (third pass) in the renderer bundle; spot-checked by the coordinator (list at the end of `engine-behaviour.md`). Offsets are character offsets in the named chunk. Px are the comfortable density with the second color layer; a "control" is 28 px with a mouse, 32 px on touch (the helper used 32). None of this was seen in the running 5.11492 app; where an owner screenshot of build 4.16336 shows the same piece, `native-screens.md` has the measurement.

A mod draws none of these. They are the neighbours of a band, a footer chip and a transcript row, and the model for a mod's own chips, counts and status words.

## 1. Attachment chips (`MessageAttachments`, a Desktop bundle file @39879)

Kinds: Image, Video, File, Quote. The composer picks by media (a Desktop bundle file @150700): image, quote, else File; a pasted text gets the badge "PASTED" and the label "Pasted text". Only two states exist: pending and failed.

- Tile (image, video, file): a **120 × 120** square, `rounded-card`, a 1 px hairline ring in `border-strong`, `shadow-field-drop`.
- Pending: a shimmer over the tile, `aria-busy`, content at 50% opacity, badge hidden.
- Failed: content at 50%; a strip at the bottom, `text-caption text-danger` on `surface-1`, padding 8 × 6, with a retry link in the same ink. Failure copy is a short noun phrase: "Too large to send", "Upload failed", "Can't read file", "Not allowed by your admin" and ten more.
- Remove: a 20 px circle on `surface-3` with a ring and an `X` (xs), 8 px outside the top-end corner, hidden until the tile is hovered or focused (always shown on touch), in a tooltip "Remove {item}". Delete or Backspace on a focused tile removes it.
- File tile: name `text-footnote text-primary`, clamped to 4, 3 or 2 lines, split so the last 12 characters (the extension) stay; description `text-caption text-secondary` ("N lines" or a size); a neutral Badge with the uppercased extension.
- Quote row in the composer: radius 10, `fill-ghost-hover`, padding 6 px (8 at the start), gap 8, a `Reply` icon in muted ink, the passage in `text-body text-secondary` on one line between typographic quotes with a tooltip for the full text, an always-visible ghost `X` (xs).
- Motion: chips move and fade over .18 s; the row fades over .2 s.

## 2. Queued messages (`data-cds="ChatComposerQueuedMessages"`, a Desktop bundle file, a Desktop bundle file @3628)

- There is **no visible "queued" label**. A queued message is the user bubble in the muted ink (`text-stays-secondary`, falling back to muted). A pending one pulses in the secondary ink.
- Screen readers get a live status: "1 message queued. Will send after the current response." / "{count} messages queued. …". The list is named "Queued messages".
- Actions sit outside the bubble, bottom-aligned, 6 px away: ghost icon-only Buttons "Send now", "Edit in composer", "Remove from queue". Three buttons reserve 104 px.

The lesson for a mod: native shows "waiting" by muting the thing itself and by a live status for assistive tech, not by a label or a badge.

## 3. Slash-command popup (a Desktop bundle file, items built in a Desktop bundle file @56500)

- Shell: a fixed 260 px width and a 480 px height cap when it opens with a slash configuration, a 384 px cap otherwise (the helper's reading of the shell call; the coordinator found the literals `fixedWidth:260` in a Desktop bundle file and `maxHeightCap:384` in a Desktop bundle file, not the branch that picks them: INF for which popup gets which). The shell's own classes were not read. Virtualized from 30 rows. Estimated heights: row 32, section header 25, separator 9.
- Section header: `py-1 text-footnote font-medium text-muted`, 10 px side padding.
- Separator: 1 px in `border`, 10 px side inset, 4 px above and below.
- Row (a Desktop bundle file @254792): control height, 10 px side padding, 8 px gap, radius 8, `text-body font-normal`. Highlighted: `fill-ghost-selected` on the color layer (10% ink light, 15% dark); pressed the same. Keyboard focus: the focus shadow.
- Row content in order: a 20 px icon at 50% opacity; the label, truncated, with the matched part in `font-semibold`; an alias in muted-secondary; at the far end a `text-caption` muted-secondary subtitle; a neutral xs Badge.
- Plain rows add a suffix (`text-caption`, muted-secondary), an accent `Check` when checked, an sm Switch for toggles, a `CaretRight` for submenus.
- The description is **not in the row**: it is a separate hover card anchored to the active row (description, plugin, repository).
- Keys: arrows move, Tab and Enter pick, Esc closes. No key-hint text is drawn inside the popup.
- A composer @-mention popup was not found in this build (the only `MentionDropdown` is the document-comments one).

For a mod's own list: a 28 px row, 8 px gap, label then muted value at the far end, the match or the selected thing in a heavier weight, the long explanation in a hover card, never in the row.

## 4. PR status

### Header chip (a Desktop bundle file @7400): a text-only Badge, size `lg`

| Status | Variant | Text |
|---|---|---|
| merged | pro | Merged |
| closed, draft | neutral | Closed, Draft |
| queued, ready, approved | success | In merge queue, Ready to merge, Approved |
| conflicts, checks_failing | danger | Merge conflicts, Checks failing |
| changes_requested | warning | Changes requested |
| checks_running, checks_passing | neutral | Checks running, Checks passing |
| waiting_for_review, open | accent | Waiting for review, Open |

Badge (a Desktop bundle file @49117): 22 px high, 12 px text, weight 500. On the color layer Desktop ships it is a **transparent pill with a 1 px line and colored text**, not a tinted fill (`stacks:` overrides: `bg-transparent`, text per variant; neutral's line is the badge-line token). Text inks, light / dark: accent `#1757ac` / `#6aabf1`, success `#006c10` / `#53c556`, warning `#895902` / `#e49c06`, danger `#a42528` / `#f17778` (`#fa8080` in 6.28899), neutral 60% ink.

### Session-panel chip (a Desktop bundle file @70763, state map in a Desktop bundle file @208500)

Not a Badge: a 12 px icon and a label in the state color on that color at 18% (`color-mix`); `draft` uses `bg-alpha-1`.

| State | Icon | Ink light / dark |
|---|---|---|
| open, approved | GitPullRequest, CheckCircle | `#1e9e3c` / `#32d74b` |
| changesRequested, closed | XCircle, GitPullRequestClosed | `#ff3a30` / `#ff6159` |
| conflicting | GitMergeConflict | `#c5621b` / `#fa832e` |
| draft | GitPullRequestDraft | `#737373` / `#a6a6a6` |
| queued | GitMergeQueue | `#98801f` / `#ffd014` |
| merged | GitMergedSimple | `#8e6bd9` / `#b796ff` |

Those are the `--cds-text-git-*` tokens (main CSS @1692407). A mod has no key for them: its state words use `success`, `warning`, `error` and plain ink (`recipes.md`, recipe 22).

### PR row in the Changes section (a Desktop bundle file @72300)

- Line 1, `text-footnote` muted-secondary: state chip, repository and `#N` (tabular), " · " author, " · " a narrow relative date.
- Line 2: the title, `text-body-medium text-primary`, two lines at most; at the far end two pills (`rounded-chip bg-alpha-1`, 8 × 2 px padding): "{n} files" and the `+N −N` diffstat.
- Per-file rows were not found in this section.

## 5. Goal section body (a Desktop bundle file @338900)

- Summary in the head: "Achieved in # turns", "Not checked yet", "# turns", "# turns · last check: {reason}".
- Body: the condition in `text-body text-primary`, two lines at most; under it a status line in `text-footnote` muted-secondary, two lines at most; when met, a `Check` (xs) in `text-success` before it.
- Actions ("Edit goal", "Clear goal"): ghost xs icon Buttons, hidden until the card is hovered or focused, always shown on touch.

## 6. Collapsed lines in a diff

Text "{count} unmodified lines" ("1 unmodified line"), from the diff library and localized by the app (a Desktop bundle file @563). One line with ellipsis, in the line-number ink, 1ch side padding, not selectable; the count underlines on hover where the gap can be expanded.

## 7. Key caps (`Shortcut`, a Desktop bundle file @60884; `Kbd`, a Desktop bundle file @380)

- A string marks keys as `[[ctrl+k]]` and inline code with backticks; the changelog renderer splits on them (a Desktop bundle file @339846).
- Cap: `h-[calc(1em+6px)]`, radius 4, 1 px line, transparent fill, `text-caption`: **18 px high** at 12 px text, square for one character, 3 px side padding for more. Ink `#6d6b67` light, `#a5a49a` dark (muted inside a menu row); line the ink at 18%.
- Keys of one chord sit 2 px apart; a text variant joins them with `+` and no box.
- Each key carries a spoken name for screen readers.

A mod's hint for a key is plain `caption` text in `subtle` ink ("Ctrl+K"). It cannot draw a cap; a bordered Box around a letter is the glyph-imitation the project rejects.

## 8. Sidebar session mark (a Desktop bundle file @251900)

- A 14 px slot holds a 6 px dot: running in muted ink (animated), awaiting in `fill-warning`, **unread ("Unread response") in `fill-accent`**. Idle is a 6 px ring at 50%.
- A Code session shows its icon with the dot at the top-end corner; an error is a 10 px `Warning` there; awaiting is a `Hand` or `Help` icon in `text-warning`.
- Hover and inline action layout was not found beyond "hidden until hover".

## Not found in this pass

The user-bubble base radius and padding; the slash popup shell's classes; the diffstat component; per-file Changes rows; sidebar hover actions; the platform key-name map; the `--cds-keycap-radius` token (the code falls back to 4 px). The bundle has no `assets/i18n` folder: strings are the code's default messages, and the Spanish catalog was not re-read.
