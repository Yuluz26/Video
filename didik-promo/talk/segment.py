"""Cuts the speaker out of the talk video so motion graphics can float between him and the background.

Per frame: MediaPipe's multiclass selfie segmenter (background / hair / body skin / face skin / clothes /
others) gives a person probability; it is smoothed over time (no edge flicker), feathered, and upscaled with
the frame to 1080×1920. Writes:
    yul_1080.mp4   the whole picture, upscaled (Lanczos + light sharpening), no audio
    yul_fg.webm    the speaker alone, VP9 with alpha

    python segment.py MODEL.tflite src/yul.mp4 OUT_DIR
"""

from __future__ import annotations

import subprocess
import sys

import cv2
import mediapipe as mp
import numpy as np

model_path, src, out = sys.argv[1:4]
SW, SH = 478, 850
W, H = 1080, 1920
FPS = 30

reader = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
full = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                         "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", "-movflags", "+faststart", f"{out}/yul_1080.mp4"], stdin=subprocess.PIPE)
fg = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                       "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "24", "-deadline", "good", "-cpu-used", "5",
                       "-row-mt", "1", "-auto-alt-ref", "0", f"{out}/yul_fg.webm"], stdin=subprocess.PIPE)

options = mp.tasks.vision.ImageSegmenterOptions(
    base_options=mp.tasks.BaseOptions(model_asset_path=model_path),
    running_mode=mp.tasks.vision.RunningMode.VIDEO,
    output_confidence_masks=True,
)
segmenter = mp.tasks.vision.ImageSegmenter.create_from_options(options)

prev = None
i = 0
frame_bytes = SW * SH * 3
while True:
    buf = reader.stdout.read(frame_bytes)
    if len(buf) < frame_bytes:
        break
    rgb = np.frombuffer(buf, np.uint8).reshape(SH, SW, 3)
    result = segmenter.segment_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(rgb)), int(i * 1000 / FPS))
    person = 1.0 - result.confidence_masks[0].numpy_view().astype(np.float32)  # 1 − P(background)
    person = cv2.resize(person, (SW, SH), interpolation=cv2.INTER_LINEAR)
    # temporal smoothing: follow fast movement, but damp single-frame flicker
    prev = person if prev is None else np.where(np.abs(person - prev) > 0.5, person, prev * 0.45 + person * 0.55)
    m = cv2.GaussianBlur(prev, (0, 0), 1.2)
    m = np.clip((m - 0.35) / 0.3, 0, 1)
    m = m * m * (3 - 2 * m)  # smoothstep: a clean edge with a short soft falloff

    big = cv2.resize(rgb, (W, H), interpolation=cv2.INTER_LANCZOS4)
    soft = cv2.GaussianBlur(big, (0, 0), 1.6)
    big = cv2.addWeighted(big, 1.45, soft, -0.45, 0)  # light unsharp mask after the 2.26× upscale
    mask = cv2.resize(m, (W, H), interpolation=cv2.INTER_CUBIC)
    mask = cv2.GaussianBlur(mask, (0, 0), 2.2)
    alpha = (np.clip(mask, 0, 1) * 255).astype(np.uint8)

    full.stdin.write(big.tobytes())
    fg.stdin.write(np.dstack([big, alpha]).tobytes())
    i += 1
    if i % 300 == 0:
        print(f"{i} frames", flush=True)

for p in (full, fg):
    p.stdin.close()
    p.wait()
print(f"done: {i} frames")
