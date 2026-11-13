// Builds the two HyperFrames compositions for the "aura" video: an editor + terminal where real DIDIK
// source code is typed (ide-a, 0–13.79 s of the song) and a test run (ide-b, 22.0–25.73 s). Also writes
// typing.json, the key events the sound design uses so every key click lands on a typed character.
//
//   node build.mjs <didik repo> <pytest summary line> <test count>
import fs from 'node:fs';
import path from 'node:path';

const [repo, testSummary = '', testCountArg = '0'] = process.argv.slice(2);
const here = path.dirname(new URL(import.meta.url).pathname);
const read = (p, a, b) => fs.readFileSync(path.join(repo, p), 'utf8').split('\n').slice(a - 1, b);
const MODES = 'live/server/didik_live/game/modes';

// ── ide-a: what is on screen, second by second
const A = {
  duration: 13.79,
  segments: [
    { // typing the fish table of Pancing Ikan
      from: 0, to: 6.69, file: `${MODES}/fishing.py`, lang: 'py', firstLine: 1,
      base: read(`${MODES}/fishing.py`, 1, 13), typed: read(`${MODES}/fishing.py`, 14, 24), typeFrom: 1.0, cps: 50,
    },
    { // Hikayat Lima Alam's rules
      from: 6.69, to: 9.47, file: `${MODES}/legenda.py`, lang: 'py', firstLine: 38,
      base: read(`${MODES}/legenda.py`, 38, 48), typed: read(`${MODES}/legenda.py`, 49, 60), typeFrom: 6.85, cps: 78,
    },
  ],
  // then a file per beat, scrolling, while the line counter rolls up
  flips: [
    [9.47, 'live/server/didik_live/games.py', 'py'],
    [9.94, `${MODES}/jump.py`, 'py'],
    [10.43, 'live/web/src/lib/subjects/sejarah/Gali.svelte', 'ts'],
    [10.91, 'live/web/src/lib/games/legenda/Stage.svelte', 'ts'],
    [11.42, 'live/web/src/lib/room.svelte.ts', 'ts'],
    [11.91, 'live/server/didik_live/questions.py', 'py'],
    [12.4, 'live/web/src/lib/games/legenda/LegendaPlayer.svelte', 'ts'],
  ].map(([at, file, lang]) => ({ at, file, lang, lines: read(file, 1, 60) })),
  flipsEnd: 12.89,
  command: { at: 12.95, text: 'npm run build && didik-live', cps: 48 },
  terminal: ['$ didik-live', '', '  DIDIK Main Bersama', '  Buka:  http://localhost:8080', ''],
  totalLines: 67077, // .py, .svelte and .ts in live/, without node_modules, builds and generated files
};

// ── ide-b: the test suite, 3.73 s
const testCount = Number(testCountArg);
const B = {
  duration: 3.73,
  file: 'live/server/tests/test_legenda.py', lang: 'py', lines: read('live/server/tests/test_legenda.py', 1, 60),
  command: { at: 0.15, text: 'pytest -q', cps: 30 },
  dotsFrom: 0.75, dotsTo: 2.9, tests: testCount, summary: testSummary, summaryAt: 3.0,
};

// ── key events for the sound (song time)
const events = [];
const typeEvents = (text, t0, cps, offset) => {
  [...text].forEach((ch, i) => events.push({ t: +(offset + t0 + i / cps).toFixed(3), k: ch === ' ' ? 'space' : 'key' }));
  events.push({ t: +(offset + t0 + text.length / cps).toFixed(3), k: 'enter' });
};
for (const s of A.segments) {
  let t = s.typeFrom;
  for (const line of s.typed) {
    typeEvents(line, t, s.cps, 0);
    t += (line.length + 1) / s.cps;
  }
}
for (const f of A.flips) events.push({ t: f.at, k: 'tab' });
typeEvents(A.command.text, A.command.at, A.command.cps, 0);
typeEvents(B.command.text, B.command.at, B.command.cps, 22.0);
fs.writeFileSync(path.join(here, 'typing.json'), JSON.stringify(events.filter((e) => e.t < 13.79 || (e.t >= 22 && e.t < 25.73))));

