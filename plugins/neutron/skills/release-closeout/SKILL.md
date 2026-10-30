---
name: release-closeout
description: After a release is merged back into main, align the repository's docs with the code — correct what drifted, add what is missing, merge or move what is misplaced, delete what describes nothing current — and open a docs-only PR with a file-by-file table, or report what was inspected when nothing needs changing. Use for release closeout, docs cleanup after a release, or keeping AGENTS.md, CLAUDE.md, the README and runbooks true. Never changes code; never merges.
---

# Release closeout

Agents leave plans, summaries and analyses behind, and docs drift from the code with every release. A doc that describes nothing current misleads the next person and the next agent more than a missing one. This skill brings the docs back in line once per release.

## Inputs

- The release version, such as `2.8.0`.
- The previous production commit or tag, to see what this release changed.

## Boundaries

- Change documentation only: Markdown and other doc files, `AGENTS.md`, `CLAUDE.md`, the README, runbooks, the docs index. Never code, configuration, tests or CI.
- Work in a separate worktree on a new docs branch. Don't switch or change the user's checkout.
- You may commit to the docs branch, push it and open a PR. Never merge it, and never push to `main` or a release branch.
- Commit with the user's own git identity. Don't set an author or committer: the engineer owns this PR.
- Delete rather than archive: git history and the tickets keep the context. Every deletion appears in the PR's table with its reason.
- Don't create or change Jira tickets. List leftover work for the engineer to ticket.

## 1. Confirm the release is merged back

- `git fetch --prune`. Check that the release is on `main`: `git merge-base --is-ancestor origin/<release-branch> origin/main`.
- If it isn't, stop and say so: closeout runs on what is in production.
- Create the worktree: `git worktree add -b docs/<version>-closeout <path> origin/main`.

## 2. Find the docs and the index

- List every doc file: Markdown and text docs anywhere in the repo, plus `AGENTS.md`, `CLAUDE.md`, READMEs, runbooks, ADRs, and docs folders. Skip vendored and generated folders (`node_modules`, `vendor`, build output).
- Find the docs index: a list in `AGENTS.md`, or a file it points to, that names each doc and its purpose. If there is none, plan to add one to `AGENTS.md`.

## 3. Check each doc against the code

Start with what the release changed, `git diff --stat <previous-production>..origin/main`, since that's where drift is likeliest. Then cover every doc, because orphans from earlier releases matter too.

For each doc, check that:
- commands, scripts, file paths, environment variables, endpoints and job names it mentions exist in the code on `main`;
- the behaviour it describes matches the code;
- it appears in the docs index with a purpose that still holds.

Decide one action per doc:

| Action | When |
|---|---|
| Keep | Accurate and indexed. |
| Correct | Describes something current, but wrongly. |
| Add | The release added something an engineer or agent can't work out from the code: a new environment variable, job, integration or runbook step. |
| Merge | Two docs cover the same thing. |
| Move | Accurate, but in the wrong place for its readers. |
| Delete | A plan, summary, analysis or ticket note left in the repo; or describes nothing current; or nobody can place it. |

## 4. Check the agent files

- `AGENTS.md` holds what an agent can't guess: the exact commands to install, run and test; the conventions the code follows; where the docs live (the docs index); and gotchas that have caught agents before.
- It holds no changelog, plans, ticket notes, or rules a linter or test already enforces. Remove stale lines.
- `CLAUDE.md` is the single line `@AGENTS.md`. Move anything else in it into `AGENTS.md`.

## 5. Make the changes, or record the inspection

- If anything needs changing: make the doc edits in the worktree, update the docs index, commit, push the branch and open a PR into `main`. Use the PR description in [references/report.md](references/report.md).
- If nothing needs changing: don't open a cosmetic PR. Report what you inspected and the evidence, in the same format.
- Remove the worktree when you're done.

## 6. Report

Report in the format in [references/report.md](references/report.md), in the language the user wrote in, with the PR link if you opened one. Then stop. The closeout PR should merge before the next release branch is cut, so it inherits current docs.
