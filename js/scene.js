"use strict";
/* =====================================================================
 *  THREE.JS SCENE: the Digital World
 *  Chibi monster sprites (models.js) stand on a scrolling ground with a
 *  soft data grid, billboard props drawn in the same cartoon style, fog
 *  for depth, glow and round sparkle particles.
 * ===================================================================== */
const V3 = THREE.Vector3;
const canvas = $("#scene");
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
} catch (e) {
  document.body.insertAdjacentHTML("beforeend", '<div class="note" style="position:fixed;bottom:10px;left:10px;right:10px;z-index:99">This browser cannot show 3D graphics (WebGL is off). Please try Chrome or Edge.</div>');
}
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1400);
scene.fog = new THREE.Fog(0x9ad8ff, 70, 230);
function setSky(top, mid, bottom) {
  const c = document.createElement("canvas"); c.width = 4; c.height = 256;
  const x = c.getContext("2d"), gr = x.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, top); gr.addColorStop(0.55, mid); gr.addColorStop(1, bottom);
  x.fillStyle = gr; x.fillRect(0, 0, 4, 256);
  if (scene.background && scene.background.dispose) scene.background.dispose();
  scene.background = new THREE.CanvasTexture(c);
}
setSky("#3a8ee8", "#8fd0ff", "#d8f4ff");
const hemi = new THREE.HemisphereLight(0xcfe8ff, 0x3a5a3a, 1.0); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 0.9); sun.position.set(-6, 12, 8); scene.add(sun);

function canTex(cv, repeat) {
  const t = new THREE.CanvasTexture(cv);
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); t.minFilter = THREE.LinearMipmapLinearFilter; if (renderer) t.anisotropy = renderer.capabilities.getMaxAnisotropy(); }
  else { t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; }
  return t;
}
/* cartoon drawing helpers (same look as the monsters: soft gradient + warm outline) */
const OUT = "#4a2410";
const hexCol = (c) => typeof c === "number" ? "#" + c.toString(16).padStart(6, "0") : c;
function shade(c, k) { // k > 0 lighter, k < 0 darker
  const n = parseInt(hexCol(c).slice(1), 16), t = k > 0 ? 255 : 30, a = Math.abs(k);
  const ch = (v) => Math.round(v + (t - v) * a);
  return `rgb(${ch(n >> 16 & 255)},${ch(n >> 8 & 255)},${ch(n & 255)})`;
}
function vcv(w, h, draw, lw) { // draw at 4x, w x h "units"
  const k = 4, c = document.createElement("canvas"); c.width = w * k; c.height = h * k;
  const x = c.getContext("2d"); x.scale(k, k); x.lineJoin = x.lineCap = "round"; x.strokeStyle = OUT; x.lineWidth = lw || 1;
  draw(x); return c;
}
function blob(x, path, col, top, bottom) { // fill a path with a vertical gradient and outline it
  x.beginPath(); path(x);
  const g = x.createLinearGradient(0, top, 0, bottom); g.addColorStop(0, shade(col, 0.35)); g.addColorStop(1, hexCol(col));
  x.fillStyle = g; x.fill(); x.stroke();
}
const circ = (cx, cy, r) => (x) => { x.moveTo(cx + r, cy); x.arc(cx, cy, r, 0, Math.PI * 2); };
const ellp = (cx, cy, rx, ry) => (x) => { x.moveTo(cx + rx, cy); x.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); };
const poly = (pts) => (x) => { pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath(); };

/* sun / moon far away (pages.js spins "planet") */
const planet = new THREE.Group(); scene.add(planet);
const ring = new THREE.Group();
function orbCanvas(color, rim, moon) {
  return vcv(24, 24, (x) => {
    const g = x.createRadialGradient(9, 9, 1, 12, 12, 11); g.addColorStop(0, "#ffffff"); g.addColorStop(0.5, hexCol(color)); g.addColorStop(1, shade(color, -0.15));
    x.fillStyle = g; x.beginPath(); x.arc(12, 12, 11, 0, 7); x.fill();
    if (moon) { x.fillStyle = hexCol(rim); x.globalAlpha = 0.6; for (const [a, b, r] of [[8, 9, 2.4], [15, 15, 3], [15, 7, 1.6]]) { x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); } }
  });
}
const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ fog: false, transparent: true, depthWrite: false }));
const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture("rgba(255,255,255,.75)", "rgba(255,255,255,0)"), fog: false, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
planet.add(sunGlow); planet.add(sunSprite);
planet.position.set(120, 120, -600); sunSprite.scale.setScalar(70); sunGlow.scale.setScalar(260);

