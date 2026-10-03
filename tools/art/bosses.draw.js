// The 15 normal bosses (chibi villains). All face right; the game mirrors them.
'use strict';
const tube = (H, d, c, w = 12) => H.p(d, 'none', `stroke="${H.OUT}" stroke-width="${w}"`) + H.p(d, 'none', `stroke="${c}" stroke-width="${w - 6}"`);
const fangs = (H, x, y, w = 30) => H.p(`M${x - w / 2} ${y} C${x - w / 4} ${y + 9} ${x + w / 4} ${y + 9} ${x + w / 2} ${y - 2}`, 'none', 'stroke-width="3.2"') + H.p(`M${x - w / 3} ${y + 3} l3 7 l3 -6 Z M${x + w / 6} ${y + 4} l3 7 l3 -7 Z`, '#fff', 'stroke-width="1.8"');
const brows = (H, x1, x2, y) => H.p(`M${x1 - 12} ${y - 6} L${x1 + 12} ${y + 2} M${x2 - 10} ${y + 2} L${x2 + 12} ${y - 6}`, 'none', 'stroke-width="4.6"');
const evil = (H, x1, x2, y, c, r = 11) => H.eye(x1, y, r, r * 1.1, c, { pupil: 0.24, slit: true }) + H.eye(x2, y, r * 0.85, r, c, { pupil: 0.24, slit: true }) + brows(H, x1, x2, y - r - 4);
const bat = (H, c, inner, k = 1) => {
  const L = (x) => 108 - (108 - x) * k, R = (x) => 108 + (x - 108) * k;
  return H.p(`M${L(80)} 118 C${L(52)} 72 ${L(22)} 50 ${L(-6)} 44 C${L(2)} 64 ${L(8)} 82 ${L(20)} 96 C${L(6)} 98 ${L(-2)} 106 ${L(-6)} 118 C${L(10)} 118 ${L(22)} 122 ${L(32)} 130 C${L(20)} 134 ${L(12)} 142 ${L(8)} 152 C${L(34)} 148 ${L(56)} 144 ${L(78)} 142 Z`, H.f(c))
    + H.p(`M${R(136)} 118 C${R(164)} 72 ${R(194)} 50 ${R(222)} 44 C${R(214)} 64 ${R(208)} 82 ${R(196)} 96 C${R(210)} 98 ${R(218)} 106 ${R(222)} 118 C${R(206)} 118 ${R(194)} 122 ${R(184)} 130 C${R(196)} 134 ${R(204)} 142 ${R(208)} 152 C${R(182)} 148 ${R(160)} 144 ${R(138)} 142 Z`, H.f(c))
    + (inner ? H.p(`M${L(76)} 128 C${L(56)} 98 ${L(34)} 80 ${L(14)} 74 C${L(30)} 100 ${L(50)} 120 ${L(74)} 136 Z M${R(140)} 128 C${R(160)} 98 ${R(182)} 80 ${R(202)} 74 C${R(186)} 100 ${R(166)} 120 ${R(142)} 136 Z`, inner, 'stroke="none" opacity="0.7"') : '');
};

