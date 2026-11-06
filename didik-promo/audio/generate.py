"""Original chiptune score and sound effects for the DIDIK promo videos.

Everything here is synthesised from scratch (square, triangle and noise voices), so the audio has no
third-party licence. The sound effects are offline ports of DIDIK's own Web Audio sounds in
live/web/src/lib/sound.ts (same notes, waves, lengths and slides), so the promo sounds like the app.

    python generate.py promo  out/music-promo.wav   [seconds]   # 120 BPM, builds to an ending sting
    python generate.py hype   out/music-hype.wav               # 60 s, the energetic cut (battle theme at 36 s)
    python generate.py bed    out/music-bed.wav     seconds     # calmer loop for the feature demo
    python generate.py sfx    out/sfx/                          # one WAV per effect

120 BPM keeps one beat at exactly 15 frames at 30 fps, so cuts can sit on the beat.
"""

from __future__ import annotations

import sys
import wave
from pathlib import Path

import numpy as np

SR = 48_000
BPM = 120
BEAT = 60 / BPM
rng = np.random.default_rng(7)


# ---------------------------------------------------------------- voices

def env(n: int, attack: float = 0.004, release: float = 0.05, sustain: float = 1.0) -> np.ndarray:
    a = max(1, int(attack * SR))
    r = max(1, min(n - a, int(release * SR)))
    e = np.full(n, sustain, dtype=np.float64)
    e[:a] = np.linspace(0, sustain, a)
    e[n - r:] *= np.linspace(1, 0, r)
    return e


def osc(freq, dur: float, wave_: str = "square", duty: float = 0.5) -> np.ndarray:
    n = int(dur * SR)
    f = np.broadcast_to(np.asarray(freq, dtype=np.float64), (n,)) if np.ndim(freq) else np.full(n, float(freq))
    phase = np.cumsum(f / SR) % 1.0
    if wave_ == "square":
        return np.where(phase < duty, 1.0, -1.0)
    if wave_ == "triangle":
        return 4 * np.abs(phase - 0.5) - 1
    if wave_ == "saw":
        return 2 * phase - 1
    raise ValueError(wave_)


def tone(freq: float, dur: float, wave_: str = "square", gain: float = 0.25, slide_to: float | None = None,
         duty: float = 0.5, release: float = 0.04) -> np.ndarray:
    n = int(dur * SR)
    if slide_to:
        # sound.ts slides in semitone steps, which gives the chiptune "stair" sound
        steps = max(2, int(abs(12 * np.log2(slide_to / freq))))
        semis = np.linspace(0, 12 * np.log2(slide_to / freq), steps)
        idx = np.minimum((np.arange(n) * steps) // n, steps - 1)
        f = freq * 2 ** (semis[idx] / 12)
    else:
        f = freq
    return osc(f, dur, wave_, duty) * env(n, release=release) * gain


def noise(dur: float, gain: float = 0.25, hold: int = 3, lowpass: float | None = None, highpass: float | None = None) -> np.ndarray:
    n = int(dur * SR)
    raw = rng.uniform(-1, 1, n // hold + 1).repeat(hold)[:n]  # sample-and-hold, like a chip noise channel
    if lowpass:
        raw = one_pole(raw, lowpass)
    if highpass:
        raw = raw - one_pole(raw, highpass)
    return raw * env(n, attack=0.001, release=dur * 0.8) * gain


def one_pole(x: np.ndarray, cutoff: float) -> np.ndarray:
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):  # short buffers only
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def place(track: np.ndarray, clip: np.ndarray, at: float) -> None:
    i = int(at * SR)
    if i >= len(track):
        return
    j = min(len(track), i + len(clip))
    track[i:j] += clip[: j - i]


def note(name: str) -> float:
    names = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}
    pitch, octave = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((names[pitch] + 12 * (octave + 1) - 69) / 12)


# ---------------------------------------------------------------- sound effects (ports of sound.ts)

C5, E5, G5, C6 = 523.25, 659.25, 783.99, 1046.5


