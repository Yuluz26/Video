// Yul's talking video about DIDIK, edited as a cute, energetic short. Layers, back to front: his car blurred
// under a pastel wash (or the Hikayat battlefield during Story Mode) → things floating behind him → Yul, cut
// out of the background (MediaPipe) with a white sticker outline → illustrations, DIDIK's real recordings and
// sprites, emphasis type → word-by-word captions. Everything is cued to his words (Whisper timings).
import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Clip, Logo, Phone, Screen } from './components';
import { BADGES } from './badges';
import { beatPulse, bounce, Confetti, Flash, Pop, Shake, Shockwave, SparkleBurst, SpriteSheet, Star4, Sticker, StickerText, usePop, Wipe } from './motion';
import { PHRASES } from './talk-captions';
import { C, FONT_DISPLAY, FONT_PIXEL } from './theme';

export const TALK_FRAMES = 1975; // 65.83 s, the length of the recording
const f = (s: number) => Math.round(s * 30);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const GOLD = '#ffd45a';
const S = (p: string) => staticFile(`story/${p}`);
const STORY = [29.85, 40.6]; // Story Mode section, in seconds

/** Visible from `a` to `b` seconds (with its own Sequence clock). */
const At: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => (
  <Sequence from={f(a)} durationInFrames={f(b) - f(a)} layout="none">{children}</Sequence>
);

/** Leaves by popping away over the last frames of its Sequence. */
const PopOut: React.FC<{ children: React.ReactNode; len?: number }> = ({ children, len = 8 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const k = interpolate(frame, [durationInFrames - len, durationInFrames], [1, 0], { ...clamp, easing: (x) => x * x });
  return <AbsoluteFill style={{ transform: `scale(${0.6 + 0.4 * k})`, opacity: k }}>{children}</AbsoluteFill>;
};

// ───────────────────────────── where Yul stands: [second, x, y, scale]
const POSES: Array<[number, number, number, number]> = [
  // scaling pivots on his feet (bottom centre), so small y offsets are enough to make room above him
  [0, 0, 0, 1],
  [7.6, 0, 110, 0.86], // room for the DIDIK logo above him
  [10.9, 0, 90, 0.9], // A B C D above him
  [13.9, 0, 60, 0.94],
  [16.95, 270, 150, 0.74], // "macam ni": bottom right, games on the left
  [20.7, 0, 110, 0.86], // 14 games orbiting behind
  [27.5, 0, 30, 0.97],
  [29.85, -280, 30, 0.52], // standing in the game world, bottom left
  [40.6, 0, 0, 1],
  [42.6, -250, 140, 0.78], // parents and teachers: screens on the right
  [47.8, 0, 60, 0.94],
  [52.6, 0, 100, 0.88],
  [57.4, 0, 140, 0.84], // the address above him
  [62.9, 0, 170, 0.8], // the end card
];

const usePose = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let [x, y, s] = [0, 0, 1];
  for (let i = 1; i < POSES.length; i++) {
    const [t, nx, ny, ns] = POSES[i];
    const [, px, py, ps] = POSES[i - 1];
    if (frame < f(t)) break;
    const p = spring({ frame: frame - f(t), fps, config: { stiffness: 140, damping: 13, mass: 0.8 } });
    [x, y, s] = [px + (nx - px) * p, py + (ny - py) * p, ps + (ns - ps) * p];
  }
  return { x, y, s };
};

// ───────────────────────────── punch-ins on the words that matter
const PUNCH = [7.84, 12.0, 17.24, 18.2, 19.54, 22.06, 29.96, 33.0, 51.64, 59.46, 63.9];
const usePunch = () => {
  const frame = useCurrentFrame();
  return PUNCH.reduce((a, t) => {
    const d = frame - f(t);
    return a + (d >= 0 && d < 10 ? Math.sin((d / 10) * Math.PI) * 0.05 : 0);
  }, 0);
};

