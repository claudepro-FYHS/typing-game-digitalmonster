// The 17 festival bosses (chibi). All face right; the game mirrors them.
'use strict';
const tube = (H, d, c, w = 12) => H.p(d, 'none', `stroke="${H.OUT}" stroke-width="${w}"`) + H.p(d, 'none', `stroke="${c}" stroke-width="${w - 6}"`);
const fangs = (H, x, y, w = 30) => H.p(`M${x - w / 2} ${y} C${x - w / 4} ${y + 9} ${x + w / 4} ${y + 9} ${x + w / 2} ${y - 2}`, 'none', 'stroke-width="3.2"') + H.p(`M${x - w / 3} ${y + 3} l3 7 l3 -6 Z M${x + w / 6} ${y + 4} l3 7 l3 -7 Z`, '#fff', 'stroke-width="1.8"');
const brows = (H, x1, x2, y) => H.p(`M${x1 - 12} ${y - 6} L${x1 + 12} ${y + 2} M${x2 - 10} ${y + 2} L${x2 + 12} ${y - 6}`, 'none', 'stroke-width="4.6"');
const evil = (H, x1, x2, y, c, r = 11) => H.eye(x1, y, r, r * 1.1, c, { pupil: 0.24, slit: true }) + H.eye(x2, y, r * 0.85, r, c, { pupil: 0.24, slit: true }) + brows(H, x1, x2, y - r - 4);
const snake = (H, d, c, w, belly) => H.p(d, 'none', `stroke="${H.OUT}" stroke-width="${w + 8}"`) + H.p(d, 'none', `stroke="${c}" stroke-width="${w}"`) + (belly ? H.p(d, 'none', `stroke="${belly}" stroke-width="${w * 0.28}" opacity="0.8"`) : '');
const dragonHead = (H, c, belly) => H.p('M60 90 C60 50 90 26 124 26 C156 26 178 44 186 68 C204 72 216 84 214 100 C212 114 196 122 176 122 C150 132 100 132 82 124 C68 116 60 104 60 90 Z', H.f(c)) + H.p('M120 100 C140 94 180 94 210 100 C206 112 190 120 174 120 C150 126 128 122 120 110 Z', H.f(belly));
const orb = (H, x, y, r, c) => H.e(x, y, r, r, `url(#orb${c.slice(1)})`) + `<defs><radialGradient id="orb${c.slice(1)}" cx="0.35" cy="0.35" r="0.7"><stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="${c}"/><stop offset="1" stop-color="${H.dark(c, 0.3)}"/></radialGradient></defs>`;

