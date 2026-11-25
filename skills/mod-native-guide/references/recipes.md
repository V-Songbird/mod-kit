# Recipes

Each recipe says where it was seen. "OBS" means the owner saw it on screen and accepted it; the source line is the shipped code at the time (2026-11-14). Line numbers drift: search by the `key`. Take the recipe whole; the small props (`minWidth={0}`, `padding={0}`, `flexShrink={0}`) are the parts that were learned the hard way.

Shared names used below:

```tsx
const isTerminal = e.surface === 'terminal'
const ui = $.ui.resolve(e)            // 'Svg' in ui guards an older engine only; it is true on the terminal too (traps row 46)
const { Box, Text, Button } = ui
```

Constants the recipes use (the values `usage-ribbon` ships):

```tsx
const TEXT = 'text'                 // plain ink
const EMPTY = 'promptBorder'        // meter track, card and tip borders
const BLUE = 'rate_limit_fill'      // meter fill: a fill, not an ink
const RED = 'error'                 // danger ink for a figure
const ORANGE_FILL = '#fab219'       // warning fill: owner-approved hex, listed in scripts/mod-colors.allow.json
const RED_FILL = '#d03b3b'          // danger fill: owner-approved hex, same list
const CELLS = 10                    // meter width in columns (about 75 px on Desktop)
const THIN = 0.3                    // meter height in lines (6 px on Desktop); native thin meters are 4 px, the owner kept 6 px on 2026-11-14
const SEG_CELLS = 10, SEG_GAP = 0.15
const cells = CELLS                 // the shipped band narrows it on a tight terminal
const fillWidth = (pct: number) => `${Math.max(8, Math.round(Math.min(100, pct)))}%`   // never thinner than 8%
```

A new hex needs the owner's approval per value and an entry in that allow list; a theme key needs neither.

### Which Button form

