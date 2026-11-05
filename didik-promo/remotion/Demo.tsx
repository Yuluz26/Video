import React from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Clip, Fade, Kicker, Logo, Paper, Phone, Screen, Sparkles, useRise, Words } from './components';
import { DEMO, type Shot } from './demo-plan';
import { C, FONT_BODY, FONT_DISPLAY } from './theme';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

/** A chapter opener: number, title and one line, on paper. */
const ChapterCard: React.FC<{ n: number; title: string; line: string }> = ({ n, title, line }) => {
  const frame = useCurrentFrame();
  const rule = interpolate(frame, [4, 26], [0, 1], { ...clamp, easing: easeOut });
  return (
    <Paper>
      <div style={{ position: 'absolute', left: 200, top: 360, width: 1300 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 40, color: C.sea, letterSpacing: '0.04em' }}>
          {String(n).padStart(2, '0')}
        </div>
        <div style={{ height: 4, width: 120 * rule, background: C.sun, margin: '18px 0 34px', borderRadius: 2 }} />
        <Words text={title} size={110} delay={6} />
        <div style={{ height: 26 }} />
        <Words text={line} size={40} font={FONT_BODY} weight={600} color={C.ink2} delay={16} stagger={1} lineHeight={1.35} />
      </div>
    </Paper>
  );
};

/** Lower third over full-bleed footage: slides in, holds, slides out. */
const LowerThird: React.FC<{ kicker?: string; title: string; line?: string; hold?: number }> = ({ kicker, title, line, hold = 150 }) => {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [6, 22], [0, 1], { ...clamp, easing: easeOut });
  const outP = interpolate(frame, [hold, hold + 14], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const x = (1 - inP) * -40 + outP * -40;
  return (
    <div
      style={{
        position: 'absolute',
        left: 64,
        bottom: 64,
        maxWidth: 820,
        padding: '26px 34px 28px',
        background: 'rgba(255,248,236,.96)',
        borderRadius: 18,
        boxShadow: '0 18px 40px -20px rgba(31,45,39,.45)',
        opacity: inP * (1 - outP),
        transform: `translateX(${x}px)`,
        borderLeft: `6px solid ${C.sun}`,
      }}
    >
      {kicker ? <div style={{ fontFamily: FONT_BODY, fontWeight: 800, fontSize: 18, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.sea, marginBottom: 8 }}>{kicker}</div> : null}
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 46, color: C.ink, lineHeight: 1.05 }}>{title}</div>
      {line ? <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 26, color: C.ink2, marginTop: 10, lineHeight: 1.35 }}>{line}</div> : null}
    </div>
  );
};

/** The host's (or parent's) screen, full bleed, with a lower third. */
const FullShot: React.FC<{ shot: Shot }> = ({ shot }) => (
  <AbsoluteFill style={{ background: C.paper }}>
    <Clip name={shot.clip!} from={shot.from} rate={shot.rate} push={shot.push ?? 0.03} focus={shot.focus} />
    {shot.title ? <LowerThird kicker={shot.kicker} title={shot.title} line={shot.line} hold={Math.min(170, shot.frames - 30)} /> : null}
  </AbsoluteFill>
);

/** Big screen and phone side by side, recorded at the same moment, with the heading above. */
const SplitShot: React.FC<{ shot: Shot }> = ({ shot }) => (
  <Paper color={shot.tint ?? C.paper}>
    <div style={{ position: 'absolute', left: 90, top: 64, width: 1180 }}>
      {shot.kicker ? <Kicker size={20}>{shot.kicker}</Kicker> : null}
      <div style={{ height: 10 }} />
      <Words text={shot.title ?? ''} size={64} delay={3} />
      {shot.line ? (
        <div style={{ marginTop: 12 }}>
          <Words text={shot.line} size={28} font={FONT_BODY} weight={600} color={C.ink2} delay={10} stagger={1} lineHeight={1.35} />
        </div>
      ) : null}
    </div>
    <Screen width={1200} style={{ left: 90, top: 300, ...useRise(2, 30) }}>
      <Clip name={shot.clip!} from={shot.from} rate={shot.rate} />
    </Screen>
    {shot.phone ? (
      <Phone height={960} style={{ right: 110, top: 70, ...useRise(8, 50) }}>
        <Clip name={shot.phone} from={shot.phoneFrom ?? shot.from} rate={shot.rate} />
      </Phone>
    ) : null}
  </Paper>
);

