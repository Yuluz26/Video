// The energetic DIDIK promo: 60 s, 1080×1920, cut on the 120 BPM score (beat = 15 frames).
// Real app recordings are the spine; motion graphics, DIDIK's own characters, stickers and Legenda sprites
// are layered around them. Story Mode is a trailer built from the game's own battle art and effect sheets.
import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Clip, Logo, Phone, Screen } from './components';
import { BADGES } from './badges';
import { beatPulse, bounce, Confetti, Flash, PlayBg, Pop, Shake, Shockwave, SparkleBurst, SpriteSheet, Star4, Sticker, StickerText, usePop, useFly, Wipe } from './motion';
import { C, FONT_BODY, FONT_DISPLAY } from './theme';
import { H } from './hype-plan';

export const HYPE_FRAMES = 1800;
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const Char: React.FC<{ name: string; h: number; style?: React.CSSProperties }> = ({ name, h, style }) => (
  <Img src={staticFile(`chars/${name}.png`)} style={{ height: h, imageRendering: 'pixelated', filter: 'drop-shadow(0 10px 8px rgba(31,45,39,.25))', ...style }} />
);

/** A pixel character that hops on every beat once it has landed. */
const Hopper: React.FC<{ name: string; h: number; x: number; y: number; at: number; phase?: number; label?: string; labelColor?: string }> = ({ name, h, x, y, at, phase = 0, label, labelColor = C.sea }) => {
  const frame = useCurrentFrame();
  const { style } = usePop(at, { rotate: -14 });
  const hop = frame > at + 10 ? -Math.abs(Math.sin(((frame - at + phase) / 15) * Math.PI)) * h * 0.12 : 0;
  const land = frame > at + 10 ? beatPulse(frame, phase) : 0;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -100%)' }}>
      <div style={{ ...style, transformOrigin: '50% 100%' }}>
        <div style={{ transform: `translateY(${hop}px) scale(${1 + land * 0.06}, ${1 - land * 0.08})`, transformOrigin: '50% 100%' }}>
          <Char name={name} h={h} />
        </div>
      </div>
      {label ? (
        <div style={{ position: 'absolute', left: '50%', top: h + 6, transform: 'translateX(-50%)' }}>
          <StickerText text={label} at={at + 6} size={44} color={labelColor} wiggle={0.5} />
        </div>
      ) : null}
    </div>
  );
};

// ───────────────────────────────────────── 1. Hook (0–112)
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [92, 112], [1, 1.5], { ...clamp, easing: (x) => x * x });
  const spin = interpolate(frame, [92, 112], [0, 8], clamp);
  return (
    <AbsoluteFill>
      <PlayBg color={C.sun} dot="rgba(255,255,255,.6)" speed={1.6} />
      <AbsoluteFill style={{ transform: `scale(${push}) rotate(${spin}deg)` }}>
        {H.hook.map((c, i) => (
          <div key={i} style={{ position: 'absolute', left: 30 + i * 255, top: 1080 + (i % 2) * 90, ...useFly(48 + i * 6, i % 2 ? 'down' : 'up', [-12, -4, 5, 12][i]) }}>
            <Phone height={520}>
              <Clip name={c.clip} from={c.from} />
            </Phone>
          </div>
        ))}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 230 }}>
          <StickerText text="Macam mana kalau" at={2} size={70} color={C.ink} shadow={C.sunDeep} />
          <StickerText text="KUIZ" at={15} size={240} color={C.coral} style={{ marginTop: 6 }} />
          <StickerText text="jadi" at={28} size={92} color={C.sea} style={{ marginTop: -18 }} />
          <StickerText text="PERMAINAN?!" at={40} size={132} color={C.berry} stagger={1} />
        </div>
        <SparkleBurst at={15} x={540} y={470} radius={420} seed="hk" />
        <Confetti at={40} x={540} y={820} count={70} power={40} seed="hook" />
        <Sticker name="bintang" size={150} x={120} y={330} at={20} seed={1} />
        <Sticker name="piala" size={150} x={960} y={360} at={26} seed={2} />
        <Sticker name="hadiah" size={130} x={960} y={900} at={56} seed={3} />
      </AbsoluteFill>
      <Flash at={108} length={12} strength={1} />
    </AbsoluteFill>
  );
};

