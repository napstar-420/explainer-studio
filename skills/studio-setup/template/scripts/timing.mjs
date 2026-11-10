#!/usr/bin/env node
// Usage: node scripts/timing.mjs <slug>
// Reads projects/<slug>/beats.json and public/<slug>/words.json, writes projects/<slug>/timed-beats.json:
// every beat gets startSec/endSec, and every cue/at phrase gets the second its first word is spoken.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { Beats } from './schemas.mjs';

const slug = process.argv[2];
if (!slug) { console.error('usage: timing.mjs <slug>'); process.exit(2); }
const beats = Beats.parse(JSON.parse(readFileSync(`projects/${slug}/beats.json`, 'utf8')));
const words = JSON.parse(readFileSync(`public/${slug}/words.json`, 'utf8'));
const norm = (s) => s.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]/gu, '');
const toks = words.map((w) => norm(w.w));

/** Index of the first word of `phrase` in the transcript, searching from `start`; fuzzy on misheard words. */
function find(phrase, start) {
  const p = phrase.split(/\s+/).map(norm).filter(Boolean);
  let best = { i: -1, score: 0 };
  for (let i = start; i < toks.length; i++) {
    let hit = 0;
    for (let k = 0; k < p.length && i + k < toks.length; k++) if (toks[i + k] === p[k]) hit++;
    const score = hit / p.length;
    if (score > best.score + 1e-9) best = { i, score };
    if (score === 1) break;
  }
  return best.score >= 0.5 ? best.i : -1;
}

const LEAD = 0.2;
let ptr = 0;
const warnings = [];
const out = beats.beats.map((b) => {
  const cue = b.cue ?? b.line.split(/\s+/).slice(0, 3).join(' ');
  let i = find(cue, ptr);
  if (i < 0) { warnings.push(`beat ${b.id}: cue "${cue}" not heard; placed after previous beat`); i = Math.min(ptr, toks.length - 1); }
  const lineLen = b.line.split(/\s+/).length;
  const beatStartIdx = i;
  ptr = Math.max(ptr, i + Math.max(1, Math.floor(lineLen * 0.6)));
  const cues = { [cue]: words[i].s };
  for (const phrase of [...b.motion.map((m) => m.at), ...b.sfx.map((s) => s.at)].filter(Boolean)) {
    let j = find(phrase, beatStartIdx);
    if (j < 0 || j > beatStartIdx + lineLen + 5) { warnings.push(`beat ${b.id}: "${phrase}" not heard; using beat start`); j = beatStartIdx; }
    cues[phrase] = words[j].s;
  }
  return { id: b.id, line: b.line, title: b.title, underline: b.underline, startSec: Math.max(0, words[i].s - LEAD), endSec: 0, cues };
});
for (let k = 0; k < out.length; k++) {
  if (k > 0 && out[k].startSec < out[k - 1].startSec) out[k].startSec = out[k - 1].startSec + 0.1;
}
const tail = 1.2;
const durationSec = Math.round((words[words.length - 1].e + tail) * 100) / 100;
out.forEach((b, k) => { b.endSec = k + 1 < out.length ? out[k + 1].startSec : durationSec; });
out[0].startSec = 0;
const voice = existsSync(`public/${slug}/voice.mp3`) ? `${slug}/voice.mp3` : undefined;
writeFileSync(`projects/${slug}/timed-beats.json`, JSON.stringify({ slug, fps: beats.fps, durationSec, voice, words, beats: out }, null, 1));
console.log(`timed-beats.json: ${out.length} beats, ${durationSec}s`);
for (const w of warnings) console.log('warning:', w);
