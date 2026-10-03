"use strict";
/* =====================================================================
 *  THREE.JS SCENE: the "HD pixel" Digital World
 *  Pixel-art sprites (models.js) stand on a scrolling pixel-tile ground,
 *  with billboard pixel props, fog for depth, glow and square particles.
 * ===================================================================== */
const V3 = THREE.Vector3;
const canvas = $("#scene");
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
} catch (e) {
  document.body.insertAdjacentHTML("beforeend", '<div class="note" style="position:fixed;bottom:10px;left:10px;right:10px;z-index:99">This browser cannot show 3D graphics (WebGL is off). Please try Chrome or Edge.</div>');
}
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1400);
scene.fog = new THREE.Fog(0x9ad8ff, 70, 230);
function setSky(top, mid, bottom) {
  const c = document.createElement("canvas"); c.width = 4; c.height = 64; // few rows = banded "pixel" gradient
  const x = c.getContext("2d"), gr = x.createLinearGradient(0, 0, 0, 64);
  gr.addColorStop(0, top); gr.addColorStop(0.55, mid); gr.addColorStop(1, bottom);
  x.fillStyle = gr; x.fillRect(0, 0, 4, 64);
  if (scene.background && scene.background.dispose) scene.background.dispose();
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter;
  scene.background = t;
}
setSky("#3a8ee8", "#8fd0ff", "#d8f4ff");
const hemi = new THREE.HemisphereLight(0xcfe8ff, 0x3a5a3a, 1.0); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 0.9); sun.position.set(-6, 12, 8); scene.add(sun);

function pixTex(cv, repeat) {
  const t = new THREE.CanvasTexture(cv);
  t.magFilter = THREE.NearestFilter;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); t.minFilter = THREE.LinearMipmapLinearFilter; if (renderer) t.anisotropy = renderer.capabilities.getMaxAnisotropy(); }
  else { t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; }
  return t;
}
function artCv(w, h, draw, colors) { const d = new MODELS.PixelArt(w, h); draw(d, colors || {}); return d.render(); }