| The control | Form | Why |
|---|---|---|
| The one main action of a card, pane foot or notice | `variant="primary"` | ink-filled; one per group |
| Any other action that does something (Refresh, Retry, Open, Apply) | `variant="secondary"` | quiet filled control, 28 px |
| A row of a list, a section head, a toggle, an explain-on-press value | `plain` (with `dimColor` when off or quiet) and `hover={{ underline: true }}` on rows | reads as text, no box |
| Close of a mod-drawn card, Clear of a filter | `plain dimColor` | secondary to the content, like a native ghost control |
| Many prompt-filling actions wrapping in a pane (git-pane's Commit, Pull, Push…) | `plain dimColor` in a wrapping row: the shipped and owner-seen form | eight filled Buttons in a 66-column pane read as a toolbar, not as Claude |
| Close of a pane | none: the host draws it | |

The last-but-one row is the one exception to "an action has a `variant`": the owner saw and accepted that row of text actions (OBS). Use it only for a long, wrapping set; two or three actions take variants.

### Defaults when nothing else decides

An independent reader built a band and a pane from this skill alone and listed the choices it could not settle. These are the answers; each says what it rests on.

| Choice | Default | Rests on |
|---|---|---|
| Meter height | `0.3` (6 px), as shipped. `0.2` (4 px) matches native thin meters but is unseen on a mod; ask the owner before switching | OBS shipped; OBS native 4 px on 4.16336 |
| Meter fills | `rate_limit_fill`; for warning and danger the two allow-listed hex of the constants block. A new mod has no other fill: use the blue fill and put the state in a word in `warning` or `error` ink | project allow list |
| Meter says used or left | What the native twin says. Usage is "{n}% used" natively; `usage-ribbon` fills what is left by the owner's choice and says so in its text. Never mix the two in one mod | OBS |
| Value ink | on the band `dimColor` for label and value; in a pane the label plain, the value `footnote subtle tabular` | rule 10, recipe 8 |
| Hover card in a dock pane | drawn in place: give it `borderStyle="round"`, `borderColor="promptBorder"`, `backgroundColor="composerSidebarBackground"`, `paddingX={1}` and a `key` on every row; on the band and rail the host supplies all of that. The background key is untyped: it needs an owner-approved allow entry per mod (recipe 5) | CODE (lifting); OBS 5.11492 that a card without a background is see-through; HARNESS and OBS 5.11492 (dark) for the fix |
| Hover card text | one sentence, plain ink, no heading, no second block | recipe 4 |
| Section head | recipe 6 as shipped (`plain dimColor` Button with the caret in its label, count in `footnote subtle tabular`). The closer native form (title `footnote`, `medium`, plain ink) has not been seen on a mod: propose it to the owner with a screenshot, do not ship it unasked. Side by side on 5.11492 the two differ: native title primary ink at 13 px, recipe 6 secondary ink at 14 px. Asked on 2026-11-14, the owner kept recipe 6 as the standard | OBS for recipe 6; OBS 5.11492 for the difference |
| Row height | whatever a `plain` Button row draws (20 px in a pane, 28 px on the band). Native rows are 24 to 32 px; do not pad rows with numeric margins to imitate them | HARNESS; OBS native |
| List cap | 5 rows, then a `plain dimColor` "Show more" / "Show less" Button on its own row with `hover={{ underline: true }}` | native caps 5, 4, 4 |
| Empty state | one line in the list's place, left-aligned under the head, `subtle`, a noun phrase without a period | recipe 18 |
| Error state | whole body failed: the message in plain ink, a full sentence with the remedy, then a `secondary` "Refresh". One failed line in a working view: `color="error"` | recipe 18 |
| Which Button is `primary` | only an action that commits or sends something. Two neutral actions (Refresh, Open details) are both `secondary`. `primary` is unseen in the app: ask for a screenshot the first time | traps row 10 |
| Narrow band | one `flexWrap="wrap"` row with `rowGap="xs"`; the meter keeps its width and the Buttons wrap under it | recipe 16 |
| Terminal twin | every recipe that differs carries its own `isTerminal` branch; where it has none the same tree is right for both | each recipe |

## 1. Thin meter (band)

OBS, Desktop both themes and Windows Terminal. `usage-ribbon/hooks/register.tsx`, `meter`.

```tsx
const THIN = 0.3
const pill = (key: string) => ({ borderStyle: 'round' as const, borderColor: key, padding: 0 as const, overflow: 'hidden' as const })

const meter = (left: number, col: string) =>
  isTerminal ? (
    <Box width={cells} height={1} backgroundColor={EMPTY} marginX={1}>
      {left > 0 && <Box width={fillWidth(left)} backgroundColor={col} />}
    </Box>
  ) : (
    <Box width={cells} height={THIN} marginX={1} alignSelf="center" position="relative">
      <Box position="absolute" top={0} left={0} right={0} bottom={0} {...pill(EMPTY)}>
        <Box width="100%" height="100%" backgroundColor={EMPTY} />
      </Box>
      {left > 0 && <Box position="absolute" top={0} left={0} bottom={0} width={fillWidth(left)} backgroundColor={col} {...pill(col)} />}
    </Box>
  )
```

- Why each part: `round` gives the pill ends; `padding: 0` cancels the padding a bordered Box brings; the track is a **child** of the ringed Box, so ring and track are each painted once in one key and no rim shows. A translucent key used as border and background of the same Box doubles under the border (recipe 2 shows the rim that makes).
- On screen in 5.11492, dark (OBS): 6 px high, 76 px wide for 10 cells, fill `#257de0`, track `#515151` (20% white over the band), no rim, centered in the 40 px band.
- Height: `0.3` is 6 px on Desktop and is the form the owner saw and accepted. The native meters are 4 px (session panel Context meter, usage bar); `height={0.2}` would be 4 px (INF, not seen). Changing it is an owner decision: keep `0.3` until asked.
- The meter draws at 0 and at 100%: the track is always there.
- `left` is the percent that fills the bar. For a usage meter that is what is left; for a task (a build, a sync) pass the percent done and keep the fill `BLUE`: the tiers below are for a level running out, not for progress.
- The bar is 6 px tall, too thin to hover. When it carries a tooltip, wrap it in a keyed Box `height={1}` (one line) with `alignItems="center"`, as the segment hit boxes of recipe 3 do.
- Colors by percent left, figures muted until danger:

```tsx
const barFor = (left: number) => (left <= 10 ? RED_FILL : left <= 25 ? ORANGE_FILL : BLUE)   // native: warning from 75% used, danger from 90%
const textFor = (left: number) => (left <= 10 ? RED : undefined)
const tone = (col?: string) => (col ? { color: col } : { dimColor: true })
// <Text {...tone(textFor(left))} tabular>{left}%</Text>
```

- Not inside a `Client`: absolute layers fill the region there. Use the flow form:

```tsx
<Box width={CELLS} height={tall} alignSelf="center" flexDirection="row" overflow="hidden" backgroundColor={TRACK}>
  <Box width={fill} height={tall} backgroundColor={col} />
</Box>
```

- Never `Progress` (on Desktop it becomes a square bar in text ink with an invisible track), never block glyphs (`▰`): the owner called those "de Terminal".

## 2. Segmented summary bar (square seams, round ends)

OBS on Desktop 4.16336 (owner shots of the former Roadmap pane mod, since moved to Foreman); on 5.11492 this bar, with its ring in the pane's color, is CODE and HARNESS only, since that mod was disabled there and is no longer in this repository (see the paragraph under the code). Source: that mod's `key="bar"`. Foreman's Roadmap pane (4.5.0 to 4.7.1, `hooks/register.tsx`) has the same `key="bar"` with the same `height: 0.32`, `columnGap: 0.15`, round clip and `padding: 0`, but its ring is `promptBorder`, not the key below. Matches the native StackedMeter: round outer ends, square joints, thin seams.

`parts` is the list of pieces, one per section that has entries: `{ n: count, color }`, where `color` is the same key or approved hex the section's swatch and row dots use (recipe 14). The `0.4` top margin is on the Desktop branch only and is the shipped value the owner saw; the terminal branch uses a step, as rule 2 asks.

```tsx
<Box
  key="bar"
  flexDirection="row"
  marginTop={isTerminal ? 'xs' : 0.4}
  {...(isTerminal ? { height: 1 } : {
    height: 0.32, flexShrink: 0, columnGap: 0.15, overflow: 'hidden' as const,
    borderStyle: 'round' as const, borderColor: 'composerSidebarBackground',
    backgroundColor: 'promptBorder', padding: 0 as const,
  })}
>
  {parts.map(p => <Box key={`bar-${p.color}`} width={0} flexGrow={p.n} backgroundColor={p.color} />)}
</Box>
```

`width={0} flexGrow={n}` makes pieces share the bar by count, so seams never widen it. The outer Box clips, so only the ends are round. Round joints between segments were rejected by the owner.

What the ring's key is for, seen on screen (OBS 5.11492, dark, capture 06): the Roadmap pane of the Foreman plugin (4.5.0, unchanged through 4.7.1) is a fork of this bar whose ring and track share one key, `promptBorder` (`hooks/register.tsx`). It is 6 px high with 4 px of fill and a 2 px seam `#474747` (one 20% layer), and it has a **visible rim** of `#6c6c6c` above, below and at both ends: 36% white, two 20% layers. The former Roadmap pane mod's first Desktop version (2026-11-03) had the same shared key. This recipe gives the ring `composerSidebarBackground` instead, which in a dock pane is the pane's own `#191919` (`desktop-tokens.md`; seen as a background in capture 08). The recipe's own bar has not been captured in 5.11492: the harness draws its ring in the panel color (case `bar-ring`), so "the ring does not show" is CODE and HARNESS. Untyped keys do work as a border in the app: the ribbon's fill ring is `rate_limit_fill` and draws `#257de0`. A native stacked meter is 4 px with 1 px seams and no rim. For a new bar recipe 1's construction needs no surface key at all: an unpainted round wrapper, the track on a child, the pieces on top.

## 3. Clickable segmented control (Desktop) and its terminal twin

OBS, owner accepted 2026-11-09. `usage-ribbon`, `key="effort-bars"`. A drawn pill with a clear Button layer over it; each segment has its own hover card.

```tsx
<Box key="effort-bars" width={SEG_CELLS} height={1} position="relative">
  <Box width="100%" height={THIN} flexDirection="row" columnGap={SEG_GAP} {...pill}>
    {levels.map((l, i) => <Box key={`seg-${l}`} flexGrow={1} height="100%" backgroundColor={fill(i)} />)}
  </Box>
  <Box position="absolute" top={0} left={0} right={0} bottom={0} flexDirection="row" columnGap={SEG_GAP}>
    {levels.map((l, i) => (
      <Box key={`hit-${l}`} flexGrow={1} width={0} height={1}>
        <Box position="absolute" top={0} left={0} display="none" hover={{ display: 'flex' }} borderStyle="round" borderColor={EMPTY} paddingX={1}>
          <Text color={TEXT} wrap="truncate-end">{names[i]}</Text>
        </Box>
        <Box width="100%" height={1} overflow="hidden">
          <Button key={`effort-${l}`} label={names[i]} plain onPress={choose(l)}><Text>{'  '}</Text></Button>
        </Box>
      </Box>
    ))}
  </Box>
</Box>
```

- Each Button is clipped to its segment, so the host's hover shade covers one segment only (OBS 5.11492: the shade is 20 px high and 15 px wide, and the fill under it lightens).
- On screen in 5.11492, dark (OBS): five segments of 14 px with 1 px seams in the band's color; the pill is 6 px high and its fill is the middle 4 px, because the round ring takes the top and bottom rows in the track color. The card of a segment is one word, 71 × 44 px with its ring, 8 px above the hit box.
- Terminal: `<Button key=… plain onPress={choose(l)}><Text backgroundColor={fill(i)}>{'  '}</Text></Button>` in a `gap={0}` row; no names, no hover.
- Known limits: the stair of cards while crossing segments (150 ms each); one shared card is impossible (a hover `scope` shows nothing on the band).
- Do not print the selected level's name beside it: Claude already shows it in the footer.

## 4. Tooltip on a control

OBS, Desktop band. `usage-ribbon`, `key="auto-compact-tip"`.

```tsx
<Box key="auto-compact-tip" position="relative">
  {!isTerminal && (
    <Box position="absolute" top={0} left={0} width={44} display="none" hover={{ display: 'flex' }} borderStyle="round" borderColor={EMPTY} paddingX={1}>
      <Text color={TEXT}>{s.autoTip(isOn)}</Text>
    </Box>
  )}
  <Button key="auto-compact" plain dimColor={!isOn} onPress={toggle}>…</Button>
</Box>
```

- The keyed Box is visible; the card inside it is hidden and unkeyed. A keyed hidden Box is refused.
- On the band and in the rail the host repaints the card as a native popover and drops your border, background, padding, width and offsets. They still matter in a dock pane, where the card draws as written.
- Card text in the plain ink (`TEXT`, or no color). Never `inverseText`: it vanished on the host's light card.
- The text changes with state and says what a press does ("On. Press to turn it off").
- Keep it short: one sentence, 360 px at most on the band.
- On screen in 5.11492, dark (OBS): 360 px wide with its ring, fill `#1f1f1f`, ring `#282828`, a soft shadow, plain ink, 20 px lines; left edge on the anchor's left edge, 4 px above a 28 px Button. A Spanish sentence of 175 characters took four lines, about 44 a line.
- No hover `scope`. No tooltip in the terminal.

## 5. Hover legend on a section head

Before 2026-11-14 `git-pane` shipped this legend with no `backgroundColor` and no row keys, and on screen it was broken (OBS 5.11492, dark): a 1 px ring with the commit rows, the Input and the lane lines reading through it. The form below adds the two missing parts and is what `git-pane` has now. Seen in the app the same day (OBS 5.11492, dark): an opaque card in the pane's own `#191919` with a 1 px `#474747` ring, 418 × 134 px, nothing reading through.

```tsx
const legend = !isTerminal ? (
  <Box position="absolute" top={1} left={1} display="none" hover={{ display: 'flex' }} flexDirection="column" borderStyle="round" borderColor="promptBorder" backgroundColor="composerSidebarBackground" paddingX={1}>
    {rows.map(([g, s]) => (
      <Box key={`lg-${g}`} flexDirection="row" gap={1}>
        <Text color="subtle">{g}</Text>
        <Text size="footnote">{s}</Text>
      </Box>
    ))}
  </Box>
) : undefined
```

- **Where the card goes in the tree.** It is a child of the section head's keyed row Box, after the Button and the count: `git-pane` passes it as the head's last child (`<Box key="head-history" flexDirection="row" …>{button}{count}{legend}</Box>`). That keyed Box is the visible anchor of rule 7; `top={1} left={1}` puts the card one row under it. The hidden card itself has no `key` (a keyed hidden Box is refused, recipe 4).
- `rows` is a list of `[glyph, label]` pairs. A row may lead with a colored mark instead of a `subtle` glyph when it explains a color: give the mark the same key or approved hex as the thing it explains, never a new color.
- **The key needs an approval.** `composerSidebarBackground` is an untyped theme key (so is `userMessageBackground`, the page surface): scripts/check-mod-colors.mjs (kept in the source repository, not shipped) flags it as "untyped theme key" and the check fails until scripts/mod-colors.allow.json (kept in the source repository, not shipped) has an owner-approved entry for that mod and value. the former Roadmap pane mod had one (2026-11-03; it is not in this repository's file) and `git-pane` has one for this legend (2026-11-14, the owner's yes in a question dialog). For any other mod, ask the owner before adding the prop; never write the entry without that yes. No typed key (the checker's list, from the 2.1.317 types) maps to a surface token in the engine's table; the typed `diffAddedDimmed` and `diffRemovedDimmed` are tinted backgrounds, not surfaces.
- Where it lands: in place, under the head and over the rows below it (OBS for the placement). It is not lifted, so the pane clips it: keep it short and near the top of a list.
- `composerSidebarBackground` is the panel surface. Inside a dock pane the app sets that surface to the pane's own color (CODE, `desktop-tokens.md`: `#191919` in dark, white in light), so the card is opaque, the same color as the pane, with only its ring to separate it (OBS 5.11492, dark and light: `#191919` with a `#474747` ring, white with a ring near `#cecece`). As a border (recipe 2's ring) the key has not been captured on 5.11492; the rim once blamed on it belonged to another mod (recipe 2). The harness has no pane ground and drew it `#1f1f1f`. The key is valid on both sides: the CLI's own sidebar uses it as a `backgroundColor` (CODE, engine 2.1.325).
- With that background the card covers plain rows, `position: relative` rows and Button rows at every point sampled (HARNESS, both themes, case `hover-card-pane-solid`).
- A bordered Box brings 12 px of vertical padding with it; the card is 106 px high for four lines.
- In a rail pane and on the band none of this applies: the host lifts the card and paints it.

## 6. Section head

OBS, Desktop and terminal. `git-pane`, `head`.

```tsx
<Box key={`head-${id}`} flexDirection="row" justifyContent="space-between" alignItems="center" marginTop="md">
  <Button key={`sec-${id}`} plain dimColor onPress={toggleSection}>{`${title} ${isShown ? '▾' : '▸'}`}</Button>
  <Text size="footnote" color="subtle" tabular>{String(n)}</Text>
</Box>
```

- The caret is inside the Button's text, so it is part of the click target and sits on the text line (owner request).
- Rows under the head take `paddingLeft` so they line up with the head's text (a plain Button's text starts 6 px in). The owner flagged content that looked outside its section.
- Sections are open by default (`view[id] !== false`).
- Native twin: session-panel section head (title footnote medium, count muted at the right).

