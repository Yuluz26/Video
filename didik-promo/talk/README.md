# Yul's talk: DIDIK promo edit

`output/DIDIK_Talk_Yul_9x16.mp4`: Yul's 66 s selfie video about DIDIK, edited in Remotion
(`remotion/Talk.tsx`, composition `DIDIK-Talk-9x16`, 1080×1920, 30 fps).

## How it is made

1. **Transcript** (`transcribe.py` → `transcript.json`): Whisper small (faster-whisper, CTranslate2 int8,
   CPU), Malay, word timestamps. The model came from npm (`@skillninja/shortmovie-telop-model-p0…p3`, MIT,
   checked against its SHA-256), because the usual model hosts are blocked in the cloud sandbox.
2. **Captions** (`captions.py` → `remotion/talk-captions.ts`): Yul's own script (`script.txt`) is the text;
   it is aligned word by word to Whisper's timings (difflib), so every caption word appears when he says it.
   Words Whisper heard differently take the timing of the stretch they replace.
3. **Cut-out** (`segment.py`): MediaPipe's multiclass selfie segmenter on every frame, smoothed over time and
   feathered, upscaled with the picture from 478×850 to 1080×1920. Writes `yul_1080.mp4` (the whole picture,
   used blurred as the backdrop) and `yul_fg.webm` (Yul alone, VP9 with alpha), so things can float between
   the background and him.
4. **Hand tracking** (`hands.py` → `hands.json`, `track.py` → `remotion/talk-hands.ts`): MediaPipe Hand
   Landmarker from 16.5 to 21 s; both hands are followed frame to frame (the watch hand on the left of the
   frame from a seed at 18.0 s, the window-side hand on the right from 18.3 s), each detection used by one hand
   only, gaps filled and smoothed. The "macam ni" game cards stand on his palms and move with them.
5. **Voice**: rumble filter, light denoise, gentle compression, −16 LUFS (`public/talk/voice.wav`).
6. **Edit** (`remotion/Talk.tsx`): backdrop → floating stickers, chibis, badges → Yul (white sticker outline,
   moving to make room) → illustrations and DIDIK's real recordings on his cues → word-by-word captions → shape
   wipes between topics. The music bed is `audio/generate.py vlog` (no melody, so it never fights the voice).

## Cues (seconds, from the transcript)

| Words | Time | On screen |
| --- | --- | --- |
| "nama dia DIDIK" | 7.84 | logo smash, shockwave, confetti; chibi kids float behind |
| "kuiz A, B, C, D je tau" | 11.7 | A B C D tiles pop and shrug |
| "belajar sambil main" | 14.2 | sticker type, buku and bola |
| "macam ni... macam ni... dan macam ni!" | 17.24, 18.20, 19.54 | real recordings pop out of his palms and follow his hands: Kuiz Interaktif in his right hand (stays), Lompat! in his left, swapped for Teka Gambar as that hand sweeps |
| "14 jenis game 2D" | 22.06 | pixel "14", the 14 badges orbit behind him |
| "Lumba Sampan, Pancing Ikan, Kebun Ajaib" | 24.06, 24.92, 25.74 | the three recordings pop in on their names |
| "Story Mode. Hikayat Lima Alam" | 29.96, 31.04 | gold star wipe into the Tasik Chini battlefield; Yul stands in the game world |
| "pilih watak", "lima dunia", "lawan … bos" | 34.3, 35.1, 37.0 | Hang Tuah and Mahsuri, the five worlds, a Petir strike on Naga Chini |
| "kenalah jawab soalan dulu" | 39.6 | a Legenda-style question card, answered |
| "ibu bapa dengan cikgu … buat soalan sendiri … pilih game" | 42.7–46.4 | the editor, then the game picker |
| "seronok" | 51.64 | "Ulangkaji jadi SERONOK!" |
| "rasa macam main game" | 54.5 | Belajar = main game |
| "didik.engineprofit.io" | 59.46 | the address types itself into a bouncing pill |
| "jumpa korang dekat DIDIK" | 63.9 | logo, confetti, chibis |

## Rebuild

Put the source video at `talk/src/yul.mp4`, then from `talk/`:

```bash
ffmpeg -i src/yul.mp4 -ac 1 -ar 16000 src/yul16k.wav
```
```bash
python transcribe.py WHISPER_SMALL_DIR src/yul16k.wav transcript.json
```
```bash
python captions.py transcript.json script.txt ../remotion/talk-captions.ts
```
```bash
python hands.py hand_landmarker.task src/yul.mp4 16.5 21.0 hands.json
```
```bash
python track.py hands.json 18.0 263 1324 18.3 1125 1117 ../remotion/talk-hands.ts
```
```bash
python segment.py selfie_multiclass_256x256.tflite src/yul.mp4 .
```

Copy `yul_1080.mp4` and `yul_fg.webm` into `public/talk/`, make `public/talk/voice.wav` (see step 5), then
from the repository root:

```bash
npx remotion render didik-promo/remotion/index.ts DIDIK-Talk-9x16 didik-promo/output/DIDIK_Talk_Yul_9x16.mp4 --public-dir=didik-promo/public --codec=h264 --audio-codec=aac --crf=18
```

The source video, its cut-out layers and the voice track are not committed (personal recording, large files).