def sfx_bank() -> dict[str, np.ndarray]:
    def mix(*parts: tuple[float, np.ndarray]) -> np.ndarray:
        length = max(int(at * SR) + len(c) for at, c in parts)
        out = np.zeros(length)
        for at, c in parts:
            place(out, c, at)
        return out

    return {
        "tap": tone(880, 0.04, gain=0.14),
        "pop": tone(392, 0.1, gain=0.22, slide_to=988),
        "join": mix((0, tone(C5, 0.07, gain=0.2)), (0.07, tone(G5, 0.12, gain=0.2))),
        "correct": mix(*[(i * 0.065, tone(f, 0.12, gain=0.22)) for i, f in enumerate([C5, E5, G5, C6])]),
        "go": mix(*[(0, tone(f, 0.3, gain=0.12)) for f in (C5, E5, G5)], (0.12, tone(C6, 0.36, gain=0.14))),
        "coin": mix((0, tone(988, 0.06, gain=0.12)), (0.06, tone(1319, 0.2, gain=0.12))),
        "whoosh": noise(0.34, 0.2, hold=2, highpass=500),
        "key": mix(*[(i * 0.08, tone(f, 0.14, gain=0.16)) for i, f in enumerate([G5, C6, 1568])]),
        "harvest": mix((0, tone(G5, 0.08, gain=0.18)), (0.08, tone(C6, 0.1, gain=0.18)), (0.18, tone(1568, 0.22, gain=0.14))),
        "fanfare": mix(*[(t, tone(f, 0.55 if i == 5 else 0.1, gain=0.2)) for i, (f, t) in enumerate(zip([G5, G5, G5, C6, G5, C6], [0, 0.12, 0.24, 0.42, 0.66, 0.8]))]),
        "tiles": mix(*[(i * 0.05, tone(f, 0.08, gain=0.12)) for i, f in enumerate([E5, G5, C6])]),
        "sticker": tone(560, 0.09, gain=0.16, slide_to=1100),
        # cartoon accents for the energetic cut
        "impact": mix((0, tone(110, 0.45, "triangle", 0.9, slide_to=38, release=0.3)), (0, noise(0.35, 0.5, hold=3, lowpass=900)),
                      (0.0, tone(55, 0.6, "triangle", 0.5, release=0.4))),
        "zap": mix((0, tone(1900, 0.22, "square", 0.25, slide_to=180)), (0, noise(0.25, 0.25, hold=1, highpass=3000)),
                   (0.08, tone(2400, 0.18, "saw", 0.12, slide_to=300))),
        "sparkle": mix(*[(i * 0.045, tone(f, 0.16, "triangle", 0.22, release=0.12)) for i, f in enumerate([1046.5, 1318.5, 1568.0, 2093.0, 2637.0])]),
        "boing": tone(180, 0.32, "triangle", 0.55, slide_to=720, release=0.2),
        "bubble": tone(520, 0.08, "triangle", 0.5, slide_to=1400),
        "swoosh": noise(0.32, 0.35, hold=1, highpass=1400) * np.linspace(0.2, 1, int(0.32 * SR)) ** 0.5,
        "riser": noise(1.5, 0.3, hold=1, highpass=800) * np.linspace(0.05, 1, int(1.5 * SR)) ** 2,
        "clap": mix((0, noise(0.03, 0.5, hold=1, highpass=1500)), (0.012, noise(0.03, 0.45, hold=1, highpass=1500)), (0.026, noise(0.16, 0.4, hold=1, highpass=1200))),
        "magic": mix(*[(i * 0.03, tone(f, 0.7, "triangle", 0.1, release=0.6)) for i, f in enumerate([659.25, 830.6, 987.8, 1318.5, 1661.2])]),
    }


# ---------------------------------------------------------------- music

