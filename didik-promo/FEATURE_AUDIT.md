# DIDIK — Feature audit

Audited on the current `Yuluz26/DIDIK` code (branch `ccr-5bfecad5-9qrt47`, commit `09a0447`), run locally in this
sandbox: `live/server` (FastAPI) on `http://localhost:8080` serving the `live/web` SvelteKit build, with an
isolated SQLite database in a scratch directory (`DIDIK_DATA_DIR`). Nothing touched production; the live site
(didik.engineprofit.io) is not reachable from this sandbox and was not used.

**How "verified" was decided:** a feature is *yes* only if it was used in the running app by a scripted
browser session and the result was seen on screen (screenshots during the audit, then the recordings). A README
line or a route existing is not enough. The game-mode list comes from the server registry
(`live/server/didik_live/game/modes/__init__.py`: Kuiz Interaktif, fourteen 2D games, Hikayat Lima Alam).

**Test data:** the localhost-only demo account (`demo@didik.test`, seeded because `DIDIK_ENV` is not production),
signed in through the API so the sign-in page, which prints the demo password, is never filmed. One disposable
quiz, "Haiwan Kita" (12 picture questions, single choice and true/false), was created for the 2D games and Story
Mode; the sample quiz "Jom Kira, Eja dan Isih" was used for Kuiz Interaktif. Players are invented: Ali, Aina,
Amir. Practice bots (a built-in host feature, shown with a "bot" tag on screen) fill the class to 7.

**Excluded on purpose:** DIDIK Sains / the science city builder is not in this repository's app and appears
nowhere in the films. Two sample quizzes titled "Sains …" (school-subject quizzes, not the city builder) were
deleted from the local scratch database before recording so the word never appears on screen. The admin control
room, payments, accounts and password reset are not shown.

