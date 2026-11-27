"use strict";

// The Desktop preview script: its settings reader keeps only the listed keys, its locator names the anchor a new
// build broke, its cache never lands in a Git work tree, its server answers only loopback requests for its own files,
// and its asar reader never writes outside its output folder. Every fixture is synthetic; no app code is used.

const { test, describe, after } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const cp = require("node:child_process");
const { pathToFileURL } = require("node:url");

const DIR = path.join(__dirname, "..", "scripts", "desktop-preview");
const load = (name) => import(pathToFileURL(path.join(DIR, name)).href);
const made = [];
const tmp = () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), "mod-kit-preview-test-")); made.push(d); return d; };
after(() => { for (const d of made) fs.rmSync(d, { recursive: true, force: true }); });
const get = (port, pathName, host) => new Promise((ok, no) => {
  http.get({ host: "127.0.0.1", port, path: pathName, headers: { host: host ?? `127.0.0.1:${port}` } }, (res) => {
    let body = ""; res.on("data", (d) => { body += d; }); res.on("end", () => ok({ status: res.statusCode, body }));
  }).on("error", no);
});

// --- LevelDB writers for the fixtures ---
const varint = (n) => { const out = []; while (n >= 0x80) { out.push((n & 0x7f) | 0x80); n = Math.floor(n / 128); } out.push(n); return Buffer.from(out); };
const lsKey = (key) => Buffer.concat([Buffer.from("_https://claude.ai\0\x01", "latin1"), Buffer.from(key, "latin1")]);
const lsValue = (value) => Buffer.concat([Buffer.from([1]), Buffer.from(value, "latin1")]);

function logFile(seq, puts) {
  const head = Buffer.alloc(12);
  head.writeBigUInt64LE(BigInt(seq), 0);
  head.writeUInt32LE(puts.length, 8);
  const body = Buffer.concat([head, ...puts.flatMap(([k, v]) => [Buffer.from([1]), varint(k.length), k, varint(v.length), v])]);
  const rec = Buffer.alloc(7);
  rec.writeUInt16LE(body.length, 4);
  rec[6] = 1; // a full record; the reader does not check the checksum
  return Buffer.concat([rec, body]);
}

function block(entries) {
  const parts = entries.flatMap(([k, v]) => [varint(0), varint(k.length), varint(v.length), k, v]);
  const tail = Buffer.alloc(8);
  tail.writeUInt32LE(1, 4); // one restart point, at 0
  return Buffer.concat([...parts, tail]);
}

function tableFile(seq, puts) {
  const trailer = () => { const t = Buffer.alloc(8); t.writeBigUInt64LE((BigInt(seq) << 8n) | 1n); return t; };
  const data = block(puts.map(([k, v]) => [Buffer.concat([k, trailer()]), v]));
  const index = block([[Buffer.from("~"), Buffer.concat([varint(0), varint(data.length)])]]);
  const trail = Buffer.alloc(5); // compression type 0, then an unchecked checksum
  const footer = Buffer.alloc(48);
  Buffer.concat([varint(0), varint(0), varint(data.length + 5), varint(index.length)]).copy(footer);
  return Buffer.concat([data, trail, index, trail, footer]);
}

