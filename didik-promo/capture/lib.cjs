// Shared helpers for DIDIK capture scripts. Talks only to the local dev server.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = process.env.DIDIK_URL || 'http://localhost:8080';
const DEMO = { email: 'demo@didik.test', password: 'main-bersama' }; // localhost-only demo account from live/README.md
// The session cookie is cached outside the repo, so the server's login rate limit is hit once, not per script.
const STATE = process.env.DIDIK_STATE || path.join(require('os').tmpdir(), 'didik-capture-state.json');

async function launch() {
  return chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--hide-scrollbars'] });
}

// Signs the context in through the API so no credentials ever appear on screen.
async function signIn(context) {
  if (fs.existsSync(STATE)) {
    await context.addCookies(JSON.parse(fs.readFileSync(STATE, 'utf8')).cookies);
    const me = await context.request.get(`${BASE}/api/auth/me`);
    if (me.ok() && (await me.json())?.user) return;
  }
  const res = await context.request.post(`${BASE}/api/auth/login`, { data: DEMO, headers: { origin: BASE } });
  if (!res.ok()) throw new Error(`login failed ${res.status()} ${await res.text()}`);
  fs.writeFileSync(STATE, JSON.stringify(await context.storageState()));
}

async function settle(page, ms = 600) {
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(ms);
}

module.exports = { BASE, launch, signIn, settle };
