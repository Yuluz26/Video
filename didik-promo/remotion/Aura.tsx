// "Aura" — a TikTok of Yul building DIDIK, cut to "We On Go" (cinematic brass, ~129 BPM). Not an ad: the
// work itself. Real DIDIK source code typed in an editor (rendered with HyperFrames, hf/ide-*), the real
// test run, then the real app and its games on the brass hits. Times are song seconds (beats.json).
import React from 'react';
import { AbsoluteFill, Audio, interpolate, OffthreadVideo, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Clip, Phone, Screen } from './components';
import { C, FONT_MONO } from './theme';

export const AURA_FRAMES = 1441; // 48.03 s, the song
const f = (s: number) => Math.round(s * 30);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const RED = '#ff3b30';
const INK = '#eef2fb';

// the song's strong hits (onset strength ≥ 0.54 of the loudest) and the clusters the montage cuts on
const HARD = [13.79, 14.26, 14.72, 25.7, 30.28, 32.09, 34.18, 35.76, 41.26, 43.1, 46.74];
const CUTS = [28.44, 30.28, 31.88, 33.72, 34.85, 35.55, 36.92, 38.29, 40.59, 41.96, 43.1, 44.03, 44.93, 45.86, 46.74];
const SOFT = [28.91, 30.51, 30.98, 32.09, 33.92, 34.18, 35.09, 35.76, 37.15, 37.38, 38.52, 38.75, 38.99, 39.22, 40.82, 41.05, 41.26, 42.19, 43.56];