// ───────────────────────────────────────── 2. Logo smash (112–210)
const LogoSmash: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hit = 0; // = 120 global, the music's hit
  const p = bounce(frame, hit, fps, 320, 8, 0.6);
  const s = interpolate(p, [0, 1], [2.6, 1]);
  const over = p - 1;
  const kids = ['chibi-kancil', 'chibi-harimau', 'chibi-arnab', 'chibi-penyu', 'chibi-kucing', 'chibi-gajah'];
  return (
    <AbsoluteFill>
      <PlayBg color={C.paper} dot="rgba(255,182,39,.45)" />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${s * (1 - over * 0.3)}, ${s * (1 + over * 0.4)}) rotate(${beatPulse(frame, hit) * 2 - 1}deg)`, opacity: frame < hit ? 0 : 1 }}>
          <Logo width={880} />
        </div>
      </div>
      <Shockwave at={hit} x={540} y={690} color={C.sun} size={1500} />
      <SparkleBurst at={hit} x={540} y={690} count={14} radius={560} seed="logo" />
      <Confetti at={hit} x={540} y={700} count={90} power={46} seed="logo" />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 960 }}>
        <StickerText text="Main kuiz" at={24} size={104} color={C.sea} />
        <StickerText text="bersama kawan!" at={34} size={104} color={C.coral} />
      </div>
      {kids.map((k, i) => <Hopper key={k} name={k} h={230} x={140 + i * 160} y={1500} at={30 + i * 4} phase={i * 4} />)}
    </AbsoluteFill>
  );
};

// ───────────────────────────────────────── 3. Create and pick (210–390)
const Create: React.FC = () => {
  const frame = useCurrentFrame();
  const flipAt = 90;
  const f = interpolate(frame, [flipAt - 8, flipAt, flipAt + 8], [1, 0, 1], clamp);
  const showPicker = frame >= flipAt;
  const badgeArc = BADGES.slice(0, 14);
  return (
    <AbsoluteFill>
      <PlayBg color="#d6eafb" />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 230 }}>
        {frame < flipAt ? (
          <StickerText text="Cipta soalan!" at={4} size={118} color={C.coral} out={flipAt - 8} />
        ) : (
          <StickerText text="Pilih permainan!" at={flipAt} size={104} color={C.berry} />
        )}
        <div style={{ height: 14 }} />
        {frame < flipAt ? (
          <StickerText text="16 jenis soalan · gambar · penerangan" at={20} size={40} color={C.ink} shadow={C.sky} stagger={1} wiggle={0.3} out={flipAt - 8} />
        ) : (
          <StickerText text="Satu kuiz, banyak permainan" at={flipAt + 10} size={44} color={C.ink} shadow={C.sky} stagger={1} wiggle={0.3} />
        )}
      </div>
      <div style={{ position: 'absolute', left: 40, top: 520, width: 1000, height: 720, ...useFly(4, 'right', 2) }}>
        <div style={{ width: '100%', height: '100%', transform: `scaleX(${f})` }}>
          <Screen width={1000} height={720} radius={36}>
            {showPicker ? (
              <Sequence from={flipAt} layout="none"><Clip name={H.picker.clip} from={H.picker.from} zoom={1.55} focus={[62, 45]} /></Sequence>
            ) : (
              <Clip name={H.create.clip} from={H.create.from} zoom={1.45} focus={[100, 40]} position="100% 50%" />
            )}
          </Screen>
        </div>
      </div>
      {frame < flipAt ? (
        <>
          <Sticker name="gajah" size={190} x={130} y={520} at={34} seed={1} />
          <Sticker name="pensel" size={150} x={960} y={500} at={42} seed={2} />
          <Sticker name="buku" size={170} x={930} y={1300} at={50} seed={3} />
          <Sticker name="epal" size={150} x={150} y={1320} at={58} seed={4} />
        </>
      ) : null}
      {showPicker
        ? badgeArc.map((b, i) => {
            const a = Math.PI * (0.05 + (i / (badgeArc.length - 1)) * 0.9);
            const tx = 540 - Math.cos(a) * 470;
            const ty = 1280 + Math.sin(a) * 250;
            return (
              <Pop key={b.file} at={flipAt + 8 + i * 2} rotate={-30} origin="50% 50%" style={{ left: tx - 62, top: ty - 62, width: 124, height: 124 }}>
                <div style={{ width: 124, height: 124, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 8px 16px -6px rgba(31,45,39,.4)', transform: `translateY(${-beatPulse(frame, i * 2) * 14}px)` }}>
                  <Img src={staticFile(`brand/badges/${b.file}`)} style={{ width: '100%', height: '100%', transform: 'scale(1.24)' }} />
                </div>
              </Pop>
            );
          })
        : null}
      <SparkleBurst at={flipAt} x={540} y={880} radius={520} seed="flip" />
    </AbsoluteFill>
  );
};

// ───────────────────────────────────────── 4. Join (390–540)
const Join: React.FC = () => {
  const digits = '790750';
  return (
    <AbsoluteFill>
      <PlayBg color="#d9f1de" />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 220 }}>
        <StickerText text="Masuk dengan kod!" at={4} size={98} color={C.sea} />
        <div style={{ height: 6 }} />
        <StickerText text="Tiada akaun untuk anak-anak" at={14} size={44} color={C.ink} shadow={C.leaf} stagger={1} wiggle={0.3} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', gap: 14 }}>
        {[...digits].map((d, i) => (
          <React.Fragment key={i}>
            {i === 3 ? <div style={{ width: 26 }} /> : null}
            <Pop at={22 + i * 7} rotate={i % 2 ? 16 : -16} origin="50% 50%" style={{ position: 'relative' }}>
              <div style={{ width: 118, height: 150, borderRadius: 26, background: '#fff', border: `6px solid ${C.ink}`, boxShadow: `0 10px 0 ${C.ink}`, display: 'grid', placeItems: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 104, color: [C.coral, C.sea, C.sunDeep, C.berry, C.sky, C.leaf][i] }}>{d}</div>
            </Pop>
          </React.Fragment>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 70, top: 700, ...useFly(8, 'up', -5) }}>
        <Phone height={980}>
          <Clip name={H.join.clip} from={H.join.from} rate={H.join.rate} />
        </Phone>
      </div>
      <Hopper name="chibi-harimau" h={210} x={830} y={960} at={64} phase={0} label="Ali" labelColor={C.coral} />
      <Hopper name="chibi-arnab" h={210} x={830} y={1230} at={78} phase={5} label="Aina" labelColor={C.berry} />
      <Hopper name="chibi-kancil" h={210} x={830} y={1500} at={92} phase={10} label="Amir" labelColor={C.sea} />
      <SparkleBurst at={64} x={830} y={860} radius={180} count={8} seed="j1" />
      <SparkleBurst at={78} x={830} y={1130} radius={180} count={8} seed="j2" />
      <SparkleBurst at={92} x={830} y={1400} radius={180} count={8} seed="j3" />
    </AbsoluteFill>
  );
};

// ───────────────────────────────────────── 5. Quiz moment (540–660), over the build
const ANSWERS: Array<[string, string, string]> = [['A', '8', C.coral], ['B', '2', C.sea], ['C', '4', C.sun], ['D', '6', C.sky]];
const Quiz: React.FC = () => {
  const frame = useCurrentFrame();
  const tap = 84;
  const right = 1; // "2" is correct: a chicken has two legs (the quiz's own question)
  const timer = interpolate(frame, [8, tap], [1, 0.18], clamp);
  return (
    <AbsoluteFill>
      <PlayBg color={C.paper2} dot="rgba(255,255,255,.7)" speed={1.4 + (frame / 120) * 1.5} />
      <Pop at={2} rotate={-6} origin="50% 50%" style={{ left: 60, top: 280, width: 960 }}>
        <div style={{ background: '#fff', borderRadius: 44, padding: '40px 48px 46px', boxShadow: `0 14px 0 ${C.line}, 0 30px 60px -30px rgba(31,45,39,.4)`, position: 'relative' }}>
          <div style={{ height: 22, borderRadius: 11, background: C.paper2, overflow: 'hidden' }}>
            <div style={{ width: `${timer * 100}%`, height: '100%', background: timer < 0.3 ? C.coral : C.sun }} />
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 70, lineHeight: 1.08, color: C.ink, marginTop: 30, width: 640 }}>
            Berapakah kaki seekor ayam?
          </div>
          <Sticker name="ayam" size={230} x={800} y={190} at={10} bob={18} spin={10} seed={5} />
        </div>
      </Pop>
      {ANSWERS.map(([letter, text, color], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const isRight = i === right;
        const after = frame >= tap;
        const pressed = frame >= tap && frame < tap + 5;
        const pulse = frame < tap ? beatPulse(frame, i * 4) * 0.05 * (frame / tap) : 0;
        const bg = after && isRight ? '#1f9d55' : color;
        return (
          <Pop key={letter} at={18 + i * 6} rotate={i % 2 ? 12 : -12} origin="50% 50%" style={{ left: 60 + col * 490, top: 790 + row * 330, width: 470, height: 300 }}>
            <div
              style={{
                width: '100%', height: '100%', borderRadius: 40, background: bg, boxShadow: `0 16px 0 rgba(31,45,39,.35)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                transform: `scale(${pressed ? 0.86 : 1 + pulse}) ${after && isRight ? `rotate(${Math.sin(frame / 2) * 3}deg)` : ''}`,
                opacity: after && !isRight ? 0.35 : 1, filter: after && !isRight ? 'grayscale(.6)' : 'none',
              }}
            >
              <div style={{ position: 'absolute', left: 26, top: 22, width: 70, height: 70, borderRadius: 20, background: 'rgba(255,255,255,.3)', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: '#fff', display: 'grid', placeItems: 'center' }}>{letter}</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 150, color: '#fff', textShadow: '0 8px 0 rgba(0,0,0,.18)' }}>{after && isRight ? '2 ✓' : text}</div>
            </div>
          </Pop>
        );
      })}
      {/* the tap: a ripple where a finger lands */}
      {frame >= tap - 6 && frame < tap + 14 ? (
        <div style={{ position: 'absolute', left: 60 + 490 + 235 - 60, top: 790 + 150 - 60, width: 120, height: 120, borderRadius: '50%', border: '10px solid #fff', transform: `scale(${interpolate(frame, [tap - 6, tap, tap + 14], [1.4, 0.6, 2.4])})`, opacity: interpolate(frame, [tap - 6, tap, tap + 14], [0.4, 1, 0]) }} />
      ) : null}
      <Confetti at={tap + 4} x={785} y={940} count={110} power={52} seed="quiz" />
      <SparkleBurst at={tap + 4} x={785} y={940} radius={520} count={14} seed="quiz" />
      {frame >= tap + 6 ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1450 }}>
          <StickerText text="Hebat! +100" at={tap + 6} size={120} color={C.leaf} stagger={1} />
        </div>
      ) : null}
      {[0, 1, 2, 3, 4].map((i) => (
        <Sticker key={i} name={i % 2 ? 'syiling' : 'bintang'} size={110} x={160 + i * 190} y={1380 - (i % 2) * 60} at={tap + 10 + i * 2} seed={i} bob={20} />
      ))}
      <div style={{ position: 'absolute', left: 20, top: 1290 }}>
        <Pop at={tap + 8} rotate={-20}><Char name="didi-cheer" h={190} /></Pop>
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────────────────────── 6. Game montage (660–1020), on the drop
const GameSlot: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const g = H.games[i];
  const fromLeft = i % 2 === 0;
  const reveal = interpolate(frame, [0, 12], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  return (
    <AbsoluteFill style={{ clipPath: `circle(${reveal * 150}% at ${fromLeft ? 0 : 100}% 70%)` }}>
      <PlayBg color={g.bg} speed={2} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 220 }}>
        <StickerText text={g.kicker} at={4} size={44} color={C.ink} shadow={g.accent} stagger={1} wiggle={0.4} />
        <StickerText text={g.name} at={7} size={g.name.length > 12 ? 92 : 112} color={g.accent} stagger={1} />
      </div>
      <div style={{ position: 'absolute', left: 230, top: 520, ...useFly(2, fromLeft ? 'left' : 'right', fromLeft ? -4 : 4, 56, fromLeft ? 'right' : 'left') }}>
        <Phone height={1080}>
          <Clip name={g.clip} from={g.from} />
        </Phone>
      </div>
      <Sticker name={g.stickers[0]} size={170} x={fromLeft ? 140 : 940} y={760} at={10} seed={i} bob={22} />
      <Sticker name={g.stickers[1]} size={150} x={fromLeft ? 950 : 130} y={1300} at={16} seed={i + 3} bob={22} />
      <Pop at={30} rotate={-30} origin="50% 50%" style={{ left: fromLeft ? 860 : 60, top: 1000 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: '#fff', WebkitTextStroke: `10px ${C.ink}`, paintOrder: 'stroke fill' } as React.CSSProperties}>{g.reward}</div>
      </Pop>
      <SparkleBurst at={30} x={fromLeft ? 920 : 120} y={1040} radius={160} count={7} seed={`g${i}`} />
    </AbsoluteFill>
  );
};

