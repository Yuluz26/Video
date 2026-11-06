// Motion toolkit for the energetic promo: beat-synced pops with squash and stretch, sticker type, confetti,
// sparkles, parallax sticker layers, camera moves and shake, sprite sheets and shape wipes.
// Everything is a pure function of the frame, so renders are deterministic.
import React from 'react';
import { AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT_DISPLAY } from './theme';

export const BEAT = 15; // 120 BPM at 30 fps
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** 1 on every beat, decaying to 0 before the next. `offset` shifts the grid (frames). */
export const beatPulse = (frame: number, offset = 0, decay = 4) => {
  const t = (((frame - offset) % BEAT) + BEAT) % BEAT;
  return Math.exp(-t / decay);
};

/** A bouncy spring with overshoot. */
export const bounce = (frame: number, at: number, fps: number, stiffness = 210, damping = 10, mass = 0.6) =>
  spring({ frame: frame - at, fps, config: { stiffness, damping, mass } });

/** Pop in with squash and stretch: it lands wide and short, then settles. */
export const usePop = (at: number, opts: { from?: number; rotate?: number; stiffness?: number; damping?: number } = {}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = bounce(frame, at, fps, opts.stiffness, opts.damping);
  const from = opts.from ?? 0;
  const s = from + (1 - from) * p;
  const over = p - 1; // positive while overshooting
  const sx = s * (1 + over * 0.55);
  const sy = s * (1 - over * 0.75);
  const rot = (opts.rotate ?? 0) * (1 - Math.min(p, 1.2));
  return {
    p,
    style: { transform: `scale(${sx}, ${sy}) rotate(${rot}deg)`, opacity: frame < at ? 0 : Math.min(1, p * 3) } as React.CSSProperties,
  };
};

export const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; rotate?: number; origin?: string; from?: number }> = ({ at, children, style, rotate = -8, origin = '50% 100%', from }) => {
  const { style: s } = usePop(at, { rotate, from });
  return <div style={{ position: 'absolute', transformOrigin: origin, ...style, ...s, transform: `${style?.transform ?? ''} ${s.transform}` }}>{children}</div>;
};

/** Sticker type: every letter pops in with a twist, thick white outline and a coloured extruded shadow.
 *  Letters wiggle on the beat while the line is on screen. */
