# Explainer Studio for Claude Code and Codex

Make 9:16 illustrated explainer videos (90–110 s) about **UK brands for a British audience**, end
to end with Claude Code or Codex: "whatever happened to…?", success stories, renames, how-it-works. The agent researches, writes the
script, plans every beat as a visual metaphor, draws the SVG props, voices it, animates it in
Remotion timed to the spoken words, renders it, and checks the result frame by frame.

The visual style is distilled from three analysed reference videos (included under
`skills/studio-setup/template/reference/`; made for a Pakistani audience, so the UK market pack
replaces their settings, wording, sources and topics): flat illustration on cream paper, a hero object that
carries the story, keyword titles instead of captions, a calm narrator. Two looks ship:
**storybook** (rich flat colour, one continuous camera) and **sketch** (line art, cuts between
simple diagrams).

## Markets

The audience layer lives in **market packs** (`skills/studio-setup/template/markets/`):

- **`uk` (default)**: British English and vocabulary, £/p, a British narrator, UK sources
  (Companies House, The Gazette, BBC and national press, trade press), UK legal care
  (defamation, logos, real people), British settings and characters (high street, corner shop,
  terraced streets, tuck shop, retail park), UK hooks and story twists (administration, bought
  out of administration, renamed), and a topic bank of UK brands.
- **`pk`**: the Pakistani market the reference videos were made for.

Pick per video with `--market`, or change the default in the workspace's `studio.json`.
Copy `uk/` to add another market.

## Install

### Claude Code

From GitHub, run in Claude Code:

```
/plugin marketplace add napstar-420/explainer-studio
/plugin install explainer-studio@explainer-studio
```

**Zero-click for a team:** add to a project's `.claude/settings.json`; everyone who opens the
project and trusts the folder is offered the plugin:

```json
{
  "extraKnownMarketplaces": { "explainer-studio": { "source": { "source": "github", "repo": "napstar-420/explainer-studio" } } },
  "enabledPlugins": { "explainer-studio@explainer-studio": true }
}
```

**From the zip:** give the zip to Claude Code in a fresh session and say "install this". It follows
`INSTALL.md` (unzip → add as a local marketplace → install → set up the workspace).
Or by hand: unzip, then
`claude plugin marketplace add /path/to/explainer-studio` and
`claude plugin install explainer-studio@explainer-studio`.

### Codex

Add this same repository as a marketplace:

```sh
codex plugin marketplace add napstar-420/explainer-studio
codex plugin add explainer-studio@explainer-studio
```

If your Codex version has no `plugin add` command, install Explainer Studio from the
plugin browser after adding the marketplace. Restart Codex and start a new session.
For a local checkout, use `codex plugin marketplace add /absolute/path/to/explainer-studio`.
See [OpenAI's local plugin documentation](https://developers.openai.com/plugins/build/plugins).

In Codex, select `$studio-setup` and provide the target folder, then open that workspace
and select `$new-video` with your topic. You can also ask: "Use Explainer Studio's
new-video skill to make a sketch video about Woolworths."
Use `$update-studio` for an existing workspace, including one created with Claude Code.

Both hosts use the same skills and video engine. [HOSTS.md](HOSTS.md) explains argument
handling and agent roles; Codex reads those roles explicitly rather than registering
Claude's agent files. Generated workspaces share their rules through `AGENTS.md`.

## Use (Claude Code)

```
/explainer-studio:studio-setup my-videos       # creates the Remotion workspace, installs, renders a test still
cd my-videos && claude                         # open Claude Code in the workspace
/explainer-studio:new-video Whatever happened to Woolworths? --look sketch
/explainer-studio:new-video                     # no topic: suggests five from the UK topic bank
```

Keep a workspace current after a plugin update with one command:
`/explainer-studio:update-studio` (replaces the studio's tools, keeps your projects, assets and
chosen voices, backs up anything it replaces in `.studio-backup/`).

Other skills: `pick-voice`, `analyze-reference <video>` (learn from a new reference video: frames, contact
sheets, transcript, breakdown, updates the formula), `revise <slug> <change>`, and the stage
skills `research`, `script`, `beats`, `assets`, `voice`, `scenes`, `qc`. Agents:
`fact-checker`, `svg-artist`, `qc-reviewer`.

## Requirements

- Node.js 18+ and ffmpeg.
- Python 3 with `pip3 install faster-whisper` for free, offline word timings and reference
  transcription (optional if you use VoiceStudio for speech-to-text).
- A voice provider for real narration (without one, videos get a silent placeholder track with
  estimated timings, so everything else still works):
  - **ElevenLabs**: set `ELEVENLABS_API_KEY`.
  - **VoiceStudio** (https://github.com/debpalash/voicestudio, runs locally): open the app; the
    studio finds it at `http://localhost:3900` (`VOICESTUDIO_URL` to change, `OMNIVOICE_API_KEY` if
    protected). It can also do the speech-to-text (`node scripts/words.mjs <slug> --provider voicestudio`).

  Pick the narrator from a list with `/explainer-studio:pick-voice` (setup runs it for you), or in
  a terminal `node scripts/set-voice.mjs` (numbered menu, `p<number>` plays a preview).
- Remotion downloads a headless Chrome on first render; offline, set
  `REMOTION_BROWSER_EXECUTABLE` to an installed Chrome/Chromium.

## What's inside

```
.claude-plugin/          Claude plugin + marketplace manifests
.codex-plugin/           Codex plugin manifest (same skills/)
.agents/plugins/         Codex marketplace catalog
HOSTS.md                 shared host compatibility instructions
skills/                  new-video (orchestrator), studio-setup, update-studio, pick-voice, stage skills,
                         analyze-reference, revise
agents/                  fact-checker, svg-artist, qc-reviewer
skills/studio-setup/template/
  src/lib/               Remotion components: World + camera, Title, Svg/Place, FollowPath, Flame,
                         Orbit, Swarm, Burst, DrawCircle, YearDial, SmokeWipe, Clipping, Scene, Boil,
                         Bubble, Checklist, LineChart, Arrow, Scale, Network, Counter, Strike,
                         Polaroid, Soundtrack (music ducked under speech)
  scripts/               tts.mjs (ElevenLabs / VoiceStudio), set-voice.mjs (voice picker), words.mjs
                         (Whisper / VoiceStudio), timing.mjs,
                         validate.mjs, frames.sh, transcribe-reference.py, transcribe-voicestudio.mjs
  markets/               uk (default) and pk market packs: market.md + voice.json
  presets/               storybook.json, sketch.json (+ comparison)
  projects/demo*/        two working demo videos (one per look)
  reference/             channel-formula.md + 3 analysed videos (transcripts, breakdowns, sheets)
```

The reference contact sheets are stills from third-party videos, kept for private style study;
remove `reference/*/sheets/` before publishing this plugin publicly.
