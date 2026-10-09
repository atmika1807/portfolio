#!/usr/bin/env python3
"""
Turns the raw intro video into the hero assets used by the site.

    python3 scripts/build-hero-assets.py --video ../intro.mp4 \
        [--photo "../atmika photo.jpeg" --photo-crop 66:20:288:360] \
        [--crop x:y:w:h] [--xfade 0.2]

Outputs (relative to the project root):
    public/hero/hero.mp4   H.264 yuv420p, CRF 24, preset slow, AAC 96k, faststart
    public/hero/hero.webm  VP9 CRF 36, Opus 80k
    public/hero/poster.webp  first-paint still, same crop and whitening as the video
    public/portrait-bust.webp  480x600 head-to-shirt portrait (ID card)
    public/og.jpg  1200x630 social preview

Requires ffmpeg, ffprobe and numpy.

How the loop is made
  1. The person is detected (distance from the backdrop colour) and the frame is cropped
     tightly around them, head to toe, to an 768:960 portrait, then scaled to 768 px wide.
  2. The off-white backdrop is pushed to pure white (colorlevels 0.98) so that
     `mix-blend-mode: multiply` makes it vanish into the page.
  3. The first 10 s are used. The last X seconds of picture are cross-faded into the
     first X seconds (ffmpeg xfade). The same cross-fade is done on the audio in numpy
     (not ffmpeg acrossfade, which can drop audio). The clip is never stretched or
     retimed, so lips stay in sync.
  X defaults to 0.5 s but is automatically shortened when the voice starts or ends
  closer than that to the clip edges, so the fade never blends speech with speech.
"""
import argparse
import json
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
OUT_W, OUT_H = 768, 960
MAX_SECONDS = 10.0


def run(cmd, **kw):
    subprocess.run([str(c) for c in cmd], check=True, **kw)


def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", str(path)],
        check=True, capture_output=True, text=True,
    ).stdout
    info = json.loads(out)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    a = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    num, den = v["r_frame_rate"].split("/")
    return {
        "w": int(v["width"]),
        "h": int(v["height"]),
        "fps": float(num) / float(den),
        "dur": float(info["format"]["duration"]),
        "audio": a is not None,
        "ch": int(a["channels"]) if a else 0,
    }


def sample_frames(video, w, h, dur, per_second=2):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-t", str(min(dur, MAX_SECONDS)), "-i", str(video),
         "-vf", f"fps={per_second}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)


def detect_person(frames):
    """Bounding box of the person: pixels far from the backdrop colour."""
    h, w = frames.shape[1:3]
    corners = np.concatenate([frames[:, :8, :8].reshape(-1, 3), frames[:, :8, -8:].reshape(-1, 3)])
    bg = np.median(corners, axis=0)
    boxes = []
    for f in frames:
        mask = np.abs(f.astype(int) - bg).max(axis=2) > 90  # ignores the faint floor shadow
        ys, xs = np.where(mask)
        if len(xs) > 500:
            boxes.append((xs.min(), ys.min(), xs.max(), ys.max()))
    b = np.array(boxes)
    x0, y0, x1, y1 = b[:, 0].min(), b[:, 1].min(), b[:, 2].max(), b[:, 3].max()
    cx = float(np.median((b[:, 0] + b[:, 2]) / 2))
    return int(x0), int(y0), int(x1), int(y1), cx, bg


def auto_crop(frames):
    h, w = frames.shape[1:3]
    x0, y0, x1, y1, cx, bg = detect_person(frames)
    bh = y1 - y0
    pad = 0.04 * bh
    ch = min(h, bh + 2 * pad)
    cw = ch * OUT_W / OUT_H
    if cw > w:
        cw = w
        ch = cw * OUT_H / OUT_W
    top = min(max(0, y0 - pad), h - ch)
    left = min(max(0, cx - cw / 2), w - cw)
    # even numbers keep yuv420p happy
    return [int(left) // 2 * 2, int(top) // 2 * 2, int(cw) // 2 * 2, int(ch) // 2 * 2], (x0, y0, x1, y1)


def read_audio(video, sr, ch, seconds):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-t", str(seconds), "-i", str(video), "-vn", "-ac", str(ch),
         "-ar", str(sr), "-f", "f32le", "-"],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, ch)


