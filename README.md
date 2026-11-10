# Explainer Studio for Claude Code

Make 9:16 illustrated explainer videos (90–110 s, English narration) end to end with Claude Code:
brand stories, "what happened to X?", success stories, how-it-works. Claude researches, writes the
script, plans every beat as a visual metaphor, draws the SVG props, voices it, animates it in
Remotion timed to the spoken words, renders it, and checks the result frame by frame.

The style is distilled from three analysed reference videos (included under
`skills/studio-setup/template/reference/`): flat illustration on cream paper, a hero object that
carries the story, keyword titles instead of captions, a calm narrator. Two looks ship:
**storybook** (rich flat colour, one continuous camera) and **sketch** (line art, cuts between
simple diagrams).

## Install

**From GitHub (recommended):** push this folder to a repo, then in Claude Code:

```
/plugin marketplace add <owner>/<repo>
/plugin install explainer-studio@explainer-studio
```

**Zero-click for a team:** add to a project's `.claude/settings.json`; everyone who opens the
project and trusts the folder is offered the plugin:

```json
{
  "extraKnownMarketplaces": { "explainer-studio": { "source": { "source": "github", "repo": "<owner>/<repo>" } } },
  "enabledPlugins": { "explainer-studio@explainer-studio": true }
}
```

**From the zip:** give the zip to Claude Code in a fresh session and say "install this". It follows
`INSTALL.md` (unzip → add as a local marketplace → install → set up the workspace).
Or by hand: unzip, then
`claude plugin marketplace add /path/to/explainer-studio` and
`claude plugin install explainer-studio@explainer-studio`.

## Use

```
/explainer-studio:studio-setup my-videos       # creates the Remotion workspace, installs, renders a test still
cd my-videos && claude                         # open Claude Code in the workspace
/explainer-studio:new-video What happened to the Walkman? --look sketch
```

Other skills: `analyze-reference <video>` (learn from a new reference video: frames, contact
sheets, transcript, breakdown, updates the formula), `revise <slug> <change>`, and the stage
skills `research`, `script`, `beats`, `assets`, `voice`, `scenes`, `qc`. Agents:
`fact-checker`, `svg-artist`, `qc-reviewer`.

## Requirements

- Node.js 18+ and ffmpeg.
- Python 3 with `pip install faster-whisper` (word timings and reference transcription).
- A TTS key in the environment for a real voice: `ELEVENLABS_API_KEY` (optional
  `ELEVENLABS_VOICE_ID`) or `OPENAI_API_KEY` (optional `OPENAI_TTS_VOICE`). Without one, videos
  get a silent placeholder track with estimated timings, so everything else still works.
- Remotion downloads a headless Chrome on first render; offline, set
  `REMOTION_BROWSER_EXECUTABLE` to an installed Chrome/Chromium.

## What's inside

```
.claude-plugin/          plugin + marketplace manifests
skills/                  new-video (orchestrator), studio-setup, stage skills, analyze-reference, revise
agents/                  fact-checker, svg-artist, qc-reviewer
skills/studio-setup/template/
  src/lib/               Remotion components: World + camera, Title, Svg/Place, FollowPath, Flame,
                         Orbit, Swarm, Burst, DrawCircle, YearDial, SmokeWipe, Clipping, Scene, Boil,
                         Bubble, Checklist, LineChart, Arrow, Scale, Network, Counter, Strike,
                         Polaroid, Soundtrack (music ducked under speech)
  scripts/               tts.mjs, words.py, timing.mjs, validate.mjs, frames.sh, transcribe-reference.py
  presets/               storybook.json, sketch.json (+ comparison)
  projects/demo*/        two working demo videos (one per look)
  reference/             channel-formula.md + 3 analysed videos (transcripts, breakdowns, sheets)
```

The reference contact sheets are stills from third-party videos, kept for private style study;
remove `reference/*/sheets/` before publishing this plugin publicly.
