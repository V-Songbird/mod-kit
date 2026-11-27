// Every pixel is (fract(time), 0.4, 0.6), opaque, so a frame's red names its time on the shader's clock.
import { fract, picture, shader, time, vec4 } from 'claude-code/shader'

const clock = picture(() => vec4(fract(time), 0.4, 0.6, 1))

export default shader({ fps: 60, passes: [clock] })