const Montage: React.FC = () => (
  <AbsoluteFill>
    {H.games.map((g, i) => (
      // each slot overlaps the next by 8 frames: the next phone flies in over the last one flying out
      <Sequence key={g.clip} from={i * 60} durationInFrames={i === H.games.length - 1 ? 60 : 68}>
        <GameSlot i={i} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

// ───────────────────────────────────────── 7. Badge rain (1020–1080)
const BadgeRain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const size = 190;
  const gap = 40;
  const cols = 4;
  const push = interpolate(frame, [48, 60], [1, 2.6], { ...clamp, easing: (x) => x * x * x });
  return (
    <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: '50% 60%' }}>
      <PlayBg color={C.sun} dot="rgba(255,255,255,.6)" speed={2} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 230 }}>
        <StickerText text="14 permainan 2D!" at={2} size={112} color={C.coral} stagger={1} />
      </div>
      {BADGES.slice(0, 14).map((b, i) => {
        const row = Math.floor(i / cols);
        const inRow = row === 3 ? 2 : cols;
        const col = i % cols;
        const x = 540 - ((inRow * size + (inRow - 1) * gap) / 2) + col * (size + gap);
        const y = 520 + row * (size + gap);
        const p = bounce(frame, 4 + i * 1.6, fps, 180, 9, 0.7);
        return (
          <div key={b.file} style={{ position: 'absolute', left: x, top: y - (1 - p) * 1400, width: size, height: size, borderRadius: '50%', overflow: 'hidden', transform: `rotate(${(1 - p) * 200}deg) scale(${1 + beatPulse(frame, i % 4 * 3) * 0.07})`, boxShadow: '0 12px 22px -10px rgba(31,45,39,.5)' }}>
            <Img src={staticFile(`brand/badges/${b.file}`)} style={{ width: '100%', height: '100%', transform: 'scale(1.24)' }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ───────────────────────────────────────── 8. Story Mode trailer (1080–1440)
const S = (f: string) => staticFile(`story/${f}`);
const GOLD = '#ffd45a';

const Embers: React.FC<{ count?: number }> = ({ count = 40 }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const x = (i * 97) % 1080;
        const speed = 3 + (i % 5);
        const y = 1920 - ((frame * speed + i * 211) % 2100);
        const s = 6 + (i % 4) * 4;
        return <div key={i} style={{ position: 'absolute', left: x + Math.sin((frame + i * 10) / 12) * 30, top: y, width: s, height: s, borderRadius: '50%', background: i % 3 ? '#ffb347' : GOLD, boxShadow: `0 0 ${s * 2}px ${GOLD}`, opacity: 0.8 }} />;
      })}
    </>
  );
};

const WORLDS = [
  { key: 'chini', name: 'Tasik Chini', boss: 'Naga Chini' },
  { key: 'lupar', name: 'Batang Lupar', boss: 'Bujang Senang' },
  { key: 'larut', name: 'Hutan Larut', boss: 'Gajah Rimba' },
  { key: 'kancil', name: 'Rimba Bayangan', boss: 'Sang Kancil Bayangan' },
  { key: 'ledang', name: 'Gunung Ledang', boss: 'Penunggu Kabus' },
];

const StoryTitle: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <Img src={S('worlds/chini/field.webp')} style={{ position: 'absolute', height: 1920, left: -1100 + frame * 3, top: 0, opacity: 0.28, filter: 'blur(6px) saturate(1.3)', maxWidth: 'none' }} />
      <Embers />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 520 }}>
        <StickerText text="STORY MODE" at={4} size={56} color={C.night} outline={GOLD} shadow="#7a4b00" stagger={1} wiggle={0.3} />
        <div style={{ height: 20 }} />
        <StickerText text={'HIKAYAT\nLIMA ALAM'} at={10} size={150} color={GOLD} outline={C.night} shadow="#7a4b00" stagger={2} lineHeight={1.0} />
      </div>
      {WORLDS.map((w, i) => {
        const a = (i / 5) * Math.PI * 2 + frame / 14;
        const settle = interpolate(frame, [24, 44], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
        const ox = 540 + Math.cos(a) * 420;
        const oy = 1180 + Math.sin(a) * 160;
        const tx = 540 - 2 * 170 + i * 170;
        const ty = 1250;
        return (
          <Pop key={w.key} at={14 + i * 3} rotate={-40} origin="50% 50%" style={{ left: ox + (tx - ox) * settle - 70, top: oy + (ty - oy) * settle - 70 }}>
            <Img src={S(`ui/symbol_${w.key}.webp`)} style={{ width: 140, height: 140, filter: `drop-shadow(0 0 ${12 + beatPulse(frame, i * 3) * 18}px ${GOLD})` }} />
          </Pop>
        );
      })}
      <Flash at={0} color={GOLD} length={10} strength={0.9} />
    </AbsoluteFill>
  );
};

