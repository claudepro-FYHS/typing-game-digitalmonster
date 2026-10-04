/* =====================================================================
 *  数码宝贝击字 Digi Monster Typer — monsters
 *
 *  Every monster is a chibi vector illustration in art/<id>.svg (made by
 *  tools/art/*.draw.js; run `node tools/art/build.js` after editing one).
 *  All pictures face RIGHT. In battle the partner stands lower-left facing
 *  right and enemies/bosses come from the upper-right, so their pictures
 *  are mirrored. Each SVG is drawn once into a canvas (per size, mirror and
 *  skin) and shown as a THREE.Sprite.
 *
 *  Exposed as window.MODELS:
 *    MECHS (partners), buildMech, newAnim, aimMech, fireMech, animateMech,
 *    ENEMY_TYPES, ENEMY_SIZES, buildEnemy, animateEnemy,
 *    BOSSES, buildBoss, animateBoss, hitFlash, buildShot, animateShot,
 *    portrait, portraitURL, artReady, setQuality, MS, MB, GLOW
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
 *  PARTNERS: the 15 heroes of the first three anime seasons (rookie, and
 *  their Mega form = evoArt) + the 13 Royal Knights (already Mega, they do
 *  not evolve; a 25/50/100 combo gives them an item instead: comboItem).
 *  In battle a partner evolves while its special move is active, or while
 *  you hold a 25+ combo (looks only).
 *  The first 15 ids are older names kept so saved purchases stay valid.
 *  special: { type: blast|freeze|slow|shield, n (targets), secs, charge (words in a row) }
 *  Prices must match MECH_PRICES in apps-script/Code.gs.
 * ===================================================================== */
