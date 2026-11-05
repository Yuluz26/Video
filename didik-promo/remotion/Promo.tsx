import React from 'react';
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Clip, Fade, Kicker, Logo, Paper, Phone, Screen, Sparkles, useRise, Words } from './components';
import { P } from './clips';
import { BADGES } from './badges';
import { C, FONT_BODY, FONT_DISPLAY } from './theme';
import { COPY } from './copy';

// 1080×1920, 60 s at 30 fps, cut to the 120 BPM score (bar = 60 frames). Safe area for TikTok / Reels:
// text stays inside x 72–900 and y 220–1500.
export const PROMO_FRAMES = 1800;
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const TopShade: React.FC<{ strength?: number; reach?: number }> = ({ strength = 0.9, reach = 46 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(20,17,42,${strength}) 0%, rgba(20,17,42,${strength}) ${reach * 0.55}%, rgba(20,17,42,0) ${reach}%)` }} />
);

/** 0–3.7 s: four real moments, a cut every two beats, under the question. */
const Hook: React.FC = () => {
  const cuts = P.hook;
  return (
    <AbsoluteFill style={{ background: C.night }}>
      {cuts.map((c, i) => (
        <Sequence key={i} from={i * 30} durationInFrames={i === cuts.length - 1 ? 112 - i * 30 : 30}>
          <Clip name={c.clip} from={c.from} push={0.06} focus={[50, 60]} />
        </Sequence>
      ))}
      <TopShade reach={50} />
      <div style={{ position: 'absolute', left: 80, right: 120, top: 250 }}>
        <Words text={COPY.hook} size={94} color="#fff" weight={600} delay={4} stagger={3} lineHeight={1.04} />
      </div>
    </AbsoluteFill>
  );
};

/** 3.7–7 s: the logo lands on the 4.0 s hit. */
const LogoHit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 8, fps, config: { damping: 14, stiffness: 160, mass: 0.7 } });
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${0.86 + p * 0.14})`, opacity: Math.min(1, p * 2), position: 'relative' }}>
          <Logo width={820} />
          <Sparkles at={[[40, 10, 42], [790, 30, 34, C.berry], [720, 250, 28, C.sea], [120, 250, 24, C.coral]]} delay={10} life={70} />
        </div>
        <div style={{ marginTop: 56 }}>
          <Words text={COPY.tagline} size={54} color={C.ink2} weight={500} delay={22} align="center" />
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

/** 7–14 s: a parent writes a quiz, then picks a game. */
const Create: React.FC = () => {
  const frame = useCurrentFrame();
  const swap = 105;
  return (
    <Paper>
      <div style={{ position: 'absolute', left: 80, top: 250, right: 120 }}>
        <Kicker size={26}>{COPY.parentsKicker}</Kicker>
        <div style={{ height: 22 }} />
        <Words text={COPY.create1} size={96} delay={4} />
        <Words text={COPY.create2} size={96} delay={swap} color={C.coral} />
      </div>
      <Screen width={1000} height={720} style={{ left: 40, top: 620, ...useRise(6) }}>
        {frame < swap ? (
          <Clip name={P.create.clip} from={P.create.from} zoom={1.45} push={0.05} focus={P.create.focus} position="100% 50%" />
        ) : (
          <Sequence from={swap} layout="none">
            <Clip name={P.picker.clip} from={P.picker.from} zoom={1.55} push={0.05} focus={[62, 45]} />
          </Sequence>
        )}
      </Screen>
      <div style={{ position: 'absolute', left: 80, right: 120, top: 1400 }}>
        <Words text={frame < swap ? COPY.createNote : COPY.pickerNote} size={40} font={FONT_BODY} weight={600} color={C.ink2} delay={frame < swap ? 30 : swap + 20} lineHeight={1.3} />
      </div>
    </Paper>
  );
};

/** 14–20 s: the room opens on the big screen; Ali types the code on his phone. Same moment, two screens. */
const Join: React.FC = () => (
  <Paper color={C.paper2}>
    <div style={{ position: 'absolute', left: 80, top: 250, right: 120 }}>
      <Words text={COPY.join} size={92} delay={2} />
      <div style={{ height: 24 }} />
      <Words text={COPY.joinNote} size={38} font={FONT_BODY} weight={600} color={C.ink2} delay={24} lineHeight={1.3} />
    </div>
    <Screen width={760} height={600} style={{ left: 40, top: 780, ...useRise(4) }}>
      <Clip name={P.lobby.clip} from={P.lobby.from} rate={P.lobby.rate} zoom={1.25} focus={[0, 0]} position="0% 0%" />
    </Screen>
    <Phone height={900} style={{ right: 60, top: 860, ...useRise(14, 80) }}>
      <Clip name={P.join.clip} from={P.join.from} rate={P.join.rate} />
    </Phone>
  </Paper>
);

