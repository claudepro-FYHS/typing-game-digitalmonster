// Mega forms of the partners (chibi). Big head, small body, signature gear.
'use strict';
const tube = (H, d, c, w = 12) => H.p(d, 'none', `stroke="${H.OUT}" stroke-width="${w}"`) + H.p(d, 'none', `stroke="${c}" stroke-width="${w - 6}"`);
module.exports = {
  metalgarurumon(H) {
    const m = '#7aa6e0', d = '#3a5aa8', gold = '#e8c040', blade = '#c8e4ff';
    let s = '';
    // blade wings on the back
    s += H.p('M70 110 L18 48 L30 46 L80 96 Z M66 120 L4 84 L14 78 L76 108 Z M64 132 L2 120 L8 112 L74 122 Z', H.metal(blade));
    // metal tail
    s += H.p('M64 170 C42 172 22 162 12 144 C30 146 46 148 60 150 Z', H.metal(m));
    // body (sitting) + front paws with claws
    s += H.e(110, 158, 40, 34, H.metal(m));
    s += H.p('M80 146 C96 138 124 138 140 146 L136 166 C120 172 100 172 84 166 Z', H.metal('#e4ecf8'));
    s += H.p('M110 140 L110 170', 'none', `stroke="${d}" stroke-width="2.6"`);
    s += H.p('M86 172 L84 196 L106 196 L106 172 Z', H.metal(m)) + H.p('M126 172 L126 196 L148 196 L146 172 Z', H.metal(m));
    s += H.claws([[104, 198, 20, 9], [98, 202, 60, 8], [146, 198, 20, 9], [140, 202, 60, 8]]);
    // missile pods on the shoulders
    s += H.p('M138 122 L170 114 L176 126 L142 136 Z', H.metal('#d8e0ec')) + H.p('M170 114 L182 118 L176 126 Z', '#e83a3a');
    // wolf head with metal mask and ears
    s += H.p('M54 38 L48 2 L80 26 Z M118 22 L136 -10 L144 26 Z', H.metal(m));
    s += H.p('M30 84 C28 44 62 18 104 18 C140 18 166 38 176 62 C194 66 208 78 208 94 C208 110 192 120 172 122 C146 132 86 132 60 122 C40 114 30 100 30 84 Z', H.metal(m));
    s += H.p('M96 88 C116 80 166 78 202 90 C210 98 206 110 194 116 C170 124 130 126 110 120 C98 116 92 102 96 88 Z', H.metal('#e4ecf8'));
    s += H.p('M60 40 C76 36 96 36 112 40 L104 56 L62 58 Z', H.metal(gold));
    s += H.p('M88 70 C100 62 120 60 136 64 L132 74 L92 80 Z', '#1a2244');
    s += H.eye(110, 72, 13, 12, '#ffd23a', { brow: true });
    s += H.eye(146, 70, 9, 10, '#ffd23a');
    s += H.e(202, 96, 4, 3, H.OUT, 'stroke="none"');
    s += H.p('M146 110 C160 116 180 116 194 108', 'none', 'stroke-width="3.2"') + H.p('M184 112 l3 6 l3 -7 Z', '#fff', 'stroke-width="1.8"');
    s += H.blush(86, 102) + H.blush(162, 100, 7, 4);
    return ['-6 -20 226 226', s];
  },

  phoenixmon(H) {
    const g = '#ffc23a', r = '#ff6a2a', crest = '#e8382e', beak = '#fff0a0';
    let s = '';
    // long flame tail feathers
    s += H.p('M80 170 C50 196 20 200 -4 192 C14 186 28 176 40 164 C24 168 10 166 -2 158 C20 152 40 148 60 148 Z', H.f(r));
    // four wings (two big up, two small)
    s += H.p('M78 128 C50 96 20 70 -10 64 C0 84 8 100 20 112 C6 112 -4 118 -10 128 C14 132 40 136 70 146 Z', H.f(g)) + H.p('M-10 64 C0 84 8 100 20 112 C10 92 2 78 -10 64 Z', H.f(r), 'stroke="none"');
    s += H.p('M138 128 C166 96 196 70 226 64 C216 84 208 100 196 112 C210 112 220 118 226 128 C202 132 176 136 146 146 Z', H.f(g)) + H.p('M226 64 C216 84 208 100 196 112 C206 92 214 78 226 64 Z', H.f(r), 'stroke="none"');
    // body
    s += H.e(108, 160, 34, 30, H.f(g));
    s += H.e(112, 166, 20, 18, H.f('#fff0b0'), 'stroke="none"');
    s += H.p('M94 186 L92 200 M120 186 L124 200', 'none', `stroke="${H.dark(r, 0.2)}" stroke-width="6"`);
    // head with fiery crest
    s += H.p('M70 30 C60 6 70 -14 88 -22 C86 -4 94 8 104 14 C104 -6 118 -20 136 -22 C128 -4 128 10 136 22 Z', H.f(crest));
    s += H.e(106, 80, 66, 56, H.f(g));
    s += H.sh('M44 104 C64 126 150 128 172 104 C164 124 138 136 106 136 C74 136 52 124 44 104 Z', g);
    s += H.p('M60 60 C70 50 84 46 96 46', 'none', `stroke="${r}" stroke-width="5"`);
    s += H.p('M158 84 C174 78 194 82 208 92 C196 100 178 104 160 102 Z', H.f(beak));
    s += H.eye(110, 80, 13, 17, '#2a8ae0');
    s += H.eye(146, 78, 9, 14, '#2a8ae0');
    s += H.blush(88, 104) + H.blush(154, 106, 6, 4);
    return ['-14 -26 250 232', s];
  },

  herculeskabuterimon(H) {
    const gold = '#f2c23a', dark = '#a8701c', wing = '#9ad8ff', eye = '#2ac85a';
    let s = '';
    // translucent wings
    s += H.p('M80 110 C50 70 20 54 -6 58 C6 84 30 108 70 130 Z', wing, 'opacity="0.75"') + H.p('M136 110 C166 70 196 54 222 58 C210 84 186 108 146 130 Z', wing, 'opacity="0.75"');
    // body + four arms
    s += H.e(108, 160, 40, 34, H.metal(gold));
    s += H.p('M80 150 C96 158 120 158 136 150', 'none', `stroke="${dark}" stroke-width="3"`);
    s += tube(H, 'M142 144 C156 136 164 128 170 118', H.light(gold, 0.2)) + tube(H, 'M144 164 C158 164 166 168 172 176', H.light(gold, 0.2));
    s += H.claws([[170, 118, -40, 9], [172, 176, 40, 9]]);
    s += tube(H, 'M74 144 C60 136 52 128 46 118', H.light(gold, 0.2));
    s += H.p('M90 188 L86 200 M126 188 L130 200', 'none', `stroke="${H.OUT}" stroke-width="10"`) + H.p('M90 188 L86 200 M126 188 L130 200', 'none', `stroke="${gold}" stroke-width="5"`);
    // head with the huge horn
    s += H.p('M112 30 C110 -2 124 -24 148 -32 C140 -16 140 -2 146 10 C152 2 162 -2 170 0 C160 10 154 22 150 36 Z', H.metal(gold));
    s += H.p('M60 36 C50 22 50 8 56 -2 C64 10 72 20 80 30 Z', H.metal(gold));
    s += H.e(108, 80, 70, 56, H.metal(gold));
    s += H.p('M64 100 C80 120 140 124 164 100 C152 92 76 92 64 100 Z', H.f('#7a4a1c'));
    s += H.e(98, 80, 20, 20, H.f(eye)) + H.e(92, 72, 6, 6, '#fff', 'stroke="none"');
    s += H.e(146, 78, 15, 17, H.f(eye)) + H.e(141, 70, 4.5, 4.5, '#fff', 'stroke="none"');
    s += H.p('M104 108 C108 116 116 116 120 110 M120 110 C124 116 132 116 136 108', 'none', 'stroke-width="3"');
    s += H.blush(74, 100) + H.blush(170, 98, 7, 4);
    return ['-12 -36 240 240', s];
  },

  rosemon(H) {
    const red = '#e8304a', pink = '#ff8ab4', gold = '#f2c23a', skin = '#ffe2cc', hair = '#ffd25a', green = '#3aa84a';
    let s = '';
    // thorny whip
    s += H.p('M146 150 C176 160 196 140 200 112 C204 86 186 70 172 76', 'none', `stroke="${green}" stroke-width="4"`);
    // rose-petal dress
    s += H.p('M78 140 C66 160 60 182 70 198 C86 206 130 206 146 198 C156 182 150 160 138 140 Z', H.f(red));
    s += H.p('M76 170 C92 176 124 176 142 170 M70 190 C90 196 128 196 148 188', 'none', 'stroke-width="2.6"');
    s += H.p('M88 140 C96 150 120 150 128 140 L128 130 L88 130 Z', H.f(pink));
    s += H.p('M88 202 L86 210 M128 202 L130 210', 'none', 'stroke-width="6"');
    s += tube(H, 'M130 140 C142 144 150 148 156 150', skin, 10) + tube(H, 'M86 140 C74 144 66 150 62 156', skin, 10);
    // flowing hair
    s += H.p('M42 70 C30 100 30 130 44 150 C52 130 56 110 58 92 Z M172 70 C184 100 184 130 170 150 C162 130 158 110 156 92 Z', H.f(hair));
    // face + gold mask, rose crown
    s += H.e(108, 82, 58, 54, H.f(skin));
    s += H.p('M50 70 C60 40 84 28 108 28 C132 28 156 40 166 70 C150 60 130 56 108 56 C86 56 66 60 50 70 Z', H.f(hair));
    s += H.p('M62 74 C76 64 140 64 154 74 L150 88 C130 82 86 82 66 88 Z', H.metal(gold));
    for (let i = 0; i < 5; i++) s += H.e(76 + i * 16, 26 - (i === 2 ? 10 : i % 2 ? 4 : 0), 12, 11, H.f(i === 2 ? red : pink));
    s += H.e(108, 18, 7, 6, H.f(H.dark(red, 0.2)));
    s += H.eye(92, 98, 10, 12, '#3a9a4a');
    s += H.eye(126, 98, 10, 12, '#3a9a4a');
    s += H.p('M100 118 C104 122 112 122 116 118', 'none', 'stroke-width="3"');
    s += H.blush(78, 112, 7, 4) + H.blush(138, 112, 7, 4);
    return ['10 -10 208 226', s];
  },

  vikemon(H) {
    const fur = '#f4f6fb', blue = '#3a5ab8', gold = '#e8c040', horn = '#fff0c8', steel = '#c8d0dc';
    let s = '';
    // morning star flail
    s += H.p('M168 130 C188 120 196 104 196 92', 'none', 'stroke="#6a6a7a" stroke-width="3" stroke-dasharray="5 3"');
    s += H.star(198, 82, 20, 12, 8, H.metal(steel)) + H.e(198, 82, 10, 10, H.metal(steel));
    // body: blue armour with fur
    s += H.e(108, 162, 44, 36, H.f(fur));
    s += H.p('M76 150 C92 140 126 140 142 150 L140 180 C124 188 94 188 78 180 Z', H.f(blue));
    s += H.e(84, 198, 18, 9, H.f(fur)) + H.e(134, 198, 18, 9, H.f(fur));
    s += tube(H, 'M146 150 C156 144 164 136 168 130', fur, 16) + tube(H, 'M70 150 C60 144 54 136 50 128', fur, 16);
    // big furry head with horned viking helmet
    s += H.p('M54 50 C30 40 18 18 20 -6 C36 6 50 24 62 34 Z M160 50 C184 40 196 18 194 -6 C178 6 164 24 152 34 Z', H.f(horn));
    s += H.e(108, 86, 70, 60, H.f(fur));
    s += H.p('M46 64 C52 32 80 18 108 18 C136 18 164 32 170 64 C150 56 130 52 108 52 C86 52 66 56 46 64 Z', H.metal(gold));
    s += H.p('M100 18 L108 4 L116 18', H.metal(gold));
    s += H.p('M60 96 C70 128 146 128 156 96 C150 116 134 132 108 132 C82 132 66 116 60 96 Z', H.f('#d8dce8'), 'stroke="none"');
    s += H.eye(90, 86, 11, 13, '#3a82e0', { brow: true });
    s += H.eye(126, 86, 11, 13, '#3a82e0');
    s += H.p('M128 76 L148 72', 'none', 'stroke-width="4"');
    s += H.p('M92 112 C100 120 116 120 124 112', 'none', 'stroke-width="3.4"') + H.p('M96 114 l2 -8 l3 8 Z M118 114 l2 -8 l3 8 Z', '#fff', 'stroke-width="1.8"');
    s += H.blush(70, 104) + H.blush(146, 104);
    return ['0 -14 226 226', s];
  },

  seraphimon(H) {
    const armor = '#d8e4f4', blue = '#3a5ab8', gold = '#f2c23a', wing = '#fff6c8';
    let s = '';
    // ten golden wings (five each side)
    for (let i = 0; i < 5; i++) {
      const y = 40 + i * 22, l = 70 - i * 6;
      s += H.p(`M80 ${y + 60} C60 ${y + 30} ${40 - l * 0.4} ${y} ${10 - i * 4} ${y - 10} C${20 - i * 2} ${y + 20} 40 ${y + 50} 76 ${y + 74} Z`, H.f(wing));
      s += H.p(`M136 ${y + 60} C156 ${y + 30} ${176 + l * 0.4} ${y} ${206 + i * 4} ${y - 10} C${196 + i * 2} ${y + 20} 176 ${y + 50} 140 ${y + 74} Z`, H.f(wing));
    }
    // blue robe + armour body
    s += H.p('M80 140 C70 166 66 190 74 204 L142 204 C150 190 146 166 136 140 Z', H.f(blue));
    s += H.p('M84 138 C96 130 120 130 132 138 L130 164 C120 170 96 170 86 164 Z', H.metal(armor));
    s += H.star(108, 152, 8, 3.5, 4, H.metal(gold));
    s += tube(H, 'M134 146 C148 148 156 154 160 162', armor, 12) + tube(H, 'M82 146 C68 148 60 154 56 162', armor, 12);
    // helmet with the cross visor
    s += H.e(108, 82, 62, 58, H.metal(armor));
    s += H.p('M60 82 L156 82 L156 96 L60 96 Z', '#1a2244');
    s += H.p('M100 40 L116 40 L116 120 L100 120 Z', H.metal(gold));
    s += H.p('M58 56 C60 40 70 30 82 26 L78 52 Z M158 56 C156 40 146 30 134 26 L138 52 Z', H.metal(gold));
    s += H.e(84, 89, 8, 4, '#7ad0ff', 'stroke="none"') + H.e(132, 89, 8, 4, '#7ad0ff', 'stroke="none"');
    s += H.p('M96 110 C102 116 114 116 120 110', 'none', 'stroke-width="3"');
    s += H.blush(76, 108) + H.blush(140, 108);
    return ['-10 -20 236 230', s];
  },

  ophanimon(H) {
    const armor = '#f4f6fb', gold = '#f2c23a', green = '#4ac87a', hair = '#ffd860', skin = '#ffe4cc', wing = '#ffffff';
    let s = '';
    // white wings with golden rings
    s += H.p('M80 120 C50 90 20 70 -8 70 C6 92 12 106 26 118 C10 120 2 128 -4 140 C24 138 52 140 76 146 Z', H.f(wing)) + H.p('M136 120 C166 90 196 70 224 70 C210 92 204 106 190 118 C206 120 214 128 220 140 C192 138 164 140 140 146 Z', H.f(wing));
    s += H.e(24, 104, 9, 9, 'none', `stroke="${gold}" stroke-width="3"`) + H.e(192, 104, 9, 9, 'none', `stroke="${gold}" stroke-width="3"`);
    // javelin
    s += H.p('M170 40 L162 200', 'none', `stroke="${H.OUT}" stroke-width="8"`) + H.p('M170 40 L162 200', 'none', `stroke="${gold}" stroke-width="4"`) + H.p('M170 20 L178 44 L162 44 Z', H.metal('#d8e4f4'));
    // dress/armour body
    s += H.p('M82 140 C72 166 70 190 78 204 L138 204 C146 190 144 166 134 140 Z', H.f(armor));
    s += H.p('M84 138 C96 130 120 130 132 138 L130 160 C120 166 96 166 86 160 Z', H.metal(gold));
    s += H.e(108, 150, 6, 6, H.f(green));
    s += tube(H, 'M134 146 C146 144 154 140 160 134', skin, 10) + tube(H, 'M82 146 C70 150 64 156 60 164', skin, 10);
    // hair + helmet covering the eyes
    s += H.p('M48 76 C36 110 38 140 52 156 C58 132 60 112 62 94 Z M168 76 C180 110 178 140 164 156 C158 132 156 112 154 94 Z', H.f(hair));
    s += H.e(108, 84, 58, 56, H.f(skin));
    s += H.p('M50 80 C52 44 78 26 108 26 C138 26 164 44 166 80 L158 92 L58 92 Z', H.metal(armor));
    s += H.p('M70 70 C84 62 132 62 146 70 L144 88 L72 88 Z', H.metal(green));
    s += H.p('M100 26 L108 6 L116 26 Z', H.metal(gold)) + H.p('M56 60 C46 50 42 38 46 28 C54 36 60 44 64 54 Z M160 60 C170 50 174 38 170 28 C162 36 156 44 152 54 Z', H.metal(gold));
    s += H.p('M96 112 C102 118 114 118 120 112', 'none', 'stroke-width="3"');
    s += H.blush(80, 106) + H.blush(136, 106);
    return ['-14 0 244 210', s];
  },
};

