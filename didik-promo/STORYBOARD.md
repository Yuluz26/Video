# DIDIK — Storyboard

Two films cut from the same real recordings (`recordings/processed/`, listed in `recordings/manifest.json`).
Every on-screen line is in `remotion/copy.ts` (promo) or `remotion/demo-plan.ts` (demo) and is checked
against `FEATURE_AUDIT.md`. Nothing here is mocked: every moving picture is a recording of the app running
locally, played by scripted browser sessions (Ali, Aina, Amir) that answer by tapping the correct tile.

Audio: an original chiptune score written for these films (`audio/generate.py`, 120 BPM, square/triangle/noise
voices, no third-party material) and DIDIK's own UI sounds ported offline from `live/web/src/lib/sound.ts`.
No voiceover: the promo is caption-led. The browser recordings carry no audio.

## A. Promo — 60 s, 1080×1920 (and a 16:9 recut)

120 BPM, so one beat = 15 frames and one bar = 60 frames. Cuts sit on beats; the logo lands on the 4.0 s hit
and the game montage starts on the chorus at 20 s.

| Time | Frames | Scene | On screen (BM) | Source footage | Audio |
| --- | --- | --- | --- | --- | --- |
| 0.0–3.7 s | 0–112 | Hook: four real moments, a cut every two beats | **Macam mana kalau kuiz jadi sebuah permainan?** | `lompat_phone` (right island, +100), `pancing_phone` (Lempar joran), `lumba_phone` (race), `pasar_phone` (selling) | arp intro, riser into 4.0 s |
| 3.7–7.0 s | 112–210 | Logo lands on the hit, pixel sparkles | DIDIK logo · *Main kuiz bersama kawan.* | `brand/didik-logo-dark.png` (rendered from the app's Logo component) | "go" chime on 4.0 s |
| 7.0–14.0 s | 210–420 | A parent writes a quiz, then picks a game | *Untuk ibu bapa dan guru* · **Cipta soalan. Pilih permainan.** · *Enam belas jenis soalan, dengan gambar dan penerangan.* → *Satu kuiz, banyak cara untuk bermain.* | `create_quiz_1080p`, `game_picker_1080p` | verse, "pop" on each cut |
| 14.0–20.0 s | 420–600 | Room opens on the big screen; Ali types the code on his phone (same moment) | **Masuk dengan kod. Tiada akaun untuk anak-anak.** · *Kod 6 digit, pautan atau kod QR. Pilih haiwan, tulis nama.* | `host_lobby_1080p` + `phone_join_9x16`, both at 1.6× so the code, the name and the lobby fit | "join" chime |
| 20.0–36.0 s | 600–1080 | Montage, one game per bar, the child's real phone screen | **Jawab, cabar diri dan kumpul ganjaran.** then each game's name and style label; ends on the 14 badges · **14 permainan 2D. Satu kuiz.** | `interaktif` (spelling), `lompat`, `lumba`, `kebun`, `pancing`, `pasar`, `hutan` phone clips; badges from the game picker | chorus |
| 36.0–44.0 s | 1080–1320 | Hikayat Lima Alam: hero, battle, boss | *Story Mode* · **Terokai Hikayat Lima Alam.** · *Dunia 1, Tasik Chini: lima musuh, kemudian Naga Chini. Pilih elemen, jawab, serang.* | `legenda_player_1080p`, the whole 16:9 frame at full width (three moments: a battle, the element unlock, the boss) | breakdown |
| 44.0–52.0 s | 1320–1560 | Everyone in one race; then the podium | **Main bersama kawan-kawan.** · *Semua di skrin besar. Setiap anak di telefon sendiri.* → *Di hujung permainan, semua naik podium.* | `lumba_host` + `lumba_phone`, then `lumba_results_host` + `lumba_results_phone` | final chorus, "correct" on the podium |
| 52.0–60.0 s | 1560–1800 | Brand close | DIDIK logo · **Belajar. Bermain. Berkembang.** · **Kenali DIDIK** · didik.engineprofit.io | logo | the app's own fanfare at 56 s, ring out |

Safe area: all text sits inside x 72–900 px and y 220–1500 px, clear of TikTok/Reels buttons and captions.

The 16:9 recut (`DIDIK-Promo-16x9`) keeps the same beats and copy; the host's big screen leads and the
phone sits beside it.

## B. Full feature demo — 5 min 37 s, 1920×1080

Chapter cards (number, title, one line) between real footage. Split shots put the host's big screen and a
child's phone side by side; both were recorded at the same moment. Each 2D game gets nine seconds with its
style label and DIDIK's own one-line description from `live/README.md`.

| # | Chapter | Shots | Source |
| --- | --- | --- | --- |
| — | Opening | logo, *Demo penuh: apa yang ada dalam DIDIK hari ini.* | logo |
| 1 | Laman utama | front page, section by section | `landing_scroll_1080p` |
| 2 | Ruang ibu bapa | dashboard and Kuiz saya; a new quiz typed in (question, suggested picture, three choices with stickers, Simpan, the question-type chooser); the game picker | `dashboard_1080p`, `create_quiz_1080p`, `game_picker_1080p` |
| 3 | Buka bilik, masuk dengan kod | host lobby (QR, link, 6-digit code) beside Ali's phone typing the code, picking Harimau and his name; Aina and Amir arrive; Mula and the countdown | `host_lobby_1080p` + `phone_join_9x16` |
| 4 | Kuiz Interaktif | Denai Didi on the host screen beside Ali's phone: spelling and sorting by taps, three stars each | `interaktif_host_1080p` + `interaktif_phone_9x16` |
| 5 | Empat belas permainan 2D | 14 × 9 s: Lumba Sampan, Lompat!, Pulau Harta Karun, Hutan Misteri, Pasukan Warna, Kampung Kita, Teka Gambar, Kebun Ajaib, Pancing Ikan, Lumba Wau, Kubu Pasir, Kereta Api Kampung, Pasar Malam, Kejar Bintang | `<game>_host_1080p` + `<game>_phone_9x16` |
| 6 | Hikayat Lima Alam | a solo run through Tasik Chini in three moments (hero choice and first battle; Naga Chini and the element pick; the last hits and world clear), then the host's view of the run | `legenda_player_1080p`, `legenda_host_1080p` |
| 7 | Keputusan | host presses Tamat: podium on the big screen and the phone | `lumba_results_host_1080p` + `lumba_results_phone_9x16` |
| — | Penutup | logo, **Belajar. Bermain. Berkembang.**, **Kenali DIDIK · didik.engineprofit.io** | logo |

Music: the calmer bed from the same generator (`audio/generate.py bed`), mixed low under the footage.
