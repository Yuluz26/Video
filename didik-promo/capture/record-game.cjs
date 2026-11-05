// Records one real DIDIK 2D game as two clips captured at the same time: the host's big screen
// (1920×1080) and Ali's phone (1080×1920), each a real browser window on its own X display recorded by
// ffmpeg. Ali, Aina and Amir join with the room link and answer by tapping the correct tile; practice
// bots fill out the class.
//
//   node record-game.cjs <mode> <seconds> <outDir> [quizId]
const fs = require('fs');
const path = require('path');
const { launch, signIn } = require('./lib.cjs');
const { Stage } = require('./stage.cjs');
const S = require('./session.cjs');

const [mode, secondsArg, outDir, quizArg] = process.argv.slice(2);
const SECONDS = Number(secondsArg || 20);
const QUIZ = Number(quizArg || 12);
// optional: room settings as JSON, and which of Ali's answers is a genuine mistake (shows the explanation)
const SETTINGS = JSON.parse(process.env.ROOM_SETTINGS || '{}');
const WRONG_AT = Number(process.env.ALI_WRONG_AT || 0);
// HOST_END=1: when the time is up the host presses Tamat → Ya, tamat, and the podium is recorded too
const HOST_END = process.env.HOST_END === '1';
const TAG = process.env.TAG ? `_${process.env.TAG}` : ''; // a second take of the same game keeps its own files

// What a child does between questions in each game, most interesting first. Labels are the game's own.
const ACTIONS = {
  harta: [/^Gali tempat/],
  pasukan: [/^Tawan petak/],
  kebun: [/Ketik untuk menuai/, /Ketik untuk siram/, /Ketik untuk menanam/],
  pancing: [/^Guna umpan emas/, /^Lempar joran$/],
  keretapi: [/^Tambah gerabak/, /^Jalan ke (?!Bandar)/], // never drive to the "Bandar" station
  pasar: [/^Jual [1-9]/, /· RM \d+$/],
  kubu: [/^Pacak bendera/, /^Bina tembok/, /^Tambah tingkat/],
};

// Kampung Kita: pick a decoration, then tap a free spot on the shared field to place it.
async function villageStep(page, state) {
  if (Date.now() < state.until) return;
  const field = page.locator('button[aria-label^="Letak "]').first();
  if (await field.isVisible().catch(() => false)) {
    const box = await field.boundingBox();
    await page.mouse.click(box.x + box.width * (0.15 + Math.random() * 0.7), box.y + box.height * (0.2 + Math.random() * 0.6));
    state.log.push('Letak hiasan');
    state.until = Date.now() + 1500;
    return;
  }
  const choices = page.locator('.choices button.choice');
  if ((await choices.count()) && Math.random() < 0.6) {
    await choices.nth(Math.floor(Math.random() * (await choices.count()))).click().catch(() => {});
    state.until = Date.now() + 500;
    return;
  }
  await act(page, [], state);
}
const NEXT = /Soalan seterusnya|Teruskan|Buka soalan|Lihat hadiah/;

async function act(page, rules, state) {
  if (Date.now() < state.until) return;
  // Kebun Ajaib: tapping an empty plot opens the seed picker; choose a seed the child can afford
  const seed = page.locator('section.seeds button.seed:enabled');
  if (await seed.count()) {
    await page.waitForTimeout(500);
    await seed.nth(Math.floor(Math.random() * (await seed.count()))).click().catch(() => {});
    state.log.push('Pilih benih');
    state.until = Date.now() + 1200;
    return;
  }
  // the result panel with "Soalan seterusnya" sits outside <main>, so look at every visible button
  const buttons = page.locator('button:visible');
  const n = await buttons.count();
  const seen = [];
  for (let i = 0; i < n; i++) {
    const b = buttons.nth(i);
    const label = ((await b.getAttribute('aria-label', { timeout: 300 }).catch(() => null)) || (await b.innerText({ timeout: 300 }).catch(() => ''))).replace(/\s+/g, ' ').trim();
    if (label && !/skrin penuh|bunyi|stiker|Bacakan|Dengar/i.test(label) && (await b.isEnabled().catch(() => false))) seen.push({ b, label });
  }
  for (const rule of rules) {
    const hits = seen.filter((s) => rule.test(s.label));
    if (hits.length) {
      const pick = hits[Math.floor(Math.random() * hits.length)];
      await pick.b.click({ timeout: 2000 }).catch(() => {});
      state.log.push(pick.label);
      state.until = Date.now() + 1300; // let the action's animation play before the next tap
      return;
    }
  }
  const next = seen.find((s) => NEXT.test(s.label));
  if (next) {
    await page.waitForTimeout(900);
    await next.b.click({ timeout: 2000 }).catch(() => {});
    state.log.push(next.label);
    state.until = Date.now() + 600;
  }
}