/** Five worlds, one beat-and-a-bit each, slashing from one to the next. */
const WorldsMontage: React.FC = () => {
  const frame = useCurrentFrame();
  const each = 12;
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <Shake hits={[0, 12, 24, 36, 48]} power={16}>
      {WORLDS.map((w, i) => (
        <Sequence key={w.key} from={i * each} durationInFrames={i === WORLDS.length - 1 ? 60 - i * each : each + 4}>
          <AbsoluteFill style={{ clipPath: `polygon(${interpolate(frame - i * each, [0, 5], [100, -40], clamp)}% 0, 140% 0, 140% 100%, ${interpolate(frame - i * each, [0, 5], [140, 0], clamp)}% 100%)` }}>
            <OffthreadVideo src={S(`worlds/${w.key}/scene.mp4`)} muted style={{ position: 'absolute', height: 1920, left: -1150 - (frame - i * each) * 6, top: 0, maxWidth: 'none', transform: `scale(${1.05 + (frame - i * each) * 0.006})` }} />
            <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(20,17,42,.6) 0%, rgba(20,17,42,0) 30%, rgba(20,17,42,0) 62%, rgba(20,17,42,.85) 100%)' }} />
            <Img src={S(`worlds/${w.key}/boss.webp`)} style={{ position: 'absolute', right: -40, top: 520 - (frame - i * each) * 4, width: 760, filter: 'drop-shadow(0 0 30px rgba(0,0,0,.6))' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: 1240 }}>
              <StickerText text={`Dunia ${i + 1}`} at={i * each} size={48} color={C.night} outline={GOLD} shadow="#7a4b00" stagger={1} wiggle={0} />
              <StickerText text={w.name} at={i * each + 1} size={96} color={GOLD} outline={C.night} shadow="#7a4b00" stagger={1} wiggle={0} />
              <StickerText text={`Boss: ${w.boss}`} at={i * each + 3} size={50} color="#fff" outline={C.night} shadow={C.night} stagger={0} wiggle={0} />
            </div>
          </AbsoluteFill>
        </Sequence>
      ))}
      </Shake>
    </AbsoluteFill>
  );
};

