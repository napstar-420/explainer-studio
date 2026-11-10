#!/usr/bin/env node
// Update an Explainer Studio workspace's tooling from the plugin's template, keeping the user's work.
// Usage: node update.mjs <template-dir> <workspace-dir> [--check] [--dry-run]
//   --check    print versions and whether an update is available (exit 0 either way)
//   --dry-run  show what would change without writing
// Replaced (backed up to .studio-backup/<time>/ first when the workspace copy differs):
//   AGENTS.md, CLAUDE.md, package.json, tsconfig.json, remotion.config.ts, .gitignore, src/index.ts, src/Root.tsx,
//   src/lib/**, scripts/**, presets/**, reference/** (adds/updates only), markets/*/market.md,
//   markets/README.md, library/README.md, projects/demo*/**, public/demo*/**
// Merged: markets/*/voice.json (keeps your provider and voices), studio.json (keeps your settings).
// Never touched: your projects/ and public/ folders, src/registry.ts, library files, out/, node_modules/.
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const [tpl, ws, ...flags] = process.argv.slice(2);
if (!tpl || !ws) { console.error('usage: update.mjs <template-dir> <workspace-dir> [--check] [--dry-run]'); process.exit(2); }
const dry = flags.includes('--dry-run');
if (!existsSync(join(ws, 'studio.json'))) { console.error(`${ws} is not an Explainer Studio workspace (no studio.json). Run /explainer-studio:studio-setup there instead.`); process.exit(1); }

const pluginJson = join(tpl, '..', '..', '..', '.claude-plugin', 'plugin.json');
const pluginVersion = existsSync(pluginJson) ? JSON.parse(readFileSync(pluginJson, 'utf8')).version : 'unknown';
const studio = JSON.parse(readFileSync(join(ws, 'studio.json'), 'utf8'));
const wsVersion = studio.templateVersion ?? 'unversioned';
const newer = (a, b) => { const p = (v) => String(v).split('.').map(Number); const [x, y] = [p(a), p(b)]; for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return false; };
if (flags.includes('--check')) {
  const available = wsVersion === 'unversioned' || newer(pluginVersion, wsVersion);
  console.log(JSON.stringify({ workspace: ws, workspaceVersion: wsVersion, pluginVersion, updateAvailable: available }));
  process.exit(0);
}

const SKIP_DIRS = new Set(['node_modules', 'out', '.git', '.remotion']);
const walk = (dir, base = dir) => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n);
  if (SKIP_DIRS.has(n)) return [];
  return statSync(p).isDirectory() ? walk(p, base) : [relative(base, p)];
});
const managed = (rel) => {
  const r = rel.split('\\').join('/');
  if (['AGENTS.md', 'CLAUDE.md', 'package.json', 'package-lock.json', 'tsconfig.json', 'remotion.config.ts', '.gitignore', 'src/index.ts', 'src/Root.tsx', 'markets/README.md', 'library/README.md'].includes(r)) return 'replace';
  if (/^(src\/lib|scripts|presets|reference)\//.test(r)) return 'replace';
  if (/^markets\/[^/]+\/market\.md$/.test(r)) return 'replace';
  if (/^markets\/[^/]+\/voice\.json$/.test(r)) return 'merge-voice';
  if (/^(projects|public)\/demo(-sketch)?\//.test(r)) return 'replace';
  if (r === 'studio.json') return 'merge-studio';
  if (r === 'src/registry.ts') return 'keep';
  return 'keep';
};
const hash = (p) => createHash('sha1').update(readFileSync(p)).digest('hex');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupRoot = join(ws, '.studio-backup', stamp);
const report = { added: [], updated: [], merged: [], backedUp: [], unchanged: 0 };
const write = (dest, data) => { if (dry) return; mkdirSync(dirname(dest), { recursive: true }); writeFileSync(dest, data); };
const backup = (rel) => { report.backedUp.push(rel); if (!dry) { const b = join(backupRoot, rel); mkdirSync(dirname(b), { recursive: true }); cpSync(join(ws, rel), b); } };

// voice.json: template structure; your provider, voices and non-empty settings win; keys the template dropped go away.
const mergeVoice = (t, u) => {
  const out = {};
  for (const [k, v] of Object.entries(t)) {
    const uv = u?.[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) out[k] = mergeVoice(v, uv && typeof uv === 'object' ? uv : {});
    else out[k] = uv !== undefined && uv !== '' && uv !== null && k !== 'note' ? uv : v;
  }
  for (const k of ['voiceName']) if (u?.[k]) out[k] = u[k];
  return out;
};

for (const rel of walk(tpl)) {
  const mode = managed(rel);
  const src = join(tpl, rel);
  const dest = join(ws, rel);
  if (mode === 'keep') {
    if (!existsSync(dest)) { write(dest, readFileSync(src)); report.added.push(rel); }
    continue;
  }
  if (mode === 'merge-voice' || mode === 'merge-studio') {
    const t = JSON.parse(readFileSync(src, 'utf8'));
    if (!existsSync(dest)) { write(dest, JSON.stringify(t, null, 2) + '\n'); report.added.push(rel); continue; }
    const u = JSON.parse(readFileSync(dest, 'utf8'));
    const merged = mode === 'merge-voice' ? mergeVoice(t, u) : { ...t, ...u, templateVersion: pluginVersion, workspaceVersion: t.workspaceVersion };
    const text = JSON.stringify(merged, null, 2) + '\n';
    if (text !== readFileSync(dest, 'utf8')) { backup(rel); write(dest, text); report.merged.push(rel); } else report.unchanged++;
    continue;
  }
  if (!existsSync(dest)) { write(dest, readFileSync(src)); report.added.push(rel); continue; }
  if (hash(src) === hash(dest)) { report.unchanged++; continue; }
  backup(rel);
  write(dest, readFileSync(src));
  report.updated.push(rel);
}
// Stamp the version even if studio.json matched.
if (!dry) {
  const s = JSON.parse(readFileSync(join(ws, 'studio.json'), 'utf8'));
  if (s.templateVersion !== pluginVersion) { s.templateVersion = pluginVersion; writeFileSync(join(ws, 'studio.json'), JSON.stringify(s, null, 2) + '\n'); }
}
const pkgChanged = report.updated.includes('package.json') || report.added.includes('package.json') || report.updated.includes('package-lock.json');
console.log(`${dry ? 'DRY RUN: ' : ''}workspace ${wsVersion} → ${pluginVersion}`);
console.log(`added ${report.added.length}, updated ${report.updated.length}, merged ${report.merged.length}, unchanged ${report.unchanged}`);
for (const k of ['added', 'updated', 'merged']) for (const f of report[k]) console.log(`  ${k}: ${f}`);
if (report.backedUp.length) console.log(`backups of replaced files: ${relative(process.cwd(), backupRoot) || backupRoot}`);
console.log(pkgChanged ? 'NEXT: npm install' : 'NEXT: none');
