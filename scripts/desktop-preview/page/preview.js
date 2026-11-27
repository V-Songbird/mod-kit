// Draws the input tree in its site, and the input theme, with the installed Desktop's own functions:
//   tree     -> the engine's DOM builder, in a Pane or the AbovePrompt band, with that site's CSS and shaper
//   colors   -> applyTheme on <html>, as the app's theme component does
//   glass    -> the sites chunk's glass setter on .dframe-root, as the Backdrop layer does
//   backdrop -> the engine builder with the backdrop site's CSS and shaper, in the layer the app creates
// Then it measures what was drawn and saves the report. Query: ?mode=light|dark&font=system|anthropic
const q = new URLSearchParams(location.search)
const frameNo = q.get('frame')
const input = await (await fetch(frameNo === null ? '/__input.json' : `/__input.json?frame=${frameNo}`)).json()
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

  // The Shader, in the app's own worker, driven with the messages the PointerBackdrop chunk sends: start, stage,
  // pause, then underlay (the Svg over the surface color) once the worker names its size. The driver is this page,
  // not the app's own path: it sends no composer box, no veils, no pointer and no GPU class, and it treats the Svg
  // as still. isFrosted is on, so the worker posts the 64x40 readback the app's glass paints from.
  if (input.shader) {
    const sh = input.shader
    report.shader = { worker: sh.worker, desktop: sh.desktop, cli: sh.cli, driver: 'preview page after PointerBackdrop, not the app', messages: [], sizes: [], size: null, sharpness: null, frost: null }
    const gl = document.createElement('canvas').getContext('webgl2'), dbg = gl?.getExtension('WEBGL_debug_renderer_info')
    report.shader.gpu = gl ? gl.getParameter(dbg ? dbg.UNMASKED_RENDERER_WEBGL : gl.RENDERER) : 'no WebGL2'
    const layer = S('backdropLayer')(document)
    ground.prepend(layer)
    S('backdropMark')(layer, theme.backdrop?.scene ?? 'shader')
    const holder = document.createElement('div'); holder.className = 'absolute inset-0'
    const img = document.createElement('img'); img.alt = ''; img.className = 'absolute inset-0 size-full bg-surface-1 opacity-0'
    const canvas = document.createElement('canvas'); canvas.className = 'absolute inset-0 size-full opacity-0'
    holder.append(img, canvas); layer.appendChild(holder)
    if (theme.backdrop?.glass) { S('glass')(frame, theme.backdrop.glass, mode); report.steps.push('glass') }
    S('backdropOn')(frame)
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sh.svg)}`
    await img.decode().catch(() => {})
    const t0 = performance.now(), at = () => Math.round(performance.now() - t0)
    // With frames, shader-clock.js runs before the worker and the page steps each frame itself, from fit on.
    const w = new Worker(sh.frames ? '/__preview-shader-clock.js' : sh.worker, { type: 'module', name: 'backdrop' })
    const STOPS = ['refused', 'unfit', 'flash', 'slow', 'lost']
    let drawn = false, readbacks = 0, reply = null, tick = 0, drawnTick = null
    const ask = (msg) => new Promise((ok, no) => { reply = (d) => (d.preview === 'error' ? no(new Error(d.error)) : ok(d)); w.postMessage(msg) })
    // Frame n is the nth frame request after the first frame drawn. While the shader moves, the worker draws at each
    // request with 1/fps, so frame n sits at n/fps s on the shader's clock. A calm shader naps instead: the nap adds
    // 0.25 s and the request after it draws nothing, so from the first nap on `t` is nominal and `naps` counts them.
    const stepFrames = async () => {
      const fps = sh.ir.fps ?? 60, want = new Set(sh.frames), last = Math.max(...sh.frames)
      let naps = 0
      report.shader.frames = []
      report.shader.driver += '; frames stepped by shader-clock.js: fixed clock, fixed noise, no GPU timer'
      for (tick = 1; drawnTick === null || tick - drawnTick <= last; tick++) {
        if (drawnTick === null && tick > 600) throw new Error('no frame drawn within 600 frame requests')
        const r = await ask({ kind: 'preview-frame', at: (tick * 1000) / fps })
        if (drawnTick !== null && tick > drawnTick && r.waited) naps++
        const n = drawnTick === null ? null : tick - drawnTick
        if (n === null || !want.has(n)) continue
        const s = await ask({ kind: 'preview-save' })
        const name = `shader-${mode}-${String(n).padStart(4, '0')}`
        await fetch(`/__save?name=${name}&ext=png`, { method: 'POST', body: s.png })
        report.shader.frames.push({ n, t: Math.round((n * 1e6) / fps) / 1000, naps, file: `${name}.png`, size: s.size, pixel: s.pixel })
      }
      return 'drawn'
    }
    report.shader.status = await new Promise((ok) => {
      setTimeout(() => ok('timeout'), sh.frames ? 25000 : 15000)
      w.addEventListener('error', (e) => { report.shader.messages.push({ at: at(), error: e.message || 'worker error' }); ok('lost') })
      w.addEventListener('message', ({ data: d }) => {
        if (d?.preview) { reply?.(d); return }
        // The worker posts drawn inside the frame it first draws, before that frame's reply.
        if (sh.frames && d === 'drawn' && drawnTick === null) drawnTick = tick
        if (sh.frames && d === 'fit' && !report.shader.frames) stepFrames().then(ok, (e) => { report.shader.messages.push({ at: at(), error: e.message }); ok('frames failed') })
        if (sh.frames && d instanceof ImageData) return
        if (d instanceof ImageData) {
          // Three readbacks after drawn, so the one kept is a frame the shader painted, not the first clear.
          if (drawn && ++readbacks === 3) {
            const sum = [0, 0, 0, 0]
            for (let i = 0; i < d.data.length; i++) sum[i % 4] += d.data[i]
            report.shader.frost = { width: d.width, height: d.height, mean: sum.map((v) => Math.round((v / (d.data.length / 4)) * 100) / 100) }
            ok('drawn')
          }
          return
        }
        report.shader.messages.push({ at: at(), msg: d })
        if (Array.isArray(d)) {
          // The worker's drawing size; it can grow again after a while. Sharpness is its width over the stage's CSS
          // width, the figure validate prints as sharpness. The driver names no GPU class, so no tier is claimed.
          report.shader.sizes.push(d); report.shader.size = d
          report.shader.sharpness = Math.round((d[0] / report.shader.stage.width) * 100) / 100
          const c = new OffscreenCanvas(Math.ceil(d[0]), Math.ceil(d[1])), cx = c.getContext('2d')
          cx.fillStyle = cs(img).backgroundColor; cx.fillRect(0, 0, c.width, c.height); cx.drawImage(img, 0, 0, c.width, c.height)
          const picture = c.transferToImageBitmap()
          w.postMessage({ kind: 'underlay', picture, isMoving: false }, [picture])
        } else if (d === 'drawn') { drawn = true; canvas.style.opacity = '1' }
        else if (STOPS.includes(d) || (d && typeof d === 'object')) ok(typeof d === 'string' ? d : 'stopped')
      })
      const off = canvas.transferControlToOffscreen(), b = img.getBoundingClientRect()
      report.shader.stage = { width: b.width, height: b.height, ratio: Math.min(devicePixelRatio, 2) }
      w.postMessage({ kind: 'start', canvas: off, shader: { ir: sh.ir, values: sh.values }, gpu: undefined, carried: undefined, isFrosted: true }, [off])
      w.postMessage({ kind: 'stage', stage: { ...report.shader.stage, isPictured: img.complete, composer: undefined, veils: [] } })
      w.postMessage({ kind: 'pause', isPaused: false })
    })
    report.steps.push('shader')
    if (report.shader.status !== 'drawn') throw new Error(`shader: ${report.shader.status}`)
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
  if (frameNo !== null) {
    // An Svg without isInteractive is an <img>, whose clock no script can pause. For a frame, each one is redrawn as a
    // sandboxed document of the same box, size and color scheme, which the capture can pause. Not the app's own path.
    report.t = input.t; report.svgTime = input.svgTime
    const roots = [document]
    for (let i = 0; i < roots.length; i++) for (const el of roots[i].querySelectorAll('*')) if (el.shadowRoot) roots.push(el.shadowRoot)
    const loads = []
    report.redrawnImages = 0
    for (const root of roots) for (const img of root.querySelectorAll('img[src^="data:image/svg+xml"]')) {
      const b = img.getBoundingClientRect(), st = cs(img)
      const frameEl = document.createElement('iframe')
      frameEl.setAttribute('sandbox', '')
      frameEl.style.cssText = img.style.cssText
      Object.assign(frameEl.style, { display: st.display === 'inline' ? 'inline-block' : st.display, width: `${b.width}px`, height: `${b.height}px`, border: '0', margin: st.margin, flex: st.flex, alignSelf: st.alignSelf, verticalAlign: st.verticalAlign, colorScheme: st.colorScheme })
      frameEl.srcdoc = `<!doctype html><style>:root{color-scheme:${st.colorScheme};color:#000}html,body{margin:0;height:100%;overflow:hidden;background:transparent}body>svg{display:block;width:100%;height:100%}</style>${decodeURIComponent(img.src.slice(img.src.indexOf(',') + 1))}`
      loads.push(new Promise((ok) => { frameEl.onload = ok; setTimeout(ok, 5000) }))
      img.replaceWith(frameEl)
      report.redrawnImages++
    }
    await Promise.all(loads)
    report.iframes = roots.reduce((n, r) => n + r.querySelectorAll('iframe').length, 0)
  }
  report.page = { dpr: devicePixelRatio, userAgent: navigator.userAgent, fonts: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}`) }
} catch (e) {
  report.failed = String(e?.stack ?? e).slice(0, 800)
}
document.getElementById('out').textContent = JSON.stringify(report, null, 1)
window.__report = report
await fetch(`/__save?name=${frameNo === null ? 'preview' : `frame-${frameNo.padStart(4, '0')}`}-${mode}`, { method: 'POST', body: JSON.stringify(report, null, 1) })
window.__done = true
