// Two nested loops of sines per pixel, 64 by 12 turns, about the most validate accepts, so each frame costs far more
// than the other fixtures. Whether it ends in a slow stop depends on the GPU that plays it.
import { fract, picture, shader, sin, time, vec4 } from 'claude-code/shader'

const heavy = picture((p) => {
  let a = 0
  for (let i = 0; i < 64; i++) {
    for (let j = 0; j < 12; j++) a = fract(a + sin(p.uv.x * 91.7 + p.uv.y * 47.3 + i * 0.37 + j * 0.11 + time))
  }
  return vec4(a, 0.4, 0.6, 1)
})

export default shader({ fps: 60, passes: [heavy] })
