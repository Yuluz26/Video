"""Tracks Yul's hands (MediaPipe Hand Landmarker) over a time range and writes palm positions per frame,
in 1080×1920 output pixels, so the edit can put things in his hand.

    python hands.py hand_landmarker.task src/yul.mp4 START END hands.json
"""
import json
import subprocess
import sys

import mediapipe as mp
import numpy as np

model, src, a, b, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), sys.argv[5]
SW, SH, FPS = 478, 850, 30
K = 1080 / SW

reader = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-ss", str(a), "-t", str(b - a), "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
lm = mp.tasks.vision.HandLandmarker.create_from_options(mp.tasks.vision.HandLandmarkerOptions(
    base_options=mp.tasks.BaseOptions(model_asset_path=model), running_mode=mp.tasks.vision.RunningMode.VIDEO,
    num_hands=2, min_hand_detection_confidence=0.3, min_hand_presence_confidence=0.3, min_tracking_confidence=0.3))

frames = []
i = 0
n = SW * SH * 3
while True:
    buf = reader.stdout.read(n)
    if len(buf) < n:
        break
    rgb = np.frombuffer(buf, np.uint8).reshape(SH, SW, 3)
    r = lm.detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(rgb)), int(i * 1000 / FPS))
    hands = []
    for pts, hd in zip(r.hand_landmarks, r.handedness):
        palm = [pts[k] for k in (0, 5, 9, 13, 17)]
        x = sum(p.x for p in palm) / 5 * SW * K
        y = sum(p.y for p in palm) / 5 * SH * K
        tip = pts[12]  # middle fingertip: the top of the open hand
        hands.append({"side": hd[0].category_name, "x": round(x), "y": round(y), "tx": round(tip.x * SW * K), "ty": round(tip.y * SH * K),
                      "span": round(abs(pts[5].x - pts[17].x) * SW * K)})
    frames.append({"t": round(a + i / FPS, 3), "hands": hands})
    i += 1
json.dump({"start": a, "fps": FPS, "frames": frames}, open(out, "w"))
for fr in frames[::6]:
    print(fr["t"], " | ".join(f"{h['side'][0]} palm({h['x']},{h['y']}) tip({h['tx']},{h['ty']}) span {h['span']}" for h in fr["hands"]))
