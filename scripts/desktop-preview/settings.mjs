// Reads the Claude Desktop settings that change how the app draws, from this computer, read-only.
// Only the keys listed here are kept: config.json and the renderer's localStorage also hold account ids and OAuth
// tokens, which are never copied into the result. Nothing is sent anywhere; the preview serves it on loopback only.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

/** Desktop's data folder. Windows is verified; the macOS and Linux paths are the usual Electron ones, not verified. */
export function defaultAppData() {
  if (process.platform === 'win32') return path.join(process.env.APPDATA ?? path.join(os.homedir(), 'AppData', 'Roaming'), 'Claude')
  if (process.platform === 'darwin') return path.join(os.homedir(), 'Library', 'Application Support', 'Claude')
  return path.join(process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), '.config'), 'Claude')
}

// localStorage keys the renderer reads for its look (CODE, Desktop 6.28899): the interface font, more contrast, the
// renderer's color mode, the reply font, and the active mod theme's palette that the app keeps to paint it at boot.
export const LOCAL_KEYS = ['persisted.interface-font', 'LSS-persisted.interface-font', 'LSS-persisted.kind-breeze', 'persisted.kind-breeze',
  'LSS-userThemeMode', 'LSS-customStyles:chatFont', 'LSS-appearance:mod-palette', 'LSS-appearance:mod-palette-more-contrast']
export const CONFIG_KEYS = ['userThemeMode', 'locale']

/** Snappy raw block decoder, for compressed table blocks. */
export function unsnappy(src) {
  let p = 0, len = 0, shift = 0
  for (;;) { const b = src[p++]; len |= (b & 0x7f) << shift; if (b < 0x80) break; shift += 7 }
  const out = Buffer.alloc(len); let o = 0
  while (p < src.length) {
    const tag = src[p++], t = tag & 3
    if (t === 0) {
      let n = tag >> 2
      if (n >= 60) { const k = n - 59; n = 0; for (let j = 0; j < k; j++) n |= src[p++] << (8 * j) }
      n += 1; src.copy(out, o, p, p + n); p += n; o += n
    } else {
      let n, off
      if (t === 1) { n = ((tag >> 2) & 7) + 4; off = ((tag >> 5) << 8) | src[p++] }
      else if (t === 2) { n = (tag >> 2) + 1; off = src.readUInt16LE(p); p += 2 }
      else { n = (tag >> 2) + 1; off = src.readUInt32LE(p); p += 4 }
      for (let j = 0; j < n; j++, o++) out[o] = out[o - off]
    }
  }
  return out
}
const varint = (b, p) => { let v = 0, s = 0, x; do { x = b[p++]; v += (x & 0x7f) * 2 ** s; s += 7 } while (x & 0x80); return [v, p] }

/** Entries of one table block: key with its 8-byte sequence trailer, and value. */
function blockEntries(b) {
  const restarts = b.readUInt32LE(b.length - 4), end = b.length - 4 - restarts * 4, out = []
  let p = 0, last = Buffer.alloc(0)
  while (p < end) {
    let shared, nonShared, vlen;
    [shared, p] = varint(b, p); [nonShared, p] = varint(b, p); [vlen, p] = varint(b, p)
    const key = Buffer.concat([last.subarray(0, shared), b.subarray(p, p + nonShared)]); p += nonShared
    out.push([key, b.subarray(p, p + vlen)]); p += vlen; last = key
  }
  return out
}
const readBlock = (f, off, size) => (f[off + size] === 1 ? unsnappy(f.subarray(off, off + size)) : f.subarray(off, off + size))

/** All entries of an .ldb table. */
export function tableEntries(f) {
  const foot = f.subarray(f.length - 48)
  let p = 0, v, io, is;
  [v, p] = varint(foot, p); [v, p] = varint(foot, p) // metaindex handle, unused
  ;[io, p] = varint(foot, p); [is, p] = varint(foot, p)
  const out = []
  for (const [, h] of blockEntries(readBlock(f, io, is))) {
    let q = 0, bo, bs; [bo, q] = varint(h, q); [bs, q] = varint(h, q)
    for (const [k, val] of blockEntries(readBlock(f, bo, bs))) {
      const tag = k.readBigUInt64LE(k.length - 8)
      out.push({ key: k.subarray(0, k.length - 8), seq: tag >> 8n, del: (tag & 0xffn) === 0n, value: val })
    }
  }
  return out
}

