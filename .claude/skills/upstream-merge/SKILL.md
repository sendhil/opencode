---
name: upstream-merge
description: Fetch the upstream OpenCode repository and merge the latest upstream dev branch into the current branch. Use when asked to sync with upstream, merge upstream changes into the current branch, or bring the latest anomalyco/opencode dev branch into a fork branch.
---

# Upstream Merge

Use this skill only inside the OpenCode repository root.

This repository is configured so:

- `origin` is the user's fork
- `upstream` is `anomalyco/opencode`
- `dev` is the integration branch

Unless the user explicitly asks for something else, fetch `upstream/dev` and merge it into the current branch.

## Workflow

1. Check the current repo state:
   - `git remote -v`
   - `git branch --show-current`
   - `git status --short --branch`
2. If the worktree is dirty, stop and report it.
   - Do not stash, commit, or discard changes automatically.
3. Fetch the latest upstream integration branch:
   - `git fetch upstream dev`
4. Merge `upstream/dev` into the current branch:
   - `git merge --no-edit upstream/dev`
5. Verify the result:
   - `git status --short --branch`
   - `git log --oneline --decorate -n 5`

## Guardrails

- Use merge, not rebase, unless the user explicitly asks for rebase
- Do not push unless the user explicitly asks
- Do not resolve merge conflicts automatically
- If the merge conflicts, stop immediately and report the conflicted files
- Prefer non-interactive git commands only

## Post-Merge: Check FORK.md for Superseded Patches

After a successful merge (no conflicts), check `FORK.md` for fork-specific
changes that may now be superseded by upstream:

1. Read `FORK.md` and find entries with an **Upstream PR** field
2. For each upstream PR URL, check if it was included in the merge:
   - `gh pr view <number> --repo sst/opencode --json state,mergedAt`
   - Or check the merge log for the PR's commits
3. If an upstream PR has been merged, report the FORK.md entry as
   **superseded** and recommend the user review it for removal
4. Do NOT automatically remove entries or revert fork commits — just report

## Reporting

When you finish, report:

- the current branch
- the upstream ref fetched
- whether the merge was fast-forward, merge-commit, or conflicted
- whether the branch is now ahead of `origin`
- any FORK.md entries that are now superseded by merged upstream PRs
