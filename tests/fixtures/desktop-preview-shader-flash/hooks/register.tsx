import type { Register } from 'claude-code'

// Draws the flash Shader over a gray Svg in the desktop backdrop when the preview asks for this plugin's scene.
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10"><rect width="16" height="10" fill="#404040"/></svg>'

export const register: Register = (on) => {
  // The CLI asks a Backdrop hook only for the scene a theme set.
  on('session.start', async ($, e, next) => {
    await $.theme.set({ backdrop: { scene: 'preview-shader-flash-fixture' } })
    return next(e)
  })
  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' || e.props.plugin !== 'preview-shader-flash-fixture') return next(e)
    const { Shader, Svg } = $.ui.resolve(e)
    return (
      <Shader module="./flash.ts">
        <Svg source={SVG} alt="A flat gray field" />
      </Shader>
    )
  })
}
