---
name: voice
description: Create the narration audio, word timings and timed beats for an explainer video (tts.mjs, words.py, timing.mjs). Use for the voice-over stage or when the script or voice changes.
---

# Voice and timing

1. `node scripts/tts.mjs <slug>` (ElevenLabs if `ELEVENLABS_API_KEY` is set, else OpenAI if
   `OPENAI_API_KEY`, else silent with estimated timings). Force with `--provider`.
   The narrator comes from `markets/<market>/voice.json` (UK: British storyteller; ElevenLabs
   voice ID and OpenAI voice/instructions there). Follow the brief if it asks for another voice
   (set `ELEVENLABS_VOICE_ID` / `OPENAI_TTS_VOICE` or edit voice.json).
   If a key is missing, say so and continue with silent: the user can re-voice later.
2. Real voice only: `python3 scripts/words.py <slug>` (faster-whisper word timestamps).
3. `node scripts/timing.mjs <slug>`; fix any "not heard" warnings by correcting the cue phrase in
   `beats.json` (or re-voicing if words were skipped), then rerun.
4. Report total length vs target; if it is >10 % off, offer to trim or extend the script.