// Hutan Misteri: walk toward the nearest closed chest with the arrow keys, then press "Buka peti".
async function forestStep(page, state) {
  const open = page.getByRole('button', { name: /Buka peti$|Keluar!/ });
  if (await open.isVisible().catch(() => false)) {
    await open.click().catch(() => {});
    state.log.push('Buka peti');
    return;
  }
  const next = page.getByRole('button', { name: NEXT });
  if (await next.isVisible().catch(() => false)) {
    await page.waitForTimeout(800);
    await next.click().catch(() => {});
    return;
  }
  const me = await page.locator('text=Kamu').first().boundingBox().catch(() => null);
  const chests = await page.locator('[aria-label="Buka peti soalan"]').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })).catch(() => []);
  if (!me || !chests.length) return;
  const mx = me.x + me.width / 2;
  const my = me.y + me.height + 30;
  chests.sort((a, b) => Math.hypot(a.x - mx, a.y - my) - Math.hypot(b.x - mx, b.y - my));
  const target = chests[0];
  const dx = target.x - mx;
  const dy = target.y - my;
  const stuck = state.last && Math.hypot(state.last.x - mx, state.last.y - my) < 3;
  let key = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : dy > 0 ? 'ArrowDown' : 'ArrowUp';
  if (stuck) key = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'][Math.floor(Math.random() * 4)];
  state.last = { x: mx, y: my };
  await page.keyboard.down(key);
  await page.waitForTimeout(stuck ? 450 : 260);
  await page.keyboard.up(key);
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await launch();
  const parent = await S.newParent(browser);
  const quiz = await S.quizById(parent, QUIZ);
  const room = await S.openRoom(parent, QUIZ, mode, SETTINGS);
  const hostStage = await new Stage('host').open();
  const phoneStage = await new Stage('phone').open();
  await signIn(hostStage.context);
  const host = await S.hostPage(hostStage.context, room.code, hostStage.page);
  await S.addBots(host, mode === 'hutan' ? 3 : 4);

  const kids = [
    await S.joinPlayer(browser, room.slug, 'Ali', 'Harimau', undefined, phoneStage.page),
    await S.joinPlayer(browser, room.slug, 'Aina', 'Arnab'),
    await S.joinPlayer(browser, room.slug, 'Amir', 'Kancil'),
  ];
  for (const k of kids) await S.submitJoin(k.page);
  await host.waitForTimeout(1200);

  await Promise.all([hostStage.record(path.join(outDir, `${mode}${TAG}_host_1080p.mp4`)), phoneStage.record(path.join(outDir, `${mode}${TAG}_phone_9x16.mp4`))]);
  const t0 = Date.now();
  await host.waitForTimeout(1500); // the lobby with everyone in it, before Mula
  await S.start(host);

  const states = kids.map(() => ({ until: 0, log: [], answers: 0 }));
  const rules = ACTIONS[mode] || [];
  const end = Date.now() + SECONDS * 1000;
  while (Date.now() < end) {
    for (const [i, k] of kids.entries()) {
      const wrong = i === 0 && WRONG_AT > 0 && states[0].answers + 1 === WRONG_AT;
      const answered = await S.answerVisible(k.page, quiz, { wrong }).catch(() => false);
      if (answered) {
        states[i].answers++;
        states[i].log.push(wrong ? 'jawapan salah (sengaja)' : 'jawab');
        continue;
      }
      if (mode === 'hutan') await forestStep(k.page, states[i]).catch(() => {});
      else if (mode === 'kampung') await villageStep(k.page, states[i]).catch(() => {});
      else await act(k.page, rules, states[i]).catch(() => {});
    }
    await host.waitForTimeout(150);
  }

  if (HOST_END) {
    await host.getByRole('button', { name: /Tamat/ }).first().click();
    await host.waitForTimeout(900);
    await host.getByRole('button', { name: /Ya, tamat/ }).click();
    await host.getByRole('heading', { name: 'Tamat!' }).waitFor({ timeout: 10000 }).catch(() => {});
    await host.waitForTimeout(9000);
  }
  const [host_, phone] = await Promise.all([hostStage.stop(), phoneStage.stop()]);
  const report = { mode, room: room.code, quiz: QUIZ, seconds: (Date.now() - t0) / 1000, host: host_, phone, actions: states.map((s) => s.log) };
  fs.writeFileSync(path.join(outDir, `${mode}${TAG}.json`), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ mode, host: host_, phone, actions: states[0].log.slice(0, 12) }));
  await Promise.all([hostStage.close(), phoneStage.close()]);
  await browser.close();
})().catch((e) => {
  console.error('FAIL', mode, e.message);
  process.exit(1);
});