## 7. List row: mark, one-line title, hover underline

OBS. Foreman's Roadmap pane (4.5.0 to 4.7.1, `hooks/register.tsx`, `key="row-…"`), the same row as the former Roadmap pane mod's; Foreman's adds `paddingLeft={1}`, so its terminal cut is `− 4`, not `− 3`.

```tsx
<Box key={`row-${x.id}`} flexDirection="row" gap={1}>
  <Text color={fillOf(x)}>●</Text>
  <Box flexGrow={1} minWidth={0}>
    <Button key={x.id} plain dimColor={isSent} hover={{ underline: true }} onPress={() => pick(x.id)}>
      <Text color="subtle">{x.id} </Text>
      <Text weight={picked === x.id ? 'medium' : 'regular'}>{title}</Text>
    </Button>
  </Box>
</Box>
```

- Desktop truncates with CSS because of the `flexGrow={1} minWidth={0}` wrapper. Terminal: `cut(x.title, bodyColumns − x.id.length − 3)`, where `cut = (s, n) => s.length > n ? `${s.slice(0, Math.max(1, n - 1)).trimEnd()}…` : s`.
- The picked row is `medium`, not colored.
- Rows of one list keep no gap.

## 8. Label and value rows

OBS. Foreman's Roadmap pane (4.5.0 to 4.7.1, `hooks/register.tsx`, `field`), identical to the former Roadmap pane mod's.

