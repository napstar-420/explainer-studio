---
name: qc
description: Render a draft of an explainer video and review it frame by frame against the beat sheet, then fix and re-render. Use for the QC stage or when asked to check, review or polish a rendered video.
---

# Draft and QC

1. `npx remotion render src/index.ts <slug> out/<slug>-draft.mp4 --scale=0.5`.
2. `scripts/frames.sh out/<slug>-draft.mp4 out/<slug>-qc 1` (1 frame/s, 5×3 contact sheets).
3. Launch the `qc-reviewer` agent with the sheets folder, `timed-beats.json`, `beats.json`,
   `reference/channel-formula.md` and `markets/<market>/market.md`. It returns defects per beat with severity.
4. Fix high and medium defects in `Video.tsx`/assets (or `beats.json` → rerun timing), re-render
   only if something changed, and repeat up to 3 rounds. Look at the sheets yourself each round.
5. Report what was fixed and anything left (with timestamps).
