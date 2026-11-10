#!/usr/bin/env node
// Usage: node scripts/validate.mjs <slug>   — checks beats.json, style.json and that every prop has an asset.
import { existsSync, readFileSync } from 'node:fs';
import { Beats, Style } from './schemas.mjs';

const slug = process.argv[2];
if (!slug) { console.error('usage: validate.mjs <slug>'); process.exit(2); }
let failed = false;
const check = (name, schema, path) => {
  if (!existsSync(path)) { console.log(`- ${name}: missing (${path})`); return null; }
  const r = schema.safeParse(JSON.parse(readFileSync(path, 'utf8')));
  if (r.success) { console.log(`✓ ${name}`); return r.data; }
  failed = true;
  console.log(`✗ ${name}`);
  for (const i of r.error.issues) console.log(`   ${i.path.join('.')}: ${i.message}`);
  return null;
};
const beats = check('beats.json', Beats, `projects/${slug}/beats.json`);
check('style.json', Style, `projects/${slug}/style.json`);
if (beats) {
  const props = [...new Set(beats.beats.flatMap((b) => b.props))];
  const missing = props.filter((p) => !existsSync(`public/${slug}/assets/${p}.svg`) && !existsSync(`public/${slug}/assets/${p}.png`));
  console.log(missing.length ? `- assets missing (${missing.length}/${props.length}): ${missing.join(', ')}` : `✓ assets (${props.length})`);
  const words = beats.beats.map((b) => b.line).join(' ').split(/\s+/).length;
  console.log(`  narration: ${words} words ≈ ${Math.round((words / 137) * 60)} s at 137 wpm`);
}
process.exit(failed ? 1 : 0);
