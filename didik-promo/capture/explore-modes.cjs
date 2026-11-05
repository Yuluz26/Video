// Exploration only (used during the audit, before the real takes): plays each mode for ~36 s with 3 bots and one real player, taps visible game buttons
// between answers, and logs every button label it saw so the real capture scripts can use exact names.
const fs = require('fs');
const { launch } = require('./lib.cjs');
const S = require('./session.cjs');
const OUT = process.argv[2];
const QUIZ = 12;
const DENY = /skrin penuh|bunyi|Keluar|Rehat|Tamat|Seterusnya$|Bacakan|Dengar|^\s*$/i;
const modes = process.argv.slice(3);

async function tapSomething(page, seen) {
  const buttons = page.locator('main button:visible, .arena button:visible, [role=dialog] button:visible');
  const n = await buttons.count();
  const options = [];
  for (let i = 0; i < n; i++) {
    const b = buttons.nth(i);
    const label = ((await b.getAttribute('aria-label', { timeout: 300 }).catch(() => null)) || (await b.innerText({ timeout: 300 }).catch(() => ''))).replace(/\s+/g, ' ').trim();
    if (!label) continue;
    seen.add(label);
    if (DENY.test(label) || /^(Huruf|Masukkan|Keluarkan|Kurangkan|Tambah bot)/.test(label)) continue;
    if (await b.isEnabled().catch(() => false)) options.push({ b, label });
  }
  const pick = options.find((o) => /seterusnya|teruskan|mula|pilih|main/i.test(o.label)) || options[Math.floor(Math.random() * options.length)];
  if (pick) {
    await pick.b.click({ timeout: 1500 }).catch(() => {});
    seen.add(`>> clicked: ${pick.label}`);
  }
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await launch();
  const parent = await S.newParent(browser);
  const quiz = await S.quizById(parent, QUIZ);
  for (const mode of modes) {
    const seen = new Set();
    try {
      const room = await S.openRoom(parent, QUIZ, mode);
      const host = await S.hostPage(parent, room.code);
      await S.addBots(host, 3);
      const ali = await S.joinPlayer(browser, room.slug, 'Ali', 'Harimau');
      await S.submitJoin(ali.page);
      await host.waitForTimeout(800);
      await host.screenshot({ path: `${OUT}/${mode}-0host-lobby.png` });
      await S.start(host);
      for (let i = 1; i <= 6; i++) {
        await S.playFor([ali.page], quiz, 6000, (p) => tapSomething(p, seen));
        await host.screenshot({ path: `${OUT}/${mode}-${i}host.png` });
        await ali.page.screenshot({ path: `${OUT}/${mode}-${i}ali.png` });
      }
      fs.writeFileSync(`${OUT}/${mode}-buttons.txt`, [...seen].join('\n'));
      await ali.ctx.close();
      await host.close();
      console.log('ok', mode);
    } catch (e) {
      fs.writeFileSync(`${OUT}/${mode}-buttons.txt`, [...seen].join('\n'));
      console.log('FAIL', mode, e.message.split('\n')[0]);
    }
  }
  await browser.close();
})();
