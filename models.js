/* =====================================================================
 *  数码怪兽击字 Digi Monster Typer — HD pixel-art monsters
 *
 *  Every monster is ORIGINAL pixel art, drawn in code from simple shapes
 *  (ellipses, capsules, polygons) on a tiny canvas. The PixelArt engine
 *  adds the "HD pixel" look automatically: 5-tone hue-shifted shading lit
 *  from the top-left, dithered tone edges, internal outlines where a part
 *  sits in front of another, and a coloured 1-pixel outline.
 *  The canvases become nearest-filtered THREE.Sprites in the 3D world.
 *
 *  Exposed as window.MODELS (same API the game engine used for 3D mechs):
 *    MECHS (partners), buildMech, newAnim, aimMech, fireMech, animateMech,
 *    ENEMY_TYPES, ENEMY_SIZES, buildEnemy, animateEnemy,
 *    BOSSES, buildBoss, animateBoss, portrait, MS, MB, GLOW
 * ===================================================================== */
(function () {
"use strict";
const T = THREE;
const ADD = T.AdditiveBlending;

/* ---------------- 3D material helpers (used by scene.js for props) ---------------- */
const matCache = {};
function MS(color, extra) {
  const k = "s" + color + JSON.stringify(extra || {});
  return matCache[k] || (matCache[k] = new T.MeshStandardMaterial(Object.assign({ color, metalness: 0.1, roughness: 0.8, flatShading: true }, extra)));
}
function MB(color, extra) {
  const k = "b" + color + JSON.stringify(extra || {});
  return matCache[k] || (matCache[k] = new T.MeshBasicMaterial(Object.assign({ color }, extra)));
}
function GLOW(color, op) { return MB(color, { transparent: true, opacity: op == null ? 0.85 : op, blending: ADD, depthWrite: false }); }
const lerp = (a, b, k) => a + (b - a) * k;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* =====================================================================
 *  PIXEL ART ENGINE
 * ===================================================================== */
const OUTLINE = [22, 12, 38], WARM = [255, 246, 214], COOL = [40, 22, 78];
const LIGHT = (() => { const v = [-0.52, -0.62, 0.59], n = Math.hypot(...v); return v.map(x => x / n); })();
function rgb(c) { return [(c >> 16) & 255, (c >> 8) & 255, c & 255]; }
function mix(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
const toneCache = {};
function tones(c) { // deep, shade, base, light, shine (hue-shifted: shadows go purple, lights go warm)
  if (toneCache[c]) return toneCache[c];
  const b = rgb(c);
  return (toneCache[c] = [mix(b, COOL, 0.6), mix(b, COOL, 0.32), b, mix(b, WARM, 0.34), mix(b, WARM, 0.68)]);
}
const TH = [-0.28, 0.1, 0.66, 0.9]; // lum thresholds between the 5 tones

class PixelArt {
  constructor(w, h) {
    this.w = w; this.h = h; this.W = w + 2; this.H = h + 2; // 1px border for the outline
    const n = this.W * this.H;
    this.reg = new Int16Array(n).fill(-1); this.col = new Int32Array(n); this.R = []; this.decals = []; this.mir = false;
  }
  X(x) { return this.mir ? this.w - x : x; }
  sym(fn) { fn(); this.mir = true; fn(); this.mir = false; return this; }
  _shape(test, x0, y0, x1, y1, color, info, paintOnly) {
    const id = paintOnly ? -1 : this.R.push(Object.assign({ c: color }, info)) - 1;
    x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0)); x1 = Math.min(this.w - 1, Math.ceil(x1)); y1 = Math.min(this.h - 1, Math.ceil(y1));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (!test(x + 0.5, y + 0.5)) continue;
      const i = (y + 1) * this.W + x + 1;
      if (paintOnly) { if (this.reg[i] >= 0 && (paintOnly === true || paintOnly.includes(this.R[this.reg[i]].c))) this.col[i] = color; continue; }
      this.reg[i] = id; this.col[i] = color;
    }
    return this;
  }
  /* filled ellipse, shaded like a ball. o: {spec: shiny highlight, join: no inner outline with same colour, paint: recolour only} */
  ell(cx, cy, rx, ry, c, o) {
    o = o || {}; cx = this.X(cx);
    return this._shape((x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1, cx - rx, cy - ry, cx + rx, cy + ry, c,
      { t: "e", cx, cy, rx, ry, spec: o.spec, join: o.join }, o.paint);
  }
  /* rectangle, shaded flat with lit top/left edges */
  rect(x, y, w, h, c, o) {
    o = o || {}; const x0 = this.mir ? this.w - x - w : x;
    return this._shape((px, py) => px >= x0 && px <= x0 + w && py >= y && py <= y + h, x0, y, x0 + w, y + h, c, { t: "f", y0: y, y1: y + h, join: o.join }, o.paint);
  }
  /* polygon [[x,y],...] */
  poly(pts, c, o) {
    o = o || {}; const P = pts.map(([x, y]) => [this.X(x), y]);
    const xs = P.map(p => p[0]), ys = P.map(p => p[1]);
    const inside = (x, y) => { let r = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) r = !r; } return r; };
    return this._shape(inside, Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), c, { t: "f", y0: Math.min(...ys), y1: Math.max(...ys), join: o.join }, o.paint);
  }
  tri(ax, ay, bx, by, cx, cy, c, o) { return this.poly([[ax, ay], [bx, by], [cx, cy]], c, o); }
  /* elliptical ring (halos, hoops) of thickness t */
  ring(cx, cy, rx, ry, t, c, o) {
    o = o || {}; cx = this.X(cx);
    const test = (x, y) => { const e = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2, f = ((x - cx) / Math.max(0.5, rx - t)) ** 2 + ((y - cy) / Math.max(0.5, ry - t)) ** 2; return e <= 1 && f > 1; };
    return this._shape(test, cx - rx, cy - ry, cx + rx, cy + ry, c, { t: "e", cx, cy, rx, ry, spec: o.spec, join: o.join }, o.paint);
  }
  /* tapered capsule from (x0,y0) radius r0 to (x1,y1) radius r1 — limbs, horns, tails; shaded like a tube */
  cap(x0, y0, x1, y1, r0, r1, c, o) {
    o = o || {}; x0 = this.X(x0); x1 = this.X(x1); if (r1 == null) r1 = r0;
    const dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy || 1e-6;
    const test = (x, y) => { const t = clamp(((x - x0) * dx + (y - y0) * dy) / L2, 0, 1); return Math.hypot(x - (x0 + dx * t), y - (y0 + dy * t)) <= r0 + (r1 - r0) * t; };
    const R = Math.max(r0, r1);
    return this._shape(test, Math.min(x0, x1) - R, Math.min(y0, y1) - R, Math.max(x0, x1) + R, Math.max(y0, y1) + R, c,
      { t: "c", x0, y0, dx, dy, L2, r0, r1, spec: o.spec, join: o.join }, o.paint);
  }
  /* chain of capsules through points (tails, tentacles, necks) with radius going r0 -> r1 */
  chain(pts, r0, r1, c, o) {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = r0 + (r1 - r0) * i / (pts.length - 1), b = r0 + (r1 - r0) * (i + 1) / (pts.length - 1);
      this.cap(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], a, b, c, Object.assign({ join: i > 0 }, o));
    }
    return this;
  }
  /* --- decals: drawn after shading, not outlined (eyes, mouths, marks) --- */
  eye(cx, cy, s, style, iris) { this.decals.push({ k: "eye", cx: this.X(cx), cy, s, style: style || "round", iris: iris == null ? 0x1a1030 : iris, inner: this.mir ? -1 : 1 }); return this; }
  mouth(cx, cy, w, style, c) { this.decals.push({ k: "mouth", cx: this.X(cx), cy, w, style: style || "smile", c }); return this; }
  px(x, y, c) { this.decals.push({ k: "px", x: this.mir ? this.w - 1 - x : x, y, c }); return this; }
  glint(x, y) { return this.px(x, y, 0xffffff); }

  /* ------------------------------------------------------------------ */
  render() {
    const { W, H, reg, col, R } = this, n = W * H;
    const out = new Uint8ClampedArray(n * 4), tone = new Int8Array(n).fill(-1);
    const same = (i, j) => reg[j] === reg[i];
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x, r = reg[i]; if (r < 0) continue;
      const g = R[r], px = x - 0.5, py = y - 0.5;
      let lum;
      if (g.t === "e") {
        const nx = (px - g.cx) / g.rx, ny = (py - g.cy) / g.ry, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        lum = nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2];
      } else if (g.t === "c") {
        const t = clamp(((px - g.x0) * g.dx + (py - g.y0) * g.dy) / g.L2, 0, 1), rr = g.r0 + (g.r1 - g.r0) * t;
        const ox = (px - (g.x0 + g.dx * t)) / rr, oy = (py - (g.y0 + g.dy * t)) / rr, nz = Math.sqrt(Math.max(0, 1 - ox * ox - oy * oy));
        lum = ox * LIGHT[0] + oy * LIGHT[1] + nz * LIGHT[2];
      } else {
        lum = 0.42 - 0.3 * clamp((py - g.y0) / Math.max(1, g.y1 - g.y0), 0, 1);
        if (!same(i, i - W)) lum += 0.38; else if (!same(i, i - 1)) lum += 0.22;
        if (!same(i, i + W)) lum -= 0.42; else if (!same(i, i + 1)) lum -= 0.2;
      }
      // ordered dithering near tone borders gives the crisp "HD pixel" gradient
      if ((x + y) & 1) lum += 0.035; else lum -= 0.035;
      let k = 0; while (k < 4 && lum > TH[k]) k++;
      if (k === 4 && !g.spec) k = 3;
      // internal outline: a part drawn later (in front) gets a dark line on the part behind it
      for (const j of [i - 1, i + 1, i - W, i + W]) {
        const r2 = reg[j];
        if (r2 > r && !(R[r2].join && R[r2].c === col[i])) { k = -1; break; }
      }
      tone[i] = k;
      const c = k < 0 ? mix(tones(col[i])[0], OUTLINE, 0.35) : tones(col[i])[k];
      out.set([c[0], c[1], c[2], 255], i * 4);
    }
    // coloured outer outline
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x; if (reg[i] >= 0) continue;
      let src = -1;
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H && reg[yy * W + xx] >= 0) { src = yy * W + xx; break; } }
      if (src < 0) continue;
      const c = mix(tones(col[src])[0], OUTLINE, 0.62);
      out.set([c[0], c[1], c[2], 255], i * 4);
    }
    // decals
    const put = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; const i = (y + 1) * W + x + 1; const v = Array.isArray(c) ? c : rgb(c); out.set([v[0], v[1], v[2], 255], i * 4); };
    for (const d of this.decals) {
      if (d.k === "px") put(d.x, d.y, d.c);
      else if (d.k === "eye") drawEye(put, d);
      else if (d.k === "mouth") drawMouth(put, d);
    }
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    cv.getContext("2d").putImageData(new ImageData(out, W, H), 0, 0);
    return cv;
  }
}

function drawEye(put, d) {
  const { cx, cy, s, style, iris, inner } = d;
  const dark = OUTLINE, irisT = tones(iris);
  if (style === "dot") { for (let y = 0; y < Math.max(1, s); y++) for (let x = 0; x < Math.max(1, s); x++) put(cx - s / 2 + x, cy - s / 2 + y, dark); put(cx - s / 2, cy - s / 2, [255, 255, 255]); return; }
  if (style === "happy") { for (let x = -s; x <= s; x++) put(cx + x, cy - Math.round(Math.sqrt(Math.max(0, s * s - x * x)) * 0.6), dark); return; }
  if (style === "visor") { for (let x = -s; x <= s; x++) { put(cx + x, cy, irisT[3]); put(cx + x, cy - 1, dark); put(cx + x, cy + 1, dark); } put(cx - s + 1, cy, [255, 255, 255]); return; }
  if (s < 2.4 && style !== "visor") { // tiny eyes: a solid pupil block with a glint (a ring would swallow them)
    const w = Math.max(1, Math.round(s * 0.9)), h = Math.max(2, Math.round(s * 1.35)), x0 = Math.round(cx - w / 2), y0 = Math.round(cy - h / 2);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (style === "angry" && y === 0 && (inner > 0 ? x < w - 1 : x > 0)) { put(x0 + x, y0 + y - 1, dark); continue; }
      put(x0 + x, y0 + y, style === "slit" ? (x === Math.floor(w / 2) ? dark : irisT[3]) : y === h - 1 && h > 2 ? irisT[2] : dark);
    }
    if (style === "angry") for (let x = -1; x <= w; x++) put(x0 + x, y0 - 1 + (inner > 0 ? (x >= w - 1 ? 1 : 0) : (x <= 0 ? 1 : 0)), dark);
    if (style !== "slit") put(x0, y0, [255, 255, 255]);
    return;
  }
  const rx = s * (style === "slit" ? 0.95 : 0.78), ry = s;
  for (let y = Math.floor(-ry - 1); y <= ry + 1; y++) for (let x = Math.floor(-rx - 1); x <= rx + 1; x++) {
    const px = x + 0.5, py = y + 0.5, e = (px / rx) ** 2 + (py / ry) ** 2;
    if (e > 1.0) continue;
    // angry: cut the top of the eye with a brow that slopes down toward the nose
    if (style === "angry" && py < -ry * 0.25 + inner * px * 0.65) continue;
    const edge = ((px / (rx - 1)) ** 2 + (py / (ry - 1)) ** 2) > 1;
    let c;
    if (edge) c = dark;
    else if (style === "slit") c = Math.abs(px) < 0.7 ? dark : (py < 0 ? irisT[3] : irisT[2]);
    else {
      const ix = px - inner * s * 0.16, iy = py - ry * 0.12, ir = s * 0.7;
      const ie = (ix / ir) ** 2 + (iy / (ir * 1.15)) ** 2;
      c = ie < 0.22 ? dark : ie < 1 ? (iy < -ir * 0.3 ? irisT[1] : iy > ir * 0.45 ? irisT[3] : irisT[2]) : [255, 255, 255];
    }
    put(cx + x, cy + y, c);
  }
  if (style === "angry") for (let x = -Math.ceil(rx); x <= rx; x++) put(cx + x, cy + Math.floor(-ry * 0.25 + inner * (x + 0.5) * 0.65) - 1, dark);
  if (style !== "slit") put(cx - inner * Math.max(1, Math.round(s * 0.3)), cy - Math.max(1, Math.round(ry * 0.45)), [255, 255, 255]);
}
function drawMouth(put, d) {
  const { cx, cy, w, style } = d, dark = OUTLINE, h = Math.max(1, Math.round(w / 2));
  if (style === "open" || style === "roar") {
    const ry = style === "roar" ? h + 1 : h;
    for (let y = 0; y <= ry; y++) for (let x = -w; x <= w; x++) {
      const e = (x / (w + 0.5)) ** 2 + (y / (ry + 0.5)) ** 2; if (e > 1) continue;
      const edge = ((x / (w - 0.5)) ** 2 + (y / (ry - 0.5)) ** 2) > 1 || y === 0;
      put(cx + x, cy + y, edge ? dark : y > ry * 0.55 ? [236, 92, 120] : [120, 20, 46]);
    }
    for (const s of [-1, 1]) { put(cx + s * (w - 1), cy + 1, [255, 255, 255]); if (w > 2) put(cx + s * (w - 1), cy + 2, [255, 255, 255]); }
    return;
  }
  if (style === "line") { for (let x = -w; x <= w; x++) put(cx + x, cy, dark); return; }
  for (let x = -w; x <= w; x++) put(cx + x, cy + (Math.abs(x) >= w ? -1 : 0), dark); // smile
  if (style === "fang") for (const s of [-1, 1]) put(cx + s * Math.max(1, w - 2), cy + 1, [255, 255, 255]);
}

/* palette lookup: the art functions use P.main, P.sub, P.belly, P.acc, P.eye ... */
function pal(def, skin) { return Object.assign({ dark: 0x2c2440, white: 0xf4f6ff, claw: 0xf1ead2, eye: 0x1a1030 }, def.colors, skin && skin.colors ? skin.colors : {}); }

/* render + cache canvases; o = { back, atk, evo } */
const artCache = {};
function artCanvas(kind, def, skin, o) {
  const key = `${kind}|${def.id || def.name}|${skin ? skin.id : ""}|${o.back ? 1 : 0}${o.atk ? 1 : 0}${o.evo ? 1 : 0}`;
  if (artCache[key]) return artCache[key];
  const a = o.evo ? def.evoArt : def.art;
  const pa = new PixelArt(a.w, a.h);
  a.draw(pa, pal(def, skin), o);
  return (artCache[key] = pa.render());
}
const texCache = new WeakMap();
function tex(cv) {
  if (texCache.has(cv)) return texCache.get(cv);
  const t = new T.CanvasTexture(cv); t.magFilter = T.NearestFilter; t.minFilter = T.LinearFilter; t.generateMipmaps = false;
  texCache.set(cv, t); return t;
}
const silCache = new WeakMap();
function silhouette(cv) { // white copy for hit / evolve flashes
  if (silCache.has(cv)) return silCache.get(cv);
  const c = document.createElement("canvas"); c.width = cv.width; c.height = cv.height;
  const x = c.getContext("2d"); x.drawImage(cv, 0, 0); x.globalCompositeOperation = "source-in"; x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height);
  silCache.set(cv, c); return c;
}
let glowTex = null, shadowTex = null;
function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,0.9)"); g.addColorStop(0.35, "rgba(255,255,255,0.35)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return (glowTex = new T.CanvasTexture(c));
}
function shadowTexture() { // pixel-stepped oval shadow
  if (shadowTex) return shadowTex;
  const c = document.createElement("canvas"); c.width = 16; c.height = 8;
  const x = c.getContext("2d");
  for (let yy = 0; yy < 8; yy++) for (let xx = 0; xx < 16; xx++) { const e = ((xx + 0.5 - 8) / 8) ** 2 + ((yy + 0.5 - 4) / 4) ** 2; if (e <= 1) { x.fillStyle = `rgba(10,6,30,${e < 0.45 ? 0.45 : 0.28})`; x.fillRect(xx, yy, 1, 1); } }
  shadowTex = new T.CanvasTexture(c); shadowTex.magFilter = T.NearestFilter; shadowTex.minFilter = T.NearestFilter; shadowTex.generateMipmaps = false;
  return shadowTex;
}
const shadowGeo = new T.PlaneGeometry(1, 1);

