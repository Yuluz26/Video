// Screenshots each game's own WorldBadge from the real game picker (4×), for the "14 permainan" visual.
const fs = require('fs');
const { BASE, launch, signIn, settle } = require('./lib.cjs');
const OUT = process.argv[2];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 4 });
  await signIn(ctx);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/ibu-bapa/kuiz/12/main`);
  await settle(page, 1500);
  const cards = page.locator('ul.games li');
  const n = await cards.count();
  const list = [];
  for (let i = 0; i < n; i++) {
    const card = cards.nth(i);
    const title = (await card.locator('.title').innerText()).trim();
    const badge = card.locator('.badge').first();
    if (!(await badge.count())) continue;
    await badge.scrollIntoViewIfNeeded();
    const file = `${String(list.length + 1).padStart(2, '0')}-${title.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '')}.png`;
    await badge.screenshot({ path: `${OUT}/${file}`, omitBackground: true });
    list.push({ title, file });
  }
  fs.writeFileSync(`${OUT}/badges.json`, JSON.stringify(list, null, 2));
  console.log(list.map((b) => b.title).join(' | '));
  await browser.close();
})();