const MECHS = [
  { id: "starter", name: "AGUMON", evo: "WARGREYMON", art: "agumon", evoArt: "wargreymon", evoH: 5.4, from: "Vaccine · Reptile", price: 0, hp: 5, startShield: true,
    plus: "Balanced. Starts every stage with a shield.", minus: "", colors: { main: 0xff9a2a, acc: 0xffd23a } },
  { id: "frostpup", name: "GABUMON", evo: "METALGARURUMON", art: "gabumon", evoArt: "metalgarurumon", from: "Data · Reptile", price: 300, hp: 4, coinMult: 1.2,
    plus: "Coins +20%.", minus: "Only 4 ♥", colors: { main: 0x7aa6e0, acc: 0x9ad8ff } },
  { id: "sprout", name: "PALMON", evo: "ROSEMON", art: "palmon", evoArt: "rosemon", from: "Data · Plant", price: 300, hp: 5, dropMult: 1.6, coinMult: 0.9,
    plus: "Items drop 1.6× more often.", minus: "Coins −10%", colors: { main: 0x6ac85a, acc: 0xff6a9a } },
  { id: "zapbeetle", name: "TENTOMON", evo: "HERCULESKABUTERIMON", art: "tentomon", evoArt: "herculeskabuterimon", from: "Vaccine · Insect", price: 400, hp: 5, special: { type: "blast", n: 1, charge: 3 },
    plus: "Super Shocker: every 3 words in a row, SPACE destroys the closest target.", minus: "", colors: { main: 0xd8343a, acc: 0xffd23a } },
  { id: "skychick", name: "BIYOMON", evo: "PHOENIXMON", art: "biyomon", evoArt: "phoenixmon", from: "Vaccine · Bird", price: 400, hp: 4, missileSlow: 1.33, coinMult: 1.1,
    plus: "Boss attacks 25% slower. Coins +10%.", minus: "Only 4 ♥", colors: { main: 0xff8ab4, acc: 0xffb03a } },
  { id: "tideseal", name: "GOMAMON", evo: "VIKEMON", art: "gomamon", evoArt: "vikemon", from: "Vaccine · Sea animal", price: 600, hp: 5, special: { type: "freeze", secs: 4, charge: 5 },
    plus: "Marching Fishes: every 5 words in a row, SPACE freezes enemies 4 s.", minus: "", colors: { main: 0xf4f6fb, acc: 0x7ad0ff } },
  { id: "rockbun", name: "ARMADILLOMON", evo: "SHAKKOUMON", art: "armadillomon", evoArt: "shakkoumon", from: "Free · Mammal", price: 600, hp: 6, coinMult: 0.8, special: { type: "blast", n: 2, charge: 6 },
    plus: "Hard shell: 6 ♥. Diamond Shot: 6 in a row, SPACE hits 2 targets.", minus: "Coins −20%", colors: { main: 0xe8b04a, acc: 0xffd23a } },
  { id: "shadowkit", name: "GATOMON", evo: "OPHANIMON", art: "gatomon", evoArt: "ophanimon", from: "Vaccine · Holy beast", price: 800, hp: 4, special: { type: "slow", secs: 6, charge: 5 },
    plus: "Cat's Eye: 5 in a row, SPACE slows enemies to half speed for 6 s.", minus: "Only 4 ♥", colors: { main: 0xf4f6fb, acc: 0x4ac87a } },
  { id: "flarefox", name: "TERRIERMON", evo: "MEGAGARGOMON", art: "terriermon", evoArt: "megagargomon", from: "Vaccine · Beast", price: 900, hp: 5, special: { type: "blast", n: 5, charge: 8 },
    plus: "Bunny Blast: 8 words in a row, SPACE hits 5 targets.", minus: "", colors: { main: 0x5ab86a, acc: 0x9ad8ff } },
  { id: "halobun", name: "PATAMON", evo: "SERAPHIMON", art: "patamon", evoArt: "seraphimon", from: "Data · Mammal", price: 900, hp: 5, special: { type: "shield", charge: 5 },
    plus: "Holy light: 5 words in a row, SPACE gives you a shield.", minus: "", colors: { main: 0xffb03a, acc: 0xfff0a0 } },
  { id: "puckimp", name: "VEEMON", evo: "IMPERIALDRAMON", art: "veemon", evoArt: "imperialdramon", from: "Free · Dragon", price: 1000, hp: 5, coinMult: 1.1, special: { type: "blast", n: 1, charge: 3 },
    plus: "Coins +10%. Vee Headbutt: 3 in a row, SPACE destroys the closest target.", minus: "", colors: { main: 0x3a6ad8, acc: 0xffd23a } },
  { id: "unihorn", name: "RENAMON", evo: "SAKUYAMON", art: "renamon", evoArt: "sakuyamon", from: "Data · Beast", price: 1000, hp: 5, special: { type: "slow", secs: 8, charge: 6 },
    plus: "Fox spirit: 6 in a row, SPACE slows enemies for 8 s.", minus: "", colors: { main: 0xffd25a, acc: 0x8a5ad8 } },
  { id: "mechapup", name: "GUILMON", evo: "GALLANTMON", art: "guilmon", evoArt: "gallantmon", from: "Virus · Reptile", price: 1100, hp: 5, special: { type: "blast", n: 4, charge: 7 },
    plus: "Pyro Sphere: 7 in a row, SPACE hits 4 targets.", minus: "", colors: { main: 0xe8343a, acc: 0xff9a2a } },
  { id: "sparksprite", name: "WORMMON", evo: "GRANDISKUWAGAMON", art: "wormmon", evoArt: "grandiskuwagamon", from: "Free · Insect", price: 1100, hp: 5, dropMult: 1.2, special: { type: "freeze", secs: 6, charge: 6 },
    plus: "Sticky Net: 6 in a row, SPACE freezes enemies 6 s. Items ×1.2.", minus: "", colors: { main: 0x8ad85a, acc: 0x7ad0ff } },
  { id: "drakeling", name: "HAWKMON", evo: "VALDURMON", art: "hawkmon", evoArt: "valdurmon", from: "Data · Bird", price: 1200, hp: 4, special: { type: "blast", n: 3, charge: 5 },
    plus: "Feather Strike: 5 in a row, SPACE hits the 3 closest targets.", minus: "Only 4 ♥", colors: { main: 0xe8384a, acc: 0xfff0a0 } },
  // ---- Royal Knights ----
  { id: "omnimon", name: "OMNIMON", knight: true, comboItem: "bomb", art: "omnimon", from: "Royal Knight · Vaccine", price: 3000, hp: 5, special: { type: "blast", n: 4, charge: 6 },
    plus: "Transcendent Sword: 6 in a row, SPACE hits 4 targets.", minus: "", colors: { main: 0xf4f6fb, acc: 0xffd23a } },
  { id: "alphamon", name: "ALPHAMON", knight: true, comboItem: "bomb", art: "alphamon", from: "Royal Knight · Vaccine", price: 2800, hp: 5, special: { type: "blast", n: 3, charge: 5 },
    plus: "Holy Sword: 5 in a row, SPACE hits 3 targets.", minus: "", colors: { main: 0x3a3448, acc: 0x5af0a0 } },
  { id: "gallantmoncm", name: "GALLANTMON CM", knight: true, comboItem: "shield", art: "gallantmoncm", from: "Royal Knight · Crimson Mode", price: 2500, hp: 5, special: { type: "shield", charge: 5 },
    plus: "Crimson wings: 5 in a row, SPACE gives you a shield.", minus: "", colors: { main: 0xd8343a, acc: 0xffd23a } },
  { id: "magnamon", name: "MAGNAMON", knight: true, comboItem: "shield", art: "magnamon", from: "Royal Knight · Free", price: 2500, hp: 6, special: { type: "shield", charge: 6 },
    plus: "Golden armor: 6 ♥. Magna Defense: 6 in a row, SPACE gives you a shield.", minus: "", colors: { main: 0xf2c23a, acc: 0xfff0a0 } },
  { id: "ulforceveedramon", name: "ULFORCEVEEDRAMON", knight: true, comboItem: "freeze", art: "ulforceveedramon", from: "Royal Knight · Vaccine", price: 2500, hp: 4, special: { type: "slow", secs: 8, charge: 5 },
    plus: "Ultimate speed: 5 in a row, SPACE slows enemies for 8 s.", minus: "Only 4 ♥", colors: { main: 0x3a6ad8, acc: 0x9ad8ff } },
  { id: "examon", name: "EXAMON", knight: true, comboItem: "bomb", art: "examon", from: "Royal Knight · Data", price: 2500, hp: 6, special: { type: "blast", n: 5, charge: 8 },
    plus: "Dragon lance: 6 ♥. 8 in a row, SPACE hits 5 targets.", minus: "", colors: { main: 0xc8303a, acc: 0xff8a6a } },
  { id: "craniamon", name: "CRANIAMON", knight: true, comboItem: "shield", art: "craniamon", from: "Royal Knight · Vaccine", price: 2200, hp: 6, special: { type: "shield", charge: 6 },
    plus: "Shield Avalon: 6 ♥. 6 in a row, SPACE gives you a shield.", minus: "", colors: { main: 0x4a3a78, acc: 0xffd23a } },
  { id: "dynasmon", name: "DYNASMON", knight: true, comboItem: "bomb", art: "dynasmon", from: "Royal Knight · Data", price: 2000, hp: 5, special: { type: "blast", n: 2, charge: 4 },
    plus: "Breath of Wyvern: 4 in a row, SPACE hits 2 targets.", minus: "", colors: { main: 0x9a7ad8, acc: 0xffd23a } },
  { id: "crusadermon", name: "CRUSADERMON", knight: true, comboItem: "freeze", art: "crusadermon", from: "Royal Knight · Virus", price: 2000, hp: 4, special: { type: "freeze", secs: 6, charge: 6 },
    plus: "Spiral Masquerade: 6 in a row, SPACE freezes enemies 6 s.", minus: "Only 4 ♥", colors: { main: 0xff8ab4, acc: 0xffd0e4 } },
  { id: "sleipmon", name: "SLEIPMON", knight: true, comboItem: "freeze", art: "sleipmon", from: "Royal Knight · Vaccine", price: 2000, hp: 5, special: { type: "freeze", secs: 6, charge: 6 },
    plus: "Bifrost: 6 in a row, SPACE freezes enemies 6 s.", minus: "", colors: { main: 0xdce4f0, acc: 0x9ad8ff } },
  { id: "jesmon", name: "JESMON", knight: true, comboItem: "bomb", art: "jesmon", from: "Royal Knight · Vaccine", price: 2000, hp: 5, special: { type: "blast", n: 3, charge: 5 },
    plus: "Shining blades: 5 in a row, SPACE hits 3 targets.", minus: "", colors: { main: 0xf4f6fb, acc: 0xe8384a } },
  { id: "leopardmon", name: "LEOPARDMON", knight: true, comboItem: "freeze", art: "leopardmon", from: "Royal Knight · Data", price: 1800, hp: 5, special: { type: "slow", secs: 8, charge: 6 },
    plus: "Lightning speed: 6 in a row, SPACE slows enemies for 8 s.", minus: "", colors: { main: 0xe8c060, acc: 0xfff0a0 } },
  { id: "gankoomon", name: "GANKOOMON", knight: true, comboItem: "bomb", art: "gankoomon", from: "Royal Knight · Data", price: 1800, hp: 6, special: { type: "blast", n: 1, charge: 2 },
    plus: "Tough monk: 6 ♥. 2 words in a row, SPACE destroys the closest target.", minus: "", colors: { main: 0x3a3448, acc: 0xe8384a } },
];