/* A sprite rig: root (stands on y = 0) > body (bob / hop) > sprite + flash + aura */
function spriteRig(cv, px, opts) {
  opts = opts || {};
  const root = new T.Group(), body = new T.Group(); root.add(body);
  const mat = new T.SpriteMaterial({ map: tex(cv), transparent: true, alphaTest: 0.5 });
  const spr = new T.Sprite(mat); spr.center.set(0.5, opts.centerY == null ? 0 : opts.centerY);
  spr.scale.set(cv.width * px, cv.height * px, 1); body.add(spr);
  const fmat = new T.SpriteMaterial({ map: tex(silhouette(cv)), transparent: true, opacity: 0, depthWrite: false, blending: ADD });
  const flash = new T.Sprite(fmat); flash.center.copy(spr.center); flash.scale.copy(spr.scale); flash.renderOrder = 2; body.add(flash);
  const rig = { root, body, spr, flash, px, cv, frames: { a: cv } };
  if (opts.shadow !== false) {
    const sh = new T.Mesh(shadowGeo, new T.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.03; sh.scale.set(cv.width * px * 0.75, cv.width * px * 0.3, 1); sh.renderOrder = -1;
    root.add(sh); rig.shadow = sh; rig.shadowW = cv.width * px * 0.75;
  }
  root.userData.rig = rig;
  return rig;
}
function setFrame(rig, cv) {
  if (rig.cv === cv) return;
  rig.cv = cv;
  rig.spr.material.map = tex(cv); rig.flash.material.map = tex(silhouette(cv));
  rig.spr.scale.set(cv.width * rig.px, cv.height * rig.px, 1); rig.flash.scale.copy(rig.spr.scale);
}
/* keep a blob shadow on the ground (world y = 0) under a flying sprite */
const _wp = new T.Vector3();
function groundShadow(rig, mesh) {
  if (!rig.shadow) return;
  mesh.getWorldPosition(_wp);
  const s = mesh.scale.y || 1, h = Math.max(0, _wp.y);
  rig.shadow.position.y = (0.03 - _wp.y) / s;
  const k = 1 / (1 + h * 0.08);
  rig.shadow.scale.set(rig.shadowW * k, rig.shadowW * 0.4 * k, 1);
  rig.shadow.material.opacity = clamp(1.1 - h * 0.07, 0.25, 1);
}


/* =====================================================================
 *  ART HELPERS
 * ===================================================================== */
const INK = 0x2a1c3c;
function face(d, P, o, ex, ey, es, mx, my, mw, calm, mad, mouthStyle) {
  if (o.back) return;
  d.sym(() => d.eye(ex, ey, es, o.atk ? (mad || "angry") : (calm || "round"), P.eye));
  if (mw) d.mouth(mx, my, mw, o.atk ? (mw > 3 ? "roar" : "open") : (mouthStyle || "smile"));
}
function claws(d, xs, y, c) { for (const x of xs) d.px(x, y, c); }
function batWing(d, x, y, s, c, flip) { // spread bat/dragon wing, root at (x,y), pointing left (mirror for right)
  d.poly([[x, y], [x - 9 * s, y - 7 * s], [x - 8 * s, y - 2 * s], [x - 11 * s, y + 1 * s], [x - 7 * s, y + 2 * s], [x - 8 * s, y + 6 * s], [x - 3 * s, y + 4 * s], [x, y + 6 * s]], c);
}
function featherWing(d, x, y, s, c, tip) { // angel / bird wing
  d.poly([[x, y], [x - 6 * s, y - 9 * s], [x - 12 * s, y - 10 * s], [x - 11 * s, y - 5 * s], [x - 13 * s, y - 2 * s], [x - 10 * s, y + 1 * s], [x - 12 * s, y + 4 * s], [x - 7 * s, y + 5 * s], [x - 6 * s, y + 9 * s], [x, y + 5 * s]], c);
  if (tip) { d.ell(x - 11 * s, y - 7 * s, 2 * s, 2 * s, tip, { paint: [c] }); d.ell(x - 11 * s, y + 3 * s, 2 * s, 2 * s, tip, { paint: [c] }); }
}

/* =====================================================================
 *  PARTNER MONSTERS (15) — each has a ROOKIE form and an EVOLVED form.
 *  In battle a partner evolves while its special move is active, or while
 *  you hold a 25+ combo (cosmetic only).
 *  special: { type: blast|freeze|slow|shield, n (targets), secs, charge (words in a row) }
 *  Prices must match MECH_PRICES in apps-script/Code.gs.
 * ===================================================================== */
const MECHS = [
  { id: "starter", name: "EMBER", evo: "BLAZEREX", from: "Vaccine · Fire dragon", price: 0, hp: 5, startShield: true,
    plus: "Balanced. Starts every stage with a shield.", minus: "",
    colors: { main: 0xff8a1e, belly: 0xffe2a8, acc: 0x3a6ad8, eye: 0x2fa84a },
    art: { w: 34, h: 34, draw(d, P, o) {
      if (!o.back) d.cap(23, 29, 32, 22, 3.2, 1.2, P.main);
      d.sym(() => { d.ell(12, 30, 4, 3.6, P.main); claws(d, [9, 11], 33, P.claw); });
      d.ell(17, 24, 8, 7.5, P.main);
      if (!o.back) d.ell(17, 26, 5, 5, P.belly, { paint: true });
      d.sym(() => { d.cap(10, 21, 7, 26, 2.2, 1.7, P.main); claws(d, [6, 8], 27.5, P.claw); });
      d.ell(17, 11, 10, 8.5, P.main);
      d.ell(17, 15.5, 7.5, 4.5, P.main, { join: true });
      if (o.back) d.cap(17, 28, 21, 33, 3, 1.4, P.main);
      face(d, P, o, 12.5, 10, 3, 17, 16, 3, "round", "angry", "fang");
    } },
    evoArt: { w: 46, h: 46, draw(d, P, o) {
      const brown = 0x8c5a34, horn = 0xf4ecd8;
      if (!o.back) d.cap(33, 40, 44, 31, 4, 1.5, P.main);
      d.sym(() => { d.ell(14, 41, 6, 4.5, P.main); claws(d, [10, 13, 16], 44.5, P.claw); });
      d.ell(23, 31, 11, 10.5, P.main);
      if (!o.back) d.ell(23, 34, 7, 7, P.belly, { paint: true });
      d.sym(() => { d.rect(12, 24, 5, 1.6, P.acc, { paint: [P.main] }); d.rect(12, 29, 4, 1.6, P.acc, { paint: [P.main] }); });
      d.sym(() => { d.cap(13, 27, 8, 34, 3.2, 2.6, P.main); claws(d, [6, 8, 10], 37, P.claw); });
      d.ell(23, 15, 11, 8.5, P.main);
      d.ell(23, 20, 9, 5, P.main, { join: true });
      d.ell(23, 10, 11.5, 5.5, brown);
      d.sym(() => d.cap(15, 8, 10, 1, 2, 0.6, horn, { spec: true }));
      d.cap(23, 6, 23, 0.5, 2, 0.6, horn, { spec: true });
      if (o.back) d.cap(23, 36, 27, 45, 4, 1.6, P.main);
      face(d, P, o, 18, 15, 3.5, 23, 21, 4, "angry", "angry", "fang");
    } } },

  { id: "frostpup", name: "FROSTPUP", evo: "GLACIWOLF", from: "Data · Ice beast", price: 300, hp: 4, coinMult: 1.2,
    plus: "Coins +20%.", minus: "Only 4 ♥",
    colors: { main: 0xeef6ff, sub: 0x5aa8ff, acc: 0x9ff0ff, eye: 0x2d6be0 },
    art: { w: 34, h: 34, draw(d, P, o) {
      if (!o.back) d.chain([[24, 29], [29, 25], [31, 18]], 3, 2.2, P.sub);
      d.sym(() => { d.ell(10, 30, 4.5, 3.8, P.main); claws(d, [8, 10], 33, P.claw); });
      d.ell(17, 25, 8, 7, P.main);
      d.sym(() => { d.cap(13, 24, 12.5, 31.5, 2.5, 2.3, P.main); claws(d, [11, 13], 33, P.claw); });
      d.sym(() => { d.tri(8, 11, 10, 1, 15, 7, P.sub); d.tri(9.5, 9, 10.5, 4, 13, 7.5, 0xffb3c6, { paint: [P.sub] }); });
      d.ell(17, 14, 9, 7.5, P.main);
      d.ell(17, 18, 4.5, 3, P.main, { join: true });
      d.tri(14, 7, 20, 7, 17, 12, P.sub, { paint: [P.main] });
      d.cap(17, 7, 17, 1.5, 1.7, 0.6, P.acc, { spec: true });
      if (o.back) d.chain([[17, 28], [19, 32], [23, 33]], 3, 1.8, P.sub);
      face(d, P, o, 12.5, 13, 2.6, 17, 19.5, 2, "round", "angry");
      if (!o.back) d.px(16, 17, INK).px(17, 17, INK);
    } },
    evoArt: { w: 46, h: 46, draw(d, P, o) {
      if (!o.back) d.chain([[33, 37], [40, 31], [42, 21]], 4, 2.6, P.sub);
      d.sym(() => { d.ell(12, 40, 6, 5, P.main); claws(d, [8, 11, 14], 44.5, P.claw); });
      d.ell(23, 33, 11, 9, P.main);
      d.sym(() => { d.tri(10, 24, 3, 31, 13, 31, P.acc); d.tri(11, 19, 2, 21, 12, 26, P.acc); });
      d.sym(() => { d.cap(17, 32, 16, 42.5, 3.4, 3, P.main); claws(d, [14, 16, 18], 44.5, P.claw); });
      d.ell(23, 25, 9, 5, P.sub);
      d.sym(() => { d.tri(12, 13, 13, 1, 19, 8, P.sub); d.tri(13.5, 11, 14, 5, 17, 9, 0xffb3c6, { paint: [P.sub] }); });
      d.ell(23, 16, 10, 8.5, P.main);
      d.ell(23, 21, 5.5, 3.6, P.main, { join: true });
      d.tri(19.5, 9, 26.5, 9, 23, 15, P.sub, { paint: [P.main] });
      d.cap(23, 9, 23, 0.5, 2.4, 0.7, P.acc, { spec: true });
      if (o.back) d.chain([[23, 38], [26, 43], [31, 44]], 4, 2.4, P.sub);
      face(d, P, o, 18.5, 15, 3, 23, 23.5, 3, "angry", "angry", "fang");
      if (!o.back) d.px(22, 20.5, INK).px(23, 20.5, INK);
    } } },

  { id: "sprout", name: "SPROUTLING", evo: "THORNGUARD", from: "Data · Plant", price: 300, hp: 5, dropMult: 1.6, coinMult: 0.9,
    plus: "Items drop 1.6× more often.", minus: "Coins −10%",
    colors: { main: 0x6fd04a, sub: 0x2f8f3a, belly: 0xd8f5a0, acc: 0xff6fa0, eye: 0x7a4a1a },
    art: { w: 34, h: 34, draw(d, P, o) {
      d.sym(() => d.ell(12, 31, 3.6, 2.4, P.sub));
      d.sym(() => d.poly([[9, 21], [2, 18], [1, 22], [5, 26], [9, 25]], P.sub));
      d.ell(17, 22, 10.5, 9.5, P.main);
      if (!o.back) d.ell(17, 26, 6, 4.5, P.belly, { paint: true });
      d.cap(17, 13, 17, 6, 1, 1, P.sub);
      d.sym(() => d.poly([[17, 8], [11, 3], [8, 5], [10, 9], [16, 10]], P.main));
      d.ell(17, 4.5, 2.6, 2.6, P.acc, { spec: true });
      face(d, P, o, 12.5, 20, 2.8, 17, 25, 2, "round", "angry");
      if (!o.back) d.sym(() => d.ell(10, 24, 1.5, 0.8, 0xff9ab8, { paint: [P.main] }));
    } },
    evoArt: { w: 46, h: 46, draw(d, P, o) {
      const bark = 0x8a5a2e;
      d.sym(() => { d.cap(17, 35, 15, 43.5, 3.6, 3.2, bark); });
      d.chain([[33, 24], [40, 29], [42, 37], [39, 43]], 2.6, 1.4, P.sub);
      claws(d, [41, 43, 38], 33, P.acc);
      d.ell(23, 29, 10, 10, P.main);
      d.poly([[16, 23], [30, 23], [28, 36], [18, 36]], bark);
      d.rect(22, 24, 2, 11, 0x6a4020, { paint: [bark] });
      d.poly([[10, 20], [1, 29], [4, 41], [13, 35], [14, 25]], P.sub);
      d.cap(9, 24, 6, 37, 0.6, 0.6, P.main, { paint: [P.sub] });
      d.ell(23, 14, 9, 8, P.main);
      d.sym(() => d.poly([[23, 7], [13, 1], [10, 5], [16, 9]], P.sub));
      d.sym(() => d.ell(19.5, 4.5, 2.6, 2, P.acc));
      d.ell(23, 2.8, 2, 2.4, P.acc); d.ell(23, 5, 1.8, 1.8, 0xffe066, { spec: true });
      face(d, P, o, 19, 14, 2.8, 23, 18.5, 2.5, "angry", "angry", "line");
    } } },

  { id: "zapbeetle", name: "ZAPBEETLE", evo: "VOLTHORN", from: "Vaccine · Insect", price: 400, hp: 5, special: { type: "blast", n: 1, charge: 3 },
    plus: "Zap shot: every 3 words in a row, SPACE destroys the closest target.", minus: "",
    colors: { main: 0xffd23c, sub: 0x2c2a44, acc: 0x5ad0ff, eye: 0x2a7cff },
    art: { w: 34, h: 34, draw(d, P, o) {
      d.sym(() => { d.cap(9, 27, 5, 32.5, 1.3, 1, P.sub); d.cap(10, 23, 3, 25, 1.3, 1, P.sub); });
      d.ell(17, 19, 12, 10, P.main, { spec: true });
      d.poly([[19, 11], [23, 14], [20, 16], [25, 21], [19, 18], [21, 15]], P.acc, { paint: [P.main] });
      d.rect(16.5, 10, 1, 19, 0xc89a10, { paint: [P.main] });
      d.ell(17, 26, 7.5, 6, P.sub);
      d.cap(17, 24, 17, 13, 2.3, 0.9, P.main, { spec: true });
      d.sym(() => d.tri(12, 29, 15, 29, 14, 32.5, P.main));
      face(d, P, o, 13.5, 26, 2.3, 0, 0, 0, "round", "angry");
    } },
    evoArt: { w: 46, h: 46, draw(d, P, o) {
      d.sym(() => d.poly([[19, 15], [3, 6], [1, 18], [6, 31], [17, 30]], P.acc));
      d.sym(() => d.cap(10, 10, 5, 28, 0.6, 0.6, 0xffffff, { paint: [P.acc] }));
      d.sym(() => { d.cap(19, 36, 16, 43.5, 3, 2.6, P.sub); claws(d, [14, 16, 18], 44.5, P.main); });
      d.ell(23, 30, 9.5, 9.5, P.main, { spec: true });
      d.poly([[24, 23], [28, 26], [24, 29], [29, 35], [21, 30], [25, 27]], P.acc, { paint: [P.main] });
      d.sym(() => { d.cap(15, 25, 8, 31, 2.6, 2.1, P.sub); d.cap(15, 31, 9, 38, 2.4, 2, P.sub); claws(d, [7, 9], 33, P.main); });
      d.ell(23, 17, 8, 7, P.sub);
      d.sym(() => d.cap(18, 13, 12, 7, 1.6, 0.6, P.main));
      d.chain([[23, 13], [23, 5], [27, 1]], 3, 1, P.main, { spec: true });
      d.sym(() => d.tri(19, 21, 23, 21, 21, 26, P.main));
      face(d, P, o, 19, 18, 2.8, 0, 0, 0, "angry", "angry");
    } } },

  { id: "skychick", name: "SKYCHICK", evo: "STORMHAWK", from: "Vaccine · Bird", price: 400, hp: 4, missileSlow: 1.33, coinMult: 1.1,
    plus: "Boss attacks 25% slower. Coins +10%.", minus: "Only 4 ♥",
    colors: { main: 0x4fa8ff, sub: 0x2f6fd0, belly: 0xfff0c0, acc: 0xffb030, tuft: 0xff5a5a, eye: 0x1a1030 },
    art: { w: 34, h: 34, draw(d, P, o) {
      d.sym(() => { d.cap(13, 29, 12, 32.5, 1, 1, P.acc); claws(d, [11, 13], 33, P.acc); });
      d.sym(() => d.poly([[8, 17], [1, 22], [2, 27], [9, 25]], P.sub));
      d.ell(17, 21, 11, 10, P.main);
      if (!o.back) d.ell(17, 25, 7, 6, P.belly, { paint: true });
      d.cap(17, 12, 14, 5, 1.6, 0.7, P.tuft); d.cap(17, 12, 20, 4.5, 1.6, 0.7, P.tuft);
      face(d, P, o, 12.5, 18, 2.8, 0, 0, 0, "round", "angry");
      if (!o.back) d.tri(14.5, 21, 19.5, 21, 17, o.atk ? 26 : 24, P.acc);
      else d.poly([[14, 29], [20, 29], [17, 33]], P.sub);
    } },
    evoArt: { w: 46, h: 46, draw(d, P, o) {
      d.sym(() => d.poly([[18, 22], [3, 4], [5, 12], [1, 16], [5, 20], [1, 25], [8, 28], [6, 32], [17, 33]], P.sub));
      d.sym(() => { d.poly([[3, 4], [5, 12], [1, 16], [5, 20], [9, 14]], P.acc, { paint: [P.sub] }); });
      if (!o.back) d.poly([[19, 37], [27, 37], [26, 45], [20, 45]], P.sub);
      d.sym(() => { d.cap(19.5, 36, 19, 42.5, 1.4, 1.2, P.acc); claws(d, [17, 19, 21], 44, P.acc); });
      d.ell(23, 30, 8, 9, P.main);
      if (!o.back) d.ell(23, 33, 5, 6, P.belly, { paint: true });
      d.ell(23, 16, 7.5, 7, P.main);
      d.sym(() => d.cap(20, 11, 14, 4, 1.6, 0.5, P.tuft)); d.cap(23, 10, 23, 2, 1.8, 0.6, P.tuft);
      face(d, P, o, 19.5, 14.5, 2.5, 0, 0, 0, "angry", "angry");
      if (!o.back) d.poly([[20, 17], [26, 17], [24, 21], [23, o.atk ? 25 : 23]], P.acc);
      else d.poly([[19, 37], [27, 37], [26, 45], [20, 45]], P.sub);
    } } },

  { id: "tideseal", name: "TIDESEAL", evo: "ICEWALRUS", from: "Vaccine · Sea", price: 600, hp: 5, special: { type: "freeze", secs: 4, charge: 5 },
    plus: "Bubble freeze: every 5 words in a row, SPACE freezes enemies 4 s.", minus: "",
    colors: { main: 0xd2eaff, sub: 0x6fb6ff, belly: 0xffffff, acc: 0x9ff0ff, eye: 0x1a1030 },
    art: { w: 34, h: 34, draw(d, P, o) {
      d.sym(() => d.poly([[16, 29], [9, 33], [6, 30], [12, 27]], P.sub));
      d.ell(17, 24, 11, 8, P.main);
      if (!o.back) d.ell(17, 27, 7, 4.5, P.belly, { paint: true });
      d.sym(() => d.ell(6, 27, 4, 2, P.sub));
      d.ell(17, 15, 8.5, 7.5, P.main);
      d.sym(() => d.ell(12, 11, 1.5, 1.2, P.sub, { paint: [P.main] }));
      if (!o.back) d.ell(17, 18, 4, 2.6, P.belly);
      d.ell(26, 5, 3, 3, P.acc, { spec: true });
      face(d, P, o, 13, 14, 2.6, 17, 19.5, 2, "round", "angry");
      if (!o.back) d.ell(17, 16.8, 1.4, 1, INK);
    } },
    evoArt: { w: 46, h: 46, draw(d, P, o) {
      d.sym(() => d.poly([[20, 40], [9, 45], [6, 41], [14, 37]], P.sub));
      d.ell(23, 33, 15, 11, P.main);
      if (!o.back) d.ell(23, 37, 10, 6, P.belly, { paint: true });
      d.sym(() => d.ell(7, 38, 5, 3, P.sub));
      d.ell(23, 19, 11, 9, P.main);
      d.sym(() => { d.tri(13, 13, 15, 3, 19, 11, P.acc); d.tri(18, 11, 21, 1, 23, 10, P.acc); });
      d.rect(12, 10, 22, 3, P.sub);
      if (!o.back) { d.sym(() => d.ell(19, 24, 4, 3, P.belly)); d.sym(() => d.cap(19, 26, 18, 35, 1.6, 0.9, P.claw, { spec: true })); }
      face(d, P, o, 18, 17.5, 2.8, 0, 0, 0, "angry", "angry");
      if (!o.back) { d.ell(23, 22, 1.8, 1.3, INK); if (o.atk) d.mouth(23, 27, 2, "open"); }
    } } },

  { id: "rockbun", name: "ROCKBUN", evo: "BOULDERON", from: "Data · Stone", price: 600, hp: 6, coinMult: 0.8, bulk: 1.2, special: { type: "blast", n: 2, charge: 6 },
    plus: "Heavy armor: 6 ♥. Rock throw: 6 in a row, SPACE hits 2 targets.", minus: "Coins −20%",
    colors: { main: 0xc89a6a, sub: 0x8a7a70, acc: 0x7ce0ff, eye: 0x1a1030 },
    art: { w: 34, h: 34, draw(d, P, o) {
      d.sym(() => d.ell(11, 31, 3.6, 2.6, P.main));
      d.ell(17, 22, 12, 10, P.sub);
      d.rect(5, 18, 24, 1, 0x5e5048, { paint: [P.sub] }); d.rect(5, 23, 24, 1, 0x5e5048, { paint: [P.sub] });
      d.sym(() => d.tri(10, 14, 14, 13, 11, 7, P.acc, { spec: true })); d.tri(15, 12, 19, 12, 17, 4, P.acc, { spec: true });
      if (!o.back) { d.sym(() => d.ell(12.5, 19, 1.8, 2.8, P.main)); d.ell(17, 25, 6.5, 5.5, P.main); }
      face(d, P, o, 14.8, 24, 1.8, 17, 28.5, 1.5, "round", "angry");
      if (!o.back) d.ell(17, 27, 1.2, 0.9, INK);
    } },
    evoArt: { w: 46, h: 46, draw(d, P, o) {
      d.sym(() => d.rect(13, 35, 7, 10, P.sub));
      d.ell(23, 28, 13, 11, P.sub);
      d.cap(18, 24, 20, 32, 0.6, 0.6, P.acc, { paint: [P.sub] }); d.cap(28, 22, 26, 30, 0.6, 0.6, P.acc, { paint: [P.sub] });
      d.sym(() => { d.ell(7, 29, 5, 7.5, P.sub); d.ell(6, 37, 4.8, 4.2, P.main); });
      d.sym(() => d.tri(9, 19, 14, 8, 17, 19, P.acc, { spec: true }));
      d.ell(23, 14, 7.5, 6.5, P.sub);
      if (!o.back) d.ell(23, 15, 6, 3, 0x3a3040);
      if (!o.back) d.eye(23, 15, 4, "visor", P.acc);
      if (!o.back && o.atk) d.mouth(23, 18.5, 2, "open");
    } } },

  { id: "shadowkit", name: "SHADOWKIT", evo: "NIGHTPANTHER", from: "Virus · Shadow cat", price: 800, hp: 4, special: { type: "slow", secs: 6, charge: 5 },
    plus: "Shadow step: 5 in a row, SPACE slows enemies to half speed for 6 s.", minus: "Only 4 ♥",
    colors: { main: 0x3c3354, sub: 0x9a62f0, belly: 0x6a5a8a, acc: 0xffd23c, eye: 0xffd23c },
    art: { w: 34, h: 34, draw(d, P, o) {
      if (!o.back) { d.chain([[24, 30], [30, 27], [31, 19], [28, 15]], 1.8, 1.3, P.main); d.ell(28, 14.5, 2, 2, P.sub); }
      d.sym(() => d.ell(11, 31, 3.6, 2.6, P.main));
      d.ell(17, 25, 7, 6.5, P.main);
      if (!o.back) d.ell(17, 27, 3.5, 4, P.belly, { paint: true });
      d.sym(() => d.cap(14, 25, 14, 31.5, 1.8, 1.7, P.main));
      d.sym(() => { d.tri(9, 11, 10, 2, 15, 8, P.main); d.tri(10.3, 9.5, 10.8, 5, 13.5, 8.5, P.sub, { paint: [P.main] }); });
      d.ell(17, 14, 8.5, 7, P.main);
      d.rect(11, 19.5, 12, 1.6, P.sub);
      if (!o.back) d.ell(17, 22, 1.4, 1.4, P.acc, { spec: true });
      face(d, P, o, 13, 13.5, 2.8, 17, 17.5, 1.5, "slit", "angry");
      if (!o.back) d.sym(() => { d.px(8, 16, 0x9a8ab8); d.px(7, 17, 0x9a8ab8); });
      if (o.back) { d.chain([[17, 29], [20, 33], [25, 32], [27, 28]], 1.8, 1.3, P.main); d.ell(27, 27.5, 2, 2, P.sub); }
    } },
    evoArt: { w: 46, h: 46, draw(d, P, o) {
      if (!o.back) { d.chain([[33, 38], [41, 33], [43, 22], [39, 16]], 2.6, 1.8, P.main); d.ell(39, 15, 2.8, 2.8, P.sub); }
      d.sym(() => d.ell(13, 40, 5.5, 4.5, P.main));
      d.ell(23, 33, 10, 8, P.main);
      d.sym(() => { d.cap(17, 30, 16, 42.5, 3, 2.8, P.main); claws(d, [14, 16, 18], 44.5, P.acc); });
      d.sym(() => { d.rect(12, 30, 3, 1.4, P.sub, { paint: [P.main] }); d.rect(13, 34, 3, 1.4, P.sub, { paint: [P.main] }); });
      d.sym(() => { d.tri(14, 14, 14, 3, 20, 9, P.main); d.tri(15, 12, 15.3, 6, 18.5, 9.5, P.sub, { paint: [P.main] }); });
      d.ell(23, 17, 9, 7.5, P.main);
      d.tri(20, 10, 26, 10, 23, 15, P.sub, { paint: [P.main] });
      if (!o.back) d.ell(23, 21.5, 4.5, 3, P.belly);
      face(d, P, o, 18.5, 16.5, 2.8, 23, 22.5, 2.5, "slit", "angry", "fang");
      if (o.back) { d.chain([[23, 38], [27, 44], [34, 43], [37, 37]], 2.6, 1.8, P.main); d.ell(37, 36, 2.8, 2.8, P.sub); }
    } } },

  { id: "flarefox", name: "FLAREFOX", evo: "INFERNO KITSUNE", from: "Data · Fire fox", price: 900, hp: 5, special: { type: "blast", n: 5, charge: 8 },
    plus: "Fox fire storm: 8 words in a row, SPACE hits 5 targets.", minus: "",
    colors: { main: 0xff6f2a, belly: 0xfff0d8, sub: 0x3a2430, acc: 0xffd040, eye: 0x6a2a8a },
    art: { w: 34, h: 34, draw(d, P, o) {
      if (!o.back) { d.ell(28, 22, 4.5, 8, P.main); d.ell(29, 15, 3.2, 3.2, P.belly); }
      d.sym(() => d.ell(11, 31, 3.6, 2.6, P.main));
      d.ell(17, 25, 7, 6.5, P.main);
      if (!o.back) d.ell(17, 23.5, 4, 4, P.belly, { paint: true });
      d.sym(() => { d.cap(14, 25, 14, 31.5, 1.8, 1.6, P.main); d.ell(14, 32, 2, 1.6, P.sub, { paint: [P.main] }); });
      d.sym(() => { d.tri(8, 11, 7, 0.5, 14.5, 7, P.main); d.tri(9.3, 9, 8.6, 3.5, 12.5, 7.5, P.sub, { paint: [P.main] }); });
      d.ell(17, 14, 8.5, 7, P.main);
      d.sym(() => d.tri(10, 15, 5, 19, 11, 19, P.belly));
      if (!o.back) d.ell(17, 17.5, 4, 3, P.belly, { paint: [P.main] });
      d.tri(15.5, 8, 18.5, 8, 17, 12, P.acc, { paint: [P.main] });
      face(d, P, o, 13, 13.5, 2.4, 17, 19, 1.5, "round", "angry");
      if (!o.back) d.px(16, 16.5, INK).px(17, 16.5, INK);
      if (o.back) { d.ell(17, 29, 4.5, 6, P.main); d.ell(17, 33, 3, 2, P.belly); }
    } },
    evoArt: { w: 46, h: 46, draw(d, P, o) {
      for (const [x, y] of [[4, 18], [10, 8], [36, 8], [42, 18]]) {
        d.chain([[23, 36], [lerp(23, x, 0.55), lerp(36, y, 0.55) + 4], [x, y]], 2.6, 4.2, P.main);
        d.ell(x, y, 3.2, 3.2, P.belly, { paint: [P.main] });
        d.tri(x - 3, y - 1, x + 3, y - 1, x + (x < 23 ? -1 : 1), y - 7, P.acc, { spec: true });
      }
      d.sym(() => d.ell(14, 40, 5, 4.5, P.main));
      d.ell(23, 33, 9, 8, P.main);
      if (!o.back) d.ell(23, 31, 5, 5, P.belly, { paint: true });
      d.sym(() => { d.cap(18, 31, 17.5, 42.5, 2.8, 2.6, P.main); d.ell(17.5, 43, 3, 2, P.sub, { paint: [P.main] }); });
      d.sym(() => { d.tri(14, 17, 12, 4, 20, 11, P.main); d.tri(15, 14.5, 13.8, 7, 18, 11.5, P.sub, { paint: [P.main] }); });
      d.ell(23, 19, 9, 7.5, P.main);
      d.sym(() => d.tri(15, 20, 9, 25, 16, 25, P.belly));
      if (!o.back) d.ell(23, 22.5, 4.5, 3, P.belly, { paint: [P.main] });
      d.sym(() => d.tri(17, 15, 21, 15, 18.5, 18, P.acc, { paint: [P.main] }));
      face(d, P, o, 18.8, 18.5, 2.5, 23, 24.5, 2, "angry", "angry", "fang");
      if (!o.back) d.px(22, 21.5, INK).px(23, 21.5, INK);
    } } },

  { id: "halobun", name: "HALOBUN", evo: "SERAPHARE", from: "Vaccine · Holy beast", price: 900, hp: 5, special: { type: "shield", charge: 5 },
    plus: "Holy light: 5 words in a row, SPACE gives you a shield.", minus: "",
    colors: { main: 0xfaf6ff, sub: 0xff9ac8, acc: 0xffd54a, eye: 0xff4f9a },
    art: { w: 34, h: 34, draw(d, P, o) {
      d.sym(() => d.poly([[11, 20], [2, 14], [3, 19], [1, 23], [9, 25]], 0xffffff));
      d.sym(() => { d.cap(13, 12, 11, 3, 2.3, 1.9, P.main); d.cap(13, 11, 11.3, 4.5, 0.9, 0.8, P.sub, { paint: [P.main] }); });
      d.sym(() => d.ell(12, 31, 3.6, 2.6, P.main));
      d.ell(17, 25, 7, 6.5, P.main);
      d.ell(17, 16, 9, 7.5, P.main);
      if (!o.back) d.sym(() => d.ell(11.5, 19, 1.6, 1, P.sub, { paint: [P.main] }));
      d.ring(17, 2.5, 5.5, 1.8, 1.2, P.acc, { spec: true });
      face(d, P, o, 13.5, 15, 2.6, 17, 19, 1.5, "round", "angry");
      if (o.back) d.ell(17, 30, 2.5, 2.5, 0xffffff);
    } },
    evoArt: { w: 46, h: 46, draw(d, P, o) {
      d.sym(() => { featherWing(d, 17, 18, 1.15, 0xffffff, P.sub); featherWing(d, 18, 28, 0.8, 0xffffff); });
      d.sym(() => { d.cap(19, 12, 16, 2, 2.6, 2.2, P.main); d.cap(19, 11, 16.5, 4, 1, 0.9, P.sub, { paint: [P.main] }); });
      d.sym(() => { d.cap(19, 34, 18, 43, 2.8, 2.6, P.main); d.ell(18, 43.5, 3, 1.8, P.acc); });
      d.ell(23, 32, 8, 8, P.main);
      d.poly([[16, 26], [30, 26], [28, 36], [23, 39], [18, 36]], P.acc, { spec: true });
      d.ell(23, 31, 2, 2.5, P.sub);
      d.sym(() => d.cap(16, 28, 11, 35, 2.2, 1.8, P.main));
      d.cap(33, 22, 37, 44, 0.8, 0.8, P.acc); d.tri(35.5, 16, 39, 23, 32, 23, P.acc, { spec: true });
      d.ell(23, 19, 8.5, 7.5, P.main);
      d.ring(23, 4, 6.5, 2, 1.3, P.acc, { spec: true });
      face(d, P, o, 19.5, 18.5, 2.6, 23, 22.5, 1.5, "round", "angry");
    } } },

  { id: "puckimp", name: "PUCKIMP", evo: "INFERNIMP", from: "Virus · Little devil", price: 1000, hp: 5, coinMult: 1.1, special: { type: "blast", n: 1, charge: 3 },
    plus: "Coins +10%. 3 in a row, SPACE destroys the closest target.", minus: "",
    colors: { main: 0x9a5ae0, sub: 0x4a2a7a, belly: 0xd8b8ff, acc: 0xff4a6a, eye: 0xff3a3a },
    art: { w: 34, h: 34, draw(d, P, o) {
      if (!o.back) { d.chain([[21, 29], [27, 30], [30, 26]], 1, 0.8, P.sub); d.tri(28, 23, 32, 24, 30, 28, P.acc); }
      d.sym(() => batWing(d, 11, 19, 0.95, P.sub));
      d.sym(() => d.ell(13, 31, 2.8, 2.2, P.main));
      d.ell(17, 25, 6, 6, P.main);
      if (!o.back) d.ell(17, 26.5, 3.5, 3.5, P.belly, { paint: true });
      d.sym(() => d.cap(12, 23, 8, 27, 1.6, 1.4, P.main));
      d.sym(() => d.tri(9, 13, 3, 11, 9, 17, P.main));
      d.ell(17, 14, 8.5, 7.5, P.main);
      d.sym(() => d.cap(12, 8, 9, 2.5, 1.8, 0.6, P.acc, { spec: true }));
      face(d, P, o, 13.3, 13.5, 2.5, 17, 18.5, 2.5, "round", "angry", "fang");
      if (o.back) { d.chain([[17, 28], [20, 33], [25, 32]], 1, 0.8, P.sub); d.tri(24, 29, 28, 31, 25, 34, P.acc); }
    } },
    evoArt: { w: 46, h: 46, draw(d, P, o) {
      d.sym(() => batWing(d, 15, 20, 1.5, P.sub));
      d.sym(() => { d.cap(19, 35, 17, 43.5, 2.8, 2.5, P.main); claws(d, [15, 17, 19], 44.5, P.acc); });
      d.cap(37, 8, 35, 44, 0.9, 0.9, 0xd8b04a); d.poly([[33, 3], [35, 9], [37, 3], [39, 9], [41, 3], [40, 11], [34, 11]], 0xd8b04a, { spec: true });
      d.ell(23, 31, 8.5, 8, P.main);
      if (!o.back) d.ell(23, 33, 5, 5, P.belly, { paint: true });
      d.sym(() => d.cap(16, 27, 11, 34, 2.4, 2, P.main));
      d.ell(23, 17, 9, 8, P.main);
      d.sym(() => d.chain([[18, 11], [13, 6], [14, 1]], 2.4, 0.8, P.acc, { spec: true }));
      d.sym(() => d.tri(15, 16, 8, 13, 15, 21, P.main));
      face(d, P, o, 19.3, 16.5, 2.8, 23, 21.5, 3, "angry", "angry", "fang");
    } } },

  { id: "unihorn", name: "UNIHORN", evo: "PRISM UNICORN", from: "Vaccine · Holy beast", price: 1000, hp: 5, special: { type: "slow", secs: 8, charge: 6 },
    plus: "Rainbow aura: 6 in a row, SPACE slows enemies for 8 s.", minus: "",
    colors: { main: 0xfdfbff, sub: 0xff7ab0, sub2: 0xffd84a, sub3: 0x6ad0ff, acc: 0xffcf4a, eye: 0x7a4ad8 },
    art: { w: 34, h: 34, draw(d, P, o) {
      if (!o.back) d.chain([[23, 28], [28, 27], [30, 32]], 2, 1.4, P.sub3);
      d.sym(() => d.ell(11, 31, 3.5, 2.6, P.main));
      d.ell(17, 25, 7.5, 6.5, P.main);
      d.sym(() => { d.cap(14, 25, 13.5, 31.5, 1.9, 1.8, P.main); d.ell(13.5, 32, 2, 1.4, P.acc, { paint: [P.main] }); });
      d.ell(17, 12.5, 10, 8, P.sub);
      d.sym(() => { d.ell(8.5, 16, 2.6, 4.5, P.sub2); d.ell(9.5, 21, 2.2, 3, P.sub3); });
      d.sym(() => d.tri(10, 9, 11, 2, 14.5, 7, P.main));
      d.ell(17, 14, 8, 7.5, P.main);
      if (!o.back) d.ell(17, 18.5, 4.5, 3, 0xffe8f4, { join: true });
      d.cap(17, 7, 17, 0.8, 2, 0.6, P.acc, { spec: true });
      d.rect(15, 4, 4, 0.8, 0xc89a20, { paint: [P.acc] });
      face(d, P, o, 13.3, 13.5, 2.8, 17, 20, 1.5, "round", "angry");
      if (o.back) { d.cap(17, 9, 17, 19, 3.2, 2.4, P.sub); d.cap(17, 14, 17, 21, 2, 1.6, P.sub2, { paint: [P.sub] }); d.chain([[17, 28], [19, 32], [22, 33]], 2, 1.4, P.sub3); }
    } },
    evoArt: { w: 46, h: 46, draw(d, P, o) {
      d.sym(() => d.poly([[17, 22], [3, 10], [2, 18], [5, 24], [3, 30], [15, 29]], 0xc8f4ff));
      d.sym(() => d.cap(14, 14, 6, 25, 0.6, 0.6, P.sub3, { paint: [0xc8f4ff] }));
      if (!o.back) d.chain([[31, 37], [37, 35], [41, 42]], 3, 2, P.sub3);
      d.sym(() => d.ell(13, 41, 5, 4, P.main));
      d.ell(23, 33, 10, 8, P.main);
      d.sym(() => { d.cap(18.5, 32, 18, 43, 2.6, 2.4, P.main); d.ell(18, 43.5, 2.8, 1.6, P.acc, { paint: [P.main] }); });
      d.ell(23, 17, 12, 9, P.sub);
      d.sym(() => { d.ell(11, 22, 3, 5, P.sub2); d.ell(12, 28, 2.6, 3.6, P.sub3); });
      d.sym(() => d.tri(15, 14, 16, 6, 20, 11, P.main));
      d.ell(23, 19, 9, 8, P.main);
      if (!o.back) d.ell(23, 24, 5, 3.4, 0xffe8f4, { join: true });
      d.cap(23, 12, 23, 0.5, 2.6, 0.6, P.acc, { spec: true });
      d.rect(21, 8, 4, 0.8, 0xc89a20, { paint: [P.acc] }); d.rect(21.5, 4, 3, 0.8, 0xc89a20, { paint: [P.acc] });
      face(d, P, o, 19, 18.5, 2.8, 23, 25.5, 2, "angry", "angry");
    } } },

  { id: "mechapup", name: "MECHAPUP", evo: "CYBERHOUND", from: "Data · Machine", price: 1100, hp: 5, special: { type: "blast", n: 4, charge: 7 },
    plus: "Missile pack: 7 in a row, SPACE hits 4 targets.", minus: "",
    colors: { main: 0xb8c4d8, sub: 0x3a6ad8, acc: 0xff5a4a, eye: 0x5affd0 },
    art: { w: 34, h: 34, draw(d, P, o) {
      if (!o.back) d.cap(25, 22, 30, 17, 1.2, 1, P.sub);
      d.sym(() => d.rect(7, 26, 5, 7, P.sub));
      d.rect(9, 20, 16, 10, P.main);
      if (!o.back) d.rect(13, 22, 8, 5, P.sub, { paint: true });
      d.sym(() => { d.rect(11, 24, 4, 8, P.main); d.rect(10.5, 31, 5, 2, P.sub); });
      d.sym(() => d.tri(9, 8, 10, 1, 14, 7, P.sub));
      d.rect(9, 6, 16, 12, P.main);
      d.rect(13, 14, 8, 5, P.main, { join: true });
      d.cap(17, 6, 17, 2, 0.7, 0.7, P.sub); d.ell(17, 1.8, 1.4, 1.4, P.acc, { spec: true });
      if (!o.back) { d.eye(17, 10.5, 5, "visor", P.eye); d.mouth(17, 17, 2, o.atk ? "open" : "line"); d.rect(16, 13.5, 2, 1, INK); }
      else d.rect(11, 9, 12, 2, P.sub);
    } },
    evoArt: { w: 46, h: 46, draw(d, P, o) {
      d.sym(() => { d.cap(15, 24, 7, 11, 2.2, 1.8, P.sub); d.ell(7, 10.5, 2, 2, 0x2a2a3a); });
      if (!o.back) d.cap(33, 33, 42, 26, 1.6, 1.2, P.sub);
      d.sym(() => { d.rect(10, 34, 7, 11, P.sub); d.rect(9, 42, 9, 3, P.main); });
      d.rect(12, 25, 22, 13, P.main);
      if (!o.back) d.rect(17, 27, 12, 7, P.sub, { paint: true });
      if (!o.back) d.ell(23, 30.5, 2, 2, P.acc, { spec: true });
      d.sym(() => { d.rect(15, 30, 5, 13, P.main); d.rect(14, 41, 7, 3, P.sub); });
      d.sym(() => d.tri(14, 11, 14, 2, 19, 9, P.sub));
      d.rect(13, 8, 20, 14, P.main);
      d.rect(17, 17, 12, 6, P.main, { join: true });
      d.rect(13, 8, 20, 3, P.sub);
      if (!o.back) { d.eye(23, 13.5, 7, "visor", P.acc); d.mouth(23, 20.5, 3, o.atk ? "open" : "line"); d.rect(22, 16.5, 2, 1, INK); }
    } } },

  { id: "sparksprite", name: "SPARKSPRITE", evo: "STARFAIRY", from: "Data · Star fairy", price: 1100, hp: 5, dropMult: 1.2, special: { type: "freeze", secs: 6, charge: 6 },
    plus: "Time stop: 6 in a row, SPACE freezes enemies 6 s. Items ×1.2.", minus: "",
    colors: { main: 0xfff3a8, sub: 0xff8ad8, acc: 0x7ae8ff, eye: 0x6a3ad8 },
    art: { w: 34, h: 34, draw(d, P, o) {
      d.sym(() => { d.ell(7.5, 13, 6, 6, P.sub); d.ell(8.5, 24, 4.5, 4.5, P.acc); d.ell(7, 12, 2.4, 2.4, 0xffffff, { paint: [P.sub] }); });
      d.sym(() => { d.cap(14, 9, 11, 3, 0.6, 0.6, INK); d.ell(11, 2.6, 1.5, 1.5, P.acc, { spec: true }); });
      d.poly([[17, 5], [20, 12], [28, 14], [22, 20], [24, 30], [17, 25], [10, 30], [12, 20], [6, 14], [14, 12]], P.main, { join: true });
      d.ell(17, 17, 7.5, 7.5, P.main, { spec: true, join: true });
      face(d, P, o, 14, 16, 2.4, 17, 20.5, 1.5, "round", "angry");
      if (!o.back) d.sym(() => d.ell(12, 19.5, 1.4, 0.8, 0xffa0c0, { paint: [P.main] }));
    } },
    evoArt: { w: 46, h: 46, draw(d, P, o) {
      d.sym(() => { d.ell(9, 15, 8.5, 8.5, P.sub); d.ell(10, 31, 6.5, 6.5, P.acc); d.ell(8, 14, 3.5, 3.5, 0xffffff, { paint: [P.sub] }); d.ell(9.5, 31, 2.5, 2.5, 0xffffff, { paint: [P.acc] }); });
      d.poly([[23, 6], [27, 16], [38, 18], [30, 26], [33, 40], [23, 33], [13, 40], [16, 26], [8, 18], [19, 16]], P.main, { join: true });
      d.ell(23, 24, 9, 9, P.main, { spec: true, join: true });
      d.poly([[16, 8], [18, 2], [21, 6], [23, 0.5], [25, 6], [28, 2], [30, 8], [27, 10], [19, 10]], P.acc, { spec: true });
      face(d, P, o, 19.5, 23, 2.8, 23, 28, 2, "round", "angry");
      if (!o.back) d.sym(() => d.ell(17.5, 27, 1.6, 1, 0xffa0c0, { paint: [P.main] }));
    } } },

  { id: "drakeling", name: "DRAKELING", evo: "SKYDRAKE", from: "Vaccine · Dragon", price: 1200, hp: 4, special: { type: "blast", n: 3, charge: 5 },
    plus: "Dragon breath: 5 in a row, SPACE blasts the 3 closest targets.", minus: "Only 4 ♥",
    colors: { main: 0x6a72ff, sub: 0x3a3ab0, belly: 0xffe6a0, acc: 0xfff0d0, eye: 0xffa020 },
    art: { w: 34, h: 34, draw(d, P, o) {
      if (!o.back) { d.chain([[22, 30], [28, 30], [31, 25]], 2, 1, P.main); d.tri(29, 22, 33, 24, 30, 27, P.sub); }
      d.sym(() => batWing(d, 11, 19, 0.85, P.sub));
      d.sym(() => { d.ell(12, 31, 3.5, 2.6, P.main); claws(d, [10, 12], 33.5, P.acc); });
      d.ell(17, 25, 7, 6.5, P.main);
      if (!o.back) { d.ell(17, 26, 4, 5, P.belly, { paint: true }); d.rect(13, 25, 8, 0.8, 0xe0b870, { paint: [P.belly] }); d.rect(13, 28, 8, 0.8, 0xe0b870, { paint: [P.belly] }); }
      d.sym(() => d.cap(11, 23, 8, 27, 1.8, 1.5, P.main));
      d.ell(17, 13, 9, 7.5, P.main);
      d.ell(17, 17, 5, 3.5, P.main, { join: true });
      d.sym(() => d.cap(12, 8, 9, 2, 1.6, 0.6, P.acc, { spec: true }));
      face(d, P, o, 12.8, 12, 2.7, 17, 19.5, 2, "round", "angry", "fang");
      if (!o.back) d.px(15, 16.5, INK).px(19, 16.5, INK);
      if (o.back) { d.chain([[17, 28], [20, 33], [26, 32]], 2, 1, P.main); d.tri(25, 29, 29, 32, 25, 34, P.sub); }
    } },
    evoArt: { w: 46, h: 46, draw(d, P, o) {
      d.sym(() => batWing(d, 15, 20, 1.55, P.sub));
      d.sym(() => d.poly([[15, 20], [2, 9], [3, 13]], P.acc, { paint: [P.sub] }));
      if (!o.back) { d.chain([[30, 39], [38, 40], [43, 34]], 3, 1.4, P.main); d.tri(40, 30, 45, 32, 42, 37, P.sub); }
      d.sym(() => { d.ell(15, 41, 5, 4, P.main); claws(d, [12, 15, 18], 44.5, P.acc); });
      d.ell(23, 32, 9, 9, P.main);
      if (!o.back) { d.ell(23, 33, 5, 7, P.belly, { paint: true }); for (const y of [30, 33, 36]) d.rect(18, y, 10, 0.8, 0xe0b870, { paint: [P.belly] }); }
      d.sym(() => { d.cap(15, 28, 10, 35, 2.6, 2.1, P.main); claws(d, [8, 10], 37, P.acc); });
      d.ell(23, 15, 10, 8, P.main);
      d.ell(23, 20, 6.5, 4.5, P.main, { join: true });
      d.sym(() => d.chain([[17, 9], [13, 4], [12, 0.5]], 2.2, 0.7, P.acc, { spec: true }));
      d.sym(() => d.tri(14, 14, 9, 12, 13, 17, P.sub));
      face(d, P, o, 18.3, 14, 3, 23, 22.5, 3, "angry", "angry", "fang");
      if (!o.back) d.px(21, 19, INK).px(25, 19, INK);
      if (o.back) { d.chain([[23, 36], [27, 43], [34, 44]], 3, 1.4, P.main); d.tri(33, 40, 38, 43, 33, 46, P.sub); }
    } } },
];

/* =====================================================================
 *  ENEMIES (13 virus monsters). size: short / mid / long word groups
 * ===================================================================== */
const ENEMY_TYPES = {
  // --- short words: little in-training viruses ---
  slime: { size: "short", colors: { main: 0x7ae05a, sub: 0x3a9a3a, eye: 0xd02a2a },
    art: { w: 24, h: 20, draw(d, P, o) {
      d.ell(12, 14, 10, 5.5, P.main, { spec: true });
      d.ell(12, 10, 6.5, 6.5, P.main, { join: true, spec: true });
      d.cap(5, 14, 4, 18.5, 1.6, 1.3, P.main, { join: true });
      d.ell(15, 7, 1.4, 1.2, P.sub, { paint: [P.main] }); d.ell(8, 15, 1.2, 1, P.sub, { paint: [P.main] });
      face(d, P, o, 9.5, 11, 2, 12, 15, 1.5, "round", "angry", "fang");
    } } },
  bitbug: { size: "short", colors: { main: 0xd04ad8, sub: 0x6a2a8a, acc: 0x5affd0, eye: 0xffe04a },
    art: { w: 24, h: 20, draw(d, P, o) {
      d.sym(() => { d.cap(7, 13, 2, 17, 0.8, 0.6, P.sub); d.cap(7, 11, 1.5, 9, 0.8, 0.6, P.sub); d.cap(10, 4, 7, 0.8, 0.5, 0.5, P.sub); d.px(6, 0, P.acc); });
      d.ell(12, 13, 7.5, 5.5, P.main, { spec: true });
      d.rect(5, 12, 14, 1, P.acc, { paint: [P.main] });
      d.ell(12, 7, 5, 4, P.sub);
      face(d, P, o, 10, 7, 1.7, 0, 0, 0, "round", "angry");
    } } },
  ghostlet: { size: "short", colors: { main: 0xe8e4ff, sub: 0xb0a0f0, eye: 0x5a2ad0 },
    art: { w: 22, h: 22, draw(d, P, o) {
      d.ell(11, 9, 8, 7.5, P.main);
      d.rect(3, 9, 16, 8, P.main, { join: true });
      d.sym(() => { d.tri(3, 16, 7.5, 16, 4.5, 21, P.main, { join: true }); d.tri(7, 16, 11.5, 16, 9.5, 20, P.main, { join: true }); });
      d.sym(() => d.ell(2.5, 12, 2, 1.5, P.sub));
      face(d, P, o, 8, 9, 2, 11, 13, 1.5, "round", "angry");
    } } },
  bat: { size: "short", colors: { main: 0x6a4a9a, sub: 0x3a2a5a, eye: 0xffd23c },
    art: { w: 28, h: 18, draw(d, P, o) {
      d.sym(() => batWing(d, 11, 8, 0.95, P.sub));
      d.sym(() => d.tri(10, 5, 10, 0.5, 13, 4, P.main));
      d.ell(14, 9, 5, 5, P.main);
      face(d, P, o, 12, 8, 1.7, 14, 11, 1.5, "angry", "angry", "fang");
    } } },
  // --- mid words: rookie-level viruses ---
  goblin: { size: "mid", colors: { main: 0x7ac83a, sub: 0x4a7a2a, cloth: 0x8a5a3a, eye: 0xffd23c },
    art: { w: 32, h: 32, draw(d, P, o) {
      d.cap(25, 22, 28, 8, 1.4, 3, 0x8a5a2e); d.px(26, 8, 0xd8d0c0); d.px(29, 11, 0xd8d0c0);
      d.sym(() => { d.cap(13, 25, 12, 30, 1.8, 1.6, P.sub); d.ell(11.5, 30.5, 2.6, 1.3, P.cloth); });
      d.ell(16, 21, 6.5, 6, P.cloth);
      d.rect(10, 22, 12, 1.4, 0x5a3a20);
      d.cap(10, 19, 6, 24, 1.6, 1.4, P.main); d.cap(22, 19, 25.5, 22, 1.6, 1.4, P.main);
      d.sym(() => d.tri(10, 11, 2, 8, 10, 15, P.main));
      d.ell(16, 12, 6.5, 6, P.main);
      d.ell(16, 7.5, 6.2, 3, 0x9a9ab0);
      d.sym(() => d.cap(11, 7, 8, 2.5, 1, 0.4, 0xf1ead2));
      d.ell(16, 13.5, 1.6, 1.6, P.main);
      face(d, P, o, 13.2, 11.5, 1.9, 16, 16.5, 2, "angry", "angry", "fang");
    } } },
  shroom: { size: "mid", colors: { main: 0xe04a4a, stem: 0xf4e4c4, eye: 0x1a1030 },
    art: { w: 32, h: 30, draw(d, P, o) {
      d.sym(() => d.ell(12, 27.5, 3, 2, P.stem));
      d.ell(16, 21, 6.5, 6.5, P.stem);
      d.ell(16, 11, 14, 8.5, P.main, { spec: true });
      d.rect(3, 13, 26, 3, P.main, { join: true });
      for (const [x, y, r] of [[9, 8, 2.2], [20, 6, 2.4], [25, 12, 1.6], [14, 13, 1.4], [5, 13, 1.3]]) d.ell(x, y, r, r * 0.85, 0xffffff, { paint: [P.main] });
      face(d, P, o, 13.5, 21, 1.9, 16, 25, 2, "angry", "angry", "line");
    } } },
  crab: { size: "mid", colors: { main: 0x3a8ae0, sub: 0x2a5aa0, eye: 0x1a1030 },
    art: { w: 34, h: 26, draw(d, P, o) {
      d.sym(() => { d.cap(10, 20, 5, 24.5, 0.9, 0.7, P.sub); d.cap(11, 21, 8, 25, 0.9, 0.7, P.sub); d.cap(8, 18, 3, 21, 0.9, 0.7, P.sub); });
      d.sym(() => { d.cap(9, 16, 5, 10, 1.6, 1.4, P.main); d.ell(5, 7, 4, 3.4, P.main, { spec: true }); d.cap(4, 6, 2, 1.5, 1.4, 0.6, P.main); d.cap(6, 6, 8, 1.5, 1.2, 0.5, P.main); });
      d.ell(17, 18, 10, 6.5, P.main, { spec: true });
      d.sym(() => d.cap(14, 14, 13, 9, 0.8, 0.8, P.sub));
      if (!o.back) d.sym(() => d.eye(13, 8.5, 1.8, o.atk ? "angry" : "round", P.eye));
      if (!o.back) d.mouth(17, 19, 2, o.atk ? "open" : "fang");
    } } },
  wisp: { size: "mid", colors: { main: 0xff6a2a, sub: 0xffd04a, eye: 0x1a1030 },
    art: { w: 30, h: 32, draw(d, P, o) {
      d.poly([[15, 1], [20, 9], [25, 6], [25, 17], [22, 28], [8, 28], [5, 17], [5, 6], [10, 9]], P.main);
      d.ell(15, 21, 7, 7, P.sub, { paint: [P.main] });
      d.ell(15, 24, 4, 3.5, 0xfff6c0, { paint: [P.sub] });
      d.px(3, 3, P.sub).px(27, 2, P.sub).px(26, 25, P.main);
      face(d, P, o, 12, 18, 2.2, 15, 22, 1.5, "round", "angry");
    } } },
  raven: { size: "mid", colors: { main: 0x3a3a5a, sub: 0x2a2a44, acc: 0xffc23a, eye: 0xff3a3a },
    art: { w: 34, h: 32, draw(d, P, o) {
      d.sym(() => featherWing(d, 13, 16, 0.95, P.sub, 0x5a5a8a));
      d.sym(() => { d.cap(15, 25, 15, 29.5, 0.8, 0.8, P.acc); claws(d, [14, 16], 30.5, P.acc); });
      d.ell(17, 20, 6, 7, P.main);
      d.ell(17, 10, 5.5, 5, P.main);
      d.tri(15, 11, 19, 11, 17, o.atk ? 17 : 15.5, P.acc);
      if (!o.back) d.sym(() => d.eye(14.5, 9, 1.7, "angry", P.eye));
    } } },
  // --- long words: champion-level viruses ---
  ogre: { size: "long", colors: { main: 0x9a6ad8, sub: 0x5a3a8a, belly: 0xd8b8f0, eye: 0xffd23c },
    art: { w: 42, h: 42, draw(d, P, o) {
      d.cap(35, 12, 36, 32, 1.6, 3.8, 0x8a5a2e); for (const [x, y] of [[33, 9], [38, 10], [33, 15], [39, 15]]) d.px(x, y, 0xd8d0c0);
      d.sym(() => { d.cap(15, 32, 14, 39, 3.4, 3, P.main); d.ell(14, 40.5, 4, 1.6, P.sub); });
      d.poly([[12, 30], [30, 30], [27, 37], [15, 37]], 0x8a5a3a);
      d.ell(21, 24, 11, 9.5, P.main);
      if (!o.back) d.ell(21, 27, 7, 5.5, P.belly, { paint: true });
      d.cap(11, 19, 6, 29, 3, 2.6, P.main); d.ell(6, 30.5, 3.2, 3, P.main);
      d.cap(31, 19, 35, 27, 3, 2.6, P.main); d.ell(35, 28, 3, 3, P.main);
      d.ell(21, 11, 8, 7, P.main);
      d.cap(21, 5, 21, 0.5, 1.8, 0.5, 0xf1ead2, { spec: true });
      if (!o.back) d.sym(() => d.cap(18, 16, 17.5, 12.5, 0.9, 0.4, 0xf1ead2));
      face(d, P, o, 18, 10, 2.2, 21, 15, 3, "angry", "angry", "fang");
    } } },
  golem: { size: "long", colors: { main: 0x7a7a8e, sub: 0x55556a, acc: 0xff3a5a, eye: 0xff3a5a },
    art: { w: 42, h: 42, draw(d, P, o) {
      d.sym(() => d.rect(12, 31, 7, 10, P.sub));
      d.rect(9, 15, 24, 17, P.main);
      d.cap(15, 19, 19, 27, 0.7, 0.7, P.acc, { paint: [P.main] }); d.cap(27, 18, 24, 28, 0.7, 0.7, P.acc, { paint: [P.main] }); d.ell(21, 23, 2, 2, P.acc, { paint: [P.main] });
      d.sym(() => { d.rect(2, 15, 7, 13, P.main); d.rect(1, 27, 9, 7, P.sub); });
      d.rect(15, 4, 12, 11, P.main);
      d.rect(15, 2, 12, 3, P.sub);
      if (!o.back) d.eye(21, 9, o.atk ? 3.4 : 2.8, "slit", P.eye);
    } } },
  serpent: { size: "long", colors: { main: 0x3aa86a, sub: 0x2a6a8a, belly: 0xd8f0a0, eye: 0xffd23c },
    art: { w: 42, h: 42, draw(d, P, o) {
      d.ell(21, 36, 16, 5.5, P.main);
      d.ell(21, 37, 11, 3, P.belly, { paint: [P.main] });
      d.chain([[31, 35], [35, 27], [29, 21], [21, 18]], 5.2, 4.2, P.main);
      d.sym(() => d.poly([[15, 9], [6, 3], [8, 9], [5, 13], [14, 14]], P.sub));
      d.ell(21, 12, 8, 6.5, P.main);
      d.ell(21, 16.5, 6, 3.2, P.main, { join: true });
      d.cap(21, 7, 21, 2, 1.2, 0.5, P.sub);
      face(d, P, o, 17.5, 11, 2.2, 21, 17, 2.5, "slit", "slit", "fang");
    } } },
  knight: { size: "long", colors: { main: 0x5a6078, sub: 0x3a3f58, acc: 0xd8a830, cape: 0x8a1a2e, eye: 0xff3a3a },
    art: { w: 42, h: 42, draw(d, P, o) {
      d.poly([[13, 16], [29, 16], [33, 38], [9, 38]], P.cape);
      d.cap(34, 3, 34, 28, 1.1, 1.1, 0xd8e0f0, { spec: true }); d.rect(30.5, 27, 7, 2, P.acc);
      d.sym(() => d.rect(15, 30, 5, 10.5, P.main));
      d.rect(13, 17, 16, 14, P.main);
      d.tri(17, 20, 25, 20, 21, 27, P.acc, { paint: [P.main] });
      d.cap(28, 20, 33, 29, 2.4, 2, P.main); d.ell(34, 30, 2.2, 2.2, P.sub);
      d.poly([[3, 17], [13, 17], [13, 28], [8, 33], [3, 28]], P.sub);
      d.cap(8, 20, 8, 29, 0.8, 0.8, P.acc, { paint: [P.sub] }); d.cap(5, 23, 11, 23, 0.8, 0.8, P.acc, { paint: [P.sub] });
      d.ell(21, 10, 7, 7.5, P.main, { spec: true });
      d.chain([[21, 3], [25, 1], [29, 4]], 1.6, 1, P.cape);
      if (!o.back) { d.rect(15.5, 8.5, 11, 3, 0x1a1a2a); d.eye(21, 10, 4, "visor", o.atk ? 0xffd23c : P.eye); }
    } } },
};
const ENEMY_SIZES = { short: [], mid: [], long: [] };
for (const [id, e] of Object.entries(ENEMY_TYPES)) { e.id = id; ENEMY_SIZES[e.size].push(id); }

/* =====================================================================
 *  BOSSES: 15 ultimate / mega monsters (unlocked by tamer level, in this
 *  order) + 17 festival bosses (event: field, only during that festival).
 * ===================================================================== */
const BOSSES = [
  { name: "DATA KRAKEN", kind: "Ultimate", colors: { main: 0x8a4ad8, sub: 0x5a2a9a, acc: 0x5affd0, belly: 0xd8a8ff, eye: 0xffd23c },
    art: { w: 72, h: 64, draw(d, P, o) {
      d.sym(() => {
        d.chain([[28, 38], [16, 44], [7, 41], [4, 33]], 4.2, 1.4, P.main);
        d.chain([[30, 42], [24, 53], [14, 59], [8, 55]], 4.2, 1.4, P.main);
        d.chain([[33, 44], [31, 56], [27, 62]], 4.2, 1.6, P.main);
        for (const [x, y] of [[14, 44], [20, 52], [30, 54]]) d.ell(x, y, 1.4, 1.2, P.belly, { paint: [P.main] });
      });
      d.ell(36, 22, 17, 19, P.main, { spec: true });
      d.ell(36, 38, 13, 7, P.main, { join: true });
      for (const [x, y, r] of [[28, 11, 2.6], [45, 14, 2], [37, 6, 1.6], [24, 22, 1.4], [49, 24, 1.6]]) d.ell(x, y, r, r * 0.8, P.acc, { paint: [P.main] });
      face(d, P, o, 29.5, 29, 4.5, 36, 39, 4, "slit", "slit", "line");
    } } },
  { name: "IRON GOLIATH", kind: "Ultimate", colors: { main: 0x8a9ab8, sub: 0x4a5a78, acc: 0xff3a3a, eye: 0xffd23c },
    art: { w: 72, h: 64, draw(d, P, o) {
      d.sym(() => { d.rect(23, 46, 10, 12, P.sub); d.rect(19, 57, 16, 6.5, P.main); });
      d.rect(18, 22, 36, 26, P.main);
      d.poly([[24, 25], [48, 25], [44, 42], [28, 42]], P.sub);
      d.ell(36, 33, 4.5, 4.5, P.acc, { spec: true });
      d.sym(() => { d.rect(5, 30, 9, 16, P.sub); d.ell(10, 49, 7, 6, P.main, { spec: true }); d.ell(14, 24, 9.5, 8, P.main, { spec: true }); d.rect(8, 21, 12, 2, P.acc, { paint: [P.main] }); });
      d.sym(() => d.cap(30, 10, 26, 2, 1.1, 0.6, P.sub)); d.sym(() => d.px(25, 1, P.acc));
      d.rect(27, 8, 18, 15, P.main);
      if (!o.back) { d.rect(29, 13, 14, 5, 0x1a1a2a); d.eye(36, 15.5, 6, "visor", o.atk ? P.acc : P.eye); }
      if (o.atk) d.rect(31, 19, 10, 1.6, P.acc);
    } } },
  { name: "TITAN BEETLE", kind: "Ultimate", colors: { main: 0x3aa85a, sub: 0x2a3440, acc: 0xffd23c, eye: 0xff3a3a },
    art: { w: 72, h: 62, draw(d, P, o) {
      d.sym(() => { d.chain([[24, 42], [12, 50], [8, 60]], 2.6, 1.6, P.sub); d.chain([[24, 36], [10, 36], [4, 44]], 2.6, 1.6, P.sub); d.chain([[26, 46], [20, 56], [20, 61]], 2.6, 1.6, P.sub); });
      d.ell(36, 34, 23, 17, P.main, { spec: true });
      d.rect(35.5, 18, 1.2, 30, 0x1f6a38, { paint: [P.main] });
      d.ell(36, 42, 12, 9, P.sub);
      d.sym(() => d.chain([[30, 37], [22, 28], [19, 22]], 2.6, 0.8, P.main, { spec: true }));
      d.chain([[36, 38], [36, 20], [40, 8], [47, 3]], 5, 1.4, P.main, { spec: true });
      d.sym(() => d.ell(24, 26, 2, 1.6, P.acc, { paint: [P.main] }));
      face(d, P, o, 30, 43, 3, 36, 48, 3, "angry", "angry", "line");
    } } },
  { name: "THUNDERBIRD", kind: "Ultimate", colors: { main: 0xffd23c, sub: 0x3a6ad8, acc: 0x9ff0ff, belly: 0xfff0b0, beak: 0xff9a2a, eye: 0x5ad0ff },
    art: { w: 76, h: 60, draw(d, P, o) {
      d.sym(() => { featherWing(d, 30, 28, 2.15, P.sub, P.acc); d.poly([[16, 16], [22, 22], [18, 23], [25, 30]], P.main, { paint: [P.sub] }); });
      d.poly([[30, 42], [46, 42], [50, 58], [38, 54], [26, 58]], P.sub);
      d.sym(() => { d.cap(33, 44, 32, 52, 1.4, 1.2, P.beak); claws(d, [29, 31, 33], 53, P.beak); });
      d.ell(38, 34, 9, 12, P.main);
      d.ell(38, 38, 6, 8, P.belly, { paint: [P.main] });
      d.sym(() => d.poly([[36, 10], [28, 2], [31, 7], [26, 6], [33, 12]], P.acc));
      d.ell(38, 16, 8, 7.5, P.main);
      face(d, P, o, 34.5, 15, 2.8, 0, 0, 0, "angry", "angry");
      d.tri(35, 18, 41, 18, 38, o.atk ? 27 : 24, P.beak);
    } } },
  { name: "SKULL REAPER", kind: "Ultimate", colors: { main: 0x3a2a5a, sub: 0x24183c, bone: 0xf0e8d8, eye: 0xff3a5a },
    art: { w: 64, h: 64, draw(d, P, o) {
      d.cap(54, 6, 50, 62, 1.4, 1.4, 0x6a4a2a);
      d.poly([[54, 7], [36, 1], [24, 6], [38, 6], [52, 13]], 0xc8d0e0, { spec: true });
      d.poly([[32, 6], [46, 18], [52, 56], [44, 52], [38, 60], [32, 53], [26, 60], [20, 52], [12, 56], [18, 18]], P.main);
      d.sym(() => d.cap(20, 22, 12, 34, 4, 3, P.main));
      d.ell(50, 34, 3, 3, P.bone); d.ell(13, 36, 3, 3, P.bone);
      d.ell(32, 16, 12, 12, P.main);
      d.ell(32, 19, 8, 8.5, P.sub);
      d.ell(32, 19, 6.5, 7, P.bone);
      d.rect(28.5, 24, 7, 2.2, P.bone, { join: true });
      if (!o.back) {
        d.sym(() => d.ell(29, 18.5, 2.2, 2.4, 0x1a0c24));
        d.sym(() => { d.px(28, 18, P.eye); d.px(29, 18, P.eye); if (o.atk) d.px(28, 19, P.eye); });
        d.px(31, 22, INK).px(32, 22, INK);
        for (const x of [29, 31, 33, 35]) d.px(x, 25, INK);
      }
    } } },
  { name: "VENOM HYDRA", kind: "Ultimate", colors: { main: 0x5a9a3a, sub: 0x8a3ad8, belly: 0xe0f0a0, eye: 0xffd23c },
    art: { w: 72, h: 64, draw(d, P, o) {
      d.sym(() => { d.ell(22, 58, 6, 4.5, P.main); claws(d, [18, 21, 24], 62.5, 0xf1ead2); });
      d.ell(36, 48, 20, 12, P.main);
      d.ell(36, 51, 12, 7, P.belly, { paint: [P.main] });
      d.sym(() => { d.chain([[28, 44], [18, 34], [12, 22]], 4.6, 3.4, P.main); d.ell(12, 18, 6.5, 5.5, P.main); d.tri(8, 14, 6, 6, 12, 13, P.sub); });
      d.chain([[36, 44], [36, 30], [36, 18]], 5.4, 4.2, P.main);
      d.ell(36, 13, 7.5, 6.5, P.main);
      d.sym(() => d.tri(32, 8, 30, 1, 35, 7, P.sub));
      for (const y of [34, 40]) d.tri(33, y, 39, y, 36, y - 4, P.sub);
      if (!o.back) {
        d.sym(() => { d.eye(9.5, 17.5, 1.8, "slit", P.eye); d.eye(14.5, 17.5, 1.8, "slit", P.eye); d.mouth(12, 21.5, 2, o.atk ? "open" : "fang"); });
        d.sym(() => d.eye(32.5, 12, 2.4, "slit", P.eye)); d.mouth(36, 16.5, 3, o.atk ? "roar" : "fang");
      }
    } } },
  { name: "FROST YETI", kind: "Ultimate", colors: { main: 0xf4f8ff, sub: 0xc8e0f8, face: 0x6a9ad8, acc: 0x9ff0ff, eye: 0xff3a3a },
    art: { w: 64, h: 64, draw(d, P, o) {
      d.sym(() => { d.ell(22, 56, 8, 7, P.main); claws(d, [17, 20, 23], 62.5, P.face); });
      d.ell(32, 40, 18, 16, P.main);
      d.ell(32, 44, 10, 10, P.sub, { paint: [P.main] });
      d.sym(() => { d.cap(16, 30, 8, 47, 6, 5.5, P.main); d.ell(8, 50, 6, 5, P.face); });
      d.sym(() => d.chain([[24, 12], [18, 6], [18, 1]], 3, 1, P.acc, { spec: true }));
      d.ell(32, 20, 12, 11, P.main);
      d.ell(32, 23, 8, 7, P.face, { paint: [P.main] });
      face(d, P, o, 29, 21, 2.6, 32, 27, 3, "angry", "angry", "fang");
    } } },
  { name: "LAVA BEHEMOTH", kind: "Ultimate", colors: { main: 0x4a3a3a, sub: 0x6a4a40, acc: 0xff6a1a, horn: 0xf0e0c0, eye: 0xffd23c },
    art: { w: 72, h: 60, draw(d, P, o) {
      for (const [x, h] of [[22, 12], [30, 16], [42, 16], [50, 12]]) d.tri(x - 4, 26, x + 4, 26, x, 26 - h, P.acc);
      d.sym(() => { d.cap(20, 44, 18, 56, 5, 4.5, P.main); d.rect(13, 56, 10, 3.5, P.sub); });
      d.ell(36, 38, 24, 15, P.main);
      d.chain([[18, 34], [24, 40], [22, 46]], 0.8, 0.8, P.acc, { paint: [P.main] }); d.chain([[54, 32], [49, 38], [52, 46]], 0.8, 0.8, P.acc, { paint: [P.main] });
      d.sym(() => d.chain([[28, 24], [18, 20], [14, 10]], 3.4, 1, P.horn, { spec: true }));
      d.ell(36, 30, 11, 10, P.main);
      d.ell(36, 37, 7, 5, P.sub);
      d.ring(36, 41, 3, 2.4, 1, 0xd8a830);
      face(d, P, o, 31, 28, 2.8, 0, 0, 0, "angry", "angry");
      d.sym(() => d.px(33, 36, INK));
      d.tri(35, 21, 37, 21, 36, 25, P.acc, { paint: [P.main] });
    } } },
  { name: "PUPPET KING", kind: "Mega", colors: { main: 0xd83a5a, sub: 0x3a5ad8, face: 0xf0d0a0, acc: 0xffd23c, eye: 0x8a3ad8 },
    art: { w: 64, h: 64, draw(d, P, o) {
      d.sym(() => { d.cap(14, 0, 14, 38, 0.35, 0.35, 0xd8d0e8); d.cap(26, 0, 26, 12, 0.35, 0.35, 0xd8d0e8); });
      d.rect(8, 0, 48, 2, 0x6a4a2a);
      d.sym(() => { d.cap(28, 46, 26, 60, 2.4, 2, P.sub); d.ell(25, 61, 4, 2.2, P.acc); });
      d.poly([[32, 30], [44, 34], [42, 48], [32, 52], [22, 48], [20, 34]], P.main);
      d.poly([[32, 30], [38, 41], [32, 52], [26, 41]], P.sub, { paint: [P.main] });
      d.sym(() => { d.cap(22, 33, 14, 38, 2.2, 2, P.main); d.ell(13, 39, 2.6, 2.6, P.face); });
      d.sym(() => d.poly([[22, 30], [12, 26], [14, 32], [22, 34]], 0xffffff));
      d.ell(32, 21, 9, 9, P.face, { spec: true });
      d.poly([[22, 14], [24, 4], [28, 10], [32, 2], [36, 10], [40, 4], [42, 14]], P.acc, { spec: true });
      if (!o.back) { d.sym(() => d.ell(26, 25, 1.8, 1.2, 0xff8aa0, { paint: [P.face] })); d.mouth(32, 26, 3, o.atk ? "roar" : "line"); }
      face(d, P, o, 28.5, 21, 2.6, 0, 0, 0, "round", "angry");
    } } },
  { name: "CHAOS KNIGHT", kind: "Mega", colors: { main: 0x3a3a50, sub: 0x24243a, acc: 0xc83a3a, gold: 0xd8a830, eye: 0xff3a3a },
    art: { w: 64, h: 64, draw(d, P, o) {
      d.poly([[22, 18], [42, 18], [52, 58], [32, 54], [12, 58]], P.acc);
      d.cap(54, 2, 50, 50, 1, 2.6, 0xc8d0e0, { spec: true }); d.ell(51, 50, 3, 3, P.gold);
      d.sym(() => { d.rect(22, 44, 8, 16, P.main); d.rect(20, 58, 11, 4, P.sub); });
      d.rect(18, 22, 28, 24, P.main);
      d.poly([[24, 26], [40, 26], [36, 40], [28, 40]], P.sub);
      d.ell(32, 32, 3, 3, P.acc, { spec: true });
      d.sym(() => { d.ell(15, 24, 8, 6, P.main, { spec: true }); for (const x of [10, 15, 20]) d.tri(x - 2, 20, x + 2, 20, x, 13, P.gold); });
      d.sym(() => d.cap(14, 28, 10, 44, 3.4, 3, P.main));
      d.ell(32, 14, 8, 8.5, P.main, { spec: true });
      d.sym(() => d.chain([[26, 10], [20, 4], [21, 0.5]], 2, 0.7, P.gold, { spec: true }));
      if (!o.back) { d.rect(25, 12, 14, 4, 0x0e0e18); d.sym(() => d.eye(28.5, 14, 1.6, "slit", o.atk ? 0xffd23c : P.eye)); }
    } } },
  { name: "VIRUS QUEEN", kind: "Mega", colors: { main: 0xffc23a, sub: 0x2c2440, acc: 0xc85ae8, wing: 0xb8f0ff, eye: 0xff3a5a },
    art: { w: 68, h: 64, draw(d, P, o) {
      d.sym(() => { d.ell(14, 18, 12, 8, P.wing); d.ell(16, 32, 9, 6, P.wing); d.cap(26, 16, 6, 14, 0.4, 0.4, 0xffffff, { paint: [P.wing] }); });
      d.ell(34, 50, 9, 12, P.main);
      for (const y of [44, 50, 56]) d.rect(25, y, 18, 2, P.sub, { paint: [P.main] });
      d.tri(31, 60, 37, 60, 34, 64, P.sub);
      d.sym(() => { d.chain([[28, 30], [18, 38], [16, 48]], 1.4, 1, P.sub); d.chain([[28, 28], [16, 26], [12, 18]], 1.4, 1, P.sub); });
      d.ell(34, 30, 8, 9, P.sub);
      d.ell(34, 30, 5, 6, P.acc, { paint: [P.sub] });
      d.ell(34, 16, 8, 7.5, P.main);
      d.sym(() => d.chain([[31, 10], [26, 4], [22, 3]], 0.7, 0.5, P.sub)); d.sym(() => d.ell(22, 3, 1.5, 1.5, P.acc));
      d.poly([[27, 10], [29, 3], [32, 8], [34, 1], [36, 8], [39, 3], [41, 10]], P.acc, { spec: true });
      face(d, P, o, 30.5, 16, 3, 34, 21, 2, "slit", "slit", "fang");
    } } },
  { name: "ABYSS WHALE", kind: "Mega", colors: { main: 0x2a4a8a, sub: 0x1a2a5a, belly: 0xb8d8f0, acc: 0x5affd0, eye: 0xffd23c },
    art: { w: 80, h: 56, draw(d, P, o) {
      d.sym(() => d.poly([[18, 34], [2, 44], [4, 50], [20, 42]], P.sub));
      d.sym(() => d.poly([[26, 14], [10, 2], [12, 8], [22, 18]], P.sub));
      d.ell(40, 28, 30, 22, P.main, { spec: true });
      d.ell(40, 40, 22, 11, P.belly, { paint: [P.main] });
      for (let i = 0; i < 6; i++) d.rect(24 + i * 6, 34, 1, 14, 0x8ab0d0, { paint: [P.belly] });
      for (const [x, y] of [[26, 14], [54, 12], [40, 8], [18, 26], [62, 26]]) d.ell(x, y, 1.6, 1.4, P.acc, { paint: [P.main] });
      face(d, P, o, 27, 24, 3.4, 40, 34, 8, "angry", "angry", "line");
    } } },
  { name: "GLITCH CHIMERA", kind: "Mega", colors: { main: 0xc89a4a, sub: 0x8a5a2a, acc: 0xff3ad8, acc2: 0x3affe8, horn: 0xe8e0d0, snake: 0x5a9a3a, eye: 0xff3a3a },
    art: { w: 72, h: 60, draw(d, P, o) {
      d.chain([[52, 40], [64, 36], [68, 24], [62, 16]], 3, 2.4, P.snake); d.ell(61, 14, 4, 3.4, P.snake);
      d.sym(() => { d.cap(22, 44, 20, 56, 4.4, 4, P.main); claws(d, [17, 20, 23], 59.5, P.horn); });
      d.ell(36, 38, 20, 13, P.main);
      d.sym(() => d.ell(28, 22, 10, 12, P.sub));
      d.ell(36, 24, 11, 10, P.main);
      d.ell(36, 30, 6, 4.5, P.main, { join: true });
      d.sym(() => d.chain([[30, 17], [22, 13], [20, 20]], 2.4, 1.2, P.horn, { spec: true }));
      for (const [x, y, w, h, c] of [[12, 30, 6, 3, P.acc], [50, 22, 5, 3, P.acc2], [40, 44, 7, 2, P.acc], [24, 46, 4, 2, P.acc2], [44, 16, 4, 2, P.acc2]]) d.rect(x, y, w, h, c, { paint: true });
      face(d, P, o, 31.5, 23, 2.8, 36, 31, 3, "angry", "angry", "fang");
      if (!o.back) d.eye(60, 13.5, 1.4, "slit", 0xffd23c);
    } } },
  { name: "METAL DRAGON", kind: "Mega", colors: { main: 0xa8b4c8, sub: 0x5a6680, acc: 0x3ad0ff, eye: 0xff3a3a },
    art: { w: 76, h: 64, draw(d, P, o) {
      d.sym(() => { batWing(d, 26, 24, 2.3, P.sub); d.poly([[26, 24], [5, 8], [7, 12]], P.acc, { paint: [P.sub] }); });
      d.chain([[44, 52], [56, 58], [66, 52]], 3.4, 1.4, P.main);
      d.sym(() => { d.cap(30, 48, 28, 59, 4, 3.4, P.main); claws(d, [25, 28, 31], 63, P.acc); });
      d.ell(38, 40, 12, 13, P.main, { spec: true });
      for (const y of [33, 38, 43, 48]) d.rect(32, y, 12, 1.2, P.sub, { paint: [P.main] });
      d.cap(27, 36, 18, 44, 3.4, 3, P.main); d.rect(10, 41, 10, 6, P.sub); d.ell(9, 44, 2, 2.6, P.acc, { spec: true });
      d.cap(49, 36, 56, 46, 3, 2.6, P.main); claws(d, [55, 57, 59], 50, P.acc);
      d.ell(38, 20, 10, 8, P.main, { spec: true });
      d.ell(38, 26, 7, 4.5, P.main, { join: true });
      d.sym(() => d.chain([[32, 14], [26, 8], [24, 2]], 2.4, 0.8, P.sub));
      face(d, P, o, 33.5, 19, 2.8, 38, 27, 4, "slit", "slit", "fang");
    } } },
  { name: "OMEGA DRAGON", kind: "Mega", colors: { main: 0x2c2a44, sub: 0x5a2a8a, acc: 0xffd23c, glow: 0xff3a6a, belly: 0x6a5a8a, eye: 0xff3a3a },
    art: { w: 80, h: 64, draw(d, P, o) {
      d.sym(() => { batWing(d, 30, 22, 2.5, P.sub); batWing(d, 30, 34, 1.7, P.main); d.poly([[30, 22], [8, 5], [10, 9]], P.glow, { paint: [P.sub] }); });
      d.chain([[48, 54], [62, 60], [74, 52]], 3.6, 1.2, P.main);
      d.sym(() => { d.cap(32, 50, 30, 60, 4.4, 3.8, P.main); claws(d, [27, 30, 33], 63, P.acc); });
      d.ell(40, 42, 13, 13, P.main, { spec: true });
      d.ell(40, 44, 7, 10, P.belly, { paint: [P.main] });
      d.ell(40, 38, 3, 3, P.glow, { spec: true });
      d.sym(() => { d.cap(30, 38, 24, 47, 3, 2.6, P.main); claws(d, [22, 24, 26], 50, P.acc); });
      d.chain([[40, 32], [40, 24]], 5, 4.4, P.main);
      d.ell(40, 18, 10, 8, P.main, { spec: true });
      d.ell(40, 24, 7, 4.5, P.main, { join: true });
      d.sym(() => { d.chain([[33, 12], [27, 6], [26, 0.5]], 2.6, 0.8, P.acc, { spec: true }); d.chain([[34, 16], [27, 15], [24, 10]], 1.8, 0.6, P.acc); });
      d.poly([[35, 10], [37, 5], [40, 9], [43, 5], [45, 10]], P.acc, { spec: true });
      face(d, P, o, 35.5, 17, 2.8, 40, 25, 4, "slit", "slit", "fang");
    } } },
  /* ---- festival bosses (only appear during their festival) ---- */
  { name: "JADE RABBIT MOON", kind: "Festival Boss", event: "midautumn", orbit: "lantern", colors: { moon: 0xf3e6b0, crater: 0xd9c98f, white: 0xf7f7fb, pink: 0xff9ab8, eye: 0xff3a5a },
    art: { w: 64, h: 64, draw(d, P, o) {
      d.ell(32, 42, 24, 21, P.moon, { spec: true });
      for (const [x, y, r] of [[18, 44, 3.4], [44, 50, 4], [40, 34, 2.4], [24, 56, 2.2], [50, 40, 1.8]]) d.ell(x, y, r, r * 0.8, P.crater, { paint: [P.moon] });
      d.sym(() => { d.cap(28, 15, 25, 2, 2.6, 2, P.white); d.cap(28, 14, 25.5, 4, 1, 0.8, P.pink, { paint: [P.white] }); });
      d.ell(32, 30, 9, 8, P.white);
      d.sym(() => d.ell(26, 36, 3, 2.2, P.white));
      d.ell(32, 19, 8.5, 7.5, P.white);
      if (!o.back) d.sym(() => d.ell(27, 22, 1.6, 1, P.pink, { paint: [P.white] }));
      face(d, P, o, 28.5, 18.5, 2.4, 32, 23, 1.5, "round", "angry");
    } } },
  { name: "GOLDEN DRAGON", kind: "Festival Boss", event: "cny", colors: { main: 0xd8282a, gold: 0xffc23a, belly: 0xffe08a, eye: 0xffd23c },
    art: { w: 80, h: 56, draw(d, P, o) {
      d.chain([[6, 46], [16, 38], [28, 46], [42, 40], [54, 48], [66, 40], [76, 28]], 4.6, 2.6, P.main);
      d.chain([[6, 47], [16, 39], [28, 47], [42, 41], [54, 49], [66, 41], [76, 29]], 1.6, 1, P.belly, { paint: [P.main] });
      d.tri(72, 22, 79, 26, 75, 32, P.gold);
      d.sym(() => d.poly([[32, 16], [22, 20], [26, 26], [20, 32], [30, 34]], P.gold));
      d.sym(() => { d.chain([[34, 14], [29, 7], [26, 1]], 1.8, 0.8, P.gold, { spec: true }); d.cap(30, 8, 24, 6, 1, 0.6, P.gold); });
      d.ell(40, 22, 11, 9.5, P.main, { spec: true });
      d.ell(40, 29, 8, 5, P.main, { join: true });
      d.ell(40, 33, 6, 2.6, P.belly);
      d.sym(() => d.chain([[34, 30], [24, 34], [18, 30], [16, 34]], 0.9, 0.6, P.gold));
      d.sym(() => d.ell(36, 15, 2, 1.6, P.gold, { paint: [P.main] }));
      face(d, P, o, 35, 21, 3, 0, 0, 0, "angry", "angry");
      if (!o.back) { d.sym(() => d.px(37, 28, INK)); d.mouth(40, 32, 4, o.atk ? "roar" : "fang"); }
    } } },
  { name: "CENTENNIAL TITAN", kind: "Festival Boss", event: "anniversary", colors: { main: 0xe0b040, sub: 0x2a5ad8, mane: 0xd8782a, face: 0xf0c060, acc: 0xff3a5a, eye: 0x2a6ad8 },
    art: { w: 64, h: 64, draw(d, P, o) {
      d.poly([[20, 22], [44, 22], [54, 60], [10, 60]], P.sub);
      d.sym(() => { d.rect(22, 46, 8, 14, P.main); d.rect(20, 58, 11, 5, P.sub); });
      d.rect(18, 26, 28, 22, P.main);
      d.poly([[27, 30], [37, 30], [32, 40]], P.acc, { paint: [P.main] });
      d.sym(() => { d.ell(15, 28, 7, 6, P.main, { spec: true }); d.cap(14, 32, 10, 46, 3.4, 3, P.main); });
      d.cap(52, 30, 52, 44, 1.2, 1.2, P.main); d.poly([[46, 22], [58, 22], [56, 30], [48, 30]], P.main, { spec: true }); d.ring(52, 26, 7, 4, 1.4, P.main);
      d.ell(32, 16, 13, 12, P.mane);
      d.ell(32, 17, 9, 8.5, P.face, { spec: true });
      d.ell(32, 22, 4.5, 3, 0xfff0c8, { join: true });
      d.poly([[22, 8], [24, 0.5], [28, 5], [32, 0], [36, 5], [40, 0.5], [42, 8]], P.main, { spec: true });
      d.sym(() => d.px(27, 4, P.acc)); d.px(32, 3, P.sub);
      face(d, P, o, 28.5, 16, 2.6, 32, 24, 2, "round", "angry", "fang");
      if (!o.back) d.ell(32, 20.6, 1.6, 1, INK);
    } } },
  { name: "LANTERN TITAN", kind: "Festival Boss", event: "lantern", orbit: "lantern", colors: { main: 0xe8302a, gold: 0xffc23a, glow: 0xffe08a, eye: 0x1a1030 },
    art: { w: 64, h: 64, draw(d, P, o) {
      for (const x of [26, 32, 38]) { d.cap(x, 52, x, 62, 0.8, 0.8, P.gold); d.ell(x, 62, 1.6, 1.4, P.main); }
      d.sym(() => { d.cap(14, 30, 6, 40, 2.4, 2, P.gold); d.ell(5.5, 41, 2.6, 2.6, P.gold); });
      d.ell(32, 32, 20, 18, P.main, { spec: true });
      for (const x of [20, 26, 38, 44]) d.rect(x, 15, 1, 34, 0xb01a1a, { paint: [P.main] });
      d.ell(32, 34, 9, 7, P.glow, { paint: [P.main] });
      d.rect(20, 11, 24, 5, P.gold); d.rect(20, 48, 24, 5, P.gold);
      d.cap(32, 11, 32, 3, 0.8, 0.8, P.gold); d.ring(32, 2.5, 2.4, 2.4, 1, P.gold);
      face(d, P, o, 27, 32, 2.8, 32, 38, 3, "round", "angry");
    } } },
  { name: "DRAGON BOAT DREADNOUGHT", kind: "Festival Boss", event: "dragonboat", colors: { main: 0x2f9a4a, wood: 0x9a6a3a, red: 0xd8282a, gold: 0xffc23a, eye: 0xffd23c },
    art: { w: 80, h: 52, draw(d, P, o) {
      d.sym(() => { for (const [x, y] of [[14, 38], [22, 40], [30, 42]]) { d.cap(x, y, x - 10, y + 10, 0.9, 0.9, P.wood); d.ell(x - 10, y + 10, 1.6, 2.4, P.wood); } });
      d.poly([[2, 34], [78, 34], [70, 46], [10, 46]], P.wood);
      d.rect(2, 33, 76, 3, P.red); d.rect(8, 40, 64, 1.2, P.gold, { paint: [P.wood] });
      d.sym(() => d.poly([[34, 12], [20, 8], [24, 14], [18, 18], [30, 22]], P.red));
      d.sym(() => d.chain([[35, 10], [31, 4], [30, 0.5]], 1.8, 0.7, P.gold, { spec: true }));
      d.ell(40, 18, 10, 9, P.main, { spec: true });
      d.ell(40, 25, 8, 5.5, P.main, { join: true });
      d.ell(40, 30, 8, 3, P.gold);
      d.sym(() => d.chain([[34, 26], [26, 30], [22, 27]], 0.8, 0.6, P.gold));
      face(d, P, o, 35.5, 17, 2.8, 40, 28, 4, "angry", "angry", "fang");
    } } },
  { name: "MAGPIE BRIDGE", kind: "Festival Boss", event: "qixi", orbit: "star", colors: { main: 0x1c1f2a, white: 0xf2f4f8, blue: 0x2d62d6, star: 0xcfe6ff, eye: 0x6ad5ff },
    art: { w: 76, h: 56, draw(d, P, o) {
      d.ring(38, 48, 37, 38, 3, P.star, { spec: true });
      d.sym(() => { featherWing(d, 30, 28, 2.1, P.main, P.blue); d.poly([[28, 22], [12, 14], [10, 22], [26, 30]], P.white, { paint: [P.main] }); });
      d.poly([[32, 40], [44, 40], [42, 54], [34, 54]], P.blue);
      d.ell(38, 32, 9, 11, P.main);
      d.ell(38, 37, 6, 6, P.white, { paint: [P.main] });
      d.ell(38, 17, 7.5, 7, P.main, { spec: true });
      d.tri(35, 18, 41, 18, 38, o.atk ? 26 : 23, 0x3a3a4a);
      face(d, P, o, 34.5, 16, 2.4, 0, 0, 0, "round", "angry");
    } } },
  { name: "MOUNTAIN FORTRESS", kind: "Festival Boss", event: "doubleninth", colors: { rock: 0x7a7f6a, snow: 0xf4f6fa, red: 0xb82a2c, gold: 0xe0b03a, flower: 0xf6c21a, eye: 0xffd23c },
    art: { w: 72, h: 64, draw(d, P, o) {
      d.poly([[36, 12], [70, 62], [2, 62]], P.rock);
      d.poly([[36, 12], [46, 27], [41, 25], [36, 29], [31, 25], [26, 27]], P.snow, { paint: [P.rock] });
      d.sym(() => { d.poly([[14, 62], [22, 44], [28, 62]], 0x5f6452); });
      for (let i = 0; i < 3; i++) { d.rect(29 + i * 2, 9 - i * 4, 14 - i * 4, 3, P.red); d.tri(26 + i * 2, 9.5 - i * 4, 46 - i * 2, 9.5 - i * 4, 36, 5.5 - i * 4, P.gold); }
      for (const [x, y] of [[8, 60], [14, 58], [58, 58], [64, 60], [20, 61], [52, 61]]) { d.ell(x, y, 2.2, 2, P.flower); d.px(x, y, 0xd8781a); }
      face(d, P, o, 30, 40, 3.2, 36, 50, 5, "angry", "angry", "line");
    } } },
  { name: "TANGYUAN TITAN", kind: "Festival Boss", event: "solstice", colors: { bowl: 0x3d6fb8, white: 0xf7f7fb, pink: 0xffc2d6, green: 0xb6e3a8, eye: 0x1a1030 },
    art: { w: 64, h: 64, draw(d, P, o) {
      d.sym(() => d.cap(20, 4, 22, 0.5, 1, 0.6, 0xffffff)); d.cap(32, 6, 31, 0.5, 1, 0.6, 0xffffff);
      d.ell(32, 12, 7, 6.5, P.green, { spec: true });
      d.ell(32, 24, 10, 8.5, P.pink, { spec: true });
      d.sym(() => d.cap(20, 40, 8, 34, 2.4, 2, P.white));
      d.ell(32, 41, 14, 12, P.white, { spec: true });
      d.poly([[8, 46], [56, 46], [50, 60], [14, 60]], P.bowl);
      d.rect(8, 45, 48, 3, 0x6a9ad8);
      d.rect(16, 52, 32, 1.4, P.white, { paint: [P.bowl] });
      d.sym(() => { d.eye(29, 23, 1.6, "round", P.eye); d.ell(26.5, 26, 1.4, 0.9, 0xff8aa8, { paint: [P.pink] }); });
      face(d, P, o, 27.5, 39, 2.6, 32, 43, 2, "round", "angry");
    } } },
  { name: "COUNTDOWN TOWER", kind: "Festival Boss", event: "newyear", colors: { stone: 0x5a6078, gold: 0xe0b03a, face: 0xf4f6fa, acc: 0xff5ef0, eye: 0xd62a2a },
    art: { w: 64, h: 64, draw(d, P, o) {
      d.sym(() => { d.cap(20, 32, 8, 26, 2.4, 2, P.gold); d.ell(7, 25, 3, 3, P.acc, { spec: true }); });
      d.rect(18, 18, 28, 44, P.stone);
      for (let y = 26; y < 60; y += 6) d.rect(18, y, 28, 1, 0x464b60, { paint: [P.stone] });
      d.poly([[14, 19], [50, 19], [32, 1]], P.gold, { spec: true });
      d.ell(32, 32, 10, 10, P.gold);
      d.ell(32, 32, 8.5, 8.5, P.face);
      d.rect(26, 50, 12, 12, 0x2a2e40);
      if (!o.back) {
        for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; d.px(32 + Math.sin(a) * 7 - 0.5, 32 - Math.cos(a) * 7 - 0.5, INK); }
        for (let r = 0; r < 6; r++) d.px(31.5, 31.5 - r, INK);
        for (let r = 0; r < 5; r++) d.px(31.5 + r * (o.atk ? 0.7 : 1), 31.5 + (o.atk ? r * 0.7 : 0), P.eye);
        d.sym(() => d.eye(25, 45, 2, o.atk ? "angry" : "round", P.eye)); d.mouth(32, 48, 2, o.atk ? "open" : "line");
      }
    } } },
  { name: "HEART SERAPH", kind: "Festival Boss", event: "valentine", orbit: "heart", colors: { main: 0xff5c8a, white: 0xffffff, pink: 0xffb3c9, acc: 0xffd54a, eye: 0x8a1a4a },
    art: { w: 72, h: 60, draw(d, P, o) {
      d.sym(() => { featherWing(d, 24, 26, 1.8, P.white, P.pink); featherWing(d, 26, 38, 1.2, P.white); });
      d.ring(36, 5, 10, 3, 1.6, P.acc, { spec: true });
      d.sym(() => d.ell(28, 22, 10, 10, P.main, { spec: true, join: true }));
      d.poly([[18.5, 25], [53.5, 25], [36, 54]], P.main, { join: true });
      if (!o.back) d.sym(() => d.ell(26, 33, 2.4, 1.4, P.pink, { paint: [P.main] }));
      face(d, P, o, 30, 28, 3, 36, 35, 2.5, "round", "angry");
    } } },
  { name: "PRANK JESTER", kind: "Festival Boss", event: "aprilfools", colors: { face: 0xf7e3c4, red: 0xd62a2a, blue: 0x2d62d6, yellow: 0xf6c10e, white: 0xffffff, eye: 0x2d62d6 },
    art: { w: 64, h: 64, draw(d, P, o) {
      d.sym(() => { d.ell(18, 54, 12, 6, P.white); d.ell(22, 58, 9, 5, P.red); });
      d.ell(32, 54, 8, 6, P.yellow);
      d.chain([[28, 16], [18, 10], [8, 14]], 4, 2, P.red); d.ell(7, 16, 3, 3, P.yellow, { spec: true });
      d.chain([[36, 16], [46, 10], [56, 14]], 4, 2, P.blue); d.ell(57, 16, 3, 3, P.yellow, { spec: true });
      d.chain([[32, 16], [32, 6], [36, 1]], 4, 2, P.yellow); d.ell(38, 2.5, 2.4, 2.4, P.red, { spec: true });
      d.ell(32, 32, 15, 15, P.face, { spec: true });
      d.rect(17, 16, 30, 5, P.red); d.rect(32, 16, 15, 5, P.blue);
      d.ell(32, 35, 3, 3, P.red, { spec: true });
      if (!o.back) { d.sym(() => { d.poly([[24, 27], [27, 30], [24, 33], [21, 30]], P.blue, { paint: [P.face] }); d.ell(23, 38, 2, 1.4, 0xff9ab0, { paint: [P.face] }); }); d.mouth(32, 41, 6, o.atk ? "roar" : "smile"); }
      face(d, P, o, 24, 30, 2, 0, 0, 0, "round", "angry");
    } } },
  { name: "EGG MOTHERSHIP", kind: "Festival Boss", event: "easter", colors: { egg: 0xbfe3ff, pink: 0xffb3d1, yellow: 0xfff09a, white: 0xf7f7fb, eye: 0x1a1030 },
    art: { w: 64, h: 64, draw(d, P, o) {
      d.sym(() => { d.cap(24, 18, 20, 2, 3.4, 2.6, P.white); d.cap(24, 17, 20.5, 4, 1.4, 1, P.pink, { paint: [P.white] }); });
      d.ell(32, 38, 20, 24, P.egg, { spec: true });
      d.rect(12, 30, 40, 4, P.pink, { paint: [P.egg] });
      for (let x = 12; x < 52; x += 4) d.tri(x, 46, x + 4, 46, x + 2, 42, P.yellow, { paint: [P.egg] });
      d.rect(12, 46, 40, 2.4, P.yellow, { paint: [P.egg] });
      for (const [x, y] of [[20, 56], [44, 56], [32, 58]]) d.ell(x, y, 1.6, 1.4, P.pink, { paint: [P.egg] });
      d.sym(() => { d.ell(10, 58, 5, 4.5, P.yellow); d.tri(4.5, 58, 7, 57, 6, 60, 0xff8a2a); });
      d.sym(() => d.eye(8.5, 57, 1, "round", P.eye));
      face(d, P, o, 27, 38, 2.6, 32, 41, 2, "round", "angry");
    } } },
  { name: "GUARDIAN GODDESS", kind: "Festival Boss", event: "mothersday", colors: { main: 0xfbeef4, sub: 0xff8ab3, gold: 0xd8a830, wing: 0xffffff, flower: 0xff6aa0, eye: 0x7a3ad8 },
    art: { w: 72, h: 64, draw(d, P, o) {
      d.sym(() => featherWing(d, 26, 30, 2, P.wing, P.sub));
      d.sym(() => { d.cap(30, 46, 29, 61, 2.2, 2, P.main); d.ell(29, 62, 2.6, 1.4, P.gold); });
      d.ell(36, 42, 12, 9, P.main);
      d.ell(36, 42, 3, 5, P.sub, { paint: [P.main] });
      d.chain([[36, 36], [36, 26]], 4.4, 3.6, P.main);
      d.sym(() => { d.chain([[32, 12], [27, 6], [24, 0.5]], 1.4, 0.7, P.gold, { spec: true }); d.cap(28, 7, 23, 8, 0.9, 0.6, P.gold); d.tri(29, 14, 22, 10, 28, 18, P.main); });
      d.ell(36, 18, 8, 8, P.main, { spec: true });
      d.ell(36, 24, 4.5, 3.2, P.main, { join: true });
      for (const x of [29, 33, 39, 43]) { d.ell(x, 11, 2, 1.8, P.flower, { spec: true }); d.px(x, 11, 0xffe066); }
      face(d, P, o, 32.5, 18.5, 2.6, 0, 0, 0, "round", "angry");
      if (!o.back) d.ell(36, 24.5, 1.6, 1, INK);
    } } },
  { name: "IRON GUARDIAN", kind: "Festival Boss", event: "fathersday", colors: { fur: 0x8a5a34, armor: 0x5a6a88, gold: 0xd8a830, belly: 0xd8b088, eye: 0x1a1030 },
    art: { w: 64, h: 64, draw(d, P, o) {
      d.cap(54, 14, 52, 50, 1.4, 1.4, 0x6a4a2a); d.rect(46, 8, 16, 9, P.armor); d.rect(46, 8, 16, 2, P.gold, { paint: [P.armor] });
      d.sym(() => { d.ell(22, 56, 7, 6.5, P.fur); d.ell(21, 61, 6, 2.4, P.armor); });
      d.ell(32, 40, 17, 16, P.fur);
      d.poly([[20, 30], [44, 30], [42, 50], [22, 50]], P.armor, { spec: true });
      d.ell(32, 39, 4, 4, P.gold, { spec: true });
      d.sym(() => { d.cap(16, 32, 10, 46, 5, 4.4, P.fur); d.ell(9, 48, 5, 4.5, P.armor); });
      d.sym(() => d.ell(22, 8, 4.5, 4.5, P.fur));
      d.sym(() => d.ell(22, 8, 2.2, 2.2, P.belly, { paint: [P.fur] }));
      d.ell(32, 18, 12, 11, P.fur);
      d.ell(32, 23, 6, 4.5, P.belly, { join: true });
      d.ell(32, 11, 12.5, 4.5, P.armor, { spec: true });
      face(d, P, o, 27.5, 17, 2.4, 32, 26, 2.5, "round", "angry", "smile");
      if (!o.back) d.ell(32, 21.5, 2, 1.4, INK);
    } } },
  { name: "PUMPKIN PHANTOM", kind: "Festival Boss", event: "halloween", orbit: "bat", colors: { orange: 0xff7a1a, cloak: 0x3a2a5a, glow: 0xffd23c, stem: 0x3f6b2a, hat: 0x2a1c3c, eye: 0xffd23c },
    art: { w: 64, h: 64, draw(d, P, o) {
      d.poly([[32, 30], [50, 40], [56, 62], [46, 58], [40, 63], [32, 57], [24, 63], [18, 58], [8, 62], [14, 40]], P.cloak);
      d.sym(() => d.ell(19, 32, 9, 13, P.orange));
      d.ell(32, 32, 10, 14, P.orange, { spec: true });
      d.cap(32, 18, 31, 14, 1.6, 1.4, P.stem);
      d.poly([[14, 14], [50, 14], [44, 10], [36, 0.5], [30, 9], [20, 10]], P.hat);
      d.rect(22, 11, 20, 2, 0x8a3ad8, { paint: [P.hat] });
      if (!o.back) {
        d.sym(() => d.tri(22, 32, 28, 32, 25, 26, P.glow));
        d.tri(30.5, 36, 33.5, 36, 32, 33, P.glow);
        d.poly([[20, 40], [24, 43], [28, 40], [32, 44], [36, 40], [40, 43], [44, 40], [42, o.atk ? 50 : 47], [22, o.atk ? 50 : 47]], P.glow);
      }
    } } },
  { name: "TANNENBAUM TITAN", kind: "Festival Boss", event: "christmas", orbit: "snow", colors: { green: 0x1f8a3a, trunk: 0x6b4423, gold: 0xffd54a, eye: 0x1a1030 },
    art: { w: 64, h: 64, draw(d, P, o) {
      d.rect(28, 54, 8, 9, P.trunk);
      d.sym(() => { d.rect(8, 52, 11, 10, 0xd62a2a); d.rect(13, 52, 2, 10, P.gold); d.rect(8, 55, 11, 2, P.gold); });
      for (const [y, w, h] of [[56, 27, 16], [44, 22, 16], [32, 17, 14], [21, 12, 12]]) d.tri(32 - w, y, 32 + w, y, 32, y - h, P.green);
      const cols = [0xff3344, 0x3ad0ff, 0xffd54a, 0xff5ef0, 0x7dff8a];
      [[16, 52], [48, 50], [24, 44], [42, 40], [20, 34], [44, 32], [28, 24], [38, 22], [34, 50], [12, 54]].forEach(([x, y], i) => d.ell(x, y, 1.6, 1.6, cols[i % 5], { spec: true }));
      d.poly([[32, 0.5], [34, 5], [39, 5], [35, 8], [37, 13], [32, 10], [27, 13], [29, 8], [25, 5], [30, 5]], P.gold, { spec: true });
      face(d, P, o, 28, 36, 2.4, 32, 41, 2, "round", "angry");
    } } },
  { name: "HORNBILL GUARDIAN", kind: "Festival Boss", event: "merdeka", colors: { main: 0x1c1f26, white: 0xf4f6fa, yellow: 0xf6c10e, red: 0xd62a2a, blue: 0x1f3fa8, eye: 0xd62a2a },
    art: { w: 76, h: 60, draw(d, P, o) {
      d.sym(() => { featherWing(d, 30, 30, 2.15, P.main, P.white); d.poly([[30, 34], [14, 38], [12, 42], [28, 40]], P.blue, { paint: [P.main] }); d.poly([[28, 26], [10, 22], [8, 26], [26, 30]], P.red, { paint: [P.main] }); });
      d.poly([[32, 44], [44, 44], [46, 59], [30, 59]], P.white);
      d.ell(38, 36, 9, 11, P.main);
      d.ell(38, 41, 5, 5, P.white, { paint: [P.main] });
      d.ell(38, 19, 8, 7.5, P.main, { spec: true });
      d.poly([[33, 12], [44, 12], [46, 6], [34, 4]], P.red, { spec: true });
      d.poly([[34, 20], [42, 20], [40, o.atk ? 34 : 32], [38, 34]], P.yellow, { spec: true });
      face(d, P, o, 34.5, 18, 2.2, 0, 0, 0, "round", "angry");
    } } },
];

