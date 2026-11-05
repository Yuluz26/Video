// The full feature demo, shot by shot. Every shot is real footage from recordings/processed; game lines
// are DIDIK's own words from live/README.md. Frames at 30 fps. Edit order, length and words here.
export type Shot = {
  kind: 'open' | 'close' | 'chapter' | 'full' | 'split' | 'phone';
  frames: number;
  n?: number;
  clip?: string;
  from?: number;
  rate?: number;
  push?: number;
  focus?: [number, number];
  phone?: string;
  phoneFrom?: number;
  kicker?: string;
  title?: string;
  line?: string;
  tint?: string;
};

const s = (seconds: number) => Math.round(seconds * 30);

// The fourteen 2D games, in the order of the game picker. `from`: where play is under way (after the
// lobby and the 3-2-1 countdown); host and phone were recorded at the same moment.
const GAMES: Array<[string, string, string, string, number]> = [
  ['lumba', 'Lumba Sampan', 'Serentak', 'Semua jawab soalan yang sama. Betul dan laju, sampan maju lebih jauh.', 9],
  ['lompat', 'Lompat!', 'Serentak', 'Lompat ke pulau jawapan; pulau yang salah tenggelam.', 9],
  ['harta', 'Pulau Harta Karun', 'Ikut kadar sendiri', 'Jawapan betul memberi penyodok untuk menggali harta di pulau sendiri.', 8],
  ['hutan', 'Hutan Misteri', 'Jelajah', 'Berjalan dalam hutan, buka peti soalan, kumpul 5 kunci, cari pintu keluar.', 6],
  ['pasukan', 'Pasukan Warna', 'Pasukan', 'Dua pasukan menawan petak pulau dengan bendera daripada jawapan betul.', 9],
  ['kampung', 'Kampung Kita', 'Kerjasama', 'Semua bina satu kampung bersama dan hias padangnya. Tiada yang kalah.', 9],
  ['teka', 'Teka Gambar', 'Serentak', 'Jawapan betul membuka petak gambar rahsia. Teka awal, mata lebih banyak.', 9],
  ['kebun', 'Kebun Ajaib', 'Ikut kadar sendiri', 'Jawapan betul memberi air. Tanam, siram dan tuai untuk dapat syiling.', 9],
  ['pancing', 'Pancing Ikan', 'Ikut kadar sendiri', 'Jawapan betul memberi umpan. Lempar joran dan tangkap ikan.', 8],
  ['wau', 'Lumba Wau', 'Serentak', 'Betul dan laju, wau naik lebih tinggi; sesekali angin kencang menaikkan semua wau.', 9],
  ['kubu', 'Kubu Pasir', 'Ikut kadar sendiri', 'Jawapan betul memberi pasir untuk tingkat, tembok dan bendera. Ombak datang setiap 45 saat.', 8],
  ['keretapi', 'Kereta Api Kampung', 'Ikut kadar sendiri', 'Jawapan betul memberi arang untuk menambah gerabak atau ke stesen seterusnya.', 8],
  ['pasar', 'Pasar Malam', 'Ikut kadar sendiri', 'Jawapan betul memberi barang untuk dijual; hiasan gerai menaikkan harga.', 8],
  ['bintang', 'Kejar Bintang', 'Pasukan', 'Dua pasukan menangkap bintang jatuh dengan jawapan betul.', 9],
];

