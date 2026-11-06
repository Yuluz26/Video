# DIDIK promo films

Two films made from real recordings of the DIDIK app running locally, edited in Remotion:

| File | What | Spec |
| --- | --- | --- |
| `output/DIDIK_Full_Features_Demo_1080p.mp4` | full feature demo, chaptered | 1920×1080, 30 fps, H.264 + AAC |
| `output/DIDIK_Promo_TikTok_9x16_60s.mp4` | 60 s promo for TikTok / Reels, the energetic motion-graphics cut | 1080×1920, 30 fps, H.264 + AAC |
| `output/DIDIK_Promo_Landscape_16x9.mp4` | the calmer promo, recut for 16:9 | 1920×1080, 30 fps, H.264 + AAC |
| `output/DIDIK_Promo_Cover_9x16.png` | cover / thumbnail | 1080×1920 |

The MP4 films and the recordings are not committed (too large); rebuild them with the steps below. The cover
PNG and the QA contact sheets are committed.
`FEATURE_AUDIT.md` says what was verified and how, `STORYBOARD.md` gives every scene with its timing, copy and
source footage, `QA_REPORT.md` has the checks on the final files, and `recordings/manifest.json` lists every clip.

## Layout

```
didik-promo/
  capture/        browser automation that records the running app (Playwright + Xvfb + ffmpeg x11grab)
  audio/          generate.py: the original score and DIDIK's UI sounds, synthesised
  remotion/       the compositions: PromoHype (the 9:16 promo), Promo (the calmer cut), PromoLandscape (16:9),
                  Demo, Cover
    motion.tsx    the motion toolkit: beat pulses, squash-and-stretch pops, sticker type, confetti, sparkles,
                  parallax backgrounds, shake, flashes, sprite sheets, shape wipes, flying cards
    hype-plan.ts  clips, the game montage and every sound effect (with its frame) for PromoHype
    copy.ts       captions of the calmer cut
    clips.ts      which clip and from which frame each scene of the calmer cut uses
    demo-plan.ts  the demo, shot by shot, with chapter and game text
  public/         what Remotion serves: brand/ (logo and game badges rendered from the app), chars/ (DIDIK's pixel
                  characters and Didi, rendered from the app's art sheet), stickers/ (the app's Fluent Emoji
                  stickers, MIT), fonts/ (Fredoka, Nunito, OFL), audio/, clips/ (processed recordings) and
                  story/ (Legenda art copied from live/web/static/story); clips, audio and story are not committed
  recordings/     raw/ (takes, not committed), processed/ → ../public/clips, manifest.json
  output/         rendered films (not committed)
```

## Preview and edit

From the repository root:

```bash
npm run didik:studio
```

Remotion Studio opens with `DIDIK-Promo-9x16` (the energetic promo), `DIDIK-Promo-9x16-Calm`, `DIDIK-Promo-16x9`,
`DIDIK-Demo-16x9` and `DIDIK-Cover-9x16`.

Before the first preview, copy DIDIK's Legenda art into `public/story` (from the root of this repository, with
the DIDIK repository checked out beside it):

```bash
cp -r ../didik/live/web/static/story didik-promo/public/story
```

- The energetic promo: scene timing is the `SCENES` table at the bottom of `remotion/PromoHype.tsx`; clips,
  montage games and sound effects are in `remotion/hype-plan.ts`. Keep hits on multiples of 15 frames.

- Captions: `remotion/copy.ts` (promo) and `remotion/demo-plan.ts` (demo titles and lines). Keep every claim in
  line with `FEATURE_AUDIT.md`.
- Which moment of a clip is used: `from` in `remotion/clips.ts` and `remotion/demo-plan.ts` (frames at 30 fps).
- Timing: the promo's scene boundaries are `TIMES` in `remotion/Promo.tsx`; they sit on the 120 BPM score
  (one beat = 15 frames), so move them in whole beats.

## Render

```bash
npm run didik:promo
```
```bash
npm run didik:promo-landscape
```
```bash
npm run didik:demo
```
```bash
npm run didik:cover
```

If Remotion cannot download its own browser (as in a locked-down sandbox), add
`--browser-executable=/path/to/chromium` to the command.

## Re-record from scratch

Needs the DIDIK repository, Python 3.11+, Node 22, Xvfb and ffmpeg. The characters (`public/chars`) come from
`capture/characters.cjs`, which renders DIDIK's art sheet (`/gaya`) to transparent PNGs.

1. Run DIDIK locally with a throwaway database (never production):
   ```bash
   cd live/web && npm ci && npm run build
   ```
   ```bash
   cd live/server && DIDIK_DATA_DIR=/tmp/didik-data python -m didik_live
   ```
2. Create the recording quiz with the demo account (`capture/fixture-quiz.json`, POST `/api/quizzes`); note its
   id (the scripts expect 12; pass another as the last argument). Delete the sample quizzes you do not want
   on camera (for these films: the two "Sains …" samples). **The server re-adds missing samples every time it
   starts**, so delete them again after any restart, before recording anything that lists quizzes.
3. Record, from `capture/`:
   ```bash
   ./record-all-games.sh ../recordings/raw
   ```
   ```bash
   ./record-rest.sh ../recordings/raw
   ```
4. Process and verify (re-encode, ffprobe every clip, write the manifest):
   ```bash
   python process.py
   ```
5. Audio (from `audio/`):
   ```bash
   python generate.py hype ../public/audio/music-hype.wav 60
   ```
   ```bash
   python generate.py promo ../public/audio/music-promo.wav 60
   ```
   ```bash
   python generate.py bed ../public/audio/music-bed.wav 350
   ```
   ```bash
   python generate.py sfx ../public/audio/sfx
   ```

How the capture works: each recorded screen is a real Chromium window on its own Xvfb display at the exact
output size, rendering at a forced device scale (host 1280×720 CSS at 1.5×, phone 405×720 CSS at 2.67×), and
ffmpeg grabs it at 30 fps. Ali, Aina and Amir are separate browser sessions; they read the question on screen,
look it up in the quiz, and tap the right tile (or, for count, spell and sort, tap the pieces in order).