module.exports = {
  devimon(H) {
    const b = '#2a2438', red = '#e8384a', horn = '#e4dcc8', strap = '#8a7a6a';
    let s = bat(H, '#3a3448', '#6a3a5a', 1.05);
    s += H.e(108, 162, 34, 32, H.f(b));
    s += H.p('M78 156 L138 170 M78 170 L138 156', 'none', `stroke="${strap}" stroke-width="4"`);
    s += H.p('M90 188 L84 204 L106 204 Z M120 188 L118 204 L140 204 Z', H.f(b));
    s += tube(H, 'M140 150 C164 150 178 160 186 176', b, 13) + H.claws([[188, 178, 50, 12], [184, 182, 90, 11], [180, 180, 120, 10]], '#e8e0f0');
    s += tube(H, 'M76 150 C60 156 52 166 48 180', b, 13);
    s += H.p('M58 58 C34 50 24 26 34 4 C44 20 56 34 72 40 Z M158 58 C182 50 192 26 182 4 C172 20 160 34 144 40 Z', H.f(horn));
    s += H.e(108, 84, 62, 56, H.f(b));
    s += H.p('M58 74 C76 64 140 64 158 74', 'none', `stroke="${red}" stroke-width="3"`);
    s += evil(H, 92, 128, 90, red);
    s += fangs(H, 112, 114, 32);
    return ['-10 -6 236 216', s];
  },

  metaletemon(H) {
    const chrome = '#c8d0dc', fur = '#c8a878', glass = '#1a1424';
    let s = '';
    s += H.p('M76 170 C50 180 34 170 26 150 C40 156 54 156 66 150 Z', H.metal(chrome));
    s += H.e(108, 160, 38, 34, H.metal(chrome));
    s += H.e(108, 168, 22, 20, H.metal('#e8eef8'), 'stroke="none"');
    s += H.p('M88 186 L82 204 L106 204 Z M120 186 L118 204 L142 204 Z', H.metal(chrome));
    // microphone
    s += tube(H, 'M142 150 C156 146 164 138 168 128', chrome, 13) + H.p('M168 128 L176 96', 'none', 'stroke-width="5"') + H.e(178, 88, 10, 12, H.metal('#3a3448'));
    s += tube(H, 'M74 150 C60 156 52 166 50 178', chrome, 13);
    s += H.e(108, 84, 66, 58, H.metal(chrome));
    s += H.e(40, 84, 14, 18, H.metal(chrome)) + H.e(176, 84, 14, 18, H.metal(chrome));
    s += H.p('M58 92 C60 70 84 60 108 60 C132 60 156 70 158 92 C158 118 136 134 108 134 C80 134 58 118 58 92 Z', H.f(fur));
    s += H.p('M60 80 L156 80 L150 98 L120 98 L108 90 L96 98 L66 98 Z', glass);
    s += H.p('M70 84 L88 84', 'none', 'stroke="#fff" stroke-width="3" opacity="0.7"');
    s += fangs(H, 108, 114, 34);
    s += H.p('M60 30 C80 20 100 22 108 30 C116 22 136 20 156 30', 'none', 'stroke-width="4"');
    return ['14 -4 192 214', s];
  },

  myotismon(H) {
    const navy = '#2a3a78', gold = '#f2c23a', red = '#d8343a', skin = '#e8e4f4', hair = '#ffe080';
    let s = '';
    // cape with red lining
    s += H.p('M60 110 C30 140 20 180 26 206 L190 206 C196 180 186 140 156 110 Z', H.f('#2a2438'));
    s += H.p('M72 120 C52 146 46 180 50 206 L166 206 C170 180 164 146 144 120 Z', H.f(red));
    s += H.e(108, 162, 30, 30, H.f(navy));
    s += H.p('M96 140 L108 160 L120 140', 'none', `stroke="${gold}" stroke-width="4"`);
    s += H.p('M92 188 L88 204 L106 204 Z M118 188 L116 204 L134 204 Z', H.f(navy));
    s += tube(H, 'M134 152 C150 148 160 140 166 130', navy, 12) + H.e(168, 126, 8, 8, H.f('#f4f6fb'));
    s += H.p('M48 74 C40 50 56 26 84 18 C100 12 124 12 140 18 C164 28 176 52 168 76 Z', H.f(hair));
    s += H.e(108, 88, 56, 52, H.f(skin));
    s += H.p('M54 76 C70 62 146 62 162 76 L156 98 C140 88 76 88 60 98 Z', H.metal(gold));
    s += H.p('M100 60 L108 46 L116 60 Z', H.f(red));
    s += H.e(88, 82, 9, 6, '#1a1424') + H.e(128, 82, 9, 6, '#1a1424') + H.e(90, 82, 4, 4, red, 'stroke="none"') + H.e(130, 82, 4, 4, red, 'stroke="none"');
    s += fangs(H, 110, 114, 26);
    s += H.p('M54 104 C40 96 26 96 14 104 M162 104 C176 96 190 96 202 104', 'none', `stroke="${gold}" stroke-width="4"`);
    return ['10 0 200 210', s];
  },

  kimeramon(H) {
    const pale = '#f0e8e4', orange = '#ff9a3a', red = '#d8343a', insect = '#7a4ab8', bone = '#fff4d8';
    let s = '';
    s += H.p('M78 118 C50 86 18 70 -6 72 C10 94 36 114 70 134 Z', H.f('#f4f6fb'));
    s += bat(H, red, '#ff8a6a', 0.9);
    s += H.e(108, 162, 36, 32, H.f(pale));
    s += H.p('M80 150 L136 150', 'none', `stroke="${H.dark(pale, 0.3)}" stroke-width="3"`);
    s += H.p('M90 188 L84 204 L106 204 Z M120 188 L118 204 L140 204 Z', H.f(insect));
    s += tube(H, 'M140 146 C160 136 172 126 180 112', insect, 12) + tube(H, 'M142 162 C164 162 176 170 184 182', insect, 12);
    s += H.claws([[182, 110, -60, 10], [186, 184, 40, 10]]);
    s += tube(H, 'M76 150 C60 156 52 166 48 180', pale, 13);
    // Greymon-skull-like head
    s += H.p('M42 88 C42 50 70 26 106 26 C136 26 158 42 166 62 C186 66 202 78 204 94 C204 110 186 120 164 122 C140 132 80 132 60 122 C48 114 42 102 42 88 Z', H.f(orange));
    s += H.p('M62 62 C70 40 92 30 118 32 C140 34 156 46 162 62 C140 56 120 56 100 60 C86 62 72 64 62 62 Z', H.f(bone));
    s += H.p('M80 34 L72 8 L94 28 Z M114 30 L114 4 L128 30 Z', H.f(bone));
    s += evil(H, 114, 150, 76, '#ffd23a', 10);
    s += H.p('M120 104 l4 8 l4 -8 M150 104 l4 8 l4 -8 M178 102 l4 8 l4 -8', '#fff', 'stroke-width="1.8"');
    s += H.p('M112 100 C140 108 176 108 200 98', 'none', 'stroke-width="3"');
    return ['-10 -6 230 216', s];
  },

  metalseadramon(H) {
    const chrome = '#7aa6e0', light = '#e4ecf8', gold = '#f2c23a';
    let s = '';
    s += H.p('M0 196 C10 170 40 156 60 170 C80 184 100 196 130 184 C150 176 160 160 156 140', 'none', `stroke="${H.OUT}" stroke-width="42"`);
    s += H.p('M0 196 C10 170 40 156 60 170 C80 184 100 196 130 184 C150 176 160 160 156 140', 'none', `stroke="${chrome}" stroke-width="34"`);
    s += H.p('M4 186 C14 168 40 160 58 172 M80 186 C100 196 120 194 140 180', 'none', `stroke="${light}" stroke-width="6" opacity="0.8"`);
    s += H.p('M60 156 L54 136 L72 150 Z M100 180 L100 160 L114 176 Z', H.metal(gold));
    s += H.p('M60 64 C40 54 30 34 34 14 C46 28 58 38 72 44 Z M76 40 C70 18 76 0 90 -10 C90 10 96 20 106 26 Z', H.metal(light));
    s += H.p('M60 90 C60 50 90 26 124 26 C156 26 178 44 186 68 C204 72 216 84 214 100 C212 114 196 122 176 122 C150 132 100 132 82 124 C68 116 60 104 60 90 Z', H.metal(chrome));
    // nose cannon
    s += H.p('M196 80 L232 76 L232 96 L200 100 Z', H.metal(light)) + H.e(232, 86, 4, 9, '#7ad0ff');
    s += H.p('M90 50 C110 42 150 42 170 56', 'none', `stroke="${gold}" stroke-width="4"`);
    s += evil(H, 128, 158, 74, '#e8384a', 10);
    s += H.p('M126 108 C150 114 180 114 204 106', 'none', 'stroke-width="3"') + H.p('M146 108 l4 8 l4 -8 M176 108 l4 8 l4 -8', '#fff', 'stroke-width="1.8"');
    return ['-16 -18 256 236', s];
  },

  puppetmon(H) {
    const wood = '#e8b878', hair = '#ffd860', green = '#3a8a4a', red = '#e8384a', skin = '#fff0dc';
    let s = '';
    // hammer (cross-shaped mallet)
    s += H.p('M160 160 L186 40', 'none', `stroke="${H.OUT}" stroke-width="10"`) + H.p('M160 160 L186 40', 'none', `stroke="${wood}" stroke-width="5"`);
    s += H.p('M166 40 L210 30 L214 56 L170 64 Z', H.f('#a8784a'));
    s += H.e(108, 162, 30, 30, H.f(green));
    s += H.p('M94 140 C102 150 114 150 122 140 L120 136 L96 136 Z', H.f(red));
    s += H.p('M92 188 L86 204 L106 204 Z M118 188 L116 204 L136 204 Z', H.f(wood));
    s += H.e(92, 176, 4, 4, H.f(wood)) + H.e(124, 176, 4, 4, H.f(wood));
    s += tube(H, 'M134 152 C148 156 156 158 162 158', wood, 11) + tube(H, 'M82 152 C68 156 60 164 56 172', wood, 11);
    // puppet strings
    s += H.p('M60 0 L56 172 M160 -10 L162 158', 'none', 'stroke="#f4f6fb" stroke-width="1.4" opacity="0.7"');
    s += H.p('M42 92 C32 60 52 26 92 22 C130 18 170 40 174 84 C160 66 140 58 118 58 C92 58 64 66 42 92 Z', H.f(hair));
    s += H.e(108, 92, 56, 50, H.f(skin));
    s += H.p('M54 76 C64 50 90 40 112 40 C136 40 158 52 164 74 C150 64 134 60 112 60 C90 60 70 66 54 76 Z', H.f(hair));
    s += H.p('M60 46 C70 20 100 8 130 14 C150 18 160 30 162 46 C140 38 90 38 60 46 Z', H.f(green));
    s += H.p('M164 56 C182 54 196 46 204 34 C206 50 192 64 168 68 Z', H.f(green));
    s += evil(H, 92, 126, 92, '#3a82e0', 10);
    s += H.e(146, 106, 6, 5, H.f('#e8a878')) + fangs(H, 110, 118, 26);
    s += H.blush(76, 108) + H.blush(140, 110, 7, 4);
    return ['14 -6 210 216', s];
  },

  machinedramon(H) {
    const steel = '#a8b4c4', dark = '#5a6474', red = '#e8384a';
    let s = '';
    // two giant cannons on the back
    s += H.p('M60 120 L28 30 L52 22 L82 112 Z M156 120 L188 30 L164 22 L134 112 Z', H.metal(dark));
    s += H.e(40, 26, 13, 7, '#1a1424') + H.e(176, 26, 13, 7, '#1a1424');
    s += H.p('M70 176 C44 184 20 176 6 158 C26 162 46 160 64 154 Z', H.metal(steel));
    s += H.e(108, 160, 40, 34, H.metal(steel));
    s += H.p('M80 150 L136 150 M84 168 L132 168', 'none', `stroke="${dark}" stroke-width="3"`);
    s += H.p('M86 186 L80 204 L106 204 L102 186 Z M118 186 L116 204 L142 204 L134 186 Z', H.metal(dark));
    s += tube(H, 'M142 150 C156 148 164 142 170 134', steel, 13) + H.claws([[172, 132, -40, 10], [174, 138, 0, 10]], '#e4ecf8');
    s += H.p('M44 88 C44 54 70 32 104 32 C132 32 154 44 164 64 C186 66 204 78 206 94 C206 110 188 120 166 122 C140 132 82 132 62 122 C50 114 44 102 44 88 Z', H.metal(steel));
    s += H.p('M60 66 C76 52 100 46 124 48 C146 50 158 58 164 66 L60 72 Z', H.metal(dark));
    s += H.p('M110 76 L146 72 L144 86 L112 90 Z', '#1a1424') + H.e(132, 80, 6, 4, red, 'stroke="none"');
    s += H.p('M112 102 C140 110 176 110 200 100', 'none', 'stroke-width="3"') + H.p('M130 104 l4 8 l4 -8 M158 106 l4 8 l4 -8 M184 104 l4 8 l4 -8', '#fff', 'stroke-width="1.8"');
    s += H.p('M70 90 L90 94 M70 104 L94 104', 'none', `stroke="${dark}" stroke-width="3"`);
    return ['-4 8 220 202', s];
  },

  piedmon(H) {
    const red = '#d8343a', black = '#2a2438', white = '#f4f6fb', gold = '#f2c23a', steel = '#e4ecf8';
    let s = '';
    // four swords on the back
    for (let i = 0; i < 4; i++) { const x = 64 + i * 26; s += H.p(`M${x} 120 L${x - 10 + i * 6} 6 L${x + 2 + i * 6} 6 Z`, H.metal(steel)) + H.p(`M${x - 8} 112 L${x + 10} 112`, 'none', `stroke="${gold}" stroke-width="5"`); }
    s += H.p('M76 130 C60 160 56 190 62 206 L154 206 C160 190 156 160 140 130 Z', H.f(black));
    s += H.e(108, 162, 32, 30, H.f(red));
    s += H.p('M90 140 L108 160 L126 140', 'none', `stroke="${gold}" stroke-width="4"`);
    s += H.p('M92 188 L86 204 L106 204 Z M118 188 L116 204 L136 204 Z', H.f(black));
    s += tube(H, 'M136 152 C150 148 158 142 164 134', red, 12) + H.e(166, 130, 9, 9, H.f(white));
    s += tube(H, 'M80 152 C66 156 58 164 54 172', red, 12) + H.e(52, 176, 9, 9, H.f(white));
    // jester hat
    s += H.p('M56 60 C40 40 20 36 6 44 C20 54 34 66 48 78 Z M160 60 C176 40 196 36 210 44 C196 54 182 66 168 78 Z', H.f(red)) + H.e(6, 44, 6, 6, H.f(gold)) + H.e(210, 44, 6, 6, H.f(gold));
    s += H.p('M58 64 C64 36 86 22 108 22 C130 22 152 36 158 64 Z', H.f(black));
    s += H.e(108, 90, 54, 48, H.f(white));
    s += H.p('M62 82 C64 98 74 110 86 116 L92 92 Z', H.f(black), 'opacity="0.9"');
    s += H.p('M80 74 L88 66 L96 74 L88 82 Z', H.f(red)) + H.star(130, 74, 8, 3.4, 4, H.f(gold));
    s += H.eye(92, 92, 9, 11, gold, { pupil: 0.24, slit: true }) + H.eye(130, 92, 9, 11, gold, { pupil: 0.24, slit: true });
    s += H.p('M88 112 C100 124 124 124 136 110', 'none', `stroke="${red}" stroke-width="4"`);
    return ['-6 -4 226 214', s];
  },

  venommyotismon(H) {
    const purple = '#6a3a98', dark = '#3a1a58', red = '#d8343a', horn = '#e4dcc8', green = '#7ad858';
    let s = bat(H, dark, '#a85ad8', 1.08);
    s += H.e(108, 156, 46, 40, H.f(purple));
    // demon face on the belly
    s += H.e(108, 162, 26, 20, H.f(dark));
    s += H.e(98, 158, 5, 4, green, 'stroke="none"') + H.e(118, 158, 5, 4, green, 'stroke="none"') + H.p('M96 170 L100 176 L104 170 L108 176 L112 170 L116 176 L120 170', 'none', 'stroke="#fff" stroke-width="2"');
    s += H.p('M80 186 L72 204 L102 204 Z M116 186 L114 204 L144 204 Z', H.f(purple));
    s += H.claws([[100, 204, 10, 8], [142, 204, 10, 8]]);
    s += tube(H, 'M150 144 C168 140 180 148 188 160', purple, 15) + H.claws([[190, 162, 40, 12], [186, 168, 80, 11], [182, 168, 110, 10]]);
    s += H.p('M54 62 C30 46 22 18 32 -6 C44 14 58 30 74 40 Z M162 62 C186 46 194 18 184 -6 C172 14 158 30 142 40 Z', H.f(horn));
    s += H.e(108, 82, 62, 54, H.f(purple));
    s += H.p('M100 34 L108 18 L116 34 Z', H.f(horn));
    s += evil(H, 92, 128, 84, '#ffd23a');
    s += H.p('M80 108 C96 126 124 126 140 106 L134 102 C120 112 100 112 86 104 Z', '#3a0a1a') + H.p('M88 106 l3 8 l3 -6 M126 106 l3 8 l3 -8', '#fff', 'stroke-width="1.8"');
    return ['-16 -14 248 224', s];
  },

  blackwargreymon(H) {
    const black = '#3a3448', steel = '#8a96a8', shield = '#6a2a3a', red = '#e8384a', skin = '#a8784a';
    let s = '';
    s += H.p('M30 70 L84 64 L92 150 L52 168 L22 132 Z', H.metal(shield)) + H.p('M186 70 L132 64 L124 150 L164 168 L194 132 Z', H.metal(shield));
    s += H.star(52, 112, 14, 6, 8, H.f(steel)) + H.star(164, 112, 14, 6, 8, H.f(steel));
    s += H.e(108, 162, 32, 30, H.f(skin));
    s += H.p('M84 146 C96 138 120 138 132 146 L128 168 L88 168 Z', H.metal(black));
    s += H.p('M90 186 L84 204 L106 204 L102 186 Z M118 186 L116 204 L138 204 L132 186 Z', H.metal(black));
    s += tube(H, 'M136 150 C150 150 158 156 162 164', skin, 12) + H.p('M154 156 L180 152 L182 174 L158 178 Z', H.metal(black)) + H.p('M180 156 L200 152 M180 164 L202 164 M180 172 L198 176', 'none', `stroke="${steel}" stroke-width="4"`);
    s += H.e(108, 84, 62, 56, H.metal(black));
    s += H.p('M60 46 C42 30 36 8 44 -12 C54 8 64 22 76 34 Z M156 46 C174 30 180 8 172 -12 C162 8 152 22 140 34 Z', H.metal(steel));
    s += H.p('M100 32 L108 4 L116 32 Z', H.metal(steel));
    s += H.p('M60 82 C76 74 140 74 156 82 L150 108 C130 118 86 118 66 108 Z', H.f(skin));
    s += evil(H, 92, 128, 92, red, 9);
    s += H.p('M100 112 C106 116 114 116 120 112', 'none', 'stroke-width="3"');
    return ['14 -16 192 224', s];
  },

  daemon(H) {
    const red = '#a8283a', dark = '#3a1a28', skin = '#3a3448', horn = '#e4dcc8';
    let s = bat(H, '#5a1a2a', '#e8384a', 1);
    // hooded robe
    s += H.p('M66 110 C46 146 40 186 46 206 L170 206 C176 186 170 146 150 110 Z', H.f(red));
    s += H.p('M84 130 L108 160 L132 130', 'none', `stroke="${dark}" stroke-width="4"`);
    s += tube(H, 'M146 140 C164 142 176 152 182 166', red, 14) + H.claws([[184, 168, 50, 11], [180, 172, 90, 10]], '#e8e0f0');
    s += H.p('M50 70 C40 30 70 6 108 6 C146 6 176 30 166 70 C176 100 166 130 148 140 L68 140 C50 130 40 100 50 70 Z', H.f(red));
    s += H.p('M60 40 C50 18 50 -2 60 -18 C66 2 74 16 84 26 Z M156 40 C166 18 166 -2 156 -18 C150 2 142 16 132 26 Z', H.f(horn));
    s += H.e(108, 92, 44, 42, H.f(dark));
    s += H.e(108, 96, 34, 32, H.f(skin));
    s += evil(H, 94, 124, 94, '#ffd23a', 9);
    s += fangs(H, 110, 114, 22);
    return ['-10 -24 236 234', s];
  },

  beelzemon(H) {
    const black = '#2a2438', purple = '#6a3a98', skin = '#8a7aa8', red = '#e8384a', silver = '#c8d0dc', hair = '#f4f6fb';
    let s = '';
    s += H.p('M80 110 C50 70 20 60 -6 66 C10 86 30 100 60 116 C40 116 24 124 14 138 C40 136 60 134 80 132 Z', H.f(black)) + H.p('M136 110 C166 70 196 60 222 66 C206 86 186 100 156 116 C176 116 192 124 202 138 C176 136 156 134 136 132 Z', H.f(black));
    s += H.e(108, 162, 30, 30, H.f(black));
    s += H.p('M92 142 L108 158 L124 142', 'none', `stroke="${silver}" stroke-width="3"`);
    s += H.p('M90 186 L84 204 L106 204 L102 186 Z M118 186 L116 204 L138 204 L132 186 Z', H.f(black));
    // shotguns
    s += tube(H, 'M134 152 C148 152 156 154 160 158', skin, 11) + H.p('M154 150 L208 144 L208 156 L156 162 Z', H.metal('#5a6474'));
    s += tube(H, 'M82 152 C68 156 60 162 56 170', skin, 11);
    s += H.p('M48 80 C40 50 56 26 84 18 C100 12 124 12 140 18 C168 28 180 54 172 84 L160 70 L150 84 L140 66 L66 66 L58 84 Z', H.f(hair));
    s += H.e(108, 92, 54, 50, H.f(skin));
    // skull helmet mask
    s += H.p('M54 82 C56 52 80 34 108 34 C136 34 160 52 162 82 L156 96 L60 96 Z', H.metal(purple));
    s += H.e(108, 60, 14, 10, H.f(silver)) + H.e(103, 58, 3, 3, black, 'stroke="none"') + H.e(113, 58, 3, 3, black, 'stroke="none"');
    s += H.p('M60 50 L46 24 L74 40 Z M156 50 L170 24 L142 40 Z', H.f(silver));
    s += evil(H, 92, 126, 100, red, 9);
    s += H.p('M100 120 C106 126 116 124 120 118', 'none', 'stroke-width="3"') + H.p('M74 108 L66 124 M142 108 L150 124', 'none', `stroke="${red}" stroke-width="3"`);
    return ['-10 0 236 210', s];
  },

  megidramon(H) {
    const red = '#9a1a2a', black = '#2a1a28', gold = '#f2c23a', horn = '#e4dcc8';
    let s = bat(H, black, '#e8384a', 1.12);
    s += H.p('M72 176 C46 186 20 180 2 164 C24 164 46 160 64 152 Z', H.f(red));
    s += H.e(108, 160, 36, 32, H.f(red));
    s += H.p('M90 142 C100 136 116 136 126 142 L122 164 L94 164 Z', H.metal(gold));
    s += H.p('M88 186 L82 204 L106 204 L102 186 Z M118 186 L116 204 L140 204 L134 186 Z', H.f(red));
    s += H.claws([[106, 204, 10, 8], [140, 204, 10, 8]]);
    s += tube(H, 'M140 150 C156 148 164 142 170 134', red, 13) + H.claws([[172, 132, -40, 10], [174, 138, 0, 10]]);
    s += H.p('M60 44 C40 30 32 6 40 -18 C50 2 62 18 76 30 Z M90 30 C84 10 88 -10 100 -22 C102 0 106 14 112 26 Z', H.f(horn));
    s += H.p('M42 88 C42 50 70 26 106 26 C136 26 158 42 166 62 C186 66 202 78 204 94 C204 110 186 120 164 122 C140 132 80 132 60 122 C48 114 42 102 42 88 Z', H.f(red));
    s += H.p('M60 60 C80 44 120 40 150 52 L156 66 C130 58 90 60 64 70 Z', H.metal(gold));
    s += evil(H, 114, 150, 80, '#ffd23a', 10);
    s += H.p('M110 102 C140 112 176 112 202 100', 'none', 'stroke-width="3"') + H.p('M124 104 l4 9 l4 -9 M152 108 l4 9 l4 -9 M180 104 l4 9 l4 -9', '#fff', 'stroke-width="1.8"');
    return ['-20 -26 256 236', s];
  },

  apocalymon(H) {
    const orb = '#c8584a', blue = '#3a5ab8', claw = '#5a3a6a', skin = '#7a8ab8';
    let s = '';
    // claw tentacles from the orb
    const arm = (d) => tube(H, d, claw, 14);
    s += arm('M60 150 C30 140 10 110 8 80') + arm('M64 176 C30 186 10 200 -4 204') + arm('M156 150 C186 140 206 110 208 80') + arm('M152 176 C186 186 206 200 220 204');
    s += H.claws([[8, 80, -100, 12], [8, 80, -60, 12], [208, 80, -80, 12], [208, 80, -120, 12], [-4, 204, 180, 10], [220, 204, 0, 10]], '#e8e0f0');
    // big orb body
    s += H.e(108, 164, 56, 44, H.f(orb));
    s += H.p('M60 160 C80 150 136 150 156 160', 'none', `stroke="${H.dark(orb, 0.3)}" stroke-width="4"`);
    s += H.e(84, 180, 6, 6, H.f('#ffd23a')) + H.e(132, 180, 6, 6, H.f('#ffd23a'));
    // humanoid top
    s += tube(H, 'M132 112 C146 110 156 104 162 96', skin, 11) + tube(H, 'M84 112 C70 110 60 104 54 96', skin, 11);
    s += H.p('M88 104 L128 104 L124 132 L92 132 Z', H.f(skin));
    s += H.p('M60 60 C56 30 80 10 108 10 C136 10 160 30 156 60 L150 80 L66 80 Z', H.f(blue));
    s += H.e(108, 72, 44, 40, H.f(skin));
    s += H.p('M68 62 C80 54 136 54 148 62 L144 76 L72 76 Z', H.f('#1a1424'));
    s += H.e(92, 68, 8, 4, '#e8384a', 'stroke="none"') + H.e(124, 68, 8, 4, '#e8384a', 'stroke="none"');
    s += fangs(H, 108, 94, 26);
    s += H.p('M100 10 L108 -8 L116 10 Z', H.f('#e8384a'));
    return ['-16 -14 248 228', s];
  },

  malomyotismon(H) {
    const black = '#2a2438', purple = '#5a3a88', mask = '#f4f6fb', red = '#e8384a', gold = '#f2c23a';
    let s = bat(H, black, '#6a4ab8', 1.06);
    s += H.e(108, 162, 34, 32, H.f(purple));
    s += H.p('M80 150 C96 144 120 144 136 150', 'none', `stroke="${gold}" stroke-width="3"`);
    s += H.p('M90 186 L84 204 L106 204 Z M120 186 L118 204 L140 204 Z', H.f(black));
    s += H.claws([[106, 204, 10, 8], [140, 204, 10, 8]]);
    s += tube(H, 'M140 150 C160 148 172 156 180 168', purple, 14) + H.claws([[182, 170, 40, 11], [178, 174, 80, 10], [174, 174, 110, 9]], '#e8e0f0');
    s += H.p('M56 60 C40 40 38 14 48 -6 C58 14 68 30 80 40 Z M160 60 C176 40 178 14 168 -6 C158 14 148 30 136 40 Z', H.f(black));
    s += H.e(108, 84, 62, 56, H.f(purple));
    // white bat mask
    s += H.p('M50 70 C66 58 92 60 108 72 C124 60 150 58 166 70 L156 100 C136 92 120 96 108 104 C96 96 80 92 60 100 Z', H.f(mask));
    s += H.eye(88, 82, 9, 8, red, { pupil: 0.22, slit: true }) + H.eye(128, 82, 9, 8, red, { pupil: 0.22, slit: true });
    s += fangs(H, 108, 116, 30);
    return ['-16 -14 248 224', s];
  },
};
