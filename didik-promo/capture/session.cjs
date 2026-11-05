// One live DIDIK room driven end to end: a parent opens it, a host screen runs it, real player browser
// contexts join and answer by tapping the correct tile on screen. Local dev server only.
const fs = require('fs');
const { BASE, signIn, settle } = require('./lib.cjs');

const HOST_VIEW = { viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 }; // classroom projector size, 1920×1080 frames
const PHONE_VIEW = { viewport: { width: 405, height: 720 }, deviceScaleFactor: 8 / 3, isMobile: true, hasTouch: true }; // 1080×1920 frames

const quizCache = new Map();

async function quizById(ctx, id) {
  if (!quizCache.has(id)) quizCache.set(id, await (await ctx.request.get(`${BASE}/api/quizzes/${id}`)).json());
  return quizCache.get(id);
}

async function openRoom(parentCtx, quizId, mode, settings = {}) {
  const res = await parentCtx.request.post(`${BASE}/api/rooms`, {
    data: { quiz_id: quizId, mode, settings },
    headers: { origin: BASE },
  });
  const body = await res.json();
  if (!res.ok()) throw new Error(`open room ${mode}: ${res.status()} ${JSON.stringify(body)}`);
  return body;
}

async function newParent(browser) {
  const ctx = await browser.newContext(HOST_VIEW);
  await signIn(ctx);
  return ctx;
}

async function hostPage(parentCtx, code, page) {
  page = page || (await parentCtx.newPage());
  await page.goto(`${BASE}/hos/${code}`);
  await page.getByRole('button', { name: /Mula/ }).waitFor();
  await settle(page, 800);
  return page;
}

async function addBots(host, n) {
  const plus = host.getByRole('button', { name: 'Tambah bot' });
  for (let i = 0; i < n; i++) {
    await plus.click();
    await host.waitForTimeout(350);
  }
}

// `page` lets a recorded stage's page join instead of a fresh headless context.
async function joinPlayer(browser, slug, name, animal, view = PHONE_VIEW, page = null) {
  const ctx = page ? page.context() : await browser.newContext(view);
  page = page || (await ctx.newPage());
  await page.goto(`${BASE}/m/${slug}`);
  await page.getByRole('button', { name: /Masuk bilik/ }).waitFor();
  await page.getByRole('button', { name: new RegExp(`^${animal}$`) }).first().click();
  await page.locator('#own-name').fill(name);
  await settle(page, 300);
  return { ctx, page };
}

async function submitJoin(page) {
  await page.getByRole('button', { name: /Masuk bilik/ }).click();
  await page.getByText(/Tunggu hos tekan/).waitFor({ timeout: 15000 });
}

async function start(host) {
  await host.getByRole('button', { name: /Mula/ }).click();
}

// Looks at the question on screen, finds it in the quiz, and taps the right tile. Returns true if it answered.
// `wrong` answers incorrectly on purpose (used once to show the "Kenapa begitu?" explanation honestly).
async function answerVisible(page, quiz, { wrong = false } = {}) {
  // the standard question card, or Kuiz Interaktif's own card
  const prompt = page.locator('.question .prompt, #ik-prompt').first();
  if (!(await prompt.isVisible().catch(() => false))) return false;
  const text = (await prompt.innerText({ timeout: 800 }).catch(() => '')).trim();
  const q = quiz.questions.find((x) => x.prompt.trim() === text);
  if (!q) return false;
  let label;
  let tile;
  if (q.type === 'truefalse') {
    label = (wrong ? !q.answer : q.answer) ? 'Betul' : 'Salah';
    tile = page.locator('.tiles.tf .tile').filter({ hasText: label });
  } else if (q.type === 'single') {
    label = (wrong ? q.choices.find((c) => !c.correct) : q.choices.find((c) => c.correct)).text;
    tile = page.locator('.tiles .tile').filter({ has: page.locator('.text', { hasText: new RegExp(`^${escape(label)}$`) }) });
  } else if (['count', 'spell', 'sort', 'order'].includes(q.type)) {
    return answerTouch(page, q);
  } else {
    return false;
  }
  // Lompat! answers by jumping to an island instead of tapping a tile
  const btn = (await tile.count()) ? tile.first() : page.locator(`button[aria-label="Lompat ke ${label}"]`).first();
  if (!(await btn.isEnabled().catch(() => false))) return false;
  if (await btn.evaluate((b) => b.classList.contains('mine') || b.classList.contains('picked')).catch(() => false)) return false;
  await page.waitForTimeout(700 + Math.random() * 500); // a child reads before tapping
  await btn.click({ timeout: 3000 }).catch(() => {});
  return true;
}

