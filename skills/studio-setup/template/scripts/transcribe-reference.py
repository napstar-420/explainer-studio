#!/usr/bin/env python3
"""Transcribe any video/audio (e.g. a reference video) with timestamps, in its own language and/or translated to English.

Usage: python3 scripts/transcribe-reference.py <video-or-audio> <outdir> [--model small|<dir>] [--language ur] [--translate]
Writes <outdir>/transcript-<lang|en>.json (segments with word timings) and prints timed lines.
Whisper's English translation of other languages is rough: use it as a draft and correct it against
the original-language transcript.
"""
import argparse, json, os, subprocess
import numpy as np
from faster_whisper import WhisperModel

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("outdir")
ap.add_argument("--model", default="small"); ap.add_argument("--language", default=None)
ap.add_argument("--translate", action="store_true")
a = ap.parse_args()
os.makedirs(a.outdir, exist_ok=True)
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", a.src, "-vn", "-f", "s16le", "-ac", "1", "-ar", "16000", "-"], check=True, capture_output=True).stdout
samples = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
model = WhisperModel(a.model, device="cpu", compute_type="int8")
segs, info = model.transcribe(samples, language=a.language, task="translate" if a.translate else "transcribe", word_timestamps=True, beam_size=5)
out = []
for s in segs:
    out.append({"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip(), "words": [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for w in (s.words or [])]})
    print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}", flush=True)
name = "en" if a.translate else (a.language or info.language)
json.dump(out, open(f"{a.outdir}/transcript-{name}.json", "w"), ensure_ascii=False, indent=1)