// ───────────────────────────── backdrop
const WASH: Array<[number, string]> = [
  [0, '#fde3ee'], [7.6, '#fff1c9'], [10.9, '#dcefff'], [16.95, '#e6f6dc'], [20.7, '#fff1c9'], [27.5, '#fde3ee'],
  [40.6, '#dcefff'], [47.8, '#fde3ee'], [52.6, '#e6f6dc'], [57.4, '#fff1c9'], [62.9, '#fde3ee'],
];
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let wash = WASH[0][1];
  for (const [at, c] of WASH) if (t >= at) wash = c;
  const story = t >= STORY[0] && t < STORY[1];
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile('talk/yul_1080.mp4')} muted style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'scale(1.12)', filter: 'blur(26px) saturate(1.25) brightness(1.05)' }} />
      <AbsoluteFill style={{ background: wash, opacity: 0.72 }} />
      <AbsoluteFill style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.75) 6px, transparent 7px)', backgroundSize: '110px 110px', backgroundPosition: `${frame * 1.2}px ${frame * 0.7}px`, opacity: 0.6 }} />
      {story ? (
        <AbsoluteFill style={{ background: C.night }}>
          <Img src={S('worlds/chini/field.webp')} style={{ position: 'absolute', height: 1920, left: -900 - (frame - f(STORY[0])) * 1.1, top: 0, maxWidth: 'none', filter: 'saturate(1.15)' }} />
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(20,17,42,.75) 0%, rgba(20,17,42,.15) 30%, rgba(20,17,42,.1) 62%, rgba(20,17,42,.8) 100%)' }} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// ───────────────────────────── things floating behind him, a set per topic
type Floater = { kind: 'sticker' | 'char' | 'badge' | 'symbol'; name: string; x: number; y: number; size: number };
const FLOATS: Array<{ a: number; b: number; items: Floater[] }> = [
  { a: 0, b: 7.6, items: [
    { kind: 'sticker', name: 'bintang', x: 140, y: 380, size: 150 }, { kind: 'sticker', name: 'buku', x: 930, y: 470, size: 160 },
    { kind: 'sticker', name: 'pensel', x: 120, y: 980, size: 130 }, { kind: 'sticker', name: 'epal', x: 950, y: 1050, size: 140 },
    { kind: 'char', name: 'didi-wave', x: 880, y: 250, size: 170 },
  ] },
  { a: 7.6, b: 16.95, items: [
    { kind: 'char', name: 'chibi-harimau', x: 120, y: 760, size: 230 }, { kind: 'char', name: 'chibi-arnab', x: 960, y: 800, size: 230 },
    { kind: 'char', name: 'chibi-kancil', x: 150, y: 1180, size: 200 }, { kind: 'char', name: 'chibi-kucing', x: 940, y: 1210, size: 200 },
    { kind: 'sticker', name: 'kilauan', x: 540, y: 640, size: 120 },
  ] },
  { a: 16.95, b: 20.7, items: [
    { kind: 'sticker', name: 'bola', x: 860, y: 300, size: 150 }, { kind: 'sticker', name: 'bintang-bersinar', x: 990, y: 640, size: 130 },
    { kind: 'char', name: 'didi-cheer', x: 980, y: 900, size: 170 },
  ] },
  { a: 20.7, b: 27.5, items: BADGES.slice(0, 14).map((b, i) => {
    const a = (i / 14) * Math.PI * 2;
    return { kind: 'badge' as const, name: b.file, x: 540 + Math.cos(a) * 440, y: 820 + Math.sin(a) * 300, size: 150 };
  }) },
  { a: 27.5, b: 29.85, items: [
    { kind: 'sticker', name: 'hati', x: 160, y: 520, size: 160 }, { kind: 'sticker', name: 'hati', x: 920, y: 560, size: 140 },
    { kind: 'sticker', name: 'bintang', x: 200, y: 1050, size: 130 }, { kind: 'sticker', name: 'mercun', x: 900, y: 1040, size: 150 },
  ] },
  { a: 29.85, b: 40.6, items: ['chini', 'lupar', 'larut', 'kancil', 'ledang'].map((k, i) => ({ kind: 'symbol' as const, name: k, x: 140 + i * 200, y: 1300 + (i % 2) * 60, size: 110 })) },
  { a: 40.6, b: 47.8, items: [
    { kind: 'char', name: 'didi-happy', x: 160, y: 420, size: 170 }, { kind: 'sticker', name: 'pensel', x: 900, y: 1300, size: 140 },
    { kind: 'sticker', name: 'buku', x: 130, y: 1080, size: 150 },
  ] },
  { a: 47.8, b: 57.4, items: [
    { kind: 'sticker', name: 'hati', x: 150, y: 460, size: 160 }, { kind: 'sticker', name: 'pelangi', x: 930, y: 470, size: 180 },
    { kind: 'sticker', name: 'bintang', x: 120, y: 1100, size: 140 }, { kind: 'sticker', name: 'belon', x: 950, y: 1100, size: 170 },
    { kind: 'char', name: 'chibi-gajah', x: 940, y: 820, size: 200 }, { kind: 'char', name: 'chibi-penyu', x: 140, y: 800, size: 190 },
  ] },
  { a: 57.4, b: 66, items: [
    { kind: 'char', name: 'chibi-harimau', x: 130, y: 900, size: 210 }, { kind: 'char', name: 'chibi-arnab', x: 950, y: 920, size: 210 },
    { kind: 'char', name: 'didi-wave', x: 160, y: 1250, size: 170 }, { kind: 'sticker', name: 'hadiah', x: 930, y: 1250, size: 150 },
    { kind: 'sticker', name: 'bintang', x: 540, y: 820, size: 120 },
  ] },
];

const FloaterItem: React.FC<{ it: Floater; i: number }> = ({ it, i }) => {
  const frame = useCurrentFrame();
  const { style } = usePop(i * 3, { rotate: -20 });
  const bob = Math.sin((frame + i * 17) / 14) * 16;
  const sway = Math.sin((frame + i * 11) / 23) * 8;
  const hop = it.kind === 'char' ? -Math.abs(Math.sin(((frame + i * 5) / 15) * Math.PI)) * 18 : 0;
  const spin = it.kind === 'badge' ? 0 : Math.sin((frame + i * 9) / 18) * 7;
  const src = it.kind === 'sticker' ? staticFile(`stickers/${it.name}.webp`) : it.kind === 'char' ? staticFile(`chars/${it.name}.png`) : it.kind === 'badge' ? staticFile(`brand/badges/${it.name}`) : S(`ui/symbol_${it.name}.webp`);
  return (
    <div style={{ position: 'absolute', left: it.x - it.size / 2 + sway, top: it.y - it.size / 2 + bob + hop, width: it.size, height: it.size, ...style }}>
      {it.kind === 'badge' ? (
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 10px 20px -8px rgba(31,45,39,.45)' }}>
          <Img src={src} style={{ width: '100%', height: '100%', transform: 'scale(1.24)' }} />
        </div>
      ) : (
        <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: it.kind === 'char' ? 'pixelated' : 'auto', transform: `rotate(${spin}deg)`, filter: it.kind === 'symbol' ? `drop-shadow(0 0 16px ${GOLD})` : 'drop-shadow(0 10px 10px rgba(31,45,39,.25))' }} />
      )}
    </div>
  );
};