/** The battle: Hang Tuah and Mahsuri against Naga Chini, answers as attacks. Local frames 0–180. */
const HITS = [50, 96, 122, 134, 146];
const Battle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = 5 - HITS.filter((h) => frame >= h + 2).length;
  const defeated = frame >= 150;
  // camera: pans from the heroes to the boss and punches in on every hit
  const punch = HITS.reduce((a, h) => a + (frame >= h && frame < h + 10 ? (1 - (frame - h) / 10) * 0.06 : 0), 0);
  const camX = interpolate(frame, [0, 40, 60, 180], [120, 0, -30, -60], clamp);
  const camS = interpolate(frame, [0, 30, 180], [1.12, 1.0, 1.08], clamp) + punch;
  // heroes: Tuah attacks first, Mahsuri casts the second hit, Tuah finishes the combo
  const mahsuri = frame >= 84 && frame < 118;
  const hero = mahsuri ? 'mahsuri' : 'tuah';
  const attacking = HITS.some((h) => frame >= h - 8 && frame < h + 6);
  const pose = defeated && frame >= 156 ? 'victory' : attacking ? (mahsuri ? 'cast' : 'attack') : frame >= 20 ? 'ready' : 'idle';
  const dash = HITS.reduce((a, h) => a + (frame >= h - 8 && frame < h + 10 ? Math.sin(((frame - (h - 8)) / 18) * Math.PI) * (mahsuri ? 60 : 300) : 0), 0);
  const heroIn = bounce(frame, 4, fps, 150, 12, 0.8);
  const heroBob = Math.sin(frame / 6) * 6;
  // boss: breathes, recoils and flashes on hits, then falls
  const lastHit = [...HITS].reverse().find((h) => frame >= h);
  const sinceHit = lastHit === undefined ? 99 : frame - lastHit;
  const recoil = sinceHit < 10 ? Math.sin((sinceHit / 10) * Math.PI) * 50 : 0;
  const bossFlash = sinceHit < 4 ? 2.4 : 1;
  const bossFall = interpolate(frame, [150, 172], [0, 1], clamp);
  const bossBlink = defeated && frame < 166 && Math.floor(frame / 2) % 2 === 0;
  const bossIn = bounce(frame, 8, fps, 120, 12, 1);
  const fx = ['petir', 'api', 'angin', 'air', 'tanah'];
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <Shake hits={HITS} power={30}>
        <AbsoluteFill style={{ transform: `translateX(${camX}px) scale(${camS})`, transformOrigin: '60% 55%' }}>
          {/* parallax: the painted field behind, a darker blurred near layer in front */}
          <Img src={S('worlds/chini/field.webp')} style={{ position: 'absolute', height: 1920, left: -1420 + frame * 0.8, top: 0, maxWidth: 'none', filter: 'saturate(1.15)' }} />
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(20,17,42,.55) 0%, rgba(20,17,42,0) 24%, rgba(20,17,42,0) 70%, rgba(20,17,42,.8) 100%)' }} />
          {/* minions */}
          {['minion_a', 'minion_b'].map((m, i) => (
            <Img key={m} src={S(`worlds/chini/${m}.webp`)} style={{ position: 'absolute', left: 640 + i * 230, top: 1150 + i * 40 + Math.sin((frame + i * 9) / 7) * 10, width: 150, opacity: interpolate(frame, [150, 165], [1, 0], clamp), imageRendering: 'auto' }} />
          ))}
          {/* the boss */}
          <div style={{ position: 'absolute', left: 470, top: 560, width: 620, transform: `translate(${recoil + (1 - bossIn) * 600}px, ${Math.sin(frame / 9) * 14 + bossFall * 120}px) rotate(${recoil * 0.12}deg) scale(${1 - bossFall * 0.5})`, opacity: (1 - bossFall) * (bossBlink ? 0.2 : 1), transformOrigin: '50% 80%' }}>
            <Img src={S('worlds/chini/boss.webp')} style={{ width: '100%', filter: `brightness(${bossFlash}) drop-shadow(0 0 40px rgba(18,132,122,.6))` }} />
          </div>
          {/* the hero */}
          <div style={{ position: 'absolute', left: 30 + dash - (1 - heroIn) * 700, top: 1000 + heroBob, width: 470, transformOrigin: '50% 100%', transform: `scale(${1 + beatPulse(frame, 0) * 0.02})` }}>
            <Img src={S(`heroes/${hero}/${pose}.webp`)} style={{ width: '100%', filter: 'drop-shadow(0 18px 18px rgba(0,0,0,.45))' }} />
          </div>
          {/* attack effects, frame by frame on the boss */}
          {HITS.map((h, i) => (
            <SpriteSheet key={h} src={`story/fx/${fx[i]}_slash.webp`} cols={4} rows={3} w={314} h={418} at={h - 4} every={2} scale={1.9} feather style={{ left: 480, top: 380 }} />
          ))}
          {HITS.map((h, i) => (
            <Pop key={`d${h}`} at={h + 1} rotate={20} origin="50% 50%" style={{ left: 760 + (i % 2) * 90, top: 560 - i * 20 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 110, color: i === 0 ? GOLD : '#fff', WebkitTextStroke: `12px ${C.coral}`, paintOrder: 'stroke fill', opacity: interpolate(frame, [h + 1, h + 18, h + 26], [1, 1, 0], clamp), transform: `translateY(${-(frame - h) * 3}px)` } as React.CSSProperties}>
                {i === 0 ? 'LEMAH!' : '-1'}
              </div>
            </Pop>
          ))}
        </AbsoluteFill>
      </Shake>
      {/* HUD: boss name and five bars, hearts, the elements with Petir chosen */}
      <div style={{ position: 'absolute', left: 60, right: 60, top: 230, opacity: interpolate(frame, [10, 18], [0, 1], clamp) }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 56, color: GOLD, WebkitTextStroke: `8px ${C.night}`, paintOrder: 'stroke fill' } as React.CSSProperties}>NAGA CHINI</div>
        <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
          {[0, 1, 2, 3, 4].map((b) => (
            <div key={b} style={{ flex: 1, height: 34, borderRadius: 10, border: `5px solid ${C.night}`, background: b < hp ? '#e2483d' : 'rgba(255,255,255,.2)', transform: `scaleY(${b === hp && sinceHit < 8 ? 1.5 : 1})`, transition: 'none' }} />
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 60, top: 1420, display: 'flex', gap: 8, opacity: interpolate(frame, [14, 22], [0, 1], clamp) }}>
        {[0, 1, 2, 3, 4, 5].map((k) => <Img key={k} src={S('ui/heart_full.webp')} style={{ width: 62, transform: `scale(${1 + beatPulse(frame, k * 2) * 0.12})` }} />)}
      </div>
      <div style={{ position: 'absolute', right: 50, top: 1400, display: 'flex', gap: 10 }}>
        {fx.map((e, k) => {
          const chosen = (k === 0 && frame >= 36 && frame < 84) || (k === 1 && frame >= 84 && frame < 118) || (frame >= 118 && frame < 150 && k === [2, 3, 4][Math.min(2, Math.floor((frame - 118) / 12))]);
          return (
            <Pop key={e} at={28 + k * 3} rotate={-30} origin="50% 50%" style={{ position: 'relative' }}>
              <Img src={S(`ui/element_${e}.webp`)} style={{ width: 92, filter: chosen ? `drop-shadow(0 0 18px ${GOLD})` : 'saturate(.6)', transform: `scale(${chosen ? 1.25 + beatPulse(frame, 0) * 0.12 : 1})` }} />
            </Pop>
          );
        })}
      </div>
      {/* the game's own animated banners */}
      <SpriteSheet src="story/banners/pertarungan_bermula_sheet.webp" cols={4} rows={3} w={960} h={240} at={0} every={2} scale={1.05} hold={false} style={{ left: 36, top: 820 }} />
      <SpriteSheet src="story/banners/jawapan_betul_sheet.webp" cols={4} rows={3} w={960} h={240} at={60} every={2} scale={1.05} style={{ left: 36, top: 820 }} />
      {frame >= 154 ? (
        <Pop at={154} rotate={-10} origin="50% 50%" style={{ left: 40, top: 760, width: 1000 }}>
          <Img src={S('banners/boss_dikalahkan.webp')} style={{ width: '100%' }} />
        </Pop>
      ) : null}
      {HITS.map((h) => <Flash key={h} at={h} length={6} strength={0.75} />)}
      <SparkleBurst at={152} x={760} y={820} radius={600} count={16} seed="boss" colors={[GOLD, '#fff', '#7fe3d6']} />
      <Confetti at={156} x={540} y={900} count={110} power={50} seed="win" colors={[GOLD, '#fff', C.coral, C.sea, '#7fe3d6']} />
    </AbsoluteFill>
  );
};

