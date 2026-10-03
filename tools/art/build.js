// Builds art/*.svg from the drawings in tools/art/*.draw.js.   node tools/art/build.js [id ...]
'use strict';
const fs = require('fs'), path = require('path');
const { make } = require('./lib');
const only = process.argv.slice(2);
const out = path.join(__dirname, '..', '..', 'art');
let count = 0;
for (const f of fs.readdirSync(__dirname).filter(f => f.endsWith('.draw.js')).sort()) {
  const list = require(path.join(__dirname, f));
  for (const [id, fn] of Object.entries(list)) {
    if (only.length && !only.includes(id)) continue;
    const H = make();
    const [vb, body] = fn(H);
    fs.writeFileSync(path.join(out, id + '.svg'), H.svg(vb, body));
    count++;
  }
}
console.log('wrote', count, 'svg files to art/');
