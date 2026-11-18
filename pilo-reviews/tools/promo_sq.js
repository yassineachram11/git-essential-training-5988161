const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const out = path.join(__dirname, 'sqframes'); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 540, height: 540 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.join(__dirname, 'promo-1-anim-sq.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  for (let f = 0; f < 180; f++) { await p.evaluate(t => window.renderAt(t), f / 30); await p.screenshot({ path: path.join(out, `f${String(f).padStart(4, '0')}.png`) }); }
  await b.close();
})();