/* How each partner moves and attacks in battle: [move, attack, Mega move, Mega attack].
   move: run | fly. An attack is one move or a list (one is picked at random each time).
   type: shot (a ball flies to the target), volley (several small shots), bolt (lightning),
   beam (an instant ray), dash (flies to the target, strikes and flies back). big = bigger shot. */
const A = (type, color, name, big) => ({ type, color, name, big: !!big });
const MOVES = {
  starter: ["run", A("shot", 0xff7a2a, "Pepper Breath"), "fly", [A("dash", 0xffb03a, "Great Tornado"), A("shot", 0xffcc33, "Terra Force", true)]],
  frostpup: ["run", A("shot", 0x5ab8ff, "Blue Blaster"), "run", [A("volley", 0x9ad8ff, "Giga Destroyer"), A("beam", 0xbff0ff, "Cocytus Breath")]],
  sprout: ["run", A("dash", 0x7ad858, "Poison Ivy"), "fly", A("dash", 0xff6a9a, "Thorn Whip")],
  zapbeetle: ["fly", A("bolt", 0xffe066, "Super Shocker"), "fly", A("bolt", 0x9ad8ff, "Giga Blaster")],
  skychick: ["fly", A("shot", 0x9aff5a, "Spiral Twister"), "fly", A("shot", 0xffb03a, "Starlight Explosion", true)],
  tideseal: ["run", A("volley", 0x5ad0ff, "Marching Fishes"), "run", [A("beam", 0xbff0ff, "Arctic Blizzard"), A("dash", 0xc8d0dc, "Mjölnir")]],
  rockbun: ["run", A("dash", 0xffd23a, "Diamond Shot"), "fly", A("volley", 0xffd23a, "Kachina Bombs")],
  shadowkit: ["run", A("dash", 0xffe066, "Lightning Paw"), "fly", A("volley", 0xb0ffd0, "Sefirot Crystal")],
  flarefox: ["run", A("shot", 0x7dff8a, "Bunny Blast"), "run", A("volley", 0xff7a3a, "Mega Barrage")],
  halobun: ["fly", A("shot", 0xe8f8ff, "Boom Bubble"), "fly", A("volley", 0xfff0a0, "Seven Heavens")],
  puckimp: ["run", A("dash", 0x5a9aff, "Vee Headbutt"), "fly", A("beam", 0xff5ad8, "Positron Laser")],
  unihorn: ["run", A("volley", 0xaef0ff, "Diamond Storm"), "fly", A("volley", 0xd8a0ff, "Amethyst Wind")],
  mechapup: ["run", A("shot", 0xff4a2a, "Pyro Sphere"), "run", [A("dash", 0xfff2a8, "Lightning Joust"), A("beam", 0xff8a8a, "Final Elysion")]],
  sparksprite: ["run", A("shot", 0xe8f4e0, "Sticky Net"), "fly", A("dash", 0xc8d0dc, "Dimension Scissor")],
  drakeling: ["fly", A("volley", 0xffe0a0, "Feather Strike"), "fly", A("volley", 0xff6a6a, "Wings of Glory")],
  omnimon: ["fly", [A("shot", 0x7ad0ff, "Garuru Cannon", true), A("dash", 0xffe066, "Transcendent Sword")]],
  alphamon: ["fly", [A("dash", 0x5af0a0, "Holy Sword"), A("beam", 0x5af0a0, "Digitalize of Soul")]],
  gallantmoncm: ["fly", [A("dash", 0xffe080, "Invincible Sword"), A("beam", 0xff6a5a, "Quo Vadis")]],
  magnamon: ["fly", A("beam", 0xffd23a, "Extreme Jihad")],
  ulforceveedramon: ["fly", [A("dash", 0x9ad8ff, "Ultimate V-Wing Blade"), A("beam", 0x5a9aff, "Ray of Victory")]],
  examon: ["fly", A("beam", 0xff6a3a, "Pendragon's Glory")],
  craniamon: ["run", A("dash", 0xb8a8ff, "Ende Speer")],
  dynasmon: ["fly", A("shot", 0xc8a8ff, "Breath of Wyvern", true)],
  crusadermon: ["fly", A("volley", 0xff8ab4, "Spiral Masquerade")],
  sleipmon: ["run", A("volley", 0x9ad8ff, "Bifrost")],
  jesmon: ["run", A("dash", 0xff5a5a, "Schwert Geist")],
  leopardmon: ["run", A("dash", 0xe8c060, "Leopard Lightning")],
  gankoomon: ["run", [A("dash", 0xffa040, "Hinomaru Punch"), A("shot", 0xffffff, "Hinukamuy")]],
};
for (const m of MECHS) { const v = MOVES[m.id]; if (v) { m.move = v[0]; m.atk = v[1]; m.evoMove = v[2] || v[0]; m.evoAtk = v[3] || v[1]; } }

