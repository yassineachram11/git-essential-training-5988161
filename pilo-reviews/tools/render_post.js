const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 540, height: 675 }, deviceScaleFactor: 2 });
  for (const n of process.argv.slice(2)) {
    await p.goto('file://' + path.join(__dirname, n + '.html'));
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(__dirname, 'pilo-' + n + '.png') });
  }
  await b.close();
})();