export const DEMO: Shot[] = [
  { kind: 'open', frames: s(5) },

  { kind: 'chapter', frames: s(3), n: 1, title: 'Laman utama', line: 'Kanak-kanak masuk dengan kod bilik. Ibu bapa ke ruang mereka.' },
  { kind: 'full', frames: s(19), clip: 'landing_scroll_1080p', from: s(1.5), push: 0, kicker: 'didik · laman utama', title: 'Satu kuiz, tiga cara bermain', line: 'Kuiz Interaktif, empat belas permainan 2D dan Story Mode.' },

  { kind: 'chapter', frames: s(3), n: 2, title: 'Ruang ibu bapa', line: 'Tulis soalan sendiri, dengan gambar dan penerangan.' },
  { kind: 'full', frames: s(8), clip: 'dashboard_1080p', from: s(0.5), push: 0, kicker: 'Papan pemuka', title: 'Semua kuiz di satu tempat' },
  { kind: 'full', frames: s(21), clip: 'create_quiz_1080p', from: s(1), push: 0.04, focus: [70, 40], kicker: 'Kuiz baharu', title: 'Cipta soalan', line: 'Gambar rajah dicadangkan daripada soalan. Setiap soalan boleh ada penerangan.' },
  { kind: 'full', frames: s(15), clip: 'game_picker_1080p', from: s(2), push: 0, kicker: 'Pilih permainan', title: 'Tiga keluarga permainan', line: 'Syarat soalan dinyatakan sebelum bilik dibuka.' },

  { kind: 'chapter', frames: s(3), n: 3, title: 'Buka bilik, masuk dengan kod', line: 'Tiada akaun untuk kanak-kanak. Hanya nama samaran.' },
  { kind: 'split', frames: s(29), clip: 'host_lobby_1080p', from: s(1.5), phone: 'phone_join_9x16', kicker: 'Skrin hos dan telefon murid', title: 'Kod QR, pautan atau kod 6 digit', line: 'Ali taip kod, pilih haiwan dan nama. Aina dan Amir masuk dari telefon masing-masing.' },

  { kind: 'chapter', frames: s(3), n: 4, title: 'Kuiz Interaktif', line: 'Sentuh, seret dan susun bersama Didi, ikut kadar sendiri.' },
  { kind: 'split', frames: s(30), clip: 'interaktif_host_1080p', from: s(22), phone: 'interaktif_phone_9x16', kicker: 'Denai Didi', title: 'Kira, eja, isih', line: 'Sentuh untuk mengira, menyusun huruf dan mengisih. Jawapan betul dapat tiga bintang.' },

  { kind: 'chapter', frames: s(3), n: 5, title: 'Empat belas permainan 2D', line: 'Kuiz yang sama, dimainkan di pulau pixel yang berbeza.' },
  ...GAMES.map(([key, title, kicker, line, at]): Shot => ({
    kind: 'split',
    frames: s(9),
    clip: `${key}_host_1080p`,
    from: s(at),
    phone: `${key}_phone_9x16`,
    kicker,
    title,
    line,
  })),

  { kind: 'chapter', frames: s(3), n: 6, title: 'Hikayat Lima Alam', line: 'Story Mode: lima dunia legenda Melayu, Solo atau Party.' },
  { kind: 'full', frames: s(13), clip: 'legenda_player_1080p', from: s(7), push: 0, kicker: 'Solo · Dunia 1, Tasik Chini', title: 'Pilih wira, kemudian bertarung', line: 'Wira berjalan sendiri. Setiap musuh membuka pertarungan; jawapan betul menyerang.' },
  { kind: 'full', frames: s(12), clip: 'legenda_player_1080p', from: s(92), push: 0, kicker: 'Boss: Naga Chini', title: 'Pilih elemen, kemudian jawab', line: 'Lima elemen terbuka selepas lima musuh. Petir ialah kelemahan Naga Chini.' },
  { kind: 'full', frames: s(13), clip: 'legenda_player_1080p', from: s(129), push: 0, kicker: 'Lima jawapan betul', title: 'Dunia pertama selesai' },
  { kind: 'full', frames: s(8), clip: 'legenda_host_1080p', from: s(100), push: 0.25, focus: [8, 18], kicker: 'Skrin hos', title: 'Perjalanan setiap wira, langsung' },

  { kind: 'chapter', frames: s(3), n: 7, title: 'Keputusan', line: 'Kedudukan selepas setiap soalan, podium di hujung.' },
  { kind: 'split', frames: s(10), clip: 'lumba_results_host_1080p', from: s(25.5), phone: 'lumba_results_phone_9x16', kicker: 'Tamat', title: 'Podium dan Main lagi' },

  { kind: 'close', frames: s(6) },
];
