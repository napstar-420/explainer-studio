---
name: scenes
description: Write the Remotion scene code (projects/<slug>/Video.tsx) for an explainer video from timed-beats.json using the src/lib components, and register it. Use for the animation/scene stage or when changing how a beat looks or moves.
---

Read [host compatibility guidance](../../HOSTS.md) before running this workflow.

# Scenes

Read `timed-beats.json`, `beats.json`, `style.json`, `src/lib/index.ts` (component list and doc
comments) and the matching demo (`projects/demo/Video.tsx` for storybook, `projects/demo-sketch/`
for sketch).

Write `projects/<slug>/Video.tsx` exporting `Video`, wrapped in `<StyleProvider value={style}>`:

- `<Paper />` first; `<Soundtrack voice={t.voice} music=… sfx=…/>` last.
- Times only from `useBeat(id)`: `.from`, `.to`, `.at('phrase')`. No hard-coded seconds.
- Storybook: one `<World width height camera>`; camera keys at beat boundaries and events
  (ease 'inOut'); props placed with `<Svg src x y w enter exit>`; the hero moves with
  `<FollowPath>`. Sketch: `<Boil>` around `<Scene from to>` per beat; positions are screen px.
- Titles: `<Title text sub underline from to>` per beat, screen space, outside World.
- Keep the title band (y 200–420) clear; keep important things inside x 80–1000.
- SFX from `beats.json` → `sfx={[{ src: '<slug>/sfx/whoosh.mp3', at: b.at('…') }]}` (copy files
  from `library/sfx/` into `public/<slug>/sfx/`).

Register: add the import pair and entry to `src/registry.ts` in the existing style. Then
`npx tsc --noEmit` and `npx remotion still src/index.ts <slug> out/<slug>-check.png --frame=<mid
of a busy beat>`; look at it before moving on. Generic motions that don't exist yet go in
`src/lib/` as new components with a doc comment, exported from `index.ts`.
