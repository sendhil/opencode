# Local Build

Use this when replacing the Homebrew `opencode` install with a binary built from this repository, or when rebuilding and reinstalling the local binary after source changes.

## Current assumptions

These instructions assume:

- you are running from this repository root
- Bun is available at `/opt/homebrew/bin/bun`
- the local install target is `~/.local/bin/opencode`
- `~/.local/bin` is already on `PATH`
- the machine target is `darwin-arm64`
- `OPENCODE_VERSION` is exported in your shell (see "Version override" below)

## Version override

The build script normally produces a `0.0.0-{branch}-{timestamp}` preview
version on a non-`latest` channel. Some external tools (e.g.
[Cmux's fork-support gate](https://github.com/manaflow-ai/cmux/blob/main/Sources/AgentForkSupport.swift))
parse `opencode --version` and require a SemVer ≥ 1.14.50, so we override the
build-time version with `OPENCODE_VERSION` to keep the binary visible to those
tools.

This is set in `~/.bash_local` (sourced by `~/.zshrc`):

```sh
export OPENCODE_VERSION=1.15.6-fork
```

Bump the `major.minor.patch` portion to track upstream when it moves. The
`-fork` suffix marks it as a locally built binary so `opencode --version`
output stays distinguishable from a real upstream release.

## First-time replacement of the Homebrew install

Check the current install first:

```sh
which -a opencode
opencode --version
brew list --formula | rg '^opencode$'
```

If `opencode` is installed via Homebrew, remove it:

```sh
brew uninstall opencode
```

Build the local binary:

```sh
/opt/homebrew/bin/bun install
/opt/homebrew/bin/bun run --cwd packages/opencode script/build.ts --single --skip-install
```

Install the built binary into `~/.local/bin`:

```sh
install -d -m 755 ~/.local/bin
install -m 755 packages/opencode/dist/opencode-darwin-arm64/bin/opencode ~/.local/bin/opencode
codesign --force --sign - ~/.local/bin/opencode
```

On macOS, overwriting an existing signed binary invalidates its signature, and Gatekeeper will SIGKILL the process on next launch. The `codesign --force --sign -` step re-applies an ad-hoc signature (what Bun's single-file build produces) to the installed copy.

Verify the local install:

```sh
which opencode
opencode --version
opencode session list --max-count 3 --format json
```

Expected result:

- `which opencode` resolves to `~/.local/bin/opencode`
- `opencode --version` reports the value of `OPENCODE_VERSION` (e.g.
  `1.15.6-fork`); without that env var set, falls back to a `0.0.0-*` dev
  build
- `session list` can see the stable session history

## Rebuild and reinstall after source changes

If dependencies changed, run:

```sh
/opt/homebrew/bin/bun install
```

Rebuild and reinstall:

```sh
/opt/homebrew/bin/bun run --cwd packages/opencode script/build.ts --single --skip-install
install -m 755 packages/opencode/dist/opencode-darwin-arm64/bin/opencode ~/.local/bin/opencode
codesign --force --sign - ~/.local/bin/opencode
```

Verify again:

```sh
opencode --version
opencode session list --max-count 3 --format json
```

## Notes

- Local builds in this repo reuse the stable session database at `~/.local/share/opencode/opencode.db` whenever the version starts with `0.0.0-` or contains `-fork`, or when the channel is `latest`/`beta`/`local`. The `-fork` suffix recognition lets `OPENCODE_VERSION=1.15.6-fork` keep DB sharing intact while still passing external SemVer gates
- Local builds skip the startup release update prompt for the same set: `0.0.0-*`, `*-fork`, or channel `local`
- These instructions intentionally use `~/.local/bin`, not `~/.opencode/bin`

## Troubleshooting

If `which opencode` still points at Homebrew:

```sh
which -a opencode
```

If Bun is not on `PATH`, use the explicit path:

```sh
/opt/homebrew/bin/bun --version
```

If the rebuilt binary does not pick up the latest changes, reinstall it explicitly:

```sh
install -m 755 packages/opencode/dist/opencode-darwin-arm64/bin/opencode ~/.local/bin/opencode
codesign --force --sign - ~/.local/bin/opencode
```

If `opencode --version` exits with SIGKILL (137) right after an overwrite, the code signature was invalidated. Re-sign:

```sh
codesign --force --sign - ~/.local/bin/opencode
```
