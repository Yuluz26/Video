// Which real clip, and from which frame, each promo scene uses. Clips are in recordings/processed
// (served as public/clips). `from` is in frames at 30 fps. Every clip here is listed in
// recordings/manifest.json; tune trims here, not in the scenes.
type Cut = { clip: string; from: number; focus?: [number, number] };
const s = (seconds: number) => Math.round(seconds * 30);

export const P = {
  hook: [
    { clip: 'lompat_phone_9x16', from: s(13.5) },
    { clip: 'pancing_phone_9x16', from: s(11) },
    { clip: 'lumba_phone_9x16', from: s(14) },
    { clip: 'pasar_phone_9x16', from: s(19.5) },
  ] as Cut[],
  create: { clip: 'create_quiz_1080p', from: s(4.5), focus: [100, 40] as [number, number] },
  picker: { clip: 'game_picker_1080p', from: s(3) },
  // the join runs at 1.6× so the code, the name and the lobby all fit in six seconds
  lobby: { clip: 'host_lobby_1080p', from: s(2.5), rate: 1.6 },
  join: { clip: 'phone_join_9x16', from: s(2.5), rate: 1.6 },
  montage: [
    { clip: 'interaktif_phone_9x16', from: s(27.5), name: 'Kuiz Interaktif', kicker: 'Sentuh, seret, susun' },
    { clip: 'lompat_phone_9x16', from: s(16), name: 'Lompat!', kicker: 'Serentak' },
    { clip: 'lumba_phone_9x16', from: s(18), name: 'Lumba Sampan', kicker: 'Serentak' },
    { clip: 'kebun_phone_9x16', from: s(14), name: 'Kebun Ajaib', kicker: 'Ikut kadar sendiri' },
    { clip: 'pancing_phone_9x16', from: s(12), name: 'Pancing Ikan', kicker: 'Ikut kadar sendiri' },
    { clip: 'pasar_phone_9x16', from: s(19), name: 'Pasar Malam', kicker: 'Ikut kadar sendiri' },
    { clip: 'hutan_phone_9x16', from: s(8), name: 'Hutan Misteri', kicker: 'Jelajah' },
  ],
  // Legenda was recorded on a landscape screen (the portrait recording browser could not hold the HD
  // battle scene in this sandbox); the promo shows the whole 16:9 frame at full width.
  story: [
    { clip: 'legenda_player_1080p', from: s(19) },
    { clip: 'legenda_player_1080p', from: s(95) },
    { clip: 'legenda_player_1080p', from: s(131) },
  ] as Cut[],
  together: {
    host: { clip: 'lumba_host_1080p', from: s(20) },
    phone: { clip: 'lumba_phone_9x16', from: s(20) },
  },
  results: {
    host: { clip: 'lumba_results_host_1080p', from: s(29) },
    phone: { clip: 'lumba_results_phone_9x16', from: s(29) },
  },
  cover: { clip: 'lompat_phone_9x16', from: s(16) },
};

// The landscape recut leads with the host's big screen; the phone sits beside it.
export const PL = {
  hook: [
    { clip: 'legenda_player_1080p', from: s(60) },
    { clip: 'lompat_host_1080p', from: s(12) },
    { clip: 'lumba_host_1080p', from: s(14) },
    { clip: 'kebun_host_1080p', from: s(20) },
  ] as Cut[],
  montage: [
    { host: 'interaktif_host_1080p', phone: 'interaktif_phone_9x16', from: s(27.5), phoneFrom: undefined as number | undefined, name: 'Kuiz Interaktif', kicker: 'Sentuh, seret, susun' },
    { host: 'lompat_host_1080p', phone: 'lompat_phone_9x16', from: s(16), phoneFrom: undefined as number | undefined, name: 'Lompat!', kicker: 'Serentak' },
    { host: 'lumba_host_1080p', phone: 'lumba_phone_9x16', from: s(18), phoneFrom: undefined as number | undefined, name: 'Lumba Sampan', kicker: 'Serentak' },
    { host: 'kebun_host_1080p', phone: 'kebun_phone_9x16', from: s(14), phoneFrom: undefined as number | undefined, name: 'Kebun Ajaib', kicker: 'Ikut kadar sendiri' },
    { host: 'pancing_host_1080p', phone: 'pancing_phone_9x16', from: s(12), phoneFrom: undefined as number | undefined, name: 'Pancing Ikan', kicker: 'Ikut kadar sendiri' },
    { host: 'pasar_host_1080p', phone: 'pasar_phone_9x16', from: s(19), phoneFrom: undefined as number | undefined, name: 'Pasar Malam', kicker: 'Ikut kadar sendiri' },
    { host: 'hutan_host_1080p', phone: 'hutan_phone_9x16', from: s(8), phoneFrom: undefined as number | undefined, name: 'Hutan Misteri', kicker: 'Jelajah' },
  ],
  story: [
    { clip: 'legenda_player_1080p', from: s(19) },
    { clip: 'legenda_player_1080p', from: s(95) },
    { clip: 'legenda_player_1080p', from: s(131) },
  ] as Cut[],
};