/** The real thing: the recorded Legenda run, so the trailer is anchored to the app. Local 0–60. */
const StoryReal: React.FC = () => (
  <AbsoluteFill style={{ background: C.night }}>
    <Embers count={24} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 260 }}>
      <StickerText text="Jawab soalan," at={2} size={90} color="#fff" outline={C.night} shadow="#7a4b00" stagger={1} />
      <StickerText text="SERANG BOSS!" at={10} size={120} color={GOLD} outline={C.night} shadow="#7a4b00" stagger={1} />
    </div>
    <div style={{ position: 'absolute', left: 40, top: 720, ...useFly(4, 'right', -3) }}>
      <Screen width={1000} radius={30}>
        <Clip name={H.storyReal.clip} from={H.storyReal.from} />
      </Screen>
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1330 }}>
      <StickerText text="Dalam DIDIK sebenar" at={16} size={48} color={C.night} outline={GOLD} shadow="#7a4b00" stagger={1} wiggle={0.3} />
    </div>
  </AbsoluteFill>
);

const Story: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={60}><StoryTitle /></Sequence>
    <Sequence from={60} durationInFrames={60}><WorldsMontage /></Sequence>
    <Sequence from={120} durationInFrames={180}><Battle /></Sequence>
    <Sequence from={300} durationInFrames={60}><StoryReal /></Sequence>
    <Wipe mid={120} color={GOLD} shape="star" />
    <Wipe mid={300} color={C.night} shape="circle" x={760} y={820} len={8} />
  </AbsoluteFill>
);

