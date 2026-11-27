// Loads preview pages in a headless Chromium-family browser with a fresh profile, waits for each page to finish,
// and saves a PNG of each. Loopback URLs only. The browser is closed and its profile deleted afterwards.
import { spawn, execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
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

// Pauses every animation in one document and its shadow roots at `ms`, then reads the clocks back. SMIL: each <svg>'s
// pauseAnimations and setCurrentTime. CSS and Web Animations: getAnimations, pause, currentTime. It reports each
// animated attribute's value as drawn, and whether reduced motion matches in that document.
const SEEK = (ms) => `(() => {
  const roots = [document], out = { svg: [], css: [], smil: [], reduced: matchMedia('(prefers-reduced-motion: reduce)').matches }
  for (let i = 0; i < roots.length; i++) for (const el of roots[i].querySelectorAll('*')) if (el.shadowRoot) roots.push(el.shadowRoot)
  for (const root of roots) {
    for (const svg of root.querySelectorAll('svg')) { if (svg.ownerSVGElement) continue; svg.pauseAnimations(); svg.setCurrentTime(${ms} / 1000); out.svg.push(svg.getCurrentTime() * 1000) }
    for (const a of root.getAnimations()) { a.pause(); a.currentTime = ${ms}; out.css.push(Number(a.currentTime)) }
    for (const an of root.querySelectorAll('animate, animateTransform, animateMotion, set')) {
      const name = an.getAttribute('attributeName'), el = an.targetElement
      out.smil.push({ id: el?.id || null, attribute: name, value: (el && name && el[name]?.animVal?.value) ?? null })
    }
  }
  return out
})()`
const SETTLE = 'new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(true))))'

/**
 * Saves one PNG per entry of `shots` ({ url, name, svgTime? }) into `outDir` at width × height CSS px, scale 1.
 * prefers-reduced-motion is set explicitly, `reduce` with `reducedMotion`. A shot with `svgTime` has every animation of
 * the page and of each frame it holds paused at that time; the shot fails when a clock reads back another time.
 */
export async function capture(shots, outDir, width, height, { reducedMotion = false, browserArgs = [] } = {}) {
  for (const { url } of shots) if (!/^http:\/\/127\.0\.0\.1:\d+\//.test(url)) throw new Error(`loopback only: ${url}`)
  fs.mkdirSync(outDir, { recursive: true })
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'mod-kit-preview-browser-'))
  const proc = spawn(findBrowser(), ['--headless=new', `--user-data-dir=${profile}`, '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-sync', '--force-device-scale-factor=1', `--window-size=${width},${height}`, '--hide-scrollbars', ...browserArgs, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] })
  const results = []
  let ws
  try {
    const wsUrl = await new Promise((ok, no) => {
      let buf = ''
      proc.stderr.on('data', (d) => { buf += d; const m = /ws:\/\/\S+/.exec(buf); if (m) ok(m[0]) })
      proc.on('exit', (code, signal) => no(new Error(`browser exited with ${code ?? signal} before DevTools started: ${buf.trim().slice(-400)}`)))
      setTimeout(() => no(new Error(`no DevTools URL within 20 s: ${buf.trim().slice(-400)}`)), 20000)
    })
    ws = new WebSocket(wsUrl)
    await new Promise((ok, no) => { ws.addEventListener('open', ok); ws.addEventListener('error', no) })
    let id = 0
    const pending = new Map()
    const children = new Map() // page session -> the sessions of its out-of-process frames, such as sandboxed iframes
    ws.addEventListener('message', (m) => {
      const j = JSON.parse(m.data)
      if (j.id && pending.has(j.id)) { pending.get(j.id)(j); pending.delete(j.id) }
      if (j.method === 'Target.attachedToTarget' && children.has(j.sessionId)) children.get(j.sessionId).push(j.params.sessionId)
    })
    const send = (method, params = {}, sessionId) => new Promise((ok, no) => { const i = ++id; pending.set(i, (j) => (j.error ? no(new Error(`${method}: ${j.error.message}`)) : ok(j.result))); ws.send(JSON.stringify({ id: i, method, params, sessionId })) })
    const motion = { features: [{ name: 'prefers-reduced-motion', value: reducedMotion ? 'reduce' : 'no-preference' }] }
    // Runs an expression in an isolated world of one frame: it reaches a frame whose sandbox bars scripts.
    const inFrame = async (s, frameId, expression) => {
      const { executionContextId } = await send('Page.createIsolatedWorld', { frameId, worldName: 'preview-clock' }, s)
      const r = await send('Runtime.evaluate', { contextId: executionContextId, expression, awaitPromise: true, returnByValue: true }, s)
      if (r.exceptionDetails) throw new Error(`in frame: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}`)
      return r.result.value
    }
    try {
      for (const { url, name, mode, t, svgTime } of shots) {
        const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
        const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
        children.set(sessionId, [])
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false }, sessionId)
        await send('Emulation.setEmulatedMedia', motion, sessionId)
        await send('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: false, flatten: true }, sessionId)
        await send('Page.navigate', { url }, sessionId)
        const done = await send('Runtime.evaluate', { expression: 'new Promise(r=>{const t=setInterval(()=>{if(window.__done){clearInterval(t);r(window.__report?.failed??"ok")}},200);setTimeout(()=>r("timeout"),30000)})', awaitPromise: true, returnByValue: true }, sessionId)
        await send('Runtime.evaluate', { expression: 'document.fonts.ready.then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))', awaitPromise: true }, sessionId)
        let status = done.result.value
        let seek
        if (svgTime !== undefined) {
          // Every iframe the page drew must be attached before its clock can be set.
          const frames = (await send('Runtime.evaluate', { expression: 'window.__report?.iframes ?? 0', returnByValue: true }, sessionId)).result.value
          for (let i = 0; i < 50 && children.get(sessionId).length < frames; i++) await new Promise((ok) => setTimeout(ok, 100))
          const sessions = [sessionId, ...children.get(sessionId)]
          for (const s of sessions.slice(1)) await send('Emulation.setEmulatedMedia', motion, s)
          // Every document: each session's frames, in-process child frames included.
          const docs = []
          const walk = (n) => [n.frame.id, ...(n.childFrames ?? []).flatMap(walk)]
          for (const s of sessions) for (const frameId of walk((await send('Page.getFrameTree', {}, s)).frameTree)) docs.push({ s, frameId })
          seek = []
          for (const d of docs) seek.push(await inFrame(d.s, d.frameId, SEEK(svgTime)))
          for (const d of docs) await inFrame(d.s, d.frameId, SETTLE)
          const off = seek.flatMap((d) => [...d.svg, ...d.css]).filter((v) => Math.abs(v - svgTime) > 0.5)
          if (docs.length - 1 < frames) status = `only ${docs.length - 1} of ${frames} frames reached`
          else if (off.length) status = `clock reads ${off.join(', ')} ms, not ${svgTime}`
          else if (seek.some((d) => d.reduced !== reducedMotion)) status = 'reduced motion did not reach every frame'
        }
        const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width, height, scale: 1 } }, sessionId)
        const file = path.join(outDir, `${name}.png`)
        const png = Buffer.from(shot.data, 'base64')
        fs.writeFileSync(file, png)
        results.push({ file, mode, t, svgTime, status, sha256: createHash('sha256').update(png).digest('hex'), ...(seek && { seek }) })
        await send('Target.closeTarget', { targetId })
        children.delete(sessionId)
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
