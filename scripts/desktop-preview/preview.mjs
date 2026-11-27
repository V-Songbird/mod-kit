#!/usr/bin/env node
// Desktop preview: draws a mod tree, and optionally a theme, with the code and stylesheets of the Claude Desktop app
// installed on this computer, in a loopback page, and saves PNGs and a measurement report.
// Each run extracts the app's renderer into a cache folder outside any Git work tree. No byte of the app is shipped
// with Mod Kit or written into a repository.
//
// usage: node preview.mjs [--tree <tree.json>] [--site pane|band] [--theme <theme.json>] [--settings user]
//                         [--timeline <timeline.json> | --times <ms,ms,...>] [--reduced-motion] [--video]
//                         [--shots <dir>] [--modes light,dark] [--size 1628x1348]
//                         [--asar <ion-dist.asar>] [--cache <dir>] [--port <n>]
//                         [--shader <plugin dir> [--frames <n,n,...> | --click <x,y,tMs[,holdMs]> | --measure <ms>]]
// With --shots it captures each mode and exits; without it, it serves until stopped.
// With --timeline or --times it captures one PNG per frame, with every animation paused at the frame's time.
// With --shader it asks the CLI for the Shader the plugin's Backdrop hook draws and plays it in the app's own worker.
// With --frames it steps that worker on a fixed clock and saves the canvas at each frame number after the first drawn
// one, as shader-<mode>-<n>.png, with shader-frames-<mode>.json holding each frame's time, size, center and hash.
// With --click it presses a pointer at x,y (CSS px of the stage) at tMs on the page clock, holds it holdMs (100 when
// left out), then releases and lifts it, as PointerBackdrop does; the report keeps the frost cell under it over time.
// With --measure <ms> it plays a patched copy of the worker on the real clock for that long after the first drawn frame
// and keeps the player's own fields in the report's shader.runtime, beside validate's static cost as the control.
import { execFileSync, spawn, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { extractAsar } from './asar.mjs'
import { capture } from './capture.mjs'
import { locate } from './locate.mjs'
import { readSettings } from './settings.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const PAGE = path.join(here, 'page')

/** The installed renderer archive and the app version. The Windows Store install is verified; others are not. */
export function findAsar(given) {
  if (given) {
    if (!fs.existsSync(given)) throw new Error(`not found: ${given}`)
    return { asar: given, version: /Claude_([\d.]+)_/.exec(given)?.[1] ?? `given-${Math.round(fs.statSync(given).mtimeMs)}` }
  }
  if (process.platform === 'win32') {
    const out = execFileSync('powershell', ['-NoProfile', '-Command', '(Get-AppxPackage -Name Claude | Select-Object -First 1 | ForEach-Object { $_.Version + "|" + $_.InstallLocation })'], { encoding: 'utf8' }).trim()
    const [version, loc] = out.split('|')
    const asar = loc && path.join(loc, 'app', 'resources', 'ion-dist.asar')
    if (!asar || !fs.existsSync(asar)) throw new Error('No Microsoft Store install of Claude Desktop found. Pass --asar <path to ion-dist.asar>')
    return { asar, version }
  }
  if (process.platform === 'darwin') {
    // Not verified: the usual Electron layout of /Applications/Claude.app.
    const asar = '/Applications/Claude.app/Contents/Resources/ion-dist.asar'
    if (!fs.existsSync(asar)) throw new Error(`Not found: ${asar}. Pass --asar <path to ion-dist.asar>`)
    const plist = '/Applications/Claude.app/Contents/Info.plist'
    const version = fs.existsSync(plist) ? /CFBundleShortVersionString<\/key>\s*<string>([^<]+)/.exec(fs.readFileSync(plist, 'utf8'))?.[1] : null
    return { asar, version: version ?? 'unknown' }
  }
  throw new Error(`No known Claude Desktop install on ${process.platform}. Pass --asar <path to ion-dist.asar>`)
}

/** Refuses a cache inside a Git work tree, so no extracted file can be committed by accident. */
export function assertOutsideGit(dir) {
  let probe = path.resolve(dir)
  while (!fs.existsSync(probe)) probe = path.dirname(probe)
  const r = spawnSync('git', ['-C', probe, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' })
  if (r.status === 0) throw new Error(`cache ${dir} is inside the Git work tree ${r.stdout.trim()}; pick a --cache outside any repository`)
}

/** Extracts the renderer once per version and finds the pieces the page calls. */
export function prepareBundle({ asar, version, cache = path.join(os.tmpdir(), 'mod-kit-desktop-preview', version) }) {
  assertOutsideGit(cache)
  const bundle = path.join(cache, 'bundle')
  if (!fs.existsSync(path.join(bundle, 'index.html'))) {
    fs.mkdirSync(bundle, { recursive: true })
    extractAsar(asar, bundle)
  }
  return { cache, bundle, found: locate(bundle) }
}

/** Reads the inputs: a tree file holds a node or { tree }, a theme file holds the $.theme.set argument plus an optional backdropTree. */
export function readInput({ tree, site, theme, settings, timeline, times }) {
  const json = (f) => JSON.parse(fs.readFileSync(f, 'utf8'))
  const tl = timeline ? json(timeline) : null
  site = site ?? tl?.site ?? 'pane'
  if (!['pane', 'band'].includes(site)) throw new Error(`--site must be pane or band, not ${site}`)
  const t = tree ? json(tree) : null
  const input = { tree: t ? (t.type ? t : t.tree) : null, site, theme: theme ? json(theme) : null, settings: settings === 'user' ? readSettings() : null }
  if (tl) input.frames = resolveTimeline({ tree: input.tree, theme: input.theme, ...tl })
  else if (times) input.frames = resolveTimeline({ tree: input.tree, theme: input.theme, frames: times.split(',').map((s) => ({ t: Number(s) })) })
  return input
}

/**
 * Resolves a timeline into one full input per frame. A frame holds `t`, ms on the mod's clock, and `tree` or `theme`
 * when they changed; what it leaves out carries over. A tree that differs from the one before is a redraw, which
 * restarts every animation, so `svgTime` counts from the tree's last change. One given again unchanged is no redraw.
 * The theme's scene is drawn still, so a theme change moves no clock.
 */
export function resolveTimeline({ tree = null, theme = null, frames }) {
  if (!Array.isArray(frames) || frames.length === 0) throw new Error('a timeline needs a non-empty frames list')
  let since = 0 // a tree given outside the frames is drawn at 0
  return frames.map((f, i) => {
    if (!Number.isFinite(f.t) || f.t < 0 || (i > 0 && f.t < frames[i - 1].t)) throw new Error(`frame ${i}: t must be a number of ms, 0 or more, not below the frame before`)
    if ('tree' in f) { const next = f.tree?.type ? f.tree : f.tree?.tree ?? null; if (JSON.stringify(next) !== JSON.stringify(tree)) { tree = next; since = f.t } }
    if ('theme' in f) theme = f.theme
    return { t: f.t, svgTime: f.t - since, tree, theme }
  })
}

/** --frames: frame numbers after the Shader's first drawn frame, whole, 0 or more, each once. */
export function parseFrames(text) {
  const parts = text.split(',').map((s) => s.trim()), list = parts.map(Number)
  if (parts.some((s) => !/^\d+$/.test(s)) || new Set(list).size !== list.length) throw new Error(`--frames takes distinct whole frame numbers, 0 or more, such as 0,30,60; not ${text}`)
  return list
}

/** --click: x,y in CSS px of the stage, tMs on the page clock, and an optional holdMs, each a number 0 or more. */
export function parseClick(text) {
  const parts = text.split(',').map((s) => s.trim())
  if (parts.length < 3 || parts.length > 4 || parts.some((s) => !/^\d+(\.\d+)?$/.test(s))) throw new Error(`--click takes x,y,tMs or x,y,tMs,holdMs, numbers 0 or more, such as 480,300,2000,500; not ${text}`)
  const [x, y, t, hold = 100] = parts.map(Number)
  return { x, y, t, hold }
}

/**
 * The ffmpeg concat list that shows each frame until the next one's t; the last frame keeps the gap before it.
 * Each frame repeats once per tick, the largest step that divides every gap, at most 60 a second, so a fixed frame
 * rate holds every gap exactly; ffmpeg drops a lone entry's duration otherwise. `seconds` is the length to cut at.
 */
export function concatList(files, times) {
  const gaps = times.map((t, i) => (i + 1 < times.length ? times[i + 1] - t : times.length > 1 ? t - times[i - 1] : 1000) || 1)
  const gcd = (a, b) => (b ? gcd(b, a % b) : a)
  const tick = Math.max(gaps.reduce(gcd), 1000 / 60)
  const line = (f) => `file '${f.replaceAll('\\', '/').replaceAll("'", "'\\''")}'\nduration ${(tick / 1000).toFixed(6)}`
  const body = files.flatMap((f, i) => Array.from({ length: Math.max(1, Math.round(gaps[i] / tick)) }, () => line(f)))
  return { list: `${[...body, body.at(-1).split('\n')[0]].join('\n')}\n`, fps: 1000 / tick, seconds: (body.length * tick) / 1000 }
}

/** Joins one mode's frames into an MP4 with ffmpeg from the PATH; returns null when there is none. */
export function makeVideo(files, times, out) {
  if (spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status !== 0) return null
  const list = `${out}.txt`
  const { list: text, fps, seconds } = concatList(files, times)
  fs.writeFileSync(list, text)
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-vf', 'format=yuv420p', '-fps_mode', 'cfr', '-r', String(fps), '-t', String(seconds), out], { encoding: 'utf8' })
  fs.rmSync(list, { force: true })
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${r.stderr.trim().slice(0, 400)}`)
  return out
}

/**
 * Asks the CLI for the Shader a plugin's Backdrop hook draws, as the desktop app does: ui_attach naming Theme and
 * Shader, then ui_render of the Theme backdrop. It sends no user message, so no model turn runs, and it reads no user
 * settings, so only the given plugin's hooks answer. The plugin is loaded
 * from a temporary copy, so nothing the CLI writes lands in its folder. `command` replaces `claude` in tests.
 * Returns { ir, values, svg, cli }.
 */
export async function fetchShader({ pluginDir, theme = null, command = ['claude'], timeoutMs = 60000 }) {
  const manifest = path.join(pluginDir, '.claude-plugin', 'plugin.json')
  if (!fs.existsSync(manifest)) throw new Error(`--shader needs a plugin folder with .claude-plugin/plugin.json: ${pluginDir}`)
  const name = JSON.parse(fs.readFileSync(manifest, 'utf8')).name
  const props = { ...theme?.backdrop, scene: theme?.backdrop?.scene ?? name, plugin: theme?.backdrop?.plugin ?? name }
  const [cmd, ...pre] = command
  const cli = execFileSync(cmd, [...pre, '--version'], { encoding: 'utf8' }).trim()
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'mod-kit-preview-shader-'))
  const copy = path.join(work, name.replace(/[^\w-]/g, '_'))
  fs.cpSync(pluginDir, copy, { recursive: true, filter: (f) => !/[\\/](\.git|node_modules)$/.test(f) })
  // Project settings only, in an empty folder: the user's enabled plugins stay off, so an installed theme cannot answer
  // for this one. --bare would turn off the --plugin-dir mod too (2.1.330).
  const p = spawn(cmd, [...pre, '-p', '--setting-sources', 'project', '--input-format', 'stream-json', '--output-format', 'stream-json', '--verbose', '--no-session-persistence', '--plugin-dir', copy], { cwd: work, stdio: ['pipe', 'pipe', 'pipe'] })
  const waiting = new Map()
  let buf = '', err = ''
  const gone = new Promise((_, no) => {
    p.on('error', no)
    p.on('exit', (code) => no(new Error(`the CLI exited with ${code} before it answered: ${err.trim().slice(-400)}`)))
    setTimeout(() => no(new Error(`the CLI did not answer within ${timeoutMs / 1000} s`)), timeoutMs).unref()
  })
  gone.catch(() => {})
  p.stderr.on('data', (d) => { err += d })
  p.stdout.on('data', (d) => {
    buf += d
    for (let i; (i = buf.indexOf('\n')) >= 0;) {
      const line = buf.slice(0, i); buf = buf.slice(i + 1)
      let j; try { j = JSON.parse(line) } catch { continue }
      const r = j.type === 'control_response' && j.response
      if (r && waiting.has(r.request_id)) { waiting.get(r.request_id)(r); waiting.delete(r.request_id) }
    }
  })
  const ask = (id, request) => {
    const answer = new Promise((ok) => waiting.set(id, ok))
    p.stdin.write(`${JSON.stringify({ type: 'control_request', request_id: id, request })}\n`)
    return Promise.race([answer, gone]).then((r) => { if (r.subtype !== 'success') throw new Error(`the CLI refused ${request.subtype}: ${r.error ?? JSON.stringify(r).slice(0, 300)}`); return r.response })
  }
  try {
    const client = { surface: 'desktop', client_id: 'mod-kit-preview' }
    await ask('init', { subtype: 'initialize' })
    await ask('attach', { subtype: 'ui_attach', ...client, draws: ['Theme', 'Shader'] })
    const { tree } = await ask('backdrop', { subtype: 'ui_render', ...client, component: 'Theme', instance_id: 'backdrop', props })
    if (tree?.type !== 'Shader' || !tree.props?.ir) throw new Error(`the Backdrop hook of ${name} answered ${tree?.type ?? 'nothing'}, not a Shader, for props ${JSON.stringify(props)}`)
    const svg = tree.children?.find((c) => c?.type === 'Svg')?.props?.source
    if (typeof svg !== 'string') throw new Error(`the Shader of ${name} holds no Svg`)
    return { ir: tree.props.ir, values: tree.props.values ?? [], svg, cli }
  } finally {
    p.stdin.end()
    try { process.platform === 'win32' ? execFileSync('taskkill', ['/T', '/F', '/PID', String(p.pid)], { stdio: 'ignore' }) : p.kill('SIGKILL') } catch {}
    await new Promise((ok) => setTimeout(ok, 500))
    fs.rmSync(work, { recursive: true, force: true, maxRetries: 5 })
  }
}

/** --measure: ms of real clock to watch the player after its first drawn frame, 1000 to 20000, as the page waits 30 s. */
export function parseMeasure(text) {
  const ms = /^\d+$/.test(text?.trim() ?? '') ? Number(text) : NaN
  if (!(ms >= 1000 && ms <= 20000)) throw new Error(`--measure takes whole ms from 1000 to 20000, such as 5000; not ${text}`)
  return ms
}

/**
 * The control for --measure: the static cost `claude plugin validate` prints for each shader file, kept as printed,
 * with each pass's frame ms on the weak and fast GPU classes. An estimate, never the same figure as a measured frame.
 */
export function validateCost(pluginDir, command = ['claude']) {
  const [cmd, ...pre] = command
  const r = spawnSync(cmd, [...pre, 'plugin', 'validate', pluginDir], { encoding: 'utf8' })
  const lines = `${r.stdout}`.split(/\r?\n/).map((l) => l.replace(/^\s*❯\s*/, '').trim()).filter((l) => /^shader \S+:/.test(l))
  const passes = lines.flatMap((l) => { const m = /pass (\d+) .*?: frame ms ([\d.]+) weak, ([\d.]+) fast/.exec(l); return m ? [{ pass: Number(m[1]), weakMs: Number(m[2]), fastMs: Number(m[3]) }] : [] })
  return { source: 'claude plugin validate, a static estimate', exit: r.status, lines, passes }
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon' }

/** Serves the page, the extracted bundle and the inputs on 127.0.0.1 only, and answers only requests addressed to it. */
export function startServer({ bundle, input, saveDir, port = 0 }) {
  const server = http.createServer((req, res) => {
    const { port: p } = server.address()
    if (req.headers.host !== `127.0.0.1:${p}` && req.headers.host !== `localhost:${p}`) return res.writeHead(403).end()
    const url = new URL(req.url, `http://127.0.0.1:${p}`)
    if (req.method === 'POST' && url.pathname === '/__save') {
      const name = (url.searchParams.get('name') ?? 'report').replace(/[^a-z0-9-]/gi, '')
      const ext = url.searchParams.get('ext') === 'png' ? 'png' : 'json'
      const parts = []; let size = 0
      req.on('data', (d) => { size += d.length; if (size > 8e6) req.destroy(); else parts.push(d) })
      req.on('end', () => { fs.mkdirSync(saveDir, { recursive: true }); fs.writeFileSync(path.join(saveDir, `${name}.${ext}`), Buffer.concat(parts)); res.writeHead(204).end() })
      return
    }
    if (req.method !== 'GET') return res.writeHead(405).end()
    if (url.pathname === '/__input.json') {
      const { frames, ...rest } = input
      const f = frames?.[Number(url.searchParams.get('frame'))]
      return res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' }).end(JSON.stringify(f ? { ...rest, ...f } : rest))
    }
    // The frame-mode worker: shader-clock.js first, then the app's worker, in one module worker.
    if (url.pathname === '/__preview-shader-clock.js' && input.shader) {
      return res.writeHead(200, { 'content-type': TYPES['.js'], 'cache-control': 'no-store' }).end(`import '/shader-clock.js'\nimport ${JSON.stringify(input.shader.worker)}\n`)
    }
    let rel
    try { rel = decodeURIComponent(url.pathname === '/' ? '/preview.html' : url.pathname) } catch { return res.writeHead(400).end() }
    const root = ['/preview.html', '/preview.js', '/shader-clock.js'].includes(rel) ? PAGE : bundle
    const file = path.resolve(root, `.${rel}`)
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end()
    fs.readFile(file, (err, buf) => {
      if (err) return res.writeHead(404).end('not found')
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' }).end(buf)
    })
  })
  return new Promise((ok) => server.listen(port, '127.0.0.1', () => ok(server)))
}

async function main(argv) {
  const arg = (k, d) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : d }
  const { asar, version } = findAsar(arg('asar'))
  const { cache, bundle, found } = prepareBundle({ asar, version, cache: arg('cache') })
  console.log(`Claude Desktop ${version}: engine ${found.engineFile}, sites ${found.sitesFile}, theme ${found.themeFile}`)
  console.log(`cache ${cache}`)
  const input = readInput({ tree: arg('tree'), site: arg('site'), theme: arg('theme'), settings: arg('settings'), timeline: arg('timeline'), times: arg('times') })
  if (arg('frames') && !arg('shader')) throw new Error('--frames needs --shader')
  if (arg('click') && !arg('shader')) throw new Error('--click needs --shader')
  if (arg('click') && arg('frames')) throw new Error('--click takes no --frames: the page clock runs free')
  if (arg('measure') && !arg('shader')) throw new Error('--measure needs --shader')
  if (arg('measure') && (arg('frames') || arg('click'))) throw new Error('--measure takes no --frames or --click: it watches the player on the real clock, unpressed')
  if (arg('shader')) {
    if (input.frames) throw new Error('--shader takes no --timeline or --times')
    if (!found.shader) throw new Error('anchor "shader-worker" not found: no PointerBackdrop chunk names an existing /assets/shader-worker-*.js in this Desktop build')
    const measure = arg('measure') ? parseMeasure(arg('measure')) : null
    if (measure && !found.shader.metrics) throw new Error(found.shader.metricsMissing)
    const s = await fetchShader({ pluginDir: path.resolve(arg('shader')), theme: input.theme })
    input.shader = { ...s, worker: measure ? found.shader.metrics : found.shader.worker, desktop: version, frames: arg('frames') ? parseFrames(arg('frames')) : null, click: arg('click') ? parseClick(arg('click')) : null, measure, control: measure ? validateCost(path.resolve(arg('shader'))) : null }
    console.log(`shader worker ${found.shader.worker} (started by ${found.shader.backdropFile}), ${s.cli}`)
  }
  const shots = arg('shots')
  const server = await startServer({ bundle, input, saveDir: shots ? path.resolve(shots) : path.join(cache, 'out'), port: Number(arg('port', shots ? 0 : 4173)) })
  const base = `http://127.0.0.1:${server.address().port}`
  if (!shots) { console.log(`${base}/preview.html?mode=light  ${base}/preview.html?mode=dark`); return }
  const modes = arg('modes', input.settings ? input.settings.mode : 'light,dark').split(',')
  const [w, h] = arg('size', '1628x1348').split('x').map(Number)
  const reducedMotion = argv.includes('--reduced-motion')
  const out = path.resolve(shots)
  const list = input.frames
    ? modes.flatMap((m) => input.frames.map((f, i) => ({ url: `${base}/preview.html?mode=${m}&frame=${i}`, name: `frame-${String(i).padStart(4, '0')}-${m}`, mode: m, t: f.t, svgTime: f.svgTime })))
    : modes.map((m) => ({ url: `${base}/preview.html?mode=${m}`, name: `preview-${m}`, mode: m }))
  let failed = false
  try {
    const results = await capture(list, out, w, h, { reducedMotion })
    for (const r of results) { console.log(`${r.file}\t${r.status}\t${r.sha256}`); failed ||= r.status !== 'ok' }
    if (input.shader) for (const m of modes) {
      const s = JSON.parse(fs.readFileSync(path.join(out, `preview-${m}.json`), 'utf8')).shader
      for (const f of s?.frames ?? []) {
        f.sha256 = createHash('sha256').update(fs.readFileSync(path.join(out, f.file))).digest('hex')
        console.log(`${path.join(out, f.file)}\tframe ${f.n} at ${f.t} ms${f.naps ? ` (nominal: ${f.naps} naps)` : ''}\tsize ${f.size.join('x')}\tcenter ${f.pixel.join(',')}\t${f.sha256}`)
      }
      if (s?.frames) fs.writeFileSync(path.join(out, `shader-frames-${m}.json`), JSON.stringify(s.frames, null, 1))
      if (s?.frames && s.frames.length !== input.shader.frames.length) failed = true
      if (s?.click) console.log(`click ${m}: at ${s.click.x},${s.click.y}, pressed ${s.click.pressedAt} ms, lifted ${s.click.liftedAt} ms, frost cell ${s.click.cell.join(',')}: ${s.click.samples.map((x) => `${x.at} ${x.phase} ${x.rgba.join(',')}`).join('; ')}`)
      const rt = s?.runtime
      if (rt) console.log(`runtime ${m} (real clock, ${rt.windowMs} ms): ms per frame ${rt.msPerFrame ? `${rt.msPerFrame.mean} mean, ${rt.msPerFrame.max} max` : `none (${rt.msPerFrameMissing})`}; fps ${rt.fps} on the player's clock, ${rt.fpsWall} on the real one; sharpness ${rt.sharpness.last} (${rt.sharpness.min} to ${rt.sharpness.max}); rests ${rt.rests}; restarts ${rt.restarts.count}; stops ${rt.stops.join(',') || 'none'}; at ${rt.stage.width}x${rt.stage.height} ratio ${rt.stage.ratio}, GPU ${rt.renderer}, Desktop ${rt.desktop}, ${rt.cli}\ncontrol ${m} (validate, a static estimate, not the same figure): ${rt.control.passes.map((p) => `pass ${p.pass} ${p.weakMs} ms weak, ${p.fastMs} ms fast`).join('; ') || rt.control.lines.join('; ') || 'no shader line printed'}`)
      console.log(`shader ${m}: ${s?.status}; size ${JSON.stringify(s?.size)}, sharpness ${s?.sharpness} at ratio ${s?.stage?.ratio}; driver ${s?.driver}; Desktop ${s?.desktop}; messages ${s?.messages.map((x) => JSON.stringify(x.msg ?? x.error)).join(' ')}; frost mean ${s?.frost?.mean.join(',') ?? 'none'}; GPU ${s?.gpu}`)
    }
    if (input.frames) {
      fs.writeFileSync(path.join(out, 'frames.json'), JSON.stringify({ reducedMotion, frames: results }, null, 1))
      if (argv.includes('--video')) for (const m of modes) {
        const mine = results.filter((r) => r.mode === m)
        const video = makeVideo(mine.map((r) => r.file), mine.map((r) => r.t), path.join(out, `video-${m}.mp4`))
        console.log(video ?? 'ffmpeg is not on the PATH: no video, the PNG frames stay')
      }
    }
  } finally {
    server.close()
  }
  if (failed) process.exitCode = 1
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main(process.argv.slice(2)).catch((e) => { console.error(e.message); process.exit(1) })
}
