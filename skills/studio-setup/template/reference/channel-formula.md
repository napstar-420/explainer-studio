# The channel formula (from 3 reference videos)

Distilled from three 90–105 s vertical brand-history explainers by one channel:

| | Video 1: "What happened to BP Spacer?" | Video 2: "What really happened to Oye Hoye?" | Video 3: "JazzCash success story" |
|---|---|---|---|
| Arc | decline (faded from view) | decline (hyped, then vanished) | success (grew under a new name) |
| Look | storybook | sketch | storybook |
| Scene changes | one continuous camera | cuts between diagrams | cuts + match-cuts (objects transform) |
| Hero object | toffee drawn as a rocket | packet with cartoon eyes | paper plane (money moving) |
| Length / words | 105 s / 222 words | 94 s / 218 words | 90 s / 171 words |
| Speaking rate | 137 wpm, 22 lines | 158 wpm, 32 short lines | 125 wpm, 13 long sentences |
| Title changes | ~1 per line (~4.4 s) | ~1 per line (~2.6 s) | 2–6 per sentence (~2 s) |

Each folder here (`bp-spacer/`, `oye-hoye/`, `jazzcash/`) holds the timed English transcript with
the Urdu original, a shot-by-shot breakdown (JSON) and timestamped contact sheets.

## 1. Story arcs

Every video follows one spine: **hook from the present → "but did you know" → go back to a year
→ cause and effect, one beat per sentence → today → a closing line that lands the theme.**

**Decline arc** ("What happened to X?")
1. Hook: a shared memory or a peak ("You must have eaten…", "In 2016 it was about to be No. 1").
2. Turn: it's gone, or rarely seen ("…but then it vanished").
3. Title: name the subject.
4. Origin: year, founder or company, place, first product.
5. Rise: what made it work (quality, name, ambassador, ads everywhere, sales chart).
6. Pressure from outside: new competitors, trade deals, rumours, market change.
7. Own goals: what it did wrong (weak distribution, stopped marketing, didn't adapt).
8. Lesson in one or two short lines ("Building hype is easy. Keeping it is hard.").
9. Today: still around somewhere, with evidence (a dated report, a shelf).
10. Close: nostalgia ("…just a memory", "…out of sight").

**Success arc** ("X success story")
1. Hook: how big it is today, shown as quick uses.
2. Turn: "But did you know it started as…?"
3. Origin: year, partners, launch.
4. Problem: how painful the old way was.
5. Solution: how it made that easy (one beat per feature).
6. Turning points: rebrand, new products, milestones with years.
7. Today: bigger than what it started as.

## 2. Writing rules

- 170–230 words for 90–105 s. One idea per sentence; each sentence is one visual beat.
- Open with "you" or a striking number; turn with "But…"; keep sentences concrete
  (names, years, places, prices).
- Every number, date, name and quote needs a source; show one source on screen near the twist.
- The ending line mirrors the hook (memory ↔ memory, today ↔ today).
- Neutral, factual tone: estimates are called estimates ("according to industry estimates").
- Don't present rumours as facts: show them as speech bubbles from townspeople.

## 3. On-screen text rules

- Never captions. A short title of 1–4 words taken from the line being spoken, top centre.
- A smaller second line adds context ("Fawad Khan" / "brand ambassador").
- One key word gets a hand-drawn underline that draws in.
- Years and figures are shown big (dial, counter, scratch card, lock screen), not in titles.
- Titles change on the spoken word they quote (cue timing), 1.5–4.5 s apart.

## 4. Visual metaphor library

The heart of the style: every abstract idea becomes a simple object doing something.
Pick from here first; invent new ones in the same spirit.

| Idea | Metaphor | Seen in | Component(s) |
|---|---|---|---|
| Popular / takes off | object ignites and flies up like a rocket; fireworks; crowd cheers | 1 | FollowPath, Flame, Burst |
| Rising to the top | climbing a staircase toward a "1" flag | 2 | Svg + keyframed hops |
| Vanished | fades to a ghost outline; question mark | 2 | Place exit fade + Svg |
| Looking for it today | telescope / magnifier finds an empty slot | 1 | Svg + DrawCircle |
| Going back in time | brass year dial spins; scratch card reveals a year; phone lock-screen date | 1, 3 | YearDial, Svg |
| Where | globe zooms to a country, pin on a city; map routes with dashed arrows | 1, 2, 3 | Svg + Arrow |
| Partnership | two coin halves slide together | 3 | Place enter (slide) |
| Rename / older identity | nesting doll opens to reveal the old one inside | 3 | Svg swap + Place |
| Parent brand | umbrella over the product; recolours on rebrand; wind = change | 3 | Svg |
| Comparison / parity | balance scale | 2 | Scale |
| Product range | constellation of products; items orbiting | 1 | Orbit + Arrow (dashed) |
| New competitors | flags planted on a moon | 1 | Svg + Place drop |
| Too many choices | candies orbit a kid | 1 | Orbit |
| Competition | rocket race with launch lights; rivals get boosts | 1 | FollowPath ×4 |
| Ads everywhere | TV → billboard → whole skyline of ads (zoom out) | 2 | World camera |
| Sales boom / fall | line chart, product icons ride the line | 2 | LineChart |
| Trade deals | cartons stack, "10 +1 free"; top shelf circled; coins | 2 | Counter, DrawCircle |
| Rumours | speech bubbles passing between townspeople | 2 | Bubble |
| Not that simple | arrow at the obvious culprit gets crossed out | 2 | Arrow + Strike |
| Weak distribution | factory-to-shops network with broken links | 2 | Network |
| Saw it but couldn't buy it | TV ad (tick) vs empty shelf (cross) | 2 | Checklist / Strike |
| Missed expectations | expected (dashed) vs actual (flat) with a gap arrow | 2 | LineChart + Arrow |
| Shutting down | executive flips a big switch off; TV goes dark | 2 | Svg |
| Forgotten | thought bubbles scribble out and fade | 2 | Bubble |
| Hype | balloon pumped up, then shrinks | 2 | Place scale |
| Slow old process | snakes-and-ladders board, pawn takes the long way | 3 | Svg + FollowPath |
| Easy now | the shop is the next square; short arrow | 3 | Arrow |
| Money moving | paper plane flying between points | 3 | FollowPath |
| Services working together | gears turning | 3 | Place rotate |
| Payments coming in | "+Rs 450" tags pop up | 3 | Place pop |
| Evidence | dated newspaper clipping slides in | 1 | Clipping |
| Now a memory | the scene freezes into a taped polaroid | 2 | Polaroid |
| Everywhere today | map folds up from paper; icons orbit it | 3 | Orbit |

## 5. Scene grammar

- **Hero object**: one object per video carries the story and appears in most beats.
  Give it a face or a motion personality (eyes, a flame, a flight path).
- **One idea per frame**: one or two objects on cream paper with lots of empty space.
- **Transitions**: storybook uses camera moves (push through a door, follow the hero, tilt up)
  or match-cuts (doll opens, card becomes coin, plane unfolds into map); sketch uses hard cuts.
- **Callbacks**: reuse an earlier scene near the end (rooftop kids, telescope, snakes-and-ladders).
- **Characters**: simple, few poses (stand, walk, cheer, point, talk), consistent outfits.
- **Watermark**: small handle in a corner.
- **Rights**: in your own videos, use generic figures for real people and your own (or permitted)
  logos; don't copy the reference channel's art.

## 6. Sound

Calm male narrator, a soft music bed ducked under speech, and light sound effects on visual
events: whoosh (launch), pop (appear), thud (land), coin, paper fold, switch click, shutter.