// ───────────────────────────────────────── 9. Together (1440–1620)
const Together: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const blocks: Array<[number, number, string, string, string, number]> = [
    // [place, height, colour, character, name, x]
    [2, 260, C.sea, 'chibi-arnab', 'Aina', 70],
    [1, 360, C.sun, 'chibi-harimau', 'Ali', 235],
    [3, 190, C.coral, 'chibi-kancil', 'Amir', 400],
  ];
  return (
    <AbsoluteFill>
      <PlayBg color="#fbdcec" speed={1.6} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 220 }}>
        <StickerText text="Main bersama" at={4} size={110} color={C.berry} />
        <StickerText text="kawan-kawan!" at={12} size={110} color={C.sea} />
      </div>
      <div style={{ position: 'absolute', left: 590, top: 560, ...useFly(8, 'right', 4) }}>
        <Phone height={820}>
          <Clip name={H.results.clip} from={H.results.from} />
        </Phone>
      </div>
      {blocks.map(([place, h, color, ch, name, x], i) => {
        const p = bounce(frame, 30 + i * 6, fps, 160, 11, 0.8);
        const top = 1480 - h * p;
        return (
          <React.Fragment key={name}>
            <div style={{ position: 'absolute', left: x, top, width: 150, height: h * p, background: color, borderRadius: '18px 18px 0 0', boxShadow: 'inset 0 -10px 0 rgba(0,0,0,.12)', display: 'flex', justifyContent: 'center', paddingTop: 14, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 80, color: '#fff' }}>{place}</div>
            <Hopper name={ch} h={170} x={x + 75} y={1480 - h - 4} at={52 + i * 6} phase={i * 5} />
          </React.Fragment>
        );
      })}
      <Pop at={80} rotate={-30} origin="50% 50%" style={{ left: 250, top: 830 }}>
        <Img src={staticFile('stickers/mahkota.webp')} style={{ width: 120, transform: `translateY(${-Math.abs(Math.sin(frame / 7.5 * Math.PI / 2)) * 16}px)` }} />
      </Pop>
      <Confetti at={78} x={310} y={1000} count={90} power={44} seed="pod1" />
      <Confetti at={120} x={800} y={600} count={70} power={40} seed="pod2" />
      <SparkleBurst at={80} x={310} y={950} radius={260} seed="crown" />
    </AbsoluteFill>
  );
};

