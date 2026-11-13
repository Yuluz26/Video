// A recordable browser window: its own Xvfb display at the exact output size, a kiosk Chromium window
// (no browser chrome) rendering at a forced device scale factor, and ffmpeg x11grab recording it at a
// constant 30 fps. This gives true device-pixel frames (CDP screencast is capped at CSS pixels).
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const SIZES = {
  host: { w: 1920, h: 1080, scale: 1.5 }, // 1280×720 CSS, a classroom projector
  phone: { w: 1080, h: 1920, scale: 8 / 3, mobile: true }, // 405×720 CSS, a phone
};

// PHONE_SCALE=2 renders the same 405×720 phone at 810×1440: fewer pixels for scenes too heavy for a GPU-less
// machine to paint at 30 fps (Hikayat's boss fights); the clip is scaled to 1080×1920 afterwards
if (process.env.PHONE_SCALE) {
  const k = Number(process.env.PHONE_SCALE);
  Object.assign(SIZES.phone, { w: Math.round(405 * k), h: Math.round(720 * k), scale: k });
}

let nextDisplay = 90 + (process.pid % 7) * 10;

const WARP = Number(process.env.TIME_WARP || 1);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class Stage {
  constructor(kind) {
    this.kind = kind;
    this.size = SIZES[kind];
    this.display = `:${nextDisplay++}`;
  }

  async open() {
    const { w, h, scale, mobile } = this.size;
    // the phone display is taller: its window keeps a tab strip above the emulated page, recorded around
    this.screen = { w: mobile ? Math.max(w, 1400) : w, h: mobile ? h + 600 : h };
    this.xvfb = spawn('Xvfb', [this.display, '-screen', '0', `${this.screen.w}x${this.screen.h}x24`, '-nolisten', 'tcp', '-ac'], { stdio: 'ignore' });
    await sleep(700);
    this.profile = fs.mkdtempSync(path.join(require('os').tmpdir(), `didik-${this.kind}-`));
    // a clean profile with Malay as the browser language and no Translate bubble over the page
    fs.mkdirSync(path.join(this.profile, 'Default'), { recursive: true });
    fs.writeFileSync(path.join(this.profile, 'Default', 'Preferences'), JSON.stringify({ translate: { enabled: false }, intl: { accept_languages: 'ms-MY,ms' } }));
    this.context = await chromium.launchPersistentContext(this.profile, {
      headless: false,
      // A phone is narrower than Chrome's minimum window, so it is emulated inside the window at the same
      // scale; the emulated 405×720 page then covers the display exactly. The host window is the page.
      viewport: mobile ? { width: Math.round(w / scale), height: Math.round(h / scale) } : null,
      deviceScaleFactor: mobile ? scale : undefined,
      isMobile: !!mobile,
      hasTouch: !!mobile,
      userAgent: mobile ? 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36' : undefined,
      locale: 'ms-MY',
      env: { ...process.env, DISPLAY: this.display },
      // --window-size is in CSS pixels; with the forced scale factor the window fills the display exactly
      args: ['--kiosk', `--window-size=${Math.round(w / scale)},${Math.round(h / scale)}`, '--lang=ms-MY', '--disable-translate', '--window-position=0,0', `--force-device-scale-factor=${scale}`, '--hide-scrollbars',
        '--autoplay-policy=no-user-gesture-required', '--disable-infobars', '--noerrdialogs', '--disable-features=Translate,TranslateUI'],
      ignoreDefaultArgs: ['--enable-automation'],
    });
    // The recorded window is a kiosk window that already fills its display, i.e. full screen. Tell the page
    // so: DIDIK asks to go full screen on join and when a hero is chosen, and real fullscreen requests from
    // an emulated phone would move the page off the recorded area (or never settle).
    await this.context.addInitScript(() => {
      const root = () => document.documentElement;
      for (const key of ['fullscreenElement', 'webkitFullscreenElement']) {
        Object.defineProperty(Document.prototype, key, { configurable: true, get: root });
      }
      Element.prototype.requestFullscreen = function () {
        setTimeout(() => document.dispatchEvent(new Event('fullscreenchange')));
        return Promise.resolve();
      };
      Document.prototype.exitFullscreen = function () { return Promise.resolve(); };
    });
    // FPS_LOG=1: count the page's own animation frames per second, to tell app jank from capture jank
    if (process.env.FPS_LOG === '1') {
      await this.context.addInitScript(() => {
        window.__fps = [];
        let n = 0;
        let t0 = performance.now();
        const tick = (now) => {
          n++;
          if (now - t0 >= 1000) { window.__fps.push(Math.round((n * 1000) / (now - t0))); n = 0; t0 = now; }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }
    // TIME_WARP=K: the page lives K times slower (its clock, animation frames, timers, CSS/Web animations
    // and videos), and the recording is sped back up K times in stop(). A GPU-less machine cannot paint
    // Hikayat's boss fights at 30 fps in real time; slowed down it paints every frame, so the clip plays
    // at the game's true speed and smoothness. The server is left on real time (it only waits on answers).
    if (WARP > 1) {
      await this.context.addInitScript((K) => {
        const realNow = performance.now.bind(performance);
        const t0 = realNow();
        const now = () => t0 + (realNow() - t0) / K;
        performance.now = now;
        const raf = window.requestAnimationFrame.bind(window);
        window.requestAnimationFrame = (cb) => raf(() => cb(now()));
        const st = window.setTimeout.bind(window);
        const si = window.setInterval.bind(window);
        window.setTimeout = (fn, ms = 0, ...a) => st(fn, (Number(ms) || 0) * K, ...a);
        window.setInterval = (fn, ms = 0, ...a) => si(fn, (Number(ms) || 0) * K, ...a);
        const slow = (m) => { try { m.defaultPlaybackRate = 1 / K; m.playbackRate = 1 / K; } catch {} };
        const play = HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play = function (...a) { slow(this); return play.apply(this, a); };
        for (const ev of ['loadedmetadata', 'play', 'playing', 'ratechange']) {
          document.addEventListener(ev, (e) => { if (e.target instanceof HTMLMediaElement && e.target.playbackRate !== 1 / K) slow(e.target); }, true);
        }
      }, WARP);
    }
    this.page = this.context.pages()[0] || (await this.context.newPage());
    this.offset = mobile ? await this.findPage() : { x: 0, y: 0 };
    return this;
  }

  // Paints the page a calibration colour and finds where it starts on the display.
  async findPage() {
    await this.page.setContent('<body style="margin:0;background:#ff00ff"></body>');
    await sleep(500);
    const { execFileSync } = require('child_process');
    const raw = execFileSync('ffmpeg', ['-loglevel', 'error', '-f', 'x11grab', '-video_size', `${this.screen.w}x${this.screen.h}`, '-i', this.display,
      '-frames:v', '1', '-vf', 'crop=1:ih:20:0', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
    let y = 0;
    while (y * 3 < raw.length && !(raw[y * 3] > 240 && raw[y * 3 + 1] < 20 && raw[y * 3 + 2] > 240)) y++;
    if (y * 3 >= raw.length) throw new Error('page not found on display');
    return { x: 0, y };
  }

  // With TIME_WARP, CSS transitions/animations and the Web Animations API follow the slowed clock too.
  // The rate belongs to the document, so it is set again after every navigation.
  async warpAnimations(page = this.page) {
    if (WARP <= 1) return;
    const cdp = await this.context.newCDPSession(page);
    const apply = () => cdp.send('Animation.enable').then(() => cdp.send('Animation.setPlaybackRate', { playbackRate: 1 / WARP })).catch(() => {});
    await apply();
    page.on('load', apply);
    page.on('domcontentloaded', apply);
  }

  // Starts recording the whole display (only the kiosk page is on it). Returns when ffmpeg is capturing.
  async record(file) {
    const { w, h } = this.size;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    this.file = file;
    this.ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'x11grab', '-draw_mouse', '0', '-framerate', '30', '-video_size', `${w}x${h}`, '-i', `${this.display}+${this.offset.x},${this.offset.y}`,
      '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', '30', file], { stdio: ['pipe', 'ignore', 'inherit'] });
    this.started = Date.now();
    await sleep(400);
  }

  async stop() {
    if (!this.ff) return null;
    const ff = this.ff;
    const done = new Promise((r) => ff.on('close', r));
    ff.stdin.write('q');
    // if ffmpeg does not finish on "q", interrupt it; the timer also keeps Node alive while we wait
    const fallback = setTimeout(() => ff.kill('SIGINT'), 5000);
    await done;
    clearTimeout(fallback);
    let seconds = (Date.now() - this.started) / 1000;
    this.ff = null;
    if (WARP > 1) {
      // back to real speed: keep every WARP-th frame of the slowed take
      const slowFile = this.file.replace(/\.mp4$/, `_x${WARP}.mp4`);
      fs.renameSync(this.file, slowFile);
      require('child_process').execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', slowFile, '-vf', `setpts=PTS/${WARP},fps=30`,
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14', '-pix_fmt', 'yuv420p', this.file]);
      seconds /= WARP;
    }
    return { file: this.file, seconds: +seconds.toFixed(2) };
  }

  async close() {
    await this.stop().catch(() => {});
    await this.context?.close().catch(() => {});
    this.xvfb?.kill();
    fs.rmSync(this.profile, { recursive: true, force: true });
  }
}

module.exports = { Stage, SIZES };