/* small props: boss attack orb + things that orbit festival bosses */
const PROPS = {
  shot: { w: 12, h: 12, colors: { main: 0xff3a6a, core: 0xffe0f0 }, draw(d, P) {
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; d.tri(6 + Math.cos(a) * 2, 6 + Math.sin(a) * 2, 6 + Math.cos(a + 0.5) * 2, 6 + Math.sin(a + 0.5) * 2, 6 + Math.cos(a + 0.25) * 6, 6 + Math.sin(a + 0.25) * 6, P.main); }
    d.ell(6, 6, 3.6, 3.6, P.main, { spec: true, join: true }); d.ell(6, 6, 1.8, 1.8, P.core, { paint: true });
  } },
  lantern: { w: 8, h: 11, colors: { main: 0xff4a3a, gold: 0xffc23a }, draw(d, P) { d.ell(4, 5.5, 3.6, 3.4, P.main, { spec: true }); d.rect(1.5, 1, 5, 1.4, P.gold); d.rect(1.5, 8.4, 5, 1.4, P.gold); d.cap(4, 9.5, 4, 10.6, 0.5, 0.5, P.gold); } },
  star: { w: 9, h: 9, colors: { main: 0xcfe6ff }, draw(d, P) { d.poly([[4.5, 0.2], [5.6, 3.4], [8.8, 3.6], [6.3, 5.6], [7.2, 8.8], [4.5, 6.9], [1.8, 8.8], [2.7, 5.6], [0.2, 3.6], [3.4, 3.4]], P.main, { spec: true }); } },
  heart: { w: 9, h: 8, colors: { main: 0xff6a9a }, draw(d, P) { d.sym(() => d.ell(2.6, 2.6, 2.4, 2.4, P.main, { spec: true, join: true })); d.tri(0.3, 3.2, 8.7, 3.2, 4.5, 7.8, P.main, { join: true }); } },
  bat: { w: 12, h: 7, colors: { main: 0x3a2a5a }, draw(d, P) { d.sym(() => d.poly([[5, 3], [0.5, 0.5], [1.5, 3.5], [0.5, 6], [3, 5], [5, 6]], P.main)); d.ell(6, 3.5, 2, 2.2, P.main); d.sym(() => d.px(5, 3, 0xffd23c)); } },
  snow: { w: 7, h: 7, colors: { main: 0xffffff }, draw(d, P) { d.rect(3, 0, 1, 7, P.main); d.rect(0, 3, 7, 1, P.main); d.ell(3.5, 3.5, 1.6, 1.6, P.main, { join: true }); } },
};
function propCanvas(id) { const pr = PROPS[id]; return artCanvas("p", Object.assign({ id, art: pr }, pr), null, {}); }