/* floating data motes (pages.js scrolls them toward the camera) */
let stars;
function buildStars(count) {
  if (stars) { scene.remove(stars); stars.geometry.dispose(); }
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) { pos[i * 3] = (Math.random() - 0.5) * 360; pos[i * 3 + 1] = 1 + Math.random() * 150; pos[i * 3 + 2] = -Math.random() * 440 + 20; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  stars = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.9, sizeAttenuation: true, fog: false, transparent: true, opacity: 0.9 }));
  scene.add(stars);
  if (envId) styleStars();
}
function applyQuality() {
  if (!renderer) return;
  const high = S.prefs.quality === "high";
  renderer.setPixelRatio(high ? Math.min(window.devicePixelRatio || 1, 2) : Math.min(1, (window.devicePixelRatio || 1) * 0.75));
  buildStars(high ? 900 : 350);
  resize();
}

/* ---------- boss attack orbs ---------- */
function buildMissile() { return MODELS.buildShot(); }

/* ---------- effects: beams, sparkle bursts ---------- */
const effects = [];
const beamGeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true);
let sparkTex = null, bubbleTex = null;
function bubbleTexture() { // shield: a soap-bubble ring
  if (bubbleTex) return bubbleTex;
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 30, 64, 64, 62);
  g.addColorStop(0, "rgba(140,230,255,0.05)"); g.addColorStop(0.75, "rgba(140,230,255,0.22)"); g.addColorStop(0.95, "rgba(200,245,255,0.75)"); g.addColorStop(1, "rgba(200,245,255,0)");
  x.fillStyle = g; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill();
  x.fillStyle = "rgba(255,255,255,0.7)"; x.beginPath(); x.ellipse(42, 36, 14, 7, -0.6, 0, 7); x.fill();
  return (bubbleTex = new THREE.CanvasTexture(c));
}
function sparkTexture() { // soft round dot with a bright centre
  if (sparkTex) return sparkTex;
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.3, "rgba(255,255,255,0.8)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return (sparkTex = new THREE.CanvasTexture(c));
}
function beam(from, to, color, width, life) {
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
  const m = new THREE.Mesh(beamGeo, mat);
  const dir = new V3().subVectors(to, from); const len = dir.length();
  m.position.copy(from).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir.normalize());
  m.scale.set(width, len, width);
  scene.add(m);
  effects.push({ obj: m, life, max: life, kind: "beam", w: width });
}
function explode(pos, color, count, size, speed) {
  count = S.prefs.quality === "high" ? count : Math.ceil(count / 2);
  const posArr = new Float32Array(count * 3), vel = [];
  for (let i = 0; i < count; i++) {
    posArr.set([pos.x, pos.y, pos.z], i * 3);
    vel.push(new V3(Math.random() - 0.5, Math.random() - 0.3, Math.random() - 0.5).normalize().multiplyScalar(speed * (0.3 + Math.random())));
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
  const mat = new THREE.PointsMaterial({ color, map: sparkTexture(), size: size * 2.2, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
  const p = new THREE.Points(geo, mat); scene.add(p);
  effects.push({ obj: p, life: 0.9, max: 0.9, kind: "burst", vel });
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTexture(), color: 0xffffff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
  flash.scale.setScalar(size * 6);
  flash.position.copy(pos); scene.add(flash);
  effects.push({ obj: flash, life: 0.22, max: 0.22, kind: "flash", s: size * 4 });
}
function updateEffects(dt) {
  for (let i = effects.length - 1; i >= 0; i--) {
    const e = effects[i]; e.life -= dt;
    const k = Math.max(0, e.life / e.max);
    if (e.kind === "beam") { e.obj.material.opacity = k; e.obj.scale.x = e.obj.scale.z = e.w * (0.4 + k * 0.6); }
    else if (e.kind === "burst") {
      const a = e.obj.geometry.attributes.position;
      for (let j = 0; j < e.vel.length; j++) { e.vel[j].y -= dt * 6; a.array[j * 3] += e.vel[j].x * dt; a.array[j * 3 + 1] += e.vel[j].y * dt; a.array[j * 3 + 2] += e.vel[j].z * dt; }
      a.needsUpdate = true; e.obj.material.opacity = k;
    } else if (e.kind === "flash") { e.obj.material.opacity = k; e.obj.scale.setScalar(e.s * 1.5 * (1 + (1 - k) * 1.5)); }
    if (e.life <= 0) {
      scene.remove(e.obj);
      if (e.obj.geometry !== beamGeo && !e.obj.isSprite) e.obj.geometry.dispose();
      e.obj.material.dispose(); effects.splice(i, 1);
    }
  }
}

/* ---------- base preview & modes ---------- */
let mode = "hangar"; // hangar | game | idle
let previewMech = null, previewMechId = null, previewAnim = MODELS.newAnim();
function setPreviewMech(id, skinId) {
  const key = id + "|" + (skinId || "default");
  if (previewMechId === key && previewMech) return;
  if (previewMech) scene.remove(previewMech);
  previewMech = MODELS.buildMech(MECH_BY_ID[id], SKIN_BY_ID[skinId]); previewMechId = key;
  scene.add(previewMech);
  previewMech.visible = mode === "hangar";
  previewAnim = MODELS.newAnim();
}
function render3DMode() {
  const scr = S.currentScreen;
  if (document.body.classList.contains("playing")) mode = "game";
  else if (["scr-hangar", "scr-login", "scr-profile", "scr-result"].includes(scr)) mode = "hangar";
  else mode = "idle";
  if (previewMech) previewMech.visible = mode === "hangar";
  if (G.players) for (const p of G.players) if (p.mesh) p.mesh.visible = mode === "game" && p.alive !== false;
  canvas.style.visibility = mode === "idle" ? "hidden" : "visible";
}

function viewSize() {
  const vv = window.visualViewport;
  return { w: window.innerWidth, h: document.body.classList.contains("playing") && vv ? Math.round(vv.height) : window.innerHeight };
}
function resize() {
  if (!renderer) return;
  const { w, h } = viewSize();
  renderer.setSize(w, h, false);
  canvas.style.height = h + "px";
  $("#labels").style.height = h + "px";
  camera.aspect = w / h;
  camera.fov = camera.aspect < 0.8 ? 72 : 55;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
if (window.visualViewport) window.visualViewport.addEventListener("resize", resize);

function project(v) {
  const p = v.clone().project(camera);
  if (p.z > 1) return null;
  const { w, h } = viewSize();
  return { x: (p.x + 1) / 2 * w, y: (1 - p.y) / 2 * h };
}
function floater(x, y, text, color) {
  const el = document.createElement("div");
  el.className = "floater"; el.textContent = text;
  el.style.left = x + "px"; el.style.top = y + "px"; el.style.transform = "translate(-50%,0)";
  if (color) el.style.color = color;
  $("#labels").appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

/* =====================================================================
 *  BATTLEFIELDS (unlocked by level) + FESTIVAL DECORATIONS
 * ===================================================================== */
const TILE = 8; // world units per ground tile
const rand = (a, b) => a + Math.random() * (b - a);
function tileCanvas(base, spots, grid, gridColor) { // 128x128 seamless tile: soft speckles + a thin data grid
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const x = c.getContext("2d");
  x.fillStyle = base; x.fillRect(0, 0, 128, 128);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (const [col, n, w, h] of spots) {
    x.fillStyle = col;
    for (let i = 0; i < n; i++) {
      const px = rnd() * 128, py = rnd() * 128, rx = w * 1.6, ry = h * 1.2;
      for (const [ox, oy] of [[0, 0], [128, 0], [-128, 0], [0, 128], [0, -128]]) { x.beginPath(); x.ellipse(px + ox, py + oy, rx, ry, 0, 0, 7); x.fill(); }
    }
  }
  if (grid) { x.fillStyle = gridColor; x.fillRect(0, 0, 128, 2); x.fillRect(0, 0, 2, 128); }
  return c;
}
/* billboard props: tree, bush, palm, pine, cactus, rock, dune, crystal, tower, pillar, cloud */
const PROP_ART = {
  tree: [22, 30, (x) => { blob(x, poly([[9.5, 18], [12.5, 18], [13, 29.5], [9, 29.5]]), 0x9a6a3a, 18, 30); blob(x, (p) => { p.moveTo(3, 15); p.bezierCurveTo(-1, 9, 4, 2, 9, 3); p.bezierCurveTo(12, -1, 19, 1, 19, 6); p.bezierCurveTo(23, 9, 21, 17, 16, 18); p.bezierCurveTo(12, 21, 6, 20, 3, 15); }, 0x4ab85a, 1, 20); x.fillStyle = "rgba(255,255,255,.45)"; x.beginPath(); x.ellipse(8, 7, 3, 1.6, -0.5, 0, 7); x.fill(); }],
  bush: [16, 10, (x) => { blob(x, (p) => { p.moveTo(1.5, 9); p.bezierCurveTo(0, 4, 4, 1, 7, 3); p.bezierCurveTo(9, 0, 15, 1, 14.5, 9); p.closePath(); }, 0x5ac85a, 1, 9); x.fillStyle = "#ff8ab4"; x.beginPath(); x.arc(5, 5, 1.1, 0, 7); x.fill(); x.fillStyle = "#ffe066"; x.beginPath(); x.arc(11, 4.5, 1, 0, 7); x.fill(); }],
  palm: [24, 34, (x) => { x.lineWidth = 3.4; x.beginPath(); x.moveTo(12, 33); x.quadraticCurveTo(10, 22, 13, 10); x.stroke(); x.strokeStyle = "#c08a4a"; x.lineWidth = 2; x.stroke(); x.strokeStyle = OUT; x.lineWidth = 1;
    for (const s of [-1, 1]) { blob(x, (p) => { p.moveTo(13, 9); p.quadraticCurveTo(13 + s * 7, 3, 13 + s * 11, 11); p.quadraticCurveTo(13 + s * 6, 7, 13, 10); }, 0x3ab85a, 3, 11); blob(x, (p) => { p.moveTo(13, 9); p.quadraticCurveTo(13 + s * 5, 0, 13 + s * 9, 2); p.quadraticCurveTo(13 + s * 4, 3, 13, 10); }, 0x4ac86a, 0, 10); }
    blob(x, circ(12.5, 10.5, 1.8), 0x7a4a2a, 9, 12); }],
  pine: [18, 32, (x) => { blob(x, poly([[7.5, 26], [10.5, 26], [10.5, 31.5], [7.5, 31.5]]), 0x7a5a3a, 26, 32); for (const [y, w] of [[27, 8.5], [20, 7], [13, 5.5]]) blob(x, (p) => { p.moveTo(9 - w, y); p.quadraticCurveTo(9, y + 2, 9 + w, y); p.lineTo(9, y - 10); p.closePath(); }, 0x2f8a52, y - 10, y); }],
  cactus: [16, 24, (x) => { const g = 0x4ab85a; blob(x, (p) => { p.moveTo(5.4, 23.5); p.lineTo(5.4, 5); p.arc(8, 5, 2.6, Math.PI, 0); p.lineTo(10.6, 23.5); p.closePath(); }, g, 2, 24); blob(x, (p) => { p.moveTo(5.4, 15); p.lineTo(3, 15); p.quadraticCurveTo(1.4, 15, 1.4, 13); p.lineTo(1.4, 9); p.arc(2.9, 9, 1.5, Math.PI, 0); p.lineTo(4.4, 12.6); p.lineTo(5.4, 12.6); }, g, 7, 15); blob(x, (p) => { p.moveTo(10.6, 18); p.lineTo(13, 18); p.quadraticCurveTo(14.6, 18, 14.6, 16); p.lineTo(14.6, 12); p.arc(13.1, 12, 1.5, 0, Math.PI, true); p.lineTo(11.6, 15.6); p.lineTo(10.6, 15.6); }, g, 10, 18); blob(x, circ(8, 2.4, 1.4), 0xff6aa0, 1, 4); }],
  rock: [18, 12, (x) => { blob(x, (p) => { p.moveTo(1, 11.5); p.bezierCurveTo(0, 6, 4, 2, 9, 2.5); p.bezierCurveTo(14, 2, 18, 6, 17, 11.5); p.closePath(); }, 0x9a9aac, 2, 12); x.fillStyle = "rgba(255,255,255,.4)"; x.beginPath(); x.ellipse(7, 5, 2.6, 1.2, -0.3, 0, 7); x.fill(); }],
  dune: [40, 10, (x) => { blob(x, (p) => { p.moveTo(0.5, 9.8); p.bezierCurveTo(10, 1, 26, 0, 39.5, 9.8); p.closePath(); }, 0xe8b46a, 1, 10); }],
  crystal: [12, 22, (x) => { blob(x, poly([[6, 0.8], [11, 8], [9, 21], [3, 21], [1, 8]]), 0x7ae8ff, 0, 21); x.strokeStyle = "rgba(255,255,255,.8)"; x.beginPath(); x.moveTo(6, 3); x.lineTo(5, 18); x.stroke(); }],
  tower: [20, 46, (x) => { blob(x, poly([[2, 4], [18, 4], [18, 45.5], [2, 45.5]]), 0x3a3e68, 4, 46); for (let y = 8; y < 44; y += 5) for (let i = 4; i < 16; i += 4) { x.fillStyle = Math.random() < 0.6 ? "#5affd0" : "#ff5ad8"; x.fillRect(i, y, 2, 2); } blob(x, poly([[9, 0.5], [11, 0.5], [11, 4], [9, 4]]), 0x3a3e68, 0, 4); }],
  pillar: [12, 40, (x) => { blob(x, poly([[2, 3], [10, 3], [10, 39.5], [2, 39.5]]), 0x4a3a5a, 3, 40); x.fillStyle = "#ff3a5a"; x.fillRect(2.5, 10, 7, 1.4); x.fillRect(2.5, 26, 7, 1.4); blob(x, ellp(6, 2.6, 4, 2.2), 0xff3a5a, 0, 5); }],
  cloud: [40, 14, (x) => { x.strokeStyle = "rgba(120,150,200,.55)"; blob(x, (p) => { p.moveTo(4, 13); p.bezierCurveTo(-1, 13, 0, 6, 6, 7); p.bezierCurveTo(7, 1, 16, 0, 19, 4); p.bezierCurveTo(23, -1, 33, 1, 32, 6); p.bezierCurveTo(39, 5, 41, 13, 35, 13); p.closePath(); }, 0xeef6ff, 0, 14); }],
};
const propCvCache = {};
function propCv(id) { if (!propCvCache[id]) { const [w, h, draw] = PROP_ART[id]; propCvCache[id] = vcv(w, h, draw, 0.8); } return propCvCache[id]; }
function skyline(kind) { // far horizon: two layers of soft hills (or city blocks)
  const c = document.createElement("canvas"); c.width = 1024; c.height = 192;
  const x = c.getContext("2d");
  const col = { plains: ["#7ab8e8", "#5aa87a"], beach: ["#8ac8f0", "#3a9ae0"], forest: ["#2a5a6a", "#1a4a40"], desert: ["#d8946a", "#b86a4a"], city: ["#2a2050", "#1a1438"], dark: ["#3a0a3a", "#1a061e"] }[kind];
  for (let layer = 0; layer < 2; layer++) {
    x.fillStyle = col[layer];
    x.beginPath(); x.moveTo(0, 192);
    if (kind === "city") {
      let xx = 0; while (xx < 1024) { const w = 24 + Math.random() * 40, h = 40 + Math.random() * 110 - layer * 30; x.lineTo(xx, 192 - h); x.lineTo(xx + w, 192 - h); xx += w; }
    } else if (kind === "beach" && layer === 1) { x.lineTo(0, 160); x.lineTo(1024, 160); }
    else {
      const n = 6 + layer * 4, base = 192 - (kind === "dark" ? 110 : 80) + layer * 30;
      x.lineTo(0, base);
      for (let i = 0; i < n; i++) { const x0 = i * 1024 / n, x1 = (i + 1) * 1024 / n, peak = base - 20 - Math.random() * (kind === "dark" ? 70 : 45); x.bezierCurveTo(x0 + (x1 - x0) * 0.3, peak, x0 + (x1 - x0) * 0.7, peak, x1, base); }
    }
    x.lineTo(1024, 192); x.closePath(); x.fill();
  }
  if (kind === "city") { x.fillStyle = "#ffe066"; for (let i = 0; i < 260; i++) x.fillRect(Math.random() * 1024 | 0, 90 + Math.random() * 100 | 0, 3, 3); }
  return c;
}
const ENVS = {
  plains: { sky: ["#3a8ee8", "#8fd0ff", "#d8f4ff"], fog: 0xc8ecff, hemi: [0xcfe8ff, 0x3a6a3a], sun: 0xfff2b0, motes: [0xffffff, 0.35],
    tile: ["#5cc04a", [["#4aa83c", 60, 1, 2], ["#78d860", 40, 1, 1], ["#ffe066", 3, 1, 1], ["#ff8ab0", 3, 1, 1]], true, "rgba(120,255,220,.35)"],
    props: [["tree", 10], ["bush", 10], ["rock", 4]], clouds: 7 },
  beach: { sky: ["#2a9ae8", "#7ad0ff", "#e8f8ff"], fog: 0xd8f4ff, hemi: [0xe0f4ff, 0x8a7a5a], sun: 0xffffff, motes: [0xffffff, 0.3],
    tile: ["#f0d898", [["#e0c47a", 70, 1, 1], ["#fff0c0", 30, 1, 1], ["#ff9a8a", 2, 1, 1]], true, "rgba(90,200,255,.3)"],
    props: [["palm", 12], ["rock", 5]], clouds: 6, sea: true },
  forest: { sky: ["#0e2a3a", "#2a5a5a", "#6a9a7a"], fog: 0x4a7a6a, hemi: [0x9ad8b0, 0x1a2a1a], sun: 0xe8f8ff, moon: true, motes: [0xc8ff6a, 0.9],
    tile: ["#2f7a3a", [["#24602c", 80, 1, 2], ["#4a9a4a", 30, 1, 1], ["#c8ff6a", 2, 1, 1]], true, "rgba(160,255,120,.25)"],
    props: [["pine", 18], ["tree", 6], ["bush", 6]], clouds: 0 },
  desert: { sky: ["#e8783a", "#ffb86a", "#ffe0a0"], fog: 0xffd8a0, hemi: [0xffe0b0, 0x8a5a3a], sun: 0xffe060, motes: [0xffe0a0, 0.4],
    tile: ["#e8b46a", [["#d89a50", 70, 2, 1], ["#f8d08a", 30, 1, 1]], true, "rgba(255,120,60,.3)"],
    props: [["cactus", 10], ["dune", 8], ["rock", 6], ["crystal", 3]], clouds: 3 },
  city: { sky: ["#0a0820", "#2a1a50", "#5a2a7a"], fog: 0x2a1a50, hemi: [0x8a8aff, 0x2a1a3a], sun: 0xe8e8ff, moon: true, motes: [0x5affd0, 0.8],
    tile: ["#1e2034", [["#2a2e48", 40, 2, 2], ["#5affd0", 4, 1, 1]], true, "rgba(90,255,210,.8)"],
    props: [["tower", 16], ["crystal", 6]], clouds: 0 },
  dark: { sky: ["#05020c", "#1c0628", "#4a0a2a"], fog: 0x2a0a24, hemi: [0xb06aff, 0x1a0a10], sun: 0xff5a5a, moon: true, motes: [0xff3a5a, 0.9],
    tile: ["#1a0e22", [["#2a1634", 50, 2, 1], ["#ff3a5a", 3, 3, 1], ["#5affd0", 2, 1, 1]], true, "rgba(255,60,120,.6)"],
    props: [["pillar", 12], ["crystal", 8], ["rock", 6]], clouds: 0 },
};
let envGroup = null, envId = null, envEvent = null, envProps = [], envLanterns = [], envSnow = null, envDecor = {}, envGround = null, envClouds = [], fireworkT = 0;
function radialTexture(inner, outer) {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner); g.addColorStop(1, outer);
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
function styleStars() {
  const E = ENVS[envId] || ENVS.plains;
  if (!stars) return;
  stars.material.color.set(E.motes[0]); stars.material.opacity = E.motes[1];
  stars.material.size = E.moon ? 0.9 : 0.6;
}
function setEnvironment(id, eventId) {
  if (!ENVS[id]) id = "plains";
  if (envId === id && envEvent === (eventId || null)) return;
  envId = id; envEvent = eventId || null;
  if (envGroup) scene.remove(envGroup);
  envGroup = new THREE.Group(); envProps = []; envLanterns = []; envSnow = null; envDecor = {}; envClouds = [];
  scene.add(envGroup);
  const E = ENVS[id];
  setSky(E.sky[0], E.sky[1], E.sky[2]);
  scene.fog.color.set(E.fog);
  hemi.color.set(E.hemi[0]); hemi.groundColor.set(E.hemi[1]);
  // ground: 32x32 pixel tile repeated; the texture scrolls to make the world move
  const [base, spots, grid, gridCol] = E.tile;
  const gt = canTex(tileCanvas(base, spots, grid, gridCol), [600 / TILE, 520 / TILE]);
  envGround = new THREE.Mesh(new THREE.PlaneGeometry(600, 520), new THREE.MeshBasicMaterial({ map: gt }));
  envGround.rotation.x = -Math.PI / 2; envGround.position.set(0, 0, -240); envGroup.add(envGround);
  if (E.sea) { // a strip of pixel sea toward the horizon
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(900, 300), new THREE.MeshBasicMaterial({ map: canTex(tileCanvas("#2a9ae0", [["#5ac0f0", 40, 3, 1], ["#ffffff", 8, 2, 1]], false), [900 / TILE, 300 / TILE]) }));
    sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.05, -420); envGroup.add(sea); envGround.userData.sea = sea;
  }
  // far skyline
  const sk = new THREE.Mesh(new THREE.PlaneGeometry(2600, 300), new THREE.MeshBasicMaterial({ map: canTex(skyline(id)), transparent: true, fog: false, depthWrite: false }));
  sk.position.set(-300, 110, -620); envGroup.add(sk);
  // sun / moon
  sunSprite.material.map = canTex(orbCanvas(E.sun, 0xc8c8d8, E.moon)); sunSprite.material.needsUpdate = true;
  sunGlow.material.color.set(E.sun); sunGlow.material.opacity = E.moon ? 0.35 : 0.8;
  planet.position.set(E.moon ? -140 : 150, E.moon ? 150 : 130, -620);
  // billboard props on both sides of the battle lane
  for (const [pid, n] of E.props) for (let i = 0; i < n; i++) {
    const cv = propCv(pid), sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: canTex(cv), transparent: true, alphaTest: 0.05 }));
    const s = (pid === "tower" || pid === "pillar" ? rand(0.32, 0.5) : rand(0.2, 0.3)) / 4;
    sp.center.set(0.5, 0); sp.scale.set(cv.width * s, cv.height * s, 1);
    // mostly beyond the far side of the battle lane (the camera looks from the right)
    const side = Math.random() < 0.75 ? -1 : 1;
    sp.position.set(side < 0 ? -rand(34, 130) : rand(40, 110), 0, rand(-420, 10));
    envGroup.add(sp); envProps.push(sp);
  }
  for (let i = 0; i < E.clouds; i++) {
    const cv = propCv("cloud"), sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: canTex(cv), transparent: true, fog: false, opacity: 0.95, depthWrite: false }));
    const s = rand(1.2, 2.4) / 4; sp.scale.set(cv.width * s, cv.height * s, 1);
    sp.position.set(rand(-420, 200), rand(70, 150), rand(-520, -380));
    envGroup.add(sp); envClouds.push(sp);
  }
  styleStars();
  // festival decorations (see EVENTS[...].decor in js/progress.js)
  const decor = eventId && typeof EVENTS !== "undefined" && EVENTS[eventId] ? EVENTS[eventId].decor || {} : {};
  envDecor = decor;
  if (decor.sky) setSky(decor.sky[0], decor.sky[1], decor.sky[2]);
  if (decor.lanterns) {
    const colors = decor.lanterns;
    for (let i = 0; i < 18; i++) {
      const cv = vcv(10, 14, (x) => { blob(x, ellp(5, 7, 4.4, 4.2), colors[i % colors.length], 3, 11); blob(x, poly([[2.5, 1.6], [7.5, 1.6], [7.5, 3.2], [2.5, 3.2]]), 0xffc23a, 1, 3); blob(x, poly([[2.5, 10.8], [7.5, 10.8], [7.5, 12.4], [2.5, 12.4]]), 0xffc23a, 10, 12); }, 0.6);
      const l = new THREE.Sprite(new THREE.SpriteMaterial({ map: canTex(cv), transparent: true, alphaTest: 0.05 }));
      l.scale.set(cv.width * 0.075, cv.height * 0.075, 1);
      l.position.set((Math.random() < 0.5 ? -1 : 1) * (18 + Math.random() * 40), 6 + Math.random() * 26, -20 - Math.random() * 160);
      l.userData.ph = Math.random() * 6;
      envGroup.add(l); envLanterns.push(l);
    }
  }
  if (decor.moon) {
    const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: canTex(orbCanvas(0xfff1b8, 0xe8d898, true)), fog: false, transparent: true }));
    moon.position.set(110, 90, -400); moon.scale.setScalar(60); envGroup.add(moon);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture("rgba(255,240,180,.6)", "rgba(0,0,0,0)"), transparent: true, depthWrite: false, fog: false }));
    halo.position.copy(moon.position); halo.scale.setScalar(160); envGroup.add(halo);
  }
  if (decor.sprites) {
    for (let i = 0; i < 22; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTexture(decor.sprites[i % decor.sprites.length]), transparent: true, depthWrite: false, fog: false }));
      sp.position.set((Math.random() < 0.5 ? -1 : 1) * (14 + Math.random() * 45), 4 + Math.random() * 30, -15 - Math.random() * 170);
      sp.scale.setScalar(3 + Math.random() * 3);
      sp.userData.ph = Math.random() * 6;
      envGroup.add(sp); envLanterns.push(sp);
    }
  }
  if (decor.snow) {
    const n = S.prefs.quality === "high" ? 900 : 350, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 160; pos[i * 3 + 1] = Math.random() * 70; pos[i * 3 + 2] = -Math.random() * 160 + 15; }
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    envSnow = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.45, transparent: true, opacity: 0.95, depthWrite: false, fog: false }));
    envGroup.add(envSnow);
  }
}
const emojiCache = {};
function emojiTexture(ch) {
  if (emojiCache[ch]) return emojiCache[ch];
  const c = document.createElement("canvas"); c.width = c.height = 96;
  const x = c.getContext("2d"); x.textAlign = "center"; x.textBaseline = "middle";
  x.font = '76px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif'; x.fillText(ch, 48, 52);
  return (emojiCache[ch] = canTex(c));
}
function updateEnvironment(dt, speed) {
  if (!envGroup) return;
  if (envGround) {
    const m = envGround.material.map; m.offset.y += speed * 0.6 * dt / TILE; if (m.offset.y > 1000) m.offset.y -= 1000;
    if (envGround.userData.sea) envGround.userData.sea.material.map.offset.x += dt * 0.05;
  }
  for (const p of envProps) { p.position.z += speed * 0.6 * dt; if (p.position.z > 20) p.position.z -= 440; }
  for (const c of envClouds) { c.position.x += dt * 3; if (c.position.x > 330) c.position.x -= 660; }
  const t = performance.now() / 1000;
  for (const l of envLanterns) l.position.y += Math.sin(t + l.userData.ph) * 0.01;
  if (envSnow) {
    const a = envSnow.geometry.attributes.position;
    for (let i = 0; i < a.count; i++) { a.array[i * 3 + 1] -= dt * (3 + (i % 5)); a.array[i * 3] += Math.sin(t + i) * dt * 0.6; if (a.array[i * 3 + 1] < 0) a.array[i * 3 + 1] += 70; }
    a.needsUpdate = true;
  }
  if (envDecor.fireworks) {
    fireworkT -= dt;
    if (fireworkT <= 0) {
      fireworkT = 0.6 + Math.random() * 1.2;
      const cols = envDecor.fireworks;
      explode(new V3((Math.random() - 0.5) * 160, 25 + Math.random() * 40, -120 - Math.random() * 120), cols[Math.floor(Math.random() * cols.length)], 90, 1.6, 22);
    }
  }
}

