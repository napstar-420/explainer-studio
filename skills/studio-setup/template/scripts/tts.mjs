#!/usr/bin/env node
// Usage: node scripts/tts.mjs <slug> [--provider elevenlabs|openai|silent]
// Voices the beat lines in projects/<slug>/beats.json into public/<slug>/voice.mp3.
// Keys come from the environment: ELEVENLABS_API_KEY (+ ELEVENLABS_VOICE_ID) or OPENAI_API_KEY (+ OPENAI_TTS_VOICE).
// "silent" (the fallback with no key) writes silence plus estimated word timings, so the pipeline still runs.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { Beats } from './schemas.mjs';

const slug = process.argv[2];
if (!slug) { console.error('usage: tts.mjs <slug> [--provider elevenlabs|openai|silent]'); process.exit(2); }
const pi = process.argv.indexOf('--provider');
const provider = pi > 0 ? process.argv[pi + 1] : process.env.ELEVENLABS_API_KEY ? 'elevenlabs' : process.env.OPENAI_API_KEY ? 'openai' : 'silent';
const beats = Beats.parse(JSON.parse(readFileSync(`projects/${slug}/beats.json`, 'utf8')));
const lines = beats.beats.map((b) => b.line.trim());
const text = lines.join('\n\n');
const dir = `public/${slug}`;
mkdirSync(dir, { recursive: true });
const out = `${dir}/voice.mp3`;

async function save(res) {
  if (!res.ok) throw new Error(`${provider} TTS failed: ${res.status} ${await res.text()}`);
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
}

if (provider === 'elevenlabs') {
  const voice = process.env.ELEVENLABS_VOICE_ID ?? 'JBFqnCBsd6RMkjVDRZzb';
  await save(await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '', 'content-type': 'application/json' },
    body: JSON.stringify({ text, model_id: process.env.ELEVENLABS_MODEL ?? 'eleven_multilingual_v2', voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.2 } }),
  }));
} else if (provider === 'openai') {
  await save(await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: process.env.OPENAI_TTS_MODEL ?? 'gpt-4o-mini-tts', voice: process.env.OPENAI_TTS_VOICE ?? 'onyx', input: text, response_format: 'mp3', instructions: 'Calm, warm documentary storyteller. Conversational, unhurried, about 135 words per minute, short pauses between sentences.' }),
  }));
} else if (provider === 'silent') {
  // Estimate timings at ~137 wpm with 0.6 s between lines, so layout and timing can be built before a real voice exists.
  const words = [];
  let t = 0.3;
  for (const line of lines) {
    for (const w of line.split(/\s+/)) {
      const d = 0.16 + 0.055 * w.replace(/[^\p{L}\p{N}]/gu, '').length;
      words.push({ w, s: Math.round(t * 100) / 100, e: Math.round((t + d) * 100) / 100 });
      t += d + 0.05;
    }
    t += 0.6;
  }
  writeFileSync(`${dir}/words.json`, JSON.stringify(words));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', String(t + 0.5), '-q:a', '9', out]);
  console.log(`silent placeholder: ${out} (${t.toFixed(1)}s) + estimated ${dir}/words.json — run tts again with a key for a real voice`);
  process.exit(0);
} else {
  console.error(`unknown provider ${provider}`); process.exit(2);
}
console.log(`voiced with ${provider}: ${out}. Next: python3 scripts/words.py ${slug}`);