/* ENEMIES (anime seasons 1–3). size decides the word length: short / mid / long. h = height in world units */
const ENEMY_TYPES = {
  numemon: { name: "Numemon", size: "short", h: 3.0 },
  demidevimon: { name: "DemiDevimon", size: "short", h: 2.8, fly: true },
  gazimon: { name: "Gazimon", size: "short", h: 3.2 },
  bakemon: { name: "Bakemon", size: "short", h: 3.2, fly: true },
  goblimon: { name: "Goblimon", size: "mid", h: 3.6 },
  meramon: { name: "Meramon", size: "mid", h: 3.8 },
  snimon: { name: "Snimon", size: "mid", h: 3.8, fly: true },
  kuwagamon: { name: "Kuwagamon", size: "mid", h: 3.8, fly: true },
  ogremon: { name: "Ogremon", size: "long", h: 4.4 },
  monochromon: { name: "Monochromon", size: "long", h: 4.2 },
  darktyrannomon: { name: "DarkTyrannomon", size: "long", h: 4.6 },
  golemon: { name: "Golemon", size: "long", h: 4.6 },
  seadramon: { name: "Seadramon", size: "long", h: 4.6 },
};
const ENEMY_SIZES = { short: [], mid: [], long: [] };
for (const [id, e] of Object.entries(ENEMY_TYPES)) { e.id = id; ENEMY_SIZES[e.size].push(id); }

/* BOSSES: 15 villains (unlocked by tamer level, in this order) + 17 festival
   bosses (event: field, only during that festival). glow = aura colour. */
const BOSSES = [
  { id: "devimon", name: "DEVIMON", kind: "Champion", glow: 0xe8384a },
  { id: "metaletemon", name: "METALETEMON", kind: "Mega", glow: 0xc8d0dc },
  { id: "myotismon", name: "MYOTISMON", kind: "Ultimate", glow: 0xd8343a },
  { id: "kimeramon", name: "KIMERAMON", kind: "Ultimate", glow: 0xff9a3a },
  { id: "daemon", name: "DAEMON", kind: "Mega", glow: 0xa8283a },
  { id: "metalseadramon", name: "METALSEADRAMON", kind: "Mega", glow: 0x7ad0ff },
  { id: "puppetmon", name: "PUPPETMON", kind: "Mega", glow: 0x5ab858 },
  { id: "machinedramon", name: "MACHINEDRAMON", kind: "Mega", glow: 0xe8384a },
  { id: "piedmon", name: "PIEDMON", kind: "Mega", glow: 0xff5ef0 },
  { id: "venommyotismon", name: "VENOMMYOTISMON", kind: "Mega", glow: 0xa85ad8 },
  { id: "blackwargreymon", name: "BLACKWARGREYMON", kind: "Mega", glow: 0xe8384a },
  { id: "beelzemon", name: "BEELZEMON", kind: "Mega", glow: 0x8a5ad8 },
  { id: "megidramon", name: "MEGIDRAMON", kind: "Mega", glow: 0xff3a3a },
  { id: "malomyotismon", name: "MALOMYOTISMON", kind: "Mega", glow: 0x6a4ab8 },
  { id: "apocalymon", name: "APOCALYMON", kind: "Mega", glow: 0xff7a3a },
  // ---- festival bosses ----
  { id: "azulongmon", name: "AZULONGMON", kind: "Festival Boss", event: "cny", glow: 0x5ad0ff },
  { id: "zhuqiaomon", name: "ZHUQIAOMON", kind: "Festival Boss", event: "lantern", orbit: "lantern", glow: 0xff7a3a },
  { id: "antylamon", name: "ANTYLAMON", kind: "Festival Boss", event: "midautumn", orbit: "lantern", glow: 0xfff0a0 },
  { id: "megaseadramon", name: "MEGASEADRAMON", kind: "Festival Boss", event: "dragonboat", glow: 0x4a7ad8 },
  { id: "sinduramon", name: "SINDURAMON", kind: "Festival Boss", event: "qixi", orbit: "star", glow: 0xffd23a },
  { id: "ebonwumon", name: "EBONWUMON", kind: "Festival Boss", event: "doubleninth", glow: 0x7ad858 },
  { id: "icedevimon", name: "ICEDEVIMON", kind: "Festival Boss", event: "solstice", orbit: "snow", glow: 0x9ad8ff },
  { id: "diaboromon", name: "DIABOROMON", kind: "Festival Boss", event: "newyear", glow: 0xff3a5a },
  { id: "ladydevimon", name: "LADYDEVIMON", kind: "Festival Boss", event: "valentine", orbit: "heart", glow: 0xff5c8a },
  { id: "etemon", name: "ETEMON", kind: "Festival Boss", event: "aprilfools", glow: 0xffd23a },
  { id: "digitamamon", name: "DIGITAMAMON", kind: "Festival Boss", event: "easter", glow: 0xfff09a },
  { id: "motherdreaper", name: "MOTHER D-REAPER", kind: "Festival Boss", event: "mothersday", glow: 0xff3a5a },
  { id: "leomon", name: "LEOMON", kind: "Festival Boss", event: "fathersday", glow: 0xffc85a },
  { id: "pumpkinmon", name: "PUMPKINMON", kind: "Festival Boss", event: "halloween", orbit: "bat", glow: 0xff9a3a },
  { id: "cherrymon", name: "CHERRYMON", kind: "Festival Boss", event: "christmas", orbit: "snow", glow: 0xe8384a },
  { id: "parrotmon", name: "PARROTMON", kind: "Festival Boss", event: "merdeka", glow: 0xffd23a },
  { id: "baihumon", name: "BAIHUMON", kind: "Festival Boss", event: "anniversary", glow: 0x7ac8f0 },
];

/* =====================================================================
 *  SVG → CANVAS (cached). raster(id, { h, flip, skin, sil }) returns a canvas
 *  at once; it is blank until the SVG has loaded (cv.ver goes up then).
 * ===================================================================== */
