# Install instructions

## Codex

Follow the Codex installation section in [README.md](README.md). For an extracted zip,
keep the folder at a stable location and add that absolute folder path with
`codex plugin marketplace add /absolute/path/to/explainer-studio`, then install
`explainer-studio@explainer-studio`. Start a new session and use the `studio-setup`
skill with the chosen workspace folder (or `update-studio` for an existing workspace).
Read [HOSTS.md](HOSTS.md) for invocation and agent role compatibility.

## Claude Code

The user gave you this zip to install the Explainer Studio plugin. Do this:

1. Unzip it to a stable folder that will survive this session, e.g.
   `~/.claude/local-plugins/explainer-studio/` (create it; if it exists, ask before replacing).
   The folder must directly contain `.claude-plugin/`, `skills/`, `agents/`.
2. Run:
   ```
   claude plugin marketplace add ~/.claude/local-plugins/explainer-studio
   claude plugin install explainer-studio@explainer-studio
   ```
   Confirm with `claude plugin list`.
3. Tell the user to run `/reload-plugins` (or restart Claude Code) so the skills load.
4. Ask where to create the video workspace (default `./explainer-studio-workspace`), then follow
   `skills/studio-setup/SKILL.md` from the unzipped folder (its `template/` is next to it).
5. Finish by telling the user how to start: open Claude Code in the workspace and run
   `/explainer-studio:new-video <topic>`.

In a cloud session the install lasts only as long as the session's container; for a permanent
setup, push the folder to a GitHub repo and install from there (see README.md).