/** All puts and deletes of a .log file: 32 KB blocks of records that hold write batches. */
export function logEntries(f) {
  const out = [], chunks = []
  const batch = (b) => {
    let seq = b.readBigUInt64LE(0), p = 12
    while (p < b.length) {
      const t = b[p++]; let kl, vl
      ;[kl, p] = varint(b, p); const key = b.subarray(p, p + kl); p += kl
      if (t === 1) { [vl, p] = varint(b, p); out.push({ key, seq, del: false, value: b.subarray(p, p + vl) }); p += vl }
      else out.push({ key, seq, del: true, value: null })
      seq++
    }
  }
  for (let blk = 0; blk < f.length; blk += 32768) {
    let p = blk
    while (p + 7 <= Math.min(blk + 32768, f.length)) {
      const len = f.readUInt16LE(p + 4), type = f[p + 6]
      if (type === 0 && len === 0) break
      chunks.push(f.subarray(p + 7, p + 7 + len))
      if (type === 1 || type === 4) { batch(Buffer.concat(chunks)); chunks.length = 0 }
      p += 7 + len
    }
  }
  return out
}

/** The listed localStorage keys, newest value per origin and key. `names` collects every key name seen, for --keys. */
export function localStorageValues(ldb, names) {
  const best = new Map()
  for (const name of fs.readdirSync(ldb).filter((f) => /\.(ldb|log)$/.test(f))) {
    let entries
    try { const f = fs.readFileSync(path.join(ldb, name)); entries = name.endsWith('.log') ? logEntries(f) : tableEntries(f) } catch { continue }
    for (const e of entries) {
      if (e.key[0] !== 0x5f) continue // "_" + origin + "\0" + key
      const z = e.key.indexOf(0)
      if (z < 0) continue
      const origin = e.key.subarray(1, z).toString('latin1'), kb = e.key.subarray(z + 1)
      const k = kb[0] === 1 ? kb.subarray(1).toString('latin1') : kb[0] === 0 ? kb.subarray(1).toString('utf16le') : null
      names?.add(`${origin} ${k}`)
      if (!LOCAL_KEYS.includes(k)) continue
      const id = `${origin}|${k}`
      if (best.has(id) && best.get(id).seq >= e.seq) continue
      const value = e.del ? null : e.value[0] === 1 ? e.value.subarray(1).toString('latin1') : e.value.subarray(1).toString('utf16le')
      best.set(id, { seq: e.seq, origin, key: k, value })
    }
  }
  return [...best.values()].map(({ origin, key, value }) => ({ origin, key, value }))
}

function osDark() {
  if (process.platform !== 'win32') return null
  try {
    return /0x0\b/.test(execFileSync('reg', ['query', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize', '/v', 'AppsUseLightTheme'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }))
  } catch { return null }
}

/** The look settings of the Desktop install whose data folder is `dir`. */
export function readSettings(dir = defaultAppData(), { names, dark = osDark() } = {}) {
  const pick = (o, ks) => Object.fromEntries(ks.filter((k) => o && k in o).map((k) => [k, o[k]]))
  const readJson = (f) => { try { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) } catch { return null } }
  const config = pick(readJson('config.json'), CONFIG_KEYS)
  const ldb = path.join(dir, 'Local Storage', 'leveldb')
  const local = fs.existsSync(ldb) ? localStorageValues(ldb, names) : []
  const valueOf = (k) => local.filter((x) => x.key.endsWith(k) && x.value !== null).map((x) => x.value)[0]
  // Stored values may be JSON-wrapped by the app's storage helper.
  const unwrap = (v) => { try { const j = JSON.parse(v); return typeof j === 'object' && j ? j.value ?? null : j } catch { return v } }
  const fontPref = valueOf('persisted.interface-font')
  // No stored choice means "default", which inside the desktop app is the system font (CODE, 6.28899).
  const font = fontPref == null || unwrap(fontPref) === 'default' ? 'system' : unwrap(fontPref)
  const palette = unwrap(valueOf('appearance:mod-palette') ?? 'null')
  const mode = config.userThemeMode === 'dark' || config.userThemeMode === 'light' ? config.userThemeMode : dark ? 'dark' : 'light'
  return {
    found: fs.existsSync(dir),
    mode, modeSetting: config.userThemeMode ?? null, osDark: dark,
    font, contrast: unwrap(valueOf('kind-breeze')) === 'on' ? 'more' : 'normal',
    chatFont: unwrap(valueOf('customStyles:chatFont') ?? 'null'),
    palette: palette && typeof palette === 'object' ? palette : null,
    locale: config.locale ?? null,
    keysFound: local.map(({ key }) => key),
  }
}