/* =====================================================================
 *  PARTNER: build + animate (same API as the old mech code)
 * ===================================================================== */
const PX = 0.115; // world units per art pixel for partners and enemies
function buildMech(def, skin, opts) {
  opts = opts || {};
  const back = !!opts.back;
  const sk = skin && (skin.colors || skin.mat || skin.accentGlow) ? skin : null;
  const fr = { a: artCanvas("m", def, sk, { back }), b: artCanvas("m", def, sk, { back, atk: 1 }),
    ea: artCanvas("m", def, sk, { back, evo: 1 }), eb: artCanvas("m", def, sk, { back, evo: 1, atk: 1 }) };
  const rig = spriteRig(fr.a, PX);
  rig.frames = fr; rig.def = def;
  const ex = sk && sk.mat;
  if (ex && ex.opacity != null) { rig.spr.material.opacity = ex.opacity; rig.spr.material.alphaTest = 0.01; rig.spr.material.depthWrite = false; }
  const auraColor = (sk && sk.glow) || def.colors.acc || def.colors.main;
  const am = new T.SpriteMaterial({ map: glowTexture(), color: auraColor, transparent: true, opacity: 0, depthWrite: false, blending: ADD });
  rig.aura = new T.Sprite(am); rig.aura.renderOrder = -1; rig.body.add(rig.aura);
  rig.skinGlow = !!(sk && sk.accentGlow);
  rig.muzzle = new T.Object3D(); rig.body.add(rig.muzzle);
  rig.bw = 0; setFrame(rig, fr.a); fitRig(rig);
  rig.root.userData.def = def;
  return rig.root;
}
function fitRig(rig) { // after a frame change: remember the size, move muzzle, aura and shadow
  const w = rig.cv.width * rig.px, h = rig.cv.height * rig.px;
  rig.bw = w; rig.bh = h;
  if (rig.muzzle) rig.muzzle.position.set(0, h * 0.62, 0.5);
  if (rig.aura) { rig.aura.position.set(0, h * 0.5, -0.05); rig.aura.userData.s = Math.max(w, h) * 1.6; }
  if (rig.shadow) { rig.shadowW = w * 0.75; rig.shadow.scale.set(w * 0.75, w * 0.3, 1); }
}
function newAnim() { return { t: Math.random() * 10, yaw: 0, pitch: 0, tyaw: 0, tpitch: 0, aiming: 0, wantAim: 0, recoil: 0, hit: 0, flash: 0, victory: 0, special: 0, evo: false, evoFlash: 0, idle: true }; }

