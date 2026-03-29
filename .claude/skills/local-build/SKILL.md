---
name: local-build
description: Replace the Homebrew OpenCode install with a binary built from this repository, or rebuild and reinstall the local binary after source changes. Use when asked to install OpenCode from source, replace brew with a local build, rebuild and reinstall the local binary, or verify the local repo binary and PATH.
---

# Local Build

Read `LOCAL_BUILD.md` first. It is the human-facing source of truth for this workflow.

Use this skill only inside the OpenCode repository root.

## Modes

1. First-time replacement of the Homebrew install
2. Rebuild and reinstall after local source changes

## Workflow

1. Confirm the repo root contains `packages/opencode/script/build.ts`
2. Check the current install state:
   - `which -a opencode`
   - `opencode --version`
   - `brew list --formula | rg '^opencode$'`
3. If the user wants first-time replacement and Homebrew has `opencode` installed, uninstall it:
   - `brew uninstall opencode`
4. Build the local binary:
   - `/opt/homebrew/bin/bun install` when dependencies may be missing or stale
   - `/opt/homebrew/bin/bun run --cwd packages/opencode script/build.ts --single --skip-install`
5. Install the built binary to `~/.local/bin/opencode`:
   - **Always `rm` before `cp`** to avoid macOS `com.apple.provenance` xattr issues.
     On macOS Sequoia, copying over an existing binary inherits a provenance tag
     that causes the OS to kill the process on launch from persistent paths.
   - `rm -f ~/.local/bin/opencode && cp packages/opencode/dist/opencode-darwin-arm64/bin/opencode ~/.local/bin/opencode`
6. Verify:
   - `which opencode`
   - `opencode --version`
   - `opencode session list --max-count 3 --format json`

## Guardrails

- Prefer `~/.local/bin/opencode` as the install target
- Do not install to `~/.opencode/bin`
- Do not edit shell init files unless the user explicitly asks
- Do not push or commit unless the user explicitly asks
- Only uninstall the Homebrew formula when the user explicitly wants replacement
- Use escalated commands for Homebrew operations and writes outside the active workspace

## Expected behavior for this repo

- Local `0.0.0-*` builds share the stable session database
- Local `0.0.0-*` builds skip the startup release update prompt

## Reporting

When you finish, report:

- whether Homebrew `opencode` was removed
- the installed binary path
- the built version
- whether `session list` can see stable sessions