Object.assign(module.exports, {
  imperialdramon(H) {
    const red = '#d8343a', black = '#3a3448', gold = '#f2c23a', wing = '#5a4a8a';
    let s = '';
    // dragon wings + positron laser on the right arm
    s += H.p('M78 116 C50 70 20 46 -6 40 C2 62 8 80 20 94 C6 96 -2 104 -6 116 C10 116 22 120 32 128 C20 132 12 140 8 150 C34 146 56 142 76 140 Z', H.f(wing));
    s += H.p('M138 116 C166 70 196 46 222 40 C214 62 208 80 196 94 C210 96 218 104 222 116 C206 116 194 120 184 128 C196 132 204 140 208 150 C182 146 160 142 140 140 Z', H.f(wing));
    // body: black armour + red chest
    s += H.e(108, 160, 36, 32, H.metal(black));
    s += H.p('M90 142 C100 136 116 136 126 142 L122 166 L94 166 Z', H.metal(red));
    s += H.p('M92 186 L88 200 L106 200 L104 186 Z M114 186 L112 200 L130 200 L124 186 Z', H.metal(black));
    s += H.p('M136 146 L172 138 L180 152 L140 164 Z', H.metal(gold)) + H.p('M172 138 L196 134 L198 148 L180 152 Z', H.metal(black)) + H.e(198, 141, 4, 6, '#7ad0ff');
    s += tube(H, 'M80 148 C68 150 62 158 60 166', black, 12);
    // head: dragon helmet with gold horns and V-crest
    s += H.p('M60 46 C40 30 34 10 40 -8 C52 8 62 22 72 32 Z M150 40 C166 20 186 10 206 12 C192 24 178 36 164 48 Z', H.metal(gold));
    s += H.e(108, 82, 66, 56, H.metal(red));
    s += H.p('M48 66 C60 36 84 26 108 26 C134 26 160 38 170 64 C150 56 130 54 108 54 C86 54 64 58 48 66 Z', H.metal(black));
    s += H.p('M92 54 L108 30 L124 54 L108 46 Z', H.metal(gold));
    s += H.p('M150 82 C170 76 196 82 210 94 C198 104 176 110 156 106 Z', H.metal(red));
    s += H.eye(104, 84, 12, 14, '#ffd23a', { brow: true });
    s += H.eye(140, 82, 9, 11, '#ffd23a');
    s += H.p('M168 100 C182 104 196 102 204 98', 'none', 'stroke-width="3"');
    s += H.blush(80, 104) + H.blush(146, 106, 6, 4);
    return ['-12 -16 238 222', s];
  },

  valdurmon(H) {
    const white = '#fbfbff', red = '#e8384a', gold = '#f2c23a', beak = '#ffd860';
    let s = '';
    // long ribbon-like tail feathers and huge wings
    s += H.p('M80 170 C50 196 16 204 -10 196 C10 186 30 176 46 166 Z', H.f(red)) + H.p('M86 176 C66 204 40 214 14 212 C30 202 46 190 58 178 Z', H.f(gold));
    s += H.p('M80 124 C46 92 14 78 -12 82 C4 98 14 112 30 122 C12 126 2 136 -4 148 C24 146 52 146 78 150 Z', H.f(white)) + H.p('M-12 82 C4 98 14 112 30 122 C40 108 24 92 -12 82 Z', H.f(red), 'stroke="none"');
    s += H.p('M136 124 C170 92 202 78 228 82 C212 98 202 112 186 122 C204 126 214 136 220 148 C192 146 164 146 138 150 Z', H.f(white)) + H.p('M228 82 C212 98 202 112 186 122 C176 108 192 92 228 82 Z', H.f(red), 'stroke="none"');
    // body
    s += H.e(108, 160, 34, 30, H.f(white));
    s += H.p('M88 146 C100 154 116 154 128 146 L126 164 C116 170 100 170 90 164 Z', H.metal(gold));
    s += H.p('M94 186 L92 200 M122 186 L124 200', 'none', `stroke="${H.OUT}" stroke-width="9"`) + H.p('M94 186 L92 200 M122 186 L124 200', 'none', `stroke="${beak}" stroke-width="4"`);
    // head: white hawk with red-gold headdress
    s += H.p('M58 50 C44 28 40 6 48 -12 C58 6 70 20 80 32 Z M74 36 C68 14 72 -6 84 -20 C88 2 94 16 100 28 Z', H.f(red));
    s += H.e(106, 80, 64, 56, H.f(white));
    s += H.p('M46 66 C58 40 82 28 108 28 C134 28 156 40 166 62 C146 56 126 54 104 56 C82 58 62 62 46 66 Z', H.metal(gold));
    s += H.e(108, 46, 7, 7, H.f(red));
    s += H.p('M158 82 C176 74 200 80 212 94 C196 102 176 104 160 100 Z', H.f(beak));
    s += H.eye(110, 82, 13, 16, '#3a82e0');
    s += H.eye(146, 80, 9, 13, '#3a82e0');
    s += H.blush(86, 104) + H.blush(152, 106, 6, 4);
    return ['-16 -24 250 240', s];
  },

  shakkoumon(H) {
    const clay = '#d8a878', dark = '#8a5a3a', gold = '#f2c23a', red = '#d8343a';
    let s = '';
    // round haniwa body
    s += H.e(108, 160, 44, 38, H.f(clay));
    s += H.p('M68 150 C90 160 126 160 148 150', 'none', `stroke="${dark}" stroke-width="3"`);
    s += H.e(84, 196, 16, 8, H.f(dark)) + H.e(132, 196, 16, 8, H.f(dark));
    s += tube(H, 'M150 150 C162 142 168 132 170 122', clay, 14) + tube(H, 'M66 150 C54 142 48 132 46 122', clay, 14);
    s += H.e(170, 118, 9, 9, H.f(clay)) + H.e(46, 118, 9, 9, H.f(clay));
    // head: clay face with closed eyes, red/gold forehead disc
    s += H.p('M60 46 C60 26 80 14 108 14 C136 14 156 26 156 46 Z', H.f(dark));
    s += H.e(108, 84, 64, 56, H.f(clay));
    s += H.p('M54 70 C70 62 146 62 162 70', 'none', `stroke="${dark}" stroke-width="3"`);
    s += H.e(108, 48, 12, 12, H.metal(gold)) + H.e(108, 48, 5, 5, H.f(red));
    s += H.p('M78 88 C84 82 96 82 102 88 M118 88 C124 82 136 82 142 88', 'none', 'stroke-width="4"');
    s += H.p('M100 108 C104 114 112 114 116 108', 'none', 'stroke-width="3"');
    s += H.p('M44 96 L28 92 M44 106 L28 108 M172 96 L188 92 M172 106 L188 108', 'none', `stroke="${dark}" stroke-width="3"`);
    s += H.blush(74, 102) + H.blush(142, 102);
    return ['14 0 192 210', s];
  },

  grandiskuwagamon(H) {
    const black = '#3a3448', silver = '#c8d0dc', red = '#e8384a', green = '#4ac87a';
    let s = '';
    // translucent wings
    s += H.p('M80 112 C50 76 18 62 -8 66 C6 90 32 114 72 132 Z', '#9ad8ff', 'opacity="0.7"') + H.p('M136 112 C166 76 198 62 224 66 C210 90 184 114 144 132 Z', '#9ad8ff', 'opacity="0.7"');
    // body
    s += H.e(108, 160, 38, 32, H.metal(black));
    s += H.p('M90 142 C100 136 116 136 126 142 L122 168 L94 168 Z', H.metal(silver));
    s += tube(H, 'M142 146 C156 140 164 130 170 120', black, 12) + tube(H, 'M74 146 C60 140 52 130 46 120', black, 12);
    s += H.claws([[170, 118, -50, 10], [46, 118, -130, 10]], silver);
    s += H.p('M92 186 L88 200 L104 200 L102 186 Z M116 186 L114 200 L130 200 L126 186 Z', H.metal(black));
    // head with huge silver pincers
    s += H.p('M66 44 C40 26 30 0 38 -24 C50 -8 56 6 66 12 C60 0 62 -10 70 -18 C76 0 82 18 90 32 Z', H.metal(silver));
    s += H.p('M150 44 C176 26 186 0 178 -24 C166 -8 160 6 150 12 C156 0 154 -10 146 -18 C140 0 134 18 126 32 Z', H.metal(silver));
    s += H.e(108, 82, 64, 54, H.metal(black));
    s += H.p('M56 76 C70 64 146 64 160 76 L156 92 L60 92 Z', H.metal(silver));
    s += H.eye(94, 86, 12, 13, red, { brow: true });
    s += H.eye(128, 86, 12, 13, red);
    s += H.p('M100 112 C104 116 112 116 116 112', 'none', 'stroke-width="3"');
    s += H.e(108, 58, 6, 6, H.f(green));
    s += H.blush(72, 106) + H.blush(144, 106);
    return ['-14 -30 244 236', s];
  },

  gallantmon(H) {
    const white = '#f4f6fb', red = '#d8343a', gold = '#f2c23a', steel = '#c8d0dc';
    let s = '';
    // lance Gram (left) and shield Aegis (right)
    s += H.p('M54 196 L42 40', 'none', `stroke="${H.OUT}" stroke-width="9"`) + H.p('M54 196 L42 40', 'none', `stroke="${steel}" stroke-width="4"`);
    s += H.p('M36 60 L40 -10 L52 -10 L50 60 Z', H.metal(steel)) + H.p('M30 60 L56 58 L54 68 L32 70 Z', H.metal(gold));
    // red cape
    s += H.p('M78 128 C60 156 54 186 60 204 L156 204 C162 186 156 156 138 128 Z', H.f(red));
    // body
    s += H.e(108, 162, 32, 30, H.metal(white));
    s += H.p('M92 146 C100 140 116 140 124 146 L120 166 L96 166 Z', H.metal(gold));
    s += H.p('M94 188 L90 202 L106 202 L104 188 Z M112 188 L110 202 L126 202 L122 188 Z', H.metal(white));
    s += tube(H, 'M80 150 C66 152 58 158 54 164', white, 12);
    // shield
    s += H.p('M146 120 L194 120 C196 154 186 176 170 190 C154 176 144 154 146 120 Z', H.metal(white));
    s += H.p('M170 132 L170 172 M156 148 L184 148', 'none', `stroke="${red}" stroke-width="4"`) + H.e(170, 148, 8, 8, 'none', `stroke="${red}" stroke-width="3"`);
    // helmet with flowing red hair and gold crest
    s += H.p('M56 60 C32 70 20 96 22 128 C36 112 46 98 56 88 Z', H.f(red));
    s += H.e(108, 82, 62, 56, H.metal(white));
    s += H.p('M52 68 C64 40 86 28 108 28 C132 28 154 42 164 68 L156 74 L60 74 Z', H.metal(red));
    s += H.p('M100 30 L108 -4 L116 30 Z', H.metal(gold)) + H.p('M80 36 L70 8 L92 30 Z M136 36 L146 8 L124 30 Z', H.metal(gold));
    s += H.p('M60 78 L156 78 L150 100 L66 100 Z', '#1a2244');
    s += H.eye(90, 90, 9, 9, '#ffd23a') + H.eye(126, 90, 9, 9, '#ffd23a');
    s += H.p('M100 116 C104 120 112 120 116 116', 'none', 'stroke-width="3"');
    s += H.blush(74, 112) + H.blush(142, 112);
    return ['8 -14 204 222', s];
  },

  megagargomon(H) {
    const green = '#5ab86a', white = '#f4f6fb', steel = '#a8b4c4', red = '#e8384a';
    let s = '';
    // missile pods on the back
    s += H.p('M52 96 L30 82 L30 140 L56 132 Z M164 96 L186 82 L186 140 L160 132 Z', H.metal(steel));
    for (let i = 0; i < 3; i++) s += H.e(38, 96 + i * 14, 4, 4, H.f(red)) + H.e(178, 96 + i * 14, 4, 4, H.f(red));
    // big armoured body with gatling arms
    s += H.e(108, 160, 46, 36, H.metal(green));
    s += H.p('M84 146 C98 138 118 138 132 146 L128 172 L88 172 Z', H.metal(white));
    s += H.p('M146 150 L190 150 L190 172 L146 172 Z', H.metal(steel)) + H.p('M190 152 L202 152 M190 161 L202 161 M190 170 L202 170', 'none', 'stroke-width="5"');
    s += H.p('M70 150 L30 150 L30 172 L70 172 Z', H.metal(steel));
    s += H.p('M80 190 L74 204 L104 204 L100 190 Z M116 190 L112 204 L142 204 L136 190 Z', H.metal(green));
    // head: Terriermon-like with long ears and visor
    s += H.p('M60 60 C34 46 20 24 22 -2 C38 8 52 26 64 42 Z M156 60 C182 46 196 24 194 -2 C178 8 164 26 152 42 Z', H.metal(green));
    s += H.e(108, 84, 64, 54, H.metal(white));
    s += H.p('M106 30 L112 4 L120 30 Z', H.metal(steel));
    s += H.p('M54 66 C64 44 86 32 108 32 C132 32 152 44 162 66 C142 60 126 58 108 58 C90 58 72 60 54 66 Z', H.metal(green));
    s += H.p('M64 74 L152 74 L148 96 L68 96 Z', H.f('#2a8ae0'), 'opacity="0.85"');
    s += H.eye(92, 86, 10, 9, '#2a5aa8') + H.eye(124, 86, 10, 9, '#2a5aa8');
    s += H.p('M98 112 C102 118 114 118 118 112', 'none', 'stroke-width="3"');
    s += H.blush(74, 108) + H.blush(142, 108);
    return ['10 -10 200 220', s];
  },

  sakuyamon(H) {
    const gold = '#f2c23a', purple = '#6a4ab8', white = '#fbfbff', hair = '#ffe6a0', red = '#e8384a', skin = '#ffe4cc';
    let s = '';
    // fox-spirit tails of golden fire behind
    s += H.p('M70 150 C40 140 20 110 24 80 C40 100 54 112 74 120 Z', H.f('#ffe080')) + H.p('M146 150 C176 140 196 110 192 80 C176 100 162 112 142 120 Z', H.f('#ffe080'));
    // shakujo staff
    s += H.p('M170 70 L160 204', 'none', `stroke="${H.OUT}" stroke-width="8"`) + H.p('M170 70 L160 204', 'none', `stroke="${gold}" stroke-width="4"`);
    s += H.e(172, 56, 14, 16, 'none', `stroke="${H.OUT}" stroke-width="7"`) + H.e(172, 56, 14, 16, 'none', `stroke="${gold}" stroke-width="3.4"`);
    // armoured body + white robe
    s += H.p('M80 142 C70 166 68 190 76 204 L140 204 C148 190 146 166 136 142 Z', H.f(white));
    s += H.p('M84 138 C96 130 120 130 132 138 L130 164 C120 170 96 170 86 164 Z', H.metal(gold));
    s += H.p('M104 150 L112 150 L108 160 Z', H.f(red));
    s += tube(H, 'M134 146 C146 144 154 138 160 130', purple, 12) + tube(H, 'M82 146 C68 150 62 158 58 166', purple, 12);
    // pale hair + fox helmet (mask covering upper face)
    s += H.p('M48 80 C36 112 38 142 52 158 C58 134 60 114 62 96 Z M168 80 C180 112 178 142 164 158 C158 134 156 114 154 96 Z', H.f(hair));
    s += H.e(108, 86, 58, 54, H.f(skin));
    s += H.p('M58 40 L46 4 L82 30 Z M158 40 L170 4 L134 30 Z', H.metal(gold)) + H.p('M60 34 L54 16 L72 30 Z M156 34 L162 16 L144 30 Z', H.f(purple), 'stroke="none"');
    s += H.p('M50 84 C52 46 78 28 108 28 C138 28 164 46 166 84 C150 94 132 98 108 98 C84 98 66 94 50 84 Z', H.metal(gold));
    s += H.p('M72 74 C80 68 92 68 98 76 M118 76 C124 68 136 68 144 74', 'none', `stroke="${red}" stroke-width="4"`);
    s += H.e(108, 52, 6, 8, H.f(red));
    s += H.p('M98 116 C102 122 114 122 118 116', 'none', 'stroke-width="3"');
    s += H.blush(80, 110) + H.blush(136, 110);
    return ['10 -4 204 214', s];
  },
});

