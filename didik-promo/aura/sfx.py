"""Sound design for the aura video, synthesised (no samples):
  typing.wav   a mechanical keyboard on every typed character of the IDE scenes (hf/typing.json), 48 s
  glitch.wav   a digital tear for the hard cuts
  sub.wav      a sub drop for the 25.7 s drop
  blip.wav     a small UI beep for terminal lines
  tick.wav     a soft tick for counters

    python sfx.py hf/typing.json OUT_DIR
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np

SR = 48_000
rng = np.random.default_rng(11)


def write(path: Path, x: np.ndarray) -> None:
    st = x if x.ndim == 2 else np.stack([x, x], 1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(st, -1, 1) * 32767).astype("<i2").tobytes())


def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def key(kind: str) -> np.ndarray:
    """One key press: a bright click (the switch) and a low thock (the keycap bottoming out)."""
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    pitch = {"key": 1.0, "space": 0.62, "enter": 0.8, "tab": 0.9}[kind] * rng.uniform(0.92, 1.08)
    click = rng.uniform(-1, 1, n) * np.exp(-t / 0.0022)
    click = click - lp(click, 1800)  # keep the top end
    thock = np.sin(2 * np.pi * 210 * pitch * t) * np.exp(-t / (0.016 if kind == "key" else 0.03))
    body = lp(rng.uniform(-1, 1, n), 900) * np.exp(-t / 0.012) * 2.5
    gain = {"key": 0.32, "space": 0.42, "enter": 0.55, "tab": 0.4}[kind] * rng.uniform(0.75, 1.0)
    out = (click * 0.9 + thock * 0.55 + body * 0.35) * gain
    if kind == "enter":  # a second, louder release clack
        out[int(0.035 * SR):] += (click[: n - int(0.035 * SR)] * 0.6)
    return out


def typing(events, seconds=48.1):
    L = np.zeros(int(seconds * SR) + SR)
    R = np.zeros_like(L)
    for e in events:
        k = key(e["k"])
        i = int(e["t"] * SR)
        pan = rng.uniform(-0.35, 0.35)  # keys sit across the keyboard
        L[i:i + len(k)] += k * (1 - pan)
        R[i:i + len(k)] += k * (1 + pan)
    return np.stack([L, R], 1)[: int(seconds * SR)]


def glitch():
    n = int(0.42 * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    pos = 0
    while pos < n:  # stuttering chunks of crushed noise and square chirps
        ln = int(rng.uniform(0.012, 0.045) * SR)
        seg = np.arange(min(ln, n - pos)) / SR
        if rng.random() < 0.5:
            s = np.sign(np.sin(2 * np.pi * rng.uniform(300, 2400) * seg))
        else:
            hold = int(rng.integers(4, 30))
            s = np.repeat(rng.uniform(-1, 1, len(seg) // hold + 1), hold)[: len(seg)]
        out[pos:pos + len(seg)] = s * rng.uniform(0.3, 1.0)
        pos += len(seg) + int(rng.uniform(0, 0.01) * SR)
    return out * np.exp(-t / 0.2) * 0.45


def sub():
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    f = 62 * np.exp(-t * 0.9) + 28
    ph = np.cumsum(2 * np.pi * f / SR)
    return np.tanh(np.sin(ph) * 1.6) * np.exp(-t / 0.7) * 0.85


def blip():
    n = int(0.08 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * 1760 * t) * np.exp(-t / 0.02) * 0.25


def tick():
    n = int(0.03 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * 3200 * t) * np.exp(-t / 0.005) * 0.2


if __name__ == "__main__":
    events = json.load(open(sys.argv[1]))
    out = Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    write(out / "typing.wav", typing(events) * 0.9)
    for name, fn in (("glitch", glitch), ("sub", sub), ("blip", blip), ("tick", tick)):
        write(out / f"{name}.wav", fn())
    print("wrote", sorted(p.name for p in out.iterdir()))
