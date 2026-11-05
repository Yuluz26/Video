// Renders the real DIDIK logo component from the running app to transparent PNGs (no redrawing).
const { BASE, launch, settle } = require('./lib.cjs');
const OUT = process.argv[2];
(async () => {
  const browser = await launch();
  for (const [variant, light] of [['light', true], ['dark', false]]) {
    const ctx = await browser.newContext({ viewport: { width: 900, height: 400 }, deviceScaleFactor: 8 });
    const page = await ctx.newPage();
    await page.goto(BASE);
    await settle(page, 2500);
    await page.evaluate((light) => {
      const logo = document.querySelector('a.logo');
      logo.classList.toggle('light', light);
      const holder = document.createElement('div');
      holder.id = 'brand-holder';
      holder.style.cssText = 'position:fixed;inset:0;display:grid;place-items:center;background:transparent;z-index:99999';
      holder.appendChild(logo);
      document.body.replaceChildren(holder);
      document.documentElement.style.background = 'transparent';
      document.body.style.background = 'transparent';
    }, light);
    await page.addStyleTag({ content: 'html,body{background:transparent!important}body::before,body::after{display:none!important}' });
    await page.waitForTimeout(2500); // letters pop in once
    await page.locator('a.logo').screenshot({ path: `${OUT}/didik-logo-${variant}.png`, omitBackground: true });
    await ctx.close();
  }
  await browser.close();
})();
