---
name: pr-review
description: Review a pull request or merge request against its Jira ticket and Neutron's engineering handbook, read-only, and report evidence-backed findings for a human approver. Use when asked to review a PR, MR, branch or diff before approval. Not for fixing code, posting comments or approving.
---

# PR review

An advisory review of one PR at one commit. A person approves the PR; you never do. Your job is findings the approver can trust: each one tied to a file and line, with evidence.

Handbook: `https://HANDBOOK_URL_NOT_SET`
If the line above still says `HANDBOOK_URL_NOT_SET`, ask the user for the handbook's address before step 2.

## Inputs

- The PR or MR URL (GitHub or GitLab). Without one, a branch name or diff.
- The Jira ticket key, such as `ENG-123`. Look for it in the PR title, branch name and description; ask if there is none.

## Boundaries

- Keep the review read-only. Don't edit files, commit, push, comment on the PR, approve or merge. Post nothing unless the user asks.
- Local builds and tests are fine. Don't run anything that writes to a shared or production system.
- If you see a secret or real personal data, report where it is without copying the value.

## 1. Pin what you are reviewing

- GitHub: `gh pr view <url> --json number,title,body,baseRefName,headRefName,headRefOid,files,statusCheckRollup` and `gh pr diff <url>`.
- GitLab: `glab mr view <id>` and `glab mr diff <id>`.
- Record the head commit SHA. Every finding is about that commit; if it changes during the review, say so in the report.
- To run tests, check the head commit out in a separate worktree. Don't switch the user's branch.

## 2. Read the ticket and the rules

- **Ticket:** use the connected Jira MCP, or `acli jira workitem view <KEY> --fields '*all' --json`. Read the description, acceptance criteria and comments. If you can't reach Jira, ask the user to paste them. Never invent acceptance criteria.
- **Repository:** read `AGENTS.md` or `CLAUDE.md`, the docs index, and any runbook or contributing doc the diff touches. The project's own rules apply alongside the handbook; on a client project, the client's stated requirements take precedence.
- **Handbook:** fetch `<Handbook>/requirements.json`. Always apply the requirements of the `pr` and `review` tasks. Add tasks by what the diff touches:

  | The diff touches | Add task |
  |---|---|
  | Schema or data migrations | `migration` |
  | Permissions, tenant-scoped data, exports, downloads, callbacks | `access` |
  | Points, vouchers, credits, balances | `value`, and `bulk` or `campaign` when relevant |
  | SMS, OTP or other paid API calls | `otp` |

  Read a requirement's page (its `markdown` path, appended to the handbook URL) when you need the detail behind it. If the handbook can't be reached, say so in the report and continue with step 3.

## 3. Review, most costly mistakes first

1. **Behaviour.** Check each acceptance criterion against the code, including empty, error and boundary cases.
2. **Tests.** Do they check the criteria, or restate the implementation's assumptions? A bug fix needs a regression test that fails without the fix.
3. **Access.** Every path to a record checks tenant or ownership and the action's permission on the server: APIs, exports, downloads, jobs and callbacks. A hidden button is not a check.
4. **Data.** Old code must keep working against the new schema during a rolling deploy; no rename or drop in one release; backfills are resumable; nothing is lost.
5. **Retries and external effects.** Operations have stable identities and idempotency; a timeout is an unknown outcome, not a failure; nothing sends, charges or orders twice.
6. **Compatibility.** API changes keep every supported client and installed app version working.
7. **Security basics.** Validation and permissions on the server; no SQL built from strings or user input passed to a shell; CSRF protection on state changes; errors don't expose stack traces or internals; no secrets or personal data in code, fixtures or logs; new or upgraded dependencies checked.
8. **Scope and docs.** One purpose per PR; docs and agent instructions updated in the same PR; the description says why, links the ticket, gives evidence and states what wasn't verified.
9. **CI on the head commit.** Required checks pass. Look at skipped jobs and report-only findings; a green summary can hide missing evidence.

Leave formatting and style to the repository's linters unless it hides a bug.

## 4. Prove each finding

- Back every defect with evidence: a failing test or probe you ran in the worktree, a command and its output, a request and its response, or the exact code path. Don't commit it, and delete the worktree when you're done.
- If you can't prove it, report it as a question, not a defect.
- Drop what you can't support. A few proven findings are worth more than many guesses.

## 5. Report

Write the report in the format in [references/report.md](references/report.md), in the language the user wrote in. Then stop. Don't offer to fix, approve or merge.
