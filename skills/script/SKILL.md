---
name: script
description: Write the narration script for an explainer video from research.md, following the channel formula arcs and word budget. Use for the script stage or when asked to write or rewrite a video script.
---

# Script

Read `reference/channel-formula.md` (arcs, writing rules) and two of the reference transcripts in
`reference/*/transcript.md` that match the arc. Write `projects/<slug>/script.md`:

1. Front matter lines: `arc:`, `look:`, `target_seconds:`, `words:` (count), `wpm: 130–150`.
2. The script as numbered sentences, one per line, grouped under the arc's section names.
   Each sentence = one visual beat, 4–20 words. Word budget ≈ target_seconds × 2.2
   (≈ 220 for 100 s).
3. Under each sentence, an indented `visual:` note with the metaphor idea (from the metaphor
   library where it fits) and `[n]` source refs for its facts.

Rules: open with "you" or a striking number; turn with "But…"; concrete nouns, years and names;
end by mirroring the hook; English, plain, spoken rhythm (read it aloud in your head). No claim
without a source in research.md.
