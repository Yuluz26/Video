import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Clip, Kicker, Logo, Paper, Phone, Screen, Sparkles, useRise, Words } from './components';
import { BADGES } from './badges';
import { P, PL } from './clips';
import { COPY } from './copy';
import { PromoAudio, PromoScenes, TIMES } from './Promo';
import { C, FONT_BODY, FONT_DISPLAY } from './theme';

// The 60 s promo recut for 16:9 (YouTube, a website, a classroom screen). Same score, same beats and copy;
// the big screen leads and the child's phone sits beside it.
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const one = (s: string) => s.replace(/\n/g, ' ');


/** Text on its own ground at the left, footage at the right: captions never sit on the app's own words. */
const SidePanel: React.FC<{ children: React.ReactNode; width?: number; color?: string }> = ({ children, width = 720, color = C.night }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width, background: color, padding: '0 70px 0 100px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>{children}</div>
);

const Hook: React.FC = () => (
  <AbsoluteFill style={{ background: C.night }}>
    <Screen width={1100} style={{ left: 760, top: 230 }}>
      {PL.hook.map((c, i) => (
        <Sequence key={i} from={i * 30} durationInFrames={i === PL.hook.length - 1 ? 112 - i * 30 : 30}>
          <Clip name={c.clip} from={c.from} push={0.04} />
        </Sequence>
      ))}
    </Screen>
    <SidePanel>
      <Words text={one(COPY.hook)} size={78} color="#fff" delay={4} />
    </SidePanel>
  </AbsoluteFill>
);

