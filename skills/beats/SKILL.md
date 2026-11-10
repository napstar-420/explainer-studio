---
name: beats
description: Turn an explainer script into projects/<slug>/beats.json (one beat per sentence with title, metaphor, props, camera, motion cues). Use for the beat-sheet stage or when asked to plan shots for a video.
---

# Beat sheet

Read `script.md`, `reference/channel-formula.md` and one reference `breakdown.json` for the same
look. Write `projects/<slug>/beats.json` matching `scripts/schemas.mjs`:

```json
{ "slug": "...", "title": "...", "fps": 30, "beats": [ {
  "id": "b01", "line": "<exact sentence>", "cue": "<first words, optional>",
  "title": ["Short title"], "underline": "word",
  "metaphor": "...", "region": "desk", "props": ["hero", "cup"],
  "camera": "push in to the cup", "transition": "follow hero",
  "motion": [{ "use": "Swarm", "target": "hero", "at": "<words from line>" }],
  "sfx": [{ "file": "whoosh.mp3", "at": "<words from line>" }]
} ] }
```

- `line` is exactly the narration (punctuation included). Every `cue`/`at` is a phrase copied
  from that line: it is when the event happens.
- Titles: 1–4 words from the line; add a second line by putting it as the next array item.
- `props`: kebab-case ids, reused across beats (the hero especially). Aim for 25–45 unique props.
- `motion.use` names a `src/lib` component (World camera, FollowPath, Orbit, Swarm, YearDial,
  Burst, DrawCircle, SmokeWipe, Clipping, Scene, Bubble, Checklist, LineChart, Arrow, Scale,
  Network, Counter, Strike, Polaroid) or `New:<Name>` with a note if a new generic one is needed.
- Storybook look: give each beat a `region` and plan the world layout (regions stacked or side by
  side; transitions are camera moves). Sketch look: one scene per beat, cuts.
- Plan at least one callback (an early scene reused near the end).

Run `node scripts/validate.mjs <slug>` and fix every error.
