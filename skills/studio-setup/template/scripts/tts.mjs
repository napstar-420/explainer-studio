#!/usr/bin/env node
// Usage: node scripts/tts.mjs <slug> [--provider elevenlabs|voicestudio|silent]
//        node scripts/tts.mjs --list-voices        (same as: node scripts/set-voice.mjs --list)
// Voices the beat lines in projects/<slug>/beats.json into public/<slug>/voice.mp3.
//
// The narrator is chosen once per market with `node scripts/set-voice.mjs` (or the pick-voice skill),
// saved in markets/<market>/voice.json ("provider" + that provider's voice).
// Provider order without --provider: the saved provider if usable, else ElevenLabs (ELEVENLABS_API_KEY),
// else VoiceStudio (backend at VOICESTUDIO_URL, default http://localhost:3900; OMNIVOICE_API_KEY if
// protected), else silent (silence + estimated word timings).
// Env overrides: ELEVENLABS_VOICE_ID, VOICESTUDIO_VOICE. Market = brief.md `market:`, else studio.json, else uk.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { Beats } from './schemas.mjs';
import { available, marketFor, readVoice, voicePath } from './voices.mjs';
import * as vs from './voicestudio.mjs';

const fail = (e) => { console.error(e?.message ?? String(e)); process.exit(1); };
process.on('uncaughtException', fail);
process.on('unhandledRejection', fail);

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };

if (args[0] === '--list-voices') {
  execFileSync('node', ['scripts/set-voice.mjs', '--list', ...args.slice(1)], { stdio: 'inherit' });
  process.exit(0);
}

const slug = args[0];
if (!slug) { console.error('usage: tts.mjs <slug> [--provider elevenlabs|voicestudio|silent] | --list-voices'); process.exit(2); }
const market = marketFor(slug);
const vpath = voicePath(market);
const vcfg = readVoice(market);
const avail = await available();
const provider = flag('--provider')
  ?? (vcfg.provider && avail[vcfg.provider] ? vcfg.provider : avail.elevenlabs ? 'elevenlabs' : avail.voicestudio ? 'voicestudio' : 'silent');
const beats = Beats.parse(JSON.parse(readFileSync(`projects/${slug}/beats.json`, 'utf8')));
const lines = beats.beats.map((b) => b.line.trim());
const text = lines.join('\n\n');
const dir = `public/${slug}`;
mkdirSync(dir, { recursive: true });
const out = `${dir}/voice.mp3`;
if (provider !== 'silent') console.log(`market: ${market} · provider: ${provider} (${existsSync(vpath) ? vpath : 'no voice.json, using built-in defaults'})`);
if (vcfg.provider && provider !== vcfg.provider && !flag('--provider')) console.log(`note: the saved provider "${vcfg.provider}" is not available right now; using ${provider}.`);

if (provider === 'elevenlabs') {
  const voice = process.env.ELEVENLABS_VOICE_ID ?? vcfg.elevenlabs?.voiceId ?? 'JBFqnCBsd6RMkjVDRZzb';
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '', 'content-type': 'application/json' },
    body: JSON.stringify({ text, model_id: process.env.ELEVENLABS_MODEL ?? vcfg.elevenlabs?.model ?? 'eleven_multilingual_v2', voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.2 } }),
  });
  if (!res.ok) throw new Error(`ElevenLabs TTS failed: ${res.status} ${await res.text()}`);
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
} else if (provider === 'voicestudio') {
  if (!(await vs.isUp())) { console.error(`VoiceStudio is not answering at ${vs.baseUrl()}. Open the VoiceStudio app (or set VOICESTUDIO_URL), then retry.`); process.exit(1); }
  const voice = process.env.VOICESTUDIO_VOICE || vcfg.voicestudio?.voice;
  if (!voice) {
    console.error(`NO_VOICE_CHOSEN: no VoiceStudio voice is chosen for the "${market}" market. Run \`node scripts/set-voice.mjs\` (or /explainer-studio:pick-voice) to pick one.`);
    process.exit(2);
  }
  const wav = await vs.speak({ text, voice, model: vcfg.voicestudio?.model ?? 'tts-1', instructions: vcfg.voicestudio?.instructions });
  const tmp = `${dir}/voice.wav`;
  writeFileSync(tmp, wav);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-c:a', 'libmp3lame', '-b:a', '160k', out]);
  rmSync(tmp);
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
  console.log(`silent placeholder: ${out} (${t.toFixed(1)}s) + estimated ${dir}/words.json — run tts again with ElevenLabs or VoiceStudio for a real voice`);
  process.exit(0);
} else {
  console.error(`unknown provider ${provider} (use elevenlabs, voicestudio or silent)`); process.exit(2);
}
console.log(`voiced with ${provider}: ${out}. Next: node scripts/words.mjs ${slug}`);
