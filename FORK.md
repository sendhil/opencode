# Fork Changes

Changes made in this fork (`sendhil/opencode`) on top of upstream (`anomalyco/opencode`).

Use this file to track what needs attention during upstream merges and which
changes are safe to drop if upstream adopts the same fix.

## Code Modifications

### fix(tui): set fg before content to prevent white text in unstyled code blocks

- **Commit**: `42c8899`
- **Files**: `packages/opencode/src/cli/cmd/tui/routes/session/index.tsx`,
  `packages/opencode/src/cli/cmd/tui/routes/session/permission.tsx`
- **Safe to drop on rebase**: Yes, if upstream fixes the same issue

### fix(local): share stable sessions and skip updates for dev builds

- **Commit**: `1767730`
- **Files**: `packages/opencode/src/cli/upgrade.ts`,
  `packages/opencode/src/installation/index.ts`,
  `packages/opencode/src/storage/db.ts` + tests
- **Safe to drop on rebase**: No — needed for running dev builds alongside stable

### fix(prompt): mark skill slash command templates as synthetic

- **Commit**: (pending)
- **Files**: `packages/opencode/src/session/prompt.ts`
- **Safe to drop on rebase**: No — unless upstream adopts the same fix
- **Description**: Skill content injected via slash commands was displayed as the
  user's message in the TUI. Now marked `synthetic` so it's hidden from the UI
  but still sent to the LLM. The visible user message shows the slash command
  invocation (e.g., `/brainstorming create a login page`).

### feat(tui): add /clear command to clear session messages and todos

- **Commit**: (this commit)
- **Files**: `packages/opencode/src/cli/cmd/tui/app.tsx`,
  `packages/opencode/src/cli/cmd/tui/routes/session/index.tsx`,
  `packages/opencode/src/server/routes/session.ts`,
  `packages/opencode/src/session/index.ts`
- **Upstream PR**: https://github.com/sst/opencode/pull/19543
- **Safe to drop on upstream merge**: Yes — drop when #19543 (or equivalent)
  lands in upstream. Our implementation adds a `Session.clearMessages` service
  method, a `POST /:sessionID/clear` server route, and a `/clear` slash command
  with confirmation dialog. Upstream's version may differ in detail; prefer
  upstream's when it merges.
- **Description**: Removes the `clear` alias from `/new` and adds a proper
  `/clear` command that deletes all messages and todos from the current session
  without deleting the session itself. Includes confirmation dialog and
  abort-if-busy handling. Cost display resets to $0 after clear (cost is derived
  from messages).

## Doc/Tooling Only (no code changes, safe to drop)

### docs: add local build guide and Claude skill for source installs

- **Commit**: `82a1d08`
- **Files**: `.claude/skills/local-build/SKILL.md`, `LOCAL_BUILD.md`

### docs: add upstream merge skill for fork sync

- **Commit**: `f4d663b`
- **Files**: `.claude/skills/upstream-merge/SKILL.md`
