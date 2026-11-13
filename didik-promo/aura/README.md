# Aura: building DIDIK (TikTok)

`output/DIDIK_Aura_Coding_9x16.mp4`: 48 s, 1080×1920, cut to Yul's track "WE ON GO" (~129 BPM).

- `beats.json`: beats and onsets of the song (librosa); the cuts and hits in `remotion/Aura.tsx` use them.
- `hf/build.mjs`: builds two **HyperFrames** compositions (an editor and terminal typing real DIDIK source:
  `fishing.py`, `legenda.py`, then a file per beat while the line count rolls to 49,552; and the real test
  run, `269 passed in 184.86s`). It also writes `hf/typing.json`, every typed key with its time.
- `sfx.py`: synthesised keyboard (one click per typed character from `typing.json`), glitch, sub drop, blips.
- `remotion/Aura.tsx` (`DIDIK-Aura-9x16`): the edit. Editor → COMPILE. / RUN. → the app on a phone and the
  host screen → tests → drop into Hikayat Lima Alam → 14 games, one per brass hit → DIDIK.

Rebuild (song at `src/song.wav`, DIDIK repo checked out):

```bash
node hf/build.mjs ../../../didik "269 passed in 184.86s" 269
```
```bash
cd hf/ide-a && HYPERFRAMES_BROWSER_PATH=/path/to/chromium npx hyperframes render -o ide-a.mp4
```
```bash
python sfx.py hf/typing.json ../public/aura/sfx
```

Copy `song.wav`, `ide-a.mp4`, `ide-b.mp4` into `public/aura/`, then render `DIDIK-Aura-9x16` from the
repository root. The song and rendered media are not committed.
