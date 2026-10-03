// Shared helpers for the chibi monster illustrations (SVG). Used by tools/art/build.js.
// Style: thick warm-brown outline, soft vertical gradients, big sparkly eyes, rosy cheeks.
'use strict';
const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const toHex = (a) => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, k) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * k));
const light = (c, k = 0.35) => mix(c, '#fff8e8', k);
const dark = (c, k = 0.25) => mix(c, '#3a1a40', k);

function make() {
  const defs = new Map();
  let n = 0;
  const H = {
    OUT: '#4a2410',
    light, dark, mix,
    /* vertical gradient fill from a lighter top to the colour; returns url(#id) */
    f(c, k) { const id = 'g' + c.slice(1) + (k ? String(k).replace('.', '') : ''); if (!defs.has(id)) defs.set(id, `<linearGradient id="${id}" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="${light(c, k || 0.38)}"/><stop offset="1" stop-color="${c}"/></linearGradient>`); return `url(#${id})`; },
    metal(c) { const id = 'm' + c.slice(1); if (!defs.has(id)) defs.set(id, `<linearGradient id="${id}" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${light(c, 0.7)}"/><stop offset="0.4" stop-color="${light(c, 0.15)}"/><stop offset="1" stop-color="${dark(c, 0.2)}"/></linearGradient>`); return `url(#${id})`; },
    p(d, fill, x = '') { return `<path d="${d}" fill="${fill}" ${x}/>`; },
    e(cx, cy, rx, ry, fill, x = '') { return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${x}/>`; },
    /* soft shade inside a shape (no outline) */
    sh(d, c, op = 0.55) { return `<path d="${d}" fill="${dark(c, 0.18)}" stroke="none" opacity="${op}"/>`; },
    /* white highlight stroke */
    hi(d, w = 6, op = 0.8) { return `<path d="${d}" fill="none" stroke="#fffbe8" stroke-width="${w}" opacity="${op}"/>`; },
    /* the big sparkly eye: sclera, iris (radial), pupil, two glints */
    eye(cx, cy, rx, ry, iris, o = {}) {
      const id = 'i' + iris.slice(1);
      if (!defs.has(id)) defs.set(id, `<radialGradient id="${id}" cx="0.45" cy="0.68" r="0.62"><stop offset="0" stop-color="${light(iris, 0.55)}"/><stop offset="0.6" stop-color="${iris}"/><stop offset="1" stop-color="${dark(iris, 0.45)}"/></radialGradient>`);
      const dx = o.look == null ? 0.18 : o.look, pr = o.pupil || 0.42;
      let s = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#ffffff"/>`;
      s += `<ellipse cx="${cx + rx * dx}" cy="${cy + ry * 0.1}" rx="${rx * 0.8}" ry="${ry * 0.8}" fill="url(#${id})" stroke="none"/>`;
      if (!o.noPupil) s += `<ellipse cx="${cx + rx * (dx + 0.08)}" cy="${cy + ry * 0.16}" rx="${rx * pr}" ry="${ry * (o.slit ? 0.62 : 0.5)}" fill="#101014" stroke="none"/>`;
      s += `<ellipse cx="${cx - rx * 0.28}" cy="${cy - ry * 0.3}" rx="${rx * 0.3}" ry="${rx * 0.3}" fill="#ffffff" stroke="none"/>`;
      s += `<ellipse cx="${cx + rx * 0.42}" cy="${cy + ry * 0.42}" rx="${rx * 0.14}" ry="${rx * 0.14}" fill="#ffffff" stroke="none"/>`;
      s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none"/>`;
      if (o.brow) s += `<path d="M${cx - rx * 1.05} ${cy - ry * 1.1} L${cx + rx * 0.9} ${cy - ry * 0.75}" fill="none" stroke-width="4"/>`;
      return s;
    },
    blush(cx, cy, rx = 9, ry = 5) { return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#ff7a8a" stroke="none" opacity="0.45"/>`; },
    /* small white claws given as [[x,y,angleDeg,len],...] */
    claws(list, c = '#ffffff') { return list.map(([x, y, a, l]) => { const r = a * Math.PI / 180, w = l * 0.38; const ex = x + Math.cos(r) * l, ey = y + Math.sin(r) * l, nx = -Math.sin(r) * w, ny = Math.cos(r) * w; return `<path d="M${(x + nx).toFixed(1)} ${(y + ny).toFixed(1)} Q${(x + Math.cos(r) * l * 0.7 + nx * 0.4).toFixed(1)} ${(y + Math.sin(r) * l * 0.7 + ny * 0.4).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)} Q${(x + Math.cos(r) * l * 0.5 - nx * 0.6).toFixed(1)} ${(y + Math.sin(r) * l * 0.5 - ny * 0.6).toFixed(1)} ${(x - nx).toFixed(1)} ${(y - ny).toFixed(1)} Z" fill="${c}" stroke-width="2.4"/>`; }).join(''); },
    /* wrap a part so it can be scaled around an anchor (chibi proportions) */
    scale(s, x, y, k, body) { return `<g transform="translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})">${body}</g>`; },
    star(cx, cy, r1, r2, pts, fill, x = '') { let d = ''; for (let i = 0; i < pts * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / pts, r = i % 2 ? r2 : r1; d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r).toFixed(1); } return `<path d="${d}Z" fill="${fill}" ${x}/>`; },
    svg(vb, body) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">\n<defs>${[...defs.values()].join('')}</defs>\n<g stroke="${H.OUT}" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round">\n${body}\n</g>\n</svg>\n`;
    },
  };
  return H;
}
module.exports = { make, light, dark, mix };