describe("settings reader", () => {
  test("keeps only the listed keys and the newest value of each", async () => {
    const { readSettings } = await load("settings.mjs");
    const dir = tmp();
    fs.writeFileSync(path.join(dir, "config.json"), JSON.stringify({ userThemeMode: "dark", locale: "es-419", "oauth:tokenCache": "SECRET-TOKEN", lastKnownAccountUuid: "SECRET-ID" }));
    const ldb = path.join(dir, "Local Storage", "leveldb");
    fs.mkdirSync(ldb, { recursive: true });
    const palette = (label) => lsValue(JSON.stringify({ value: { id: label, label } }));
    fs.writeFileSync(path.join(ldb, "000005.ldb"), tableFile(1, [[lsKey("LSS-appearance:mod-palette"), palette("old")], [lsKey("LSS-session-token"), lsValue("SECRET-LS")]]));
    fs.writeFileSync(path.join(ldb, "000007.log"), logFile(9, [[lsKey("LSS-appearance:mod-palette"), palette("new")], [lsKey("LSS-persisted.kind-breeze"), lsValue('"on"')], [lsKey("oauth"), lsValue("SECRET-LOG")], [lsKey("LSS-other:appearance:mod-palette"), palette("SECRET-NEAR")]]));
    const names = new Set();
    const r = readSettings(dir, { names, dark: false });
    assert.strictEqual(r.mode, "dark");
    assert.strictEqual(r.locale, "es-419");
    assert.strictEqual(r.palette.label, "new");
    assert.strictEqual(r.contrast, "more");
    assert.strictEqual(r.font, "system");
    assert.ok(names.has("https://claude.ai LSS-session-token"), "the reader parsed the table");
    assert.deepStrictEqual([...r.keysFound].sort(), ["LSS-appearance:mod-palette", "LSS-persisted.kind-breeze"]);
    assert.doesNotMatch(JSON.stringify(r), /SECRET/);
  });

  test("decodes a snappy block with a literal and a copy", async () => {
    const { unsnappy } = await load("settings.mjs");
    assert.strictEqual(unsnappy(Buffer.from([9, 8, 0x61, 0x62, 0x63, 9, 3])).toString(), "abcabcabc");
  });

  test("a missing Desktop folder gives defaults, not an error", async () => {
    const { readSettings } = await load("settings.mjs");
    const r = readSettings(path.join(tmp(), "none"), { dark: null });
    assert.strictEqual(r.found, false);
    assert.strictEqual(r.mode, "light");
    assert.strictEqual(r.palette, null);
  });
});

// A bundle whose chunks hold every anchor the locator reads, written for this test.
function fakeBundle({ drop, shader } = {}) {
  const bundle = tmp();
  const v1 = path.join(bundle, "assets", "v1");
  fs.mkdirSync(v1, { recursive: true });
  fs.writeFileSync(path.join(bundle, "index.html"), '<html class="a"><link rel="stylesheet" crossorigin href="/assets/v1/main.css">');
  fs.writeFileSync(path.join(v1, "glass.css"), ".x{--engine-glass-opacity:1}");
  const engine = [
    '"data-engine-row";liftsHoverCards;',
    "Ld(e.host,e.surfaceCss);",
    "Vd(e.host,t,{handlers:h});",
    'var Df=["pointer-events-auto isolate"];',
    'Hm={display:"block",minWidth:0};',
    '({"data-plugin-drawn":a,...b,className:"host-cls"});',
    "let{shapeTree:p,x}=e,q=p===void 0?Yf:p;",
    'function band(e){let s=e.shapeTree??fh;return {component:"AbovePrompt",className:Sm,surfaceCss:xm}}',
    '({component:"Pane",instanceId:i,className:"pane-cls"});',
  ].filter((_, i) => i !== drop).join("\n");
  fs.writeFileSync(path.join(v1, "engine.js"), engine);
  fs.writeFileSync(path.join(v1, "sites.js"), [
    "ENGINE_MOUNTS;",
    'function Ea(e,t,n){let r=Q(e,"data-engine-glass")}',
    ",so={surfaceCss:ya,shapeTree:sh(x)};function lz(e){return{matchMedia:1}}",
    'function lo(e){let t=e.createElement("div");return t.setAttribute("aria-hidden","true"),t.setAttribute("inert",""),t}',
    'function uo(e,t){e.toggleAttribute("data-engine-backdrop-unseen",!t)}',
    'function Ji(e){let t=Q(e,"data-engine-backdrop-on")}',
  ].join("\n"));
  fs.writeFileSync(path.join(v1, "theme.js"), 'function at(n,o={}){if(o.target===void 0&&typeof document>"u")throw Error("applyTheme needs a document")}export{at as t};');
  if (shader) {
    fs.writeFileSync(path.join(v1, "backdrop.js"), 'var D="/assets/shader-worker-Ab_1.js";function U(){}export{U as PointerBackdrop};');
    if (shader === "with worker") fs.writeFileSync(path.join(bundle, "assets", "shader-worker-Ab_1.js"), "");
  }
  return bundle;
}

