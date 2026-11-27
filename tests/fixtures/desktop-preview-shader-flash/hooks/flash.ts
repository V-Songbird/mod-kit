// The whole field turns black or white ten times a second, five full cycles, so the player's flash check stops it
// with "flash" (seen on Desktop 6.28899.6 after about 3.6 s).
import { fract, picture, shader, step, time, vec4 } from 'claude-code/shader'

const flash = picture(() => {
  const v = step(0.5, fract(time * 5))
  return vec4(v, v, v, 1)
})

export default shader({ fps: 60, passes: [flash] })
