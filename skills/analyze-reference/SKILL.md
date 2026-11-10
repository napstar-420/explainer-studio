---
name: analyze-reference
description: Break down a reference video (frames every second, contact sheets, transcript with translation, shot-by-shot breakdown) and add what it teaches to the channel formula. Use when the user shares a video to learn a style from, asks to break down / analyse a video, or to extract frames from one.
argument-hint: "<path to video> [name]"
---

# Analyse a reference video

Work in the workspace. Name = `$ARGUMENTS` second word or a slug from the file name.
Output folder: `reference/<name>/`.

1. `ffprobe` for duration, size, fps. `scripts/frames.sh <video> reference/<name> 1` (frames +
   timestamped sheets). Detect hard cuts:
   `ffmpeg -i <video> -vf "select='gt(scene,0.3)',showinfo" -an -f null - 2>&1 | grep pts_time`.
2. Transcribe: `python3 scripts/transcribe-reference.py <video> reference/<name>` (original
   language), or `node scripts/transcribe-voicestudio.mjs <video> reference/<name>` when the
   VoiceStudio app is running; if not English, also with `--translate`, then write your own faithful English line
   by line from the original (Whisper's translation is a draft only). Save
   `reference/<name>/transcript.md`: full English script; table of lines with times, English,
   on-screen text, original. Compute words, speaking wpm, lines, average line length.
3. Read every sheet. Write `reference/<name>/breakdown.json`: format, sections (arc), shots
   (time, visual, on-screen text, camera, transition, notes), narration, text style, SFX guesses,
   pacing. Remove `frames/` afterwards unless the user wants them (sheets are enough).
4. Update `reference/channel-formula.md`: add a column to the comparison table, new arc steps,
   new metaphors (idea → metaphor → component), rules that changed. If a metaphor needs a new
   motion, note `New:<Component>` for the `scenes` skill.
   Note the reference's market; if it is a new market, offer to start a market pack for it
   (`markets/<code>/market.md` + `voice.json`, copied from `uk/`).
5. Tell the user what is new compared with the existing references.