# I – vi – IV – V in C, two bars each chord pattern of 4 beats
PROG = [("C", ["C3", "E3", "G3"]), ("A", ["A2", "C3", "E3"]), ("F", ["F2", "A2", "C3"]), ("G", ["G2", "B2", "D3"])]
ROOT = {"C": "C2", "A": "A1", "F": "F2", "G": "G2"}

# Hook melody, one bar per chord (8th notes, None = rest). Written for this video.
HOOK = [
    ["E5", None, "G5", "E5", "D5", "C5", "D5", "E5"],
    ["C5", None, "E5", "C5", "A4", None, "C5", None],
    ["A4", "C5", "F5", "E5", "D5", "C5", "A4", "C5"],
    ["D5", None, "B4", "D5", "G5", None, "F5", "D5"],
]
HOOK_B = [
    ["G5", "E5", "G5", "A5", "G5", "E5", "D5", "E5"],
    ["C6", None, "A5", "G5", "E5", None, "C5", "E5"],
    ["F5", "A5", "C6", "A5", "G5", "F5", "E5", "F5"],
    ["G5", None, "D5", "G5", "B5", None, "G5", None],
]


def render_bar(track, t0, chord, *, bass=True, arp=True, lead=None, drums=1, lead_gain=0.11, pad=False):
    name, triad = chord
    eighth = BEAT / 2
    if bass:
        root = note(ROOT[name])
        for b in range(4):
            place(track, tone(root, BEAT * 0.9, "triangle", 0.30, release=0.08), t0 + b * BEAT)
            place(track, tone(root * 2, eighth * 0.6, "triangle", 0.16), t0 + b * BEAT + eighth)
    if arp:
        seq = [triad[0], triad[1], triad[2], triad[1]] * 4
        for i, n_ in enumerate(seq):
            f = note(n_) * 2
            place(track, tone(f, BEAT / 4 * 0.85, "square", 0.035, duty=0.25), t0 + i * BEAT / 4)
    if pad:
        for n_ in triad:
            place(track, tone(note(n_) * 2, BEAT * 4, "triangle", 0.03, release=0.6), t0)
    if lead:
        for i, n_ in enumerate(lead):
            if n_:
                place(track, tone(note(n_), eighth * 0.92, "square", lead_gain, duty=0.5), t0 + i * eighth)
                place(track, tone(note(n_) * 1.003, eighth * 0.92, "square", lead_gain * 0.35, duty=0.125), t0 + i * eighth + 0.012)
    if drums:
        for b in range(4):
            if drums >= 1 and b % 2 == 0:
                place(track, tone(130, 0.12, "triangle", 0.5, slide_to=45) + 0, t0 + b * BEAT)  # kick, as sound.ts "kick"
            if drums >= 1 and b % 2 == 1:
                place(track, noise(0.12, 0.22, hold=2, highpass=1200), t0 + b * BEAT)  # snare
            if drums >= 2:
                for h in range(2):
                    place(track, noise(0.03, 0.07, hold=1, highpass=5000), t0 + b * BEAT + h * eighth)


def promo(seconds: float = 60.0) -> np.ndarray:
    track = np.zeros(int((seconds + 2) * SR))
    bar = BEAT * 4
    t = 0.0
    sfx = sfx_bank()
    # 0–4 s: hook. Two bars of arp and a rising whoosh into a hit at 4.0 s
    for i in range(2):
        render_bar(track, t, PROG[i * 2], bass=False, arp=True, drums=0, pad=True)
        t += bar
    place(track, noise(1.0, 0.18, hold=2, highpass=600) * np.linspace(0.2, 1, int(1.0 * SR)), 3.0)
    # 4–20 s: verse (A melody)
    for i in range(8):
        render_bar(track, t, PROG[i % 4], lead=HOOK[i % 4] if i >= 4 else None, drums=1, lead_gain=0.08 if i < 4 else 0.1)
        t += bar
    # 20–36 s: chorus (B melody, hats)
    for i in range(8):
        render_bar(track, t, PROG[i % 4], lead=HOOK_B[i % 4], drums=2)
        t += bar
    # 36–44 s: breakdown, lighter, for the story section
    for i in range(4):
        render_bar(track, t, PROG[i % 4], bass=True, arp=True, drums=0, pad=True, lead=HOOK[i % 4], lead_gain=0.06)
        t += bar
    # 44–56 s: final chorus
    for i in range(6):
        render_bar(track, t, PROG[i % 4], lead=HOOK_B[i % 4] if i < 4 else HOOK[i % 4], drums=2)
        t += bar
    # 56 s: ending sting (the app's own fanfare, an octave chord, then ring out)
    place(track, sfx["fanfare"] * 1.2, t)
    for n_ in ("C4", "E4", "G4", "C5"):
        place(track, tone(note(n_), 2.6, "square", 0.05, release=2.0, duty=0.25), t + 1.0)
    place(track, tone(note("C2"), 2.6, "triangle", 0.3, release=2.0), t + 1.0)
    return finish(track[: int(seconds * SR)], fade_out=1.2)