// The touch-and-drag types, answered by tapping the way a child can (every type accepts taps as well as drags).
async function answerTouch(page, q) {
  const beat = (ms = 380) => page.waitForTimeout(ms + Math.random() * 160);
  const scope = page; // only one question is ever on screen
  if (q.type === 'count') {
    const add = scope.locator('.pile button.obj');
    if (!(await add.first().isEnabled().catch(() => false))) return false;
    await beat(700);
    for (let i = 0; i < q.answer; i++) { await add.first().click(); await beat(); }
    await beat(500);
    await scope.locator('button.check').click({ timeout: 4000 });
    return true;
  }
  if (q.type === 'spell') {
    const pool = scope.locator('.pool button.letter');
    if (!(await pool.first().isEnabled().catch(() => false))) return false;
    await beat(700);
    for (const ch of [...q.word]) {
      // a tapped tile flies to its box; wait for the pool to settle and retry instead of waiting 30 s
      const tile = scope.locator(`.pool button.letter[aria-label="Huruf ${ch.toUpperCase()}"], .pool button.letter[aria-label="Huruf ${ch.toLowerCase()}"]`).first();
      for (let attempt = 0; attempt < 4; attempt++) {
        if (await tile.click({ timeout: 1500 }).then(() => true).catch(() => false)) break;
        await page.waitForTimeout(300);
      }
      await beat();
    }
    await beat(500);
    await scope.locator('button.check').click({ timeout: 4000 });
    return true;
  }
  if (q.type === 'sort') {
    const groups = Object.fromEntries(q.groups.map((g) => [g.id, g.name]));
    if (!(await scope.locator('.pool button.thing').first().isEnabled().catch(() => false))) return false;
    await beat(700);
    for (const item of q.items) {
      await scope.locator('.pool button.thing').filter({ hasText: item.text }).first().click({ timeout: 3000 });
      await beat(300);
      // the baskets wiggle while a thing is picked, so a stability wait never ends; tap like a finger would
      await scope.getByRole('button', { name: `Masukkan ke ${groups[item.group]}` }).click({ force: true, timeout: 3000 });
      await beat();
    }
    await beat(500);
    await scope.locator('button.check').click({ timeout: 4000 });
    return true;
  }
  if (q.type === 'order') {
    await beat(700);
    for (const item of q.items) {
      await scope.locator('button.tile').filter({ hasText: new RegExp(`^${escape(item.text)}$`) }).first().click();
      await beat();
    }
    await scope.getByRole('button', { name: /Hantar/ }).click();
    return true;
  }
  return false;
}

function escape(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Keeps answering on every given page until `ms` passes. `extra(page)` runs between answers for game actions.
async function playFor(pages, quiz, ms, extra) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    for (const p of pages) {
      const answered = await answerVisible(p, quiz).catch(() => false);
      if (!answered && extra) await extra(p).catch(() => {});
    }
    await pages[0].waitForTimeout(250);
  }
}

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

module.exports = { HOST_VIEW, PHONE_VIEW, quizById, openRoom, newParent, hostPage, addBots, joinPlayer, submitJoin, start, answerVisible, playFor, ensureDir };