const Floaters: React.FC = () => {
  const frame = useCurrentFrame();
  // the 14 badges slowly orbit while he talks about them
  const orbit = frame >= f(20.7) && frame < f(27.5) ? (frame - f(20.7)) * 0.012 : 0;
  return (
    <>
      {FLOATS.map((set, si) => (
        <At key={si} a={set.a} b={set.b}>
          <PopOut>
            <AbsoluteFill style={{ transform: si === 3 ? `rotate(${orbit * 57.3}deg)` : undefined, transformOrigin: '540px 820px' }}>
              {set.items.map((it, i) => (
                <div key={i} style={{ position: 'absolute', inset: 0, transform: si === 3 ? `rotate(${-orbit * 57.3}deg)` : undefined, transformOrigin: `${it.x}px ${it.y}px` }}>
                  <FloaterItem it={it} i={i} />
                </div>
              ))}
            </AbsoluteFill>
          </PopOut>
        </At>
      ))}
    </>
  );
};

// ───────────────────────────── Yul
const Yul: React.FC = () => {
  const { x, y, s } = usePose();
  const outline = 'drop-shadow(5px 0 0 #fff) drop-shadow(-5px 0 0 #fff) drop-shadow(0 5px 0 #fff) drop-shadow(0 -5px 0 #fff) drop-shadow(0 18px 24px rgba(31,45,39,.28))';
  return (
    <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: '50% 100%' }}>
      <OffthreadVideo src={staticFile('talk/yul_fg.webm')} transparent muted style={{ width: '100%', height: '100%', filter: outline }} />
    </AbsoluteFill>
  );
};

// ───────────────────────────── captions: the phrase on screen, each word popping in as he says it
const KEY = /^(DIDIK|game|interaktif|Story|Mode|Hikayat|Lima|Alam|14|best|seronok|soalan|ABCD|ulangkaji|didik\.engineprofit\.io)/i;
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / 30;
  const p = PHRASES.find((ph) => t >= ph.start && t < ph.end);
  if (!p) return null;
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 1395, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 18, rowGap: 0 }}>
      {p.words.map((w, i) => {
        const at = f(w.s);
        if (frame < at - 1) return null;
        const pop = spring({ frame: frame - at + 1, fps, config: { stiffness: 320, damping: 12, mass: 0.5 } });
        const next = p.words[i + 1];
        const speaking = frame >= at && (!next || frame < f(next.s));
        const key = KEY.test(w.w);
        const color = speaking ? C.sun : key ? '#ff8fc8' : '#fff';
        return (
          <span key={i} style={{ position: 'relative', display: 'inline-block', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: w.w.length > 16 ? 50 : 64, lineHeight: 1.15, transform: `scale(${pop * (speaking ? 1.1 : 1)}) translateY(${(1 - pop) * 20}px)`, transformOrigin: '50% 80%' }}>
            <span aria-hidden style={{ position: 'absolute', inset: 0, color: C.ink, WebkitTextStroke: `14px ${C.ink}`, textShadow: `0 6px 0 ${C.ink}` }}>{w.w}</span>
            <span style={{ position: 'relative', color }}>{w.w}</span>
          </span>
        );
      })}
    </div>
  );
};

