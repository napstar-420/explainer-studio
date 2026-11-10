import { z } from 'zod';

const Phrase = z.string().trim().min(1).max(120);

export const Beat = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  /** The narration line spoken in this beat, exactly as it will be voiced. */
  line: z.string().trim().min(1).max(400),
  /** Words from `line` the beat starts on (defaults to its first words). */
  cue: Phrase.optional(),
  title: z.array(z.string().trim().min(1).max(40)).max(4).default([]),
  underline: z.string().max(40).optional(),
  /** The visual metaphor: what the viewer sees that explains the line. */
  metaphor: z.string().trim().min(1).max(400),
  region: z.string().max(40).optional(),
  props: z.array(z.string().regex(/^[a-z0-9-]+$/)).default([]),
  camera: z.string().max(200).optional(),
  motion: z.array(z.object({ use: z.string().min(1).max(40), target: z.string().max(60).optional(), at: Phrase.optional(), note: z.string().max(200).optional() })).default([]),
  transition: z.string().max(80).optional(),
  sfx: z.array(z.object({ file: z.string().min(1).max(120), at: Phrase })).default([]),
});

export const Beats = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().trim().min(1).max(120),
    fps: z.number().int().min(12).max(60).default(30),
    beats: z.array(Beat).min(1).max(60),
  })
  .superRefine((b, ctx) => {
    const ids = new Set();
    b.beats.forEach((beat, i) => {
      if (ids.has(beat.id)) ctx.addIssue({ code: 'custom', path: ['beats', i, 'id'], message: `duplicate id ${beat.id}` });
      ids.add(beat.id);
      const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}' ]/gu, '').replace(/\s+/g, ' ').trim();
      for (const p of [beat.cue, ...beat.motion.map((m) => m.at), ...beat.sfx.map((s) => s.at)].filter(Boolean)) {
        if (!norm(beat.line).includes(norm(p))) ctx.addIssue({ code: 'custom', path: ['beats', i], message: `cue "${p}" is not in the line of beat ${beat.id}` });
      }
    });
  });

export const Style = z.object({
  /** storybook: rich flat colour, one world + camera moves. sketch: line art with colour accents, cuts between diagrams. */
  look: z.enum(['storybook', 'sketch']).default('storybook'),
  palette: z.object({ paper: z.string(), ink: z.string(), accent: z.string(), accent2: z.string(), muted: z.array(z.string()).min(3) }),
  stroke: z.number().min(1).max(12),
  titleFont: z.string().min(1),
  titleWeight: z.number().int().min(100).max(900),
  titleColor: z.string(),
  underlineColor: z.string(),
});