// ───────────────────────────── finishing: grain, vignette, letterbox, shake, flash, tear
const Grain: React.FC<{ strength?: number }> = ({ strength = 0.07 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundImage: `url(${staticFile('aura/grain.png')})`, backgroundSize: '512px 512px', backgroundPosition: `${random(`gx${frame}`) * 512}px ${random(`gy${frame}`) * 512}px`, opacity: strength, mixBlendMode: 'overlay', pointerEvents: 'none' }} />
  );
};
const Vignette: React.FC<{ k?: number }> = ({ k = 0.75 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 60% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,${k}) 100%)`, pointerEvents: 'none' }} />
);
const useShake = (hits: number[], power = 22) => {
  const frame = useCurrentFrame();
  let dx = 0, dy = 0, s = 0;
  for (const h of hits) {
    const t = frame - f(h);
    if (t >= 0 && t < 10) {
      const k = Math.pow(1 - t / 10, 2);
      dx += (random(`dx${h}${t}`) - 0.5) * 2 * power * k;
      dy += (random(`dy${h}${t}`) - 0.5) * 2 * power * k;
      s += 0.06 * k;
    }
  }
  return `translate(${dx}px, ${dy}px) scale(${1 + s})`;
};
const Flash: React.FC<{ at: number; color?: string; len?: number; k?: number }> = ({ at, color = '#fff', len = 7, k = 0.9 }) => {
  const frame = useCurrentFrame();
  const t = frame - f(at);
  if (t < 0 || t > len) return null;
  return <AbsoluteFill style={{ background: color, opacity: k * (1 - t / len), pointerEvents: 'none' }} />;
};
/** A digital tear over a hard cut: offset slabs in red, cyan and white for a few frames. */
const Tear: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const t = frame - f(at);
  if (t < -1 || t > 5) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: 9 }, (_, i) => {
        const r = (k: string) => random(`tear${at}${i}${k}${t}`);
        const h = 10 + r('h') * 90;
        return <div key={i} style={{ position: 'absolute', left: (r('x') - 0.5) * 240, top: r('y') * 1920, width: 1080, height: h, background: [RED, '#00e5ff', '#ffffff'][i % 3], opacity: 0.18 + r('o') * 0.4, mixBlendMode: 'screen' }} />;
      })}
    </AbsoluteFill>
  );
};
const Letterbox: React.FC<{ h: number }> = ({ h }) => (
  <>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: h, background: '#000' }} />
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: h, background: '#000' }} />
  </>
);

/** Song time of the current scene's first frame, so captions can be cued in song seconds anywhere. */
const SceneStart = React.createContext(0);
const useSongFrame = () => useCurrentFrame() + f(React.useContext(SceneStart));

// ───────────────────────────── type: monospace, typed in, with a block cursor
const Typed: React.FC<{ text: string; at: number; size: number; cps?: number; color?: string; weight?: number; cursor?: boolean; out?: number; style?: React.CSSProperties; glow?: string }> = ({
  text, at, size, cps = 22, color = INK, weight = 700, cursor = true, out, style, glow,
}) => {
  const frame = useSongFrame();
  const t = frame / 30 - at;
  if (t < 0 || (out !== undefined && frame / 30 >= out)) return null;
  const n = Math.min(text.length, Math.floor(t * cps) + 1);
  const done = n >= text.length;
  const on = !done || Math.floor(frame / 9) % 2 === 0;
  return (
    <div style={{ fontFamily: FONT_MONO, fontWeight: weight, fontSize: size, color, letterSpacing: '0.02em', whiteSpace: 'pre', textShadow: glow ? `0 0 ${size * 0.35}px ${glow}` : '0 2px 18px rgba(0,0,0,.8)', ...style }}>
      {text.slice(0, n)}
      {cursor ? <span style={{ display: 'inline-block', width: size * 0.55, height: size * 0.95, marginLeft: size * 0.08, verticalAlign: '-0.12em', background: on ? color : 'transparent' }} /> : null}
    </div>
  );
};

/** One word, slammed in on a hit: it lands big and settles. */
const Slam: React.FC<{ word: string; at: number; out: number; size?: number; color?: string; sub?: string }> = ({ word, at, out, size = 190, color = INK, sub }) => {
  const frame = useSongFrame();
  const { fps } = useVideoConfig();
  if (frame < f(at) || frame >= f(out)) return null;
  const p = spring({ frame: frame - f(at), fps, config: { stiffness: 380, damping: 18, mass: 0.6 } });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: `scale(${2.2 - 1.2 * p})`, opacity: Math.min(1, p * 2), textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_MONO, fontWeight: 800, fontSize: size, color, letterSpacing: '0.04em', textShadow: `0 0 40px ${RED}, 0 0 90px rgba(255,59,48,.45)` }}>{word}</div>
        {sub ? <div style={{ fontFamily: FONT_MONO, fontWeight: 400, fontSize: 34, color: 'rgba(238,242,251,.7)', marginTop: 14 }}>{sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────────── 1. the editor (0 – 13.79)
const Editor: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  // a slow push in, drifting; then into the terminal for the build command
  const push = interpolate(t, [0, 12.6, 13.79], [1.04, 1.13, 1.42], { ...clamp, easing: (x) => x * x });
  const oy = interpolate(t, [0, 12.6, 13.79], [0, -30, -560], clamp);
  const rot = interpolate(t, [0, 13.79], [-1.2, 0.6]);
  const dim = interpolate(t, [0, 0.6], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <AbsoluteFill style={{ transform: `translateY(${oy}px) scale(${push}) rotate(${rot}deg)`, opacity: dim, transformOrigin: '50% 80%' }}>
        <OffthreadVideo src={staticFile('aura/ide-a.mp4')} muted style={{ width: '100%', height: '100%' }} />
      </AbsoluteFill>
      {/* monitor glow on the edges */}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.85) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 62%, rgba(0,0,0,.7) 100%)' }} />
      <div style={{ position: 'absolute', left: 70, top: 300 }}>
        <Typed text="02:47 AM" at={0.07} size={112} cps={30} glow="rgba(255,182,39,.6)" color={C.sun} out={6.6} />
        <Typed text="// build log: DIDIK" at={0.8} size={38} weight={400} color="rgba(238,242,251,.75)" cursor={false} out={6.6} style={{ marginTop: 18 }} />
        <Typed text="♪ We On Go" at={1.6} size={30} weight={400} color="rgba(238,242,251,.55)" cursor={false} out={6.6} style={{ marginTop: 12 }} />
      </div>
      <div style={{ position: 'absolute', left: 70, bottom: 520 }}>
        <Typed text="satu baris," at={3.02} size={72} out={6.69} />
      </div>
      <div style={{ position: 'absolute', left: 70, bottom: 520 }}>
        <Typed text="demi satu baris." at={6.69} size={72} out={9.47} />
      </div>
      <div style={{ position: 'absolute', left: 70, top: 300 }}>
        <Typed text="67,077 baris kemudian." at={11.0} size={64} color={C.sun} glow="rgba(255,182,39,.5)" out={12.89} />
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────────── 2. compile. run. play. (13.79 – 14.72)
const ThreeHits: React.FC = () => (
  <AbsoluteFill style={{ background: '#050508' }}>
    <Sequence from={f(14.26) - f(13.79)} layout="none">
      <AbsoluteFill style={{ opacity: 0.35, filter: 'blur(2px) saturate(.6)' }}>
        <Clip name="v3_host_lobby_1080p" from={f(3)} zoom={1.6} focus={[25, 20]} />
      </AbsoluteFill>
    </Sequence>
    <Slam word="COMPILE." at={13.79} out={14.26} />
    <Slam word="RUN." at={14.26} out={14.72} sub="✓ http://localhost:8080" />
  </AbsoluteFill>
);

// ───────────────────────────── 3. from the terminal to the kids' hands (14.72 – 22.0)
const CODE_RAIN = [
  'MODES = {cls.key: cls for cls in (', 'InteraktifMode, RaceMode, JumpMode,', 'TreasureMode, ForestMode, TeamsMode,', 'VillageMode, PictureMode, GardenMode,',
  'FishingMode, KiteMode, SandcastleMode,', 'TrainMode, MarketMode, StarsMode,', 'LegendaMode,', ')}', 'HEARTS = 12', 'BOSS_BARS = 5',
  'def reward(self, player, seat, outcome):', '    if not outcome.correct:', '        return {"bait": 0}', 'room.fx({"kind": "catch"})', 'await room.broadcast()',
];
const CodeBackdrop: React.FC<{ speed?: number }> = ({ speed = 1.4 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#05060a', overflow: 'hidden' }}>
      {[0, 1, 2].map((col) => (
        <div key={col} style={{ position: 'absolute', left: 40 + col * 360, top: -((frame * speed * (1 + col * 0.35)) % 1600), fontFamily: FONT_MONO, fontSize: 24, lineHeight: '46px', color: col === 1 ? 'rgba(255,182,39,.20)' : 'rgba(143,184,255,.14)', whiteSpace: 'pre', filter: col === 1 ? 'none' : 'blur(1.5px)' }}>
          {Array.from({ length: 6 }, () => CODE_RAIN).flat().map((l, i) => <div key={i}>{l}</div>)}
        </div>
      ))}
    </AbsoluteFill>
  );
};
const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phoneIn = spring({ frame, fps, config: { stiffness: 90, damping: 16, mass: 1 } });
  const hostIn = spring({ frame: frame - f(18.39 - 14.72), fps, config: { stiffness: 90, damping: 16, mass: 1 } });
  const drift = interpolate(frame, [0, f(7.3)], [0, -70]);
  return (
    <AbsoluteFill>
      <CodeBackdrop />
      <Vignette k={0.9} />
      {/* the host's big screen, floating behind */}
      <div style={{ position: 'absolute', left: 40, top: 470 + drift * 0.5, opacity: hostIn, transform: `perspective(1600px) rotateY(${18 - 6 * hostIn}deg) rotateX(4deg) scale(${0.9 + 0.1 * hostIn})`, transformOrigin: '0% 50%' }}>
        <Screen width={1000} radius={20} style={{ position: 'relative', boxShadow: '0 40px 120px -30px rgba(255,59,48,.35), 0 0 0 1px rgba(255,255,255,.08)' }}>
          <Sequence from={f(18.39 - 14.72)} layout="none"><Clip name="v3_host_lobby_1080p" from={f(9)} /></Sequence>
        </Screen>
      </div>
      {/* a child's phone, in front */}
      <div style={{ position: 'absolute', left: 300, top: 820 + (1 - phoneIn) * 900 + drift, transform: `rotate(${-4 + 4 * phoneIn}deg)` }}>
        <Phone height={1020} style={{ position: 'relative', boxShadow: '0 50px 120px -20px rgba(0,0,0,.9), 0 0 60px rgba(255,182,39,.18)' }}>
          <Clip name="v3_phone_join_9x16" from={f(3.6)} rate={1.4} />
        </Phone>
      </div>
      <div style={{ position: 'absolute', left: 70, top: 230 }}>
        <Typed text="dari terminal" at={15.2} size={66} out={22} />
        <Typed text="ke tangan budak-budak." at={18.39} size={66} color={C.sun} glow="rgba(255,182,39,.5)" out={22} style={{ marginTop: 10 }} />
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────────── 4. test it (22.0 – 25.7)
const Tests: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30 + 22;
  const push = interpolate(t, [22, 25.7], [1.0, 1.18], { ...clamp, easing: (x) => x * x });
  const black = interpolate(t, [25.38, 25.5], [0, 1], clamp); // a breath of black before the drop
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: '50% 85%' }}>
        <OffthreadVideo src={staticFile('aura/ide-b.mp4')} muted style={{ width: '100%', height: '100%' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.85) 0%, rgba(0,0,0,0) 30%)' }} />
      <div style={{ position: 'absolute', left: 70, top: 280 }}>
        <Typed text="test dulu." at={22.1} size={80} out={25.4} />
        <Typed text="313 passed." at={25.0} size={80} color="#3ddc84" glow="rgba(61,220,132,.6)" out={25.4} cursor={false} style={{ marginTop: 10 }} />
      </div>
      <AbsoluteFill style={{ background: '#000', opacity: black }} />
    </AbsoluteFill>
  );
};

// ───────────────────────────── 5. the drop: Hikayat Lima Alam (25.7 – 28.44)
const Drop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { stiffness: 260, damping: 16, mass: 0.7 } });
  const title = interpolate(frame, [0, 4, 36, 42], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {/* the boss reveal, then the attack, both from the recorded run */}
      <Sequence durationInFrames={42} layout="none">
        <AbsoluteFill style={{ transform: `scale(${1.35 - 0.25 * p})` }}>
          <Clip name="v3_legenda_smooth_player_1080p" from={f(85.35)} fit="cover" position="62% 50%" />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={42} layout="none">
        <AbsoluteFill style={{ transform: `scale(${1.08 + interpolate(frame, [42, 82], [0, 0.08], clamp)})` }}>
          <Clip name="v3_legenda_smooth_player_1080p" from={f(89.95)} fit="cover" position="92% 50%" />
        </AbsoluteFill>
      </Sequence>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.7) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 65%, rgba(0,0,0,.8) 100%)' }} />
      <Letterbox h={interpolate(frame, [0, 10], [420, 230], clamp)} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', opacity: title }}>
        <div style={{ fontFamily: FONT_MONO, fontWeight: 400, fontSize: 30, letterSpacing: '0.5em', color: 'rgba(238,242,251,.75)' }}>STORY MODE</div>
        <div style={{ fontFamily: FONT_MONO, fontWeight: 800, fontSize: 84, color: '#ffd45a', letterSpacing: '0.06em', marginTop: 10, textShadow: '0 0 40px rgba(255,180,40,.7)' }}>HIKAYAT LIMA ALAM</div>
      </div>
      <div style={{ position: 'absolute', left: 70, bottom: 270 }}>
        <Typed text="game/modes/legenda.py  ✓" at={26.2} size={30} weight={400} color="rgba(238,242,251,.8)" cursor={false} />
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────────── 6. the games, one per brass hit (28.44 – 46.74)
type Shot = { clip: string; from: number; name: string; file: string; kind: 'phone' | 'host' };
const SHOTS: Shot[] = [
  { clip: 'v3_interaktif_phone_9x16', from: 20, name: 'KUIZ INTERAKTIF', file: 'modes/interaktif.py', kind: 'phone' },
  { clip: 'v3_lompat_phone_9x16', from: 22.5, name: 'LOMPAT!', file: 'modes/jump.py', kind: 'phone' },
  { clip: 'v3_lumba_phone_9x16', from: 20.5, name: 'LUMBA SAMPAN', file: 'modes/race.py', kind: 'phone' },
  { clip: 'v3_interaktif-sejarah_phone_9x16', from: 19, name: 'GALI ARTIFAK', file: 'subjects/sejarah/Gali.svelte', kind: 'phone' },
  { clip: 'v3_kebun_phone_9x16', from: 12, name: 'KEBUN AJAIB', file: 'modes/garden.py', kind: 'phone' },
  { clip: 'v3_pasar_phone_9x16', from: 18, name: 'PASAR MALAM', file: 'modes/market.py', kind: 'phone' },
  { clip: 'v3_interaktif-islam_phone_9x16', from: 24, name: 'WARNA TAJWID', file: 'subjects/islam/Tajwid.svelte', kind: 'phone' },
  { clip: 'v3_harta_phone_9x16', from: 18.5, name: 'PULAU HARTA KARUN', file: 'modes/treasure.py', kind: 'phone' },
  { clip: 'v3_kampung_b_phone_9x16', from: 30, name: 'KAMPUNG KITA', file: 'modes/village.py', kind: 'phone' },
  { clip: 'v3_teka_phone_9x16', from: 27, name: 'TEKA GAMBAR', file: 'modes/picture.py', kind: 'phone' },
  { clip: 'v3_interaktif-sejarah_phone_9x16', from: 30, name: 'BINA EMPAYAR', file: 'subjects/sejarah/Empayar.svelte', kind: 'phone' },
  { clip: 'v3_interaktif-islam_phone_9x16', from: 33, name: 'HURUF HIJAIYAH', file: 'subjects/islam/Hijaiyah.svelte', kind: 'phone' },
  { clip: 'v3_hutan_phone_9x16', from: 22, name: 'HUTAN MISTERI', file: 'modes/forest.py', kind: 'phone' },
  { clip: 'v3_lumba_results_phone_9x16', from: 28, name: 'TAMAT!', file: 'room.py · podium', kind: 'phone' },
];

const ShotView: React.FC<{ s: Shot; i: number; len: number }> = ({ s, i, len }) => {
  const frame = useCurrentFrame();
  const start = CUTS[i];
  // punch-ins on the smaller hits inside this shot
  const punch = SOFT.filter((h) => h > start && h < start + len / 30).reduce((a, h) => {
    const d = frame - (f(h) - f(start));
    return a + (d >= 0 && d < 6 ? (1 - d / 6) * 0.05 : 0);
  }, 0);
  const drift = interpolate(frame, [0, len], [1.0, 1.06]);
  const side = i % 2 === 0 ? 1 : -1;
  return (
    <AbsoluteFill style={{ background: '#05060a' }}>
      {s.kind === 'phone' ? (
        <AbsoluteFill style={{ transform: `scale(${drift + punch}) rotate(${side * 0.6}deg)` }}>
          <Clip name={s.clip} from={f(s.from)} />
        </AbsoluteFill>
      ) : (
        <>
          <CodeBackdrop speed={2.4} />
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ transform: `perspective(1600px) rotateY(${side * 10}deg) scale(${1.02 + punch})` }}>
              <Screen width={1040} height={1300} radius={24} style={{ position: 'relative', boxShadow: '0 40px 140px -20px rgba(255,59,48,.35)' }}>
                <Clip name={s.clip} from={f(s.from)} zoom={1.0} position="35% 50%" />
              </Screen>
            </div>
          </AbsoluteFill>
        </>
      )}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.95) 0%, rgba(0,0,0,.88) 21%, rgba(0,0,0,0) 32%, rgba(0,0,0,0) 85%, rgba(0,0,0,.6) 100%)' }} />
      <div style={{ position: 'absolute', left: 60, right: 60, top: 230 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT_MONO, fontSize: 28, color: 'rgba(238,242,251,.8)' }}>
          <span><span style={{ color: '#3ddc84' }}>✓ </span>game/{s.file}</span>
          <span style={{ color: 'rgba(238,242,251,.5)' }}>{String(i + 1).padStart(2, '0')}/{SHOTS.length}</span>
        </div>
        <Typed text={s.name} at={start} size={s.name.length > 14 ? 66 : 86} cps={40} weight={800} glow="rgba(255,59,48,.55)" style={{ marginTop: 14 }} />
      </div>
    </AbsoluteFill>
  );
};

const Montage: React.FC = () => (
  <AbsoluteFill>
    {SHOTS.map((s, i) => {
      const len = f(CUTS[i + 1]) - f(CUTS[i]);
      return (
        <Sequence key={s.clip} from={f(CUTS[i]) - f(28.44)} durationInFrames={len}>
          <SceneStart.Provider value={CUTS[i]}>
            <ShotView s={s} i={i} len={len} />
          </SceneStart.Provider>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

// ───────────────────────────── 7. the end (46.74 – 48.03)
const End: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [f(1.0), f(1.29)], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: '#000', opacity: fade }}>
      <div style={{ position: 'absolute', left: 70, top: 780 }}>
        <Typed text="DIDIK." at={46.74} size={150} cps={20} weight={800} glow="rgba(255,59,48,.6)" />
        <Typed text="dibina sendiri. satu baris demi satu baris." at={47.05} size={30} cps={80} weight={400} color="rgba(238,242,251,.7)" cursor={false} style={{ marginTop: 18 }} />
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────────── timeline and sound
const SCENES: Array<[React.FC, number, number]> = [
  [Editor, 0, 13.79],
  [ThreeHits, 13.79, 14.72],
  [Reveal, 14.72, 22.0],
  [Tests, 22.0, 25.7],
  [Drop, 25.7, 28.44],
  [Montage, 28.44, 46.74],
  [End, 46.74, 48.04],
];

const SFX: Array<[string, number, number]> = [
  ...HARD.map((h) => ['aura/sfx/glitch.wav', h - 0.02, h === 25.7 ? 0 : 0.32] as [string, number, number]),
  ['aura/sfx/sub.wav', 25.7, 0.75],
  ['audio/sfx/whoosh.wav', 14.62, 0.35],
  ['audio/sfx/whoosh.wav', 18.3, 0.3],
  ['aura/sfx/blip.wav', 14.3, 0.45],
  ['aura/sfx/blip.wav', 15.2, 0.3],
  ['audio/sfx/correct.wav', 25.0, 0.28],
  ['audio/sfx/riser.wav', 23.9, 0.22],
  ...CUTS.slice(1, -1).map((c) => ['audio/sfx/swoosh.wav', c - 0.08, 0.16] as [string, number, number]),
];

export const Aura: React.FC = () => {
  const shake = useShake(HARD);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <AbsoluteFill style={{ transform: shake }}>
        {SCENES.map(([Scene, a, b], i) => (
          <Sequence key={i} from={f(a)} durationInFrames={f(b) - f(a)}>
            <SceneStart.Provider value={a}>
              <Scene />
            </SceneStart.Provider>
          </Sequence>
        ))}
      </AbsoluteFill>
      <Vignette k={0.55} />
      <Grain />
      {HARD.map((h) => <Tear key={h} at={h} />)}
      {HARD.map((h) => <Flash key={`f${h}`} at={h} color={h === 25.7 ? '#fff' : RED} k={h === 25.7 ? 0.95 : 0.35} len={h === 25.7 ? 10 : 6} />)}
      <Audio src={staticFile('aura/song.wav')} />
      <Audio src={staticFile('aura/sfx/typing.wav')} volume={0.5} />
      {SFX.map(([src, at, volume], i) => (
        <Sequence key={i} from={Math.max(0, f(at))} layout="none">
          <Audio src={staticFile(src)} volume={volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