/* Aim at a world-space point (or null to relax). */
function aimMech(mesh, anim, worldPoint) {
  if (!worldPoint) { anim.wantAim = 0; return; }
  const p = mesh.worldToLocal(worldPoint.clone());
  anim.tyaw = clamp(Math.atan2(p.x, p.z), -1.0, 1.0);
  anim.tpitch = clamp(Math.atan2(p.y - 2.6, Math.hypot(p.x, p.z)), -0.5, 0.7);
  anim.wantAim = 1;
}
function fireMech(anim, big) { anim.recoil = Math.min(1.2, anim.recoil + (big ? 1 : 0.35)); anim.flash = big ? 0.14 : 0.06; anim.wantAim = 1; }

function animateMech(mesh, anim, dt) {
  const r = mesh.userData.rig; if (!r) return;
  anim.t += dt;
  const t = anim.t;
  anim.aiming += (anim.wantAim - anim.aiming) * Math.min(1, dt * 6);
  anim.yaw += (anim.tyaw * anim.wantAim - anim.yaw) * Math.min(1, dt * 9);
  anim.recoil = Math.max(0, anim.recoil - dt * 4);
  anim.hit = Math.max(0, anim.hit - dt * 2.2);
  anim.flash = Math.max(0, anim.flash - dt);
  anim.victory = Math.max(0, anim.victory - dt * 0.6);
  anim.special = Math.max(0, anim.special - dt);
  anim.evoFlash = Math.max(0, anim.evoFlash - dt);
  // DIGIVOLVE: evolved while the special is active (or while the game says so: big combo)
  const evo = anim.special > 0 || !!anim.evo;
  if (evo !== !!r.isEvo) { r.isEvo = evo; anim.evoFlash = 0.7; }
  const atk = anim.recoil > 0.3 || anim.flash > 0;
  const cv = r.frames[(evo ? "e" : "") + (atk ? "b" : "a")];
  if (cv !== r.cv) { setFrame(r, cv); fitRig(r); }
  const hop = anim.victory > 0 ? Math.abs(Math.sin(t * 8)) * 0.8 * Math.min(1, anim.victory) : 0;
  const breathe = Math.sin(t * 2.6);
  r.body.position.set(Math.sin(t * 55) * 0.14 * anim.hit, breathe * 0.05 + hop + anim.evoFlash * 0.3, anim.recoil * 0.45);
  const sq = 1 + breathe * 0.025 + anim.recoil * 0.05, pop = 1 + anim.evoFlash * 0.25;
  r.spr.scale.set(r.bw / sq * pop, r.bh * sq * pop, 1); r.flash.scale.copy(r.spr.scale);
  r.spr.material.rotation = r.flash.material.rotation = -anim.yaw * 0.12 * anim.aiming + Math.sin(t * 1.3) * 0.02;
  r.spr.material.color.setRGB(1, 1 - anim.hit * 0.55, 1 - anim.hit * 0.55);
  r.flash.material.opacity = Math.max(anim.evoFlash / 0.7, anim.hit > 0.75 ? (anim.hit - 0.75) * 3 : 0, anim.flash > 0 ? 0.25 : 0);
  if (r.aura) {
    const on = evo || r.skinGlow, k = 0.5 + 0.5 * Math.sin(t * 5);
    r.aura.material.opacity = on ? (evo ? 0.32 : 0.18) + 0.12 * k + anim.evoFlash * 0.6 : anim.evoFlash * 0.8;
    r.aura.scale.setScalar(r.aura.userData.s * (1 + 0.06 * k + anim.evoFlash * 0.5));
  }
  if (r.shadow) r.shadow.material.opacity = 1 - Math.min(0.6, hop * 0.5);
}

