---
name: assets
description: Draw the SVG props and characters for an explainer video into public/<slug>/assets/, consistent with style.json. Use for the asset stage or when asked to draw or redraw video props.
---

# Assets

1. List unique props from `beats.json` (`node scripts/validate.mjs <slug>` prints missing ones).
   For each prop write a one-line spec: what it is, view, size class (hero / prop / small icon),
   colours from the palette, any label text, poses for characters.
2. Draw the **hero** yourself first, render it (`npx remotion still` of a scene that shows it, or
   open the SVG with Playwright at 2× and screenshot) and check it reads well small.
3. Split the rest into batches of ~8 and launch `svg-artist` agents in parallel, each with:
   `style.json`, the hero SVG as the style anchor, two reference sheets from
   `reference/<closest video>/sheets/`, and its batch of specs.
4. Review all assets together on one contact page (an HTML grid screenshotted with Playwright):
   same stroke, palette, detail level, proportions. Redraw outliers.

SVG rules: `viewBox` sized to the object, no external refs, no embedded raster, flat palette
fills, ink outlines at `stroke` width with round joins, characters as separate files per pose
(`kid-stand.svg`, `kid-cheer.svg`), labels only where the object really has text.
