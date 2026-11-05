// Records the parent side and the join, as separate scenes on real browser windows:
//   landing_scroll   the front page, section by section
//   dashboard        parent dashboard, then Kuiz saya
//   create_quiz      a new quiz typed in the editor: title, question, picture, choices with stickers, Simpan
//   game_picker      "Pilih permainan" for the demo quiz, three families, then Lumba Sampan
//   host_lobby       the room opens (QR + code); Ali, Aina and Amir arrive in the square; Mula; countdown
//   phone_join       at the same time, on Ali's phone: type the code, pick Harimau, type "Ali", Masuk bilik
//
//   node record-parent.cjs <outDir> [scenes...]
const fs = require('fs');
const path = require('path');
const { BASE, launch, signIn, settle } = require('./lib.cjs');
const { Stage } = require('./stage.cjs');
const S = require('./session.cjs');

const [outDir, ...only] = process.argv.slice(2);
const want = (s) => !only.length || only.includes(s);
const QUIZ = 12;

async function smoothTo(page, selector, ms = 1600) {
  await page.evaluate(({ selector, ms }) => new Promise((done) => {
    const el = document.querySelector(selector);
    const from = window.scrollY;
    const to = el ? el.getBoundingClientRect().top + window.scrollY - 24 : document.body.scrollHeight;
    const t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      window.scrollTo(0, from + (to - from) * ease(t));
      t < 1 ? requestAnimationFrame(step) : done();
    };
    requestAnimationFrame(step);
  }), { selector, ms });
}

async function smoothBy(page, dy, ms = 1400) {
  await page.evaluate(({ dy, ms }) => new Promise((done) => {
    const from = window.scrollY;
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      window.scrollTo(0, from + dy * (1 - Math.pow(1 - t, 3)));
      t < 1 ? requestAnimationFrame(step) : done();
    };
    requestAnimationFrame(step);
  }), { dy, ms });
}

