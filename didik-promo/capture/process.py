"""Turns raw takes into clean, seekable clips and writes recordings/manifest.json.

Raw takes (recordings/raw, x11grab, ultrafast x264) are re-encoded to H.264 High, CRF 18, a keyframe
every half second, no audio, faststart; nothing about the picture is changed. Every output is checked
with ffprobe (size, frame rate, duration, decodable frames) and the result goes in the manifest.

    python process.py                    # all takes
    python process.py lumba_host_1080p   # only these (others keep their manifest entries)
"""

from __future__ import annotations

import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "recordings" / "raw"
OUT = ROOT / "public" / "clips"  # recordings/processed links here; Remotion serves it as clips/

# What each take shows, for the manifest. Keys are the file stem without the _host/_phone/_player suffix.
SCENES = {
    "landing_scroll": ("Laman utama", "/"),
    "dashboard": ("Papan pemuka ibu bapa, Kuiz saya", "/ibu-bapa, /ibu-bapa/kuiz"),
    "create_quiz": ("Cipta kuiz: soalan, gambar rajah, pilihan bergambar, Simpan", "/ibu-bapa/kuiz/baru"),
    "game_picker": ("Pilih permainan (3 keluarga)", "/ibu-bapa/kuiz/{id}/main"),
    "host_lobby": ("Bilik dibuka: QR, kod 6 digit, pemain masuk, Mula", "/hos/{kod}"),
    "phone_join": ("Masuk bilik dengan kod di telefon", "/ → /m/{kod}"),
    "interaktif": ("Kuiz Interaktif", "/hos/{kod}, /m/{kod}"),
    "legenda": ("Hikayat Lima Alam (Solo)", "/hos/{kod}, /m/{kod}"),
    "lumba": ("Lumba Sampan", "/hos/{kod}, /m/{kod}"),
    "lompat": ("Lompat!", "/hos/{kod}, /m/{kod}"),
    "harta": ("Pulau Harta Karun", "/hos/{kod}, /m/{kod}"),
    "hutan": ("Hutan Misteri", "/hos/{kod}, /m/{kod}"),
    "pasukan": ("Pasukan Warna", "/hos/{kod}, /m/{kod}"),
    "kampung": ("Kampung Kita", "/hos/{kod}, /m/{kod}"),
    "teka": ("Teka Gambar", "/hos/{kod}, /m/{kod}"),
    "kebun": ("Kebun Ajaib", "/hos/{kod}, /m/{kod}"),
    "pancing": ("Pancing Ikan", "/hos/{kod}, /m/{kod}"),
    "wau": ("Lumba Wau", "/hos/{kod}, /m/{kod}"),
    "kubu": ("Kubu Pasir", "/hos/{kod}, /m/{kod}"),
    "keretapi": ("Kereta Api Kampung", "/hos/{kod}, /m/{kod}"),
    "pasar": ("Pasar Malam", "/hos/{kod}, /m/{kod}"),
    "bintang": ("Kejar Bintang", "/hos/{kod}, /m/{kod}"),
    "lumba_results": ("Keputusan dan podium (Lumba Sampan, hos tekan Tamat)", "/hos/{kod}, /m/{kod}"),
}


def probe(path: Path) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries",
         "stream=codec_name,width,height,r_frame_rate,nb_read_frames:format=duration,size", "-of", "json", str(path)],
        capture_output=True, text=True, check=True,
    )
    data = json.loads(out.stdout)
    s, f = data["streams"][0], data["format"]
    num, den = (int(x) for x in s["r_frame_rate"].split("/"))
    return {
        "codec": s["codec_name"],
        "resolution": f"{s['width']}x{s['height']}",
        "fps": round(num / den, 3),
        "frames": int(s.get("nb_read_frames", 0)),
        "duration": round(float(f["duration"]), 3),
        "bytes": int(f["size"]),
    }


def scene_of(stem: str) -> tuple[str, str, str]:
    for suffix, view in (("_host_1080p", "host screen 1920x1080"), ("_phone_9x16", "child phone 1080x1920"), ("_player_1080p", "child screen 1920x1080"), ("_1080p", "parent screen 1920x1080")):
        if stem.endswith(suffix):
            key = stem[: -len(suffix)]
            if key == "phone_join":
                view = "child phone 1080x1920"
            return key, view, suffix
    return stem, "", ""


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    only = set(sys.argv[1:])
    manifest_path = ROOT / "recordings" / "manifest.json"
    kept = [m for m in json.loads(manifest_path.read_text())] if only and manifest_path.exists() else []
    manifest = [m for m in kept if m["scene"] not in only]
    problems = 0
    for raw in sorted(RAW.glob("*.mp4")):
        stem = raw.stem
        if only and stem not in only:
            continue
        out = OUT / f"{stem}.mp4"
        if not out.exists() or out.stat().st_mtime < raw.stat().st_mtime:
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-an", "-c:v", "libx264", "-profile:v", "high", "-preset", "veryfast",
                            "-crf", "18", "-g", "15", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(out)], check=True)
        info = probe(out)
        key, view, _ = scene_of(stem)
        feature, route = SCENES.get(key, (key, ""))
        ok = info["frames"] > 0 and info["duration"] > 1 and info["fps"] == 30 and info["codec"] == "h264"
        problems += 0 if ok else 1
        meta = raw.with_suffix(".json") if raw.with_suffix(".json").exists() else RAW / f"{key}.json"
        manifest.append({
            "scene": stem,
            "feature": feature,
            "route": route,
            "view": view,
            "captured_at": datetime.fromtimestamp(raw.stat().st_mtime, timezone.utc).isoformat(timespec="seconds"),
            "duration": info["duration"],
            "resolution": info["resolution"],
            "fps": info["fps"],
            "codec": info["codec"],
            "frames": info["frames"],
            "bytes": info["bytes"],
            "source": f"recordings/raw/{raw.name} (headful Chromium on Xvfb, ffmpeg x11grab 30 fps, local dev server)",
            "processed": f"recordings/processed/{out.name}",
            "status": "verified" if ok else "check",
            "notes": json.loads(meta.read_text()).get("actions", "") and "player actions logged in raw/" + meta.name if meta.exists() else "",
        })
        print(f"{'ok ' if ok else 'BAD'} {stem:32s} {info['resolution']:>10s} {info['fps']:>5} fps {info['duration']:7.2f}s {info['frames']:5d} frames")
    manifest.sort(key=lambda m: m["scene"])
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    print(f"{len(manifest)} clips, {problems} with problems")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
