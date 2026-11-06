# DIDIK — Storyboard

Two films cut from the same real recordings (`recordings/processed/`, listed in `recordings/manifest.json`).
Every on-screen line is in `remotion/copy.ts` (promo) or `remotion/demo-plan.ts` (demo) and is checked
against `FEATURE_AUDIT.md`. Nothing here is mocked: every moving picture is a recording of the app running
locally, played by scripted browser sessions (Ali, Aina, Amir) that answer by tapping the correct tile.

Audio: original chiptune scores written for these films (`audio/generate.py`: `hype` for the promo, `promo` for the
calm cut and the 16:9 recut, `bed` for the demo; 120 BPM, square/triangle/noise voices, no third-party material) and DIDIK's own UI sounds ported offline from `live/web/src/lib/sound.ts`.
No voiceover: the promo is caption-led. The browser recordings carry no audio.

## A. Promo — 60 s, 1080×1920 (`DIDIK-Promo-9x16`, `remotion/PromoHype.tsx`)

The energetic cut. Real recordings stay the spine, staged inside layered motion: phones and screens that
spring in, overshoot and squash on landing; sticker type (thick white outline, extruded shadow) popping letter
by letter and wobbling on the beat; DIDIK's own pixel characters and Didi hopping on the beat; the app's 3D
stickers bobbing in parallax; confetti, pixel-star bursts, shockwaves and screen shake on the hits; shape wipes
(stripes, iris, star, blob, flash) that cover every cut. Score: `audio/generate.py hype`, 120 BPM (beat = 15
frames). Every cut and hit sits on the grid; sound effects are listed with their frames in `remotion/hype-plan.ts`.

| Time | Frames | Scene | Motion | Source |
| --- | --- | --- | --- | --- |
| 0–4 s | 0–120 | Hook: **Macam mana kalau KUIZ jadi PERMAINAN?!** | letters pop on beats; four phones fly in fanned; confetti; camera push and white flash into the hit | lompat, lumba, pancing, pasar phone clips |
| 4–7 s | 120–210 | Logo smash on the 4.0 s hit · **Main kuiz bersama kawan!** | logo lands from 2.6× with squash, shockwave, sparkles, confetti; six chibi kids hop in and bounce on every beat | logo, `chars/chibi-*` |
| 7–13 s | 210–390 | **Cipta soalan!** → **Pilih permainan!** | the screen swings in, stickers pop out of it; the card flips to the game picker and 14 badges burst into an arc | create_quiz, game_picker; badges |
| 13–18 s | 390–540 | **Masuk dengan kod!** · *Tiada akaun untuk anak-anak* | 790 750 pops digit by digit on half beats; Ali, Aina and Amir hop in with name tags | phone_join (name form → lobby) |
| 18–22 s | 540–660 | Quiz moment over the build: **Berapakah kaki seekor ayam?** | answer tiles bounce in and pulse faster; the tap on "2"; tile turns green, others fall away; confetti, coins, **Hebat! +100**, Didi cheers | the quiz's own question and the app's answer colours |
| 22–34 s | 660–1020 | Montage on the drop: Kuiz Interaktif, Lompat!, Lumba Sampan, Kebun Ajaib, Pancing Ikan, Pasar Malam | one per bar; each world reveals in a circle, the phone flies in over the last one flying out (8-frame overlap), stickers and a reward pop on the beat | the six phone clips |
| 34–36 s | 1020–1080 | **14 permainan 2D!** | the 14 badges rain in and bounce into a grid; camera dives in | badges |
| 36–38 s | 1080–1140 | Story title: **STORY MODE · HIKAYAT LIMA ALAM** | gold sticker type, embers rising, the five world symbols orbit and land | `story/ui`, field painting |
| 38–40 s | 1140–1200 | Five worlds, slash cuts: Tasik Chini, Batang Lupar, Hutan Larut, Rimba Bayangan, Gunung Ledang, each with its boss | each world's living scene video, boss sprite sliding, shake on every cut | `story/worlds/*/scene.mp4`, `boss.webp` |
| 40–46 s | 1200–1380 | Battle: Hang Tuah and Mahsuri against Naga Chini | the game's banners (Pertarungan Bermula!, Jawapan Betul!, Boss Dikalahkan!); HUD with five boss bars, hearts and elements; Petir chosen; five hits with the game's 12-frame element effects (petir, api, angin, air, tanah), camera punch, shake, flash, boss recoil, damage numbers; boss blinks out; victory pose; confetti | `story/heroes`, `story/fx/*_slash`, `story/banners/*_sheet`, field painting |
| 46–48 s | 1380–1440 | **Jawab soalan, SERANG BOSS!** · *Dalam DIDIK sebenar* | the recorded Legenda run flies in | legenda_player (recorded) |
| 48–54 s | 1440–1620 | **Main bersama kawan-kawan!** | podium blocks rise, Ali, Aina and Amir drop on them, the crown falls on Ali; the real podium on the phone | lumba_results phone |
| 54–60 s | 1620–1800 | Logo smash · **Belajar. Bermain. Berkembang.** (one word per beat) · **Kenali DIDIK** · didik.engineprofit.io | Didi waves; the call to action bounces on the 56 s fanfare; confetti finale | logo, `chars/didi-wave` |

The Story Mode battle is a motion-graphic trailer composed from the game's own art and effect sheets, timed
the way the game plays a battle (an attack per right answer, five boss bars, the element chosen before a boss
answer). It is followed by the real recorded run so the trailer stays anchored to the app.

The previous, calmer cut is kept as `DIDIK-Promo-9x16-Calm` (`remotion/Promo.tsx`); the 16:9 recut
(`DIDIK-Promo-16x9`) follows that calmer timeline.

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
