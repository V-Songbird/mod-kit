// Loads preview pages in a headless Chromium-family browser with a fresh profile, waits for each page to finish,
// and saves a PNG of each. Loopback URLs only. The browser is closed and its profile deleted afterwards.
import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const CANDIDATES = {
  win32: ['Microsoft/Edge/Application/msedge.exe', 'Google/Chrome/Application/chrome.exe'].flatMap((p) => [process.env['ProgramFiles(x86)'], process.env.ProgramFiles, process.env.LOCALAPPDATA].filter(Boolean).map((d) => path.join(d, p))),
  darwin: ['/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'],
  linux: ['/usr/bin/microsoft-edge', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'],
}

/** The browser to run: PREVIEW_BROWSER, else the first installed Edge, Chrome or Chromium. */
export function findBrowser() {
  if (process.env.PREVIEW_BROWSER) return process.env.PREVIEW_BROWSER
  const hit = (CANDIDATES[process.platform] ?? []).find((p) => fs.existsSync(p))
  if (!hit) throw new Error('No Edge, Chrome or Chromium found; set PREVIEW_BROWSER to a Chromium-family browser')
  return hit
}

/** Saves one PNG per entry of `shots` ({ url, name }) into `outDir` at width × height CSS px, scale 1. */
export async function capture(shots, outDir, width, height) {
  for (const { url } of shots) if (!/^http:\/\/127\.0\.0\.1:\d+\//.test(url)) throw new Error(`loopback only: ${url}`)
  fs.mkdirSync(outDir, { recursive: true })
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'mod-kit-preview-browser-'))
  const proc = spawn(findBrowser(), ['--headless=new', `--user-data-dir=${profile}`, '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-sync', '--force-device-scale-factor=1', `--window-size=${width},${height}`, '--hide-scrollbars', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] })
  const results = []
  let ws
  try {
    const wsUrl = await new Promise((ok, no) => {
      let buf = ''
      proc.stderr.on('data', (d) => { buf += d; const m = /ws:\/\/\S+/.exec(buf); if (m) ok(m[0]) })
      proc.on('exit', (code) => no(new Error(`browser exited with ${code} before DevTools started`)))
      setTimeout(() => no(new Error('no DevTools URL within 20 s')), 20000)
    })
    ws = new WebSocket(wsUrl)
    await new Promise((ok, no) => { ws.addEventListener('open', ok); ws.addEventListener('error', no) })
    let id = 0
    const pending = new Map()
    ws.addEventListener('message', (m) => { const j = JSON.parse(m.data); if (j.id && pending.has(j.id)) { pending.get(j.id)(j); pending.delete(j.id) } })
    const send = (method, params = {}, sessionId) => new Promise((ok, no) => { const i = ++id; pending.set(i, (j) => (j.error ? no(new Error(`${method}: ${j.error.message}`)) : ok(j.result))); ws.send(JSON.stringify({ id: i, method, params, sessionId })) })
    try {
      for (const { url, name } of shots) {
        const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
        const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false }, sessionId)
        await send('Page.navigate', { url }, sessionId)
        const done = await send('Runtime.evaluate', { expression: 'new Promise(r=>{const t=setInterval(()=>{if(window.__done){clearInterval(t);r(window.__report?.failed??"ok")}},200);setTimeout(()=>r("timeout"),30000)})', awaitPromise: true, returnByValue: true }, sessionId)
        await send('Runtime.evaluate', { expression: 'document.fonts.ready.then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))', awaitPromise: true }, sessionId)
        const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width, height, scale: 1 } }, sessionId)
        const file = path.join(outDir, `${name}.png`)
        fs.writeFileSync(file, Buffer.from(shot.data, 'base64'))
        results.push({ file, status: done.result.value })
        await send('Target.closeTarget', { targetId })
      }
    } finally {
      try { await send('Browser.close') } catch {}
    }
  } finally {
    ws?.close()
    try { process.platform === 'win32' ? execFileSync('taskkill', ['/T', '/F', '/PID', String(proc.pid)], { stdio: 'ignore' }) : proc.kill('SIGKILL') } catch {}
    await new Promise((ok) => setTimeout(ok, 500))
    try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5 }) } catch {}
  }
  return results
}
