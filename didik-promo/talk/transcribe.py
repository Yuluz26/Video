"""Transcribes the talk with Whisper small (faster-whisper, int8, CPU) and writes words with timings.

    python transcribe.py MODEL_DIR src/yul16k.wav transcript.json
"""
import json
import sys
import wave

import numpy as np

from faster_whisper import WhisperModel

model_dir, audio, out = sys.argv[1:4]
with wave.open(audio) as w:  # 16 kHz mono PCM, made by ffmpeg
    pcm = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(np.float32) / 32768.0
model = WhisperModel(model_dir, device="cpu", compute_type="int8", cpu_threads=4)
segments, info = model.transcribe(pcm, language="ms", word_timestamps=True, beam_size=5, vad_filter=False,
                                  initial_prompt="DIDIK, kuiz, permainan, anak-anak, ibu bapa, cikgu, Story Mode, Hikayat Lima Alam.")
data = []
for s in segments:
    data.append({"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip(),
                 "words": [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2), "p": round(w.probability, 2)} for w in s.words]})
    print(f"[{s.start:6.2f} – {s.end:6.2f}] {s.text.strip()}")
json.dump({"language": info.language, "duration": info.duration, "segments": data}, open(out, "w"), ensure_ascii=False, indent=1)
