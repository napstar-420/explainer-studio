import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const json = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'));
const claude = json('.claude-plugin/plugin.json');
const codex = json('.codex-plugin/plugin.json');
assert.equal(codex.name, claude.name);
assert.equal(codex.version, claude.version);
assert.equal(json('skills/studio-setup/template/studio.json').templateVersion, codex.version);
assert.equal(resolve(root, codex.skills), join(root, 'skills'));
const entry = json('.agents/plugins/marketplace.json').plugins[0];
assert.equal(resolve(root, entry.source.path), resolve(root));
assert.equal(entry.name, codex.name);
for (const skill of readdirSync(join(root, 'skills'))) {
  assert.ok(existsSync(join(root, 'skills', skill, 'SKILL.md')));
}
const temp = mkdtempSync(join(tmpdir(), 'explainer-plugin-test-'));
try {
  const ws = join(temp, 'workspace');
  cpSync(join(root, 'skills/studio-setup/template'), ws, { recursive: true });
  rmSync(join(ws, 'AGENTS.md'));
  writeFileSync(join(ws, 'CLAUDE.md'), 'local workspace instructions\n');
  const studio = JSON.parse(readFileSync(join(ws, 'studio.json')));
  studio.templateVersion = '1.3.0';
  studio.market = 'pk';
  writeFileSync(join(ws, 'studio.json'), JSON.stringify(studio));
  mkdirSync(join(ws, 'projects/custom'), { recursive: true });
  writeFileSync(join(ws, 'projects/custom/brief.md'), 'keep my project');
  const run = (...flags) => execFileSync(process.execPath, [join(root, 'skills/update-studio/update.mjs'), join(root, 'skills/studio-setup/template'), ws, ...flags], { encoding: 'utf8' });
  assert.equal(JSON.parse(run('--check')).updateAvailable, true);
  run('--dry-run');
  assert.equal(existsSync(join(ws, 'AGENTS.md')), false);
  assert.equal(readFileSync(join(ws, 'CLAUDE.md'), 'utf8'), 'local workspace instructions\n');
  run();
  assert.ok(existsSync(join(ws, 'AGENTS.md')));
  assert.match(readFileSync(join(ws, 'CLAUDE.md'), 'utf8'), /AGENTS.md/);
  const backups = readdirSync(join(ws, '.studio-backup'));
  assert.ok(backups.some((dir) => readFileSync(join(ws, '.studio-backup', dir, 'CLAUDE.md'), 'utf8') === 'local workspace instructions\n'));
  assert.equal(readFileSync(join(ws, 'projects/custom/brief.md'), 'utf8'), 'keep my project');
  assert.equal(JSON.parse(readFileSync(join(ws, 'studio.json'))).market, 'pk');
  assert.equal(JSON.parse(run('--check')).updateAvailable, false);
  writeFileSync(join(ws, 'AGENTS.md'), 'custom shared rules\n');
  run();
  assert.ok(readdirSync(join(ws, '.studio-backup')).some((dir) => existsSync(join(ws, '.studio-backup', dir, 'AGENTS.md')) && readFileSync(join(ws, '.studio-backup', dir, 'AGENTS.md'), 'utf8') === 'custom shared rules\n'));
  console.log('Plugin metadata and workspace migration checks passed.');
} finally {
  rmSync(temp, { recursive: true, force: true });
}