| Feature | UI route | How to reach it | Prerequisites | Recording approach | Verified working | Footage | Issues / notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Landing page, navigation, room-code ticket | `/` | open the site | none | host window 1280×720 @1.5, scripted smooth scroll through `#pulau`, `#interaktif`, `#hikayat`, `#cara` | yes | `landing_scroll_1080p` | — |
| Join by 6-digit code from the landing page | `/` → `/m/{kod}` | type the code, Masuk | an open room | phone window 405×720 @2.67, typed digit by digit | yes | `phone_join_9x16` | — |
| Parent sign-in | `/ibu-bapa` | Ibu bapa → log masuk | account | not filmed | yes (API) | — | the page shows the demo password, so it is never on camera |
| Parent dashboard | `/ibu-bapa` | after sign-in | signed in | host window | yes | `dashboard_1080p` | "Kuiz contoh" tile reads 0 because the demo account owns copies of the samples |
| Quiz list (Kuiz saya) | `/ibu-bapa/kuiz` | sidebar | signed in | host window | yes | `dashboard_1080p` | — |
| Create a quiz: title, question, choices, explanation, Simpan | `/ibu-bapa/kuiz/baru` | Kuiz baharu | signed in | typed live with key delays | yes | `create_quiz_1080p` | a real quiz "Kuiz Haiwan Comel" was saved in the scratch DB |
| Picture suggestion for a question (gambar rajah) | editor | type "…gajah?"; the editor offers Gajah | — | clicked on camera | yes | `create_quiz_1080p` | the status turns to "Semua soalan ada gambar dan penerangan" |
| Picture choices (164 Fluent Emoji stickers, MIT) | editor; player screens | Gambar pilihan → pick | — | shown in play (Lompat!, Teka Gambar, Lumba, Interaktif) | yes | game clips | the sticker dialog was used during the audit but kept off camera: its category tabs include "Sekolah & sains", and the brief allows no "Sains" on screen |
| Question-type chooser (16 types) | editor | "Tambah soalan" section | — | scrolled to on camera | yes (types listed) | `create_quiz_1080p` | played on camera: single choice, true/false, count, spell, sort. The other types (match, order, blank, number, text, multiple, missing letters, puzzle, blocks, clock, money) exist in the editor and the sample quizzes but were not individually played |
| Explanation ("Kenapa begitu?") | host and player screens | answer reveal; a wrong answer on the phone | question with `explain` | host reveals in the simultaneous games | yes | `lumba_host_1080p`, `teka_host_1080p` | shown on the host screen at every reveal; on a child's phone it appears after a wrong answer (seen during the audit). The planned deliberate miss in the Interaktif take fell outside the recorded window |
| Read-aloud buttons (Bacakan / Dengar) | player screens | button on each question | speech synthesis in the browser | not exercised | **not verified** | — | visible in footage, but this sandbox records no audio, so speech output was not checked; no claim made |
| Game picker: three families, eligibility per quiz | `/ibu-bapa/kuiz/{id}/main` | Main bersama | a quiz | scripted scroll | yes | `game_picker_1080p` | all 16 modes eligible for "Haiwan Kita" |
| Room: QR code, room link, 6-digit code | `/hos/{kod}` | pick a game | signed in | host window | yes | `host_lobby_1080p` | the link shown is `localhost:8080/m/…` of a disposable local room; no reusable or public link appears |
| Lobby square: children arrive, walk, stickers | `/hos/{kod}`, `/m/{kod}` | join | open room | 3 real player sessions | yes | `host_lobby_1080p`, game clips | — |
| Practice bots | host lobby | Bot + / − | `DIDIK_ALLOW_BOTS` (on by default off-production) | used in every game take | yes | all game clips | tagged "bot" on screen; the films do not pass them off as children |
| Host controls: Mula, Seterusnya, Tamat | host bar | buttons | playing | Tamat → "Ya, tamat" on camera | yes | `lumba_results_host_1080p` | Rehat (pause) not demonstrated |
| Leaderboard after each question (Kedudukan) | host and phone | simultaneous games | — | Lumba Sampan, Lumba Wau | yes | `lumba_*`, `wau_*` | — |
| Results podium, Main lagi | host and phone | game ends | — | host pressed Tamat | yes | `lumba_results_*` | Ali 1st, Aina 2nd, Amir 3rd, bots 4–7 |
| Kuiz Interaktif (Denai Didi, stars, reward trail) | host + phone | pick Kuiz Interaktif | quiz | count, spell and sort answered by taps; shuffle off | yes | `interaktif_*` | three questions answered by Ali in the take, each three stars; the host shows Denai Didi and "Paling banyak bintang" |
| Lumba Sampan | host + phone | game picker | quiz | Ali, Aina, Amir answer; 4 bots | yes | `lumba_*` | — |
| Lompat! | host + phone | game picker | true/false or 2–4 choices | answers by jumping to the island | yes | `lompat_*` | — |
| Pulau Harta Karun | host + phone | game picker | quiz | answer → dig a spot | yes | `harta_*` | coins found on camera ("Jumpa syiling: +10") |
| Hutan Misteri | host + phone | game picker | quiz | arrow-key walking to the nearest chest, Buka peti, answer | yes | `hutan_*` | one key collected per child in 45 s; the exit gate is not reached on camera |
| Pasukan Warna | host + phone | game picker | quiz | answer → Tawan petak | yes | `pasukan_*` | hex territory changes hands on the host map |
| Kampung Kita | host + phone | game picker | quiz | answer → building materials; decorations placed on the field | yes | `kampung_*` | buildings on camera include "Sekolah", "Kedai Runcit", "Jeti Nelayan" (a village; nothing to do with the city builder) |
| Teka Gambar | host + phone | game picker | quiz | answers open the secret picture's tiles | yes | `teka_*` | guessing the picture by typing was not done (the picture is secret to the player) |
| Kebun Ajaib | host + phone | game picker | quiz | answer → water; plant, water, harvest | yes | `kebun_*` | plant → water → harvest seen in the first take; the final take shows planting, watering and the shop |
| Pancing Ikan | host + phone | game picker | quiz | answer → bait; Lempar joran; fish caught | yes | `pancing_*` | Ikan Puyu and Ikan Bilis caught on camera |
| Lumba Wau | host + phone | game picker | quiz | answers | yes | `wau_*` | "Angin kencang!" event appears on camera |
| Kubu Pasir | host + phone | game picker | quiz | answer → sand; tingkat, tembok, bendera | yes | `kubu_*` | Ali's take spends sand on walls, so his own castle still reads "Belum ada istana"; the host board shows the class's castles. Not used in the promo montage for that reason |
| Kereta Api Kampung | host + phone | game picker | quiz | answer → coal; Jalan ke…, Tambah gerabak | yes | `keretapi_*` | the recorder never drives to the last station, "Bandar Bunga Raya", so the word does not appear |
| Pasar Malam | host + phone | game picker | quiz | answer → goods; Jual, stall upgrades | yes | `pasar_*` | sales on camera ("Jual 5 · RM 5") |
| Kejar Bintang | host + phone | game picker | quiz | answers; stars caught for the team | yes | `bintang_*` | — |
| Hikayat Lima Alam (Solo) | `/hos/{kod}`, `/m/{kod}` | Legenda → Solo | quiz of ≥ 10 questions | Aina, landscape player: hero choice, 5 enemies, Naga Chini, Petir chosen, 5 boss hits | yes — world 1 (Tasik Chini) cleared on camera in 138 s | `legenda_player_1080p`, `legenda_host_1080p` | worlds 2–5 and Party mode exist in code and tests but were not played on camera; the films say only "Terokai Hikayat Lima Alam". A portrait (phone) take was tried twice: both times the recording browser's page went black about 35 s in, once the HD battle scene loaded, under this sandbox's software rendering. It is not known whether a real phone shows the same, so it is not reported as an app bug; the promo uses the landscape take |
| Fullscreen and sound toggles | all game screens | buttons | — | visible | present | game clips | not exercised |
| Waiting room, kick, late join, timing, shuffle settings | host lobby | Tetapan | — | shuffle off used for Interaktif | partly | — | only "Kocok soalan" (shuffle) was changed |
| Reconnect / server-restart recovery | — | — | — | — | not tested | — | not claimed |
| Admin control room | secret path | — | env vars | — | not audited | — | excluded by the brief |

