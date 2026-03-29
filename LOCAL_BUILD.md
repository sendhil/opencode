# Local Build

Use this when replacing the Homebrew `opencode` install with a binary built from this repository, or when rebuilding and reinstalling the local binary after source changes.

## Current assumptions

These instructions assume:

- you are running from this repository root
- Bun is available at `/opt/homebrew/bin/bun`
- the local install target is `~/.local/bin/opencode`
- `~/.local/bin` is already on `PATH`
- the machine target is `darwin-arm64`

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
rm -f ~/.local/bin/opencode
cp packages/opencode/dist/opencode-darwin-arm64/bin/opencode ~/.local/bin/opencode
chmod 755 ~/.local/bin/opencode
```

> **macOS Sequoia note**: Always `rm` before `cp`. Copying over an existing binary
> inherits a `com.apple.provenance` extended attribute that causes macOS to kill
> the process on launch from persistent paths like `~/.local/bin`.

Verify the local install:

```sh
which opencode
opencode --version
opencode session list --max-count 3 --format json
```

Expected result:

- `which opencode` resolves to `~/.local/bin/opencode`
- `opencode --version` reports a local `0.0.0-*` dev build
- `session list` can see the stable session history

## Rebuild and reinstall after source changes

If dependencies changed, run:

```sh
/opt/homebrew/bin/bun install
```

Rebuild and reinstall:

```sh
/opt/homebrew/bin/bun run --cwd packages/opencode script/build.ts --single --skip-install
rm -f ~/.local/bin/opencode
cp packages/opencode/dist/opencode-darwin-arm64/bin/opencode ~/.local/bin/opencode
chmod 755 ~/.local/bin/opencode
```

Verify again:

```sh
opencode --version
opencode session list --max-count 3 --format json
```

## Notes

- Local `0.0.0-*` builds in this repo now reuse the stable session database at `~/.local/share/opencode/opencode.db`
- Local `0.0.0-*` builds in this repo now skip the startup release update prompt
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
rm -f ~/.local/bin/opencode
cp packages/opencode/dist/opencode-darwin-arm64/bin/opencode ~/.local/bin/opencode
chmod 755 ~/.local/bin/opencode
```

If the binary is killed immediately on launch (`KILL` / exit 137), the
`com.apple.provenance` xattr is likely present. Ensure you `rm` before `cp`
(see above). You can verify with:

```sh
xattr ~/.local/bin/opencode
```

If `com.apple.provenance` appears, remove and recopy:

```sh
rm -f ~/.local/bin/opencode
cp packages/opencode/dist/opencode-darwin-arm64/bin/opencode ~/.local/bin/opencode
chmod 755 ~/.local/bin/opencode
```
