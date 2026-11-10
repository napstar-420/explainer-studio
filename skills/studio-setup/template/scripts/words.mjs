#!/usr/bin/env node
// Usage: node scripts/words.mjs <slug> [--provider whisper|voicestudio]
// Word timings for public/<slug>/voice.mp3 → public/<slug>/words.json.
//   whisper      (default) local faster-whisper via scripts/words.py: free, offline.
//   voicestudio  the running VoiceStudio backend's speech-to-text (VOICESTUDIO_URL, OMNIVOICE_API_KEY).
// With no --provider: whisper if faster-whisper is installed, else VoiceStudio if it is running.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import * as vs from './voicestudio.mjs';

const fail = (e) => { console.error(e?.message ?? String(e)); process.exit(1); };
process.on('uncaughtException', fail);
process.on('unhandledRejection', fail);

const args = process.argv.slice(2);
const slug = args[0];
if (!slug) { console.error('usage: words.mjs <slug> [--provider whisper|voicestudio]'); process.exit(2); }
const pi = args.indexOf('--provider');
const audio = `public/${slug}/voice.mp3`;
if (!existsSync(audio)) { console.error(`${audio} not found: run node scripts/tts.mjs ${slug} first`); process.exit(1); }

const hasWhisper = () => spawnSync('python3', ['-c', 'import faster_whisper'], { stdio: 'ignore' }).status === 0;
let provider = pi > 0 ? args[pi + 1] : undefined;
if (!provider) provider = hasWhisper() ? 'whisper' : (await vs.isUp()) ? 'voicestudio' : 'whisper';

if (provider === 'whisper') {
  const r = spawnSync('python3', ['scripts/words.py', slug, ...args.filter((a, i) => i > 0 && a !== '--provider' && args[i - 1] !== '--provider')], { stdio: 'inherit' });
  if (r.status !== 0) console.error('Local Whisper failed. Install it with `pip3 install faster-whisper`, or use --provider voicestudio with the VoiceStudio app open.');
  process.exit(r.status ?? 1);
} else if (provider === 'voicestudio') {
  if (!(await vs.isUp())) { console.error(`VoiceStudio is not answering at ${vs.baseUrl()}. Open the app (or set VOICESTUDIO_URL).`); process.exit(1); }
  let prompt;
  try { prompt = JSON.parse(readFileSync(`projects/${slug}/beats.json`, 'utf8')).beats.map((b) => b.line).join(' '); } catch {}
  const { words } = await vs.transcribe({ file: audio, language: 'en', prompt });
  if (!words.length) { console.error('VoiceStudio returned no word timings (its speech-to-text engine may not support them). Use --provider whisper.'); process.exit(1); }
  writeFileSync(`public/${slug}/words.json`, JSON.stringify(words));
  console.error(`public/${slug}/words.json: ${words.length} words, ${words[words.length - 1].e}s (VoiceStudio). Next: node scripts/timing.mjs ${slug}`);
} else {
  console.error(`unknown provider ${provider} (use whisper or voicestudio)`); process.exit(2);
}
