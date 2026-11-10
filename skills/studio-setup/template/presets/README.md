# Looks

Copy one into `projects/<slug>/style.json` and adjust. Both looks share the same story formula,
pipeline and components; they differ in drawing style and how scenes change.

| | storybook | sketch |
|---|---|---|
| Drawing | flat colour fills, thin dark outlines, detailed props | monochrome line art with hatching; only the hero/brand objects in colour |
| Scene changes | one `<World>` with `camera` keys: push-ins, tilts, follow the hero; no cuts | `<Scene>` cuts between simple diagrams every 2–3 s, optional `<Boil>` line wobble |
| Hero | one object travels through every scene (e.g. a product drawn as a rocket) | the product packet, drawn as a character (eyes), appears in most diagrams |
| Metaphors | launch/fireworks, orbits, constellations, moon flags, telescope | staircase, map arrows, balance scale, line chart, shelf, network, switch, balloon, polaroid |
| Titles | 1–2 words, underline | headline + smaller sub line; big numerals; ticks/crosses |
| Pace | ~137 wpm, ~4.4 s lines | ~158 wpm, ~2.6 s lines |
| Key components | World, FollowPath, Flame, Orbit, Swarm, YearDial, SmokeWipe, Burst | Scene, Boil, Bubble, Checklist, LineChart, Arrow, Scale, Network, Counter, Strike, Polaroid |