// ── the page: one paused GSAP tween drives a pure render(t), so any seek draws the exact frame
const page = (id, data, width = 1080, height = 1920) => `<!doctype html>
<html lang="ms" data-resolution="portrait">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=${width}, height=${height}" />
<script src="./gsap.min.js"></script>
<style>
  @font-face { font-family: 'JetBrains Mono'; src: url('./jbm-400.woff2') format('woff2'); font-weight: 400; }
  @font-face { font-family: 'JetBrains Mono'; src: url('./jbm-700.woff2') format('woff2'); font-weight: 700; }
  :root { --bg: #090b11; --panel: #0e1119; --edge: #1b2130; --ink: #c9d3e3; --dim: #4c566a; --sun: #ffb627; --berry: #ff8fc8;
          --sea: #7fe3d6; --sky: #8fb8ff; --leaf: #a8e07a; --coral: #ff7a66; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: var(--bg); }
  #root { position: relative; width: 100%; height: 100%; font-family: 'JetBrains Mono', monospace; color: var(--ink); }
  .bar { position: absolute; left: 0; right: 0; top: 0; height: 110px; background: var(--panel); border-bottom: 1px solid var(--edge);
         display: flex; align-items: center; padding: 0 36px; gap: 14px; font-size: 24px; color: var(--dim); }
  .dot { width: 22px; height: 22px; border-radius: 50%; }
  .path { margin-left: 24px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .path b { color: var(--ink); font-weight: 400; }
  .tabs { position: absolute; left: 0; right: 0; top: 110px; height: 72px; display: flex; background: #0b0e15; border-bottom: 1px solid var(--edge); overflow: hidden; }
  .tab { padding: 0 30px; display: flex; align-items: center; font-size: 22px; color: var(--dim); border-right: 1px solid var(--edge); white-space: nowrap; }
  .tab.on { color: var(--ink); background: var(--bg); box-shadow: inset 0 3px 0 var(--sun); }
  .editor { position: absolute; left: 0; right: 0; top: 182px; bottom: 470px; overflow: hidden; }
  .code { position: absolute; left: 0; right: 70px; top: 18px; font-size: 29px; line-height: 50px; tab-size: 4; }
  .ln { display: flex; white-space: pre; height: 50px; }
  .ln.cur { background: rgba(255,182,39,.06); }
  .no { width: 96px; flex: none; text-align: right; padding-right: 28px; color: #2f3646; }
  .ln.cur .no { color: var(--sun); }
  .cursor { display: inline-block; width: 3px; height: 38px; margin-bottom: -8px; background: var(--sun); box-shadow: 0 0 14px var(--sun); }
  .mini { position: absolute; right: 18px; top: 24px; width: 40px; bottom: 24px; opacity: .55; }
  .mini i { display: block; height: 4px; margin: 0 0 4px; border-radius: 2px; }
  .status { position: absolute; left: 0; right: 0; bottom: 420px; height: 50px; background: #121725; border-top: 1px solid var(--edge);
            display: flex; align-items: center; padding: 0 30px; gap: 34px; font-size: 20px; color: var(--dim); }
  .status .count { margin-left: auto; color: var(--sun); }
  .term { position: absolute; left: 0; right: 0; bottom: 0; height: 420px; background: #07080d; border-top: 1px solid var(--edge);
          padding: 26px 36px; font-size: 27px; line-height: 44px; white-space: pre; overflow: hidden; }
  .term .p { color: var(--leaf); }
  .k { color: var(--berry); } .s { color: var(--sun); } .n { color: var(--sea); } .c { color: #5c6577; font-style: italic; }
  .f { color: var(--sky); } .d { color: var(--coral); }
  .ok { color: var(--leaf); } .pass { color: #3ddc84; font-weight: 700; }
</style>
</head>
<body>
<div id="root" data-composition-id="${id}" data-start="0" data-duration="${data.duration}" data-width="${width}" data-height="${height}">
  <div class="bar"><span class="dot" style="background:#ff5f57"></span><span class="dot" style="background:#febc2e"></span><span class="dot" style="background:#28c840"></span><span class="path" id="path"></span></div>
  <div class="tabs" id="tabs"></div>
  <div class="editor"><div class="code" id="code"></div><div class="mini" id="mini"></div></div>
  <div class="status"><span>⎇ main</span><span id="lang">Python</span><span id="pos"></span><span class="count" id="count"></span></div>
  <div class="term" id="term"></div>
</div>
<script>
const D = ${JSON.stringify(data).replace(/<\//g, "<\\/")};
const KW = /^(def|class|return|if|elif|else|for|in|not|and|or|is|None|True|False|import|from|as|with|async|await|const|let|export|function|type|new|this|lambda|raise|try|except|pass|while|break|continue|interface|extends)$/;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function hl(line, lang) {
  const re = /(#.*$|\\/\\/.*$)|("""[^"]*"""?|"(?:[^"\\\\]|\\\\.)*"?|'(?:[^'\\\\]|\\\\.)*'?|\`[^\`]*\`?)|(\\b\\d+(?:\\.\\d+)?\\b)|([A-Za-z_][A-Za-z0-9_]*)(?=\\s*\\()|([A-Za-z_][A-Za-z0-9_]*)|(@\\w+)/g;
  let out = '', last = 0, m;
  while ((m = re.exec(line))) {
    out += esc(line.slice(last, m.index));
    const [tok, com, str, num, fn, word, dec] = m;
    if (com && (lang === 'py' ? com.startsWith('#') : com.startsWith('//'))) out += '<span class="c">' + esc(tok) + '</span>';
    else if (com) out += esc(tok);
    else if (str) out += '<span class="s">' + esc(tok) + '</span>';
    else if (num) out += '<span class="n">' + tok + '</span>';
    else if (fn) out += KW.test(fn) ? '<span class="k">' + fn + '</span>' : '<span class="f">' + fn + '</span>';
    else if (word) out += KW.test(word) ? '<span class="k">' + word + '</span>' : esc(word);
    else if (dec) out += '<span class="d">' + tok + '</span>';
    last = m.index + tok.length;
  }
  return out + esc(line.slice(last));
}
const el = (id) => document.getElementById(id);
const short = (f) => f.split('/').pop();
function header(file, lang, open) {
  const parts = file.split('/');
  el('path').innerHTML = '~/didik/' + parts.slice(0, -1).join('/') + '/<b>' + parts.at(-1) + '</b>';
  el('tabs').innerHTML = open.map((f) => '<div class="tab' + (f === file ? ' on' : '') + '">' + short(f) + '</div>').join('');
  el('lang').textContent = lang === 'py' ? 'Python' : file.endsWith('.svelte') ? 'Svelte' : 'TypeScript';
}
function drawCode(lines, firstLine, curLine, cursorCol, showCursor, scroll, lang) {
  let html = '';
  lines.forEach((l, i) => {
    const cur = i === curLine;
    const text = cur && cursorCol >= 0 ? l.slice(0, cursorCol) : l;
    html += '<div class="ln' + (cur ? ' cur' : '') + '"><span class="no">' + (firstLine + i) + '</span><span>' + hl(text, lang) +
      (cur && showCursor ? '<span class="cursor"></span>' : '') + '</span></div>';
  });
  el('code').innerHTML = html;
  el('code').style.transform = 'translateY(' + (-scroll) + 'px)';
  el('mini').innerHTML = lines.slice(0, 60).map((l) => '<i style="width:' + Math.min(40, l.trimEnd().length * 0.45) + 'px;margin-left:' + Math.min(14, (l.length - l.trimStart().length) * 0.6) + 'px;background:' + (l.trim().startsWith('#') || l.trim().startsWith('//') ? '#3a4152' : l.includes('"') || l.includes("'") ? '#7a6224' : '#2c3a55') + '"></i>').join('');
}
function typed(seg, t) {
  // how far typing has got at t: [line index, column], or null before it starts
  let left = (t - seg.typeFrom) * seg.cps;
  if (left < 0) return null;
  for (let i = 0; i < seg.typed.length; i++) {
    const len = seg.typed[i].length + 1;
    if (left < len) return [i, Math.floor(left)];
    left -= len;
  }
  return [seg.typed.length - 1, seg.typed.at(-1).length, true];
}
const blink = (t) => Math.floor(t * 2.2) % 2 === 0;
const term = (lines) => { el('term').innerHTML = lines.map((l) => l.startsWith('$') ? '<span class="p">$</span>' + esc(l.slice(1)) : l).join('\\n'); };

function renderA(t) {
  const open = ['fishing.py', 'legenda.py'].map((n) => D.segments.find((s) => s.file.endsWith(n)).file);
  const seg = D.segments.find((s) => t >= s.from && t < s.to);
  if (seg) {
    header(seg.file, seg.lang, open);
    const p = typed(seg, t);
    const shown = p ? seg.base.concat(seg.typed.slice(0, p[0] + 1)) : seg.base.concat(['']);
    const cur = shown.length - 1;
    const col = p ? (p[2] ? seg.typed[p[0]].length : p[1]) : 0;
    const typing = p && !p[2];
    const scroll = Math.max(0, (shown.length - 21) * 50);
    drawCode(shown, seg.firstLine, cur, col, typing || blink(t), scroll, seg.lang);
    el('pos').textContent = 'Ln ' + (seg.firstLine + cur) + ', Col ' + (col + 1);
    el('count').textContent = '';
    term(D.terminal);
    return;
  }
  // file flips, scrolling, counter rolling
  let f = D.flips[0];
  for (const x of D.flips) if (t >= x.at) f = x;
  header(f.file, f.lang, D.flips.map((x) => x.file).slice(0, D.flips.indexOf(f) + 1).slice(-4));
  const u = Math.min(1, (t - D.flips[0].at) / (D.flipsEnd - D.flips[0].at));
  const scroll = (t - f.at) * 900;
  drawCode(f.lines, 1, -1, -1, false, scroll, f.lang);
  el('pos').textContent = '';
  el('count').textContent = Math.round(D.totalLines * (1 - Math.pow(1 - u, 3))).toLocaleString('en-US') + ' lines';
  const c = D.command;
  const n = Math.max(0, Math.min(c.text.length, Math.floor((t - c.at) * c.cps)));
  term(D.terminal.concat(t >= c.at ? ['$ ' + c.text.slice(0, n) + (blink(t) || n < c.text.length ? '▍' : '')] : ['$ ' + (blink(t) ? '▍' : '')]));
}

function renderB(t) {
  header(D.file, D.lang, ['legenda.py', 'test_legenda.py'].map((n) => n === 'legenda.py' ? 'live/server/didik_live/game/modes/legenda.py' : D.file));
  drawCode(D.lines, 1, -1, -1, false, t * 500, D.lang);
  el('count').textContent = '';
  el('pos').textContent = '';
  const c = D.command;
  const n = Math.max(0, Math.min(c.text.length, Math.floor((t - c.at) * c.cps)));
  const lines = ['$ ' + c.text.slice(0, n) + (t < D.dotsFrom ? '▍' : '')];
  if (t >= D.dotsFrom) {
    const k = Math.round(D.tests * Math.min(1, (t - D.dotsFrom) / (D.dotsTo - D.dotsFrom)));
    const dots = '.'.repeat(k);
    for (let i = 0; i < dots.length; i += 56) lines.push('<span class="ok">' + dots.slice(i, i + 56) + '</span>');
  }
  if (t >= D.summaryAt) lines.push('<span class="pass">' + esc(D.summary) + '</span>');
  term(lines.slice(-8));
}

const render = ${id === 'ide-a' ? 'renderA' : 'renderB'};
const state = { t: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(state, { t: D.duration, duration: D.duration, ease: 'none', onUpdate: () => render(state.t) }, 0);
window.__timelines = window.__timelines || {};
window.__timelines['${id}'] = tl;
render(0);
tl.seek(0);
</script>
</body>
</html>
`;

for (const [id, data] of [['ide-a', A], ['ide-b', B]]) {
  const dir = path.join(here, id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(id, data));
}
console.log('events', events.length, 'A flips', A.flips.length, 'B tests', B.tests);
