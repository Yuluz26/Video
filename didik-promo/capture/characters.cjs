// Renders DIDIK's own characters (chibi animals, mood poses, Didi's moods) from the art sheet (/gaya) to
// transparent PNGs at 4×, so the promo can animate the app's real characters.
const fs = require('fs');
const { BASE, launch, settle } = require('./lib.cjs');
const OUT = process.argv[2];
(async () => {
  const browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 4, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/gaya`);
  await settle(page, 1500);
  await page.addStyleTag({ content: 'html,body,main,.sheet,figure,.row{background:transparent!important;box-shadow:none!important}' });
  const out = [];
  for (const [section, prefix] of [['Watak', 'chibi'], ['Mood dan berjalan', 'mood'], ['Didi', 'didi']]) {
    const row = page.locator(`h1:text-is("${section}"), h2:text-is("${section}")`).locator('xpath=following-sibling::div[1]');
    const figs = row.locator('figure');
    for (let i = 0; i < (await figs.count()); i++) {
      const fig = figs.nth(i);
      const name = (await fig.locator('figcaption').innerText()).trim().toLowerCase().replace(/[^a-z]+/g, '-');
      const art = fig.locator(':scope > :first-child');
      const file = `${prefix}-${name}.png`;
      await art.screenshot({ path: `${OUT}/${file}`, omitBackground: true });
      out.push(file);
    }
  }
  console.log(out.join(' '));
  await browser.close();
})();