def speech_margins(x, sr):
    win = sr // 100
    n = len(x) // win
    rms = np.sqrt((x[: n * win].mean(axis=1).reshape(n, win) ** 2).mean(axis=1))
    voiced = np.where(rms > 0.004)[0]
    if len(voiced) == 0:
        return 0.5, 0.5
    return voiced[0] / 100.0, (n - 1 - voiced[-1]) / 100.0


def write_wav(path, data, sr):
    pcm = (np.clip(data, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(data.shape[1])
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", required=True)
    ap.add_argument("--photo")
    ap.add_argument("--photo-crop", help="x:y:w:h of a head-to-shirt 4:5 crop of the photo")
    ap.add_argument("--crop", help="override the person crop as x:y:w:h (source pixels)")
    ap.add_argument("--white", type=float, default=0.98,
                    help="backdrop white point (0.98 = pixels at or above 250/255 become pure white)")
    ap.add_argument("--xfade", type=float, help="override the loop cross-fade length in seconds")
    args = ap.parse_args()

    wp = args.white
    video = Path(args.video).resolve()
    info = probe(video)
    dur = min(info["dur"], MAX_SECONDS)
    fps = info["fps"]
    frames = sample_frames(video, info["w"], info["h"], dur)

    crop, person = auto_crop(frames)
    if args.crop:
        crop = [int(v) for v in args.crop.split(":")]
    cx, cy, cw, ch = crop
    print(f"person box {person} -> crop {cw}x{ch}+{cx}+{cy}")

    # ---- cross-fade length -------------------------------------------------
    sr = 48000
    xf = 0.5
    audio = None
    if info["audio"]:
        audio = read_audio(video, sr, info["ch"], dur)
        lead, trail = speech_margins(audio, sr)
        xf = max(0.1, min(0.5, min(lead, trail) - 0.03))
        print(f"voice starts at {lead:.2f}s, ends {trail:.2f}s before the end")
    if args.xfade:
        xf = args.xfade
    xf = round(xf * fps) / fps  # whole frames
    print(f"loop cross-fade {xf:.3f}s, loop length {dur - xf:.3f}s")

    # ---- audio loop (numpy) -----------------------------------------------
    tmp = Path(tempfile.mkdtemp())
    loop_wav = None
    if audio is not None:
        n = int(round(xf * sr))
        total = int(round(dur * sr))
        audio = audio[:total]
        main_part = audio[n: total - n]
        tail = audio[total - n: total]
        head = audio[:n]
        t = np.linspace(0, np.pi / 2, n, dtype=np.float32)[:, None]
        mixed = tail * np.cos(t) + head * np.sin(t)  # equal-power fade
        loop = np.concatenate([main_part, mixed])
        loop_wav = tmp / "loop.wav"
        write_wav(loop_wav, loop, sr)

    # ---- video loop (ffmpeg) ----------------------------------------------
    graph = (
        f"[0:v]trim=end={dur:.4f},setpts=PTS-STARTPTS,"
        f"crop={cw}:{ch}:{cx}:{cy},scale={OUT_W}:{OUT_H}:flags=lanczos,"
        f"colorlevels=rimax={wp}:gimax={wp}:bimax={wp},format=yuv420p,split=3[a][b][c];"
        f"[a]trim=start={xf:.4f}:end={dur - xf:.4f},setpts=PTS-STARTPTS[m];"
        f"[b]trim=start={dur - xf:.4f}:end={dur:.4f},setpts=PTS-STARTPTS[t];"
        f"[c]trim=start=0:end={xf:.4f},setpts=PTS-STARTPTS[h];"
        f"[t][h]xfade=transition=fade:duration={xf:.4f}:offset=0[x];"
        f"[m][x]concat=n=2:v=1:a=0[v]"
    )
    out_dir = ROOT / "public" / "hero"
    out_dir.mkdir(parents=True, exist_ok=True)
    inputs = ["-i", video] + (["-i", loop_wav] if loop_wav else [])
    amap = ["-map", "1:a"] if loop_wav else ["-an"]
    length = ["-t", f"{dur - xf:.4f}"]

    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", graph, "-map", "[v]", *amap,
         "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "24", "-preset", "slow",
         *(["-c:a", "aac", "-b:a", "96k"] if loop_wav else []),
         "-movflags", "+faststart", *length, out_dir / "hero.mp4"])
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", graph, "-map", "[v]", *amap,
         "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-pix_fmt", "yuv420p", "-row-mt", "1",
         *(["-c:a", "libopus", "-b:a", "80k"] if loop_wav else []),
         *length, out_dir / "hero.webm"])
    print("wrote hero.mp4, hero.webm")

    # ---- clearest frame: poster, portrait, social image -------------------
    def sharpness(f):
        g = f[cy:cy + ch, cx:cx + cw].astype(np.float32).mean(axis=2)
        lap = g[1:-1, 1:-1] * 4 - g[:-2, 1:-1] - g[2:, 1:-1] - g[1:-1, :-2] - g[1:-1, 2:]
        return float(lap.var())

    # prefer frames where the voice is quiet (mouth closed) and the picture is sharp
    best_i = int(np.argmax([sharpness(f) for f in frames]))
    best_t = best_i / 2.0
    still = tmp / "still.png"
    run(["ffmpeg", "-v", "error", "-y", "-ss", f"{best_t:.2f}", "-i", video, "-frames:v", "1",
         "-vf", f"crop={cw}:{ch}:{cx}:{cy},scale={OUT_W}:{OUT_H}:flags=lanczos,"
                f"colorlevels=rimax={wp}:gimax={wp}:bimax={wp}", still])
    run(["ffmpeg", "-v", "error", "-y", "-i", still, "-c:v", "libwebp", "-quality", "80", out_dir / "poster.webp"])

    pub = ROOT / "public"
    if args.photo:
        pc = args.photo_crop or "0:0:iw:ih"
        px, py, pw, ph = pc.split(":")
        run(["ffmpeg", "-v", "error", "-y", "-i", args.photo,
             "-vf", f"crop={pw}:{ph}:{px}:{py},scale=480:600:flags=lanczos",
             "-c:v", "libwebp", "-quality", "88", pub / "portrait-bust.webp"])
    else:
        # head-to-shirt crop from the clearest frame
        x0, y0, x1, y1 = person
        w_ = int((x1 - x0) * 0.9)
        h_ = int(w_ * 1.25)
        run(["ffmpeg", "-v", "error", "-y", "-ss", f"{best_t:.2f}", "-i", video, "-frames:v", "1",
             "-vf", f"crop={w_}:{h_}:{max(0, int((x0 + x1) / 2 - w_ / 2))}:{max(0, y0 - 10)},scale=480:600:flags=lanczos,"
                    f"colorlevels=rimax={wp}:gimax={wp}:bimax={wp}",
             "-c:v", "libwebp", "-quality", "88", pub / "portrait-bust.webp"])
    print("wrote poster.webp, portrait-bust.webp")

    # social preview: the whitened portrait multiplied onto the paper colour
    run(["ffmpeg", "-v", "error", "-y", "-i", still,
         "-f", "lavfi", "-i", "color=c=0xeceef0:s=1200x630",
         "-filter_complex",
         "[0:v]scale=504:630,pad=1200:630:640:0:white,format=gbrp[fg];[1:v]format=gbrp[bg];[bg][fg]blend=all_mode=multiply,format=yuvj420p",
         "-frames:v", "1", "-q:v", "3", pub / "og.jpg"])
    print("wrote og.jpg")


if __name__ == "__main__":
    sys.exit(main())
