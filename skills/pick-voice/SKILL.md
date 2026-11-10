---
name: pick-voice
description: List the narrator voices available from ElevenLabs and VoiceStudio and let the user pick one (with optional previews), then save it as the market's narrator. Use when the user wants to choose, change or preview the voice, during setup, or whenever tts reports NO_VOICE_CHOSEN or no voice has been chosen yet.
argument-hint: "[--market uk|pk]"
---

Read [host compatibility guidance](../../HOSTS.md) before running this workflow.

# Pick the narrator voice

Run in the workspace (folder with `studio.json`). Market: `--market` from `$ARGUMENTS`, else the
workspace default.

1. `node scripts/set-voice.mjs --status --json` (current choice, what is available) and
   `node scripts/set-voice.mjs --list --json` (voices; `recommended` = matches the market accent,
   listed first).
2. If no voices: explain the two ways to get one and stop: set `ELEVENLABS_API_KEY`, or open the
   VoiceStudio app and save/design a voice (a British narrator for the UK) — VoiceStudio is
   expected at `http://localhost:3900` (`VOICESTUDIO_URL` otherwise; `OMNIVOICE_API_KEY` if it
   is protected). Show any `errors`.
3. Ask with the AskUserQuestion tool: "Which voice should narrate your <market> videos?" with up to
   4 options: recommended voices first, then others; label = voice name, description = provider,
   accent, gender and its description (mark the current choice "(current)"). Say in the question
   that they can pick Other and type a voice name or id from the full list, and offer
   "Hear previews first" as one of the options when there are 2+ candidates.
   - If they want previews: `node scripts/set-voice.mjs --preview <provider> <id>` for each of the
     top candidates (each costs a few seconds of TTS), tell them the files in `out/`, then ask again.
   - If they type a name/id under Other, match it against the full list (case-insensitive name or
     exact id); if ambiguous, ask once more.
4. Save: `node scripts/set-voice.mjs <provider> <id>` (add `--market <code>` if not the default).
   This sets `provider` and the voice in `markets/<market>/voice.json`.
5. Confirm in one line: "<name> (<provider>) will narrate <market> videos." If a video is in
   progress, offer to re-voice it (voice skill).