/* =====================================================================
 *  ENEMIES: build + animate
 * ===================================================================== */
const ENEMY_PX = { short: 0.135, mid: 0.13, long: 0.13 };
function buildEnemy(type) {
  const def = ENEMY_TYPES[type];
  const a = artCanvas("e", def, null, {}), b = artCanvas("e", def, null, { atk: 1 });
  const rig = spriteRig(a, ENEMY_PX[def.size]);
  rig.frames = { a, b }; rig.def = def; fitRig(rig);
  rig.root.userData.top = a.height * rig.px + 0.6;
  return rig.root;
}
function animateEnemy(mesh, st, dt, time) {
  const r = mesh.userData.rig; if (!r) return;
  mesh.rotation.set(0, 0, 0); // sprites always face the camera; keep the shadow flat
  const ph = st.wob || 0;
  const cv = st.progress > 0.62 && Math.sin(time * 9 + ph) > -0.6 ? r.frames.b : r.frames.a;
  if (cv !== r.cv) { setFrame(r, cv); fitRig(r); }
  const bob = Math.sin(time * 3.2 + ph);
  r.body.position.y = bob * 0.18;
  const flap = r.def.size === "short" ? Math.sin(time * 12 + ph) * 0.07 : bob * 0.03;
  r.spr.scale.set(r.bw * (1 + flap), r.bh * (1 - flap * 0.6), 1); r.flash.scale.copy(r.spr.scale);
  r.spr.material.rotation = r.flash.material.rotation = clamp(-(st.vx || 0) * 0.05, -0.35, 0.35) + Math.sin(time * 2 + ph) * 0.04;
  r.flashT = Math.max(0, (r.flashT || 0) - dt);
  r.flash.material.opacity = r.flashT * 4;
  groundShadow(r, mesh);
}

