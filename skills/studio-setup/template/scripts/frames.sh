#!/usr/bin/env bash
# Usage: scripts/frames.sh <video.mp4> <outdir> [fps=1]
# One frame per second plus 5x3 contact sheets with timestamps, for reviewing a render (or a reference video).
set -euo pipefail
v="$1"; out="$2"; fps="${3:-1}"
mkdir -p "$out/frames" "$out/sheets"
ffmpeg -v error -y -i "$v" -vf "fps=$fps" -q:v 3 "$out/frames/f_%03d.jpg"
font=$(fc-match -f '%{file}' sans 2>/dev/null || true)
dt="drawtext=text='%{eif\:t\:d}s':x=6:y=6:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.7"
[ -n "$font" ] && dt="drawtext=fontfile=$font:text='%{eif\:t\:d}s':x=6:y=6:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.7"
ffmpeg -v error -y -i "$v" -vf "fps=$fps,scale=240:-1,$dt,tile=5x3" -q:v 3 "$out/sheets/sheet_%02d.jpg"
echo "$(ls "$out/frames" | wc -l) frames, $(ls "$out/sheets" | wc -l) sheets in $out"