const ART_DIR = "art/";
const svgs = {};
let pendingArt = 0, artWaiters = [];
function svgImage(id) {
  if (svgs[id]) return svgs[id];
  const e = svgs[id] = { img: new Image(), ok: false, waits: [] };
  pendingArt++;
  const done = () => {
    pendingArt--;
    const w = e.waits; e.waits = []; w.forEach(f => { try { f(); } catch (err) { console.warn(err); } });
    if (!pendingArt) { const a = artWaiters; artWaiters = []; a.forEach(f => f()); }
  };
  e.img.onload = () => { e.ok = true; done(); };
  e.img.onerror = () => { e.bad = true; done(); };
  e.img.src = ART_DIR + id + ".svg";
  return e;
}
/* resolves when every picture asked for so far has loaded (or failed) */
function artReady() { return new Promise(r => pendingArt ? artWaiters.push(r) : r()); }

const SK = (c) => [(c >> 16) & 255, (c >> 8) & 255, c & 255];
function recolor(x, w, h, skin) {
  // skins: a gradient map (dark → acc, mid → main, light → belly) mixed over the art; the outline stays
  const c = skin.colors, stops = [SK(c.acc || c.sub), SK(c.sub || c.main), SK(c.main), SK(c.belly || 0xffffff)];
  const d = x.getImageData(0, 0, w, h), p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    if (!p[i + 3]) continue;
    const r = p[i], g = p[i + 1], b = p[i + 2], L = (0.3 * r + 0.55 * g + 0.15 * b) / 255;
    if (L < 0.22 && r > b) continue; // brown outline
    const t = clamp((L - 0.2) / 0.8, 0, 1) * 3, k = Math.min(2, Math.floor(t)), f = t - k, A = stops[k], B = stops[k + 1];
    const sat = (Math.max(r, g, b) - Math.min(r, g, b)) / 255, m = 0.55 + 0.35 * Math.min(1, sat * 2);
    for (let j = 0; j < 3; j++) p[i + j] = lerp(p[i + j], lerp(A[j], B[j], f), m);
  }
  x.putImageData(d, 0, 0);
}
const rasters = {};
function raster(id, o) {
  o = o || {};
  const h = o.h || 256, skin = o.skin && o.skin.colors ? o.skin : null;
  const key = [id, h, o.flip ? 1 : 0, skin ? skin.id : "", o.sil ? 1 : 0].join("|");
  if (rasters[key]) return rasters[key];
  const cv = document.createElement("canvas"); cv.width = cv.height = 4; cv.ver = 0; cv.artId = id;
  rasters[key] = cv;
  const e = svgImage(id);
  const draw = () => {
    if (!e.ok) return;
    const iw = e.img.naturalWidth || 200, ih = e.img.naturalHeight || 200;
    cv.width = Math.max(4, Math.round(h * iw / ih)); cv.height = h;
    const x = cv.getContext("2d");
    if (o.flip) { x.translate(cv.width, 0); x.scale(-1, 1); }
    x.drawImage(e.img, 0, 0, cv.width, cv.height);
    x.setTransform(1, 0, 0, 1, 0, 0);
    try { if (skin) recolor(x, cv.width, cv.height, skin); } catch (err) { /* tainted canvas: keep the original colours */ }
    if (o.sil) { x.globalCompositeOperation = "source-in"; x.fillStyle = "#fff"; x.fillRect(0, 0, cv.width, cv.height); }
    cv.ver++;
    // the canvas changed size: drop the GPU copy (WebGL2 texture storage has a fixed size) and upload again
    const t = texCache.get(cv); if (t) { t.dispose(); t.needsUpdate = true; }
  };
  if (e.ok) draw(); else e.waits.push(draw);
  return cv;
}
const texCache = new WeakMap();
function tex(cv) {
  if (texCache.has(cv)) return texCache.get(cv);
  const t = new T.CanvasTexture(cv); t.minFilter = T.LinearFilter; t.magFilter = T.LinearFilter; t.generateMipmaps = false;
  texCache.set(cv, t); return t;
}

/* soft round textures: glow and ground shadow */
let glowTex = null, shadowTex = null;
function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,0.9)"); g.addColorStop(0.35, "rgba(255,255,255,0.35)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return (glowTex = new T.CanvasTexture(c));
}
function shadowTexture() {
  if (shadowTex) return shadowTex;
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(40,20,50,0.5)"); g.addColorStop(0.6, "rgba(40,20,50,0.32)"); g.addColorStop(1, "rgba(40,20,50,0)");
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return (shadowTex = new T.CanvasTexture(c));
}
const shadowGeo = new T.PlaneGeometry(1, 1);

/* A sprite rig: root (stands on y = 0) > body (bob / hop) > sprite + flash (white copy) + aura.
   worldH = height in world units; the width follows the picture. */
