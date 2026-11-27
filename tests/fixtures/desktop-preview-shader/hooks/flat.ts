// Every pixel is rgb(51, 102, 153), opaque: 0.2, 0.4 and 0.6 are exact in 8 bits, and the color differs from the
// Svg's gray and from every surface color, so a readback of the still alone cannot match it.
import { picture, shader, vec4 } from 'claude-code/shader'

const flat = picture(() => vec4(0.2, 0.4, 0.6, 1))

export default shader({ fps: 60, passes: [flat] })
