// Finds, by stable strings, the pieces of the installed Desktop renderer that the preview calls, and writes copies of
// the two chunks that hold them with one export line appended. Every name is read from the user's own bundle at run
// time, so a new build with new minified names still works while the strings hold.
import fs from 'node:fs'
import path from 'node:path'

const ID = '[\\w$]+'
const read = (f) => fs.readFileSync(f, 'utf8')
const firstFile = (dir, ext, ...needles) => fs.readdirSync(dir).filter((f) => f.endsWith(ext) && !f.startsWith('__preview')).find((f) => { const s = read(path.join(dir, f)); return needles.every((n) => s.includes(n)) })

/** One anchor: a regex whose groups are the wanted names, and where it matched (chunk and offset, for a CODE label). */
function find(file, src, key, re, groups) {
  const m = new RegExp(re, 's').exec(src)
  if (!m) throw new Error(`anchor "${key}" not found in ${file}; this Desktop build changed the code the preview reads`)
  return Object.fromEntries(groups.map((g, i) => [g, { value: m[i + 1], file, offset: m.index }]))
}

export function locate(bundle) {
  const v1 = path.join(bundle, 'assets', 'v1')
  const engineFile = firstFile(v1, '.js', 'data-engine-row', 'liftsHoverCards', 'surfaceCss')
  const sitesFile = firstFile(v1, '.js', 'ENGINE_MOUNTS', 'data-engine-glass')
  const themeFile = firstFile(v1, '.js', 'applyTheme needs a document')
  if (!engineFile || !sitesFile || !themeFile) throw new Error(`chunks not found: engine ${engineFile}, sites ${sitesFile}, theme ${themeFile}`)
  const E = read(path.join(v1, engineFile)), S = read(path.join(v1, sitesFile)), T = read(path.join(v1, themeFile))
  const n = {
    ...find(engineFile, E, 'attach', `(${ID})\\(e\\.host,e\\.surfaceCss\\)`, ['attach']),
    ...find(engineFile, E, 'build', `(${ID})\\(e\\.host,${ID},\\{handlers:`, ['build']),
    ...find(engineFile, E, 'siteClass', `var (${ID})=\\["pointer-events-auto isolate`, ['siteClass']),
    ...find(engineFile, E, 'holderStyle', `(${ID})=\\{display:"block",minWidth:0\\}`, ['holderStyle']),
    ...find(engineFile, E, 'hostClass', `"data-plugin-drawn":${ID},\\.\\.\\.${ID},className:"([^"]+)"`, ['hostClass']),
    ...find(engineFile, E, 'defaultShaper', `shapeTree:(${ID}),[^}]*\\}=e,${ID}=\\1===void 0\\?(${ID}):\\1`, ['_p', 'defaultShaper']),
    ...find(engineFile, E, 'band', `e\\.shapeTree\\?\\?(${ID});return.{0,300}?component:"AbovePrompt".{0,200}?className:(${ID}),surfaceCss:(${ID})`, ['bandShaper', 'bandClass', 'bandCss']),
    ...find(engineFile, E, 'paneClass', `component:"Pane",instanceId:[^}]*?className:"([^"]+)"\\}`, ['paneClass']),
    ...find(sitesFile, S, 'glass', `function (${ID})\\(e,t,n\\)\\{let r=${ID}\\(e,"data-engine-glass"\\)`, ['glass']),
    ...find(sitesFile, S, 'backdropSite', `,(${ID})=\\{surfaceCss:${ID},shapeTree:${ID}\\(${ID}\\)\\};function ${ID}\\(e\\)\\{return\\{matchMedia`, ['backdropSite']),
    ...find(sitesFile, S, 'backdropLayer', `function (${ID})\\(e\\)\\{let t=e\\.createElement\\("div"\\);return t\\.setAttribute\\("aria-hidden","true"\\),t\\.setAttribute\\("inert",""\\)`, ['backdropLayer']),
    ...find(sitesFile, S, 'backdropMark', `function (${ID})\\(e,t\\)\\{e\\.toggleAttribute\\("data-engine-backdrop-unseen"`, ['backdropMark']),
    ...find(sitesFile, S, 'backdropOn', `function (${ID})\\(e\\)\\{let t=${ID}\\(e,"data-engine-backdrop-on"\\)`, ['backdropOn']),
    ...find(themeFile, T, 'applyTheme', `function (${ID})\\(${ID},${ID}=\\{\\}\\)\\{if\\(${ID}\\.target===void 0&&typeof document>"u"\\)`, ['applyThemeLocal']),
  }
  delete n._p
  const local = n.applyThemeLocal.value.replace(/\$/g, '\\$')
  const alias = new RegExp(`export\\{[^}]*\\b${local} as (${ID})`).exec(T)
  if (!alias) throw new Error(`anchor "applyTheme export" not found in ${themeFile}; this Desktop build changed the code the preview reads`)
  n.applyTheme = { value: alias[1], file: themeFile, offset: alias.index }
  // The engine and sites chunks get an appended export line; the class names stay as data.
  const patch = (src, names) => `${src}\nexport{${[...new Set(names)].map((x) => `${x} as __${x}`).join(',')}};\n`
  fs.writeFileSync(path.join(v1, '__preview-engine.js'), patch(E, ['attach', 'build', 'siteClass', 'holderStyle', 'defaultShaper', 'bandShaper', 'bandClass', 'bandCss'].map((k) => n[k].value)))
  fs.writeFileSync(path.join(v1, '__preview-sites.js'), patch(S, ['glass', 'backdropSite', 'backdropLayer', 'backdropMark', 'backdropOn'].map((k) => n[k].value)))
  // Stylesheets: those index.html loads, then each other one that styles the engine or the glass.
  const index = read(path.join(bundle, 'index.html'))
  const linked = [...index.matchAll(/<link rel="stylesheet"[^>]*href="([^"]+)"/g)].map((m) => m[1])
  const extra = fs.readdirSync(v1).filter((f) => f.endsWith('.css')).filter((f) => { const s = read(path.join(v1, f)); return s.includes('epitaxy-fence') || s.includes('engine-glass-opacity') }).map((f) => `/assets/v1/${f}`)
  // The Shader player: the module worker the PointerBackdrop chunk starts. Optional, as only --shader needs it.
  const backdropFile = firstFile(v1, '.js', '/assets/shader-worker-', 'PointerBackdrop')
  const worker = backdropFile && /"(\/assets\/shader-worker-[\w-]+\.js)"/.exec(read(path.join(v1, backdropFile)))?.[1]
  const shader = worker && fs.existsSync(path.join(bundle, worker)) ? { backdropFile, worker } : null
  const out = { engineFile, sitesFile, themeFile, sheets: [...new Set([...linked, ...extra])], names: n, shader }
  fs.writeFileSync(path.join(bundle, '__preview-names.json'), JSON.stringify(out, null, 1))
  return out
}