export const StickerText: React.FC<{
  text: string;
  at: number;
  size: number;
  color?: string;
  shadow?: string;
  outline?: string;
  stagger?: number;
  wiggle?: number;
  align?: 'left' | 'center';
  lineHeight?: number;
  style?: React.CSSProperties;
  out?: number;
}> = ({ text, at, size, color = C.coral, shadow = C.ink, outline = '#fff', stagger = 2, wiggle = 1, align = 'center', lineHeight = 1.02, style, out }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stroke = Math.max(6, size * 0.13);
  const depth = Math.max(3, Math.round(size * 0.06));
  const extrude = Array.from({ length: depth }, (_, i) => `${i + 1}px ${i + 1}px 0 ${shadow}`).join(', ');
  const leave = out === undefined ? 0 : interpolate(frame, [out, out + 8], [0, 1], clamp);
  let n = 0;
  return (
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: size, lineHeight, textAlign: align, letterSpacing: '-0.01em', ...style }}>
      {text.split('\n').map((line, li) => (
        <div key={li} style={{ whiteSpace: 'nowrap' }}>
          {[...line].map((ch, ci) => {
            const i = n++;
            if (ch === ' ') return <span key={ci} style={{ display: 'inline-block', width: size * 0.28 }} />;
            const t0 = at + i * stagger;
            const p = bounce(frame, t0, fps, 260, 9, 0.5);
            const over = p - 1;
            const wob = frame > t0 + 12 ? Math.sin((frame + i * 3) / 3.2) * 2.2 * wiggle * (0.4 + beatPulse(frame, 0, 5)) : 0;
            const jitter = (random(`r${text}${i}`) - 0.5) * 18;
            const lift = frame > t0 + 12 ? -beatPulse(frame, i % 2 === 0 ? 0 : 7, 4) * size * 0.06 * wiggle : 0;
            const sc = Math.max(0, p) * (1 - leave);
            return (
              <span
                key={ci}
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  transformOrigin: '50% 90%',
                  transform: `translateY(${(1 - Math.min(p, 1)) * size * 0.5 + lift}px) rotate(${jitter * (1 - Math.min(p, 1)) + wob}deg) scale(${sc * (1 + over * 0.5)}, ${sc * (1 - over * 0.7)})`,
                  opacity: frame < t0 ? 0 : 1,
                }}
              >
                <span aria-hidden style={{ position: 'absolute', inset: 0, WebkitTextStroke: `${stroke}px ${outline}`, color: outline, textShadow: extrude }}>{ch}</span>
                <span style={{ position: 'relative', color }}>{ch}</span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** A confetti burst with simple physics: shot out from a point, falling, spinning, fading. */
export const Confetti: React.FC<{ at: number; x: number; y: number; count?: number; power?: number; seed?: string; spread?: number; angle?: number; colors?: string[]; life?: number }> = ({
  at, x, y, count = 60, power = 34, seed = 'c', spread = 360, angle = -90, colors = [C.sun, C.coral, C.sea, C.sky, C.leaf, C.berry, '#fff'], life = 70,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > life) return null;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const a = ((angle + (r('a') - 0.5) * spread) * Math.PI) / 180;
        const v = power * (0.45 + r('v') * 0.75);
        const g = 1.15;
        const drag = Math.pow(0.965, t);
        const px = x + Math.cos(a) * v * t * drag;
        const py = y + Math.sin(a) * v * t * drag + 0.5 * g * t * t * 0.55;
        const size = 12 + r('s') * 20;
        const shape = Math.floor(r('k') * 3);
        const spin = t * (r('w') - 0.5) * 30;
        const flip = Math.abs(Math.cos(t / (3 + r('f') * 4)));
        const o = interpolate(t, [0, life * 0.7, life], [1, 1, 0], clamp);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: px - size / 2,
              top: py - size / 2,
              width: shape === 1 ? size * 0.55 : size,
              height: size,
              background: colors[i % colors.length],
              borderRadius: shape === 0 ? '50%' : shape === 1 ? 3 : 2,
              transform: `rotate(${spin}deg) scaleX(${shape === 2 ? 1 : flip})`,
              opacity: o,
            }}
          />
        );
      })}
    </>
  );
};

/** DIDIK's four-point pixel star. */
export const Star4: React.FC<{ size: number; color?: string; style?: React.CSSProperties }> = ({ size, color = C.sun, style }) => {
  const u = size / 7;
  const cells = [[3, 0], [3, 1], [2, 2], [3, 2], [4, 2], [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [2, 4], [3, 4], [4, 4], [3, 5], [3, 6]];
  return (
    <svg width={size} height={size} style={{ position: 'absolute', shapeRendering: 'crispEdges', overflow: 'visible', ...style }}>
      {cells.map(([cx, cy]) => <rect key={`${cx}-${cy}`} x={cx * u} y={cy * u} width={u + 0.5} height={u + 0.5} fill={color} />)}
    </svg>
  );
};

/** Pixel stars flying out of a point and twinkling away. */
export const SparkleBurst: React.FC<{ at: number; x: number; y: number; count?: number; radius?: number; seed?: string; colors?: string[] }> = ({ at, x, y, count = 10, radius = 260, seed = 's', colors = [C.sun, '#fff', C.berry, C.sea] }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 34) return null;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + random(`${seed}${i}`) * 0.6;
        const d = radius * (0.5 + random(`${seed}d${i}`) * 0.6) * (1 - Math.pow(1 - Math.min(1, t / 16), 3));
        const s = (28 + random(`${seed}z${i}`) * 36) * interpolate(t, [0, 5, 22, 34], [0, 1.2, 1, 0], clamp);
        return <Star4 key={i} size={s} color={colors[i % colors.length]} style={{ left: x + Math.cos(a) * d - s / 2, top: y + Math.sin(a) * d - s / 2, transform: `rotate(${t * 6}deg)` }} />;
      })}
    </>
  );
};

/** An expanding ring, for impacts. */
export const Shockwave: React.FC<{ at: number; x: number; y: number; color?: string; size?: number }> = ({ at, x, y, color = '#fff', size = 900 }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 18) return null;
  const k = 1 - Math.pow(1 - t / 18, 3);
  const d = size * k;
  return <div style={{ position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: '50%', border: `${26 * (1 - k) + 2}px solid ${color}`, opacity: 1 - k }} />;
};