function spriteRig(cv, sil, worldH, opts) {
  opts = opts || {};
  const root = new T.Group(), body = new T.Group(); root.add(body);
  const mat = new T.SpriteMaterial({ map: tex(cv), transparent: true, alphaTest: 0.04 });
  const spr = new T.Sprite(mat); spr.center.set(0.5, opts.centerY == null ? 0 : opts.centerY); body.add(spr);
  const fmat = new T.SpriteMaterial({ map: tex(sil), transparent: true, opacity: 0, depthWrite: false, blending: ADD });
  const flash = new T.Sprite(fmat); flash.center.copy(spr.center); flash.renderOrder = 2; body.add(flash);
  const rig = { root, body, spr, flash, cv, sil, worldH, ver: -1 };
  if (opts.shadow !== false) {
    const sh = new T.Mesh(shadowGeo, new T.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.03; sh.renderOrder = -1;
    root.add(sh); rig.shadow = sh;
  }
  root.userData.rig = rig;
  fitRig(rig);
  return rig;
}
function setFrame(rig, cv, sil, worldH) {
  if (rig.cv === cv && (!worldH || worldH === rig.worldH)) return;
  rig.cv = cv; rig.sil = sil; if (worldH) rig.worldH = worldH;
  rig.spr.material.map = tex(cv); rig.flash.material.map = tex(sil);
  rig.ver = -1; fitRig(rig);
}
function fitRig(rig) { // size the sprite from the picture (again once it has loaded)
  rig.ver = rig.cv.ver;
  const h = rig.worldH, w = rig.cv.ver ? h * rig.cv.width / rig.cv.height : 0.001;
  rig.bw = w; rig.bh = h;
  rig.spr.scale.set(w, h, 1); rig.flash.scale.copy(rig.spr.scale);
  if (rig.muzzle) rig.muzzle.position.set(w * 0.3, h * 0.55, 0.5);
  if (rig.aura) { rig.aura.position.set(0, h * 0.5, -0.05); rig.aura.userData.s = Math.max(w, h) * 1.5; }
  if (rig.shadow) { rig.shadowW = Math.max(1, Math.min(w, h * 1.3) * 0.7); rig.shadow.scale.set(rig.shadowW, rig.shadowW * 0.38, 1); }
}
function checkFit(rig) { if (rig.ver !== rig.cv.ver) fitRig(rig); }
/* keep a blob shadow on the ground (world y = 0) under a flying sprite */
const _wp = new T.Vector3();
function groundShadow(rig, mesh) {
  if (!rig.shadow) return;
  mesh.getWorldPosition(_wp);
  const s = mesh.scale.y || 1, h = Math.max(0, _wp.y);
  rig.shadow.position.y = (0.03 - _wp.y) / s;
  const k = 1 / (1 + h * 0.08);
  rig.shadow.scale.set(rig.shadowW * k, rig.shadowW * 0.38 * k, 1);
  rig.shadow.material.opacity = clamp(1.1 - h * 0.07, 0.25, 1);
}

/* small vector props: boss attack orb + things that orbit festival bosses */
const PROP_DRAW = {
  shot(x) {
    x.fillStyle = "#ff3a6a";
    x.beginPath(); for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, r = k % 2 ? 18 : 30; x.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } x.closePath(); x.fill(); x.stroke();
    const g = x.createRadialGradient(28, 28, 2, 32, 32, 16); g.addColorStop(0, "#fff"); g.addColorStop(1, "#ff7aa0");
    x.fillStyle = g; x.beginPath(); x.arc(32, 32, 14, 0, 7); x.fill(); x.stroke();
  },
  lantern(x) {
    x.fillStyle = "#ff4a3a"; x.beginPath(); x.ellipse(32, 34, 22, 20, 0, 0, 7); x.fill(); x.stroke();
    x.fillStyle = "#ffc23a"; x.fillRect(20, 10, 24, 6); x.strokeRect(20, 10, 24, 6); x.fillRect(20, 52, 24, 6); x.strokeRect(20, 52, 24, 6);
  },
  star(x) {
    x.fillStyle = "#fff4a0"; x.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 12 : 28; x.lineTo(32 + Math.cos(a) * r, 34 + Math.sin(a) * r); } x.closePath(); x.fill(); x.stroke();
  },
  heart(x) {
    x.fillStyle = "#ff6a9a"; x.beginPath(); x.moveTo(32, 54); x.bezierCurveTo(4, 34, 10, 8, 32, 22); x.bezierCurveTo(54, 8, 60, 34, 32, 54); x.fill(); x.stroke();
  },
  bat(x) {
    x.fillStyle = "#3a2a5a"; x.beginPath(); x.moveTo(32, 26); x.lineTo(4, 16); x.lineTo(12, 30); x.lineTo(4, 44); x.lineTo(22, 38); x.lineTo(32, 48); x.lineTo(42, 38); x.lineTo(60, 44); x.lineTo(52, 30); x.lineTo(60, 16); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = "#ffd23c"; x.fillRect(27, 32, 3, 3); x.fillRect(34, 32, 3, 3);
  },
  snow(x) {
    x.strokeStyle = "#ffffff"; x.lineWidth = 5;
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3; x.beginPath(); x.moveTo(32 - Math.cos(a) * 26, 32 - Math.sin(a) * 26); x.lineTo(32 + Math.cos(a) * 26, 32 + Math.sin(a) * 26); x.stroke(); }
  },
};
const propCache = {};
function propCanvas(id) {
  if (propCache[id]) return propCache[id];
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const x = c.getContext("2d"); x.strokeStyle = "#4a2410"; x.lineWidth = 3; x.lineJoin = "round";
  PROP_DRAW[id](x); c.ver = 1;
  return (propCache[id] = c);
}

/* =====================================================================
 *  PARTNER: build + animate (same API as the old mech code)
 *  The partner faces right; attacks are a lunge to the right.
 * ===================================================================== */
const PARTNER_H = 3.4, EVO_H = 4.3, KNIGHT_H = 4.1;
let RES = 1; // picture resolution: 2 on GRAPHICS: HIGH (sharper), 1 on LOW (setQuality)
function setQuality(high) { RES = high ? 2 : 1; }
function partnerFrames(def, skin) {
  const sk = skin && skin.colors ? skin : null;
  const r = 384 * RES, a = raster(def.art, { h: r, skin: sk }), as = raster(def.art, { h: r, sil: true });
  const evoId = def.evoArt || def.art;
  const e = raster(evoId, { h: r, skin: sk }), es = raster(evoId, { h: r, sil: true });
  const h = def.knight ? KNIGHT_H : PARTNER_H;
  return { a, as, e, es, h, eh: def.evoArt ? def.evoH || EVO_H : h };
}
function buildMech(def, skin) {
  const fr = partnerFrames(def, skin);
  const rig = spriteRig(fr.a, fr.as, fr.h);
  rig.frames = fr; rig.def = def;
  const ex = skin && skin.mat;
  if (ex && ex.opacity != null) { rig.spr.material.opacity = ex.opacity; rig.spr.material.alphaTest = 0.01; rig.spr.material.depthWrite = false; }
  const auraColor = (skin && skin.glow) || def.colors.acc || def.colors.main;
  const am = new T.SpriteMaterial({ map: glowTexture(), color: auraColor, transparent: true, opacity: 0, depthWrite: false, blending: ADD });
  rig.aura = new T.Sprite(am); rig.aura.renderOrder = -1; rig.body.add(rig.aura);
  rig.skinGlow = !!(skin && skin.accentGlow);
  rig.muzzle = new T.Object3D(); rig.body.add(rig.muzzle);
  fitRig(rig);
  rig.root.userData.def = def;
  return rig.root;
}
function newAnim() { return { t: Math.random() * 10, tilt: 0, aiming: 0, wantAim: 0, recoil: 0, hit: 0, flash: 0, victory: 0, special: 0, evo: false, evoFlash: 0 }; }

