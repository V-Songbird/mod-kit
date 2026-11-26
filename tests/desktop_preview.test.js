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
function fakeBundle({ drop } = {}) {
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
});

describe("preview cache and server", () => {
  test("refuses a cache inside a Git work tree", async () => {
    const { assertOutsideGit } = await load("preview.mjs");
    const repo = tmp();
    cp.execFileSync("git", ["init", "-q", repo]);
    assert.throws(() => assertOutsideGit(path.join(repo, "cache", "6.0")), /inside the Git work tree/);
    assert.doesNotThrow(() => assertOutsideGit(path.join(tmp(), "cache")));
  });

  const get = (port, pathName, host) => new Promise((ok, no) => {
    http.get({ host: "127.0.0.1", port, path: pathName, headers: { host: host ?? `127.0.0.1:${port}` } }, (res) => {
      let body = ""; res.on("data", (d) => { body += d; }); res.on("end", () => ok({ status: res.statusCode, body }));
    }).on("error", no);
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