/** A DIDIK sticker (3D Fluent emoji from the app), bobbing and spinning gently. */
export const Sticker: React.FC<{ name: string; size: number; x: number; y: number; at?: number; bob?: number; spin?: number; seed?: number; style?: React.CSSProperties }> = ({ name, size, x, y, at = 0, bob = 14, spin = 8, seed = 0, style }) => {
  const frame = useCurrentFrame();
  const { style: pop } = usePop(at, { rotate: -25 });
  const b = Math.sin((frame + seed * 13) / 9) * bob;
  const r = Math.sin((frame + seed * 7) / 14) * spin;
  return (
    <div style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, ...style }}>
      <div style={{ width: '100%', height: '100%', ...pop }}>
        <Img src={staticFile(`stickers/${name}.webp`)} style={{ width: '100%', height: '100%', transform: `translateY(${b}px) rotate(${r}deg)`, filter: 'drop-shadow(0 10px 12px rgba(31,45,39,.25))' }} />
      </div>
    </div>
  );
};

/** Background: a pastel field, two layers of dots drifting at different speeds and a slow sunburst. */
export const PlayBg: React.FC<{ color: string; dot?: string; burst?: boolean; speed?: number }> = ({ color, dot = 'rgba(255,255,255,.55)', burst = true, speed = 1 }) => {
  const frame = useCurrentFrame();
  const a = frame * 1.6 * speed;
  const b = frame * 0.7 * speed;
  return (
    <AbsoluteFill style={{ background: color, overflow: 'hidden' }}>
      {burst ? (
        <div
          style={{
            position: 'absolute', left: -900, top: -500, width: 2880, height: 2880,
            background: `repeating-conic-gradient(from ${frame * 0.6}deg at 50% 50%, rgba(255,255,255,.16) 0deg 10deg, rgba(255,255,255,0) 10deg 20deg)`,
          }}
        />
      ) : null}
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${dot} 7px, transparent 8px)`, backgroundSize: '120px 120px', backgroundPosition: `${a}px ${a * 0.6}px`, opacity: 0.5 }} />
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${dot} 4px, transparent 5px)`, backgroundSize: '64px 64px', backgroundPosition: `${-b}px ${b * 1.4}px`, opacity: 0.45 }} />
    </AbsoluteFill>
  );
};