const typeSlow = (loc, text) => loc.pressSequentially(text, { delay: 55 });

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await launch();
  const parent = await S.newParent(browser);
  const hostStage = await new Stage('host').open();
  const page = hostStage.page;
  const clip = (name) => path.join(outDir, `${name}_1080p.mp4`);
  const done = [];

  if (want('landing_scroll')) {
    await page.goto(BASE);
    await settle(page, 1500);
    await hostStage.record(clip('landing_scroll'));
    await page.waitForTimeout(3500);
    for (const sel of ['#pulau', '#interaktif', '#hikayat', '#cara']) {
      await smoothTo(page, sel, 2200);
      await page.waitForTimeout(3200);
    }
    done.push(await hostStage.stop());
  }

  await signIn(hostStage.context);

  if (want('dashboard')) {
    await page.goto(`${BASE}/ibu-bapa`);
    await settle(page, 1500);
    await hostStage.record(clip('dashboard'));
    await page.waitForTimeout(3500);
    await page.getByRole('link', { name: 'Kuiz saya' }).first().click();
    await settle(page, 600);
    await page.waitForTimeout(2500);
    await smoothBy(page, 420, 1800);
    await page.waitForTimeout(1800);
    done.push(await hostStage.stop());
  }

  if (want('create_quiz')) {
    await page.goto(`${BASE}/ibu-bapa/kuiz/baru`);
    await settle(page, 1200);
    await hostStage.record(clip('create_quiz'));
    await page.waitForTimeout(1500);
    await typeSlow(page.getByPlaceholder('Contoh: Haiwan di Malaysia'), 'Kuiz Haiwan Comel');
    await page.waitForTimeout(400);
    await typeSlow(page.getByPlaceholder('Untuk siapa kuiz ini, atau apa yang dipelajari.'), 'Untuk Aina, 5 tahun.');
    await page.waitForTimeout(500);
    const prompt = page.getByPlaceholder('Contoh: Haiwan manakah yang mempunyai belalai?');
    // "gajah" in the question makes the editor suggest its picture (Guna gambar Gajah). The sticker dialog is
    // not opened: its category tabs include a "Sekolah & sains" label, kept off camera per the brief.
    await typeSlow(prompt, 'Berapakah kaki seekor gajah?');
    await page.waitForTimeout(900);
    const idea = page.getByRole('button', { name: 'Guna gambar Gajah' });
    await idea.waitFor({ timeout: 4000 }).catch(() => {});
    if (await idea.isVisible().catch(() => false)) {
      await page.waitForTimeout(500);
      await idea.click();
      await page.waitForTimeout(1200);
    }
    for (const [i, text] of ['4', '2', '6'].entries()) {
      await typeSlow(page.getByLabel(`Teks pilihan ${i + 1}`), text);
      await page.waitForTimeout(350);
    }
    await typeSlow(page.getByPlaceholder('Contoh: Gajah ialah satu-satunya haiwan di sini yang mempunyai belalai.'), 'Gajah berjalan dengan empat kaki yang besar dan kuat.').catch(() => {});
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Simpan/ }).first().click();
    await page.getByText(/disimpan/i).first().waitFor({ timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1800);
    await smoothTo(page, '#add-title', 2400);
    await page.waitForTimeout(3500);
    done.push(await hostStage.stop());
  }

  let room = null;
  if (want('game_picker')) {
    await page.goto(`${BASE}/ibu-bapa/kuiz/${QUIZ}/main`);
    await settle(page, 1500);
    await hostStage.record(clip('game_picker'));
    await page.waitForTimeout(2500);
    await smoothBy(page, 520, 2200);
    await page.waitForTimeout(1500);
    await smoothBy(page, 900, 3200);
    await page.waitForTimeout(1500);
    await smoothBy(page, 1100, 3200);
    await page.waitForTimeout(2200);
    await smoothTo(page, 'h1', 1800);
    await page.waitForTimeout(800);
    done.push(await hostStage.stop());
  }

  if (want('host_lobby')) {
    // The parent clicks Lumba Sampan on the picker; the room opens on the host screen.
    await page.goto(`${BASE}/ibu-bapa/kuiz/${QUIZ}/main`);
    await settle(page, 1200);
    await page.getByRole('button', { name: /Lumba Sampan/ }).first().click();
    await page.waitForURL(/\/hos\//);
    await page.getByRole('button', { name: /Mula/ }).waitFor();
    await settle(page, 800);
    const code = page.url().split('/hos/')[1];
    const info = await (await parent.request.get(`${BASE}/api/rooms/${code}`)).json();
    room = { code, slug: info.slug ?? info.room?.slug };

    const phone = await new Stage('phone').open();
    await phone.page.goto(BASE);
    await settle(phone.page, 1200);
    await hostStage.record(clip('host_lobby'));
    await phone.record(path.join(outDir, 'phone_join_9x16.mp4'));
    await page.waitForTimeout(2500);

    // Ali types the six digits on the front page, like a child reading them off the big screen
    const codeBox = phone.page.locator('input[inputmode="numeric"]').first();
    await codeBox.click();
    await codeBox.pressSequentially(code, { delay: 220 });
    await phone.page.waitForTimeout(600);
    await phone.page.getByRole('button', { name: /^Masuk/ }).first().click();
    await phone.page.getByRole('button', { name: /Masuk bilik/ }).waitFor();
    await phone.page.waitForTimeout(1500);
    await phone.page.getByRole('button', { name: /^Harimau$/ }).click();
    await phone.page.waitForTimeout(700);
    await phone.page.locator('#own-name').pressSequentially('Ali', { delay: 160 });
    await phone.page.waitForTimeout(800);
    await phone.page.getByRole('button', { name: /Masuk bilik/ }).click();
    await phone.page.getByText(/Tunggu hos tekan/).waitFor();
    await page.waitForTimeout(2500);

    const others = [];
    for (const [name, animal] of [['Aina', 'Arnab'], ['Amir', 'Kancil']]) {
      const k = await S.joinPlayer(browser, code, name, animal);
      await S.submitJoin(k.page);
      others.push(k);
      await page.waitForTimeout(2200);
    }
    await page.waitForTimeout(2000);
    await S.start(page);
    await page.waitForTimeout(7000); // countdown and the first question on both screens
    done.push(await hostStage.stop(), await phone.stop());
    await phone.close();
  }

  fs.writeFileSync(path.join(outDir, 'parent-scenes.json'), JSON.stringify({ room, done }, null, 2));
  console.log(JSON.stringify(done.map((d) => `${path.basename(d.file)} ${d.seconds}s`)));
  await hostStage.close();
  await browser.close();
})().catch((e) => {
  console.error('FAIL parent', e.message);
  process.exit(1);
});
