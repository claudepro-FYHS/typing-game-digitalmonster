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
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
} catch (e) {
  document.body.insertAdjacentHTML("beforeend", '<div class="note" style="position:fixed;bottom:10px;left:10px;right:10px;z-index:99">This browser cannot show 3D graphics (WebGL is off). Please try Chrome or Edge.</div>');
}
const scene = new THREE.Scene();
/* GRAPHICS: HIGH adds post-processing: soft bloom on bright things (beams, sparkles, evolution),
   a gentle colour grade and a vignette. It needs WebGL2 and lib/postfx.js; LOW renders directly. */
const GRADE = {
  uniforms: { tDiffuse: { value: null } },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
  fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv;
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      c.rgb = mix(vec3(l), c.rgb, 1.12);                                   // a little more colour
      c.rgb = (c.rgb - 0.5) * 1.06 + 0.5;                                  // a little more contrast
      c.rgb += vec3(0.035, 0.015, -0.02) * smoothstep(0.4, 1.0, l);        // warm highlights
      c.rgb += vec3(-0.02, 0.0, 0.035) * (1.0 - smoothstep(0.0, 0.45, l)); // cool shadows
      vec2 d = vUv - 0.5; c.rgb *= 1.0 - 0.38 * dot(d, d) * 2.2;          // soft vignette
      gl_FragColor = c;
    }` };
let composer = null;
function setPostFx(on) {
  if (composer) { composer.renderTarget1.dispose(); composer.renderTarget2.dispose(); composer = null; }
  if (!on || !renderer || !renderer.capabilities.isWebGL2 || !THREE.EffectComposer || !THREE.UnrealBloomPass) return;
  try {
    const rt = new THREE.WebGLRenderTarget(16, 16, { samples: 4, type: THREE.HalfFloatType }); // samples = anti-aliasing
    composer = new THREE.EffectComposer(renderer, rt);
    composer.addPass(new THREE.RenderPass(scene, camera));
    composer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(512, 512), 0.32, 0.45, 0.95));
    composer.addPass(new THREE.ShaderPass(GRADE));
  } catch (e) { composer = null; }
}
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
  MODELS.setQuality(high);
  setPostFx(high);
  if (previewMechId) setPreviewMech(previewMechId.split("|")[0], previewMechId.split("|")[1]);
  buildStars(high ? 900 : 350);
  if (envId) { const id = envId, ev = envEvent; envId = null; setEnvironment(id, ev); } // grass and flowers only on HIGH
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
/* ---------- partner attacks (see MOVES in models.js). Each returns the seconds until it hits. ---------- */
let slashTex = null;
function slashTexture() { // a white crescent with a soft glow
  if (slashTex) return slashTex;
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const x = c.getContext("2d"); x.lineCap = "round";
  for (const [w, a] of [[22, 0.25], [12, 0.6], [5, 1]]) { x.strokeStyle = `rgba(255,255,255,${a})`; x.lineWidth = w; x.beginPath(); x.arc(40, 64, 50, -1.1, 1.1); x.stroke(); }
  return (slashTex = new THREE.CanvasTexture(c));
}
function glowBall(color, size) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTexture(), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  sp.scale.setScalar(size); scene.add(sp); return sp;
}
function projectile(from, to, color, size, dur, delay, arc) {
  const sp = glowBall(color, size), core = glowBall(0xffffff, size * 0.45);
  sp.visible = core.visible = false;
  effects.push({ obj: sp, core, life: dur + delay, max: dur, delay, kind: "proj", from: from.clone(), to: to.clone(), arc: arc || 0, color, size });
  return dur + delay;
}
function attackFx(a, from, to, big) {
  const c = a.color, d = from.distanceTo(to);
  if (a.type === "beam") { beam(from, to, c, big ? 0.35 : 0.22, 0.3); beam(from, to, 0xffffff, big ? 0.12 : 0.07, 0.25); return 0; }
  if (a.type === "bolt") { // zig-zag lightning made of short beams
    let p0 = from.clone(); const n = 7;
    for (let i = 1; i <= n; i++) {
      const p1 = from.clone().lerp(to, i / n); if (i < n) p1.add(new V3((Math.random() - 0.5) * 2.4, (Math.random() - 0.5) * 2.4, (Math.random() - 0.5) * 1.2));
      beam(p0, p1, c, 0.16, 0.22); beam(p0, p1, 0xffffff, 0.05, 0.2); p0 = p1;
    }
    return 0;
  }
  if (a.type === "shot") return projectile(from, to, c, (a.big ? 4.2 : 2.6) * (big ? 1 : 0.8), Math.min(0.3, Math.max(0.12, d / 160)), 0, 0.15);
  if (a.type === "volley") { let t = 0; for (let i = 0; i < 4; i++) t = projectile(from, to.clone().add(new V3((Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 0)), c, 1.3, Math.min(0.26, Math.max(0.12, d / 180)), i * 0.045, (i % 2 ? 1 : -1) * 0.25); return t; }
  if (a.type === "dash") { // the partner flies there (game.js moves it); a crescent slash flashes on arrival
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: slashTexture(), color: c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    sp.position.copy(to); sp.scale.setScalar(big ? 7 : 5.5); sp.material.rotation = Math.random() * 0.8 - 0.4; scene.add(sp);
    effects.push({ obj: sp, life: DASH.out + 0.25, max: 0.25, delay: DASH.out, kind: "slash" });
    return DASH.out;
  }
  beam(from, to, c, 0.18, 0.22); return 0;
}
const DASH = { out: 0.14, hold: 0.08, back: 0.22 };

function updateEffects(dt) {
  for (let i = effects.length - 1; i >= 0; i--) {
    const e = effects[i]; e.life -= dt;
    const k = Math.max(0, e.life / e.max);
    if (e.kind === "proj") {
      const run = e.max + e.delay - e.life; // seconds since launch
      const k = Math.min(1, Math.max(0, (run - e.delay) / e.max));
      const on = run >= e.delay && e.life > 0;
      e.obj.visible = e.core.visible = on;
      if (on) {
        const pos = e.from.clone().lerp(e.to, k); pos.y += Math.sin(k * Math.PI) * e.arc * e.from.distanceTo(e.to) * 0.25;
        e.obj.position.copy(pos); e.core.position.copy(pos);
        if (Math.random() < 0.6) { const tr = glowBall(e.color, e.size * 0.5); tr.position.copy(pos); effects.push({ obj: tr, life: 0.18, max: 0.18, kind: "trail", s: e.size * 0.5 }); }
      }
      if (e.life - dt <= 0) { scene.remove(e.core); e.core.material.dispose(); }
    } else if (e.kind === "trail") { e.obj.material.opacity = k * 0.8; e.obj.scale.setScalar(e.s * k); }
    else if (e.kind === "slash") { const run = e.max + e.delay - e.life; e.obj.material.opacity = run < e.delay ? 0 : k; e.obj.scale.multiplyScalar(run < e.delay ? 1 : 1 + dt * 2); }
    else if (e.kind === "beam") { e.obj.material.opacity = k; e.obj.scale.x = e.obj.scale.z = e.w * (0.4 + k * 0.6); }
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
  const key = id + "|" + (skinId || "default") + "|" + S.prefs.quality; // HIGH draws sharper pictures
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
  if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); }
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
  grass: [14, 10, (x) => { x.strokeStyle = "rgba(30,90,30,.6)"; for (const [a, b, c] of [[2, 9.5, 4], [5, 9.5, 1], [7, 9.5, 6], [9, 9.5, 2], [12, 9.5, 8]]) blob(x, (p) => { p.moveTo(a - 1.4, b); p.quadraticCurveTo(a, b - 6, c * 0.4 + a * 0.6, b - 8.5); p.quadraticCurveTo(a + 0.7, b - 4, a + 1.4, b); p.closePath(); }, 0x3fa83a, 1, 10); }],
  flower: [10, 14, (x) => { x.strokeStyle = "#3a8a3a"; x.lineWidth = 1.2; x.beginPath(); x.moveTo(5, 13.5); x.quadraticCurveTo(4, 9, 5, 5); x.stroke(); x.strokeStyle = OUT; x.lineWidth = 0.8;
    const c = [0xff8ab4, 0xffe066, 0xffffff, 0xb08aff][Math.random() * 4 | 0]; for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28; blob(x, circ(5 + Math.cos(a) * 2, 4.5 + Math.sin(a) * 2, 1.7), c, 1, 8); } blob(x, circ(5, 4.5, 1.2), 0xffb02a, 3, 6); }],
  cloud: [40, 14, (x) => { x.strokeStyle = "rgba(120,150,200,.55)"; blob(x, (p) => { p.moveTo(4, 13); p.bezierCurveTo(-1, 13, 0, 6, 6, 7); p.bezierCurveTo(7, 1, 16, 0, 19, 4); p.bezierCurveTo(23, -1, 33, 1, 32, 6); p.bezierCurveTo(39, 5, 41, 13, 35, 13); p.closePath(); }, 0xeef6ff, 0, 14); }],
};
const propCvCache = {};
function propCv(id) { if (!propCvCache[id]) { const [w, h, draw] = PROP_ART[id]; propCvCache[id] = vcv(w, h, draw, 0.8); } return propCvCache[id]; }
function skyline(kind) { // far horizon: two layers of soft hills (or city blocks)
  const c = document.createElement("canvas"); c.width = 1024; c.height = 192;
  const x = c.getContext("2d");
  const col = { plains: ["#9ccbe8", "#7ab89a", "#4f9a62"], beach: ["#a8d8f4", "#8ac8f0", "#3a9ae0"], forest: ["#3a6a7a", "#2a5a6a", "#1a4a40"], desert: ["#e8b08a", "#d8946a", "#b86a4a"], city: ["#3a3070", "#2a2050", "#1a1438"], dark: ["#4a1a4a", "#3a0a3a", "#1a061e"] }[kind];
  for (let layer = 0; layer < 3; layer++) {
    if (layer) { // haze between the layers
      const hz = x.createLinearGradient(0, 60, 0, 192); hz.addColorStop(0, "rgba(255,255,255,0)"); hz.addColorStop(1, "rgba(235,245,255,0.35)");
      x.fillStyle = hz; x.fillRect(0, 0, 1024, 192);
    }
    x.fillStyle = col[layer];
    x.beginPath(); x.moveTo(0, 192);
    if (kind === "city") {
      let xx = 0; while (xx < 1024) { const w = 24 + Math.random() * 40, h = 40 + Math.random() * 110 - layer * 30; x.lineTo(xx, 192 - h); x.lineTo(xx + w, 192 - h); xx += w; }
    } else if (kind === "beach" && layer === 1) { x.lineTo(0, 160); x.lineTo(1024, 160); }
    else {
      const n = 4 + layer * 4, base = 192 - (kind === "dark" ? 120 : 100) + layer * 30;
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
let envRays = null, envGroup = null, envId = null, envEvent = null, envProps = [], envLanterns = [], envSnow = null, envDecor = {}, envGround = null, envClouds = [], fireworkT = 0;
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
  if (envRays) { planet.remove(envRays); envRays = null; }
  envGroup = new THREE.Group(); envProps = []; envLanterns = []; envSnow = null; envDecor = {}; envClouds = [];
  scene.add(envGroup);
  const E = ENVS[id];
  setSky(E.sky[0], E.sky[1], E.sky[2]);
  scene.fog.color.set(E.fog);
  hemi.color.set(E.hemi[0]); hemi.groundColor.set(E.hemi[1]);
  // ground: one 128x128 tile repeated; the texture scrolls to make the world move
  const [base, spots, grid, gridCol] = E.tile;
  const gt = canTex(tileCanvas(base, spots, grid, gridCol), [600 / TILE, 520 / TILE]);
  envGround = new THREE.Mesh(new THREE.PlaneGeometry(600, 520), new THREE.MeshBasicMaterial({ map: gt }));
  envGround.rotation.x = -Math.PI / 2; envGround.position.set(0, 0, -240); envGroup.add(envGround);
  if (E.sea) { // a strip of sea toward the horizon
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
  // GRAPHICS: HIGH: grass and flowers on the green battlefields
  if (S.prefs.quality === "high" && (id === "plains" || id === "forest")) for (let i = 0; i < 140; i++) {
    const kind = Math.random() < 0.7 ? "grass" : "flower", cv = propCv(kind);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: canTex(cv), transparent: true, alphaTest: 0.05 }));
    const s = rand(0.03, 0.05) * (kind === "flower" ? 0.8 : 1); sp.center.set(0.5, 0); sp.scale.set(cv.width * s, cv.height * s, 1);
    sp.position.set(rand(-60, 40), 0, rand(-420, 18)); envGroup.add(sp); envProps.push(sp);
  }
  // soft light rays around the sun
  if (!E.moon) {
    const rc = document.createElement("canvas"); rc.width = rc.height = 256; const rx = rc.getContext("2d");
    rx.translate(128, 128);
    for (let i = 0; i < 14; i++) {
      rx.rotate(Math.PI * 2 / 14 + Math.random() * 0.2);
      const g = rx.createLinearGradient(0, 0, 128, 0); g.addColorStop(0, "rgba(255,250,220,0.5)"); g.addColorStop(1, "rgba(255,250,220,0)");
      rx.fillStyle = g; rx.beginPath(); rx.moveTo(0, 0); rx.lineTo(128, -9 - Math.random() * 8); rx.lineTo(128, 9 + Math.random() * 8); rx.closePath(); rx.fill();
    }
    const rays = new THREE.Sprite(new THREE.SpriteMaterial({ map: canTex(rc), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, opacity: 0.55 }));
    rays.scale.setScalar(520); planet.add(rays); envRays = rays;
  }
  // big soft light and shade patches on the ground, so it doesn't look like one repeated tile
  const mc = document.createElement("canvas"); mc.width = mc.height = 512; const mx = mc.getContext("2d");
  for (let i = 0; i < 40; i++) {
    const px = Math.random() * 512, py = Math.random() * 512, r = 40 + Math.random() * 90, light = Math.random() < 0.5;
    for (const [ox, oy] of [[0, 0], [512, 0], [-512, 0], [0, 512], [0, -512]]) {
      const g = mx.createRadialGradient(px + ox, py + oy, 0, px + ox, py + oy, r);
      g.addColorStop(0, light ? "rgba(255,255,220,0.22)" : "rgba(0,40,30,0.18)"); g.addColorStop(1, "rgba(0,0,0,0)");
      mx.fillStyle = g; mx.fillRect(px + ox - r, py + oy - r, r * 2, r * 2);
    }
  }
  const macro = new THREE.Mesh(new THREE.PlaneGeometry(600, 520), new THREE.MeshBasicMaterial({ map: canTex(mc, [600 / 120, 520 / 120]), transparent: true, depthWrite: false }));
  macro.rotation.x = -Math.PI / 2; macro.position.set(0, 0.02, -240); envGroup.add(macro); envGround.userData.macro = macro;
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
    if (envGround.userData.macro) { const mm = envGround.userData.macro.material.map; mm.offset.y += speed * 0.6 * dt / 120; if (mm.offset.y > 1000) mm.offset.y -= 1000; }
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
 *  BACKGROUND MUSIC: an original J-pop rock "anime opening" style song
 *  (fast, bright, driving bass, rock drums, power-chord guitar, a soaring
 *  chorus). It is NOT any real song's melody. D major, ~152 BPM, 24 bars:
 *  intro 4, verse 8, pre-chorus 4, chorus 8, then it loops. It speeds up
 *  with your combo (setTier).
 * ===================================================================== */
const SONG = (() => {
  // chords: [bass root (MIDI), chord root (MIDI), minor?] one per bar
  const C = { D: [38, 62, 0], A: [45, 57, 0], Ac: [37, 57, 0], Bm: [35, 59, 1], G: [43, 55, 0], Em: [40, 52, 1], Fm: [42, 54, 1] };
  const bars = [
    ["G", "A", "Fm", "Bm"],                         // intro
    ["D", "Ac", "Bm", "G", "D", "A", "G", "A"],     // verse
    ["Em", "Fm", "G", "A"],                         // pre-chorus
    ["G", "A", "Fm", "Bm", "G", "A", "D", "D"],     // chorus
  ];
  // lead melody, one array per bar: [MIDI note or 0 = rest, length in eighths] (8 eighths per bar)
  const mel = [
    [[74, 2], [76, 1], [78, 2], [76, 1], [74, 1], [71, 1]], [[73, 2], [74, 1], [76, 3], [69, 2]], [[73, 1], [74, 1], [73, 1], [69, 1], [66, 2], [69, 2]], [[71, 6], [0, 2]],
    [[66, 1], [66, 1], [69, 2], [66, 1], [64, 1], [62, 2]], [[64, 2], [66, 1], [64, 1], [61, 2], [0, 2]], [[62, 1], [64, 1], [66, 2], [69, 2], [71, 2]], [[69, 4], [67, 2], [0, 2]],
    [[66, 1], [66, 1], [69, 2], [71, 1], [69, 1], [66, 2]], [[64, 1], [66, 1], [67, 2], [66, 2], [64, 2]], [[62, 2], [64, 1], [66, 1], [67, 2], [69, 2]], [[69, 6], [0, 2]],
    [[67, 2], [66, 1], [64, 1], [67, 2], [71, 2]], [[69, 2], [66, 1], [69, 1], [73, 4]], [[74, 2], [73, 1], [71, 1], [74, 2], [76, 2]], [[76, 2], [76, 1], [78, 1], [79, 2], [81, 2]],
    [[81, 2], [79, 1], [78, 1], [79, 2], [74, 2]], [[76, 3], [74, 1], [73, 2], [69, 2]], [[73, 1], [74, 1], [76, 2], [78, 2], [76, 1], [74, 1]], [[74, 4], [71, 2], [74, 2]],
    [[79, 2], [78, 1], [76, 1], [74, 2], [79, 2]], [[81, 3], [79, 1], [78, 2], [76, 2]], [[78, 2], [76, 1], [74, 1], [76, 2], [69, 2]], [[74, 6], [0, 2]],
  ];
  const chords = [].concat(...bars).map(n => C[n]);
  const section = [].concat(...bars.map((b, i) => b.map(() => ["intro", "verse", "pre", "chorus"][i])));
  const lead = []; // per eighth: [note, length] at note starts
  mel.forEach((bar, b) => { let pos = 0; for (const [n, l] of bar) { if (n) lead[b * 8 + pos] = [n, l]; pos += l; } if (pos !== 8) console.warn("song bar", b, "has", pos, "eighths"); });
  return { chords, section, lead, bars: chords.length };
})();
const Music = {
  on: false, timer: null, step: 0, nextT: 0, tempo: 1, gain: null, drive: null,
  start() {
    this.stop();
    if (!S.prefs.music || !S.prefs.sound) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      actx = actx || new AC(); if (actx.state === "suspended") actx.resume();
      if (!noiseBuf) { noiseBuf = actx.createBuffer(1, actx.sampleRate * 0.6, actx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
      this.gain = actx.createGain(); this.gain.gain.value = 0.05; this.gain.connect(actx.destination);
      // "guitar": a soft-clipping distortion followed by a gentle low-pass
      const ws = actx.createWaveShaper(), curve = new Float32Array(1024);
      for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; curve[i] = Math.tanh(x * 4); }
      ws.curve = curve; const lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2600;
      ws.connect(lp); lp.connect(this.gain); this.drive = ws;
      this.on = true; this.step = 0; this.tempo = 1; this.nextT = actx.currentTime + 0.15;
      this.timer = setInterval(() => this.tick(), 60);
    } catch (e) {}
  },
  stop() {
    this.on = false; if (this.timer) clearInterval(this.timer); this.timer = null;
    if (this.gain) { try { this.gain.gain.setTargetAtTime(0, actx.currentTime, 0.2); } catch (e) {} this.gain = null; }
  },
  setTier(tier) { this.tempo = [1, 1.04, 1.08, 1.12, 1.16][tier] || 1; },
  tick() {
    if (!this.on || !actx) return;
    const eighth = 60 / (152 * this.tempo) / 2;
    while (this.nextT < actx.currentTime + 0.25) { this.note(this.step, this.nextT, eighth); this.nextT += eighth; this.step++; }
  },
  note(step, t, len) {
    const bar = Math.floor(step / 8) % SONG.bars, pos = step % 8, i = bar * 8 + pos;
    const [bass, root, minor] = SONG.chords[bar], sec = SONG.section[bar];
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const play = (freq, dur, vol, type, dest, attack) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (attack || 0.005)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(dest || this.gain); o.start(t); o.stop(t + dur + 0.03);
    };
    const noise = (dur, vol, type, freq) => {
      const s = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
      s.buffer = noiseBuf; f.type = type; f.frequency.value = freq;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      s.connect(f); f.connect(g); g.connect(this.gain); s.start(t, Math.random() * 0.3); s.stop(t + dur + 0.02);
    };
    const loud = sec === "chorus" ? 1.15 : sec === "verse" ? 0.8 : 1;
    // bass: driving eighths (octave jumps in the chorus)
    play(hz(bass + (sec === "chorus" && pos % 2 ? 12 : 0)), len * 0.9, 0.8 * loud, "triangle");
    play(hz(bass), len * 0.7, 0.18 * loud, "square");
    // guitar: power chord (root, fifth, octave) through the distortion; palm-muted in the verse
    if (this.drive) {
      const g = sec === "verse" ? 0.05 : 0.08, d = sec === "verse" ? len * 0.6 : len * 0.95;
      for (const iv of [0, 7, 12]) play(hz(root - 12 + iv), d, g, "sawtooth", this.drive);
    }
    // pad on beat 1: the full triad, soft
    if (pos === 0 && sec !== "verse") for (const iv of [0, minor ? 3 : 4, 7]) play(hz(root + iv), len * 7, 0.07, "triangle", null, 0.05);
    // lead melody: square + octave-up triangle sparkle
    const L = SONG.lead[i];
    if (L) { play(hz(L[0]), len * L[1] * 0.95, 0.32 * loud, "square", null, 0.01); play(hz(L[0] + 12), len * L[1] * 0.8, 0.08, "triangle"); }
    // drums: kick on 1 and 3 (and the "and" of 4 in the chorus), snare on 2 and 4, hi-hat eighths, crash at each section start
    const kick = () => { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14); g.gain.setValueAtTime(1.4, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2); o.connect(g); g.connect(this.gain); o.start(t); o.stop(t + 0.22); };
    if (pos === 0 || pos === 4 || (sec === "chorus" && pos === 7) || (sec === "pre" && pos === 6)) kick();
    if (pos === 2 || pos === 6) { noise(0.16, 0.7, "bandpass", 1800); play(190, 0.08, 0.25, "triangle"); }
    if (sec === "pre" && bar % 4 === 3 && pos >= 4) noise(0.1, 0.5, "bandpass", 2200); // snare build-up before the chorus
    noise(0.04, pos % 2 ? 0.18 : 0.3, "highpass", 8000);
    if (pos === 0 && (bar === 0 || SONG.section[bar] !== SONG.section[(bar + SONG.bars - 1) % SONG.bars])) noise(0.9, 0.35, "highpass", 5000);
  },
};