/** A phone on its own, with the words beside it. */
const PhoneShot: React.FC<{ shot: Shot }> = ({ shot }) => (
  <Paper color={shot.tint ?? C.paper2}>
    <div style={{ position: 'absolute', left: 160, top: 330, width: 820 }}>
      {shot.kicker ? <Kicker size={22}>{shot.kicker}</Kicker> : null}
      <div style={{ height: 14 }} />
      <Words text={shot.title ?? ''} size={84} delay={3} />
      {shot.line ? (
        <div style={{ marginTop: 22 }}>
          <Words text={shot.line} size={34} font={FONT_BODY} weight={600} color={C.ink2} delay={12} stagger={1} lineHeight={1.4} />
        </div>
      ) : null}
    </div>
    <Phone height={980} style={{ right: 240, top: 50, ...useRise(4, 50) }}>
      <Clip name={shot.clip!} from={shot.from} rate={shot.rate} />
    </Phone>
  </Paper>
);

const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 6, fps, config: { damping: 16, stiffness: 140 } });
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${0.92 + p * 0.08})`, opacity: Math.min(1, p * 2), position: 'relative' }}>
          <Logo width={900} />
          <Sparkles at={[[40, 10, 44], [860, 30, 36, C.berry], [780, 290, 30, C.sea]]} delay={14} life={90} />
        </div>
        <div style={{ marginTop: 48 }}>
          <Words text="Demo penuh: apa yang ada dalam DIDIK hari ini." size={44} font={FONT_BODY} weight={600} color={C.ink2} delay={24} align="center" stagger={2} />
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 4, fps, config: { damping: 16, stiffness: 140 } });
  const cta = interpolate(frame, [60, 76], [0, 1], { ...clamp, easing: easeOut });
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${0.92 + p * 0.08})`, opacity: Math.min(1, p * 2) }}>
          <Logo width={760} />
        </div>
        <div style={{ marginTop: 50 }}>
          <Words text="Belajar. Bermain. Berkembang." size={76} align="center" delay={20} stagger={5} />
        </div>
        <div style={{ marginTop: 50, opacity: cta, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 44, color: C.coral }}>Kenali DIDIK · didik.engineprofit.io</div>
      </AbsoluteFill>
    </Paper>
  );
};

const renderShot = (shot: Shot) => {
  if (shot.kind === 'chapter') return <ChapterCard n={shot.n!} title={shot.title!} line={shot.line ?? ''} />;
  if (shot.kind === 'open') return <Opening />;
  if (shot.kind === 'close') return <Closing />;
  if (shot.kind === 'split') return <SplitShot shot={shot} />;
  if (shot.kind === 'phone') return <PhoneShot shot={shot} />;
  return <FullShot shot={shot} />;
};

export const demoFrames = () => DEMO.reduce((a, s) => a + s.frames, 0);

export const Demo: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      {DEMO.map((shot, i) => {
        const from = at;
        at += shot.frames;
        return (
          <Sequence key={i} from={from} durationInFrames={shot.frames} name={`${shot.kind} ${shot.title ?? shot.clip ?? ''}`}>
            <Fade inFrames={i === 0 ? 0 : 7} outFrames={i === DEMO.length - 1 ? 24 : 7}>{renderShot(shot)}</Fade>
          </Sequence>
        );
      })}
      {withAudio ? <Audio src={staticFile('audio/music-bed.wav')} volume={0.55} /> : null}
    </AbsoluteFill>
  );
};
