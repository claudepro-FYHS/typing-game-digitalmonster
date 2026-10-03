// Rookie partners (chibi, 3/4 view facing right). viewBox 0 0 220 210, feet on y≈200.
'use strict';
module.exports = {
  gabumon(H) {
    const pelt = '#4a8ae6', stripe = '#2a4ea8', skin = '#ffd65a', fur = '#f4f8ff', horn = '#fff0c8';
    let s = '';
    // pelt tail with stripes
    s += H.p('M72 168 C48 168 26 158 18 140 C34 146 52 148 72 150 Z', H.f(pelt));
    s += H.p('M30 148 l8 -4 M44 151 l6 -6', 'none', `stroke="${stripe}" stroke-width="4"`);
    // feet (yellow, claws)
    s += H.p('M116 186 C116 178 128 174 140 176 C152 178 156 186 154 194 C152 200 144 202 134 202 L124 202 C118 202 116 196 116 186 Z', H.f(H.dark(skin, 0.12)));
    s += H.claws([[150, 194, 20, 9], [146, 200, 50, 8]]);
    // body: pelt with white front fur
    s += H.e(104, 158, 36, 32, H.f(pelt));
    s += H.p('M104 132 C126 134 138 150 136 168 C134 182 122 190 108 190 C98 190 92 180 94 166 C96 150 96 138 104 132 Z', H.f(fur), 'stroke-width="3"');
    s += H.p('M72 150 l10 4 M70 164 l10 0 M74 178 l9 -4', 'none', `stroke="${stripe}" stroke-width="4"`);
    s += H.p('M60 186 C60 176 72 172 86 174 C100 176 106 184 104 194 C102 202 94 204 82 204 L70 204 C62 204 60 196 60 186 Z', H.f(skin));
    s += H.claws([[98, 198, 25, 9], [92, 203, 60, 8]]);
    // little yellow arms with claws
    s += H.p('M126 148 C138 146 148 140 154 132 C162 132 166 140 162 146 C156 154 144 158 130 160 Z', H.f(skin));
    s += H.claws([[160, 134, -30, 10], [166, 142, 0, 10], [160, 150, 40, 9]]);
    s += H.p('M78 150 C66 148 58 142 54 134 C46 134 44 142 48 148 C54 156 64 160 78 162 Z', H.f(skin));
    // head: wolf pelt hood with ears, yellow face with snout, horn
    s += H.p('M42 40 L50 4 L76 28 Z', H.f(pelt)) + H.p('M50 14 L54 2 L70 24 Z', H.f(stripe), 'stroke="none"');
    s += H.p('M96 22 L118 -2 L126 30 Z', H.f(pelt));
    s += H.p('M26 84 C24 44 56 16 100 16 C142 16 170 38 178 64 C186 92 168 122 136 128 C100 134 60 130 40 116 C30 108 26 98 26 84 Z', H.f(pelt));
    s += H.p('M40 70 C52 64 62 66 70 74 M48 98 C58 94 66 96 72 104 M136 26 C146 34 150 44 150 52', 'none', `stroke="${stripe}" stroke-width="5"`);
    s += H.p('M78 74 C96 60 150 58 182 74 C200 82 208 94 204 106 C200 118 184 124 164 126 C130 132 96 130 82 118 C72 108 70 86 78 74 Z', H.f(skin));
    s += H.sh('M84 116 C110 128 160 128 200 110 C192 122 172 128 150 130 C120 132 96 128 84 116 Z', skin);
    s += H.p('M112 62 C108 46 116 30 132 22 C130 36 130 48 126 60 Z', H.f(horn));
    s += H.hi('M46 46 C60 32 78 26 96 24', 6, 0.5);
    s += H.eye(110, 90, 15, 19, '#e2402e', { brow: false });
    s += H.eye(152, 86, 10, 15, '#e2402e');
    s += H.e(198, 92, 2.4, 1.8, H.OUT, 'stroke="none"');
    s += H.p('M150 112 C162 118 180 116 194 108', 'none', 'stroke-width="3.4"') + H.p('M184 112 l3 6 l3 -7 Z', '#fff', 'stroke-width="1.8"');
    s += H.blush(92, 112) + H.blush(170, 108, 7, 4);
    return ['0 -6 220 214', s];
  },

  biyomon(H) {
    const pink = '#ff86b8', tip = '#ffd0e6', beak = '#ffcc3a', leg = '#ffb13a', crest = '#c86ad8';
    let s = '';
    // tail feathers
    s += H.p('M70 168 C50 172 32 166 22 152 C40 154 52 150 60 144 C50 140 40 132 36 122 C54 126 66 136 76 150 Z', H.f(pink));
    // legs with gold ring
    s += H.p('M92 184 L90 198 M122 184 L126 198', 'none', `stroke="${H.dark(leg, 0.2)}" stroke-width="7"`);
    s += H.p('M80 198 C84 194 96 194 100 198 M114 198 C120 194 132 194 138 198', 'none', `stroke="${leg}" stroke-width="7"`);
    s += H.e(124, 190, 7, 3.4, H.metal('#e8b830'));
    // body
    s += H.e(108, 158, 36, 32, H.f(pink));
    s += H.e(114, 166, 22, 20, H.f(tip), 'stroke="none"');
    // wings (as arms) raised, with lighter feather tips
    s += H.p('M134 146 C150 134 160 118 176 112 C176 128 170 140 160 148 C168 148 174 152 176 158 C160 162 146 160 134 156 Z', H.f(pink));
    s += H.p('M168 118 l4 -6 M170 130 l6 -2 M168 152 l6 4', 'none', `stroke="${H.OUT}" stroke-width="2.6"`);
    s += H.p('M80 146 C64 134 54 118 40 112 C40 128 46 140 56 148 C48 148 42 152 40 158 C56 162 70 160 80 156 Z', H.f(pink));
    // head + crest feathers
    s += H.p('M92 26 C88 8 96 -4 108 -6 C104 8 106 18 112 24 Z', H.f(crest));
    s += H.p('M112 22 C116 4 128 -4 140 -2 C132 8 128 16 128 26 Z', H.f(crest));
    s += H.p('M74 34 C64 18 66 4 76 -2 C78 14 84 24 92 30 Z', H.f(crest));
    s += H.e(104, 76, 74, 62, H.f(pink));
    s += H.sh('M40 104 C60 126 140 132 174 104 C166 126 140 138 104 138 C70 138 46 124 40 104 Z', pink);
    s += H.hi('M52 40 C66 26 86 20 104 20');
    // beak (to the right)
    s += H.p('M160 84 C176 78 196 82 210 92 C198 100 180 104 162 102 Z', H.f(beak));
    s += H.p('M162 96 C178 98 196 96 210 92', 'none', 'stroke-width="2.6"');
    s += H.eye(108, 76, 17, 22, '#3a86e0');
    s += H.eye(150, 72, 11, 17, '#3a86e0');
    s += H.blush(88, 104) + H.blush(158, 104, 7, 4);
    return ['0 -10 220 214', s];
  },

  tentomon(H) {
    const shell = '#d63a2c', body = '#9a5038', limb = '#cbbdb0', eye = '#36c25a';
    let s = '';
    // back shell wings
    s += H.p('M30 120 C20 90 40 60 76 56 C70 90 64 120 60 150 C46 146 34 136 30 120 Z', H.f(shell));
    // legs (two pairs) and feet
    s += H.p('M88 178 L84 198 M120 178 L126 198', 'none', `stroke="${H.dark(limb, 0.3)}" stroke-width="8"`);
    s += H.e(80, 200, 10, 5, H.f(limb)) + H.e(130, 200, 10, 5, H.f(limb));
    // round body with segments
    s += H.e(106, 158, 38, 32, H.f(body));
    s += H.p('M78 150 C96 156 116 156 136 150 M80 166 C98 172 116 172 134 166', 'none', `stroke="${H.dark(body, 0.3)}" stroke-width="3"`);
    // four little arms with claw tips
    s += H.p('M136 140 C148 134 158 128 166 126', 'none', `stroke="${H.OUT}" stroke-width="11"`) + H.p('M136 140 C148 134 158 128 166 126', 'none', `stroke="${limb}" stroke-width="6"`);
    s += H.p('M138 160 C150 160 160 162 168 166', 'none', `stroke="${H.OUT}" stroke-width="11"`) + H.p('M138 160 C150 160 160 162 168 166', 'none', `stroke="${limb}" stroke-width="6"`);
    s += H.claws([[166, 126, -20, 8], [168, 166, 20, 8]], H.light(limb, 0.4));
    // head: red helmet-shell with brown face, antennae
    s += H.p('M92 24 C88 8 92 -2 100 -6 M128 22 C134 8 142 2 150 0', 'none', 'stroke-width="3.4"');
    s += H.e(100, -6, 4, 4, H.f(shell)) + H.e(150, 0, 4, 4, H.f(shell));
    s += H.e(108, 78, 72, 60, H.f(shell));
    s += H.p('M60 96 C64 70 92 56 126 58 C160 60 182 80 182 102 C182 124 156 136 120 136 C84 136 58 122 60 96 Z', H.f(body));
    s += H.hi('M54 46 C70 30 92 22 114 22');
    // huge green bug eyes (no pupils) and mandibles
    s += H.e(104, 92, 20, 22, H.f(eye)) + H.e(98, 84, 6, 6, '#ffffff', 'stroke="none"');
    s += H.e(150, 90, 15, 19, H.f(eye)) + H.e(146, 82, 4.5, 4.5, '#ffffff', 'stroke="none"');
    s += H.p('M120 118 C124 128 132 130 136 124 M136 124 C140 130 148 128 150 120', 'none', 'stroke-width="3"');
    s += H.blush(82, 116) + H.blush(170, 112, 7, 4);
    return ['0 -12 220 218', s];
  },

  palmon(H) {
    const green = '#86d05a', petal = '#ff5aa8', center = '#ffd84a', leaf = '#3aa84a', vine = '#5ab04a';
    let s = '';
    // root feet
    s += H.p('M78 184 C70 194 66 200 60 202 L100 202 C98 194 96 188 92 184 Z', H.f(H.dark(green, 0.1)));
    s += H.p('M116 184 C114 192 114 198 118 202 L152 202 C146 198 140 192 132 184 Z', H.f(H.dark(green, 0.1)));
    // body
    s += H.e(106, 160, 32, 30, H.f(green));
    s += H.e(110, 166, 18, 18, H.f(H.light(green, 0.5)), 'stroke="none"');
    // vine arms with red claws
    s += H.p('M132 148 C146 144 158 136 166 126', 'none', `stroke="${H.OUT}" stroke-width="12"`) + H.p('M132 148 C146 144 158 136 166 126', 'none', `stroke="${vine}" stroke-width="7"`);
    s += H.claws([[166, 126, -60, 10], [168, 128, -20, 10], [166, 132, 20, 9]], '#ff6a5a');
    s += H.p('M80 148 C66 146 56 140 50 130', 'none', `stroke="${H.OUT}" stroke-width="12"`) + H.p('M80 148 C66 146 56 140 50 130', 'none', `stroke="${vine}" stroke-width="7"`);
    // leaves on the side of the head
    s += H.p('M34 96 C12 92 0 80 -2 66 C16 66 30 76 38 88 Z', H.f(leaf));
    // head
    s += H.e(106, 82, 72, 58, H.f(green));
    s += H.sh('M40 104 C60 128 150 132 176 104 C168 126 140 140 106 140 C70 140 48 126 40 104 Z', green);
    // big flower on top: 5 petals + centre
    for (let i = 0; i < 5; i++) { const a = (-90 + i * 72) * Math.PI / 180; s += H.e(98 + Math.cos(a) * 24, 22 + Math.sin(a) * 18, 18, 14, H.f(petal), `transform="rotate(${-90 + i * 72 + 90} ${98 + Math.cos(a) * 24} ${22 + Math.sin(a) * 18})"`); }
    s += H.e(98, 22, 12, 10, H.f(center));
    s += H.eye(110, 84, 15, 19, '#4aa83a');
    s += H.eye(150, 82, 10, 15, '#4aa83a');
    s += H.p('M130 112 C138 120 154 120 162 112', 'none', 'stroke-width="3.4"');
    s += H.blush(90, 106) + H.blush(166, 104, 7, 4);
    return ['-6 -20 226 226', s];
  },

  gomamon(H) {
    const fur = '#f4f6fb', hair = '#ff6a32', mark = '#a35ad8', claw = '#2a2a3a';
    let s = '';
    // tail flipper
    s += H.p('M70 176 C50 182 30 176 18 164 C34 162 48 160 60 154 Z', H.f(fur));
    // body lying low + front flippers with black claws
    s += H.e(104, 166, 44, 28, H.f(fur));
    s += H.p('M76 158 l8 8 l-8 8 M88 156 l6 10 l-6 10', 'none', `stroke="${mark}" stroke-width="4"`);
    s += H.p('M120 180 C120 172 132 168 146 170 C160 172 164 180 162 188 C160 196 150 198 138 198 C126 198 120 192 120 180 Z', H.f(fur));
    s += H.claws([[160, 186, 10, 9], [156, 194, 50, 9]], claw);
    s += H.p('M66 182 C66 174 76 170 88 172 C100 174 104 182 102 190 C100 198 92 200 82 200 C70 200 66 194 66 182 Z', H.f(fur));
    s += H.claws([[100, 190, 20, 9], [96, 198, 60, 8]], claw);
    // head with orange mohawk and purple forehead marks
    s += H.p('M60 36 C58 14 72 -2 90 -6 C84 8 86 16 92 22 C94 6 108 -4 124 -4 C114 8 112 18 116 26 C122 14 136 8 150 12 C138 20 134 30 136 40 Z', H.f(hair));
    s += H.e(104, 82, 74, 58, H.f(fur));
    s += H.sh('M38 104 C60 128 150 132 178 104 C170 128 140 140 104 140 C70 140 46 126 38 104 Z', fur);
    s += H.p('M88 36 l8 10 l8 -10 M110 34 l8 10 l8 -10', 'none', `stroke="${mark}" stroke-width="4.5"`);
    s += H.eye(108, 82, 15, 19, '#3cb85a');
    s += H.eye(148, 80, 10, 15, '#3cb85a');
    // big grin + nose
    s += H.e(176, 92, 6, 4.5, '#2a2a3a', 'stroke-width="2"');
    s += H.p('M122 110 C142 122 170 120 186 106 C182 124 164 132 146 132 C132 132 124 124 122 110 Z', '#7a1a28');
    s += H.p('M136 126 C146 120 162 120 172 124 C164 131 146 132 136 126 Z', '#ff7a96', 'stroke="none"');
    s += H.blush(88, 108);
    return ['0 -12 220 216', s];
  },

  patamon(H) {
    const body = '#ffa646', belly = '#ffe6b4', wing = '#d8803a';
    let s = '';
    // little feet
    s += H.e(88, 194, 14, 8, H.f(body)) + H.e(124, 194, 14, 8, H.f(body));
    // round body (hamster-like)
    s += H.e(106, 160, 40, 36, H.f(body));
    s += H.e(110, 168, 26, 24, H.f(belly), 'stroke="none"');
    // tiny arms
    s += H.e(144, 152, 10, 8, H.f(body)) + H.e(70, 152, 10, 8, H.f(body));
    // big wing-ears spread out
    s += H.p('M60 54 C36 34 10 34 -4 46 C10 50 16 58 18 66 C8 66 2 72 0 80 C18 78 34 82 46 90 Z', H.f(wing));
    s += H.p('M156 50 C180 30 206 30 220 42 C206 46 200 54 198 62 C208 62 214 68 216 76 C198 74 182 78 170 86 Z', H.f(wing));
    s += H.p('M18 66 C30 70 40 76 46 84 M198 62 C186 66 176 72 170 80', 'none', 'stroke-width="2.6"');
    // head
    s += H.e(108, 84, 66, 58, H.f(body));
    s += H.e(126, 108, 30, 18, H.f(belly), 'stroke="none"');
    s += H.hi('M60 46 C74 34 92 30 108 30');
    s += H.eye(104, 84, 15, 19, '#3a7ee0');
    s += H.eye(144, 82, 10, 15, '#3a7ee0');
    s += H.e(160, 102, 5, 3.5, '#6a2a14', 'stroke="none"');
    s += H.p('M136 114 C142 120 152 120 158 114', 'none', 'stroke-width="3.2"');
    s += H.blush(84, 106) + H.blush(160, 112, 7, 4);
    return ['-6 4 232 206', s];
  },

  gatomon(H) {
    const fur = '#fbf8f2', ear = '#c87ae0', glove = '#ffd84a', stripe = '#e8402e', tail = '#a35ad8';
    let s = '';
    // tail with purple stripes, gold ring
    s += H.p('M76 170 C50 172 30 158 24 132 C22 118 28 106 38 104', 'none', `stroke="${H.OUT}" stroke-width="13"`);
    s += H.p('M76 170 C50 172 30 158 24 132 C22 118 28 106 38 104', 'none', `stroke="${fur}" stroke-width="7"`);
    s += H.p('M30 152 l6 -5 M24 132 l8 0 M28 114 l7 3', 'none', `stroke="${tail}" stroke-width="4"`);
    s += H.e(40, 162, 7, 5, H.metal('#e8b830'), 'transform="rotate(-30 40 162)"');
    // legs + body
    s += H.p('M90 182 L88 198 M118 182 L122 198', 'none', `stroke="${H.OUT}" stroke-width="14"`) + H.p('M90 182 L88 198 M118 182 L122 198', 'none', `stroke="${fur}" stroke-width="8"`);
    s += H.e(86, 200, 10, 5, H.f(fur)) + H.e(124, 200, 10, 5, H.f(fur));
    s += H.e(104, 160, 30, 28, H.f(fur));
    // arms with big yellow gloves (red stripes, claws)
    s += H.p('M126 150 C138 146 146 140 150 132', 'none', `stroke="${H.OUT}" stroke-width="12"`) + H.p('M126 150 C138 146 146 140 150 132', 'none', `stroke="${fur}" stroke-width="6"`);
    s += H.e(156, 126, 13, 12, H.f(glove)) + H.p('M150 118 l4 14 M158 116 l2 16', 'none', `stroke="${stripe}" stroke-width="3"`);
    s += H.claws([[164, 116, -60, 9], [168, 122, -20, 9], [166, 132, 20, 8]], '#ffffff');
    s += H.e(70, 150, 12, 11, H.f(glove)) + H.p('M66 142 l2 14 M74 142 l0 15', 'none', `stroke="${stripe}" stroke-width="3"`);
    // head with big ears (purple inside)
    s += H.p('M54 50 C40 24 42 0 52 -14 C68 -2 82 18 88 34 Z', H.f(fur)) + H.p('M58 38 C50 20 52 6 56 -4 C66 6 74 20 78 32 Z', H.f(ear), 'stroke="none"');
    s += H.p('M128 30 C136 12 150 -2 168 -8 C170 10 164 30 156 44 Z', H.f(fur)) + H.p('M134 30 C142 16 152 6 162 2 C162 16 158 28 152 38 Z', H.f(ear), 'stroke="none"');
    s += H.e(106, 82, 70, 56, H.f(fur));
    s += H.sh('M40 104 C60 126 150 130 176 104 C168 126 140 138 106 138 C72 138 48 126 40 104 Z', '#d8d2e4');
    s += H.p('M60 50 C70 54 78 60 84 68 M60 66 C68 68 76 72 80 78', 'none', `stroke="${tail}" stroke-width="3.6"`);
    s += H.eye(108, 82, 14, 20, '#3a82e0', { slit: true, pupil: 0.24 });
    s += H.eye(148, 80, 9, 15, '#3a82e0', { slit: true, pupil: 0.24 });
    s += H.p('M162 102 l4 4 l4 -4 Z', '#ff8aa0', 'stroke-width="2"');
    s += H.p('M158 112 C162 116 166 116 166 110 C166 116 172 116 174 112', 'none', 'stroke-width="2.6"');
    s += H.p('M172 104 L196 98 M172 110 L198 112 M74 104 L52 100 M74 110 L50 114', 'none', 'stroke-width="2.2"');
    s += H.blush(88, 108) + H.blush(170, 120, 6, 4);
    return ['0 -20 220 226', s];
  },
};