// ───────────────────────────── illustrations, cued to his words
const GameCard: React.FC<{ clip: string; from: number; name: string; at: number; x: number; y: number; h: number; tilt: number; side: 'left' | 'right'; label?: boolean; out?: number }> = ({ clip, from, name, at, x, y, h, tilt, side, label = true, out }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = bounce(frame, at, fps, 190, 11, 0.7);
  const over = p - 1;
  const fromX = side === 'left' ? -900 : 900;
  // flies off the other way when the next card arrives
  const q = out === undefined ? 0 : interpolate(frame, [out, out + 8], [0, 1], { ...clamp, easing: (k) => k * k });
  if (q >= 1) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translateX(${(1 - p) * fromX - q * fromX * 1.2}px) rotate(${tilt + (1 - p) * (side === 'left' ? -40 : 40) + q * 30 + Math.sin(frame / 12) * 1.5}deg) scale(${(1 + over * 0.12) * (1 - q * 0.3)}, ${(1 - over * 0.15) * (1 - q * 0.3)})`, opacity: frame < at ? 0 : 1 }}>
      <Phone height={h}>
        <Clip name={clip} from={from} />
      </Phone>
      {label ? (
        <div style={{ position: 'absolute', left: -60, right: -60, top: -84 }}>
          <StickerText text={name} at={at + 4} size={56} color={C.sea} stagger={1} wiggle={0.5} font={FONT_PIXEL} shadow={C.ink} />
        </div>
      ) : null}
    </div>
  );
};

const ANSWERS: Array<[string, string]> = [['A', C.coral], ['B', C.sea], ['C', C.sun], ['D', C.sky]];

const Illustrations: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {/* "Nama dia adalah DIDIK" — the logo lands on the word */}
      <At a={7.7} b={10.8}>
        <PopOut>
          <Pop at={4} rotate={-12} origin="50% 50%" from={2.2} style={{ left: 110, top: 250 }}><Logo width={860} /></Pop>
          <Shockwave at={4} x={540} y={380} color="#fff" size={1300} />
          <SparkleBurst at={4} x={540} y={380} count={14} radius={520} seed="didik" />
          <Confetti at={4} x={540} y={420} count={90} power={44} seed="didik" />
        </PopOut>
      </At>

      {/* "bukan setakat jawab kuiz ABCD je tau" */}
      <At a={11.5} b={13.85}>
        <PopOut>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center', gap: 22 }}>
            {ANSWERS.map(([l, c], i) => {
              const shrug = frame > f(12.94) - f(11.5) ? Math.sin((frame + i * 4) / 2.5) * 8 : 0;
              return (
                <Pop key={l} at={3 + i * 4} rotate={i % 2 ? 18 : -18} origin="50% 50%" style={{ position: 'relative' }}>
                  <div style={{ width: 200, height: 200, borderRadius: 40, background: c, boxShadow: `0 14px 0 rgba(31,45,39,.35)`, display: 'grid', placeItems: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 130, color: '#fff', transform: `rotate(${shrug}deg)` }}>{l}</div>
                </Pop>
              );
            })}
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 480 }}>
            <StickerText text="je tau?" at={f(12.94) - f(11.5)} size={84} color={C.ink} shadow={C.coral} />
          </div>
        </PopOut>
      </At>

      {/* "belajar sambil main game interaktif" */}
      <At a={14.2} b={16.95}>
        <PopOut>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 230 }}>
            <StickerText text="Belajar" at={0} size={120} color={C.sea} />
            <StickerText text="sambil MAIN!" at={f(15.52) - f(14.2)} size={130} color={C.berry} font={FONT_PIXEL} />
          </div>
          <Sticker name="buku" size={150} x={150} y={340} at={2} />
          <Sticker name="bola" size={150} x={940} y={520} at={f(15.52) - f(14.2)} />
        </PopOut>
      </At>

      {/* "Macam ni, macam ni, and macam ni" — a real game on each one */}
      <At a={17.1} b={20.75}>
        <PopOut>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 210 }}>
            <StickerText text="Macam ni!" at={4} size={92} color={C.coral} wiggle={1.2} />
          </div>
          <GameCard clip="interaktif_phone_9x16" from={f(27.5)} name="Kuiz Interaktif" at={f(17.24) - f(17.1)} x={80} y={470} h={920} tilt={-6} side="left" out={f(18.2) - f(17.1)} />
          <GameCard clip="lompat_phone_9x16" from={f(13.5)} name="Lompat!" at={f(18.2) - f(17.1)} x={110} y={480} h={920} tilt={4} side="right" out={f(19.54) - f(17.1)} />
          <GameCard clip="teka_phone_9x16" from={f(16)} name="Teka Gambar" at={f(19.54) - f(17.1)} x={80} y={470} h={920} tilt={-3} side="left" />
          {[f(17.24), f(18.2), f(19.54)].map((t, i) => <SparkleBurst key={i} at={t - f(17.1) + 2} x={330} y={900} radius={420} count={10} seed={`mn${i}`} />)}
        </PopOut>
      </At>

      {/* "kita ada 14 jenis game 2D" */}
      <At a={21.9} b={24.0}>
        <PopOut>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 200 }}>
            <StickerText text="14" at={4} size={260} color={C.coral} font={FONT_PIXEL} shadow={C.ink} />
            <StickerText text="jenis game 2D!" at={f(22.54) - f(21.9)} size={92} color={C.sea} font={FONT_PIXEL} stagger={1} />
          </div>
        </PopOut>
      </At>
      {/* "Lumba Sampan, Pancing Ikan, Kebun Ajaib" */}
      <At a={24.0} b={27.45}>
        <PopOut>
          <GameCard clip="lumba_phone_9x16" from={f(18)} name="Lumba Sampan" at={2} x={90} y={320} h={600} tilt={-7} side="left" />
          <GameCard clip="pancing_phone_9x16" from={f(11)} name="Pancing Ikan" at={f(24.92) - f(24.0)} x={630} y={350} h={600} tilt={7} side="right" />
          <GameCard clip="kebun_phone_9x16" from={f(14)} name="Kebun Ajaib" at={f(25.74) - f(24.0)} x={360} y={230} h={560} tilt={-2} side="left" />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1210 }}>
            <StickerText text="macam-macam lagi!" at={f(26.5) - f(24.0)} size={78} color={C.berry} stagger={1} />
          </div>
          <Confetti at={f(26.5) - f(24.0)} x={540} y={1200} count={80} power={40} seed="lagi" />
        </PopOut>
      </At>

      {/* "yang paling saya excited" */}
      <At a={28.3} b={29.85}>
        <PopOut>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 240 }}>
            <StickerText text="Paling" at={0} size={96} color={C.sea} />
            <StickerText text="EXCITED!" at={f(28.78) - f(28.3)} size={150} color={C.coral} font={FONT_PIXEL} wiggle={1.6} />
          </div>
          <SparkleBurst at={f(28.78) - f(28.3)} x={540} y={420} count={12} radius={480} seed="exc" />
        </PopOut>
      </At>

      {/* Story Mode: the title, the heroes, the five worlds, the boss, and the question */}
      <At a={29.9} b={33.7}>
        <PopOut>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 220 }}>
            <StickerText text="STORY MODE" at={2} size={92} color={C.night} outline={GOLD} shadow="#7a4b00" font={FONT_PIXEL} stagger={1} />
            <div style={{ height: 16 }} />
            <StickerText text={'HIKAYAT\nLIMA ALAM'} at={f(31.04) - f(29.9)} size={150} color={GOLD} outline={C.night} shadow="#7a4b00" stagger={2} />
          </div>
          {frame >= f(32.46) ? (
            <Pop at={f(32.46) - f(29.9)} rotate={-30} origin="50% 50%" style={{ left: 640, top: 770 }}>
              <div style={{ transform: 'rotate(-10deg)', background: C.coral, color: '#fff', fontFamily: FONT_PIXEL, fontWeight: 700, fontSize: 96, padding: '10px 36px', borderRadius: 26, border: `8px solid #fff`, boxShadow: '0 12px 0 rgba(0,0,0,.35)' }}>BEST!</div>
            </Pop>
          ) : null}
        </PopOut>
      </At>
      <At a={33.7} b={35.1}>
        <PopOut>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 230 }}>
            <StickerText text="Pilih watak!" at={f(34.34) - f(33.7)} size={100} color={GOLD} outline={C.night} shadow="#7a4b00" />
          </div>
          {(['tuah', 'mahsuri'] as const).map((h, i) => (
            <Pop key={h} at={f(34.34) - f(33.7) + i * 5} rotate={i ? 14 : -14} origin="50% 100%" style={{ left: 330 + i * 330, top: 420 }}>
              <Img src={S(`heroes/${h}/portrait.webp`)} style={{ width: 380, filter: `drop-shadow(0 0 30px ${GOLD})` }} />
              <div style={{ position: 'absolute', left: -40, right: -40, top: 470 }}>
                <StickerText text={h === 'tuah' ? 'Hang Tuah' : 'Mahsuri'} at={f(34.34) - f(33.7) + 6 + i * 5} size={54} color={GOLD} outline={C.night} shadow="#7a4b00" />
              </div>
            </Pop>
          ))}
        </PopOut>
      </At>
      <At a={35.1} b={36.9}>
        <PopOut>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 220 }}>
            <StickerText text="Lima dunia!" at={2} size={100} color={GOLD} outline={C.night} shadow="#7a4b00" />
          </div>
          {['chini', 'lupar', 'larut', 'kancil', 'ledang'].map((k, i) => {
            const a = -0.5 + i * 0.25;
            return (
              <Pop key={k} at={3 + i * 3} rotate={a * 40} origin="50% 100%" style={{ left: 540 - 190 + Math.sin(a) * 620, top: 480 + Math.abs(a) * 140, transform: `rotate(${a * 30}deg)` }}>
                <div style={{ width: 380, height: 214, borderRadius: 22, overflow: 'hidden', border: `6px solid ${GOLD}`, boxShadow: '0 16px 30px -10px rgba(0,0,0,.6)' }}>
                  <OffthreadVideo src={S(`worlds/${k}/scene.mp4`)} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </Pop>
            );
          })}
        </PopOut>
      </At>
      <At a={36.9} b={38.3}>
        <PopOut>
          <Shake hits={[f(37.22) - f(36.9), f(37.72) - f(36.9)]} power={26}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 220 }}>
              <StickerText text="Lawan BOS!" at={2} size={110} color={GOLD} outline={C.night} shadow="#7a4b00" font={FONT_PIXEL} />
            </div>
            <Pop at={3} rotate={10} origin="50% 80%" from={0.4} style={{ left: 420, top: 420 }}>
              <Img src={S('worlds/chini/boss.webp')} style={{ width: 620, filter: `brightness(${frame - f(37.22) >= 0 && frame - f(37.22) < 4 ? 2.2 : 1}) drop-shadow(0 0 40px rgba(18,132,122,.7))` }} />
            </Pop>
            <Pop at={4} rotate={-10} origin="50% 100%" style={{ left: 40, top: 560 }}>
              <Img src={S('heroes/tuah/attack.webp')} style={{ width: 430 }} />
            </Pop>
            <SpriteSheet src="story/fx/petir_slash.webp" cols={4} rows={3} w={314} h={418} at={f(37.22) - f(36.9) - 4} every={2} scale={1.7} feather style={{ left: 470, top: 300 }} />
          </Shake>
          <Flash at={f(37.22) - f(36.9)} length={6} strength={0.7} />
        </PopOut>
      </At>
      <At a={38.3} b={40.6}>
        <PopOut>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 220 }}>
            <StickerText text="Jawab soalan dulu!" at={f(39.6) - f(38.3)} size={92} color={GOLD} outline={C.night} shadow="#7a4b00" stagger={1} />
          </div>
          <Pop at={2} rotate={-6} origin="50% 50%" style={{ left: 90, top: 440, width: 900 }}>
            <div style={{ background: '#1d1838', border: `6px solid ${GOLD}`, borderRadius: 36, padding: '30px 34px 34px', boxShadow: '0 20px 40px -14px rgba(0,0,0,.7)' }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 56, color: '#fff', lineHeight: 1.1 }}>Haiwan manakah yang boleh terbang?</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 26 }}>
                {[['Burung', C.coral], ['Kucing', C.sea], ['Arnab', C.sun], ['Katak', C.sky]].map(([w, c], i) => {
                  const right = i === 0 && frame >= f(40.16) - f(38.3);
                  return (
                    <Pop key={w} at={6 + i * 3} rotate={i % 2 ? 12 : -12} origin="50% 50%" style={{ position: 'relative' }}>
                      <div style={{ height: 120, borderRadius: 24, background: right ? '#1f9d55' : c, display: 'grid', placeItems: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 54, color: '#fff', boxShadow: '0 8px 0 rgba(0,0,0,.3)', transform: `scale(${right ? 1.06 + beatPulse(frame, 0) * 0.04 : 1})` }}>{right ? `${w} ✓` : w}</div>
                    </Pop>
                  );
                })}
              </div>
            </div>
          </Pop>
          <Confetti at={f(40.16) - f(38.3)} x={330} y={760} count={70} power={40} seed="jawab" colors={[GOLD, '#fff', C.coral, C.sea]} />
        </PopOut>
      </At>

      {/* "ibu bapa dengan cikgu boleh buat soalan sendiri dan pilih game" */}
      <At a={42.6} b={47.8}>
        <PopOut>
          <div style={{ position: 'absolute', left: 300, right: 20, top: 210, display: 'flex', gap: 24, justifyContent: 'center' }}>
            <Pop at={f(42.72) - f(42.6)} rotate={-14} origin="50% 50%" style={{ position: 'relative' }}><StickerText text="Ibu bapa" at={f(42.72) - f(42.6)} size={76} color={C.berry} /></Pop>
            <Pop at={f(43.52) - f(42.6)} rotate={14} origin="50% 50%" style={{ position: 'relative' }}><StickerText text="& Cikgu" at={f(43.52) - f(42.6)} size={76} color={C.sea} /></Pop>
          </div>
          <div style={{ position: 'absolute', left: 380, top: 400, width: 660, height: 420 }}>
            {frame < f(46.1) ? (
              <Pop at={f(44.5) - f(42.6)} rotate={8} origin="50% 50%" style={{ left: 0, top: 0 }}>
                <Screen width={660} height={420} radius={28}><Clip name="create_quiz_1080p" from={f(5)} zoom={1.4} focus={[100, 40]} position="100% 50%" /></Screen>
                <div style={{ position: 'absolute', left: 0, right: 0, top: 440 }}><StickerText text="Buat soalan sendiri!" at={f(44.5) - f(42.6) + 4} size={58} color={C.coral} stagger={1} /></div>
              </Pop>
            ) : (
              <Pop at={f(46.1) - f(42.6)} rotate={-8} origin="50% 50%" style={{ left: 0, top: 0 }}>
                <Screen width={660} height={420} radius={28}><Clip name="game_picker_1080p" from={f(4)} zoom={1.45} focus={[62, 45]} /></Screen>
                <div style={{ position: 'absolute', left: 0, right: 0, top: 440 }}><StickerText text="Pilih game!" at={f(46.1) - f(42.6) + 4} size={64} color={C.sea} font={FONT_PIXEL} /></div>
              </Pop>
            )}
          </div>
          <SparkleBurst at={f(44.5) - f(42.6)} x={710} y={610} radius={380} seed="buat" />
          <SparkleBurst at={f(46.1) - f(42.6)} x={710} y={610} radius={380} seed="pilih" />
        </PopOut>
      </At>

      {/* "jadikan ulangkaji ni sesuatu yang anak-anak seronok nak buat" */}
      <At a={49.0} b={52.6}>
        <PopOut>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 230 }}>
            <StickerText text="Ulangkaji" at={2} size={100} color={C.sea} />
            <StickerText text="jadi SERONOK!" at={f(51.64) - f(49.0)} size={116} color={C.berry} wiggle={1.4} />
          </div>
          <Confetti at={f(51.64) - f(49.0)} x={540} y={420} count={70} power={38} seed="seronok" colors={[C.berry, '#ff8fc8', '#fff', C.sun]} />
        </PopOut>
      </At>

      {/* "kalau belajar pun rasa macam main game. Kenapa tak, kan?" */}
      <At a={53.3} b={57.4}>
        <PopOut>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            <Pop at={2} rotate={-14} origin="50% 50%" style={{ position: 'relative' }}><Img src={staticFile('stickers/buku.webp')} style={{ width: 170 }} /></Pop>
            <Pop at={f(54.48) - f(53.3)} rotate={0} origin="50% 50%" style={{ position: 'relative' }}><div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 150, color: C.ink }}>=</div></Pop>
            <Pop at={f(54.96) - f(53.3)} rotate={14} origin="50% 50%" style={{ position: 'relative' }}>
              <div style={{ width: 170, height: 170, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 10px 20px -8px rgba(31,45,39,.45)' }}><Img src={staticFile(`brand/badges/${BADGES[1].file}`)} style={{ width: '100%', height: '100%', transform: 'scale(1.24)' }} /></div>
            </Pop>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 440 }}>
            <StickerText text="Belajar = main game!" at={f(54.96) - f(53.3)} size={78} color={C.sea} font={FONT_PIXEL} stagger={1} />
          </div>
          {frame >= f(55.78) - f(53.3) ? (
            <Pop at={f(55.78) - f(53.3)} rotate={-20} style={{ left: 820, top: 700 }}>
              <Img src={staticFile('chars/didi-think.png')} style={{ width: 200, imageRendering: 'pixelated' }} />
              <div style={{ position: 'absolute', left: -40, top: -90, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 70, color: C.coral, WebkitTextStroke: '10px #fff', paintOrder: 'stroke fill' } as React.CSSProperties}>kan?</div>
            </Pop>
          ) : null}
        </PopOut>
      </At>

      {/* "singgahlah dekat didik.engineprofit.io" */}
      <At a={57.5} b={62.95}>
        <PopOut>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 220 }}>
            <StickerText text="Tengok sendiri!" at={f(58.38) - f(57.5)} size={84} color={C.sea} />
          </div>
          {frame >= f(59.46) - f(57.5) ? (
            <div style={{ position: 'absolute', left: 0, right: 0, top: 420, display: 'flex', justifyContent: 'center' }}>
              <Pop at={f(59.46) - f(57.5)} rotate={-8} origin="50% 50%" style={{ position: 'relative' }}>
                <div style={{ background: C.sun, border: `8px solid ${C.ink}`, boxShadow: `0 14px 0 ${C.ink}`, borderRadius: 999, padding: '20px 44px 24px', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 62, color: C.ink, transform: `scale(${1 + beatPulse(frame, 0) * 0.04})` }}>
                  {'didik.engineprofit.io'.slice(0, Math.max(0, Math.floor((frame - (f(59.46) - f(57.5))) * 0.9)))}
                  <span style={{ opacity: Math.floor(frame / 8) % 2 ? 1 : 0 }}>|</span>
                </div>
              </Pop>
            </div>
          ) : null}
          <SparkleBurst at={f(59.46) - f(57.5)} x={540} y={490} radius={480} seed="url" />
        </PopOut>
      </At>

      {/* "Okey, jumpa korang dekat DIDIK" */}
      <At a={62.9} b={65.84}>
        <Pop at={2} rotate={-10} origin="50% 50%" from={2} style={{ left: 120, top: 230 }}><Logo width={840} /></Pop>
        <Shockwave at={2} x={540} y={350} color="#fff" size={1300} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 520 }}>
          <StickerText text="Jumpa dekat DIDIK!" at={f(63.9) - f(62.9)} size={84} color={C.berry} stagger={1} />
        </div>
        <Confetti at={f(63.9) - f(62.9)} x={540} y={600} count={120} power={50} seed="end" />
        <Star4 size={70} color={C.sun} style={{ left: 90, top: 260, transform: `scale(${beatPulse(frame, 0)})` }} />
      </At>
    </>
  );
};