# The battle theme for Story Mode: A minor, i – VI – VII – V (Am F G E), heroic square lead.
BATTLE = [("A", ["A2", "C3", "E3"]), ("F", ["F2", "A2", "C3"]), ("G", ["G2", "B2", "D3"]), ("E", ["E2", "G#2", "B2"])]
ROOT.update({"E": "E2"})
BATTLE_LEAD = [
    ["A4", None, "E5", "A5", "G5", "E5", "C5", "E5"],
    ["F5", None, "C5", "F5", "A5", None, "G5", "F5"],
    ["G5", None, "D5", "G5", "B5", "A5", "G5", "D5"],
    ["E5", "G#5", "B5", "E6", "D6", "B5", "G#5", "E5"],
]


def hats16(track, t0, gain=0.06):
    for i in range(16):
        accent = 1.0 if i % 4 == 2 else 0.6
        place(track, noise(0.025, gain * accent, hold=1, highpass=6000), t0 + i * BEAT / 4)


def hype(seconds: float = 60.0) -> np.ndarray:
    """The energetic promo score. Section map (s): 0–4 hook, 4–18 verse, 18–22 build, 22–36 chorus,
    36–48 battle theme, 48–56 final chorus, 56–60 fanfare. One bar = 2 s = 60 frames."""
    track = np.zeros(int((seconds + 3) * SR))
    bar = BEAT * 4
    sfx = sfx_bank()
    clap = sfx["clap"]

    def bars(start, count, fn):
        for i in range(count):
            fn(start + i * bar, i)

    # 0–4 s: hook. Drums from the first frame, bright arp, a riser into the 4.0 s hit
    def hook(t, i):
        render_bar(track, t, PROG[i * 2 % 4], bass=True, arp=True, drums=2, lead=HOOK_B[i * 2 % 4], lead_gain=0.07)
        hats16(track, t, 0.05)
    bars(0.0, 2, hook)
    place(track, sfx["riser"] * 0.9, 2.5)
    place(track, sfx["impact"] * 0.8, 4.0)
    # 4–18 s: verse, lead A, claps on 2 and 4
    def verse(t, i):
        render_bar(track, t, PROG[i % 4], lead=HOOK[i % 4], drums=2, lead_gain=0.095)
        hats16(track, t, 0.045)
        for b in (1, 3):
            place(track, clap * 0.55, t + b * BEAT)
    bars(4.0, 7, verse)
    # 18–22 s: build. Snare roll speeding up, riser, then the drop at 22 s
    def build(t, i):
        render_bar(track, t, PROG[(i + 2) % 4], arp=True, bass=True, drums=0, pad=True)
        n = 8 if i == 0 else 16
        for k in range(n):
            place(track, noise(0.06, 0.12 + 0.18 * (i * n + k) / 24, hold=2, highpass=900), t + k * bar / n)
    bars(18.0, 2, build)
    place(track, sfx["riser"] * 1.1, 20.5)
    place(track, sfx["impact"], 22.0)
    # 22–36 s: chorus, lead B doubled an octave down
    def chorus(t, i):
        render_bar(track, t, PROG[i % 4], lead=HOOK_B[i % 4], drums=2, lead_gain=0.1)
        render_bar(track, t, PROG[i % 4], bass=False, arp=False, drums=0, lead=[n_[:-1] + str(int(n_[-1]) - 1) if n_ else None for n_ in HOOK_B[i % 4]], lead_gain=0.05)
        hats16(track, t, 0.055)
        for b in (1, 3):
            place(track, clap * 0.7, t + b * BEAT)
    bars(22.0, 7, chorus)
    place(track, sfx["riser"] * 0.9, 34.5)
    # 36–48 s: battle theme. Booming toms on every beat, heroic lead from 38 s
    def battle(t, i):
        render_bar(track, t, BATTLE[i % 4], bass=True, arp=True, drums=1, pad=True, lead=BATTLE_LEAD[i % 4] if i >= 1 else None, lead_gain=0.1)
        for b in range(4):
            place(track, tone(98 if b % 2 == 0 else 82, 0.3, "triangle", 0.45, slide_to=50), t + b * BEAT)
        hats16(track, t, 0.04)
    bars(36.0, 6, battle)
    place(track, sfx["impact"], 36.0)
    place(track, sfx["riser"] * 0.9, 46.5)
    # 48–56 s: final chorus
    bars(48.0, 4, chorus)
    place(track, sfx["impact"] * 0.9, 48.0)
    # 56 s: the app's fanfare, then a ringing chord
    t = 56.0
    place(track, sfx["fanfare"] * 1.2, t)
    for n_ in ("C4", "E4", "G4", "C5"):
        place(track, tone(note(n_), 2.8, "square", 0.05, release=2.2, duty=0.25), t + 1.0)
    place(track, tone(note("C2"), 2.8, "triangle", 0.3, release=2.2), t + 1.0)
    place(track, sfx["sparkle"] * 0.6, t + 1.0)
    return finish(track[: int(seconds * SR)], fade_out=1.0)


