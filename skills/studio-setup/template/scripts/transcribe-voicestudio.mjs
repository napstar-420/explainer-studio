#!/usr/bin/env node
// Usage: node scripts/transcribe-voicestudio.mjs <video-or-audio> <outdir> [--language ur] [--translate]
// Like transcribe-reference.py, but uses the running VoiceStudio backend's speech-to-text.
// Writes <outdir>/transcript-<lang|en>.json (segments with word timings where available).
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import * as vs from './voicestudio.mjs';

const fail = (e) => { console.error(e?.message ?? String(e)); process.exit(1); };
process.on('uncaughtException', fail);
process.on('unhandledRejection', fail);

const [src, outdir, ...rest] = process.argv.slice(2);
if (!src || !outdir) { console.error('usage: transcribe-voicestudio.mjs <media> <outdir> [--language xx] [--translate]'); process.exit(2); }
const li = rest.indexOf('--language');
const language = li >= 0 ? rest[li + 1] : undefined;
const translate = rest.includes('--translate');
if (!(await vs.isUp())) { console.error(`VoiceStudio is not answering at ${vs.baseUrl()}.`); process.exit(1); }
mkdirSync(outdir, { recursive: true });
const wav = `${outdir}/.audio-16k.wav`;
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-vn', '-ac', '1', '-ar', '16000', wav]);
const r = await vs.transcribe({ file: wav, language, translate });
rmSync(wav);
const segments = r.segments.map((s) => ({
  start: Math.round(s.start * 100) / 100,
  end: Math.round(s.end * 100) / 100,
  text: String(s.text).trim(),
  words: r.words.filter((w) => w.s >= s.start - 0.05 && w.s < s.end),
}));
for (const s of segments) console.log(`[${s.start.toFixed(2).padStart(6)}-${s.end.toFixed(2).padStart(6)}] ${s.text}`);
const name = translate ? 'en' : language ?? r.language ?? 'auto';
writeFileSync(`${outdir}/transcript-${name}.json`, JSON.stringify(segments, null, 1));
