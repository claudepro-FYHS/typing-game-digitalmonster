// The 13 Royal Knights (chibi). One shared knight body; helmets, colours and weapons differ.
'use strict';
const tube = (H, d, c, w = 12) => H.p(d, 'none', `stroke="${H.OUT}" stroke-width="${w}"`) + H.p(d, 'none', `stroke="${c}" stroke-width="${w - 6}"`);

/* o: armor, trim, eye, cape (colour or null), back (svg behind everything), helm (svg on the helmet),
   front (svg in front: weapon/shield), visor colour, face ('visor' | 'open'), skin */
function knight(H, o) {
  const A = o.armor, T = o.trim || '#f2c23a';
  let s = o.back || '';
  if (o.cape) s += H.p('M76 126 C58 156 52 186 58 206 L158 206 C164 186 158 156 140 126 Z', H.f(o.cape));
  s += H.e(108, 162, 32, 30, H.metal(A));
  s += H.p('M90 144 C100 138 116 138 126 144 L122 168 L94 168 Z', H.metal(T));
  if (o.chest) s += o.chest;
  s += H.p('M94 188 L90 204 L106 204 L104 188 Z M112 188 L110 204 L126 204 L122 188 Z', H.metal(A));
  s += o.arms || (tube(H, 'M80 150 C66 152 58 158 54 166', A, 13) + tube(H, 'M136 150 C150 152 158 158 162 166', A, 13));
  if (o.mid) s += o.mid;
  s += o.helmBack || '';
  s += H.e(108, 82, 62, 56, H.metal(A));
  s += H.p('M52 68 C64 40 86 28 108 28 C132 28 154 42 164 68 L156 74 L60 74 Z', H.metal(o.crown || T));
  if (o.face === 'open') {
    s += H.p('M64 78 C80 70 136 70 152 78 C150 104 136 120 108 120 C80 120 66 104 64 78 Z', H.f(o.skin || '#ffe4cc'));
    s += H.eye(90, 92, 10, 12, o.eye) + H.eye(126, 92, 10, 12, o.eye);
    s += H.p('M100 110 C104 114 112 114 116 110', 'none', 'stroke-width="3"');
    s += H.blush(78, 106, 7, 4) + H.blush(138, 106, 7, 4);
  } else {
    s += H.p('M60 78 L156 78 L150 102 L66 102 Z', o.visor || '#1a2244');
    s += H.eye(90, 90, 10, 9, o.eye) + H.eye(126, 90, 10, 9, o.eye);
    s += H.p('M100 116 C104 120 112 120 116 116', 'none', 'stroke-width="3"');
    s += H.blush(74, 112) + H.blush(142, 112);
  }
  s += o.helm || '';
  s += o.front || '';
  return s;
}
const sword = (H, x1, y1, x2, y2, blade, hilt = '#f2c23a', w = 10) => {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L * w / 2, ny = dx / L * w / 2;
  const hx = x1 + dx * 0.18, hy = y1 + dy * 0.18;
  return H.p(`M${hx + nx} ${hy + ny} L${x2 + nx * 0.3} ${y2 + ny * 0.3} L${x2 + dx / L * 8} ${y2 + dy / L * 8} L${x2 - nx * 0.3} ${y2 - ny * 0.3} L${hx - nx} ${hy - ny} Z`, H.metal(blade))
    + tube(H, `M${x1} ${y1} L${hx} ${hy}`, hilt, 9) + H.p(`M${hx + nx * 2} ${hy + ny * 2} L${hx - nx * 2} ${hy - ny * 2}`, 'none', `stroke="${H.OUT}" stroke-width="8"`) + H.p(`M${hx + nx * 2} ${hy + ny * 2} L${hx - nx * 2} ${hy - ny * 2}`, 'none', `stroke="${hilt}" stroke-width="3.5"`);
};
const wings = (H, c, n = 3, spread = 1) => {
  let s = '';
  for (let i = 0; i < n; i++) {
    const y = 60 + i * 26, w = (90 - i * 12) * spread;
    s += H.p(`M84 ${y + 60} C66 ${y + 30} ${84 - w} ${y + 4} ${76 - w} ${y - 4} C${84 - w * 0.8} ${y + 26} ${80 - w * 0.5} ${y + 46} 82 ${y + 76} Z`, H.f(c));
    s += H.p(`M132 ${y + 60} C150 ${y + 30} ${132 + w} ${y + 4} ${140 + w} ${y - 4} C${132 + w * 0.8} ${y + 26} ${136 + w * 0.5} ${y + 46} 134 ${y + 76} Z`, H.f(c));
  }
  return s;
};
const batWings = (H, c, inner) =>
  H.p('M80 118 C52 72 22 50 -6 44 C2 64 8 82 20 96 C6 98 -2 106 -6 118 C10 118 22 122 32 130 C20 134 12 142 8 152 C34 148 56 144 78 142 Z', H.f(c))
  + H.p('M136 118 C164 72 194 50 222 44 C214 64 208 82 196 96 C210 98 218 106 222 118 C206 118 194 122 184 130 C196 134 204 142 208 152 C182 148 160 144 138 142 Z', H.f(c))
  + (inner ? H.p('M76 128 C56 98 34 80 14 74 C30 100 50 120 74 136 Z M140 128 C160 98 182 80 202 74 C186 100 166 120 142 136 Z', inner, 'stroke="none" opacity="0.6"') : '');

