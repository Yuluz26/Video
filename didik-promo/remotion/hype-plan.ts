// Data for the energetic promo (PromoHype): which real clips it uses, the game montage, and every sound
// effect with its frame. Frames are at 30 fps on the 120 BPM grid (beat = 15 frames, bar = 60).
import { C } from './theme';

const s = (seconds: number) => Math.round(seconds * 30);

export const H = {
  hook: [
    { clip: 'lompat_phone_9x16', from: s(13.5) },
    { clip: 'lumba_phone_9x16', from: s(14) },
    { clip: 'pancing_phone_9x16', from: s(11) },
    { clip: 'pasar_phone_9x16', from: s(19.5) },
  ],
  create: { clip: 'create_quiz_1080p', from: s(4.5) },
  picker: { clip: 'game_picker_1080p', from: s(3) },
  join: { clip: 'phone_join_9x16', from: s(6), rate: 1.6 }, // from the name form: the code itself is the popping digits
  games: [
    { clip: 'interaktif_phone_9x16', from: s(27.5), name: 'Kuiz Interaktif', kicker: 'Sentuh · seret · susun', bg: '#f8dcef', accent: C.berry, stickers: ['kucing', 'bintang'], reward: '+3 ★' },
    { clip: 'lompat_phone_9x16', from: s(13.5), name: 'Lompat!', kicker: 'Serentak', bg: '#d3ebf8', accent: C.sky, stickers: ['ayam', 'bintang-bersinar'], reward: '+100' },
    { clip: 'lumba_phone_9x16', from: s(18), name: 'Lumba Sampan', kicker: 'Serentak', bg: '#d4f1e9', accent: C.sea, stickers: ['piala', 'ikan'], reward: '+95 m' },
    { clip: 'kebun_phone_9x16', from: s(14), name: 'Kebun Ajaib', kicker: 'Tanam · siram · tuai', bg: '#e4f3d0', accent: C.leaf, stickers: ['tembikai', 'bunga'], reward: '+2 air' },
    { clip: 'pancing_phone_9x16', from: s(11), name: 'Pancing Ikan', kicker: 'Lempar joran!', bg: '#d8edfc', accent: C.sky, stickers: ['ikan', 'syiling'], reward: '+10' },
    { clip: 'pasar_phone_9x16', from: s(19), name: 'Pasar Malam', kicker: 'Jual · hias · untung', bg: '#fde4cb', accent: C.coral, stickers: ['pisang', 'syiling'], reward: 'RM 5' },
  ],
  storyReal: { clip: 'legenda_player_1080p', from: s(95) },
  results: { clip: 'lumba_results_phone_9x16', from: s(29) },
  // [sound, frame, volume]. The score carries the big hits (4 s, 22 s, 36 s, 48 s) and the 56 s fanfare.
  sfx: [
    ['bubble', 2, 0.5], ['boing', 15, 0.6], ['pop', 28, 0.5], ['boing', 40, 0.6], ['sparkle', 42, 0.45],
    ['swoosh', 48, 0.45], ['bubble', 54, 0.4], ['bubble', 60, 0.4], ['bubble', 66, 0.4], ['whoosh', 104, 0.5],
    ['sparkle', 122, 0.55], ['boing', 142, 0.45], ['pop', 146, 0.4], ['bubble', 150, 0.35],
    ['swoosh', 200, 0.5], ['whoosh', 214, 0.45], ['pop', 244, 0.4], ['pop', 252, 0.4], ['pop', 260, 0.4], ['pop', 268, 0.4],
    ['swoosh', 292, 0.5], ['sparkle', 300, 0.45], ['tiles', 306, 0.4],
    ['swoosh', 382, 0.5], ['bubble', 412, 0.45], ['bubble', 419, 0.45], ['bubble', 426, 0.45], ['bubble', 433, 0.45], ['bubble', 440, 0.45], ['bubble', 447, 0.45],
    ['boing', 454, 0.5], ['boing', 468, 0.5], ['boing', 482, 0.5], ['join', 456, 0.4],
    ['whoosh', 532, 0.5], ['pop', 558, 0.45], ['pop', 564, 0.45], ['pop', 570, 0.45], ['pop', 576, 0.45],
    ['tap', 624, 0.7], ['correct', 626, 0.7], ['sparkle', 628, 0.5], ['coin', 634, 0.5], ['coin', 640, 0.45], ['boing', 632, 0.45],
    ['swoosh', 660, 0.4], ['coin', 690, 0.4], ['swoosh', 720, 0.4], ['coin', 750, 0.4], ['swoosh', 780, 0.4], ['harvest', 810, 0.4],
    ['swoosh', 840, 0.4], ['coin', 870, 0.4], ['swoosh', 900, 0.4], ['coin', 930, 0.4], ['swoosh', 960, 0.4], ['coin', 990, 0.4],
    ['whoosh', 1016, 0.5], ['tiles', 1024, 0.45], ['tiles', 1036, 0.4], ['whoosh', 1074, 0.5],
    ['magic', 1084, 0.55], ['sparkle', 1094, 0.4],
    // worlds montage: a zap on every world cut
    ['zap', 1140, 0.35], ['zap', 1152, 0.35], ['zap', 1164, 0.35], ['zap', 1176, 0.35], ['zap', 1188, 0.35],
    // battle (Story local 120 = 1200): banner, element pick, five hits (zap just before, impact on the hit)
    ['swoosh', 1200, 0.5], ['bubble', 1236, 0.5],
    ['zap', 1246, 0.5], ['impact', 1250, 0.8], ['correct', 1260, 0.55],
    ['magic', 1284, 0.4], ['zap', 1292, 0.5], ['impact', 1296, 0.8],
    ['zap', 1318, 0.45], ['impact', 1322, 0.75], ['zap', 1330, 0.45], ['impact', 1334, 0.75], ['zap', 1342, 0.45], ['impact', 1346, 0.85],
    ['sparkle', 1352, 0.6], ['coin', 1356, 0.5], ['sparkle', 1362, 0.45],
    ['whoosh', 1376, 0.5], ['swoosh', 1384, 0.45],
    ['whoosh', 1432, 0.5],
    ['boing', 1470, 0.45], ['boing', 1476, 0.45], ['boing', 1482, 0.45], ['bubble', 1492, 0.4], ['bubble', 1498, 0.4], ['bubble', 1504, 0.4],
    ['sparkle', 1520, 0.5], ['coin', 1522, 0.45],
    ['whoosh', 1612, 0.5], ['sparkle', 1624, 0.5], ['pop', 1650, 0.5], ['pop', 1665, 0.5], ['pop', 1680, 0.5], ['boing', 1690, 0.45],
  ] as Array<[string, number, number]>,
};
