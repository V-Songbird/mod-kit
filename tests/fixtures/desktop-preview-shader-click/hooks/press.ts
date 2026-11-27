// rgb(51, 102, 153) everywhere, and white within 24 units of a pointer that is down and not yet lifted, so a readback
// cell under a click is white only while the click holds.
import { length, max, picture, pointers, shader, size, step, vec2, vec4 } from 'claude-code/shader'

const press = picture(p => {
  let white = 0
  for (const q of pointers) {
    const held = q.down * (1 - step(0.0001, q.gone))
    const near = step(length(vec2((p.uv.x - q.where.x) * size.x, (p.uv.y - q.where.y) * size.y)), 24)
    white = max(white, held * near)
  }
  return vec4(0.2 + 0.8 * white, 0.4 + 0.6 * white, 0.6 + 0.4 * white, 1)
})

export default shader({ fps: 60, passes: [press] })
