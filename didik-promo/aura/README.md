# Aura: building DIDIK (TikTok)

`output/DIDIK_Aura_WeOnGo_9x16.mp4`: 48 s, 1080×1920, −14 LUFS, cut to Yul's track "We On Go" (~129 BPM).

Every app shot is a v3 take of the latest DIDIK (revamped 8-bit 2D games, the new Kuiz Interaktif and
subject games, the classroom lobby), recorded with `capture/record-v2.sh` into `recordings/raw-v3` and
used as `public/clips/v3_*`. Makmal Sains is left out, as in every DIDIK video here.

- `beats.json`: beats and onsets of the song (librosa); the cuts and hits in `remotion/Aura.tsx` use them.
- `hf/build.mjs`: builds two **HyperFrames** compositions (an editor and terminal typing real DIDIK source:
  `fishing.py`, `legenda.py`, then a file per beat while the line count rolls to 67,077; and the real test
  run, `313 passed in 248.31s`). It also writes `hf/typing.json`, every typed key with its time.
- `sfx.py`: synthesised keyboard (one click per typed character from `typing.json`), glitch, sub drop, blips.
- `remotion/Aura.tsx` (`DIDIK-Aura-9x16`): the edit. Editor → COMPILE. / RUN. → the app on a phone and the
  host screen → tests → drop into Hikayat Lima Alam → 14 games, one per brass hit → DIDIK.

Rebuild (song at `src/song.wav`, DIDIK repo checked out):

```bash
node hf/build.mjs ../../../didik "313 passed in 248.31s" 313
```
```bash
cd hf/ide-a && HYPERFRAMES_BROWSER_PATH=/path/to/chromium npx hyperframes render -o ide-a.mp4
```
```bash
python sfx.py hf/typing.json ../public/aura/sfx
```

Copy `song.wav`, `ide-a.mp4`, `ide-b.mp4` into `public/aura/`, then render `DIDIK-Aura-9x16` from the
repository root, then normalise the audio:

```bash
ffmpeg -i output/DIDIK_Aura_Coding_9x16_raw.mp4 -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:v copy -c:a aac -b:a 256k output/DIDIK_Aura_WeOnGo_9x16.mp4
```

The song and rendered media are not committed.
