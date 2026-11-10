---
name: new-video
description: Make a complete 9:16 illustrated explainer video (brand history, "what happened to X", "X success story", how something works) from a topic, end to end with review gates. Use when the user asks to make, create or produce an explainer video, a reel/short in the reference channel style, or runs /new-video.
argument-hint: "<topic> [--look storybook|sketch] [--arc decline|success|explain] [--seconds 100]"
---

# Make an explainer video

Run inside an Explainer Studio workspace (a folder with `studio.json`). If there is none, run the
`studio-setup` skill first. Read the workspace `CLAUDE.md` and `reference/channel-formula.md`.

Parse `$ARGUMENTS`: topic, look (default storybook), arc (pick from the topic: decline for "what
happened to…", success for growth stories, explain otherwise), target seconds (default 100).
Make a slug (kebab-case, ≤ 30 chars) and `projects/<slug>/brief.md` with these choices.

Track the stages with a task list. Stop at each **GATE**, show the artefact briefly, and wait for
the user's go-ahead or edits (skip gates only if the user said to run without stopping).

1. **Research**: `research` skill → `research.md`. Then the `fact-checker` agent.
2. **Script**: `script` skill → `script.md`. **GATE**.
3. **Beats**: `beats` skill → `beats.json`; `node scripts/validate.mjs <slug>`. **GATE**.
4. **Style**: copy `presets/<look>.json` to `style.json`; adjust palette to the subject (hero
   colour = the brand/product colour). Render 2 style frames later with the first assets.
5. **Assets**: `assets` skill (parallel `svg-artist` agents). Validate shows no missing assets.
   Show the user a contact image of the hero and 4 key props. **GATE**.
6. **Voice + timing**: `voice` skill → `voice.mp3`, `words.json`, `timed-beats.json`.
7. **Scenes**: `scenes` skill → `Video.tsx`, registered in `src/registry.ts`; `npx tsc --noEmit`.
8. **Draft + QC**: `qc` skill (draft render, sheets, `qc-reviewer` agent, fix loop ≤ 3).
9. **Final**: full-resolution render to `out/<slug>.mp4`. Send the file and the QC summary. **GATE**.

Finish with: the video path, length, word count, sources used, anything still placeholder
(silent voice, missing music/SFX).