## Claims used in the films, and their evidence

| Claim (BM) | Evidence |
| --- | --- |
| Cipta soalan. Pilih permainan. | `create_quiz_1080p`, `game_picker_1080p` |
| Enam belas jenis soalan, dengan gambar dan penerangan. | 16 types in the editor's chooser (`create_quiz_1080p`); a picture and an explanation added on camera |
| Masuk dengan kod. Tiada akaun untuk anak-anak. | `phone_join_9x16`: code, animal, nickname; no sign-up exists on the child's side |
| Kod 6 digit, pautan atau kod QR. | `host_lobby_1080p` |
| Jawab, cabar diri dan kumpul ganjaran. | points, stars, coins, keys, flags earned on camera in the game clips |
| 14 permainan 2D. | all fourteen played with real answers (rows above) |
| Terokai Hikayat Lima Alam. · Dunia 1, Tasik Chini: lima musuh, kemudian Naga Chini. Pilih elemen, jawab, serang. | `legenda_player_1080p` (world 1 played; the mode's name is "Hikayat Lima Alam") |
| Main bersama kawan-kawan. Semua di skrin besar. Setiap anak di telefon sendiri. | three separate player sessions in every take; host screen beside Ali's phone |
| Di hujung permainan, semua naik podium. | `lumba_results_*` |
| Kenali DIDIK · didik.engineprofit.io | address given by the project owner; not reachable from this sandbox, so not checked |

## Count

- Modes in the server registry: **16** (Kuiz Interaktif, 14 2D games, Hikayat Lima Alam). All 16 opened, were
  played with real answers and were recorded (host screen + child screen): **16 / 16**.
- Parent and entry features recorded: landing page, dashboard, quiz list, quiz editor, game picker, room
  lobby with QR / link / code, join by code, results podium.
- Not shown, with reasons: read-aloud audio (no audio capture), Legenda worlds 2–5 and Party (not reached /
  not played), the admin room, accounts and password reset (out of scope), reconnect recovery (not tested).