/* =====================================================================
 *  BACKGROUND MUSIC (tiny chiptune loop; speeds up with your combo)
 * ===================================================================== */
const Music = {
  on: false, timer: null, step: 0, nextT: 0, tempo: 1, gain: null,
  start() {
    this.stop();
    if (!S.prefs.music || !S.prefs.sound) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      actx = actx || new AC(); if (actx.state === "suspended") actx.resume();
      if (!noiseBuf) { noiseBuf = actx.createBuffer(1, actx.sampleRate * 0.6, actx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
      this.gain = actx.createGain(); this.gain.gain.value = 0.05; this.gain.connect(actx.destination);
      this.on = true; this.step = 0; this.tempo = 1; this.nextT = actx.currentTime + 0.15;
      this.timer = setInterval(() => this.tick(), 60);
    } catch (e) {}
  },
  stop() {
    this.on = false; if (this.timer) clearInterval(this.timer); this.timer = null;
    if (this.gain) { try { this.gain.gain.setTargetAtTime(0, actx.currentTime, 0.2); } catch (e) {} this.gain = null; }
  },
  setTier(tier) { this.tempo = [1, 1.08, 1.16, 1.25, 1.36][tier] || 1; },
  tick() {
    if (!this.on || !actx) return;
    const eighth = 60 / (124 * this.tempo) / 2;
    while (this.nextT < actx.currentTime + 0.25) { this.note(this.step, this.nextT, eighth); this.nextT += eighth; this.step++; }
  },
  note(step, t, len) {
    // I - V - vi - IV adventure progression, square bass + triangle arpeggio (8-bit style)
    const roots = [60, 55, 57, 53], quality = [[0, 4, 7, 12], [0, 4, 7, 11], [0, 3, 7, 12], [0, 4, 7, 9]];
    const bar = Math.floor(step / 8) % 4, root = roots[bar], q = quality[bar];
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const play = (freq, dur, vol, type) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(this.gain); o.start(t); o.stop(t + dur + 0.02);
    };
    if (step % 2 === 0) play(hz(root - 12), len * 1.8, 0.9, "square");
    play(hz(root + 12 + q[[0, 1, 2, 3, 2, 1, 2, 3][step % 8]]), len * 0.9, 0.35, "triangle");
    if (step % 16 === 14) play(hz(root + 24 + q[2]), len * 1.6, 0.18, "square");
    if (step % 4 === 0) { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.15); g.gain.setValueAtTime(1.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18); o.connect(g); g.connect(this.gain); o.start(t); o.stop(t + 0.2); }
    if (step % 2 === 1 && noiseBuf) { const s = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain(); s.buffer = noiseBuf; f.type = "highpass"; f.frequency.value = 7000; g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05); s.connect(f); f.connect(g); g.connect(this.gain); s.start(t); s.stop(t + 0.06); }
  },
};