const LogoHit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 8, fps, config: { damping: 14, stiffness: 160, mass: 0.7 } });
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${0.86 + p * 0.14})`, opacity: Math.min(1, p * 2), position: 'relative' }}>
          <Logo width={900} />
          <Sparkles at={[[40, 10, 44], [860, 30, 36, C.berry], [780, 290, 30, C.sea]]} delay={10} life={70} />
        </div>
        <div style={{ marginTop: 44 }}>
          <Words text={COPY.tagline} size={52} color={C.ink2} weight={500} delay={22} align="center" />
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

const Create: React.FC = () => {
  const frame = useCurrentFrame();
  const swap = 105;
  return (
    <Paper>
      <div style={{ position: 'absolute', left: 110, top: 300, width: 560 }}>
        <Kicker size={22}>{COPY.parentsKicker}</Kicker>
        <div style={{ height: 20 }} />
        <Words text={COPY.create1} size={84} delay={4} />
        <Words text={COPY.create2} size={84} delay={swap} color={C.coral} />
        <div style={{ height: 30 }} />
        <Words text={frame < swap ? COPY.createNote : COPY.pickerNote} size={32} font={FONT_BODY} weight={600} color={C.ink2} delay={frame < swap ? 30 : swap + 20} lineHeight={1.35} />
      </div>
      <Screen width={1100} style={{ right: 80, top: 230, ...useRise(6) }}>
        {frame < swap ? <Clip name={P.create.clip} from={P.create.from} push={0.12} focus={P.create.focus} /> : (
          <Sequence from={swap} layout="none"><Clip name={P.picker.clip} from={P.picker.from} push={0.06} focus={[40, 30]} /></Sequence>
        )}
      </Screen>
    </Paper>
  );
};

const Join: React.FC = () => (
  <Paper color={C.paper2}>
    <div style={{ position: 'absolute', left: 110, top: 90, width: 1200 }}>
      <Words text={one(COPY.join)} size={70} delay={2} />
    </div>
    <Screen width={1180} style={{ left: 110, top: 300, ...useRise(4) }}>
      <Clip name={P.lobby.clip} from={P.lobby.from} />
    </Screen>
    <Phone height={900} style={{ right: 130, top: 120, ...useRise(14, 60) }}>
      <Clip name={P.join.clip} from={P.join.from} />
    </Phone>
  </Paper>
);

const GameShot: React.FC<{ g: (typeof PL.montage)[number]; headline?: string }> = ({ g, headline }) => (
  <Paper>
    <div style={{ position: 'absolute', left: 110, top: 70, width: 1180 }}>
      <Kicker size={22} delay={2}>{headline ? g.name : g.kicker}</Kicker>
      <div style={{ height: 8 }} />
      <Words text={headline ? one(headline) : g.name} size={headline ? 66 : 72} delay={3} />
    </div>
    <Screen width={1180} style={{ left: 110, top: 280 }}>
      <Clip name={g.host} from={g.from} />
    </Screen>
    <Phone height={900} style={{ right: 130, top: 120 }}>
      <Clip name={g.phone} from={g.phoneFrom ?? g.from} />
    </Phone>
  </Paper>
);

const Badges: React.FC = () => {
  const frame = useCurrentFrame();
  const size = 150;
  const gap = 30;
  return (
    <Paper>
      <div style={{ position: 'absolute', left: 110, top: 380, width: 600 }}>
        <Words text={COPY.badges} size={84} />
      </div>
      <div style={{ position: 'absolute', left: 760, top: 300, width: 7 * size + 6 * gap, display: 'flex', flexWrap: 'wrap', gap }}>
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

const Montage: React.FC = () => (
  <AbsoluteFill>
    {PL.montage.map((g, i) => (
      <Sequence key={g.host} from={i * 60} durationInFrames={60}>
        <GameShot g={g} headline={i === 0 ? COPY.play : undefined} />
      </Sequence>
    ))}
    <Sequence from={PL.montage.length * 60} durationInFrames={480 - PL.montage.length * 60}>
      <Badges />
    </Sequence>
  </AbsoluteFill>
);

const Story: React.FC = () => (
  <AbsoluteFill style={{ background: C.night }}>
    <div style={{ position: 'absolute', left: 720, top: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      {PL.story.map((s, i) => (
        <Sequence key={i} from={i * 80} durationInFrames={80}>
          <Clip name={s.clip} from={s.from} push={0.05} />
        </Sequence>
      ))}
    </div>
    <SidePanel>
      <Kicker color={C.sun} size={24} delay={4}>{COPY.storyKicker}</Kicker>
      <div style={{ height: 14 }} />
      <Words text={COPY.story} size={80} color="#fff" delay={8} />
      <div style={{ height: 28 }} />
      <Words text={COPY.storyNote} size={30} font={FONT_BODY} weight={600} color="rgba(255,255,255,.78)" delay={20} stagger={1} lineHeight={1.4} />
    </SidePanel>
  </AbsoluteFill>
);

const Together: React.FC = () => {
  const frame = useCurrentFrame();
  const podium = 125;
  return (
    <Paper color={C.paper2}>
      <div style={{ position: 'absolute', left: 110, top: 90, width: 1200 }}>
        <Words text={one(COPY.together)} size={70} delay={2} />
      </div>
      <Screen width={1180} style={{ left: 110, top: 300, ...useRise(2) }}>
        {frame < podium ? <Clip name={P.together.host.clip} from={P.together.host.from} /> : (
          <Sequence from={podium} layout="none"><Clip name={P.results.host.clip} from={P.results.host.from} /></Sequence>
        )}
      </Screen>
      <Phone height={900} style={{ right: 130, top: 120, ...useRise(12, 60) }}>
        {frame < podium ? <Clip name={P.together.phone.clip} from={P.together.phone.from} /> : (
          <Sequence from={podium} layout="none"><Clip name={P.results.phone.clip} from={P.results.phone.from} /></Sequence>
        )}
      </Phone>
    </Paper>
  );
};

const Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 4, fps, config: { damping: 16, stiffness: 140 } });
  const cta = interpolate(frame, [120, 136], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${0.9 + p * 0.1})`, opacity: Math.min(1, p * 2), position: 'relative' }}>
          <Logo width={760} />
          <Sparkles at={[[30, 0, 36], [740, 20, 30, C.berry], [690, 230, 26, C.sea]]} delay={120} life={100} />
        </div>
        <div style={{ marginTop: 50 }}>
          <Words text={one(COPY.closing)} size={76} align="center" delay={30} stagger={6} />
        </div>
        <div style={{ marginTop: 50, opacity: cta, transform: `translateY(${(1 - cta) * 20}px)`, textAlign: 'center' }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 48, color: C.coral }}>{COPY.cta}</span>
          {COPY.url ? <span style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 36, color: C.ink2, marginLeft: 22 }}>{COPY.url}</span> : null}
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

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

export const PromoLandscape: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => (
  <AbsoluteFill style={{ background: C.paper }}>
    <PromoScenes scenes={SCENES} />
    {withAudio ? <PromoAudio /> : null}
  </AbsoluteFill>
);