/** Shakes its children after each hit frame, decaying fast. */
export const Shake: React.FC<{ hits: number[]; power?: number; children: React.ReactNode }> = ({ hits, power = 26, children }) => {
  const frame = useCurrentFrame();
  let dx = 0;
  let dy = 0;
  let rot = 0;
  for (const h of hits) {
    const t = frame - h;
    if (t >= 0 && t < 14) {
      const k = Math.pow(1 - t / 14, 2) * power;
      dx += (random(`sx${h}${t}`) - 0.5) * 2 * k;
      dy += (random(`sy${h}${t}`) - 0.5) * 2 * k;
      rot += (random(`sr${h}${t}`) - 0.5) * k * 0.08;
    }
  }
  return <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)` }}>{children}</AbsoluteFill>;
};

/** A white flash over everything after a hit. */
export const Flash: React.FC<{ at: number; color?: string; length?: number; strength?: number }> = ({ at, color = '#fff', length = 8, strength = 0.85 }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > length) return null;
  return <AbsoluteFill style={{ background: color, opacity: strength * (1 - t / length) }} />;
};

/** Plays a sprite sheet (cols × rows of w × h frames) frame by frame. `fps` is the sheet's own speed. */
export const SpriteSheet: React.FC<{
  src: string; cols: number; rows: number; w: number; h: number; at: number; frames?: number; every?: number; scale?: number;
  loop?: boolean; feather?: boolean; style?: React.CSSProperties; hold?: boolean;
}> = ({ src, cols, rows, w, h, at, frames = cols * rows, every = 2, scale = 1, loop = false, feather = false, style, hold = false }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0) return null;
  let i = Math.floor(t / every);
  if (i >= frames) {
    if (loop) i %= frames;
    else if (hold) i = frames - 1;
    else return null;
  }
  const cx = i % cols;
  const cy = Math.floor(i / cols);
  const mask = feather ? { WebkitMaskImage: 'radial-gradient(closest-side, #000 72%, transparent 100%)', maskImage: 'radial-gradient(closest-side, #000 72%, transparent 100%)' } : {};
  return (
    <div style={{ position: 'absolute', width: w * scale, height: h * scale, overflow: 'hidden', ...mask, ...style }}>
      <Img src={staticFile(src)} style={{ position: 'absolute', width: cols * w * scale, height: rows * h * scale, left: -cx * w * scale, top: -cy * h * scale, maxWidth: 'none' }} />
    </div>
  );
};

/** Shape wipe between scenes: a blob of colour covers the frame by `mid` and uncovers after it.
 *  `shape`: circle (iris from a point), star (a spinning DIDIK star), stripes (diagonal bars), blob. */
export const Wipe: React.FC<{ mid: number; color: string; shape?: 'circle' | 'star' | 'stripes' | 'blob'; x?: number; y?: number; len?: number; second?: string }> = ({ mid, color, shape = 'circle', x = 540, y = 960, len = 9, second }) => {
  const frame = useCurrentFrame();
  const t = frame - (mid - len);
  if (t < 0 || t > len * 2) return null;
  const cover = t <= len ? 1 - Math.pow(1 - t / len, 3) : 1;
  const uncover = t > len ? Math.pow((t - len) / len, 2) : 0;
  const R = 2300;
  if (shape === 'stripes') {
    return (
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        {Array.from({ length: 7 }, (_, i) => {
          const d = Math.min(1, Math.max(0, cover * 1.6 - i * 0.09));
          const u = Math.min(1, Math.max(0, uncover * 1.6 - i * 0.09));
          return (
            <div key={i} style={{
              position: 'absolute', left: -600, width: 3200, height: 380, top: -400 + i * 400,
              background: i % 2 ? color : second ?? color, transform: `rotate(-24deg) translateX(${(1 - d) * -3300 + u * 3300}px)`,
            }} />
          );
        })}
      </AbsoluteFill>
    );
  }
  if (shape === 'star') {
    const s = (cover - uncover) * 9;
    return (
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <svg viewBox="-50 -50 100 100" style={{ position: 'absolute', left: x - 500, top: y - 500, width: 1000, height: 1000, transform: `scale(${s}) rotate(${t * 9}deg)`, overflow: 'visible' }}>
          <path d="M0,-48 C6,-14 14,-6 48,0 C14,6 6,14 0,48 C-6,14 -14,6 -48,0 C-14,-6 -6,-14 0,-48Z" fill={color} />
        </svg>
      </AbsoluteFill>
    );
  }
  if (shape === 'blob') {
    const r = (cover - uncover) * R;
    const wob = (k: number) => r * (1 + Math.sin(t / 2 + k) * 0.06);
    return (
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: x - wob(0), top: y - wob(1), width: wob(0) * 2, height: wob(1) * 2, background: color, borderRadius: '46% 54% 52% 48% / 55% 45% 55% 45%', transform: `rotate(${t * 4}deg)` }} />
      </AbsoluteFill>
    );
  }
  const r = (cover - uncover) * R;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: color }} />
    </AbsoluteFill>
  );
};

/** A floating card that springs in from a side, overshoots, lands with a squash, then hovers and tilts. */
export const useFly = (at: number, dir: 'left' | 'right' | 'up' | 'down' = 'up', tilt = -4, out?: number, outDir: 'left' | 'right' | 'up' | 'down' = 'left') => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = bounce(frame, at, fps, 170, 11, 0.8);
  const q = out === undefined ? 0 : interpolate(frame, [out, out + 10], [0, 1], { ...clamp, easing: (x) => x * x * x });
  const off = (d: string, k: number) => (d === 'left' ? [-1400 * k, 0] : d === 'right' ? [1400 * k, 0] : d === 'up' ? [0, 2000 * k] : [0, -2000 * k]);
  const [ix, iy] = off(dir, 1 - p);
  const [ox, oy] = off(outDir, q);
  const over = p - 1;
  const hover = Math.sin(frame / 11) * 8;
  const r = tilt + (1 - p) * (dir === 'left' ? -30 : dir === 'right' ? 30 : 10) + Math.sin(frame / 17) * 1.2 + (outDir === 'left' ? -25 : 25) * q;
  return {
    transform: `translate(${ix + ox}px, ${iy + oy + hover}px) rotate(${r}deg) scale(${1 + over * 0.12}, ${1 - over * 0.16})`,
    opacity: frame < at ? 0 : 1,
  } as React.CSSProperties;
};
