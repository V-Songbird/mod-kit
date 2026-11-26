#!/usr/bin/env node
// Desktop preview: draws a mod tree, and optionally a theme, with the code and stylesheets of the Claude Desktop app
// installed on this computer, in a loopback page, and saves PNGs and a measurement report.
// Each run extracts the app's renderer into a cache folder outside any Git work tree. No byte of the app is shipped
// with Mod Kit or written into a repository.
//
// usage: node preview.mjs [--tree <tree.json>] [--site pane|band] [--theme <theme.json>] [--settings user]
//                         [--shots <dir>] [--modes light,dark] [--size 1628x1348]
//                         [--asar <ion-dist.asar>] [--cache <dir>] [--port <n>]
// With --shots it captures each mode and exits; without it, it serves until stopped.
import { execFileSync, spawnSync } from 'node:child_process'
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
export function readInput({ tree, site = 'pane', theme, settings }) {
  if (!['pane', 'band'].includes(site)) throw new Error(`--site must be pane or band, not ${site}`)
  const json = (f) => JSON.parse(fs.readFileSync(f, 'utf8'))
  const t = tree ? json(tree) : null
  return { tree: t ? (t.type ? t : t.tree) : null, site, theme: theme ? json(theme) : null, settings: settings === 'user' ? readSettings() : null }
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
      const parts = []; let size = 0
      req.on('data', (d) => { size += d.length; if (size > 8e6) req.destroy(); else parts.push(d) })
      req.on('end', () => { fs.mkdirSync(saveDir, { recursive: true }); fs.writeFileSync(path.join(saveDir, `${name}.json`), Buffer.concat(parts)); res.writeHead(204).end() })
      return
    }
    if (req.method !== 'GET') return res.writeHead(405).end()
    if (url.pathname === '/__input.json') return res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' }).end(JSON.stringify(input))
    let rel
    try { rel = decodeURIComponent(url.pathname === '/' ? '/preview.html' : url.pathname) } catch { return res.writeHead(400).end() }
    const root = rel === '/preview.html' || rel === '/preview.js' ? PAGE : bundle
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
  const input = readInput({ tree: arg('tree'), site: arg('site'), theme: arg('theme'), settings: arg('settings') })
  const shots = arg('shots')
  const server = await startServer({ bundle, input, saveDir: shots ? path.resolve(shots) : path.join(cache, 'out'), port: Number(arg('port', shots ? 0 : 4173)) })
  const base = `http://127.0.0.1:${server.address().port}`
  if (!shots) { console.log(`${base}/preview.html?mode=light  ${base}/preview.html?mode=dark`); return }
  const modes = arg('modes', input.settings ? input.settings.mode : 'light,dark').split(',')
  const [w, h] = arg('size', '1628x1348').split('x').map(Number)
  try {
    for (const r of await capture(modes.map((m) => ({ url: `${base}/preview.html?mode=${m}`, name: `preview-${m}` })), path.resolve(shots), w, h)) console.log(`${r.file}\t${r.status}`)
  } finally {
    server.close()
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main(process.argv.slice(2)).catch((e) => { console.error(e.message); process.exit(1) })
}
