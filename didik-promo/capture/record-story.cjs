// Records a real Hikayat Lima Alam (Legenda) solo run: Aina picks a hero, the hero travels, every enemy
// is fought by answering real questions, and at the boss she picks the world's weak element first.
// Nothing is skipped faster than a child would: cinematics play for a few seconds before Teruskan.
//
//   node record-story.cjs <player:host|phone> <maxSeconds> <outDir> [untilWorldClear=1] [hostToo=1]
const fs = require('fs');
const path = require('path');
const { launch, signIn } = require('./lib.cjs');
const { Stage } = require('./stage.cjs');
const S = require('./session.cjs');

const [playerKind = 'host', maxArg = '300', outDir, untilArg = '1', hostArg = '1'] = process.argv.slice(2);
const MAX = Number(maxArg) * 1000;
const UNTIL_CLEAR = untilArg === '1';
const HOST_TOO = hostArg === '1';
const QUIZ = 12;
const WEAK = { 'Tasik Chini': 'Petir', 'Batang Lupar': 'Api', 'Hutan Larut': 'Angin', 'Rimba Bayangan': 'Tanah', 'Gunung Ledang': 'Air' };
const tag = playerKind === 'phone' ? 'phone_9x16' : 'player_1080p';

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await launch();
  const parent = await S.newParent(browser);
  const quiz = await S.quizById(parent, QUIZ);
  const room = await S.openRoom(parent, QUIZ, 'legenda', { max_players: 1 });

  const kid = await new Stage(playerKind).open();
  let hostStage = null;
  let host;
  if (HOST_TOO) {
    hostStage = await new Stage('host').open();
    await signIn(hostStage.context);
    host = await S.hostPage(hostStage.context, room.code, hostStage.page);
  } else {
    host = await S.hostPage(parent, room.code);
  }
  const { page } = await S.joinPlayer(browser, room.slug, 'Aina', 'Arnab', undefined, kid.page);
  await S.submitJoin(page);
  await host.waitForTimeout(800);

  await kid.record(path.join(outDir, `legenda_${tag}.mp4`));
  if (hostStage) await hostStage.record(path.join(outDir, `legenda_host_1080p.mp4`));
  const t0 = Date.now();
  await page.waitForTimeout(1200);
  await S.start(host);

  const log = [];
  const note = (s) => { log.push(`${((Date.now() - t0) / 1000).toFixed(1)}s ${s}`); };
  let shownSince = 0;
  let cleared = 0;
  let clearedAt = 0;
  while (Date.now() - t0 < MAX) {
    // hero choice
    const hero = page.locator('button.hero:enabled');
    if (await hero.first().isVisible().catch(() => false)) {
      await page.waitForTimeout(2200);
      await hero.first().click();
      note('pilih wira');
      continue;
    }
    // the boss: choose the weak element before answering
    const elements = page.locator('.elements button');
    if (await elements.first().isVisible().catch(() => false)) {
      const world = (await page.locator('.curtain p, .p-head .who').first().innerText({ timeout: 300 }).catch(() => '')) || '';
      const want = Object.entries(WEAK).find(([w]) => world.includes(w))?.[1] || 'Petir';
      const el = elements.filter({ hasText: want }).first();
      if ((await el.getAttribute('aria-checked').catch(() => null)) !== 'true' && (await el.isEnabled().catch(() => false))) {
        await page.waitForTimeout(900);
        await el.click().catch(() => {});
        note(`elemen ${want}`);
        await page.waitForTimeout(700);
      }
    }
    if (await S.answerVisible(page, quiz).catch(() => false)) {
      note('jawab');
      await page.waitForTimeout(600);
      continue;
    }
    // world cleared: stop here (or go on)
    const nextWorld = page.getByRole('button', { name: /Dunia seterusnya|Penamat/ });
    if (await nextWorld.isVisible().catch(() => false)) {
      if (!clearedAt) { clearedAt = Date.now(); cleared++; note('dunia selesai'); }
      if (UNTIL_CLEAR && Date.now() - clearedAt > 5000) break;
      if (!UNTIL_CLEAR && Date.now() - clearedAt > 4000) { await nextWorld.click(); clearedAt = 0; }
    }
    // cinematics and toasts: let them play, then Teruskan / Lawan!
    const go = page.getByRole('button', { name: /^(Teruskan|Lawan!)/ }).first();
    if (await go.isVisible().catch(() => false)) {
      if (!shownSince) shownSince = Date.now();
      if (Date.now() - shownSince > 2600) {
        await go.click().catch(() => {});
        note((await go.innerText().catch(() => '?')).trim());
        shownSince = 0;
      }
    } else {
      shownSince = 0;
    }
    await page.waitForTimeout(200);
  }
  const results = [await kid.stop()];
  if (hostStage) results.push(await hostStage.stop());
  fs.writeFileSync(path.join(outDir, `legenda_${tag}.json`), JSON.stringify({ room: room.code, cleared, log, results }, null, 2));
  console.log(JSON.stringify({ cleared, results, last: log.slice(-6) }));
  await kid.close();
  if (hostStage) await hostStage.close();
  await browser.close();
})().catch((e) => {
  console.error('FAIL legenda', e.message);
  process.exit(1);
});
