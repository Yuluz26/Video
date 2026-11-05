import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT_BODY, FONT_DISPLAY } from './theme';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

/** A recorded clip from recordings/processed (served as public/clips). `from` trims the start, in frames. */
export const Clip: React.FC<{
  name: string;
  from?: number;
  rate?: number;
  push?: number; // slow push-in over the clip's length: 0.04 = 4 %
  focus?: [number, number]; // transform-origin in %, where the push-in heads
  fit?: 'cover' | 'contain';
  position?: string; // object-position when the frame crops the clip
  zoom?: number; // a fixed crop into the clip (1 = whole frame), centred on `focus`
  style?: React.CSSProperties;
}> = ({ name, from = 0, rate = 1, push = 0, focus = [50, 50], fit = 'cover', position = '50% 50%', zoom = 1, style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = zoom + push * interpolate(frame, [0, durationInFrames], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', ...style }}>
      <OffthreadVideo
        src={staticFile(`clips/${name}.mp4`)}
        startFrom={from}
        playbackRate={rate}
        muted
        style={{ width: '100%', height: '100%', objectFit: fit, objectPosition: position, transform: `scale(${scale})`, transformOrigin: `${focus[0]}% ${focus[1]}%` }}
      />
    </div>
  );
};

/** A landscape screen (the host's big screen or a parent's laptop), as a clean card. 16:9. */
export const Screen: React.FC<{ width: number; height?: number; children: React.ReactNode; style?: React.CSSProperties; radius?: number }> = ({ width, height, children, style, radius = 18 }) => (
  <div
    style={{
      position: 'absolute',
      width,
      height: height ?? (width * 9) / 16,
      borderRadius: radius,
      overflow: 'hidden',
      background: C.paper,
      boxShadow: '0 1px 0 rgba(31,45,39,.08), 0 24px 60px -24px rgba(31,45,39,.35)',
      outline: '1px solid rgba(31,45,39,.10)',
      ...style,
    }}
  >
    {children}
  </div>
);

/** A phone: thin dark bezel, rounded glass, 9:16 screen. `height` is the outer height. */
export const Phone: React.FC<{ height: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ height, children, style }) => {
  const bezel = Math.round(height * 0.018);
  const screenH = height - bezel * 2;
  const screenW = (screenH * 9) / 16;
  return (
    <div
      style={{
        position: 'absolute',
        width: screenW + bezel * 2,
        height,
        padding: bezel,
        borderRadius: height * 0.06,
        background: '#17201c',
        boxShadow: '0 30px 70px -28px rgba(31,45,39,.55), inset 0 0 0 1.5px rgba(255,255,255,.08)',
        ...style,
      }}
    >
      <div style={{ position: 'relative', width: screenW, height: screenH, borderRadius: height * 0.045, overflow: 'hidden', background: C.paper }}>{children}</div>
    </div>
  );
};

/** Words rise into place one after another. Restrained: short travel, no bounce past 2 %. */
export const Words: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  size: number;
  color?: string;
  weight?: number;
  font?: string;
  lineHeight?: number;
  align?: 'left' | 'center';
  style?: React.CSSProperties;
  out?: number; // frame at which the line leaves (fades up)
}> = ({ text, delay = 0, stagger = 3, size, color = C.ink, weight = 600, font = FONT_DISPLAY, lineHeight = 1.05, align = 'left', style, out }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const leave = out === undefined ? 0 : interpolate(frame, [out, out + 10], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  return (
    <div style={{ fontFamily: font, fontSize: size, fontWeight: weight, color, lineHeight, letterSpacing: '-0.01em', textAlign: align, ...style }}>
      {text.split('\n').map((line, li, lines) => (
        <div key={li} style={{ display: 'block' }}>
          {line.split(' ').map((word, wi) => {
            const index = lines.slice(0, li).join(' ').split(' ').filter(Boolean).length + wi;
            const p = spring({ frame: frame - delay - index * stagger, fps, config: { damping: 200, stiffness: 140 } });
            return (
              <span key={wi} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: size * 0.08 }}>
                <span
                  style={{
                    display: 'inline-block',
                    transform: `translateY(${(1 - p) * 70 + leave * -40}%)`,
                    opacity: Math.min(p * 1.4, 1) * (1 - leave),
                  }}
                >
                  {word}
                  {wi < line.split(' ').length - 1 ? ' ' : ''}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Small uppercase label above a title. */
export const Kicker: React.FC<{ children: React.ReactNode; color?: string; size?: number; delay?: number; style?: React.CSSProperties }> = ({ children, color = C.sea, size = 22, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 12], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div style={{ fontFamily: FONT_BODY, fontWeight: 800, fontSize: size, letterSpacing: '0.16em', textTransform: 'uppercase', color, opacity: o, transform: `translateY(${(1 - o) * 8}px)`, ...style }}>
      {children}
    </div>
  );
};

/** A four-point pixel star, DIDIK's sparkle. Pixel-snapped so it stays crisp. */
export const PixelStar: React.FC<{ size: number; color?: string; style?: React.CSSProperties }> = ({ size, color = C.sun, style }) => {
  const u = size / 7;
  const cells = [[3, 0], [3, 1], [2, 2], [3, 2], [4, 2], [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [2, 4], [3, 4], [4, 4], [3, 5], [3, 6]];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', shapeRendering: 'crispEdges', ...style }}>
      {cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x * u} y={y * u} width={u} height={u} fill={color} />)}
    </svg>
  );
};

/** A few sparkles that twinkle in, hold and fade. Positions are in px of the parent. */
export const Sparkles: React.FC<{ at: Array<[number, number, number, string?]>; delay?: number; life?: number }> = ({ at, delay = 0, life = 40 }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {at.map(([x, y, s, color], i) => {
        const t = frame - delay - i * 4;
        const k = interpolate(t, [0, 6, life - 10, life], [0, 1, 1, 0], clamp);
        const twinkle = 0.85 + 0.15 * Math.sin((t / 4) * Math.PI);
        return <PixelStar key={i} size={s} color={color ?? C.sun} style={{ left: x - s / 2, top: y - s / 2, transform: `scale(${k * twinkle})`, opacity: k }} />;
      })}
    </>
  );
};

/** The real DIDIK logo, rendered from the app. */
export const Logo: React.FC<{ width: number; variant?: 'light' | 'dark'; style?: React.CSSProperties }> = ({ width, variant = 'dark', style }) => (
  <Img src={staticFile(`brand/didik-logo-${variant}.png`)} style={{ width, height: (width * 352) / 1216, ...style }} />
);

/** Fades a scene in and out over a few frames at its own edges. */
export const Fade: React.FC<{ children: React.ReactNode; inFrames?: number; outFrames?: number }> = ({ children, inFrames = 8, outFrames = 8 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = Math.min(
    inFrames ? interpolate(frame, [0, inFrames], [0, 1], clamp) : 1,
    outFrames ? interpolate(frame, [durationInFrames - outFrames, durationInFrames], [1, 0], clamp) : 1,
  );
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

/** Entrance for framed footage: rises 40 px and settles. */
export const useRise = (delay = 0, distance = 40) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200, stiffness: 120 } });
  return { opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * distance}px)` } as React.CSSProperties;
};

export const Paper: React.FC<{ children?: React.ReactNode; color?: string }> = ({ children, color = C.paper }) => (
  <AbsoluteFill style={{ background: color }}>{children}</AbsoluteFill>
);
