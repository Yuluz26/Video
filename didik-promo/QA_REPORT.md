# QA report

Checked with `capture/qa.py` (ffprobe, a full decode of every frame, EBU R128 loudness, black and still
detection, contact sheets) and by eye, frame by frame, on the contact sheets and on stills rendered at every
scene. Specs are in `output/qa/specs.json`.

## Outputs

| File | Resolution | fps | Video | Audio | Duration | Frames | Size | Loudness | Spec |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `output/DIDIK_Full_Features_Demo_1080p.mp4` | 1920×1080 | 30 | H.264 High | AAC 48 kHz stereo | 5:36.0 | 10 080 | 132.1 MB | −17.9 LUFS | meets |
| `output/DIDIK_Promo_TikTok_9x16_60s.mp4` | 1080×1920 | 30 | H.264 High | AAC 48 kHz stereo | 60.0 s | 1 800 | 28.6 MB | −13.6 LUFS | meets |
| `output/DIDIK_Promo_Landscape_16x9.mp4` (optional) | 1920×1080 | 30 | H.264 High | AAC 48 kHz stereo | 60.0 s | 1 800 | 25.5 MB | −13.6 LUFS | meets |
| `output/DIDIK_Promo_Cover_9x16.png` | 1080×1920 | — | PNG | — | — | — | 0.6 MB | — | meets |

Every frame of every file decodes. No black stretches. Audio was normalised after rendering (video stream
copied, not re-encoded): the promos to about −14 LUFS for TikTok / Reels, the demo to −18 LUFS because its
music sits under the footage.

Still stretches over 2.5 s flagged by ffmpeg, each checked: the logo holds at the start and end, the
dashboard and the game picker between scrolls, and two moments in the game section (Lumba Sampan at 2:24,
Teka Gambar at 3:19) where the children are reading a question and only the countdown moves. None is a
frozen or dropped frame.

## Contact sheets

- `output/qa/DIDIK_Promo_TikTok_9x16_60s_contact.jpg`: every 2 s
- `output/qa/DIDIK_Promo_Landscape_16x9_contact.jpg`: every 2 s
- `output/qa/DIDIK_Full_Features_Demo_1080p_contact.jpg`: every 6 s

## Found and fixed during QA

| Problem | Fix |
| --- | --- |
| Captions sat on the app's own text (hook, montage, landscape cut) | text moved to its own solid ground; footage never under words |
| Landscape screens shrunk to 1000 px in the vertical promo were unreadable on a phone | taller cards that crop into the part that matters (editor, QR and code, race) |
| Notes cut off by the phone frame (Join, Together) | moved under the title or narrowed |
| Legenda square crop cut a banner; the landscape Story opened on the "Membuka kitab legenda…" loading screen | full 16:9 frame at full width; trims moved past loading |
| Podium trim started before Tamat | trimmed to the podium |
| Dashboard take listed two "Sains …" sample quizzes (the server re-added them when it was restarted) | deleted them again and re-recorded the dashboard; checked every other take that shows quiz titles |
| Sticker dialog shows a "Sekolah & sains" category tab | the create-quiz take was re-recorded without opening it |
| Self-paced games: the child stopped after one question (recorder bug) | recorder fixed; eight games and Kuiz Interaktif re-recorded |
| Kubu Pasir phone take shows no castle | left out of the promo montage (Pasar Malam used); kept in the demo, where the host board shows the class's castles |

## Claims

Every caption was checked against `FEATURE_AUDIT.md` (the "Claims used in the films" table). "14 permainan 2D"
is used because all fourteen were played with real answers on camera. Hikayat Lima Alam is shown as the mode's
name and world 1, the only world played on camera. The address didik.engineprofit.io is the one given by the
project owner; this sandbox could not reach it, so it was not checked.

## Excluded content

- No DIDIK Sains, science-city, "bandar" or metropolitan material in any caption, file name, image or
  footage. Checked by searching every file name and every caption source, and by viewing every take and
  render. The two sample quizzes titled "Sains …" were removed before recording. The sticker tab "Sekolah &
  sains" and the train's last station "Bandar Bunga Raya" never appear: the dialog is not opened on camera,
  and no train in the takes gets past the early stations.
- No credentials on screen: the sign-in page, which prints the demo password, is never filmed.
- The only links on screen are `localhost:8080/m/…` links of disposable local rooms.
- No real children's data: Ali, Aina and Amir are scripted sessions; the rest of the class are the app's
  practice bots, tagged "bot" on screen.

## Known limitations

- Read-aloud (Bacakan / Dengar) was not verified: the sandbox records no audio. The films make no claim about it.
- Hikayat Lima Alam: only world 1 was played; the portrait (phone) recording browser lost its page in this
  sandbox's software rendering, so Story Mode is shown from a landscape screen.
- In the Kuiz Interaktif take the planned deliberate wrong answer fell outside the recorded window. The
  "Kenapa begitu?" explanation is still shown honestly, on the host screens of the simultaneous games.
- Music and effects are original synthesised audio, not recordings of the app's sound (the browser takes
  carry no audio). There is no voiceover.
