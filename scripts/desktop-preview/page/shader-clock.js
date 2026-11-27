// Frame mode for the app's Shader worker. It runs in the same module worker, before the worker's own code, and
// replaces what makes a frame depend on anything but its number:
//   performance.now          -> the time of the frame the page asks for
//   requestAnimationFrame    -> runs only when the page sends preview-frame, with that frame's time
//   crypto.getRandomValues   -> a fixed sequence; the worker fills its 240x150 noise texture from it
//   EXT_disjoint_timer_query -> hidden, so the drawing size never follows the GPU's real time
// The worker's own setTimeout stays real: its compile wait and its nap only delay the next frame request, and the nap
// adds a fixed 0.25 s to the shader's time. The canvas keeps its drawing buffer, so preview-save can read the frame
// just drawn. Not the app's own path.
let now = 0, seed = 0x2545f491
const queued = new Map()
let nextId = 0, gl = null, canvas = null

Object.defineProperty(performance, 'now', { value: () => now })
self.requestAnimationFrame = (cb) => { queued.set(++nextId, cb); return nextId }
self.cancelAnimationFrame = (id) => { queued.delete(id) }
crypto.getRandomValues = (a) => {
  const b = new Uint8Array(a.buffer, a.byteOffset, a.byteLength)
  for (let i = 0; i < b.length; i++) { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; b[i] = seed >>> 24 }
  return a
}
const getExtension = WebGL2RenderingContext.prototype.getExtension
WebGL2RenderingContext.prototype.getExtension = function (name) { return name === 'EXT_disjoint_timer_query_webgl2' ? null : getExtension.call(this, name) }
const getContext = OffscreenCanvas.prototype.getContext
OffscreenCanvas.prototype.getContext = function (type, options) {
  const c = getContext.call(this, type, { ...options, preserveDrawingBuffer: true })
  if (type === 'webgl2') { gl = c; canvas = this }
  return c
}

// The center pixel of what the canvas shows, read without disturbing the worker's own bindings.
function centerPixel() {
  const read = gl.getParameter(gl.READ_FRAMEBUFFER_BINDING), pack = gl.getParameter(gl.PIXEL_PACK_BUFFER_BINDING)
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null); gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null)
  const px = new Uint8Array(4)
  gl.readPixels(canvas.width >> 1, canvas.height >> 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px)
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, read); gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pack)
  return [...px]
}

self.addEventListener('message', async (e) => {
  const kind = e.data?.kind
  if (kind !== 'preview-frame' && kind !== 'preview-save') return
  e.stopImmediatePropagation()
  try {
    if (kind === 'preview-frame') {
      // Waits, on real time, until the worker asks for a frame: it asks none while it compiles or naps.
      let i = 0
      for (; queued.size === 0; i++) {
        if (i > 1000) throw new Error('the worker asked for no frame within 10 s')
        await new Promise((ok) => setTimeout(ok, 10))
      }
      now = e.data.at
      const due = [...queued.values()]; queued.clear()
      for (const cb of due) cb(now)
      self.postMessage({ preview: 'frame', at: now, waited: i > 0 })
    } else {
      const pixel = centerPixel()
      const png = await (await canvas.convertToBlob({ type: 'image/png' })).arrayBuffer()
      self.postMessage({ preview: 'saved', png, pixel, size: [canvas.width, canvas.height] }, [png])
    }
  } catch (err) {
    self.postMessage({ preview: 'error', error: String(err?.message ?? err) })
  }
})
