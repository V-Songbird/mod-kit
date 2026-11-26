// Read-only reader for Electron's asar archive format, stdlib only.
import fs from 'node:fs'
import path from 'node:path'

/** Copies every packed file of `archive` into `outDir`. Unpacked files live outside the archive and are skipped. */
export function extractAsar(archive, outDir) {
  const fd = fs.openSync(archive, 'r')
  try {
    const head = Buffer.alloc(16)
    fs.readSync(fd, head, 0, 16, 0)
    const headerSize = head.readUInt32LE(4)
    const strLen = head.readUInt32LE(12)
    const json = Buffer.alloc(strLen)
    fs.readSync(fd, json, 0, strLen, 16)
    const base = 8 + headerSize
    const root = path.resolve(outDir)
    let count = 0
    const walk = (node, prefix) => {
      for (const [name, entry] of Object.entries(node.files ?? {})) {
        const rel = prefix ? `${prefix}/${name}` : name
        if (entry.files) { walk(entry, rel); continue }
        if (entry.unpacked) continue
        const out = path.resolve(root, rel)
        if (!out.startsWith(root + path.sep)) throw new Error(`asar entry escapes the output folder: ${rel}`)
        const buf = Buffer.alloc(entry.size ?? 0)
        fs.readSync(fd, buf, 0, buf.length, base + Number(entry.offset))
        fs.mkdirSync(path.dirname(out), { recursive: true })
        fs.writeFileSync(out, buf)
        count++
      }
    }
    walk(JSON.parse(json.toString('utf8')), '')
    return count
  } finally {
    fs.closeSync(fd)
  }
}
