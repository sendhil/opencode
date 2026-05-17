# Fork Changes

Changes made in this fork (`sendhil/opencode`) on top of upstream
(`anomalyco/opencode`).

Use this file to track what needs attention during upstream merges and which
changes are safe to drop if upstream adopts the same fix.

## Code Modifications

### fix(prompt): mark skill slash command templates as synthetic

- **Files**: `packages/opencode/src/session/prompt.ts`
- **Safe to drop on rebase**: No — unless upstream adopts the same fix
- **Description**: Skill content injected via slash commands (e.g.
  `/brainstorming …`) was displayed as the user's message in the TUI. Now
  marked `synthetic: true` on template-generated text parts so they're hidden
  from the UI but still sent to the LLM. A single visible part shows the slash
  command invocation the user typed.
- **Detect**: `cmd.source === "skill"` branch in `resolvePromptParts` /
  template-resolution path of `prompt.ts`. If upstream adds the same gating,
  drop this commit.

### fix(local): share stable sessions and skip updates for dev builds

- **Files**: `packages/opencode/src/cli/upgrade.ts`,
  `packages/opencode/src/installation/index.ts`,
  `packages/opencode/src/storage/db.ts` + tests
- **Safe to drop on rebase**: No — needed for running dev builds alongside
  stable installs
- **Description**: Adds `isEphemeralBuild()`, `usesSharedDatabase()`, and
  `shouldCheckForUpdates()` helpers on the `Installation` module. Builds
  whose version starts with `0.0.0-` OR contains `-fork` share the same
  SQLite database as the latest/beta channels and skip autoupdate checks, so
  running a locally built binary doesn't fork session history. The `-fork`
  recognition lets us override `OPENCODE_VERSION` (e.g.
  `OPENCODE_VERSION=1.15.6-fork`) at build time so external tools that parse
  `opencode --version` (e.g. Cmux's `>=1.14.50` fork-support gate) still see
  a SemVer-shaped string while keeping local-build semantics intact. See
  `LOCAL_BUILD.md` for the env-var setup.

## Doc/Tooling Only (safe to drop)

### docs: local build guide + Claude skill

- **Files**: `LOCAL_BUILD.md`, `.claude/skills/local-build/SKILL.md`,
  `.gitignore`

### docs: upstream merge skill

- **Files**: `.claude/skills/upstream-merge/SKILL.md`

## Changes Previously Carried, Now Dropped

These lived on the fork at one point but have since been removed.

### fix(tui): set fg before content to prevent white text in unstyled code blocks — DROPPED

- **Reason**: Verified on `upstream/dev` tip — fenced code blocks, diffs, and
  markdown all render correctly on light themes without our patch. Either
  upstream fixed it via the markdown-renderable flip (#27421) or the
  underlying renderer changed. Re-add if regression observed; the fix is
  trivial (move `fg` attribute before `content` on `<code>`, `<markdown>`,
  `<diff>`).

### feat(webfetch): readability extraction + session cache — DROPPED

- **Reason**: Not actively used; the cf-mitigated retry portion of our
  original patch is now upstream. The readability extraction + per-session
  cache was a token optimization for webfetch-heavy sessions; not worth the
  ongoing rebase cost.

### perf(tools): reduce tool description token usage — DROPPED

- **Reason**: Upstream renamed `bash.ts` → `shell.ts` as part of a tool
  framework refactor (PR #23244 on `anomalyco/opencode`); the `bash.txt`
  file targeted by the trim no longer exists. Residual `task.txt` /
  `todowrite.txt` savings were marginal.

### feat(tui): /clear slash command — DROPPED

- **Reason**: Upstream still aliases `/clear` to `/new` (which navigates
  home and starts a fresh session). The fork's "preserve session, wipe
  messages" variant was nice-to-have; `/new` covers the common case.

### fix(cache): split static/dynamic system prompt + cache instruction reads — DROPPED

- **Reason**: Upstream `packages/opencode/src/session/llm.ts` already
  performs the two-part system-prompt split that our patch implemented
  (rejoins `system.length > 2 && system[0] === header` after the
  `experimental.chat.system.transform` plugin hook).