```tsx
<Box key={`card-${key}`} flexDirection="row" justifyContent="space-between" gap={1}>
  <Text size="footnote" dimColor>{label}</Text>
  <Text size="footnote" color="subtle" wrap="truncate-end">{value}</Text>
</Box>
```

For a name and a number: `<Box flexShrink={1}><Text wrap="truncate-end">{name}</Text></Box>` then `<Box flexShrink={0} marginLeft={1}><Text color="subtle" tabular>{n}</Text></Box>`.

## 9. Card under the picked row

OBS at 66 and 38 columns. `git-pane`, `key="card"`.

```tsx
<Box key="card" flexDirection="column" flexShrink={0} marginY={isTerminal ? 0 : 0.4} borderStyle="round" borderColor="promptBorder" paddingX={1}>
  <Box key="card-head" flexDirection="row" justifyContent="space-between" alignItems="center">
    <Text size="footnote">{title}</Text>
    <Button key="card-close" plain dimColor label={t.close} onPress={() => pick(null)} />
  </Box>
  …fields…
  <Box key="card-actions" flexDirection="row" flexWrap="wrap" columnGap={1} rowGap="xs">{actions}</Box>
</Box>
```

- The card opens directly under the row that was pressed.
- Actions wrap; nothing is cut at 38 columns.
- Card foot with one main action: the other action left as `secondary`, main action right as `primary`. A `plain dimColor` label alone at a foot's left reads as text: the owner missed one (OBS, 5.11492, the source repository's look rules (not shipped) rule 10b).

