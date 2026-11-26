// Draws the input tree in its site, and the input theme, with the installed Desktop's own functions:
//   tree     -> the engine's DOM builder, in a Pane or the AbovePrompt band, with that site's CSS and shaper
//   colors   -> applyTheme on <html>, as the app's theme component does
//   glass    -> the sites chunk's glass setter on .dframe-root, as the Backdrop layer does
//   backdrop -> the engine builder with the backdrop site's CSS and shaper, in the layer the app creates
// Then it measures what was drawn and saves the report. Query: ?mode=light|dark&font=system|anthropic
const q = new URLSearchParams(location.search)
const input = await (await fetch('/__input.json')).json()
const user = input.settings
const root = document.documentElement
const mode = q.get('mode') ?? user?.mode ?? 'light'
root.setAttribute('data-mode', mode)
if (user?.contrast === 'more') root.setAttribute('data-cds-contrast', 'more')
if (user?.locale) root.lang = user.locale
// As the app does (CODE, 6.28899): data-cds-windows on a Windows user agent, and the desktop app's default interface
// font "system" (the web's default is anthropic-sans, which ?font=anthropic gives).
if (/windows/i.test(navigator.userAgent)) root.setAttribute('data-cds-windows', '')
if ((q.get('font') ?? (user && user.font !== 'system' ? 'anthropic' : 'system')) === 'system') { root.setAttribute('data-font', 'system'); root.setAttribute('data-system-font', '') }

const B = (props, ...children) => ({ type: 'Box', props, children })
const T = (props, ...children) => ({ type: 'Text', props, children })
const press = { press: { plugin: 'preview', handle: 1 } }
// Without a tree: a test mod with a heading, default, primary and plain Buttons, an Input, and a card with a meter.
const sample = B({ flexDirection: 'column', gap: 'sm' },
  T({ size: 'heading', weight: 'semibold' }, 'Test mod'),
  T({ dimColor: true }, 'Default, primary and plain buttons, an input and a meter card.'),
  B({ flexDirection: 'row', columnGap: 1 }, { type: 'Button', props: { key: 'a', label: 'Default' }, ...press }, { type: 'Button', props: { key: 'b', label: 'Primary', variant: 'primary' }, ...press }, { type: 'Button', props: { key: 'c', label: 'Plain', plain: true }, ...press }),
  { type: 'Input', props: { key: 'i', placeholder: 'Filter', value: '', submitLabel: 'Apply' }, ...press },
  B({ borderStyle: 'round', paddingX: 1, flexDirection: 'column', gap: 'xs' }, T({}, 'Usage'), B({ width: '100%', height: 0.3, borderStyle: 'round', borderColor: 'rate_limit_empty', padding: 0, overflow: 'hidden' }, B({ width: '60%', height: '100%', backgroundColor: 'rate_limit_fill' }))))

