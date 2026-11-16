const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const out = path.join(__dirname, 'kframes');
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.join(__dirname, 'kinetic.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  const FPS = 30, DUR = 6;
  for (let f = 0; f < FPS * DUR; f++) {
    await p.evaluate(t => window.renderAt(t), f / FPS);
    await p.screenshot({ path: path.join(out, `f${String(f).padStart(4, '0')}.png`) });
  }
  await b.close();
})();