```tsx
<Box key="card-actions" flexDirection="row" justifyContent="space-between" alignItems="center" gap={1} marginTop="sm">
  <Button key="fill" variant="secondary" label={t.toPrompt} onPress={fillPrompt} />
  <Button key="send" variant="primary" label={verb} onPress={send} />
</Box>
```

The former Roadmap pane mod's foot had these variants since 2026-11-14 and kept `marginTop={0.5}` (5 px): its head and reason used the same 0.5, and no step is that small. Foreman's foot does not match it: a `plain dimColor` "To prompt" at the left and a default Button at the right, spaced by `gap="xs"` (4.5.0 to 4.7.1, `hooks/register.tsx`), the case rule 10b warns about. `variant="primary"` draws ink-filled at weight 500 in the harness; it has not been seen in the app. In the terminal both draw as bold `[ label ]`, the primary one in `suggestion` (`terminal.md`).

## 10. Toggle

OBS, owner chose the glyph pair. `git-pane`, `toggle`; `usage-ribbon`, `auto-compact`.

```tsx
<Button key={`o-${key}`} plain dimColor={!on} onPress={flip}>{`${on ? '◉' : '○'} ${label}`}</Button>
```

- State is in the glyph shape and in `dimColor`, because Desktop ignores a child's ink.
- A glyph-only toggle gets a hover card on Desktop, and in the terminal a space each side: `` ` ${glyph} ` ``.
- The "on" ink in the terminal is `suggestion` (owner: blue when on, dim when off).

## 11. Explain-on-press

OBS. `git-pane`, `key="x-upstream"`. A state glyph nobody understands becomes a Button that asks Claude.

```tsx
<Box minWidth={0} flexShrink={1}>
  <Button key="x-upstream" plain dimColor hover={{ underline: true }} onPress={() => fill($, t.ask.explainCounts(…))}>
    <Text size="footnote" color="subtle" tabular wrap="truncate-end">{`↑${ahead} ↓${behind} · ${upstream}`}</Text>
  </Button>
</Box>
```

The enclosing row has a `key` (a Button with `hover` needs a keyed Box). Each such prompt ends "Run only Git reads and change nothing."

## 12. Actions that fill the prompt

OBS. `git-pane`, `fill`, `action`, `row`.

```tsx
const action = (key: string, label: string, text: string) => (
  <Button key={key} plain dimColor onPress={() => fill($, text)}>{label}</Button>
)
const row = (key: string, children) => (
  <Box key={key} flexDirection="row" flexWrap="wrap" columnGap={1} rowGap="xs">{children}</Box>
)
const fill = async ($, text) => {
  const box = await $.prompt.read()
  await $.prompt.fill({ text: draftWith(text, box.text, await read($, lastFill)), mode: 'replace' })
  await update($, lastFill, () => text)
}
```

`plain dimColor` here is the long-wrapping-row exception in "Which Button form" above. The confirmation for anything dangerous is the person pressing Enter on the filled prompt. Never `$.prompt.submit` a destructive request. Gate mechanical actions on state (`canCommit`) and re-check on press.

## 13. Input with a draft

OBS. `git-pane`, `field`.

```tsx
'Input' in ui && (
  <Box key={`f-${key}`} flexShrink={0} marginTop={isTerminal ? 0 : 0.4}>
    <ui.Input
      key={`filter-${key}`}
      placeholder={placeholder}
      value={draft[key]}
      submitLabel={t.apply}
      onInput={(s: string) => update($, draftAtom, x => ({ ...x, [key]: s }))}
      onSubmit={(s: string) => apply(s.trim())}
    />
  </Box>
)
```

Alone in its row; `0.4` keeps the focus glow inside the pane; the draft atom survives a redraw. Desktop always draws the submit Button beside the field (HARNESS), so `submitLabel` is a visible word: "Filter" for a filter, "Send" for a message, in the interface language. Filter on submit; filtering on every `onInput` redraws the pane per keystroke and nobody has seen that hold focus. An active filter shows a footnote with a `Clear` Button:

```tsx
<Box key="active" flexDirection="row" gap={1}>
  <Box flexGrow={1} minWidth={0}><Text size="footnote" color="subtle" wrap="truncate-end">{t.filtered(active)}</Text></Box>
  <Button key="f-clear" plain dimColor label={t.clear} onPress={clear} />
</Box>
```

## 14. Swatch and divider (Svg with terminal fallback)

OBS. The swatch Svg is the former Roadmap pane mod's, historical: Foreman's Roadmap pane draws a `■` glyph on every surface (4.5.0 to 4.7.1, `hooks/register.tsx`; traps row 42). The divider below is the same in Foreman (`:317-319`, drawn at `:464`).

```tsx
{isTerminal || !('Svg' in ui)
  ? <Text color={color}>■ </Text>
  : <Box key={`swatch-${id}`} marginRight={0.65}>
      <ui.Svg source={`<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" rx="2" fill="${SWATCH[id]}"/></svg>`} alt={t.swatch(title)} width={10} height={10} />
    </Box>}