// ───────────────────────────── the cuts between topics: shapes that cover the frame and carry the eye
const Transitions: React.FC = () => (
  <>
    <Wipe mid={f(7.6)} color={C.sun} shape="star" len={7} />
    <Wipe mid={f(16.95)} color={C.leaf} second={C.sun} shape="stripes" len={8} />
    <Wipe mid={f(20.7)} color={C.coral} shape="circle" x={540} y={900} len={7} />
    <Wipe mid={STORY[0] * 30} color={GOLD} shape="star" len={8} />
    <Wipe mid={STORY[1] * 30} color={C.sky} shape="blob" x={540} y={1000} len={8} />
    <Wipe mid={f(57.4)} color={C.berry} shape="circle" x={540} y={500} len={7} />
    <Flash at={f(62.9)} length={8} strength={0.9} />
  </>
);

// ───────────────────────────── sound: his voice, a light bed, and pops on the cues
const SFX: Array<[string, number, number]> = [
  ['sparkle', 7.84, 0.35], ['go', 7.84, 0.25], ['pop', 11.6, 0.3], ['pop', 11.75, 0.3], ['pop', 11.9, 0.3], ['pop', 12.05, 0.3], ['boing', 12.94, 0.3],
  ['bubble', 14.2, 0.3], ['boing', 15.52, 0.3], ['swoosh', 16.9, 0.3], ['whoosh', 17.24, 0.35], ['whoosh', 18.2, 0.35], ['whoosh', 19.54, 0.35],
  ['tiles', 22.06, 0.35], ['pop', 24.06, 0.3], ['pop', 24.92, 0.3], ['pop', 25.74, 0.3], ['sparkle', 26.5, 0.3], ['boing', 28.78, 0.3],
  ['magic', 29.96, 0.35], ['sparkle', 31.04, 0.3], ['impact', 32.46, 0.3], ['bubble', 34.34, 0.3], ['bubble', 34.5, 0.3], ['whoosh', 35.12, 0.3],
  ['zap', 37.1, 0.3], ['impact', 37.22, 0.45], ['correct', 40.16, 0.3], ['swoosh', 40.55, 0.3], ['pop', 42.72, 0.3], ['pop', 43.52, 0.3],
  ['whoosh', 44.5, 0.3], ['whoosh', 46.1, 0.3], ['sparkle', 51.64, 0.3], ['pop', 54.48, 0.3], ['boing', 55.78, 0.3], ['whoosh', 57.4, 0.3],
  ['tiles', 59.46, 0.3], ['sparkle', 62.95, 0.35], ['fanfare', 63.9, 0.25],
];

export const Talk: React.FC = () => {
  const punch = usePunch();
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <AbsoluteFill style={{ transform: `scale(${1 + punch})` }}>
        <Backdrop />
        <Floaters />
        <Yul />
        <Illustrations />
      </AbsoluteFill>
      <Captions />
      <Transitions />
      <Audio src={staticFile('talk/voice.wav')} />
      <Audio src={staticFile('audio/music-vlog.wav')} volume={0.13} />
      {SFX.map(([name, at, volume], i) => (
        <Sequence key={i} from={f(at)} layout="none">
          <Audio src={staticFile(`audio/sfx/${name}.wav`)} volume={volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
