// Voice discovery and the market voice settings (markets/<market>/voice.json), shared by tts.mjs and set-voice.mjs.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import * as vs from './voicestudio.mjs';

/** Market for a video (brief.md `market:`), else the workspace default (studio.json), else uk. */
export function marketFor(slug) {
  const brief = slug && existsSync(`projects/${slug}/brief.md`) ? readFileSync(`projects/${slug}/brief.md`, 'utf8') : '';
  return brief.match(/^market:\s*([a-z-]+)/m)?.[1] ?? (existsSync('studio.json') ? JSON.parse(readFileSync('studio.json', 'utf8')).market : undefined) ?? 'uk';
}

export const voicePath = (market) => `markets/${market}/voice.json`;
export const readVoice = (market) => (existsSync(voicePath(market)) ? JSON.parse(readFileSync(voicePath(market), 'utf8')) : {});

/** Save the chosen voice for a market and make that provider the preferred one. */
export function saveVoice(market, provider, id, name) {
  const cfg = readVoice(market);
  cfg.provider = provider;
  if (provider === 'elevenlabs') cfg.elevenlabs = { ...cfg.elevenlabs, voiceId: id, ...(name ? { voiceName: name } : {}) };
  else if (provider === 'voicestudio') cfg.voicestudio = { ...cfg.voicestudio, voice: id, ...(name ? { voiceName: name } : {}) };
  else throw new Error(`unknown provider ${provider}`);
  writeFileSync(voicePath(market), JSON.stringify(cfg, null, 2) + '\n');
  return voicePath(market);
}

/** Which providers can be used right now. */
export async function available() {
  return { elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY), voicestudio: await vs.isUp() };
}

const ACCENT = { uk: /brit|english|england|scot|welsh|irish|london|rp\b/i, pk: /pakistan|indian|south asian|urdu/i };

/** Voices from one provider: [{ provider, id, name, accent, gender, language, description, recommended }]. */
export async function listVoices(provider, market = 'uk') {
  const want = ACCENT[market];
  if (provider === 'elevenlabs') {
    const res = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '' } });
    if (!res.ok) throw new Error(`ElevenLabs voice list failed: ${res.status} ${await res.text()}`);
    return ((await res.json()).voices ?? []).map((v) => {
      const l = v.labels ?? {};
      const text = [l.accent, l.description, v.name, v.description].filter(Boolean).join(' ');
      return { provider, id: v.voice_id, name: v.name, accent: l.accent ?? '', gender: l.gender ?? '', language: l.language ?? '', description: [l.description, l.use_case, l.age].filter(Boolean).join(', '), recommended: Boolean(want?.test(text)) };
    });
  }
  if (provider === 'voicestudio') {
    return (await vs.listVoices())
      .filter((v) => v.type === 'profile')
      .map((v) => ({ provider, id: v.id, name: v.name, accent: '', gender: '', language: v.language ?? '', description: 'saved VoiceStudio voice', recommended: Boolean(want?.test(v.name ?? '')) }));
  }
  throw new Error(`unknown provider ${provider}`);
}

/** Voices from every available provider, recommended (market accent) first. */
export async function listAll(market = 'uk') {
  const a = await available();
  const out = [];
  const errors = [];
  for (const p of ['voicestudio', 'elevenlabs']) {
    if (!a[p]) continue;
    try { out.push(...(await listVoices(p, market))); } catch (e) { errors.push(e.message); }
  }
  out.sort((x, y) => Number(y.recommended) - Number(x.recommended));
  return { available: a, voices: out, errors };
}