def bed(seconds: float) -> np.ndarray:
    """A calmer loop for the feature demo: no lead on most bars, light drums, so narration captions read well."""
    track = np.zeros(int((seconds + 3) * SR))
    bar = BEAT * 4
    t, i = 0.0, 0
    while t < seconds + 1:
        section = (i // 16) % 2
        render_bar(track, t, PROG[i % 4], arp=True, pad=True, drums=1 if section else 0,
                   lead=HOOK[i % 4] if (i % 16) >= 12 else None, lead_gain=0.05)
        t += bar
        i += 1
    return finish(track[: int(seconds * SR)], fade_out=3.0) * 0.8


def finish(x: np.ndarray, fade_out: float) -> np.ndarray:
    n = int(fade_out * SR)
    x[-n:] *= np.linspace(1, 0, n) ** 1.5
    x[: int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))
    peak = np.max(np.abs(x)) or 1
    return np.tanh(x / peak * 1.4) * 0.85  # gentle saturation, then -1.4 dBFS ceiling


def write(path: Path, x: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    stereo = np.stack([x, x], axis=1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(stereo, -1, 1) * 32767).astype("<i2").tobytes())


if __name__ == "__main__":
    kind, out = sys.argv[1], Path(sys.argv[2])
    if kind == "promo":
        write(out, promo(float(sys.argv[3]) if len(sys.argv) > 3 else 60.0))
    elif kind == "hype":
        write(out, hype(float(sys.argv[3]) if len(sys.argv) > 3 else 60.0))
    elif kind == "bed":
        write(out, bed(float(sys.argv[3])))
    elif kind == "sfx":
        for name, clip in sfx_bank().items():
            peak = np.max(np.abs(clip)) or 1
            write(out / f"{name}.wav", np.concatenate([clip / peak * 0.8, np.zeros(int(0.05 * SR))]))
    else:
        raise SystemExit(__doc__)
    print("wrote", out)