/** One game in the montage: the child's real phone screen, full bleed, with its name. */
const GameShot: React.FC<{ clip: string; from: number; name: string; kicker: string; headline?: string }> = ({ clip, from, name, kicker, headline }) => (
  <AbsoluteFill style={{ background: C.night }}>
    <Clip name={clip} from={from} push={0.04} focus={[50, 70]} />
    <TopShade reach={headline ? 44 : 36} />
    <div style={{ position: 'absolute', left: 80, right: 120, top: 240 }}>
      <Kicker color={C.sun} size={24} delay={3}>{headline ? name : kicker}</Kicker>
      <div style={{ height: 10 }} />
      <Words text={headline ?? name} size={headline ? 80 : 84} color="#fff" delay={4} />
    </div>
  </AbsoluteFill>
);

/** The fourteen 2D games, each by its own badge from the game picker. */
const Badges: React.FC = () => {
  const frame = useCurrentFrame();
  const cols = 4;
  const size = 168;
  const gap = 34;
  const w = cols * size + (cols - 1) * gap;
  return (
    <Paper>
      <div style={{ position: 'absolute', left: 80, top: 260, right: 120 }}>
        <Words text={COPY.badges} size={96} delay={0} />
      </div>
      <div style={{ position: 'absolute', left: (1080 - w) / 2, top: 760, width: w, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap }}>
        {BADGES.slice(0, 14).map((b, i) => {
          const t = interpolate(frame, [4 + i * 2, 14 + i * 2], [0, 1], { ...clamp, easing: Easing.bezier(0.34, 1.56, 0.64, 1) });
          return (
            <div key={b.file} style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', transform: `scale(${t})`, opacity: Math.min(1, t * 2), boxShadow: '0 10px 24px -12px rgba(31,45,39,.45)' }}>
              <Img src={staticFile(`brand/badges/${b.file}`)} style={{ width: '100%', height: '100%', transform: 'scale(1.24)' }} />
            </div>
          );
        })}
      </div>
    </Paper>
  );
};

/** 20–36 s: the montage, one game per bar, starting on the chorus. */
const Montage: React.FC = () => (
  <AbsoluteFill>
    {P.montage.map((g, i) => (
      <Sequence key={g.clip} from={i * 60} durationInFrames={60}>
        <GameShot clip={g.clip} from={g.from} name={g.name} kicker={g.kicker} headline={i === 0 ? COPY.play : undefined} />
      </Sequence>
    ))}
    <Sequence from={P.montage.length * 60} durationInFrames={480 - P.montage.length * 60}>
      <Badges />
    </Sequence>
  </AbsoluteFill>
);

/** 36–44 s: Hikayat Lima Alam over the quieter breakdown: the child's whole screen, uncropped. */
const Story: React.FC = () => (
  <AbsoluteFill style={{ background: C.night }}>
    <div style={{ position: 'absolute', left: 80, right: 120, top: 250 }}>
      <Kicker color={C.sun} size={26} delay={4}>{COPY.storyKicker}</Kicker>
      <div style={{ height: 14 }} />
      <Words text={COPY.story} size={92} color="#fff" delay={8} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 700, width: 1080, height: 608, overflow: 'hidden', ...useRise(4, 40) }}>
      {P.story.map((s, i) => (
        <Sequence key={i} from={i * 80} durationInFrames={80}>
          <Clip name={s.clip} from={s.from} push={0.05} focus={s.focus ?? [50, 50]} />
        </Sequence>
      ))}
    </div>
    <div style={{ position: 'absolute', left: 80, right: 120, top: 1370 }}>
      <Words text={COPY.storyNote} size={38} font={FONT_BODY} weight={600} color="rgba(255,255,255,.78)" delay={20} lineHeight={1.35} />
    </div>
  </AbsoluteFill>
);

