// Minimal client for a running VoiceStudio backend (https://github.com/debpalash/voicestudio):
// its OpenAI-compatible audio API. Address: VOICESTUDIO_URL (default http://localhost:3900).
// Auth: OMNIVOICE_API_KEY as a bearer key when the backend is protected.
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

export const baseUrl = () => (process.env.VOICESTUDIO_URL ?? `http://localhost:${process.env.OMNIVOICE_PORT ?? 3900}`).replace(/\/+$/, '');
const auth = () => (process.env.OMNIVOICE_API_KEY ? { authorization: `Bearer ${process.env.OMNIVOICE_API_KEY}` } : {});

async function check(res, what) {
  if (res.ok) return res;
  let msg = await res.text();
  try { msg = JSON.parse(msg).error?.message ?? msg; } catch {}
  if (res.status === 401 || res.status === 403) msg += ' (set OMNIVOICE_API_KEY to the key your VoiceStudio backend uses)';
  throw new Error(`VoiceStudio ${what} failed: ${res.status} ${msg}`);
}

/** True when the backend answers /health within `ms` (a 401/403 still means it is running; calls then explain the key). */
export async function isUp(ms = 2000) {
  try {
    const res = await fetch(`${baseUrl()}/health`, { headers: auth(), signal: AbortSignal.timeout(ms) });
    return res.ok || res.status === 401 || res.status === 403;
  } catch {
    return false;
  }
}

/** Saved voice profiles and OpenAI-style aliases: [{ id, name, type, language }]. */
export async function listVoices() {
  const res = await check(await fetch(`${baseUrl()}/v1/audio/voices`, { headers: auth() }), 'voice list');
  const body = await res.json();
  return (body.voices ?? []).map((v) => ({ id: v.id ?? v.voice_id, name: v.name, type: v.type, language: v.language }));
}

/** Text → WAV bytes with a saved voice profile id (or name). */
export async function speak({ text, voice, model = 'tts-1', instructions }) {
  const res = await check(
    await fetch(`${baseUrl()}/v1/audio/speech`, {
      method: 'POST',
      headers: { ...auth(), 'content-type': 'application/json' },
      body: JSON.stringify({ model, voice, input: text, response_format: 'wav', ...(instructions ? { instructions } : {}) }),
    }),
    'speech',
  );
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Audio file → verbose transcript with word timings: { text, language, segments, words: [{ w, s, e }] }.
 * `translate` uses /v1/audio/translations (to English, Whisper engines only; no word timings there).
 */
export async function transcribe({ file, language, prompt, translate = false }) {
  const form = new FormData();
  form.append('file', new Blob([readFileSync(file)]), basename(file));
  form.append('model', 'whisper-1');
  form.append('response_format', 'verbose_json');
  if (!translate) {
    form.append('timestamp_granularities[]', 'word');
    form.append('timestamp_granularities[]', 'segment');
    if (language) form.append('language', language);
  }
  if (prompt) form.append('prompt', prompt.slice(0, 800));
  const path = translate ? '/v1/audio/translations' : '/v1/audio/transcriptions';
  const res = await check(await fetch(`${baseUrl()}${path}`, { method: 'POST', headers: auth(), body: form }), translate ? 'translation' : 'transcription');
  const body = await res.json();
  const words = (body.words ?? []).map((w) => ({ w: String(w.word).trim(), s: Math.round(w.start * 100) / 100, e: Math.round(w.end * 100) / 100 }));
  return { text: body.text ?? '', language: body.language, segments: body.segments ?? [], words };
}