describe("locator", () => {
  test("finds every name and writes the export copies into the bundle", async () => {
    const { locate } = await load("locate.mjs");
    const bundle = fakeBundle();
    const r = locate(bundle);
    const value = (k) => r.names[k].value;
    assert.deepStrictEqual(["attach", "build", "siteClass", "defaultShaper", "bandShaper", "bandClass", "bandCss", "glass", "backdropSite", "backdropLayer", "backdropMark", "backdropOn", "applyTheme"].map(value),
      ["Ld", "Vd", "Df", "Yf", "fh", "Sm", "xm", "Ea", "so", "lo", "uo", "Ji", "t"]);
    assert.strictEqual(value("hostClass"), "host-cls");
    assert.strictEqual(value("paneClass"), "pane-cls");
    assert.deepStrictEqual(r.sheets, ["/assets/v1/main.css", "/assets/v1/glass.css"]);
    assert.match(fs.readFileSync(path.join(bundle, "assets", "v1", "__preview-engine.js"), "utf8"), /export\{Ld as __Ld,Vd as __Vd,/);
    assert.ok(fs.existsSync(path.join(bundle, "__preview-names.json")));
  });

  test("a build without an anchor fails with that anchor's name", async () => {
    const { locate } = await load("locate.mjs");
    assert.throws(() => locate(fakeBundle({ drop: 2 })), /anchor "build" not found in engine\.js/);
  });

  test("finds the shader worker through the PointerBackdrop chunk, and gives null when it is missing", async () => {
    const { locate } = await load("locate.mjs");
    assert.deepStrictEqual(locate(fakeBundle({ shader: "with worker" })).shader, { backdropFile: "backdrop.js", worker: "/assets/shader-worker-Ab_1.js" });
    assert.strictEqual(locate(fakeBundle({ shader: "chunk only" })).shader, null);
    assert.strictEqual(locate(fakeBundle()).shader, null);
  });
});

describe("shader request", () => {
  // A stand-in CLI: prints a version, answers each control request on stdin, and logs what it was sent.
  const stub = (backdropTree) => {
    const dir = tmp();
    const file = path.join(dir, "cli.js");
    fs.writeFileSync(file, `
const fs = require("node:fs");
if (process.argv.includes("--version")) { console.log("9.9.9 (stub)"); process.exit(0); }
const log = ${JSON.stringify(path.join(dir, "log.json"))};
const seen = { argv: process.argv.slice(2), requests: [] };
let buf = "";
process.stdin.on("data", (d) => {
  buf += d;
  for (let i; (i = buf.indexOf("\\n")) >= 0;) {
    const m = JSON.parse(buf.slice(0, i)); buf = buf.slice(i + 1);
    seen.requests.push(m.request); fs.writeFileSync(log, JSON.stringify(seen));
    const response = m.request.subtype === "ui_render" ? { tree: ${JSON.stringify(backdropTree)} } : {};
    console.log(JSON.stringify({ type: "system", subtype: "noise" }));
    console.log(JSON.stringify({ type: "control_response", response: { subtype: "success", request_id: m.request_id, response } }));
  }
});
setInterval(() => {}, 1000);`);
    return { command: [process.execPath, file], log: () => JSON.parse(fs.readFileSync(path.join(dir, "log.json"), "utf8")) };
  };
  const fixture = path.join(__dirname, "fixtures", "desktop-preview-shader");
  const shaderTree = { type: "Shader", props: { ir: { passes: [] }, values: [0.5] }, children: [{ type: "Svg", props: { source: "<svg/>" } }] };

  test("attaches as a desktop client that draws Theme and Shader, asks for the backdrop, and loads a copy of the plugin", async () => {
    const { fetchShader } = await load("preview.mjs");
    const s = stub(shaderTree);
    const r = await fetchShader({ pluginDir: fixture, theme: { backdrop: { glass: { blur: 6 } } }, command: s.command });
    assert.deepStrictEqual(r, { ir: { passes: [] }, values: [0.5], svg: "<svg/>", cli: "9.9.9 (stub)" });
    const seen = s.log();
    assert.deepStrictEqual(seen.requests.map((q) => q.subtype), ["initialize", "ui_attach", "ui_render"]);
    assert.deepStrictEqual(seen.requests[1].draws, ["Theme", "Shader"]);
    assert.deepStrictEqual([seen.requests[2].component, seen.requests[2].instance_id, seen.requests[2].props], ["Theme", "backdrop", { glass: { blur: 6 }, scene: "preview-shader-fixture", plugin: "preview-shader-fixture" }]);
    assert.strictEqual(seen.argv[seen.argv.indexOf("--setting-sources") + 1], "project", "installed plugins cannot answer for the given one");
    const dir = seen.argv[seen.argv.indexOf("--plugin-dir") + 1];
    assert.notStrictEqual(path.resolve(dir), path.resolve(fixture));
    assert.strictEqual(fs.existsSync(dir), false, "the copy is removed afterwards");
  });

  test("refuses an answer that is not a Shader, and a folder that is not a plugin", async () => {
    const { fetchShader } = await load("preview.mjs");
    await assert.rejects(fetchShader({ pluginDir: fixture, command: stub({ type: "Svg", props: { source: "<svg/>" } }).command }), /answered Svg, not a Shader/);
    await assert.rejects(fetchShader({ pluginDir: tmp(), command: stub(shaderTree).command }), /plugin folder/);
  });
});

describe("preview cache and server", () => {
  test("refuses a cache inside a Git work tree", async () => {
    const { assertOutsideGit } = await load("preview.mjs");
    const repo = tmp();
    cp.execFileSync("git", ["init", "-q", repo]);
    assert.throws(() => assertOutsideGit(path.join(repo, "cache", "6.0")), /inside the Git work tree/);
    assert.doesNotThrow(() => assertOutsideGit(path.join(tmp(), "cache")));
  });

  test("serves its page, the bundle and the inputs, and nothing to another host or outside the bundle", async () => {
    const { startServer } = await load("preview.mjs");
    const outer = tmp();
    const bundle = path.join(outer, "bundle");
    fs.mkdirSync(bundle);
    fs.writeFileSync(path.join(bundle, "index.html"), "bundle");
    fs.writeFileSync(path.join(outer, "bundle-secret.txt"), "SECRET");
    const server = await startServer({ bundle, input: { tree: null, site: "pane" }, saveDir: tmp() });
    const { port } = server.address();
    try {
      assert.strictEqual(server.address().address, "127.0.0.1");
      assert.strictEqual((await get(port, "/index.html")).body, "bundle");
      assert.match((await get(port, "/preview.js")).body, /applyTheme/);
      assert.strictEqual(JSON.parse((await get(port, "/__input.json")).body).site, "pane");
      assert.strictEqual((await get(port, "/__input.json", "attacker.example")).status, 403);
      assert.strictEqual((await get(port, "/..%2fbundle-secret.txt")).status, 403);
    } finally {
      server.close();
    }
  });
});

describe("timeline", () => {
  const tree = (n) => ({ type: "Box", props: {}, children: [String(n)] });

  test("carries a frame's tree and theme forward and restarts the Svg clock when the tree changes, not when repeated", async () => {
    const { resolveTimeline } = await load("preview.mjs");
    const f = resolveTimeline({ frames: [{ t: 100, tree: tree(1) }, { t: 350, tree: tree(1) }, { t: 600, tree: { tree: tree(2) } }, { t: 900, theme: { colors: {} } }, { t: 1000 }] });
    assert.deepStrictEqual(f.map((x) => x.svgTime), [0, 250, 0, 300, 400]);
    assert.deepStrictEqual(f.map((x) => x.tree.children[0]), ["1", "1", "2", "2", "2"]);
    assert.deepStrictEqual(f.map((x) => x.theme), [null, null, null, { colors: {} }, { colors: {} }]);
  });

  test("the SMIL fixture gives the expected Svg clock per frame", async () => {
    const { readInput } = await load("preview.mjs");
    const input = readInput({ timeline: path.join(__dirname, "fixtures", "desktop-preview-smil-timeline.json") });
    assert.strictEqual(input.site, "band");
    assert.deepStrictEqual(input.frames.map((x) => x.svgTime), [0, 250, 500, 750, 1000, 1500, 0]);
  });

  test("refuses an empty list and a time that goes back", async () => {
    const { resolveTimeline } = await load("preview.mjs");
    assert.throws(() => resolveTimeline({ frames: [] }), /non-empty/);
    assert.throws(() => resolveTimeline({ frames: [{ t: 10 }, { t: 5 }] }), /frame 1/);
  });

  test("--times draws the given tree at each time with no redraw", async () => {
    const { readInput } = await load("preview.mjs");
    const file = path.join(tmp(), "tree.json");
    fs.writeFileSync(file, JSON.stringify(tree(7)));
    const input = readInput({ tree: file, times: "250,1000" });
    assert.deepStrictEqual(input.frames.map((x) => [x.t, x.svgTime, x.tree.children[0]]), [[250, 250, "7"], [1000, 1000, "7"]]);
  });

  test("--click takes x,y,tMs and an optional holdMs, and refuses anything else", async () => {
    const { parseClick } = await load("preview.mjs");
    assert.deepStrictEqual(parseClick("480,300,2000"), { x: 480, y: 300, t: 2000, hold: 100 });
    assert.deepStrictEqual(parseClick(" 0, 12.5 ,0,750"), { x: 0, y: 12.5, t: 0, hold: 750 });
    for (const bad of ["", "1,2", "1,2,3,4,5", "-1,2,3", "1,,3", "a,2,3"]) assert.throws(() => parseClick(bad), /--click takes/, bad);
  });

  test("the ffmpeg list holds each frame for its gap at a rate that divides every gap", async () => {
    const { concatList } = await load("preview.mjs");
    const r = concatList(["C:\\o\\a.png", "/o/b'.png", "/o/c.png"], [0, 250, 750]);
    assert.deepStrictEqual([r.fps, r.seconds], [4, 1.25]);
    const files = r.list.split("\n").filter((l) => l.startsWith("file"));
    assert.deepStrictEqual(files, ["file 'C:/o/a.png'", "file '/o/b'\\''.png'", "file '/o/b'\\''.png'", "file '/o/c.png'", "file '/o/c.png'", "file '/o/c.png'"]);
  });

  test("the server gives each frame its own input", async () => {
    const { startServer } = await load("preview.mjs");
    const server = await startServer({ bundle: tmp(), input: { site: "band", tree: null, frames: [{ t: 0, svgTime: 0, tree: tree(1) }, { t: 9, svgTime: 9, tree: tree(2) }] }, saveDir: tmp() });
    const { port } = server.address();
    try {
      const one = JSON.parse((await get(port, "/__input.json?frame=1")).body);
      assert.deepStrictEqual([one.site, one.t, one.tree.children[0], one.frames], ["band", 9, "2", undefined]);
    } finally {
      server.close();
    }
  });
});

describe("frame capture", () => {
  // A page of our own: a SMIL square in a sandboxed iframe, as the app draws an interactive Svg. No app code.
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20"><rect id="sq" width="20" height="20" fill="red"><animate attributeName="x" from="0" to="100" dur="1s" fill="freeze"/></rect></svg>';
  const page = `<!doctype html><iframe sandbox="" srcdoc='${svg}'></iframe><script>onload=()=>{window.__report={iframes:1};window.__done=true}</script>`;
  test("pauses a sandboxed frame's SMIL at the asked time, twice with the same bytes, with reduced motion as asked", async (t) => {
    const { capture, findBrowser } = await load("capture.mjs");
    try { findBrowser(); } catch { return t.skip("no Edge, Chrome or Chromium here"); }
    const server = http.createServer((q, r) => r.writeHead(200, { "content-type": "text/html" }).end(page));
    await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
    const url = `http://127.0.0.1:${server.address().port}/`;
    try {
      const out = tmp();
      // GitHub's Ubuntu runners allow no sandbox for Chrome; only the test, never the preview, turns it off there.
      const browserArgs = process.platform === "linux" && process.env.CI ? ["--no-sandbox"] : [];
      const r = await capture([{ url, name: "a", svgTime: 250 }, { url, name: "b", svgTime: 250 }], out, 320, 200, { reducedMotion: true, browserArgs });
      assert.deepStrictEqual(r.map((x) => x.status), ["ok", "ok"]);
      assert.deepStrictEqual(r[0].seek.flatMap((d) => d.smil), [{ id: "sq", attribute: "x", value: 25 }]);
      assert.ok(r[0].seek.every((d) => d.reduced === true));
      assert.strictEqual(r[0].sha256, r[1].sha256);
    } finally {
      server.close();
    }
  });
});

describe("shader playback", () => {
  // Live: this computer's Desktop worker, its CLI and a browser. The fixture paints rgb(51, 102, 153) everywhere.
  test("the flat fixture's 64x40 frost readback is its color within 1/255, after fit and drawn", { timeout: 180000 }, async (t) => {
    const { findBrowser } = await load("capture.mjs");
    const { findAsar } = await load("preview.mjs");
    try { findBrowser(); } catch { return t.skip("no Edge, Chrome or Chromium here"); }
    try { findAsar(); } catch { return t.skip("no Claude Desktop install here"); }
    if (cp.spawnSync("claude", ["--version"], { stdio: "ignore" }).status !== 0) return t.skip("no claude CLI on the PATH");
    const out = tmp();
    const r = cp.spawnSync(process.execPath, [path.join(DIR, "preview.mjs"), "--shader", path.join(__dirname, "fixtures", "desktop-preview-shader"), "--shots", out, "--modes", "dark", "--size", "960x600"], { encoding: "utf8", timeout: 170000 });
    assert.strictEqual(r.status, 0, `${r.stdout}\n${r.stderr}`);
    const s = JSON.parse(fs.readFileSync(path.join(out, "preview-dark.json"), "utf8")).shader;
    const said = s.messages.map((m) => m.msg);
    assert.ok(said.includes("fit") && said.includes("drawn"), JSON.stringify(said));
    assert.deepStrictEqual([s.frost.width, s.frost.height], [64, 40]);
    [51, 102, 153, 255].forEach((want, i) => assert.ok(Math.abs(s.frost.mean[i] - want) <= 1, `channel ${i}: ${s.frost.mean[i]}, want ${want}`));
    for (const k of ["gpu", "desktop", "cli", "worker", "driver"]) assert.ok(s[k], `report names the ${k}`);
    assert.deepStrictEqual(s.size, s.sizes.at(-1));
    assert.strictEqual(s.sharpness, Math.round((s.size[0] / 960) * 100) / 100);
  });

  // Live, as above. The click fixture paints white within 24 units of a held pointer, rgb(51, 102, 153) elsewhere.
  test("--click makes the frost cell under the pointer white during the hold and not before", { timeout: 180000 }, async (t) => {
    const { findBrowser } = await load("capture.mjs");
    const { findAsar } = await load("preview.mjs");
    try { findBrowser(); } catch { return t.skip("no Edge, Chrome or Chromium here"); }
    try { findAsar(); } catch { return t.skip("no Claude Desktop install here"); }
    if (cp.spawnSync("claude", ["--version"], { stdio: "ignore" }).status !== 0) return t.skip("no claude CLI on the PATH");
    const out = tmp();
    const r = cp.spawnSync(process.execPath, [path.join(DIR, "preview.mjs"), "--shader", path.join(__dirname, "fixtures", "desktop-preview-shader-click"), "--click", "240,150,3000,800", "--shots", out, "--modes", "dark", "--size", "960x600"], { encoding: "utf8", timeout: 170000 });
    assert.strictEqual(r.status, 0, `${r.stdout}\n${r.stderr}`);
    const c = JSON.parse(fs.readFileSync(path.join(out, "preview-dark.json"), "utf8")).shader.click;
    const white = (s) => s.rgba.slice(0, 3).every((v) => v >= 254);
    const of = (phase) => c.samples.filter((s) => s.phase === phase);
    assert.deepStrictEqual(c.cell, [16, 10]);
    assert.ok(of("before").length > 0 && !of("before").some(white), JSON.stringify(of("before")));
    assert.ok(of("hold").some(white), JSON.stringify(of("hold")));
    assert.ok(!white(of("after").at(-1)), JSON.stringify(of("after")));
  });

  // Live, as above. The time fixture paints (fract(time), 0.4, 0.6), so frame n's red is fract(n / 60) at 60 fps.
  test("--frames gives the same PNG bytes in two runs, and frame n reads fract(n / 60) within 1/255", { timeout: 360000 }, async (t) => {
    const { findBrowser } = await load("capture.mjs");
    const { findAsar } = await load("preview.mjs");
    try { findBrowser(); } catch { return t.skip("no Edge, Chrome or Chromium here"); }
    try { findAsar(); } catch { return t.skip("no Claude Desktop install here"); }
    if (cp.spawnSync("claude", ["--version"], { stdio: "ignore" }).status !== 0) return t.skip("no claude CLI on the PATH");
    const run = () => {
      const out = tmp();
      const r = cp.spawnSync(process.execPath, [path.join(DIR, "preview.mjs"), "--shader", path.join(__dirname, "fixtures", "desktop-preview-shader-time"), "--frames", "0,1,30,45", "--shots", out, "--modes", "dark", "--size", "960x600"], { encoding: "utf8", timeout: 170000 });
      assert.strictEqual(r.status, 0, `${r.stdout}\n${r.stderr}`);
      return JSON.parse(fs.readFileSync(path.join(out, "shader-frames-dark.json"), "utf8"));
    };
    const a = run(), b = run();
    assert.deepStrictEqual(a.map((f) => f.n), [0, 1, 30, 45]);
    assert.deepStrictEqual(a.map((f) => f.sha256), b.map((f) => f.sha256));
    for (const f of a) {
      const want = [((f.n / 60) % 1) * 255, 102, 153, 255];
      want.forEach((w, i) => assert.ok(Math.abs(f.pixel[i] - w) <= 1, `frame ${f.n} channel ${i}: ${f.pixel[i]}, want ${w}`));
    }
  });
});

describe("asar reader", () => {
  function asar(files) {
    let offset = 0;
    const data = [];
    const node = { files: {} };
    for (const [name, text] of Object.entries(files)) {
      const buf = Buffer.from(text);
      node.files[name] = { size: buf.length, offset: String(offset) };
      offset += buf.length;
      data.push(buf);
    }
    const json = Buffer.from(JSON.stringify(node));
    const padded = Buffer.alloc(Math.ceil(json.length / 4) * 4);
    json.copy(padded);
    const head = Buffer.alloc(16);
    head.writeUInt32LE(4, 0);
    head.writeUInt32LE(8 + padded.length, 4);
    head.writeUInt32LE(4 + padded.length, 8);
    head.writeUInt32LE(json.length, 12);
    const file = path.join(tmp(), "app.asar");
    fs.writeFileSync(file, Buffer.concat([head, padded, ...data]));
    return file;
  }

  test("extracts packed files", async () => {
    const { extractAsar } = await load("asar.mjs");
    const out = tmp();
    assert.strictEqual(extractAsar(asar({ "index.html": "<html>", "a.js": "x" }), out), 2);
    assert.strictEqual(fs.readFileSync(path.join(out, "index.html"), "utf8"), "<html>");
  });

  test("refuses an entry that escapes the output folder", async () => {
    const { extractAsar } = await load("asar.mjs");
    assert.throws(() => extractAsar(asar({ "../evil.js": "x" }), path.join(tmp(), "out")), /escapes the output folder/);
  });
});