module.exports = {
  azulongmon(H) {
    const b = '#9ad8f8', belly = '#fff4d8', gold = '#f2c23a', chain = '#c8d0dc';
    let s = '';
    s += snake(H, 'M150 120 C190 140 200 190 150 196 C100 202 60 200 30 180 C0 160 0 120 30 110', b, 34, belly);
    s += H.p('M30 110 L14 92 L40 100 Z', H.f(b));
    s += H.p('M60 196 C80 170 120 170 140 190', 'none', `stroke="${chain}" stroke-width="4" stroke-dasharray="7 4"`);
    for (const [x, y] of [[40, 186], [120, 200], [176, 160]]) s += orb(H, x, y, 9, '#5ad0ff');
    s += H.p('M76 44 C62 20 66 -4 82 -18 C84 4 92 18 102 26 Z M110 34 C110 10 122 -8 140 -16 C134 6 132 20 134 32 Z', H.metal(gold));
    s += dragonHead(H, b, belly);
    s += H.p('M196 106 C210 116 226 118 236 112 M196 112 C206 126 220 132 232 130', 'none', `stroke="${gold}" stroke-width="3"`);
    s += H.eye(128, 72, 12, 13, '#3a82e0', { brow: true }) + H.eye(160, 70, 9, 11, '#3a82e0');
    s += H.p('M146 108 l4 8 l4 -8 M176 108 l4 8 l4 -8', '#fff', 'stroke-width="1.8"');
    s += H.e(206, 92, 3, 2.4, H.OUT, 'stroke="none"');
    s += H.blush(112, 94);
    return ['-10 -24 252 236', s];
  },

  zhuqiaomon(H) {
    const red = '#e8384a', fire = '#ffb03a', gold = '#f2c23a', black = '#3a2438';
    let s = '';
    s += H.p('M78 128 C46 90 16 70 -10 66 C0 86 8 100 20 112 C4 114 -6 122 -12 134 C14 136 44 138 74 148 Z', H.f(red)) + H.p('M-10 66 C0 86 8 100 20 112 C10 92 2 78 -10 66 Z', H.f(fire), 'stroke="none"');
    s += H.p('M138 128 C170 90 200 70 226 66 C216 86 208 100 196 112 C212 114 222 122 228 134 C202 136 172 138 142 148 Z', H.f(red)) + H.p('M226 66 C216 86 208 100 196 112 C206 92 214 78 226 66 Z', H.f(fire), 'stroke="none"');
    s += H.p('M84 172 C60 196 30 206 6 200 C26 190 40 178 52 166 Z', H.f(fire));
    s += H.e(108, 160, 34, 30, H.f(red));
    s += H.p('M90 146 C100 154 116 154 126 146 L124 164 L92 164 Z', H.metal(gold));
    s += H.p('M94 186 L92 202 M120 186 L124 202', 'none', `stroke="${H.OUT}" stroke-width="9"`) + H.p('M94 186 L92 202 M120 186 L124 202', 'none', `stroke="${black}" stroke-width="4"`);
    s += H.p('M70 30 C60 6 70 -14 88 -22 C86 -4 94 8 104 14 C104 -6 118 -20 136 -22 C128 -4 128 10 136 22 Z', H.f(fire));
    s += H.e(106, 80, 64, 56, H.f(red));
    s += H.p('M56 62 C76 54 136 52 160 64 L156 76 C130 66 82 66 60 76 Z', H.metal(gold));
    s += H.p('M158 84 C174 76 198 80 212 92 C198 100 180 104 160 102 Z', H.metal(gold));
    s += evil(H, 112, 146, 86, '#ffd23a', 11);
    for (const [x, y] of [[20, 150], [196, 150]]) s += orb(H, x, y, 8, '#ff7a3a');
    return ['-14 -26 250 232', s];
  },

  antylamon(H) {
    const fur = '#f4ecdc', brown = '#a8784a', gold = '#f2c23a', red = '#e8384a', blade = '#e4ecf8';
    let s = '';
    s += H.p('M70 70 C52 30 52 -10 66 -32 C82 -8 88 30 88 64 Z M118 64 C120 26 136 -8 158 -24 C162 6 150 40 134 70 Z', H.f(fur));
    s += H.p('M68 40 C66 14 68 -6 72 -18 M134 40 C140 16 146 0 152 -10', 'none', `stroke="${H.light(red, 0.4)}" stroke-width="5"`);
    s += H.e(108, 164, 30, 28, H.f(fur));
    s += H.p('M84 148 C96 140 120 140 132 148 L128 170 L88 170 Z', H.f(brown));
    s += H.p('M92 188 L86 204 L106 204 Z M118 188 L116 204 L136 204 Z', H.f(fur));
    s += tube(H, 'M134 154 C146 150 154 144 158 136', fur, 12) + H.p('M152 140 C170 110 196 104 212 114 C196 120 184 134 176 152 Z', H.metal(blade));
    s += tube(H, 'M82 154 C70 158 62 164 58 172', fur, 12) + H.p('M60 170 C40 168 22 178 14 194 C30 188 44 188 58 192 Z', H.metal(blade));
    s += H.e(108, 92, 58, 50, H.f(fur));
    s += H.p('M56 70 C70 56 146 56 160 70 L156 82 C140 74 76 74 60 82 Z', H.metal(gold)) + H.e(108, 68, 6, 6, H.f(red));
    s += H.eye(92, 96, 10, 12, '#e8384a') + H.eye(126, 96, 10, 12, '#e8384a');
    s += H.p('M104 114 l4 4 l4 -4', 'none', 'stroke-width="2.6"');
    s += H.blush(76, 110) + H.blush(140, 110);
    return ['0 -36 224 246', s];
  },

  megaseadramon(H) {
    const b = '#4a7ad8', belly = '#e4ecf8', gold = '#f2c23a', fin = '#c8d0dc';
    let s = '';
    s += snake(H, 'M0 196 C10 170 40 156 60 170 C80 184 100 196 130 184 C150 176 160 160 156 140', b, 34, belly);
    s += H.p('M60 156 L54 136 L72 150 Z M100 180 L100 160 L114 176 Z', H.f(fin));
    // helmet with the lightning blade
    s += H.p('M76 44 L60 12 L84 20 L80 -16 L110 22 Z', H.metal(gold));
    s += dragonHead(H, b, belly);
    s += H.p('M70 66 C90 44 150 40 176 58 L172 70 C150 58 100 60 74 76 Z', H.metal(gold));
    s += H.p('M60 60 C40 54 30 40 32 24 C44 34 54 42 66 46 Z', H.f(fin));
    s += evil(H, 128, 158, 82, '#e8384a', 10);
    s += H.p('M146 106 l4 8 l4 -8 M176 106 l4 8 l4 -8', '#fff', 'stroke-width="1.8"');
    s += H.e(206, 90, 3, 2.4, H.OUT, 'stroke="none"');
    return ['-16 -24 236 240', s];
  },

  sinduramon(H) {
    const white = '#fbfbff', red = '#e8384a', gold = '#f2c23a', beak = '#ffd860';
    let s = '';
    s += H.p('M78 150 C50 140 26 112 20 80 C40 100 56 112 76 120 C60 100 52 76 54 50 C70 76 84 96 98 110 Z', H.f(white)) + H.p('M20 80 C40 100 56 112 76 120 L70 130 C46 120 30 104 20 80 Z', H.f(red), 'stroke="none"');
    s += H.e(110, 160, 34, 30, H.metal(gold));
    s += H.p('M92 146 L128 146', 'none', `stroke="${red}" stroke-width="4"`);
    s += H.p('M96 186 L92 202 M122 186 L126 202', 'none', `stroke="${H.OUT}" stroke-width="9"`) + H.p('M96 186 L92 202 M122 186 L126 202', 'none', `stroke="${beak}" stroke-width="4"`);
    s += H.claws([[92, 202, 160, 8], [126, 202, 20, 8]], beak);
    s += H.p('M80 30 C76 10 86 -6 100 -10 C98 6 104 14 112 18 C112 2 124 -10 138 -10 C132 6 132 18 138 28 Z', H.f(red));
    s += H.e(108, 80, 62, 54, H.f(white));
    s += H.p('M52 64 C70 50 146 50 162 64 L158 76 C140 66 76 66 56 76 Z', H.metal(gold));
    s += H.p('M158 82 C176 74 200 80 212 94 C196 102 176 104 160 100 Z', H.f(beak));
    s += H.p('M168 104 C172 120 166 130 158 134 C150 126 152 112 160 104 Z', H.f(red));
    s += evil(H, 114, 146, 84, '#ffd23a', 10);
    for (const [x, y] of [[30, 150], [190, 140]]) s += orb(H, x, y, 8, '#ffd23a');
    return ['8 -18 220 226', s];
  },

  ebonwumon(H) {
    const shell = '#6a5a4a', skin = '#a8b498', tree = '#5ab858', beard = '#f4f6fb';
    let s = '';
    s += H.p('M100 40 C90 10 104 -14 120 -20 C132 -6 136 16 124 40 Z', H.f(tree)) + H.p('M112 40 L112 60', 'none', 'stroke="#7a5a3a" stroke-width="8"');
    s += H.p('M40 60 C34 36 46 18 62 14 C72 28 72 44 62 60 Z', H.f(tree)) + H.p('M52 56 L56 74', 'none', 'stroke="#7a5a3a" stroke-width="6"');
    s += H.p('M30 150 C20 100 60 56 110 56 C160 56 196 100 186 150 Z', H.f(shell));
    s += H.p('M60 90 L80 120 L60 146 M110 70 L110 146 M156 90 L138 120 L156 146 M80 120 L138 120', 'none', `stroke="${H.dark(shell, 0.3)}" stroke-width="3"`);
    s += H.p('M24 150 C40 162 180 162 196 150 L190 168 C150 178 70 178 30 168 Z', H.f('#d8c8a0'));
    s += H.p('M44 168 L40 204 L70 204 L68 170 Z M146 170 L144 204 L174 204 L172 168 Z', H.f(skin));
    // two old heads
    const head = (x, y, k) => tube(H, `M${150 + (x - 180) * 0.3} 130 C${x - 20} 130 ${x - 10} ${y + 20} ${x} ${y + 10}`, skin, 18)
      + H.e(x, y, 28 * k, 24 * k, H.f(skin))
      + H.p(`M${x - 18 * k} ${y + 12 * k} C${x - 10 * k} ${y + 44 * k} ${x + 14 * k} ${y + 44 * k} ${x + 20 * k} ${y + 12 * k} Z`, H.f(beard))
      + H.p(`M${x - 20 * k} ${y - 10 * k} L${x - 4 * k} ${y - 6 * k} M${x + 4 * k} ${y - 6 * k} L${x + 20 * k} ${y - 10 * k}`, 'none', `stroke="${beard}" stroke-width="5"`)
      + H.p(`M${x - 16 * k} ${y} C${x - 12 * k} ${y - 4 * k} ${x - 6 * k} ${y - 4 * k} ${x - 2 * k} ${y} M${x + 4 * k} ${y} C${x + 8 * k} ${y - 4 * k} ${x + 14 * k} ${y - 4 * k} ${x + 18 * k} ${y}`, 'none', 'stroke-width="3"');
    s += head(170, 66, 1.15) + head(200, 108, 1.3);
    s += orb(H, 28, 186, 8, '#7ad858') + orb(H, 110, 196, 8, '#7ad858');
    return ['6 -26 252 236', s];
  },

  icedevimon(H) {
    const ice = '#d8ecfa', blue = '#7ab4e8', red = '#e8384a';
    let s = '';
    s += H.p('M80 118 C52 72 22 50 -6 44 C8 70 6 86 20 96 C4 102 0 110 -4 120 C14 118 24 124 30 132 C16 138 12 144 8 152 C34 148 56 144 78 142 Z', H.f(blue)) + H.p('M136 118 C164 72 194 50 222 44 C208 70 210 86 196 96 C212 102 216 110 220 120 C202 118 192 124 186 132 C200 138 204 144 208 152 C182 148 160 144 138 142 Z', H.f(blue));
    s += H.e(108, 162, 32, 30, H.f(ice));
    s += H.p('M90 186 L84 204 L106 204 Z M120 186 L118 204 L140 204 Z', H.f(ice));
    s += tube(H, 'M138 150 C160 150 174 160 182 176', ice, 13) + H.claws([[184, 178, 50, 11], [180, 182, 90, 10]], '#9ad8ff');
    s += tube(H, 'M78 150 C62 156 54 166 50 180', ice, 13);
    s += H.p('M58 58 C40 42 34 16 44 -6 C54 14 64 28 76 38 Z M158 58 C176 42 182 16 172 -6 C162 14 152 28 140 38 Z', H.f('#f4f6fb'));
    s += H.e(108, 84, 60, 54, H.f(ice));
    s += H.p('M60 70 C80 62 136 62 156 70', 'none', `stroke="${blue}" stroke-width="4"`);
    s += evil(H, 92, 126, 90, red, 10);
    s += fangs(H, 110, 114, 26);
    for (const [x, y] of [[30, 180], [200, 190]]) s += H.star(x, y, 10, 4, 6, '#f4f6fb', 'stroke-width="2"');
    return ['-10 -14 236 220', s];
  },

  diaboromon(H) {
    const black = '#2a2438', white = '#f4f6fb', red = '#e8384a', gold = '#f2c23a';
    let s = '';
    s += tube(H, 'M76 150 C50 160 30 170 14 196', black, 12) + tube(H, 'M140 150 C166 160 186 170 202 196', black, 12);
    s += H.claws([[14, 196, 120, 12], [202, 196, 60, 12]], white);
    s += H.e(108, 160, 26, 32, H.f(black));
    s += H.p('M96 136 L120 136 L114 182 L102 182 Z', H.f(white));
    s += H.p('M94 188 L86 206 M122 188 L130 206', 'none', `stroke="${H.OUT}" stroke-width="10"`) + H.p('M94 188 L86 206 M122 188 L130 206', 'none', `stroke="${black}" stroke-width="5"`);
    s += H.p('M60 40 C50 20 54 4 64 -6 C70 12 76 24 86 32 Z M156 40 C166 20 162 4 152 -6 C146 12 140 24 130 32 Z', H.f(black));
    s += H.e(108, 82, 58, 54, H.f(black));
    s += H.p('M60 74 C70 46 146 46 156 74 C156 100 140 120 108 120 C76 120 60 100 60 74 Z', H.f(white));
    s += H.p('M100 54 L108 44 L116 54 Z', H.f(gold));
    s += H.eye(88, 80, 12, 9, red, { noPupil: true }) + H.eye(128, 80, 12, 9, red, { noPupil: true });
    s += brows(H, 88, 128, 68);
    s += H.p('M84 104 L132 104', 'none', 'stroke-width="3"') + H.p('M90 104 L90 112 M100 104 L100 112 M110 104 L110 112 M120 104 L120 112', 'none', 'stroke-width="2.4"');
    return ['0 -14 216 224', s];
  },

  ladydevimon(H) {
    const black = '#2a2438', skin = '#c8d4f0', hair = '#f4f6fb', red = '#e8384a', purple = '#6a3a98';
    let s = '';
    s += H.p('M62 110 C34 80 10 76 -6 86 C10 96 12 110 8 124 C22 116 34 120 40 132 C48 122 58 122 66 134 Z', H.f(black));
    s += H.p('M80 138 C70 166 66 190 74 206 L142 206 C150 190 146 166 136 138 Z', H.f(black));
    s += H.p('M84 138 C96 132 120 132 132 138 L128 154 L88 154 Z', H.f(purple));
    s += tube(H, 'M132 146 C150 146 162 152 170 162', black, 12) + H.claws([[172, 164, 40, 12], [168, 168, 80, 11], [164, 168, 110, 10]], red);
    s += tube(H, 'M84 146 C70 150 62 158 58 168', skin, 10);
    s += H.p('M44 76 C30 110 32 140 46 158 C54 136 58 112 60 94 Z M172 76 C186 110 184 140 170 158 C162 136 158 112 156 94 Z', H.f(hair));
    s += H.e(108, 86, 56, 52, H.f(skin));
    s += H.p('M50 80 C52 44 78 26 108 26 C138 26 164 44 166 80 C150 64 130 56 108 56 C86 56 66 64 50 80 Z', H.f(hair));
    s += H.p('M60 80 C72 70 96 70 108 80 C120 70 144 70 156 80 L150 98 C134 92 120 94 108 100 C96 94 82 92 66 98 Z', H.f(black));
    s += H.eye(86, 86, 9, 7, red, { noPupil: true }) + H.eye(130, 86, 9, 7, red, { noPupil: true });
    s += H.p('M98 116 C104 120 114 120 120 114', 'none', `stroke="${red}" stroke-width="3.4"`);
    s += H.p('M56 40 L46 12 L72 32 Z M160 40 L170 12 L144 32 Z', H.f(black));
    return ['-10 0 230 214', s];
  },

  etemon(H) {
    const fur = '#c8946a', face = '#f4dcbc', glass = '#1a1424', pink = '#ff8ab4';
    let s = '';
    s += H.p('M76 170 C50 180 34 170 26 150 C40 156 54 156 66 150 Z', H.f(fur));
    s += H.e(108, 160, 36, 32, H.f(fur));
    s += H.e(108, 166, 20, 18, H.f(face), 'stroke="none"');
    s += H.p('M88 186 L82 204 L106 204 Z M120 186 L118 204 L142 204 Z', H.f(fur));
    s += tube(H, 'M142 150 C156 146 164 138 168 128', fur, 13) + H.p('M168 128 L176 96', 'none', 'stroke-width="5"') + H.e(178, 88, 10, 12, H.metal('#3a3448'));
    s += tube(H, 'M74 150 C60 156 52 166 50 178', fur, 13);
    s += H.e(108, 84, 66, 58, H.f(fur));
    s += H.e(40, 84, 14, 18, H.f(fur)) + H.e(176, 84, 14, 18, H.f(fur));
    s += H.p('M58 92 C60 70 84 60 108 60 C132 60 156 70 158 92 C158 118 136 134 108 134 C80 134 58 118 58 92 Z', H.f(face));
    s += H.p('M60 80 L156 80 L150 98 L120 98 L108 90 L96 98 L66 98 Z', glass);
    s += H.p('M70 84 L88 84', 'none', 'stroke="#fff" stroke-width="3" opacity="0.7"');
    s += H.p('M90 112 C100 126 120 126 130 110', 'none', 'stroke-width="3.2"') + H.p('M106 118 C110 128 120 126 120 118 Z', H.f(pink), 'stroke-width="2"');
    s += H.p('M62 30 C72 18 88 16 96 22 L92 34 Z M120 22 C130 14 148 16 156 30 L124 34 Z', H.f(H.dark(fur, 0.2)));
    s += H.blush(70, 112) + H.blush(146, 112);
    return ['14 -4 192 214', s];
  },

  digitamamon(H) {
    const shell = '#fff4e0', dark = '#1a1424', leg = '#ffb03a';
    let s = '';
    s += H.p('M88 176 L82 204 L104 204 Z M124 176 L122 204 L144 204 Z', H.f(leg));
    s += H.claws([[104, 204, 10, 7], [144, 204, 10, 7]]);
    s += H.p('M108 10 C150 10 180 70 180 120 C180 160 150 186 108 186 C66 186 36 160 36 120 C36 70 66 10 108 10 Z', H.f(shell));
    for (const [x, y] of [[70, 60], [146, 50], [60, 150], [156, 150], [110, 30]]) s += H.e(x, y, 6, 5, H.f('#f2c23a'), 'stroke-width="2"');
    s += H.p('M54 96 L70 84 L84 100 L100 82 L116 100 L132 82 L148 100 L164 86 L168 116 L150 128 L132 116 L116 132 L100 116 L84 132 L68 118 L52 128 Z', dark);
    s += H.e(100, 104, 8, 7, '#e8384a', 'stroke="none"') + H.e(132, 104, 8, 7, '#e8384a', 'stroke="none"') + H.e(98, 102, 2.6, 2.6, '#fff', 'stroke="none"') + H.e(130, 102, 2.6, 2.6, '#fff', 'stroke="none"');
    s += H.blush(68, 140, 8, 4) + H.blush(150, 140, 8, 4);
    return ['22 0 172 212', s];
  },

  motherdreaper(H) {
    const red = '#e8384a', pink = '#ff8ab4', skin = '#f4e4f0', dark = '#5a1a3a';
    let s = '';
    s += H.p('M10 206 C0 170 20 140 40 140 C40 110 70 96 92 108 C104 90 132 88 146 104 C168 96 196 110 196 140 C216 146 226 176 214 206 Z', H.f(red));
    for (const [x, y, r] of [[40, 176, 12], [80, 192, 10], [170, 180, 14], [140, 150, 8], [196, 196, 8]]) s += H.e(x, y, r, r, H.f(pink));
    s += H.p('M40 150 C30 120 34 96 46 80 M180 150 C196 124 196 100 186 84', 'none', `stroke="${H.OUT}" stroke-width="12"`) + H.p('M40 150 C30 120 34 96 46 80 M180 150 C196 124 196 100 186 84', 'none', `stroke="${red}" stroke-width="6"`);
    s += H.e(46, 76, 8, 8, H.f(pink)) + H.e(186, 80, 8, 8, H.f(pink));
    // the mask-like face of the Mother
    s += H.p('M108 120 L96 160 L120 160 Z', H.f(skin));
    s += H.e(108, 76, 52, 50, H.f(skin));
    s += H.p('M58 62 C70 34 146 34 158 62 C150 56 130 50 108 50 C86 50 66 56 58 62 Z', H.f(dark));
    s += H.e(88, 80, 10, 6, dark) + H.e(128, 80, 10, 6, dark) + H.e(88, 80, 4, 4, red, 'stroke="none"') + H.e(128, 80, 4, 4, red, 'stroke="none"');
    s += H.p('M88 70 L76 66 M128 70 L140 66', 'none', 'stroke-width="3"');
    s += H.p('M98 104 L118 104', 'none', 'stroke-width="3"');
    s += H.p('M72 90 L68 120 M144 90 L148 120', 'none', `stroke="${red}" stroke-width="3"`);
    return ['-6 18 230 196', s];
  },

  leomon(H) {
    const fur = '#ffc85a', mane = '#e89a2a', pants = '#3a3448', steel = '#e4ecf8';
    let s = '';
    s += H.p('M160 190 L210 40', 'none', `stroke="${H.OUT}" stroke-width="10"`) + H.p('M168 166 L206 50 L212 52 L176 168 Z', H.metal(steel)) + H.p('M156 176 L180 184', 'none', `stroke="${H.OUT}" stroke-width="10"`) + H.p('M156 176 L180 184', 'none', 'stroke="#f2c23a" stroke-width="5"');
    s += H.e(108, 160, 34, 30, H.f(fur));
    s += H.p('M76 168 C92 176 124 176 140 168 L138 190 L78 190 Z', H.f(pants));
    s += H.p('M90 190 L84 204 L106 204 Z M120 190 L118 204 L140 204 Z', H.f(fur));
    s += tube(H, 'M138 152 C150 158 158 166 162 176', fur, 13) + tube(H, 'M78 152 C64 156 56 164 52 174', fur, 13);
    s += H.p('M40 90 L24 80 L36 64 L16 46 L42 40 L32 14 L60 22 L64 -2 L86 16 L100 -8 L114 14 L134 -6 L140 18 L166 6 L164 32 L194 30 L180 54 L202 66 L180 80 L194 98 L170 102 L166 124 L50 124 Z', H.f(mane));
    s += H.e(108, 84, 56, 50, H.f(fur));
    s += H.e(132, 104, 22, 16, H.f('#fff0d0'));
    s += H.e(146, 96, 6, 4, H.OUT, 'stroke="none"');
    s += H.eye(100, 80, 10, 12, '#3a82e0', { brow: true }) + H.eye(134, 78, 9, 11, '#3a82e0');
    s += H.p('M126 112 C134 118 146 118 152 112', 'none', 'stroke-width="3"');
    s += H.blush(80, 102);
    return ['10 -14 210 224', s];
  },

  pumpkinmon(H) {
    const orange = '#ff9a3a', stem = '#5ab858', body = '#3a3448', glove = '#f4f6fb';
    let s = '';
    s += H.e(108, 166, 26, 26, H.f(body));
    s += H.p('M92 188 L86 204 L106 204 Z M118 188 L116 204 L136 204 Z', H.f(body));
    s += tube(H, 'M130 158 C146 152 156 146 162 138', body, 11) + H.e(166, 134, 10, 9, H.f(glove));
    s += tube(H, 'M86 158 C70 162 62 170 58 178', body, 11) + H.e(56, 182, 10, 9, H.f(glove));
    s += H.p('M104 30 C100 14 108 0 122 -4 C118 10 116 20 116 30 Z', H.f(stem));
    s += H.p('M120 16 C136 2 156 6 160 16 C146 20 132 22 120 16 Z', H.f(stem));
    s += H.e(108, 82, 70, 58, H.f(orange));
    s += H.p('M80 30 C66 60 66 110 80 136 M108 26 L108 140 M136 30 C150 60 150 110 136 136', 'none', `stroke="${H.dark(orange, 0.25)}" stroke-width="3"`);
    s += H.p('M72 72 L92 62 L96 86 Z M124 62 L144 72 L120 86 Z', '#3a1a10');
    s += H.p('M70 104 L80 98 L88 108 L98 98 L108 108 L118 98 L128 108 L138 98 L146 104 C140 120 124 126 108 126 C92 126 76 120 70 104 Z', '#3a1a10');
    s += H.e(84, 76, 3, 3, '#ffd23a', 'stroke="none"') + H.e(132, 76, 3, 3, '#ffd23a', 'stroke="none"');
    return ['26 -10 168 220', s];
  },

  cherrymon(H) {
    const bark = '#8a5a3a', leaf = '#4aa84a', cherry = '#e8384a';
    let s = '';
    s += H.p('M20 80 C10 40 40 6 80 6 C96 -10 130 -10 144 6 C184 6 210 40 198 80 C214 100 200 130 176 130 L42 130 C16 130 4 100 20 80 Z', H.f(leaf));
    for (const [x, y] of [[40, 50], [80, 26], [140, 24], [180, 56], [30, 100], [190, 104]]) s += H.p(`M${x} ${y - 14} L${x - 6} ${y - 2} M${x} ${y - 14} L${x + 6} ${y - 2}`, 'none', 'stroke-width="2"') + H.e(x - 6, y, 7, 7, H.f(cherry)) + H.e(x + 6, y, 7, 7, H.f(cherry));
    s += H.p('M60 110 L54 204 L162 204 L156 110 Z', H.f(bark));
    s += H.p('M54 204 L30 210 M162 204 L190 210 M90 204 L84 212 M130 204 L138 212', 'none', `stroke="${bark}" stroke-width="8"`);
    s += tube(H, 'M156 140 C176 136 190 124 196 110', bark, 14) + H.p('M196 110 L206 96 M196 110 L212 112', 'none', `stroke="${bark}" stroke-width="5"`);
    s += H.p('M70 130 C80 120 96 120 102 132 L96 140 C88 134 78 134 72 140 Z M114 132 C120 120 136 120 146 130 L144 140 C138 134 128 134 120 140 Z', '#3a1a10');
    s += H.e(88, 134, 4, 4, '#ffd23a', 'stroke="none"') + H.e(130, 134, 4, 4, '#ffd23a', 'stroke="none"');
    s += H.p('M84 168 C96 158 120 158 132 168 C124 180 92 180 84 168 Z', '#3a1a10');
    s += H.p('M110 64 C116 56 128 56 134 62', 'none', 'stroke-width="2"');
    return ['0 -14 220 230', s];
  },

  parrotmon(H) {
    const green = '#5ab858', yellow = '#ffd23a', red = '#e8384a', blue = '#3a82e0', beak = '#f4ecdc';
    let s = '';
    s += H.p('M80 124 C50 90 20 76 -6 76 C6 96 14 110 26 120 C10 124 0 132 -6 144 C20 142 50 144 76 150 Z', H.f(blue)) + H.p('M136 124 C166 90 196 76 222 76 C210 96 202 110 190 120 C206 124 216 132 222 144 C196 142 166 144 140 150 Z', H.f(blue));
    s += H.p('M84 170 C60 190 34 200 12 196 C30 186 42 176 52 164 Z', H.f(red));
    s += H.e(108, 160, 38, 32, H.f(green));
    s += H.e(112, 166, 22, 20, H.f(yellow), 'stroke="none"');
    s += H.p('M94 186 L90 202 M120 186 L124 202', 'none', `stroke="${H.OUT}" stroke-width="9"`) + H.p('M94 186 L90 202 M120 186 L124 202', 'none', 'stroke="#7a7a8a" stroke-width="4"');
    s += H.claws([[90, 202, 160, 8], [124, 202, 20, 8]], '#7a7a8a');
    s += H.p('M68 40 C56 14 66 -10 84 -18 C84 2 92 14 102 20 C100 2 112 -14 130 -16 C124 2 124 16 130 28 Z', H.f(yellow));
    s += H.p('M86 28 C82 10 92 -2 104 -4 C100 10 102 20 108 26 Z', H.f(red), 'stroke="none"');
    s += H.e(106, 80, 64, 56, H.f(green));
    s += H.p('M150 70 C176 60 206 74 212 100 C204 116 186 112 176 104 C168 116 156 116 148 108 Z', H.f(beak));
    s += H.p('M176 104 C182 96 190 94 198 98', 'none', 'stroke-width="2.6"');
    s += evil(H, 110, 140, 80, '#ff7a1a', 10);
    return ['-14 -24 240 230', s];
  },

  baihumon(H) {
    const white = '#fbfbff', stripe = '#2a2438', gold = '#f2c23a', blue = '#7ac8f0';
    let s = '';
    s += H.p('M60 170 C40 170 22 160 12 144 C30 148 46 150 58 150 Z', H.f(white));
    s += H.e(104, 160, 44, 34, H.f(white));
    s += H.p('M80 136 L86 150 M100 132 L102 148 M120 134 L118 150 M70 168 L84 166', 'none', `stroke="${stripe}" stroke-width="5"`);
    s += H.p('M70 184 L64 204 L90 204 L88 184 Z M120 184 L118 204 L144 204 L140 184 Z', H.f(white));
    s += H.claws([[90, 204, 10, 7], [144, 204, 10, 7]]);
    s += H.p('M56 52 L48 20 L80 38 Z M146 40 L164 12 L170 46 Z', H.f(white));
    s += H.p('M36 88 C36 52 64 32 100 32 C132 32 158 48 168 70 C188 74 204 86 204 102 C204 118 186 128 166 128 C140 136 76 136 56 126 C42 118 36 104 36 88 Z', H.f(white));
    s += H.p('M60 54 L72 64 M84 42 L88 58 M110 40 L106 56 M50 80 L64 82', 'none', `stroke="${stripe}" stroke-width="5"`);
    s += H.p('M64 66 C80 56 130 54 160 66 L156 76 C128 68 86 68 68 76 Z', H.metal(gold));
    s += H.e(170, 104, 24, 16, H.f('#f4f4fa'));
    s += H.e(196, 96, 5, 4, H.OUT, 'stroke="none"');
    s += evil(H, 112, 146, 88, blue, 10);
    s += H.p('M168 116 C178 122 190 120 196 112', 'none', 'stroke-width="3"') + H.p('M176 118 l3 7 l3 -6 Z', '#fff', 'stroke-width="1.8"');
    for (const [x, y] of [[20, 120], [196, 150]]) s += orb(H, x, y, 8, blue);
    return ['0 4 216 208', s];
  },
};