module.exports = {
  omnimon(H) {
    const white = '#f4f6fb', gold = '#f2c23a', red = '#d8343a', orange = '#ffb03a', blue = '#7aa6e0';
    const front =
      // MetalGarurumon head (cannon) on the left arm (screen left)
      H.e(46, 160, 22, 18, H.metal(blue)) + H.p('M34 152 L12 156 L12 168 L34 170 Z', H.metal('#d8e0ec')) + H.e(12, 162, 3, 5, '#7ad0ff') + H.e(52, 154, 4, 4, '#ffd23a')
      // WarGreymon head on the right arm (screen right), sword out of its mouth
      + sword(H, 166, 170, 206, 200, '#e8eef8') + H.e(170, 160, 22, 18, H.metal(orange)) + H.p('M154 150 C160 140 180 140 186 150 Z', H.metal(gold)) + H.e(176, 160, 4, 4, '#2ac85a');
    return ['-16 -26 240 236', knight(H, {
      armor: white, trim: gold, eye: '#3a82e0', cape: red, crown: '#f4f6fb',
      back: H.p('M70 120 C40 150 30 190 40 210 L176 210 C186 190 176 150 146 120 Z', H.f(white)),
      helm: H.p('M58 50 C40 30 38 6 48 -16 C58 6 68 22 78 34 Z M158 50 C176 30 178 6 168 -16 C158 6 148 22 138 34 Z', H.metal(gold)) + H.p('M100 30 L108 4 L116 30 Z', H.metal(gold)),
      front,
    })];
  },

  alphamon(H) {
    const black = '#3a3448', gold = '#f2c23a', green = '#5af0a0', cape = '#5a4a8a';
    return ['-16 -26 236 236', knight(H, {
      armor: black, trim: gold, eye: '#4ac87a', cape, visor: '#0a0a14', crown: '#2a2438',
      back: H.p('M74 120 C48 90 24 80 4 84 C14 104 30 118 56 132 Z M142 120 C168 90 192 80 212 84 C202 104 186 118 160 132 Z', H.f('#2a2438')),
      helm: H.p('M56 52 C44 30 44 10 54 -8 C62 12 70 26 80 36 Z M160 52 C172 30 172 10 162 -8 C154 12 146 26 136 36 Z', H.metal(gold)) + H.p('M98 30 L108 0 L118 30 Z', H.metal(gold)),
      front: sword(H, 170, 172, 206, 30, '#c8fff0', gold, 12) + H.p('M200 60 L212 30 L218 62 Z', green, 'stroke="none" opacity="0.6"'),
    })];
  },

  gallantmoncm(H) {
    const red = '#d8343a', gold = '#f2c23a', white = '#f4f6fb';
    return ['-30 -30 270 240', knight(H, {
      armor: red, trim: gold, eye: '#ffd23a', crown: gold,
      back: wings(H, white, 5, 1.1),
      helm: H.p('M100 30 L108 -6 L116 30 Z', H.metal(gold)) + H.p('M80 36 L66 4 L92 30 Z M136 36 L150 4 L124 30 Z', H.metal(gold)) + H.p('M56 60 C32 70 20 96 22 128 C36 112 46 98 56 88 Z', H.f('#ffd860')),
      front: H.p('M166 196 L190 20', 'none', `stroke="${H.OUT}" stroke-width="9"`) + H.p('M166 196 L190 20', 'none', `stroke="${gold}" stroke-width="4"`) + H.p('M184 34 L194 -20 L202 36 Z', H.metal('#ffe080')),
    })];
  },

  magnamon(H) {
    const gold = '#f2c23a', blue = '#3a82e0';
    return ['16 -24 186 232', knight(H, {
      armor: gold, trim: '#ffe080', eye: '#e8384a', crown: H.light(gold, 0.3),
      chest: H.p('M98 146 L108 162 L118 146', 'none', `stroke="${blue}" stroke-width="5"`),
      helm: H.p('M96 34 C98 10 106 -10 118 -20 C116 0 116 18 120 34 Z', H.metal('#ffe080')) + H.p('M56 52 L40 30 L64 40 Z M160 52 L176 30 L152 40 Z', H.metal(gold)) + H.p('M92 58 L108 70 L124 58', 'none', `stroke="${blue}" stroke-width="5"`),
      front: H.p('M158 160 L174 152 L176 176 L160 180 Z', H.metal(gold)),
    })];
  },

  ulforceveedramon(H) {
    const blue = '#3a6ad8', white = '#f4f6fb', gold = '#f2c23a', red = '#e8384a';
    return ['-16 -30 236 240', knight(H, {
      armor: blue, trim: white, eye: '#ffd23a', crown: white,
      back: H.p('M82 120 C60 80 30 60 0 56 C14 84 34 108 70 136 Z M134 120 C156 80 186 60 216 56 C202 84 182 108 146 136 Z', H.metal('#9ab8ff')),
      chest: H.p('M96 146 L108 164 L120 146', 'none', `stroke="${gold}" stroke-width="6"`),
      helm: H.p('M104 30 C100 4 108 -16 122 -28 C120 -8 122 10 128 30 Z', H.metal(white)) + H.p('M58 56 L28 30 L66 42 Z M158 56 L188 30 L150 42 Z', H.metal(white)) + H.e(108, 54, 6, 6, H.f(red)),
      front: H.p('M160 166 L196 120 L200 128 L170 176 Z', H.metal('#c8e8ff')),
    })];
  },

  examon(H) {
    const red = '#c8303a', dark = '#3a3448', gold = '#f2c23a', steel = '#c8d0dc';
    return ['-16 -36 246 246', knight(H, {
      armor: red, trim: gold, eye: '#ffd23a', crown: dark,
      back: batWings(H, '#6a2a3a', '#ff8a6a') + H.p('M70 176 C40 186 20 200 -2 196 C16 186 30 172 44 160 Z', H.f(red)),
      helm: H.p('M60 48 C44 22 44 -4 54 -26 C64 -4 72 18 82 34 Z M156 48 C172 22 172 -4 162 -26 C152 -4 144 18 134 34 Z', H.metal('#fff0c8')) + H.p('M150 72 C172 66 196 72 208 86 L164 96 Z', H.metal(red)),
      front: H.p('M160 200 L196 -10', 'none', `stroke="${H.OUT}" stroke-width="16"`) + H.p('M160 200 L196 -10', 'none', `stroke="${steel}" stroke-width="9"`) + H.p('M188 20 L198 -30 L206 22 Z', H.metal(steel)) + H.p('M168 150 L186 150 L184 172 L164 172 Z', H.metal(gold)),
    })];
  },

  craniamon(H) {
    const purple = '#4a3a78', gold = '#f2c23a', steel = '#c8d0dc';
    return ['8 -24 212 230', knight(H, {
      armor: purple, trim: gold, eye: '#e8384a', cape: '#2a2448', visor: '#0a0a14', crown: '#6a5aa8',
      helm: H.p('M54 56 C38 40 34 18 42 0 C52 18 62 30 74 40 Z M162 56 C178 40 182 18 174 0 C164 18 154 30 142 40 Z', H.metal(gold)) + H.p('M98 30 L108 6 L118 30 Z', H.metal(steel)),
      front: H.p('M150 116 L206 116 C208 156 196 182 178 198 C160 182 148 156 150 116 Z', H.metal(purple)) + H.p('M178 128 L178 180 M160 150 L196 150', 'none', `stroke="${gold}" stroke-width="5"`) + H.p('M40 200 L50 20', 'none', `stroke="${H.OUT}" stroke-width="9"`) + H.p('M40 200 L50 20', 'none', `stroke="${steel}" stroke-width="4"`) + H.p('M44 34 L52 -14 L58 36 Z', H.metal(steel)),
    })];
  },

  dynasmon(H) {
    const lav = '#9a7ad8', gold = '#f2c23a', dark = '#4a3a78';
    return ['-16 -28 248 236', knight(H, {
      armor: lav, trim: gold, eye: '#ffd23a', crown: dark,
      back: batWings(H, dark, '#c8a8ff'),
      helm: H.p('M56 52 C34 36 26 12 32 -10 C46 8 58 24 72 36 Z M160 52 C182 36 190 12 184 -10 C170 8 158 24 144 36 Z', H.metal(gold)) + H.p('M150 70 C170 64 192 70 204 82 L162 92 Z', H.metal(lav)),
      front: H.p('M158 160 C166 150 180 148 190 156 L186 178 C176 182 164 180 158 172 Z', H.metal(lav)) + H.claws([[190, 156, -20, 10], [188, 168, 10, 10], [184, 178, 40, 9]]),
    })];
  },

  crusadermon(H) {
    const pink = '#ff8ab4', gold = '#f2c23a', white = '#fff4f8', steel = '#c8d0dc';
    return ['-10 -20 236 230', knight(H, {
      armor: pink, trim: gold, eye: '#3a82e0', crown: white, visor: '#3a1a40',
      back: H.p('M80 130 C50 120 20 140 0 170 C30 160 50 160 70 166 Z M136 130 C166 120 196 140 216 170 C186 160 166 160 146 166 Z', H.f('#ffd0e4')),
      helm: H.p('M98 30 C92 8 98 -10 110 -20 C112 0 118 12 126 24 Z', H.f(white)) + H.p('M60 58 C40 70 30 92 30 116 C44 102 52 90 62 82 Z M156 58 C176 70 186 92 186 116 C172 102 164 90 154 82 Z', H.f('#ffd0e4')),
      front: H.p('M156 150 L196 150 L196 172 L156 172 Z', H.metal(pink)) + H.p('M196 156 L214 156 L214 166 L196 166 Z', H.metal(steel)) + H.p('M40 150 L64 146 L66 170 L42 174 Z', H.metal(pink)),
    })];
  },

  sleipmon(H) {
    const silver = '#dce4f0', blue = '#3a6ad8', red = '#e8384a', gold = '#f2c23a';
    return ['-6 -24 232 234', knight(H, {
      armor: silver, trim: blue, eye: '#e8384a', crown: blue,
      back: H.p('M78 170 C56 180 40 196 30 210 L60 210 C70 196 80 186 92 180 Z', H.f('#8a9ab8')),
      helm: H.p('M58 54 L40 20 L72 40 Z M158 54 L176 20 L144 40 Z', H.metal(silver)) + H.p('M100 30 C98 6 106 -12 118 -20 C116 0 118 16 124 30 Z', H.f(red)) + H.p('M148 70 C168 66 190 72 204 84 L162 94 Z', H.metal(silver)),
      front: H.p('M150 150 L210 138 L212 150 L152 164 Z', H.metal(gold)) + H.p('M196 112 C214 130 214 160 200 180', 'none', `stroke="${H.OUT}" stroke-width="9"`) + H.p('M196 112 C214 130 214 160 200 180', 'none', `stroke="${silver}" stroke-width="4"`) + H.p('M196 112 L180 144 L200 180', 'none', 'stroke-width="2"'),
    })];
  },

  jesmon(H) {
    const white = '#f4f6fb', red = '#d8343a', gold = '#f2c23a', steel = '#e4ecf8';
    return ['-10 -24 238 234', knight(H, {
      armor: white, trim: gold, eye: '#e8384a', cape: red, crown: '#c8d0dc',
      back: H.p('M70 110 C44 70 40 30 50 0 C66 30 80 70 88 104 Z', H.f(red)),
      helm: H.p('M58 54 C46 30 46 6 56 -14 C64 8 72 24 82 36 Z M158 54 C170 30 170 6 160 -14 C152 8 144 24 134 36 Z', H.metal(steel)) + H.p('M100 30 L108 4 L116 30 Z', H.metal(gold)),
      arms: tube(H, 'M80 150 C66 152 58 158 54 166', white, 13),
      front: sword(H, 140, 154, 214, 120, steel, gold, 12) + sword(H, 56, 166, 14, 196, steel, gold, 10),
    })];
  },

  leopardmon(H) {
    const gold = '#e8c060', spot = '#8a5a2a', white = '#f4f6fb', steel = '#e4ecf8';
    const spots = [[74, 52], [92, 40], [140, 44], [150, 58], [84, 160], [130, 168]].map(([x, y]) => H.e(x, y, 4, 3.4, spot, 'stroke="none"')).join('');
    return ['-10 -20 236 230', knight(H, {
      armor: gold, trim: white, eye: '#4ac87a', crown: gold, face: 'open', skin: '#fff0d8',
      helmBack: H.p('M56 50 L46 14 L80 34 Z M160 50 L170 14 L136 34 Z', H.f(gold)),
      helm: spots + H.p('M104 112 l4 4 l4 -4', 'none', 'stroke-width="2.4"') + H.p('M58 100 L40 96 M58 108 L40 110 M158 100 L176 96 M158 108 L176 110', 'none', 'stroke-width="2.4"'),
      front: sword(H, 150, 160, 210, 60, steel, '#3a3448', 10) + H.p('M76 128 C58 156 52 186 58 206 L70 206 C66 186 70 156 84 132 Z', H.f(white)),
    })];
  },

  gankoomon(H) {
    const gold = '#f2c23a', hair = '#fbfbff', red = '#e8384a', skin = '#ffd8b8', robe = '#3a3448';
    return ['0 -24 222 234', knight(H, {
      armor: robe, trim: gold, eye: '#e8384a', crown: hair, face: 'open', skin,
      cape: '#7a2a2a',
      helmBack: H.p('M44 96 L18 78 L36 64 L10 42 L40 36 L24 6 L56 14 L56 -16 L84 2 L96 -26 L112 -2 L132 -24 L140 4 L170 -10 L166 20 L198 22 L180 46 L206 62 L180 74 L196 96 Z', H.f(hair)),
      helm: H.p('M62 64 C76 56 90 58 98 66 M118 66 C126 58 140 56 154 64', 'none', `stroke="${H.OUT}" stroke-width="5"`) + H.e(108, 52, 8, 6, H.f(red)),
      front: tube(H, 'M136 150 C152 146 162 138 168 128', robe, 13) + H.e(172, 122, 14, 12, H.f(skin))
        // little Hinukamuy companion
        + H.e(40, 186, 18, 15, H.f('#f4f6fb')) + H.p('M26 176 L24 160 L34 172 Z M54 176 L58 160 L46 172 Z', H.f('#f4f6fb')) + H.eye(36, 184, 4, 5, '#3a3448') + H.eye(48, 184, 4, 5, '#3a3448') + H.e(42, 192, 2.4, 2, H.OUT, 'stroke="none"'),
    })];
  },
};