```

10 × 10 with `rx="2"` is the native Context legend swatch, the one that sits beside list rows; the 12 × 12, `rx="3"` swatch of `native-components.md` belongs to chart legends, which a mod does not draw. A larger radius reads as a circle (owner complaint).

- `SWATCH` maps each section to a literal fill, because no theme key reaches an Svg. Each literal is a hex and needs the owner's approval and an allow entry for the mod (rule 1). Approved today, per mod, in scripts/mod-colors.allow.json (kept in the source repository, not shipped): `git-pane` has `#2a78d6` (the accent blue) for its lanes. The former Roadmap pane mod had `#2a78d6`, `#1baf7a`, `#eb6834` and `#898781`; those entries are not in this repository's file. A new mod has none: propose the same four to the owner before writing them.
- The swatch, the bar piece and the row dot of one section share one color: the key where a key can be used, the approved literal in the Svg.
- `isTerminal ||` does the work. `'Svg' in ui` is true on the terminal too and only guards an engine too old to know `Svg` (traps row 46).
- Why not the glyph on Desktop: a `■` there is 10 px with square corners and color fringes at its edges (OBS 5.11492, Foreman's Roadmap pane; traps row 42).

```tsx
const DIVIDER = '<svg xmlns="http://www.w3.org/2000/svg" width="4096" height="1" viewBox="0 0 4096 1" preserveAspectRatio="none"><rect width="4096" height="1" fill="currentColor" fill-opacity=".06"/></svg>'
{!isTerminal && 'Svg' in ui && <ui.Svg source={DIVIDER} alt={t.divider} width={4096} height={1} />}
```

The shipped divider is 6% ink; the native hairline is alpha-1, 5%. Close enough that the owner accepted it; write `.05` in a new mod. The terminal gets no divider.

## 15. Footer chip

OBS, Desktop 4.16336. Foreman's Roadmap pane (4.5.0 to 4.7.1, `hooks/register.tsx`, the same chip the former Roadmap pane mod drew) and `git-pane`.

```tsx
on('ui.render', { component: 'SessionMode' }, async ($, e, next) => {
  const r = await next(e)
  if (!(await read($, applies))) return r
  const { Box, Button } = $.ui.resolve(e)
  const up = await read($, isOpen)
  return (
    <Box flexDirection="row" gap={1}>
      {r}
      <Button key="roadmap-toggle" plain dimColor={!up} onPress={() => (up ? close($) : open($))}>Roadmap</Button>
    </Box>
  )
})
```

One word. A `ui.close` hook resets `isOpen` when the person closes the pane natively.

On screen in 5.11492, dark (OBS): the chip "Git" is 23 × 13 px, fill `#252525` (5% white), radius about 4 px, text `#a1a1a1` while the pane is closed; it sits 16 px before the model name.

## 16. Band skeleton

OBS. `usage-ribbon`.

```tsx
on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
  if (e.props.hasSurvey) return next(e)
  const { Box } = $.ui.resolve(e)
  return (
    <Box flexDirection="row" flexWrap="wrap" paddingX={1} rowGap="xs">
      …blocks…
      <Box key="right" flexDirection="row" flexGrow={1} justifyContent="flex-end">…</Box>
    </Box>
  )
})
```

One wrapping row on Desktop; a block that does not fit moves down whole. Terminal: tier by `bodyColumns` (wide, stacked, tight). A hook with nothing to draw returns `next(e)`. The shipped band also wraps `{await next(e)}` in a column, which the per-plugin band of 2.1.325 no longer needs.

A status band with a word, a meter and actions (composed from the parts above; drawn in the harness as separate cases, not seen in the app as one):

```tsx
<Box flexDirection="row" flexWrap="wrap" paddingX={1} columnGap={1} rowGap="xs">
  <Text weight="medium">{t.building}</Text>
  <Box key="build-tip" position="relative" height={1} alignItems="center">
    {!isTerminal && (
      <Box position="absolute" top={0} left={0} display="none" hover={{ display: 'flex' }}>
        <Text>{t.buildTip(done)}</Text>
      </Box>
    )}
    {meter(done, BLUE)}
  </Box>
  <Text dimColor tabular>{done}%</Text>
  <Box key="actions" flexDirection="row" flexGrow={1} justifyContent="flex-end" columnGap={1}>
    <Button key="a-retry" variant="secondary" label={t.retry} onPress={retry} />
    <Button key="a-open" variant="primary" label={t.open} onPress={open} />
  </Box>
</Box>
```

- Band text stays at the default `body` size; on the band every Button is 28 px tall whatever its form.
- A state word is plain or `medium` ink. Color it (`success`, `warning`, `error`) only when the state is one of those, and pair the color with a word or mark, never color alone.
- The Buttons sit in their own Box, so the host's notice reshape does not apply (`desktop-sites.md`): they stay where the tree puts them and no close control appears.
- The tooltip of a thing that cannot be pressed says what it shows ("62% of the build is done"), not what a press does.

## 17. Pane skeleton with a pinned footer

OBS. Foreman's Roadmap pane (4.5.0 to 4.7.1, `hooks/register.tsx`, `:579`, `:599`), the same structure as the former Roadmap pane mod's.

```tsx
const { bodyRows } = e.props.scroll
const isPinned = !isTerminal && card !== undefined
<Box flexDirection="column" {...(isTerminal ? {} : isPinned ? { height: bodyRows } : { minHeight: bodyRows })}>
  …head, search…
  <Box key="list" flexDirection="column" {...(isTerminal ? {} : isPinned ? { flexGrow: 1, minHeight: 0, overflow: 'hidden' as const } : { flexGrow: 1 })}>…</Box>
  …card…
  <Box key="foot" marginTop="sm" flexShrink={0} flexDirection="row" justifyContent="space-between" alignItems="center">
    <Text size="footnote" color="subtle">{readAgo}</Text>
    <Button key="refresh" variant="secondary" label={t.refresh} onPress={() => load($)} />
  </Box>
</Box>
```

The structure is what was seen. The footer's `marginTop="sm"` and `variant="secondary"` follow the current rules; the former Roadmap pane mod's code had `marginTop={1}` and no `variant`, and that exact form is the one in the owner's shots (historical: Foreman's foot, `hooks/register.tsx`, has no `variant` either but takes its spacing from the column's `gap="md"`).

## 18. Loading, empty, error

OBS.

```tsx
if (err !== null) return <Box flexDirection="column" gap={1}><Text>{err}</Text><Box>{refresh}</Box></Box>
if (data === null) return <Text color="subtle">{t.reading}</Text>
// empty list, under its head:
<Box paddingLeft={2}><Text color="subtle">{t.empty}</Text></Box>
```

- Loading: one muted line with "…". No spinner glyphs.
- Empty: one muted line in the list's place ("No branches match"), never a missing section.
- Error: the message in the main ink, wrapping, then a Refresh. That is the shipped, owner-seen form for a pane whose whole body failed. A single failed line inside a working view (a job, a field) takes `color="error"`, as the native field error does, and switches from truncating to wrapping.
- Pending: one dim line. Never a colored card before there is a verdict.

## 19. Per-row graph (Svg on Desktop, glyphs in the terminal)

OBS, Desktop 88 columns, 60 rows. `git-pane`, lanes.

```tsx
{lane && !isTerminal && 'Svg' in ui && <ui.Svg key={`lane-${x.hash}`} source={laneSvg(lane, laneCount, pitch, LANE_H)} alt={t.lane} width={laneCount * pitch} height={LANE_H} />}
{lane && isTerminal && (
  <Text key={`tl-${i}`} mono>
    {laneText(lane, laneCount).map((g, j) => <Text key={`tl-${i}-${j}`} color={g.hot ? 'suggestion' : 'subtle'}>{g.s}</Text>)}
  </Text>
)}
```

One image Svg per row, one width for all rows, `currentColor` with opacity for neutral lines, `stroke-linecap="butt"`, the accent lane as the single approved literal. Each row stays a Button. Width tiers: hash and all refs from 48 columns, one ref `+n` from 32 to 47, no graph under 32. About six nodes per row: near 300 rows the tree passes Desktop's 2,000-node cap, so cap the list and add "Show more".

On screen in 5.11492, dark (OBS): rows of 24 px; a 1.5-unit stroke draws as 2 px at 75% of its color; a node dot is 8 px. For 4 px at each row boundary the line was at full strength and 2 px wide: a bead, visible when enlarged.

**Cause, found and reproduced (HARNESS, the same renderer, 1× scale):** a cubic path whose four points lie on one line, such as `M6 0C6 6 6 6 6 12`, is stroked 2 px wide for 2 px at each end. The same segment written as a line (`M6 0V12`) is even from end to end, and a real curve between two columns has no bead. `git-pane` drew every same-column edge with its curve helper; it now writes a line when both ends share a column (2026-11-14). Seen in the app the same day (OBS 5.11492, dark, captures 09 and 10): the line between two dots is an even 2 px for 15 to 16 px, with no bead. Rule: in an Svg, never write a curve command for a straight segment.

## 20. Language (shipped form; its source of the language is under review)

This is what the three mods ship, and the owner objected to its result on 2026-11-07: the band was in Spanish while the app's interface was in English. Copy the catalog shape; do not treat `language` as settled. Before using it in a new mod, read owner-standards.md (kept in the source repository, not shipped), language, and ask the owner which source wins.

OBS (the code runs as written). Same code in three mods (an arrow helper that receives `$` across files refuses to load, so it is copied).

```ts
export const isSpanish = (v: unknown): boolean => {
  if (typeof v !== 'string') return false
  const t = v.trim().toLowerCase()
  return /^es(?:$|[-_])/.test(t) || ['en', 'es'].some(d => t.startsWith(new Intl.DisplayNames([d], { type: 'language' }).of('es')!.toLowerCase()))
}
async function stringsOf($: EngineInterface): Promise<Strings> {
  try { return isSpanish(await $.settings.read({ key: 'language' })) ? ES : EN } catch { return EN }
}
```

`EN` is complete; `ES: typeof EN` is typed against it; plurals and placeholders are functions. Every `Intl` call passes the locale (the engine's default is `en-US` whatever the OS says). Known gap: `language` is Claude Code's reply language, not Desktop's interface language, which lives in the app's `config.json` `locale`. See owner-standards.md (kept in the source repository, not shipped).

## 21. Redraw, toasts, safe hooks

```ts
$.clock.every(TICK_MS, async () => { $.ui.invalidate('ui.render') })                       // countdowns stay current
if (out.exitCode !== 0) await $.ui.toast(t.failed(clean(out.stderr).trim().split('\n').at(-1) ?? String(out.exitCode)))
on('ui.close', async ($, e, next) => { … }).catch(($, e, next) => next(e))                  // a failed state write never blocks the close
const repo = atom({ plugin: 'git-pane', key: 'repo' } as const, null, { shape: 'repo-7' })   // bump the shape when fields change
```

## 22. Status list in a pane (filter, marks, empty, error)

Composed from recipes 6, 7, 13, 17 and 18; each part was seen, the whole was not.

```tsx
const mark = (ok: boolean) => (ok ? { g: '●', c: 'success' } : { g: '✕', c: 'error' })

if (err !== null) return <Box flexDirection="column" gap={1}><Text>{err}</Text><Box>{refresh}</Box></Box>
if (data === null) return <Text color="subtle">{t.reading}</Text>
return (
  <Box flexDirection="column" {...(isTerminal ? {} : { minHeight: bodyRows })}>
    <Box key="head-tests" flexDirection="row" justifyContent="space-between" marginTop="md">
      <Text size="footnote" weight="medium">{t.results}</Text>
      <Text size="footnote" color="subtle" tabular>{t.passedOf(passed, shown.length)}</Text>
    </Box>
    {'Input' in ui && (
      <Box key="f-filter" flexShrink={0} marginTop={isTerminal ? 0 : 0.4}>
        <ui.Input key="filter" placeholder={t.filterHint} value={draft} submitLabel={t.filter} onInput={keep} onSubmit={apply} />
      </Box>
    )}
    <Box key="list" flexDirection="column" flexGrow={1}>
      {shown.length === 0
        ? <Box key="empty" paddingLeft={1}><Text color="subtle">{active ? t.noMatches : t.noResults}</Text></Box>
        : shown.map(x => (
            <Box key={`row-${x.id}`} flexDirection="row" gap={1}>
              <Text color={mark(x.ok).c}>{mark(x.ok).g}</Text>
              <Box flexGrow={1} minWidth={0}>
                <Button key={x.id} plain hover={{ underline: true }} onPress={() => pick(x.id)}>
                  <Text wrap="truncate-end">{isTerminal ? cut(x.name, bodyColumns - 10) : x.name}</Text>
                </Button>
              </Box>
              <Text size="footnote" color="subtle" tabular>{x.duration}</Text>
            </Box>
          ))}
    </Box>
    <Box key="foot" marginTop="sm" flexShrink={0} flexDirection="row" justifyContent="space-between">
      <Text size="footnote" color="subtle">{readAgo}</Text>
      {refresh}
    </Box>
  </Box>
)
```

- Marks: `●` in `success` and `✕` in `error`, so the shape differs as well as the color and the pair survives a colorblind theme. `●` is in the project's seen-safe set for Windows Terminal; `✕` is the CLI's own close mark there but no mod has shipped it (UNVERIFIED in the owner's font): ask for a terminal screenshot. `✓` and `✗` are the CLI's status marks; the project found `✔ ☑` to vary by font and has not tried those two.
- Wording: "No results" for an empty list, "No matches" under an active filter, "{passed} of {total} passed" for the summary, "Reading…" while loading: the app's own strings (`codetab-surfaces.md`, empty and loading states).
- Pane title: not one of the words the host uses. scripts/check-mod-look.mjs (kept in the source repository, not shipped) refuses `Context`, `Changes`, `Files`, `Results`, `Environment`, `Usage`, `Memory`, `Diff`, `Terminal` and their Spanish forms. So this pane is titled "Tests", and "Results" is only a head inside it.
- `$.ui.open({ id, title })` with nothing else: `focus`, `closeOnEscape` and `holdToasts` are for a dialog the person answers and leaves, not for a pane that stays.
- Up to about 300 rows before Desktop's node cap; cap the list and add "Show more".

## 23. A small icon (Svg on Desktop, a word in the terminal)

CODE for the geometry, HARNESS for how it draws (harness case `icon`: a 16 × 16 image, centered on the text line, 7.5 px from the label with `columnGap={1}`; the host writes `color="rgba(0, 0, 0, 0.9)"` into the source, so `currentColor` is the plain ink). UNVERIFIED in the app: no shipped mod draws one. Propose it to the owner with a screenshot before shipping; until then a word or one of the accepted glyphs (the list after rule 21 in `SKILL.md`) is the seen form.

The engine draws its own two icons (the Select caret and the option check) as `viewBox="0 0 16 16"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="1.5"`, round caps and joins (engine chunk @142333). Native icons beside text are 16 px (12 px inside a chip, 20 px in a row's lead slot). Copy that grammar:

```tsx
const ICON = (d: string, opacity = 1) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-opacity="${opacity}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`

const CARET_DOWN = 'M4 6l4 4 4-4'        // the engine's own Select caret
const CHECK = 'M3.5 8.5l3 3 6-7'         // the engine's own option check

{isTerminal || !('Svg' in ui)
  ? <Text color="subtle">{t.done}</Text>
  : <ui.Svg key={`ico-${id}`} source={ICON(CHECK, 0.6)} alt={t.done} width={16} height={16} />}
```

- `currentColor` is the host's plain ink in both themes; `stroke-opacity=".6"` gives the secondary ink (60%, `native-screens.md`). An icon cannot take a theme key: for a colored state use the word in `success`, `warning` or `error` ink instead of a colored icon.
- One path, drawn on the 16-unit grid with 1.5-unit strokes. No fills, no text inside, no second color.
- A straight segment is a line command (`V`, `H`, `L`), never a curve with its points in a row: the renderer thickens the ends of such a curve (recipe 19).
- Round caps are for a lone icon. Lines that continue from one row's Svg into the next (recipe 19, lanes) take `stroke-linecap="butt"`: round caps double the ink where two rows meet.
- The sizes are native's: 16 px beside body text, 20 px in a row's lead slot (`native-components.md`, session-panel row), 12 px inside a chip (`composer-and-pr.md`, session-panel PR chip).
- `alt` says what the icon means ("Done"), never what it looks like, and must not be empty.
- An icon is never the only carrier of a state and never a control by itself: a press does not reach the mod from inside an Svg, so the Button beside it carries the label.
- The terminal has no Svg: it gets the word.

## Key names

Lower-case kebab with a role prefix: `sec-<id>` section Button, `head-<id>`, `row-<id>`, `card`, `card-head`, `card-close`, `card-actions`, `a-<action>`, `q-<action>`, `x-<state>` (explain), `o-<option>` (toggle), `f-<field>`, `<mod>-toggle` (footer). Keys are what tests press.
