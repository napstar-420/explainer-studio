---
name: update-studio
description: Update an existing Explainer Studio workspace (scripts, components, CLAUDE.md, presets, references, market packs) to the installed plugin's latest template in one step, keeping the user's projects, assets and chosen voices. Use when the user asks to update/upgrade the studio or workspace, after a plugin update, or when another skill reports the workspace is out of date.
argument-hint: "[workspace folder, default: current folder]"
---

# Update the studio workspace

`update.mjs` and the plugin's `template/` sit in this plugin: `update.mjs` is next to this
SKILL.md, the template is at `<this skill's base dir>/../studio-setup/template`.

1. Workspace = `$ARGUMENTS` or the current folder. It must contain `studio.json`; if it doesn't,
   offer `/explainer-studio:studio-setup` instead.
2. Run `node "<base dir>/update.mjs" "<base dir>/../studio-setup/template" "<workspace>" --dry-run`
   and summarise it in a line or two (files added/updated/merged; your projects untouched).
   Then run it for real without `--dry-run` (don't wait for approval unless the dry run lists
   updated files the user is likely to have edited by hand, such as `CLAUDE.md` or `src/lib/*`;
   backups are made either way).
3. If it prints `NEXT: npm install`, run `npm install` in the workspace.
4. Check: `npx tsc --noEmit` and `node scripts/set-voice.mjs --status --json`. If no voice is
   chosen for the workspace market and a provider is available, run the `pick-voice` skill.
5. Report: version change, what changed, where the backups are (`.studio-backup/<time>/`), and
   that projects, assets and voice choices were kept. If Claude Code was started in this folder,
   tell the user to restart it so the updated CLAUDE.md loads.