const report = { mode, site: input.site, tree: input.tree ? 'input' : 'sample', theme: input.theme ? 'input' : user?.palette ? 'user palette' : 'none', steps: [] }
const cs = (el) => getComputedStyle(el)
const box = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x * 10) / 10, y: Math.round(b.y * 10) / 10, w: Math.round(b.width * 10) / 10, h: Math.round(b.height * 10) / 10 } }
const measure = (sr) => ({
  buttons: [...sr.querySelectorAll('button')].map((b) => ({ text: b.textContent.trim().slice(0, 40), ...box(b), bg: cs(b).backgroundColor, color: cs(b).color })),
  inputs: [...sr.querySelectorAll('input')].map((i) => ({ ...box(i), bg: cs(i).backgroundColor, shadow: cs(i).boxShadow })),
  font: cs(sr.host).fontFamily.slice(0, 80),
})
try {
  const info = await (await fetch('/__preview-names.json')).json()
  const N = Object.fromEntries(Object.entries(info.names).map(([k, v]) => [k, v.value]))
  report.build = { engine: info.engineFile, sites: info.sitesFile, theme: info.themeFile }
  await Promise.all([...info.sheets].reverse().map((href) => new Promise((ok) => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; l.onload = l.onerror = ok; document.head.prepend(l) })))
  const Eng = await import('/assets/v1/__preview-engine.js')
  const Sites = await import('/assets/v1/__preview-sites.js')
  const Theme = await import(`/assets/v1/${info.themeFile}`)
  const E = (k) => Eng[`__${N[k]}`], S = (k) => Sites[`__${N[k]}`]
  const handlers = { press() {}, input() {}, select() {} }
  const frame = document.querySelector('.dframe-root'), ground = document.querySelector('.dframe-content')

  // The theme: the input's colors, else the palette this computer's Desktop keeps for the active mod theme.
  const theme = input.theme ?? {}
  const colors = theme.colors ?? (input.theme ? null : user?.palette)
  if (colors) { Theme[N.applyTheme](colors, { target: root }); report.steps.push('colors') }
  if (theme.backdrop && theme.backdropTree) {
    const layer = S('backdropLayer')(document)
    ground.prepend(layer)
    S('backdropMark')(layer, theme.backdrop.scene)
    const holder = document.createElement('div'); holder.className = 'absolute inset-0'
    const host = document.createElement('div'); host.className = 'absolute inset-0'; host.setAttribute('data-plugin-drawn', 'Backdrop'); host.setAttribute('data-engine-swaps-once-loaded', '')
    holder.appendChild(host); layer.appendChild(holder)
    const site = S('backdropSite')
    E('attach')(host, site.surfaceCss)
    E('build')(host, site.shapeTree(theme.backdropTree), { handlers, clients: null, liftsHoverCards: false })
    if (theme.backdrop.glass) { S('glass')(frame, theme.backdrop.glass, mode); report.steps.push('glass') }
    S('backdropOn')(frame)
    report.steps.push('backdrop')
    await new Promise((ok) => { const img = host.shadowRoot.querySelector('img'); if (!img || img.complete) ok(); else { img.onload = img.onerror = ok } })
  }

  // The tree, in the site the engine's own wrapper would give it.
  // The tree is drawn as given. Desktop's own check runs on the wire form the CLI sends, which this input is not.
  const tree = input.tree ?? sample
  const band = input.site === 'band'
  const region = document.createElement('div'); region.className = `min-h-0 min-w-0 text-body text-primary ${band ? E('bandClass') : N.paneClass}`
  const scroll = document.createElement('div'); scroll.setAttribute('data-engine-site', band ? 'AbovePrompt' : 'Pane'); scroll.setAttribute('data-engine-site-drawn', 'true'); scroll.className = E('siteClass')
  const mid = document.createElement('div'); Object.assign(mid.style, E('holderStyle'))
  const host = document.createElement('div'); host.setAttribute('data-plugin-drawn', band ? 'AbovePrompt' : 'Pane'); host.className = N.hostClass
  mid.appendChild(host); scroll.appendChild(mid); region.appendChild(scroll)
  if (band) {
    // The band sits above the composer in a 768 px column, 96 px from the window's bottom (an assumption for the frame).
    const holderB = document.createElement('div'); holderB.style.cssText = 'position:absolute;left:50%;bottom:96px;width:768px;transform:translateX(-50%)'
    holderB.appendChild(region); document.getElementById('panel').appendChild(holderB)
  } else document.getElementById('column').appendChild(region)
  E('attach')(host, band ? E('bandCss') : '')
  E('build')(host, (band ? E('bandShaper') : E('defaultShaper'))(tree), { handlers, clients: null, liftsHoverCards: band })
  report.region = { ...box(region), bg: cs(region).backgroundColor, radius: cs(region).borderRadius }

  const tok = (n) => cs(root).getPropertyValue(n).trim()
  report.tokens = Object.fromEntries(['--cds-surface-0', '--cds-surface-1', '--cds-surface-2', '--cds-text-primary', '--cds-text-secondary', '--cds-page-bg'].map((n) => [n, tok(n)]))
  report.frame = { glass: frame.hasAttribute('data-engine-glass'), backdropOn: frame.hasAttribute('data-engine-backdrop-on') }
  // The glass: the veil host's ::before tints and fades, its ::after blurs. A mask of "none" means the fade broke.
  const panel = document.getElementById('panel'), veil = getComputedStyle(panel, '::before'), frost = getComputedStyle(panel, '::after')
  report.veil = { tint: veil.backgroundColor, fade: veil.maskImage === 'none' ? 'none' : 'gradient', blur: frost.backdropFilter, blurBand: frost.maskImage === 'none' ? 'none' : 'gradient' }
  // Measure once fonts have loaded: before that the boxes use a fallback face and their widths are wrong.
  await document.fonts.ready
  await new Promise((ok) => setTimeout(ok, 1500))
  Object.assign(report, measure(host.shadowRoot))
  report.region = { ...box(region), bg: cs(region).backgroundColor, radius: cs(region).borderRadius }
  report.page = { dpr: devicePixelRatio, userAgent: navigator.userAgent, fonts: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}`) }
} catch (e) {
  report.failed = String(e?.stack ?? e).slice(0, 800)
}
document.getElementById('out').textContent = JSON.stringify(report, null, 1)
window.__report = report
await fetch(`/__save?name=preview-${mode}`, { method: 'POST', body: JSON.stringify(report, null, 1) })
window.__done = true
