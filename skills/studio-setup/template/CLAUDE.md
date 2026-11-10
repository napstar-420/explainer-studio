# Explainer Studio workspace

This folder makes 9:16 illustrated explainer videos (90–110 s, English narration) in the style
analysed in `reference/`: flat illustration on cream paper, one visual metaphor per sentence,
keyword titles, calm narrator. Claude Code drives the pipeline; Remotion renders.

Read `reference/channel-formula.md` before writing a script, a beat sheet or scenes.

## Pipeline (one folder per video: `projects/<slug>/`, assets in `public/<slug>/`)

1. `brief.md` → `research.md` (facts with sources) → `script.md` (arc, 170–230 words).
2. `beats.json`: one beat per sentence; `line` is the exact narration; cue phrases are words from it.
3. `style.json`: copy `presets/storybook.json` or `presets/sketch.json`.
4. Assets: one SVG per prop in `public/<slug>/assets/<prop>.svg`, named as in `beats.json` `props`.
5. Voice: `node scripts/tts.mjs <slug>` → `python3 scripts/words.py <slug>` (skip words.py for
   `--provider silent`, which writes estimated timings).
6. `node scripts/timing.mjs <slug>` → `timed-beats.json`.
7. `projects/<slug>/Video.tsx` composes `src/lib` components; register it in `src/registry.ts`.
8. Draft: `npx remotion render src/index.ts <slug> out/<slug>-draft.mp4 --scale=0.5`.
9. QC: `scripts/frames.sh out/<slug>-draft.mp4 out/<slug>-qc` and review the sheets against the beats.
10. Final: `npx remotion render src/index.ts <slug> out/<slug>.mp4`.

`node scripts/validate.mjs <slug>` checks beats/style/assets at any point. `npx tsc --noEmit`
typechecks scenes. `npm run studio` opens the Remotion preview.

## Rules

- Never edit narration in `timed-beats.json`; change `beats.json` and rerun tts → words → timing.
- All timing comes from cue words (`useBeat(id).at('phrase')`); never hard-code seconds.
- Coordinates: the frame is 1080×1920. Storybook look: lay scenes out in one `<World>` and move
  the camera. Sketch look: `<Scene>` per beat with cuts. Titles live in screen space, top area
  (y 200–420): keep props out of it.
- Reuse `src/lib` components; add a new generic component there (with a one-line doc comment)
  instead of one-off code in a scene when a motion will be reused.
- SVGs: flat fills from `style.json` palette, ink outlines at `stroke` width, round joins, no
  gradients except subtle highlights, no text baked in unless it is a label on the object.
- Facts need sources in `research.md`. Use generic figures for real people and your own or
  permitted logos.
- Keys (`ELEVENLABS_API_KEY`, `OPENAI_API_KEY`) come from the environment; never write them to files.
- In a locked-down environment set `REMOTION_BROWSER_EXECUTABLE` to an installed Chrome/Chromium.
