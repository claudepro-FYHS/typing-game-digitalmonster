const { chromium, LAUNCH } = require('./pw');
require('fs').mkdirSync(__dirname + '/shots', { recursive: true });
(async () => {
  const b = await chromium.launch(LAUNCH);
  const p = await b.newPage({ viewport: { width: 1500, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  for (const set of ['partners', 'knights', 'enemies', 'bosses', 'evbosses', 'skins']) {
    await p.goto(`http://localhost:8123/__t/gallery.html?set=${set}`);
    await p.waitForFunction(() => window.done, null, { timeout: 60000 });
    const missing = await p.evaluate(() => window.missing);
    if (missing.length) errs.push(set + ' missing art: ' + missing.join(', '));
    console.log(set + ':', await p.evaluate(() => document.querySelectorAll('#g canvas').length), 'pictures');
    await p.screenshot({ path: `${__dirname}/shots/g-${set}.png`, fullPage: true });
  }
  console.log('ERRORS:', errs.length ? errs : 'none'); if (errs.length) process.exitCode = 1;
  await b.close();
})();
