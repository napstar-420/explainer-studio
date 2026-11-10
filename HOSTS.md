# Host compatibility

The skills, scripts, templates and agent role files are shared by Claude Code and Codex.
Resolve paths relative to the installed skill directory, never a hard-coded plugin cache.

- Claude Code: invoke `/explainer-studio:<skill> <arguments>`.
- Codex: select the installed skill with `$<skill>` (for example `$new-video`) or ask
  to use the Explainer Studio skill by name. Supply topic, flags and paths in the prompt.
- `$ARGUMENTS` in a skill means the arguments from that invocation or user prompt;
  it is not a shell environment variable to expand.
- Follow workspace `AGENTS.md` when present; also read `CLAUDE.md` for existing workspaces.
  New workspaces keep the shared rules in `AGENTS.md`, with `CLAUDE.md` as an entry point.
- Run another stage by reading its sibling `../<skill>/SKILL.md` and following it with
  the current workspace, slug and options. Do not assume a host-specific skill tool exists.
- Agent roles live in `agents/<role>.md` relative to the plugin root. Claude Code can use
  its named plugin agents. In Codex, read the role file and pass its body plus the stage's
  inputs to an available subagent. The `tools:` frontmatter names Claude tools; use the
  equivalent available file, shell, web and image tools in Codex. If delegation is unavailable,
  perform the role in the current agent; batch asset work sequentially. Preserve read-only
  restrictions for reviewers. Do not claim an independent review when you did it yourself.
- Use the host's available browser/image tools for screenshots and visual review; use
  Playwright only when installed. If a required capability is missing, report that limitation.
- Keep all review gates and placeholder disclosures specified by the workflow.
