// Rookie partners, part 2 (02 + Tamers).
'use strict';
const arm = (H, d, c, w = 12) => H.p(d, 'none', `stroke="${H.OUT}" stroke-width="${w}"`) + H.p(d, 'none', `stroke="${c}" stroke-width="${w - 6}"`);
module.exports = {
  veemon(H) {
    const blue = '#3a78e8', white = '#f4f8ff', v = '#ffd23a';
    let s = '';
    s += H.p('M72 176 C52 178 36 170 28 156 C42 156 56 156 68 160 Z', H.f(blue));
    s += H.p('M118 186 C118 178 130 174 142 176 C154 178 158 186 156 194 C154 200 146 202 136 202 L126 202 C120 202 118 196 118 186 Z', H.f(H.dark(blue, 0.12)));
    s += H.claws([[152, 194, 20, 8], [148, 200, 50, 7]]);
    s += H.e(104, 160, 32, 30, H.f(blue));
    s += H.e(110, 166, 20, 20, H.f(white), 'stroke="none"');
    s += H.p('M62 186 C62 176 74 172 88 174 C102 176 108 184 106 194 C104 202 96 204 84 204 L72 204 C64 204 62 196 62 186 Z', H.f(blue));
    s += H.claws([[100, 198, 25, 8], [94, 203, 60, 7]]);
    s += H.p('M128 146 C140 144 150 136 156 128 C164 128 168 136 164 142 C158 150 146 154 132 156 Z', H.f(blue));
    s += H.claws([[162, 130, -30, 9], [168, 138, 0, 9], [162, 146, 40, 8]]);
    s += H.p('M80 148 C68 146 60 140 56 132 C48 132 46 140 50 146 C56 154 66 158 80 160 Z', H.f(blue));
    // long ears
    s += H.p('M54 46 C36 30 26 10 28 -6 C46 4 62 22 72 40 Z', H.f(blue));
    s += H.p('M96 30 C96 10 104 -8 118 -16 C122 4 118 22 112 34 Z', H.f(blue));
    // head with white muzzle, V mark, nose horn
    s += H.p('M28 84 C26 42 58 16 102 16 C140 16 168 36 178 62 C194 66 206 78 206 92 C206 108 192 118 172 122 C146 132 84 132 58 122 C38 114 28 102 28 84 Z', H.f(blue));
    s += H.p('M92 84 C110 72 160 70 190 78 C206 84 210 98 202 110 C194 120 172 126 146 128 C116 130 94 124 88 110 C84 100 84 90 92 84 Z', H.f(white));
    s += H.p('M190 74 C194 62 200 54 208 52 C206 62 204 70 200 78 Z', H.f('#fff6c8'));
    s += H.p('M100 40 L114 62 L128 40 L122 40 L114 52 L106 40 Z', H.f(v));
    s += H.hi('M44 46 C58 32 78 24 98 22', 6, 0.5);
    s += H.eye(98, 76, 14, 19, '#e2302a');
    s += H.eye(140, 74, 10, 15, '#e2302a');
    s += H.p('M140 110 C152 118 172 118 186 108', 'none', 'stroke-width="3.4"') + H.p('M176 112 l3 6 l3 -7 Z', '#fff', 'stroke-width="1.8"');
    s += H.blush(80, 100) + H.blush(160, 100, 7, 4);
    return ['0 -22 220 228', s];
  },

  hawkmon(H) {
    const red = '#e2483a', white = '#fbf8f2', band = '#e8b030', beak = '#ffcc3a', leg = '#ffb13a';
    let s = '';
    s += H.p('M70 170 C52 178 34 176 22 166 C38 162 50 156 58 148 Z', H.f(red)) + H.p('M30 168 l12 -4 M40 172 l10 -6', 'none', 'stroke="#ffffff" stroke-width="3"');
    s += H.p('M94 184 L92 198 M120 184 L124 198', 'none', `stroke="${H.dark(leg, 0.2)}" stroke-width="7"`);
    s += H.p('M82 198 C86 194 98 194 102 198 M114 198 C120 194 132 194 138 198', 'none', `stroke="${leg}" stroke-width="7"`);
    s += H.e(106, 158, 34, 30, H.f(red));
    s += H.e(112, 166, 20, 18, H.f(white), 'stroke="none"');
    s += H.p('M132 146 C148 136 160 122 176 118 C176 132 170 142 160 150 C168 150 172 154 174 160 C158 162 144 160 132 156 Z', H.f(red));
    s += H.p('M160 150 C166 152 170 156 172 160 M168 124 C170 128 172 132 172 136', 'none', 'stroke="#ffffff" stroke-width="3"');
    s += H.p('M80 146 C64 136 54 122 40 116 C40 130 46 142 56 150 C48 150 44 154 42 160 C58 162 70 160 80 156 Z', H.f(red));
    // head: red with white face mask, headband with a big feather
    s += H.e(104, 80, 72, 60, H.f(red));
    s += H.p('M90 84 C102 70 150 66 172 80 C184 90 182 110 166 120 C146 132 108 132 94 118 C84 108 84 92 90 84 Z', H.f(white));
    s += H.p('M38 54 C70 34 140 30 176 52', 'none', `stroke="${H.OUT}" stroke-width="16"`) + H.p('M38 54 C70 34 140 30 176 52', 'none', `stroke="${band}" stroke-width="10"`);
    s += H.p('M40 48 C24 30 18 8 22 -12 C40 2 50 24 52 44 Z', H.f(red)) + H.p('M30 30 C30 14 28 2 24 -6', 'none', 'stroke="#ffffff" stroke-width="3"');
    s += H.e(46, 50, 8, 8, H.metal('#e8b830'));
    s += H.p('M162 90 C178 84 198 88 212 98 C200 106 182 110 164 108 Z', H.f(beak)) + H.p('M164 102 C180 104 198 102 212 98', 'none', 'stroke-width="2.6"');
    s += H.eye(110, 90, 13, 17, '#3a82e0');
    s += H.eye(146, 88, 9, 14, '#3a82e0');
    s += H.blush(92, 112) + H.blush(154, 112, 6, 4);
    return ['0 -20 222 226', s];
  },

  armadillomon(H) {
    const tan = '#e0a456', shell = '#b8763a', belly = '#fbe7c2';
    let s = '';
    s += H.p('M68 176 C52 182 36 182 26 174 C38 168 50 164 62 160 Z', H.f(shell));
    s += H.e(84, 194, 16, 9, H.f(tan)) + H.e(130, 194, 16, 9, H.f(tan));
    s += H.claws([[98, 196, 20, 8], [94, 201, 60, 7], [144, 196, 20, 8], [140, 201, 60, 7]]);
    // body with shell plates on the back
    s += H.e(106, 160, 40, 32, H.f(tan));
    s += H.p('M68 160 C66 138 82 124 102 124 C88 136 84 152 86 168 C80 172 72 170 68 160 Z', H.f(shell));
    s += H.p('M76 132 C74 146 74 158 78 168', 'none', 'stroke-width="2.6"');
    s += H.e(116, 168, 22, 20, H.f(belly), 'stroke="none"');
    s += H.p('M138 150 C148 150 156 146 162 140', 'none', `stroke="${H.OUT}" stroke-width="13"`) + H.p('M138 150 C148 150 156 146 162 140', 'none', `stroke="${tan}" stroke-width="7"`);
    s += H.claws([[162, 140, -40, 9], [166, 144, 0, 9], [164, 150, 40, 8]]);
    // long upright ears
    s += H.p('M60 44 C48 26 46 6 52 -10 C66 2 74 22 76 40 Z', H.f(tan)) + H.p('M60 32 C56 20 56 8 58 0 C64 10 68 22 68 32 Z', H.f(H.light(tan, 0.3)), 'stroke="none"');
    s += H.p('M88 34 C84 14 88 -6 98 -18 C108 -4 110 16 106 34 Z', H.f(tan));
    // head: armoured top (plates) and pointy snout
    s += H.p('M26 86 C24 46 56 20 98 20 C134 20 160 40 170 66 C186 72 202 82 204 96 C204 110 190 118 170 120 C144 130 82 130 56 120 C36 112 26 100 26 86 Z', H.f(tan));
    s += H.p('M34 70 C40 40 68 22 100 22 C126 22 148 34 160 54 C140 50 118 50 96 54 C74 58 54 64 34 70 Z', H.f(shell));
    s += H.p('M60 36 C62 46 64 54 66 62 M88 26 C90 36 92 46 92 56 M120 28 C120 36 120 44 118 52', 'none', 'stroke-width="2.6"');
    s += H.p('M100 90 C120 80 170 80 196 92 C206 98 206 108 196 114 C180 122 150 124 124 122 C104 120 96 110 100 90 Z', H.f(belly));
    s += H.e(200, 98, 4, 3, H.OUT, 'stroke="none"');
    s += H.eye(100, 86, 13, 17, '#2fb4a4');
    s += H.eye(140, 84, 9, 14, '#2fb4a4');
    s += H.p('M150 112 C160 118 176 118 186 112', 'none', 'stroke-width="3.2"');
    s += H.blush(82, 108) + H.blush(160, 104, 6, 4);
    return ['0 -24 222 230', s];
  },

  wormmon(H) {
    const green = '#64cc4a', seg = '#d6ec6a', pin = '#ff6a7a';
    let s = '';
    // tail segments curling behind
    s += H.e(52, 178, 16, 14, H.f(green)) + H.e(30, 166, 12, 11, H.f(green)) + H.e(18, 150, 9, 8, H.f(green));
    s += H.e(76, 184, 20, 16, H.f(green));
    // body segments with yellow bands and tiny feet
    s += H.e(108, 166, 32, 28, H.f(green));
    s += H.p('M80 160 C96 168 120 168 138 160 M82 176 C98 184 120 184 136 176', 'none', `stroke="${H.dark(seg, 0.2)}" stroke-width="5"`);
    s += H.e(96, 196, 8, 5, H.f(pin)) + H.e(124, 196, 8, 5, H.f(pin)) + H.e(70, 198, 7, 4, H.f(pin));
    // little pincer arms
    s += H.p('M138 154 C148 150 154 146 158 140', 'none', `stroke="${H.OUT}" stroke-width="11"`) + H.p('M138 154 C148 150 154 146 158 140', 'none', `stroke="${green}" stroke-width="6"`);
    s += H.claws([[158, 140, -50, 8], [160, 142, 0, 8]], pin);
    // head with two little horns, big blue eyes
    s += H.p('M78 34 C70 18 72 4 80 -4 C84 10 90 20 96 28 Z M124 28 C130 12 140 4 150 2 C148 14 142 26 136 34 Z', H.f(green));
    s += H.e(106, 84, 70, 58, H.f(green));
    s += H.sh('M40 104 C60 128 150 132 176 104 C168 126 140 140 106 140 C70 140 48 126 40 104 Z', green);
    s += H.p('M52 50 C68 42 84 40 100 42 M150 42 C162 46 170 52 176 60', 'none', `stroke="${H.dark(seg, 0.2)}" stroke-width="5"`);
    s += H.eye(100, 84, 17, 21, '#3a7ee0');
    s += H.eye(146, 82, 12, 17, '#3a7ee0');
    s += H.p('M146 116 l-4 8 M158 116 l4 8', 'none', `stroke="${pin}" stroke-width="5"`);
    s += H.p('M140 114 C146 118 156 118 162 114', 'none', 'stroke-width="3"');
    s += H.blush(80, 108) + H.blush(170, 104, 7, 4);
    return ['0 -12 220 216', s];
  },

  guilmon(H) {
    const red = '#e8382e', white = '#fff2ec', mark = '#2a1a22', eye = '#ffd23a';
    let s = '';
    s += H.p('M72 172 C50 176 30 170 18 154 C36 154 54 152 68 154 Z', H.f(red)) + H.p('M30 158 l8 4 l-8 4 M46 160 l7 4 l-7 4', 'none', `stroke="${mark}" stroke-width="3"`);
    s += H.p('M118 186 C118 178 130 174 142 176 C154 178 158 186 156 194 C154 200 146 202 136 202 L126 202 C120 202 118 196 118 186 Z', H.f(H.dark(red, 0.12)));
    s += H.claws([[152, 194, 20, 8], [148, 200, 50, 7]]);
    s += H.e(104, 160, 34, 30, H.f(red));
    s += H.e(112, 166, 20, 20, H.f(white), 'stroke="none"');
    s += H.p('M76 144 l10 6 l-10 6 M74 164 l9 5 l-9 5', 'none', `stroke="${mark}" stroke-width="3.4"`);
    s += H.p('M62 186 C62 176 74 172 88 174 C102 176 108 184 106 194 C104 202 96 204 84 204 L72 204 C64 204 62 196 62 186 Z', H.f(red));
    s += H.claws([[100, 198, 25, 8], [94, 203, 60, 7]]);
    s += H.p('M128 146 C140 144 150 136 156 128 C164 128 168 136 164 142 C158 150 146 154 132 156 Z', H.f(red));
    s += H.claws([[162, 130, -30, 9], [168, 138, 0, 9], [162, 146, 40, 8]]);
    s += H.p('M80 148 C68 146 60 140 56 132 C48 132 46 140 50 146 C56 154 66 158 80 160 Z', H.f(red));
    // little wing-ears
    s += H.p('M58 34 C42 22 34 8 36 -4 C46 0 52 6 58 4 C60 14 66 24 72 30 Z', H.f(red));
    s += H.p('M104 22 C100 8 104 -6 114 -12 C116 -2 122 4 128 4 C126 14 122 22 118 28 Z', H.f(red));
    s += H.p('M26 84 C24 42 56 16 100 16 C140 16 168 36 178 62 C194 66 206 78 206 92 C206 108 192 118 172 122 C146 132 84 132 58 122 C38 114 26 102 26 84 Z', H.f(red));
    s += H.p('M100 100 C120 92 168 92 198 100 C204 106 200 116 190 120 C164 128 130 130 110 124 C100 120 96 110 100 100 Z', H.f(white));
    s += H.p('M60 50 l12 8 l-14 4 M86 34 l6 12 l-10 -2', 'none', `stroke="${mark}" stroke-width="3.6"`);
    s += H.hi('M44 46 C58 32 78 24 98 22', 6, 0.5);
    s += H.eye(102, 76, 15, 18, eye, { slit: true, pupil: 0.22 });
    s += H.eye(144, 74, 10, 14, eye, { slit: true, pupil: 0.22 });
    s += H.e(196, 86, 2.4, 1.8, H.OUT, 'stroke="none"');
    s += H.p('M146 108 C158 116 178 116 192 106', 'none', 'stroke-width="3.4"') + H.p('M156 110 l3 6 l3 -6 Z M180 110 l3 6 l3 -7 Z', '#fff', 'stroke-width="1.8"');
    s += H.blush(84, 100) + H.blush(164, 100, 7, 4);
    return ['0 -20 220 226', s];
  },

  terriermon(H) {
    const fur = '#f8f4ea', green = '#5ac85a', horn = '#fff0c8';
    let s = '';
    s += H.e(88, 196, 14, 8, H.f(fur)) + H.e(124, 196, 14, 8, H.f(fur));
    s += H.e(106, 162, 32, 30, H.f(fur));
    s += H.p('M90 140 C96 150 98 160 96 170', 'none', `stroke="${green}" stroke-width="4"`);
    s += H.e(140, 152, 10, 8, H.f(fur)) + H.e(72, 152, 10, 8, H.f(fur));
    // long floppy ears with green
    s += H.p('M52 50 C24 50 2 70 -4 98 C-6 110 4 114 12 106 C22 92 36 80 56 72 Z', H.f(fur)) + H.p('M-2 100 C4 88 14 80 24 76 C18 86 14 98 12 106 C6 112 -4 108 -2 100 Z', H.f(green), 'stroke="none"');
    s += H.p('M158 50 C186 50 208 70 214 98 C216 110 206 114 198 106 C188 92 174 80 154 72 Z', H.f(fur)) + H.p('M212 100 C206 88 196 80 186 76 C192 86 196 98 198 106 C204 112 214 108 212 100 Z', H.f(green), 'stroke="none"');
    // head + small horn
    s += H.p('M100 22 C98 8 102 -2 108 -8 C114 -2 118 8 116 22 Z', H.f(horn));
    s += H.e(106, 84, 66, 58, H.f(fur));
    s += H.sh('M44 104 C64 128 150 132 172 104 C164 126 138 140 106 140 C74 140 52 126 44 104 Z', '#d8d4cc');
    s += H.p('M64 44 C72 40 80 38 88 38', 'none', `stroke="${green}" stroke-width="5"`);
    // dark shiny eyes, wide smile
    s += H.eye(92, 86, 13, 15, '#2a2a38', { pupil: 0.55 });
    s += H.eye(130, 84, 10, 13, '#2a2a38', { pupil: 0.55 });
    s += H.e(116, 102, 4, 3, H.OUT, 'stroke="none"');
    s += H.p('M100 110 C108 120 124 120 132 110', 'none', 'stroke-width="3.4"');
    s += H.blush(76, 108) + H.blush(146, 106, 8, 4.5);
    return ['-8 -14 236 222', s];
  },

  renamon(H) {
    const fox = '#f2c24a', white = '#fff8ec', glove = '#7a4ab8', eye = '#3a82e0';
    let s = '';
    // big fluffy tail
    s += H.p('M76 170 C48 176 22 160 14 134 C10 118 18 104 30 100 C30 120 42 136 64 146 Z', H.f(fox)) + H.p('M14 134 C10 118 18 104 30 100 C30 112 34 122 40 128 C30 132 20 134 14 134 Z', H.f(white), 'stroke="none"');
    s += H.p('M92 184 L88 198 M118 184 L122 198', 'none', `stroke="${H.OUT}" stroke-width="15"`) + H.p('M92 184 L88 198 M118 184 L122 198', 'none', `stroke="${fox}" stroke-width="9"`);
    s += H.e(86, 200, 10, 5, H.f(fox)) + H.e(124, 200, 10, 5, H.f(fox));
    s += H.e(104, 160, 30, 30, H.f(fox));
    s += H.p('M104 134 C118 136 128 148 126 164 C124 176 114 182 104 182 C96 176 94 156 104 134 Z', H.f(white), 'stroke="none"');
    s += H.p('M82 174 l8 4 M82 182 l8 2', 'none', `stroke="${glove}" stroke-width="3"`);
    // purple gloves with yin-yang
    s += H.p('M124 150 C136 146 144 140 148 132', 'none', `stroke="${H.OUT}" stroke-width="12"`) + H.p('M124 150 C136 146 144 140 148 132', 'none', `stroke="${fox}" stroke-width="6"`);
    s += H.e(154, 126, 13, 12, H.f(glove)) + H.e(154, 126, 5, 5, '#ffffff', 'stroke-width="2"') + H.p('M154 121 A2.5 2.5 0 0 1 154 126 A2.5 2.5 0 0 0 154 131 A5 5 0 0 0 154 121 Z', '#2a2a38', 'stroke="none"');
    s += H.e(72, 150, 12, 11, H.f(glove));
    // tall ears with white insides
    s += H.p('M52 50 C40 26 40 2 48 -14 C64 -4 78 16 84 34 Z', H.f(fox)) + H.p('M56 38 C50 22 50 8 52 -2 C62 6 70 20 74 30 Z', H.f(white), 'stroke="none"');
    s += H.p('M126 30 C134 12 148 -2 166 -8 C168 10 162 30 154 44 Z', H.f(fox)) + H.p('M132 30 C140 16 150 6 160 2 C160 16 156 28 150 38 Z', H.f(white), 'stroke="none"');
    // head with white muzzle and cheeks
    s += H.p('M30 86 C28 46 60 20 100 20 C138 20 164 40 172 66 C186 70 200 80 200 92 C200 106 188 116 170 120 C144 130 84 130 60 120 C40 112 30 100 30 86 Z', H.f(fox));
    s += H.p('M84 92 C104 82 150 80 186 88 C200 92 202 104 192 112 C176 122 140 126 112 124 C92 122 80 110 84 92 Z', H.f(white));
    s += H.p('M70 70 l10 -4 M70 80 l10 -2', 'none', `stroke="${glove}" stroke-width="3"`);
    s += H.eye(104, 76, 13, 16, eye, { brow: false });
    s += H.eye(142, 74, 9, 13, eye);
    s += H.p('M90 60 L118 66 M134 62 L152 62', 'none', 'stroke-width="3.4"');
    s += H.e(194, 92, 4, 3, H.OUT, 'stroke="none"');
    s += H.p('M150 108 C160 114 176 114 186 108', 'none', 'stroke-width="3"');
    s += H.blush(88, 100) + H.blush(158, 98, 7, 4);
    return ['0 -22 216 228', s];
  },
};
