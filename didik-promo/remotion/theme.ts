import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

// DIDIK's own tokens (live/web/src/app.css) and type: Fredoka for display, Nunito for reading.
export const C = {
  paper: '#fff8ec',
  paper2: '#fdeed6',
  card: '#ffffff',
  ink: '#1f2d27',
  ink2: '#4a5c52',
  ink3: '#77877e',
  line: '#eadfc9',
  sun: '#ffb627',
  sunDeep: '#c98400',
  coral: '#d0452f',
  sea: '#12847a',
  seaMap: '#1f78ab',
  sky: '#2d78c4',
  leaf: '#6cb33f',
  berry: '#d3328d',
  night: '#14112a',
} as const;

export const FONT_DISPLAY = 'Fredoka, ui-rounded, system-ui, sans-serif';
export const FONT_BODY = 'Nunito, system-ui, sans-serif';
export const FONT_PIXEL = '"Pixelify Sans", Fredoka, system-ui, sans-serif'; // the pixel face of DIDIK's games

let loaded: Promise<unknown> | null = null;
export const loadFonts = () => {
  loaded ??= Promise.all([
    loadFont({ family: 'Fredoka', url: staticFile('fonts/fredoka-latin-wght-normal.woff2'), weight: '300 700' }),
    loadFont({ family: 'Fredoka', url: staticFile('fonts/fredoka-latin-ext-wght-normal.woff2'), weight: '300 700' }),
    loadFont({ family: 'Nunito', url: staticFile('fonts/nunito-latin-wght-normal.woff2'), weight: '200 1000' }),
    loadFont({ family: 'Nunito', url: staticFile('fonts/nunito-latin-ext-wght-normal.woff2'), weight: '200 1000' }),
    loadFont({ family: 'Pixelify Sans', url: staticFile('fonts/pixelify-sans-latin-400-normal.woff2'), weight: '400' }),
    loadFont({ family: 'Pixelify Sans', url: staticFile('fonts/pixelify-sans-latin-700-normal.woff2'), weight: '700' }),
  ]);
  return loaded;
};

export const FPS = 30;
// The score runs at 120 BPM: one beat is exactly 15 frames, one bar 60.
export const BEAT = 15;
export const BAR = 60;
export const sec = (s: number) => Math.round(s * FPS);