/** 44–52 s: everyone in the same race on the big screen, Ali's phone in hand, then the podium. */
const Together: React.FC = () => {
  const frame = useCurrentFrame();
  const podium = 125;
  return (
    <Paper color={C.paper2}>
      <div style={{ position: 'absolute', left: 80, top: 250, right: 120 }}>
        <Words text={COPY.together} size={96} delay={2} />
      </div>
      <Screen width={1000} height={640} style={{ left: 40, top: 640, ...useRise(2) }}>
        {frame < podium ? <Clip name={P.together.host.clip} from={P.together.host.from} zoom={1.2} focus={[50, 0]} /> : (
          <Sequence from={podium} layout="none"><Clip name={P.results.host.clip} from={P.results.host.from} zoom={1.3} focus={[50, 30]} /></Sequence>
        )}
      </Screen>
      <Phone height={760} style={{ right: 60, top: 1030, ...useRise(12, 80) }}>
        {frame < podium ? <Clip name={P.together.phone.clip} from={P.together.phone.from} /> : (
          <Sequence from={podium} layout="none"><Clip name={P.results.phone.clip} from={P.results.phone.from} /></Sequence>
        )}
      </Phone>
      <div style={{ position: 'absolute', left: 80, top: 1360, width: 440 }}>
        <Words text={frame < podium ? COPY.togetherNote : COPY.resultsNote} size={40} font={FONT_BODY} weight={600} color={C.ink2} delay={frame < podium ? 24 : podium + 6} lineHeight={1.3} />
      </div>
    </Paper>
  );
};

/** 52–60 s: brand and the line, then where to find DIDIK. */
const Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 4, fps, config: { damping: 16, stiffness: 140 } });
  const cta = interpolate(frame, [120, 136], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 520 }}>
        <div style={{ transform: `scale(${0.9 + p * 0.1})`, opacity: Math.min(1, p * 2), position: 'relative' }}>
          <Logo width={760} />
          <Sparkles at={[[30, 0, 36], [740, 20, 30, C.berry], [690, 230, 26, C.sea]]} delay={120} life={100} />
        </div>
        <div style={{ marginTop: 70 }}>
          <Words text={COPY.closing} size={78} align="center" delay={30} stagger={6} />
        </div>
        <div style={{ marginTop: 90, opacity: cta, transform: `translateY(${(1 - cta) * 20}px)`, textAlign: 'center' }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 56, color: C.coral }}>{COPY.cta}</div>
          {COPY.url ? <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 38, color: C.ink2, marginTop: 14, letterSpacing: '0.01em' }}>{COPY.url}</div> : null}
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

// Scene boundaries in frames (bar = 60). The 4.0 s hit is frame 120; the chorus starts at 600.
// Shared with the landscape cut, so both versions sit on the same beats.
export const TIMES = { hook: [0, 112], logo: [112, 210], create: [210, 420], join: [420, 600], montage: [600, 1080], story: [1080, 1320], together: [1320, 1560], close: [1560, 1800] } as const;
const SCENES: Array<[React.FC, readonly [number, number]]> = [
  [Hook, TIMES.hook],
  [LogoHit, TIMES.logo],
  [Create, TIMES.create],
  [Join, TIMES.join],
  [Montage, TIMES.montage],
  [Story, TIMES.story],
  [Together, TIMES.together],
  [Close, TIMES.close],
];

const SFX: Array<[string, number, number]> = [
  ['whoosh', 96, 0.5],
  ['go', 120, 0.45],
  ['pop', 210, 0.35],
  ['pop', 315, 0.3],
  ['join', 470, 0.4],
  ['whoosh', 590, 0.45],
  ['correct', 1440, 0.4],
  ['whoosh', 1070, 0.4],
  ['whoosh', 1550, 0.4],
];

/** The score and the few app sounds on the cuts. */
export const PromoAudio: React.FC = () => (
  <>
    <Audio src={staticFile('audio/music-promo.wav')} />
    {SFX.map(([name, at, volume], i) => (
      <Sequence key={i} from={at} layout="none">
        <Audio src={staticFile(`audio/sfx/${name}.wav`)} volume={volume} />
      </Sequence>
    ))}
  </>
);

export const PromoScenes: React.FC<{ scenes: Array<[React.FC, readonly [number, number]]> }> = ({ scenes }) => (
  <>
    {scenes.map(([Scene, [a, b]], i) => (
      <Sequence key={i} from={a} durationInFrames={b - a}>
        <Fade inFrames={i === 0 ? 0 : 6} outFrames={i === scenes.length - 1 ? 18 : 4}>
          <Scene />
        </Fade>
      </Sequence>
    ))}
  </>
);

export const Promo: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => (
  <AbsoluteFill style={{ background: C.paper }}>
    <PromoScenes scenes={SCENES} />
    {withAudio ? <PromoAudio /> : null}
  </AbsoluteFill>
);