// WarGreymon: one solid armoured dragon warrior. Brave Shield halves as wings behind the shoulders,
// Dramon Destroyer gauntlets (three big claws) on both forearms, helmet with three horns.
Object.assign(module.exports, {
  wargreymon(H) {
    const gold = '#f2c23a', org = '#ff9a2a', steel = '#eef4ff', red = '#e8483a', navy = '#1a2244', hair = '#d8843a';
    const claw3 = (x, y, ang, len, w) => { // three curved Dramon Destroyer claws fanning out from (x,y)
      let s = '';
      for (const k of [1, -1, 0]) {
        const a = (ang + k * 17) * Math.PI / 180, L = len * (k ? 0.84 : 1), ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L;
        const nx = -Math.sin(a) * w, ny = Math.cos(a) * w, mx = x + Math.cos(a) * L * 0.5, my = y + Math.sin(a) * L * 0.5;
        s += H.p(`M${(x + nx).toFixed(1)} ${(y + ny).toFixed(1)} Q${(mx + nx * 1.3).toFixed(1)} ${(my + ny * 1.3).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)} Q${(mx - nx * 0.5).toFixed(1)} ${(my - ny * 0.5).toFixed(1)} ${(x - nx).toFixed(1)} ${(y - ny).toFixed(1)} Z`, H.metal(steel), 'stroke-width="3"');
      }
      return s;
    };
    const gauntlet = (cx, cy, ang, len, r) => { // gold forearm cylinder pointing along ang
      const a = ang * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy * r, ny = ux * r;
      const x0 = cx - ux * len / 2, y0 = cy - uy * len / 2, x1 = cx + ux * len / 2, y1 = cy + uy * len / 2;
      return H.p(`M${x0 + nx} ${y0 + ny} L${x1 + nx * 1.15} ${y1 + ny * 1.15} L${x1 - nx * 1.15} ${y1 - ny * 1.15} L${x0 - nx} ${y0 - ny} Z`, H.metal(gold))
        + H.p(`M${cx + nx * 0.9} ${cy + ny * 0.9} L${cx - nx * 0.9} ${cy - ny * 0.9}`, 'none', 'stroke-width="2.2"')
        + H.p(`M${x1 + nx * 0.6} ${y1 + ny * 0.6} L${x1 - nx * 0.6} ${y1 - ny * 0.6}`, 'none', `stroke="${red}" stroke-width="3"`);
    };
    const shield = (pts, inner, crest) => H.p(pts, H.metal(gold)) + H.p(inner, H.f(org), 'stroke-width="2.6"') + H.star(crest[0], crest[1], 12, 5, 8, H.metal(gold), 'stroke-width="2.2"') + H.e(crest[0], crest[1], 4.5, 4.5, H.f(red), 'stroke-width="1.6"');
    let s = '';
    // Brave Shield halves as wings, spread up behind the shoulders
    s += shield('M100 136 L44 44 L4 56 L-10 112 L14 168 L86 168 Z', 'M92 138 L46 56 L14 66 L2 110 L22 158 L82 158 Z', [42, 106]);
    s += shield('M122 130 L166 34 L210 42 L226 98 L206 152 L132 160 Z', 'M128 132 L168 46 L202 52 L214 96 L198 142 L136 150 Z', [180, 92]);
    // flowing hair behind the helmet
    // tail
    s += H.p('M80 184 C58 196 32 198 14 188 C28 184 44 178 60 168 Z', H.f(org));
    // far arm: Dramon Destroyer pointing down
    s += H.p('M84 150 C74 154 68 160 64 166', 'none', `stroke="${H.OUT}" stroke-width="16"`) + H.p('M84 150 C74 154 68 160 64 166', 'none', `stroke="${org}" stroke-width="10"`);
    s += gauntlet(58, 172, 118, 26, 11) + claw3(51, 185, 116, 40, 7);
    // legs with gold greaves and clawed feet
    s += H.p('M86 178 L80 206 L108 206 L104 178 Z', H.metal(gold)) + H.p('M120 178 L118 206 L146 206 L138 178 Z', H.metal(gold));
    s += H.p('M84 192 L106 192 M120 192 L142 192', 'none', `stroke="${red}" stroke-width="3"`);
    s += H.claws([[108, 206, 10, 9], [101, 209, 50, 8], [146, 206, 10, 9], [139, 209, 50, 8]]);
    // body: orange torso with a gold breastplate that runs up under the helmet (no gap at the neck)
    s += H.e(112, 164, 34, 28, H.f(org));
    s += H.p('M80 124 C94 116 130 116 144 124 L140 166 C130 176 94 176 84 166 Z', H.metal(gold));
    s += H.p('M92 168 L132 168', 'none', 'stroke-width="2.4"');
    s += `<g transform="translate(112 146) scale(1.15)"><path d="M0 -12 L3 -5 L10 -7 L6 -1 L12 3 L4 4 L3 11 L-2 6 L-8 9 L-6 2 L-12 -2 L-5 -4 L-6 -11 L-1 -6 Z" fill="#ffe066" stroke="#8a4410" stroke-width="2"/><circle r="3.6" fill="#ee5a24" stroke="#8a4410" stroke-width="1.6"/></g>`; // Crest of Courage
    // shoulder pads bridge body, wings and head
    s += H.p('M60 136 C60 120 76 114 92 120 L94 146 C80 150 66 148 60 136 Z', H.metal(gold));
    s += H.p('M164 132 C164 116 148 110 132 116 L130 142 C144 146 158 144 164 132 Z', H.metal(gold));
    // head: the original round helmet with three short horns and the friendly-but-fierce face
    s += `<defs><linearGradient id="wgGold" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#fff6b0"/><stop offset="0.35" stop-color="#ffd84a"/><stop offset="1" stop-color="#e8a820"/></linearGradient>`
      + `<linearGradient id="wgSk" x1="0" y1="0" x2="0.5" y2="1"><stop offset="0" stop-color="#ffc24a"/><stop offset="1" stop-color="#ff9a1e"/></linearGradient>`
      + `<radialGradient id="wgEye" cx="0.45" cy="0.65" r="0.6"><stop offset="0" stop-color="#9af06a"/><stop offset="0.6" stop-color="#3cc23c"/><stop offset="1" stop-color="#1c7a24"/></radialGradient></defs>`;
    s += `<g transform="translate(112 74) scale(1.02) translate(-126 -80)">
    <path d="M70 92 C56 100 50 116 54 132 C62 122 70 116 80 112 Z M180 92 C194 100 200 116 196 132 C188 122 180 116 170 112 Z" fill="#ffd25a"/>
    <path d="M62 92 C58 50 90 22 126 22 C162 22 194 50 190 92 C188 112 176 128 158 136 L94 136 C76 128 64 112 62 92 Z" fill="url(#wgGold)"/>
    <path d="M82 40 C96 30 114 26 130 28" fill="none" stroke="#fffbe0" stroke-width="7"/>
    <path d="M78 96 C78 82 98 74 126 74 C154 74 174 82 174 96 C174 116 156 132 126 132 C96 132 78 116 78 96 Z" fill="url(#wgSk)"/>
    <path d="M114 26 C112 12 118 2 126 0 C134 2 140 12 138 26 Z" fill="url(#wgGold)"/>
    <path d="M78 46 C64 38 58 26 60 16 C72 18 82 28 88 40 Z" fill="url(#wgGold)"/>
    <path d="M174 46 C188 38 194 26 192 16 C180 18 170 28 164 40 Z" fill="url(#wgGold)"/>
    <ellipse cx="104" cy="96" rx="15" ry="18" fill="#ffffff"/>
    <ellipse cx="106" cy="99" rx="12" ry="14.5" fill="url(#wgEye)" stroke="none"/>
    <ellipse cx="108" cy="101" rx="5.5" ry="8.5" fill="#101010" stroke="none"/>
    <ellipse cx="100" cy="91" rx="4.5" ry="4.5" fill="#ffffff" stroke="none"/>
    <ellipse cx="104" cy="96" rx="15" ry="18" fill="none"/>
    <ellipse cx="148" cy="96" rx="15" ry="18" fill="#ffffff"/>
    <ellipse cx="146" cy="99" rx="12" ry="14.5" fill="url(#wgEye)" stroke="none"/>
    <ellipse cx="144" cy="101" rx="5.5" ry="8.5" fill="#101010" stroke="none"/>
    <ellipse cx="140" cy="91" rx="4.5" ry="4.5" fill="#ffffff" stroke="none"/>
    <ellipse cx="148" cy="96" rx="15" ry="18" fill="none"/>
    <path d="M88 76 L118 84 M164 76 L134 84" fill="none" stroke-width="4"/>
    <path d="M100 116 C100 106 112 102 126 102 C140 102 152 106 152 116 C152 126 140 132 126 132 C112 132 100 126 100 116 Z" fill="#ffcf72"/>
    <ellipse cx="118" cy="110" rx="2.4" ry="1.8" fill="#5a2a10" stroke="none"/>
    <ellipse cx="134" cy="110" rx="2.4" ry="1.8" fill="#5a2a10" stroke="none"/>
    <path d="M108 119 C116 127 136 127 144 119" fill="none" stroke-width="3.2"/>
    <path d="M113 122 l2 5.5 l3 -4.5 Z M135 123.5 l3 4.5 l2 -5.5 Z" fill="#ffffff" stroke-width="1.6"/>
    <ellipse cx="86" cy="116" rx="8" ry="4.5" fill="#ff7a8a" stroke="none" opacity="0.45"/>
    <ellipse cx="166" cy="116" rx="8" ry="4.5" fill="#ff7a8a" stroke="none" opacity="0.45"/>
    </g>`;
    // near arm raised forward: the big Dramon Destroyer
    s += H.p('M144 144 C156 150 166 152 176 152', 'none', `stroke="${H.OUT}" stroke-width="17"`) + H.p('M144 144 C156 150 166 152 176 152', 'none', `stroke="${org}" stroke-width="11"`);
    s += gauntlet(190, 150, -6, 34, 14) + claw3(206, 148, -8, 64, 9);
    return ['-22 -36 304 262', s];
  },
});