/* =====================================================================
 *  BOSSES: build + animate
 * ===================================================================== */
const BOSS_SIZE = 18;
function buildBoss(idx) {
  const def = BOSSES[idx % BOSSES.length];
  const a = artCanvas("b", def, null, {}), b = artCanvas("b", def, null, { atk: 1 });
  const px = BOSS_SIZE * (def.sizeMul || 1) / Math.max(a.width, a.height);
  const rig = spriteRig(a, px, { centerY: 0.5 });
  rig.frames = { a, b }; rig.def = def; fitRig(rig);
  rig.shadow.scale.set(a.width * px * 0.8, a.width * px * 0.25, 1); rig.shadowW = a.width * px * 0.8;
  const am = new T.SpriteMaterial({ map: glowTexture(), color: def.colors.eye || 0xff3a6a, transparent: true, opacity: 0.12, depthWrite: false, blending: ADD });
  rig.aura = new T.Sprite(am); rig.aura.scale.setScalar(BOSS_SIZE * 1.5); rig.aura.renderOrder = -1; rig.body.add(rig.aura);
  if (def.orbit) {
    const cv = propCanvas(def.orbit), op = BOSS_SIZE * 0.016;
    rig.orbit = new T.Group(); rig.body.add(rig.orbit);
    for (let i = 0; i < 8; i++) {
      const s = new T.Sprite(new T.SpriteMaterial({ map: tex(cv), transparent: true, alphaTest: 0.5 }));
      const ang = i / 8 * Math.PI * 2;
      s.scale.set(cv.width * op, cv.height * op, 1);
      s.position.set(Math.cos(ang) * BOSS_SIZE * 0.6, Math.sin(i * 1.9) * BOSS_SIZE * 0.2, Math.sin(ang) * BOSS_SIZE * 0.45);
      rig.orbit.add(s);
    }
  }
  const holder = rig.root;
  holder.userData.top = a.height * px / 2 + 1.0;
  holder.userData.front = 1.5;
  holder.userData.inner = rig.body; holder.userData.def = def; holder.userData.P = {};
  return holder;
}
function animateBoss(holder, dt, time, attack, target) {
  const r = holder.userData.rig;
  const cv = attack > 0.25 ? r.frames.b : r.frames.a;
  if (cv !== r.cv) { setFrame(r, cv); r.bw = cv.width * r.px; r.bh = cv.height * r.px; }
  r.body.position.y = Math.sin(time * 1.1) * 0.35;
  const br = 1 + Math.sin(time * 1.9) * 0.012 + attack * 0.06;
  r.spr.scale.set(r.bw * br, r.bh * br, 1); r.flash.scale.copy(r.spr.scale);
  r.spr.material.rotation = r.flash.material.rotation = Math.sin(time * 0.6) * 0.03;
  r.flashT = Math.max(0, (r.flashT || 0) - dt);
  r.flash.material.opacity = Math.max(r.flashT * 3, attack > 0.85 ? 0.15 : 0);
  r.aura.material.opacity = 0.1 + attack * 0.25 + Math.sin(time * 3) * 0.03;
  if (r.orbit) { r.orbit.rotation.y += dt * 0.7; r.orbit.children.forEach((s, i) => { s.position.y += Math.sin(time * 2 + i) * 0.01; }); }
  groundShadow(r, holder);
}

