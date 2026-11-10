#!/usr/bin/env python3
"""Word timestamps for public/<slug>/voice.mp3 -> public/<slug>/words.json, with faster-whisper.

Usage: python3 scripts/words.py <slug> [--model small|medium|<dir>] [--language en]
Needs: pip install faster-whisper, and ffmpeg on PATH. The model downloads on first use
(or pass --model with a local CTranslate2 model directory).
"""
import argparse, json, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel

ap = argparse.ArgumentParser()
ap.add_argument("slug")
ap.add_argument("--model", default="small")
ap.add_argument("--language", default="en")  # English narration for every market
a = ap.parse_args()

audio = f"public/{a.slug}/voice.mp3"
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", audio, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"], check=True, capture_output=True).stdout
samples = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768

try:
    beats = json.load(open(f"projects/{a.slug}/beats.json"))
    prompt = " ".join(b["line"] for b in beats["beats"])[:800]
except Exception:
    prompt = None

model = WhisperModel(a.model, device="cpu", compute_type="int8")
segments, _ = model.transcribe(samples, language=a.language, word_timestamps=True, initial_prompt=prompt, beam_size=5)
words = [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for s in segments for w in (s.words or [])]
json.dump(words, open(f"public/{a.slug}/words.json", "w"))
print(f"public/{a.slug}/words.json: {len(words)} words, {words[-1]['e'] if words else 0}s. Next: node scripts/timing.mjs {a.slug}", file=sys.stderr)
