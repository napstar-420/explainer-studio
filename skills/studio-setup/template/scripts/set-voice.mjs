#!/usr/bin/env node
// Choose the narrator voice for a market.
//   node scripts/set-voice.mjs                          interactive menu (terminal)
//   node scripts/set-voice.mjs --list [--json]          list voices from available providers
//   node scripts/set-voice.mjs <provider> <voice-id>    save a choice (provider: elevenlabs | voicestudio)
//   node scripts/set-voice.mjs --preview <provider> <voice-id>   render a short sample to out/voice-preview.mp3
//   node scripts/set-voice.mjs --status [--json]        show the current choice and what's available
// Options: --market <code> (default: studio.json market, else uk).
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { available, listAll, marketFor, readVoice, saveVoice, voicePath } from './voices.mjs';
import * as vs from './voicestudio.mjs';

const fail = (e) => { console.error(e?.message ?? String(e)); process.exit(1); };
process.on('uncaughtException', fail);
process.on('unhandledRejection', fail);

const args = process.argv.slice(2);
const mi = args.indexOf('--market');
const market = mi >= 0 ? args.splice(mi, 2)[1] : marketFor();
const json = args.includes('--json');
const pos = args.filter((a) => !a.startsWith('--'));
const SAMPLE = {
  uk: 'If you grew up in the nineties, you will remember it. Every town had one. Then, almost overnight, they were gone.',
  pk: 'You must have bought one as a child. But do you know where the story really began?',
}[market] ?? 'Every brand has a story. This is one of them.';

const line = (v, i) => `${String(i + 1).padStart(2)}. ${v.name}  [${v.provider}${v.accent ? `, ${v.accent}` : ''}${v.gender ? `, ${v.gender}` : ''}]${v.recommended ? '  ★' : ''}${v.description ? `  ${v.description}` : ''}`;
const help = () => {
  console.error('No voice provider is available. Either:');
  console.error('  - set ELEVENLABS_API_KEY (ElevenLabs), or');
  console.error(`  - open the VoiceStudio app and save a voice (expected at ${vs.baseUrl()}; set VOICESTUDIO_URL if elsewhere).`);
};

if (args.includes('--status')) {
  const cfg = readVoice(market);
  const a = await available();
  const status = { market, file: voicePath(market), provider: cfg.provider ?? null, elevenlabs: cfg.elevenlabs?.voiceId ?? null, voicestudio: cfg.voicestudio?.voice || null, available: a };
  status.chosen = Boolean((status.provider === 'elevenlabs' && status.elevenlabs && a.elevenlabs) || (status.provider === 'voicestudio' && status.voicestudio && a.voicestudio));
  console.log(json ? JSON.stringify(status, null, 1) : Object.entries(status).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('\n'));
  process.exit(0);
}

if (args.includes('--preview')) {
  const [provider, id] = pos;
  if (!provider || !id) { console.error('usage: set-voice.mjs --preview <provider> <voice-id>'); process.exit(2); }
  mkdirSync('out', { recursive: true });
  const out = `out/voice-preview-${provider}-${id.replace(/[^\w-]/g, '')}.mp3`;
  if (provider === 'elevenlabs') {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${id}?output_format=mp3_44100_128`, { method: 'POST', headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '', 'content-type': 'application/json' }, body: JSON.stringify({ text: SAMPLE, model_id: readVoice(market).elevenlabs?.model ?? 'eleven_multilingual_v2' }) });
    if (!res.ok) throw new Error(`ElevenLabs preview failed: ${res.status} ${await res.text()}`);
    writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  } else {
    const wav = await vs.speak({ text: SAMPLE, voice: id, instructions: readVoice(market).voicestudio?.instructions });
    writeFileSync('out/.preview.wav', wav);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', 'out/.preview.wav', out]);
    rmSync('out/.preview.wav');
  }
  console.log(out);
  process.exit(0);
}

if (pos.length === 2) {
  const [provider, id] = pos;
  let name;
  try { name = (await listAll(market)).voices.find((v) => v.provider === provider && v.id === id)?.name; } catch {}
  const file = saveVoice(market, provider, id, name);
  console.log(`Saved: ${name ?? id} (${provider}) as the ${market} narrator in ${file}.`);
  process.exit(0);
}

const { available: a, voices, errors } = await listAll(market);
for (const e of errors) console.error(`warning: ${e}`);
if (args.includes('--list')) {
  if (json) console.log(JSON.stringify({ market, available: a, voices }, null, 1));
  else if (!voices.length) help();
  else voices.forEach((v, i) => console.log(`${line(v, i)}\n      id: ${v.id}`));
  process.exit(0);
}

// Interactive menu.
if (!voices.length) { help(); process.exit(1); }
if (!process.stdin.isTTY) { console.error('Not a terminal: use --list --json and then `set-voice.mjs <provider> <id>`.'); process.exit(2); }
console.log(`Narrator voices for market "${market}" (★ = matches the market's accent):\n`);
voices.forEach((v, i) => console.log(line(v, i)));
const rl = createInterface({ input: process.stdin, output: process.stdout });
const input = rl[Symbol.asyncIterator](); // queues typed lines, so nothing is lost while a preview renders
let pick;
for (;;) {
  process.stdout.write('\nPick a number (p<number> to hear a preview, q to quit): ');
  const next = await input.next();
  if (next.done) process.exit(0);
  const ans = next.value.trim().toLowerCase();
  if (ans === 'q') process.exit(0);
  const prev = ans.match(/^p\s*(\d+)$/);
  const n = Number(prev ? prev[1] : ans);
  if (!Number.isInteger(n) || n < 1 || n > voices.length) { console.log('Not a number from the list.'); continue; }
  const v = voices[n - 1];
  if (prev) {
    const out = execFileSync('node', ['scripts/set-voice.mjs', '--preview', v.provider, v.id, '--market', market]).toString().trim();
    console.log(`Preview saved to ${out}`);
    try { execFileSync(process.platform === 'darwin' ? 'afplay' : 'ffplay', process.platform === 'darwin' ? [out] : ['-nodisp', '-autoexit', '-loglevel', 'quiet', out], { stdio: 'ignore' }); } catch {}
    continue;
  }
  pick = v;
  break;
}
rl.close();
console.log(`Saved: ${pick.name} (${pick.provider}) as the ${market} narrator in ${saveVoice(market, pick.provider, pick.id, pick.name)}.`);
