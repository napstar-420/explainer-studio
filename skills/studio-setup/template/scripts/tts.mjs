#!/usr/bin/env node
// Usage: node scripts/tts.mjs <slug> [--provider elevenlabs|voicestudio|silent]
//        node scripts/tts.mjs --list-voices [elevenlabs|voicestudio]
// Voices the beat lines in projects/<slug>/beats.json into public/<slug>/voice.mp3.
//
// Providers (auto order when --provider is not given):
//   elevenlabs   ELEVENLABS_API_KEY set. Voice: ELEVENLABS_VOICE_ID, else the market's voice.json.
//   voicestudio  a VoiceStudio backend answering at VOICESTUDIO_URL (default http://localhost:3900),
//                optional OMNIVOICE_API_KEY. Voice: VOICESTUDIO_VOICE, else the market's voice.json
//                (a saved voice profile id or name; list them with --list-voices voicestudio).
//   silent       silence + estimated word timings, so layout and timing work before a real voice.
// Market = `market:` in projects/<slug>/brief.md, else studio.json, else uk.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { Beats } from './schemas.mjs';
import * as vs from './voicestudio.mjs';

const fail = (e) => { console.error(e?.message ?? String(e)); process.exit(1); };
process.on('uncaughtException', fail);
process.on('unhandledRejection', fail);

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };

if (args[0] === '--list-voices') {
  const which = args[1] ?? (process.env.ELEVENLABS_API_KEY ? 'elevenlabs' : 'voicestudio');
  if (which === 'elevenlabs') {
    const res = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '' } });
    if (!res.ok) { console.error(`ElevenLabs voice list failed: ${res.status} ${await res.text()}`); process.exit(1); }
    for (const v of (await res.json()).voices ?? []) console.log(`${v.voice_id}  ${v.name}  ${Object.values(v.labels ?? {}).join(', ')}`);
  } else {
    if (!(await vs.isUp())) { console.error(`VoiceStudio is not answering at ${vs.baseUrl()} (open the app, or set VOICESTUDIO_URL).`); process.exit(1); }
    for (const v of await vs.listVoices()) console.log(`${v.id}  ${v.name}  ${v.type}${v.language ? `  ${v.language}` : ''}`);
  }
  process.exit(0);
}

const slug = args[0];
if (!slug) { console.error('usage: tts.mjs <slug> [--provider elevenlabs|voicestudio|silent] | --list-voices [elevenlabs|voicestudio]'); process.exit(2); }
const provider = flag('--provider') ?? (process.env.ELEVENLABS_API_KEY ? 'elevenlabs' : (await vs.isUp()) ? 'voicestudio' : 'silent');
const beats = Beats.parse(JSON.parse(readFileSync(`projects/${slug}/beats.json`, 'utf8')));
const lines = beats.beats.map((b) => b.line.trim());
const text = lines.join('\n\n');
const dir = `public/${slug}`;
mkdirSync(dir, { recursive: true });
const out = `${dir}/voice.mp3`;

const brief = existsSync(`projects/${slug}/brief.md`) ? readFileSync(`projects/${slug}/brief.md`, 'utf8') : '';
const market = brief.match(/^market:\s*([a-z-]+)/m)?.[1] ?? (existsSync('studio.json') ? JSON.parse(readFileSync('studio.json', 'utf8')).market : undefined) ?? 'uk';
const vpath = `markets/${market}/voice.json`;
const vcfg = existsSync(vpath) ? JSON.parse(readFileSync(vpath, 'utf8')) : {};
if (provider !== 'silent') console.log(`market: ${market} (${existsSync(vpath) ? vpath : 'no voice.json, using built-in defaults'})`);

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
    const profiles = (await vs.listVoices()).filter((v) => v.type === 'profile');
    console.error(`No VoiceStudio voice chosen. Set "voicestudio.voice" in ${vpath} (or VOICESTUDIO_VOICE) to one of your saved voices:`);
    for (const v of profiles) console.error(`  ${v.id}  ${v.name}${v.language ? `  (${v.language})` : ''}`);
    if (!profiles.length) console.error('  (none saved yet: create or clone a British narrator voice in VoiceStudio first)');
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