/* white flash when something is hit (enemies and bosses) */
function hitFlash(mesh, k) { const r = mesh && mesh.userData.rig; if (r) r.flashT = Math.max(r.flashT || 0, k || 0.25); }

/* the boss's attack: a spiky virus orb */
function buildShot() {
  const cv = propCanvas("shot");
  const rig = spriteRig(cv, 0.2, { centerY: 0.5, shadow: false });
  const glow = new T.Sprite(new T.SpriteMaterial({ map: glowTexture(), color: 0xff3a6a, transparent: true, opacity: 0.55, depthWrite: false, blending: ADD }));
  glow.scale.setScalar(4.2); rig.body.add(glow);
  rig.root.userData.top = 1.6;
  return rig.root;
}
function animateShot(mesh, time) { const r = mesh.userData.rig; if (r) { r.spr.material.rotation = time * 6; const s = 1 + Math.sin(time * 20) * 0.08; r.spr.scale.set(r.cv.width * r.px * s, r.cv.height * r.px * s, 1); } }

/* pixel portraits for the UI (hangar list, share card); returns a canvas */
function portrait(def, skin, opts) { return artCanvas("m", def, skin && (skin.colors || skin.mat) ? skin : null, opts || {}); }

window.MODELS = { MECHS, buildMech, newAnim, aimMech, fireMech, animateMech, ENEMY_TYPES, ENEMY_SIZES, buildEnemy, animateEnemy,
  BOSSES, buildBoss, animateBoss, hitFlash, buildShot, animateShot, portrait, PixelArt, MS, MB, GLOW, __artCanvas: artCanvas };
})();