// ───────────────────────────────────────── 10. Close (1620–1800)
const Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = bounce(frame, 4, fps, 300, 8, 0.6);
  const over = p - 1;
  const cta = bounce(frame, 60, fps, 260, 9, 0.6);
  const fade = interpolate(frame, [168, 180], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <PlayBg color={C.paper} dot="rgba(255,182,39,.45)" />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${Math.max(0, p) * (1 - over * 0.3)}, ${Math.max(0, p) * (1 + over * 0.4)}) rotate(${Math.sin(frame / 10) * 1.5}deg)` }}>
          <Logo width={820} />
        </div>
      </div>
      <Shockwave at={4} x={540} y={500} color={C.sun} size={1400} />
      <SparkleBurst at={4} x={540} y={500} count={14} radius={520} seed="close" />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 760 }}>
        <StickerText text="Belajar." at={30} size={124} color={C.coral} />
        <StickerText text="Bermain." at={45} size={124} color={C.sea} />
        <StickerText text="Berkembang." at={60} size={124} color={C.berry} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1240, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: frame >= 60 ? 1 : 0 }}>
        <div style={{ transform: `scale(${Math.max(0, cta) * (1 + beatPulse(frame, 0) * 0.05)})`, background: C.sun, border: `7px solid ${C.ink}`, boxShadow: `0 12px 0 ${C.ink}`, borderRadius: 999, padding: '18px 56px 22px', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 72, color: C.ink }}>
          Kenali DIDIK
        </div>
        <div style={{ marginTop: 34, fontFamily: FONT_BODY, fontWeight: 800, fontSize: 40, color: C.ink2, transform: `scale(${Math.max(0, bounce(frame, 70, fps))})` }}>didik.engineprofit.io</div>
      </div>
      <div style={{ position: 'absolute', left: 30, top: 1260, transform: `rotate(${Math.sin(frame / 5) * 6}deg)`, transformOrigin: '50% 100%' }}>
        <Pop at={70} rotate={-20}><Char name="didi-wave" h={200} /></Pop>
      </div>
      <Sticker name="bintang" size={130} x={110} y={330} at={14} seed={1} />
      <Sticker name="hati" size={120} x={970} y={300} at={18} seed={2} />
      <Sticker name="belon" size={150} x={950} y={1350} at={74} seed={3} />
      <Confetti at={60} x={540} y={1300} count={120} power={52} seed="end" />
      <Confetti at={120} x={200} y={700} count={60} power={40} seed="end2" />
      <Confetti at={124} x={880} y={700} count={60} power={40} seed="end3" />
      <Star4 size={60} color={C.sun} style={{ left: 120, top: 1080, transform: `scale(${beatPulse(frame, 0)})` }} />
    </AbsoluteFill>
  );
};

// ───────────────────────────────────────── timeline
const SCENES: Array<[React.FC, number, number]> = [
  [Hook, 0, 120],
  [LogoSmash, 120, 210],
  [Create, 210, 390],
  [Join, 390, 540],
  [Quiz, 540, 660],
  [Montage, 660, 1020],
  [BadgeRain, 1020, 1080],
  [Story, 1080, 1440],
  [Together, 1440, 1620],
  [Close, 1620, 1800],
];

export const PromoHype: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => (
  <AbsoluteFill style={{ background: C.paper }}>
    {SCENES.map(([Scene, a, b], i) => (
      <Sequence key={i} from={a} durationInFrames={b - a}>
        <Scene />
      </Sequence>
    ))}
    {/* scene changes: shapes that cover the cut and carry the eye across */}
    <Wipe mid={210} color={C.sky} second={C.sun} shape="stripes" len={10} />
    <Wipe mid={390} color={C.leaf} shape="circle" x={540} y={1400} />
    <Wipe mid={540} color={C.sun} shape="star" />
    <Flash at={660} length={10} strength={1} />
    <Wipe mid={1020} color={C.coral} shape="blob" x={540} y={1100} len={8} />
    <Wipe mid={1080} color={C.night} shape="circle" x={540} y={900} len={8} />
    <Wipe mid={1440} color={C.berry} shape="blob" x={540} y={900} />
    <Wipe mid={1620} color={C.sun} shape="star" />
    {withAudio ? (
      <>
        <Audio src={staticFile('audio/music-hype.wav')} />
        {H.sfx.map(([name, at, volume], i) => (
          <Sequence key={i} from={at} layout="none">
            <Audio src={staticFile(`audio/sfx/${name}.wav`)} volume={volume} />
          </Sequence>
        ))}
      </>
    ) : null}
  </AbsoluteFill>
);
