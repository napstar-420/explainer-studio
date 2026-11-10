---
name: revise
description: Apply a change request to an existing explainer video (script line, timing, a beat's visuals, style, voice) and re-render only what is needed. Use when the user asks to change, fix or tweak a video that already exists in projects/.
argument-hint: "<slug> <what to change>"
---

# Revise a video

Find what the change touches and redo only the downstream steps:

| Change | Redo |
|---|---|
| Narration wording | `beats.json` line(s) → voice → words → timing → check scenes still fit → render |
| Title / underline | `beats.json` → timing → render |
| A beat's visuals or motion | `Video.tsx` (and assets) → still check → render |
| A prop's drawing | SVG → render |
| Palette / font | `style.json` → render |
| Voice choice | tts with new voice → words → timing → render |

Render a draft, run the `qc` skill on the changed time range (look at those sheets), then the
final render. Summarise what changed.