/* Aim at a world-space point (or null to relax): a small lean toward it. */
const _ap = new T.Vector3();
function aimMech(mesh, anim, worldPoint) {
  if (!worldPoint) { anim.wantAim = 0; return; }
  _ap.copy(worldPoint); mesh.worldToLocal(_ap);
  anim.tilt = clamp(Math.atan2(_ap.y - 2.4, Math.hypot(_ap.x, _ap.z)), -0.4, 0.6);
  anim.wantAim = 1;
}
function fireMech(anim, big) { anim.recoil = Math.min(1.2, anim.recoil + (big ? 1 : 0.45)); anim.flash = big ? 0.14 : 0.05; anim.wantAim = 1; }

function animateMech(mesh, anim, dt) {
  const r = mesh.userData.rig; if (!r) return;
  anim.t += dt;
  const t = anim.t;
  anim.aiming += (anim.wantAim - anim.aiming) * Math.min(1, dt * 6);
  anim.recoil = Math.max(0, anim.recoil - dt * 3.2);
  anim.hit = Math.max(0, anim.hit - dt * 2.2);
  anim.flash = Math.max(0, anim.flash - dt);
  anim.victory = Math.max(0, anim.victory - dt * 0.6);
  anim.special = Math.max(0, anim.special - dt);
  anim.evoFlash = Math.max(0, anim.evoFlash - dt);
  // DIGIVOLVE: evolved while the special is active (or while the game says so: big combo). Knights stay as they are.
  const evo = !r.def.knight && (anim.special > 0 || !!anim.evo);
  if (evo !== !!r.isEvo) { r.isEvo = evo; anim.evoFlash = 0.7; }
  const fr = r.frames;
  setFrame(r, evo ? fr.e : fr.a, evo ? fr.es : fr.as, evo ? fr.eh : fr.h);
  checkFit(r);
  const hop = anim.victory > 0 ? Math.abs(Math.sin(t * 8)) * 0.8 * Math.min(1, anim.victory) : 0;
  const breathe = Math.sin(t * 2.6);
  const lunge = anim.dashing ? 0 : Math.sin(Math.min(1, anim.recoil) * Math.PI / 2);
  // in battle (anim.moving) runners bounce along and flyers hover; a dash is a straight flight
  const mv = anim.moving ? (evo ? r.def.evoMove : r.def.move) || "run" : "";
  let lift = 0, bounce = 0, lean = 0, land = 0;
  if (anim.dashing) { lift = 0.4; lean = -0.22; }
  else if (mv === "fly") { lift = 0.9 + Math.sin(t * 2.4) * 0.22; lean = -0.05 + Math.sin(t * 2.4 + 1) * 0.03; }
  else if (mv === "run") { const c = Math.abs(Math.sin(t * 9)); bounce = c * 0.3; land = (1 - c) * 0.07; lean = -0.07 + Math.sin(t * 18) * 0.025; }
  r.body.position.set(Math.sin(t * 55) * 0.12 * anim.hit, breathe * 0.04 + hop + anim.evoFlash * 0.3 + lift + bounce, 0);
  const sq = 1 + breathe * 0.02 - lunge * 0.06 - land, pop = 1 + anim.evoFlash * 0.25;
  r.spr.scale.set(r.bw / sq * pop, r.bh * sq * pop, 1); r.flash.scale.copy(r.spr.scale);
  r.spr.center.x = r.flash.center.x = 0.5 - lunge * 0.22; // lunge to the right
  r.spr.material.rotation = r.flash.material.rotation = lean - lunge * 0.12 - anim.tilt * 0.08 * anim.aiming + Math.sin(t * 1.3) * 0.02;
  r.spr.material.color.setRGB(1, 1 - anim.hit * 0.55, 1 - anim.hit * 0.55);
  r.flash.material.opacity = Math.max(anim.evoFlash / 0.7, anim.hit > 0.75 ? (anim.hit - 0.75) * 3 : 0, anim.flash > 0 ? 0.3 : 0);
  if (r.aura) {
    const on = evo || r.skinGlow || (r.def.knight && anim.special > 0), k = 0.5 + 0.5 * Math.sin(t * 5);
    r.aura.material.opacity = on ? (evo || anim.special > 0 ? 0.32 : 0.18) + 0.12 * k + anim.evoFlash * 0.6 : anim.evoFlash * 0.8;
    r.aura.scale.setScalar(r.aura.userData.s * (1 + 0.06 * k + anim.evoFlash * 0.5));
  }
  if (r.shadow) { groundShadow(r, mesh); r.shadow.material.opacity *= 1 - Math.min(0.6, (hop + lift) * 0.4); }
}

/* =====================================================================
 *  ENEMIES: build + animate (mirrored: they face left, toward the partner)
 * ===================================================================== */
function buildEnemy(type) {
  const def = ENEMY_TYPES[type];
  const a = raster(type, { h: 256 * RES, flip: true }), s = raster(type, { h: 256 * RES, flip: true, sil: true });
  const rig = spriteRig(a, s, def.h);
  rig.def = def;
  rig.root.userData.top = def.h + 0.6;
  return rig.root;
}
function animateEnemy(mesh, st, dt, time) {
  const r = mesh.userData.rig; if (!r) return;
  checkFit(r);
  mesh.rotation.set(0, 0, 0); // sprites always face the camera; keep the shadow flat
  const ph = st.wob || 0;
  const bob = Math.sin(time * (r.def.fly ? 4 : 3.2) + ph);
  r.body.position.y = (r.def.fly ? 0.8 : 0) + bob * (r.def.fly ? 0.3 : 0.12);
  // waddle; close to the partner they get angry (faster bounce)
  const angry = st.progress > 0.62 ? 1 : 0;
  const step = Math.abs(Math.sin(time * (5 + angry * 4) + ph));
  const sq = r.def.fly ? Math.sin(time * 12 + ph) * 0.05 : step * 0.06;
  r.spr.scale.set(r.bw * (1 + sq), r.bh * (1 - sq * 0.8), 1); r.flash.scale.copy(r.spr.scale);
  r.spr.material.rotation = r.flash.material.rotation = clamp(-(st.vx || 0) * 0.04, -0.3, 0.3) + Math.sin(time * (3 + angry * 5) + ph) * (0.05 + angry * 0.05);
  r.spr.material.color.setRGB(1, 1 - angry * 0.12 * step, 1 - angry * 0.12 * step);
  r.flashT = Math.max(0, (r.flashT || 0) - dt);
  r.flash.material.opacity = r.flashT * 4;
  groundShadow(r, mesh);
}

