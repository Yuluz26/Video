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

let nextDisplay = 90 + (process.pid % 7) * 10;

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
    if (mobile) {
      // The phone is emulated inside a normal window; real browser fullscreen (Legenda asks for it when the
      // hero is chosen) would move the page off the recorded area. A phone in fullscreen looks the same.
      await this.context.addInitScript(() => {
        Element.prototype.requestFullscreen = function () { return Promise.resolve(); };
      });
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
    const seconds = (Date.now() - this.started) / 1000;
    this.ff = null;
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
