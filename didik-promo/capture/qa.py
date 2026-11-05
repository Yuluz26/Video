"""Checks the rendered films and makes contact sheets of sampled frames.

    python qa.py            # writes output/qa/*.jpg and output/qa/specs.json, prints a summary

Per file: container, codecs, size, frame rate, duration, decoded frame count (every frame is decoded, so a
broken stream fails here), audio loudness, and black or frozen stretches longer than half a second.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output"
QA = OUT / "qa"

EXPECT = {
    "DIDIK_Full_Features_Demo_1080p.mp4": (1920, 1080),
    "DIDIK_Promo_TikTok_9x16_60s.mp4": (1080, 1920),
    "DIDIK_Promo_Landscape_16x9.mp4": (1920, 1080),
}


def run(*args: str) -> str:
    return subprocess.run(args, capture_output=True, text=True).stderr + subprocess.run(args, capture_output=True, text=True).stdout


def probe(path: Path) -> dict:
    raw = subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-show_entries",
                          "stream=codec_type,codec_name,profile,width,height,r_frame_rate,nb_read_frames,sample_rate,channels:format=duration,size,format_name",
                          "-of", "json", str(path)], capture_output=True, text=True, check=True).stdout
    data = json.loads(raw)
    v = next(s for s in data["streams"] if s["codec_type"] == "video")
    a = next((s for s in data["streams"] if s["codec_type"] == "audio"), None)
    num, den = (int(x) for x in v["r_frame_rate"].split("/"))
    return {
        "file": path.name,
        "bytes": int(data["format"]["size"]),
        "duration": round(float(data["format"]["duration"]), 3),
        "container": data["format"]["format_name"],
        "video": f"{v['codec_name']} ({v.get('profile', '')})",
        "resolution": f"{v['width']}x{v['height']}",
        "fps": round(num / den, 3),
        "frames": int(v.get("nb_read_frames", 0)),
        "audio": f"{a['codec_name']} {a['sample_rate']} Hz {a['channels']} ch" if a else None,
        "_w": v["width"],
        "_h": v["height"],
    }


def loudness(path: Path) -> str:
    log = subprocess.run(["ffmpeg", "-nostats", "-i", str(path), "-af", "ebur128=framelog=quiet", "-f", "null", "-"], capture_output=True, text=True).stderr
    m = re.search(r"I:\s+(-?[\d.]+) LUFS", log)
    return f"{m.group(1)} LUFS" if m else "n/a"


def stretches(path: Path) -> dict:
    log = subprocess.run(["ffmpeg", "-nostats", "-i", str(path), "-vf", "blackdetect=d=0.5:pix_th=0.06,freezedetect=n=0.002:d=2.5", "-an", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    black = re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", log)
    freeze = re.findall(r"freeze_start: ([\d.]+)", log)
    return {"black": [(float(a), float(b)) for a, b in black], "frozen_over_2_5s_starts": [float(f) for f in freeze]}


def sheet(path: Path, info: dict, every: float, cols: int) -> Path:
    tile_w = 384 if info["_w"] > info["_h"] else 216
    dest = QA / f"{path.stem}_contact.jpg"
    rows = int(info["duration"] // every // cols + 1)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(path), "-vf",
                    f"fps=1/{every},scale={tile_w}:-2,drawtext=text='%{{pts\\:hms}}':x=6:y=6:fontcolor=white:fontsize=16:box=1:boxcolor=black@0.55,tile={cols}x{rows}:padding=4:color=white",
                    "-frames:v", "1", "-q:v", "3", str(dest)], check=True)
    return dest


def main() -> int:
    QA.mkdir(parents=True, exist_ok=True)
    report, bad = [], 0
    for name, (w, h) in EXPECT.items():
        path = OUT / name
        if not path.exists():
            print(f"MISSING {name}")
            bad += 1
            continue
        info = probe(path)
        info["loudness"] = loudness(path)
        info.update(stretches(path))
        every = 2.0 if info["duration"] < 90 else 6.0
        info["contact_sheet"] = str(sheet(path, info, every, 10 if w < h else 8).relative_to(ROOT))
        ok = (info["_w"], info["_h"]) == (w, h) and info["fps"] == 30 and info["video"].startswith("h264") and (info["audio"] or "").startswith("aac") and info["frames"] > 0
        info["meets_spec"] = ok
        bad += 0 if ok else 1
        for k in ("_w", "_h"):
            info.pop(k)
        report.append(info)
        print(json.dumps(info, ensure_ascii=False))
    cover = OUT / "DIDIK_Promo_Cover_9x16.png"
    if cover.exists():
        c = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0", str(cover)], capture_output=True, text=True).stdout.strip()
        report.append({"file": cover.name, "resolution": c.replace(",", "x"), "bytes": cover.stat().st_size})
        print(cover.name, c)
    (QA / "specs.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