/* =====================================================================
 *  BOSSES: build + animate (mirrored too)
 * ===================================================================== */
const BOSS_SIZE = 19;
function buildBoss(idx) {
  const def = BOSSES[idx % BOSSES.length];
  const a = raster(def.id, { h: 512 * RES, flip: true }), s = raster(def.id, { h: 512 * RES, flip: true, sil: true });
  const rig = spriteRig(a, s, BOSS_SIZE * (def.sizeMul || 1), { centerY: 0.5 });
  rig.def = def;
  const am = new T.SpriteMaterial({ map: glowTexture(), color: def.glow || 0xff3a6a, transparent: true, opacity: 0.12, depthWrite: false, blending: ADD });
  rig.aura = new T.Sprite(am); rig.aura.scale.setScalar(BOSS_SIZE * 1.5); rig.aura.renderOrder = -1; rig.body.add(rig.aura);
  fitRig(rig); rig.aura.position.set(0, 0, -0.05);
  if (def.orbit) {
    const cv = propCanvas(def.orbit), op = BOSS_SIZE * 0.09;
    rig.orbit = new T.Group(); rig.body.add(rig.orbit);
    for (let i = 0; i < 8; i++) {
      const sp = new T.Sprite(new T.SpriteMaterial({ map: tex(cv), transparent: true, alphaTest: 0.04 }));
      const ang = i / 8 * Math.PI * 2;
      sp.scale.set(op, op, 1);
      sp.position.set(Math.cos(ang) * BOSS_SIZE * 0.6, Math.sin(i * 1.9) * BOSS_SIZE * 0.2, Math.sin(ang) * BOSS_SIZE * 0.45);
      rig.orbit.add(sp);
    }
  }
  const holder = rig.root;
  holder.userData.top = BOSS_SIZE / 2 + 1.0;
  holder.userData.front = 1.5;
  holder.userData.inner = rig.body; holder.userData.def = def; holder.userData.P = {};
  return holder;
}
function animateBoss(holder, dt, time, attack) {
  const r = holder.userData.rig;
  if (r.ver !== r.cv.ver) { fitRig(r); r.aura.position.set(0, 0, -0.05); }
  r.body.position.y = Math.sin(time * 1.1) * 0.35;
  const br = 1 + Math.sin(time * 1.9) * 0.015 + attack * 0.08;
  r.spr.scale.set(r.bw * br, r.bh * br, 1); r.flash.scale.copy(r.spr.scale);
  r.spr.center.x = r.flash.center.x = 0.5 + attack * 0.06; // lean toward the partners when attacking
  r.spr.material.rotation = r.flash.material.rotation = Math.sin(time * 0.6) * 0.03 + attack * 0.05;
  r.flashT = Math.max(0, (r.flashT || 0) - dt);
  r.flash.material.opacity = Math.max(r.flashT * 3, attack > 0.85 ? 0.15 : 0);
  r.aura.material.opacity = 0.12 + attack * 0.25 + Math.sin(time * 3) * 0.03;
  if (r.orbit) { r.orbit.rotation.y += dt * 0.7; r.orbit.children.forEach((s, i) => { s.position.y += Math.sin(time * 2 + i) * 0.01; }); }
  groundShadow(r, holder);
}

/* white flash when something is hit (enemies and bosses) */
function hitFlash(mesh, k) { const r = mesh && mesh.userData.rig; if (r) r.flashT = Math.max(r.flashT || 0, k || 0.25); }

/* the boss's attack: a spiky virus orb */
function buildShot() {
  const cv = propCanvas("shot");
  const rig = spriteRig(cv, cv, 2.4, { centerY: 0.5, shadow: false });
  rig.flash.visible = false;
  const glow = new T.Sprite(new T.SpriteMaterial({ map: glowTexture(), color: 0xff3a6a, transparent: true, opacity: 0.55, depthWrite: false, blending: ADD }));
  glow.scale.setScalar(4.2); rig.body.add(glow);
  rig.root.userData.top = 1.6;
  return rig.root;
}
function animateShot(mesh, time) { const r = mesh.userData.rig; if (r) { r.spr.material.rotation = time * 6; const s = 1 + Math.sin(time * 20) * 0.08; r.spr.scale.set(r.bw * s, r.bh * s, 1); } }

/* portraits for the UI: portrait() gives a canvas (share card), portraitURL() an image URL */
function portrait(def, skin, opts) {
  const id = opts && opts.evo ? (def.evoArt || def.art) : def.art;
  return raster(id, { h: (opts && opts.h) || 256, skin: skin && skin.colors ? skin : null });
}
function portraitURL(def, skin, evo) {
  const id = evo ? (def.evoArt || def.art) : def.art;
  if (!skin || !skin.colors) return ART_DIR + id + ".svg";
  const cv = raster(id, { h: 160, skin });
  return cv.ver ? cv.toDataURL() : ART_DIR + id + ".svg";
}

// start loading every partner and enemy picture now (bosses load when they appear)
for (const m of MECHS) { svgImage(m.art); if (m.evoArt) svgImage(m.evoArt); }
for (const id of Object.keys(ENEMY_TYPES)) svgImage(id);

window.MODELS = { MECHS, buildMech, newAnim, aimMech, fireMech, animateMech, ENEMY_TYPES, ENEMY_SIZES, buildEnemy, animateEnemy,
  BOSSES, buildBoss, animateBoss, hitFlash, buildShot, animateShot, portrait, portraitURL, artReady, raster, setQuality, MS, MB, GLOW };
})();
