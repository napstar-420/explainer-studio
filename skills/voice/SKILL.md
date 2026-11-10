---
name: voice
description: Create the narration audio, word timings and timed beats for an explainer video (tts.mjs, words.py, timing.mjs). Use for the voice-over stage or when the script or voice changes.
---

# Voice and timing

1. `node scripts/tts.mjs <slug>`: ElevenLabs if `ELEVENLABS_API_KEY` is set, else VoiceStudio if its
   backend answers (`VOICESTUDIO_URL`, default `http://localhost:3900`; `OMNIVOICE_API_KEY` if it is
   protected), else silent with estimated timings. Force with `--provider elevenlabs|voicestudio|silent`.
   VoiceStudio needs a saved voice: `node scripts/tts.mjs --list-voices voicestudio`, then set
   `voicestudio.voice` in the market's voice.json (or `VOICESTUDIO_VOICE`).
   The narrator comes from `markets/<market>/voice.json` (UK: British storyteller; the ElevenLabs
   voice ID and the VoiceStudio voice profile there). Follow the brief if it asks for another voice
   (set `ELEVENLABS_VOICE_ID` / `VOICESTUDIO_VOICE` or edit voice.json).
   If a key is missing, say so and continue with silent: the user can re-voice later.
2. Real voice only: `node scripts/words.mjs <slug>`: local faster-whisper by default (free, offline);
   `--provider voicestudio` uses VoiceStudio's speech-to-text instead (used automatically when
   faster-whisper isn't installed and VoiceStudio is running).
3. `node scripts/timing.mjs <slug>`; fix any "not heard" warnings by correcting the cue phrase in
   `beats.json` (or re-voicing if words were skipped), then rerun.
4. Report total length vs target; if it is >10 % off, offer to trim or extend the script.
