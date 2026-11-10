---
name: studio-setup
description: Set up an Explainer Studio workspace (Remotion project, scripts, reference analyses, demos) in a folder so illustrated explainer videos can be made. Use when the user says "set up the studio", "install explainer studio", "create a video workspace", or before /new-video when no studio.json exists.
argument-hint: "[target folder, default ./explainer-studio-workspace]"
---

# Set up the Explainer Studio workspace

The workspace template is in the `template/` folder next to this SKILL.md (this skill's base
directory). Copy it, install, and prove a render works.

1. Target: `$ARGUMENTS` if given, else `./explainer-studio-workspace`. If the target already has
   `studio.json`, it is already a workspace: run the `update-studio` skill on it instead and stop.
   If the target exists and is not empty, ask before writing into it.
2. Copy: `cp -R "<base dir>/template/." "<target>/"` (include dotfiles). Then `cd` into it and
   `git init` if it is not already in a repo.
3. Check tools and report each as ok / missing with the install hint:
   - `node -v` ≥ 18 (needed), `ffmpeg -version` (needed for audio, QC sheets),
   - `python3 -c "import faster_whisper"` (word timings; `pip3 install faster-whisper`; optional
     if VoiceStudio is used for speech-to-text),
   - voice providers (at least one for a real voice; without either, voices are silent
     placeholders with estimated timings):
     - ElevenLabs: whether `ELEVENLABS_API_KEY` is set. Check only that it is set; never print it.
     - VoiceStudio: `curl -s -m 2 ${VOICESTUDIO_URL:-http://localhost:3900}/health` (the app open).
4. `npm install` in the workspace.
5. Prove it: `node scripts/tts.mjs demo --provider silent && node scripts/timing.mjs demo`,
   then `npx remotion still src/index.ts demo out/demo.png --frame=90`. If Chrome can't be
   downloaded (offline/locked-down), find an installed Chrome/Chromium and set
   `REMOTION_BROWSER_EXECUTABLE` to it, then retry. Look at `out/demo.png`.
6. Voice: if ElevenLabs or VoiceStudio is available, run the `pick-voice` skill now so the user
   chooses the narrator from a list. Otherwise say videos will use a silent placeholder until a
   provider is set up, then `/explainer-studio:pick-voice`.
7. Market: the workspace defaults to the UK (`"market": "uk"` in `studio.json`); ask only if the
   user mentioned another audience, and set it.
8. Tell the user: where the workspace is, what passed or is missing, and how to start:
   `/explainer-studio:new-video <topic>` (run Claude Code from the workspace folder so its
   CLAUDE.md loads), plus `npm run studio` for the live preview.