/* sun / moon far away (pages.js spins "planet") */
const planet = new THREE.Group(); scene.add(planet);
const ring = new THREE.Group();
function orbCanvas(color, rim, moon) {
  return artCv(24, 24, (d) => { d.ell(12, 12, 11, 11, color, { spec: true }); if (moon) for (const [x, y, r] of [[8, 9, 2.4], [15, 15, 3], [15, 7, 1.6]]) d.ell(x, y, r, r, rim, { paint: [color] }); });
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

/* ---------- effects: square beams, pixel bursts ---------- */
const effects = [];
const beamGeo = new THREE.CylinderGeometry(1, 1, 1, 4, 1, true);
const flashGeo = new THREE.BoxGeometry(1, 1, 1);
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
  const mat = new THREE.PointsMaterial({ color, size: size * 1.4, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
  const p = new THREE.Points(geo, mat); scene.add(p);
  effects.push({ obj: p, life: 0.9, max: 0.9, kind: "burst", vel });
  const flash = new THREE.Mesh(flashGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
  flash.scale.setScalar(size * 4); flash.rotation.set(0.6, 0.6, 0);
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
    } else if (e.kind === "flash") { e.obj.material.opacity = k; e.obj.scale.setScalar(e.s * (1 + (1 - k) * 1.5)); e.obj.rotation.z += dt * 4; }
    if (e.life <= 0) {
      scene.remove(e.obj);
      if (e.obj.geometry !== beamGeo && e.obj.geometry !== flashGeo) e.obj.geometry.dispose();
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
const TILE = 4; // world units per ground tile (32 px => 1/8 unit per pixel)
const rand = (a, b) => a + Math.random() * (b - a);
function tileCanvas(base, spots, grid, gridColor) { // 32x32 seamless pixel tile
  const c = document.createElement("canvas"); c.width = c.height = 32;
  const x = c.getContext("2d");
  x.fillStyle = base; x.fillRect(0, 0, 32, 32);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (const [col, n, w, h] of spots) { x.fillStyle = col; for (let i = 0; i < n; i++) x.fillRect(Math.floor(rnd() * 32), Math.floor(rnd() * 32), w, h); }
  if (grid) { x.fillStyle = gridColor; x.fillRect(0, 0, 32, 1); x.fillRect(0, 0, 1, 32); }
  return c;
}
/* billboard pixel props: tree, palm, cactus, rock, pine, tower, crystal, pillar */
const PROP_ART = {
  tree: [22, 30, (d) => { d.rect(9.5, 18, 3, 12, 0x8a5a2e); d.ell(11, 11, 9, 8, 0x3aa84a); d.ell(6, 15, 5, 4, 0x3aa84a, { join: true }); d.ell(16, 15, 5, 4, 0x3aa84a, { join: true }); d.ell(9, 8, 2, 1.5, 0x7ad86a, { paint: [0x3aa84a] }); }],
  bush: [16, 10, (d) => { d.ell(8, 6, 7, 4, 0x4ab85a); d.ell(5, 4, 1.4, 1.2, 0xff7ab0); d.ell(11, 5, 1.3, 1.2, 0xffe066); }],
  palm: [24, 34, (d) => { d.chain([[12, 33], [11, 22], [13, 10]], 1.8, 1.3, 0xb07a3e); d.sym(() => { d.chain([[13, 9], [6, 7], [1, 12]], 1.6, 0.6, 0x3ab85a); d.chain([[13, 9], [8, 2], [3, 3]], 1.6, 0.6, 0x3ab85a); }); d.ell(12, 11, 1.6, 1.6, 0x6a4a2a); }],
  pine: [18, 32, (d) => { d.rect(7.5, 26, 3, 6, 0x6a4a2a); for (const [y, w] of [[27, 8.5], [20, 7], [13, 5.5]]) d.tri(9 - w, y, 9 + w, y, 9, y - 10, 0x2a7a4a); }],
  cactus: [16, 24, (d) => { d.cap(8, 23, 8, 3, 2.6, 2.6, 0x4aa85a); d.chain([[8, 14], [3, 14], [3, 8]], 1.6, 1.6, 0x4aa85a); d.chain([[8, 17], [13, 17], [13, 11]], 1.6, 1.6, 0x4aa85a); d.ell(8, 2.5, 1.4, 1.4, 0xff6aa0); }],
  rock: [18, 12, (d) => { d.ell(9, 7.5, 8.5, 5, 0x8a8a9a); d.ell(5, 9, 4, 3, 0x7a7a8a); }],
  dune: [40, 10, (d) => { d.ell(20, 10, 20, 8, 0xe0a85a); }],
  crystal: [12, 22, (d) => { d.poly([[6, 0.5], [11, 8], [9, 21], [3, 21], [1, 8]], 0x7ae8ff, { spec: true }); d.cap(6, 4, 5, 18, 0.6, 0.6, 0xffffff, { paint: [0x7ae8ff] }); }],
  tower: [20, 46, (d) => { d.rect(2, 4, 16, 42, 0x2a2e48); for (let y = 8; y < 44; y += 5) for (let x = 4; x < 16; x += 4) d.rect(x, y, 2, 2, Math.random() < 0.6 ? 0x5affd0 : 0xff5ad8, { paint: [0x2a2e48] }); d.rect(9, 0, 2, 4, 0x2a2e48); }],
  pillar: [12, 40, (d) => { d.rect(2, 2, 8, 38, 0x3a2a4a); d.rect(2, 10, 8, 1.4, 0xff3a5a, { paint: [0x3a2a4a] }); d.rect(2, 26, 8, 1.4, 0xff3a5a, { paint: [0x3a2a4a] }); d.ell(6, 2, 4, 2.4, 0xff3a5a, { spec: true }); }],
  cloud: [40, 14, (d) => { d.ell(20, 9, 14, 5, 0xffffff); d.ell(13, 7, 7, 5, 0xffffff, { join: true }); d.ell(26, 6, 8, 5.5, 0xffffff, { join: true }); }],
};
const propCvCache = {};
function propCv(id) { if (!propCvCache[id]) { const [w, h, draw] = PROP_ART[id]; propCvCache[id] = artCv(w, h, draw); } return propCvCache[id]; }
function skyline(kind) { // far horizon silhouette, 256x48 pixels
  const c = document.createElement("canvas"); c.width = 256; c.height = 48;
  const x = c.getContext("2d");
  const col = { plains: ["#5a9ad0", "#4a8a6a"], beach: ["#6ab0e0", "#2a8ad0"], forest: ["#2a4a5a", "#1a3a3a"], desert: ["#c8784a", "#a85a3a"], city: ["#2a2050", "#1a1438"], dark: ["#2a0a2a", "#14061a"] }[kind];
  for (let layer = 0; layer < 2; layer++) {
    x.fillStyle = col[layer];
    let h = 20 + layer * 6;
    for (let i = 0; i < 256; i++) {
      if (kind === "city") { if (i % 12 === 0) h = 10 + Math.random() * 30 - layer * 6; }
      else if (kind === "beach" && layer === 1) h = 8;
      else h = Math.max(4, Math.min(44, h + (Math.random() - 0.5) * (kind === "dark" ? 6 : 3)));
      x.fillRect(i, 48 - h, 1, h);
    }
  }
  if (kind === "city") { x.fillStyle = "#ffe066"; for (let i = 0; i < 90; i++) x.fillRect(Math.random() * 256 | 0, 24 + Math.random() * 22 | 0, 1, 1); }
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
  const gt = pixTex(tileCanvas(base, spots, grid, gridCol), [600 / TILE, 520 / TILE]);
  envGround = new THREE.Mesh(new THREE.PlaneGeometry(600, 520), new THREE.MeshBasicMaterial({ map: gt }));
  envGround.rotation.x = -Math.PI / 2; envGround.position.set(0, 0, -240); envGroup.add(envGround);
  if (E.sea) { // a strip of pixel sea toward the horizon
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(900, 300), new THREE.MeshBasicMaterial({ map: pixTex(tileCanvas("#2a9ae0", [["#5ac0f0", 40, 3, 1], ["#ffffff", 8, 2, 1]], false), [900 / TILE, 300 / TILE]) }));
    sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.05, -420); envGroup.add(sea); envGround.userData.sea = sea;
  }
  // far skyline
  const sk = new THREE.Mesh(new THREE.PlaneGeometry(1100, 206), new THREE.MeshBasicMaterial({ map: pixTex(skyline(id)), transparent: true, fog: false, depthWrite: false }));
  sk.position.set(0, 85, -560); envGroup.add(sk);
  // sun / moon
  sunSprite.material.map = pixTex(orbCanvas(E.sun, 0xc8c8d8, E.moon)); sunSprite.material.needsUpdate = true;
  sunGlow.material.color.set(E.sun); sunGlow.material.opacity = E.moon ? 0.35 : 0.8;
  planet.position.set(E.moon ? -140 : 150, E.moon ? 150 : 130, -620);
  // billboard props on both sides of the battle lane
  for (const [pid, n] of E.props) for (let i = 0; i < n; i++) {
    const cv = propCv(pid), sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: pixTex(cv), transparent: true, alphaTest: 0.5 }));
    const s = pid === "tower" || pid === "pillar" ? rand(0.32, 0.5) : rand(0.2, 0.3);
    sp.center.set(0.5, 0); sp.scale.set(cv.width * s, cv.height * s, 1);
    const side = Math.random() < 0.5 ? -1 : 1;
    sp.position.set(side * rand(26, 110), 0, rand(-420, 10));
    envGroup.add(sp); envProps.push(sp);
  }
  for (let i = 0; i < E.clouds; i++) {
    const cv = propCv("cloud"), sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: pixTex(cv), transparent: true, alphaTest: 0.5, fog: false, opacity: 0.95 }));
    const s = rand(1.2, 2.4); sp.scale.set(cv.width * s, cv.height * s, 1);
    sp.position.set(rand(-300, 300), rand(60, 140), rand(-520, -380));
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
      const cv = artCv(10, 14, (d) => { d.ell(5, 7, 4.6, 4.4, colors[i % colors.length], { spec: true }); d.rect(2, 1.5, 6, 1.6, 0xffc23a); d.rect(2, 11, 6, 1.6, 0xffc23a); d.cap(5, 12.5, 5, 14, 0.5, 0.5, 0xffc23a); });
      const l = new THREE.Sprite(new THREE.SpriteMaterial({ map: pixTex(cv), transparent: true, alphaTest: 0.5 }));
      l.scale.set(cv.width * 0.3, cv.height * 0.3, 1);
      l.position.set((Math.random() < 0.5 ? -1 : 1) * (18 + Math.random() * 40), 6 + Math.random() * 26, -20 - Math.random() * 160);
      l.userData.ph = Math.random() * 6;
      envGroup.add(l); envLanterns.push(l);
    }
  }
  if (decor.moon) {
    const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: pixTex(orbCanvas(0xfff1b8, 0xe8d898, true)), fog: false, transparent: true }));
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
function emojiTexture(ch) { // emoji drawn small then shown with nearest filtering = pixel emoji
  if (emojiCache[ch]) return emojiCache[ch];
  const c = document.createElement("canvas"); c.width = c.height = 24;
  const x = c.getContext("2d"); x.textAlign = "center"; x.textBaseline = "middle";
  x.font = '18px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif'; x.fillText(ch, 12, 13);
  return (emojiCache[ch] = pixTex(c));
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
