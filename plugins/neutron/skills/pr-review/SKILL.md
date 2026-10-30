---
name: pr-review
description: Review a pull request or merge request against its Jira ticket, read-only, and report evidence-backed findings for a human approver. Use when asked to review a PR, MR, branch or diff before approval. Not for fixing code, posting comments or approving.
---

# PR review

An advisory review of one PR at one commit. A person approves the PR; you never do. Your job is findings the approver can trust: each one tied to a file and line, with evidence.

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

## 2. Read the ticket and the project's rules

- **Ticket:** use the connected Jira MCP, or `acli jira workitem view <KEY> --fields '*all' --json`. Read the description, acceptance criteria and comments. If you can't reach Jira, ask the user to paste them. Never invent acceptance criteria.
- **Repository:** read `AGENTS.md` or `CLAUDE.md`, the docs index, and any runbook or contributing doc the diff touches. The project's rules apply alongside the checks below; on a client project, the client's stated requirements take precedence.

## 3. Review, most costly mistakes first

1. **Behaviour.** Check each acceptance criterion against the code, including empty, error and boundary cases.
2. **Tests.** Do they check the criteria, or restate the implementation's assumptions? A bug fix needs a regression test that fails without the fix.
3. **Access.** Every path to a record checks tenant or ownership and the action's permission on the server: APIs, exports, downloads, jobs and callbacks. A hidden button is not a check.
4. **Data.** Old code must keep working against the new schema during a rolling deploy; no rename or drop in one release; migrations run as their own deploy step, never on app start; backfills are resumable jobs; nothing is lost.
5. **Retries and external effects.** Operations have stable identities and idempotency; a timeout is an unknown outcome, not a failure; nothing sends, charges or orders twice.
6. **Compatibility.** API changes keep every supported client and installed app version working.
7. **Security basics.** Validation and permissions on the server; no SQL built from strings or user input passed to a shell; CSRF protection on state changes; errors don't expose stack traces or internals; no secrets or personal data in code, fixtures or logs; new or upgraded dependencies checked.
8. **Scope and docs.** One purpose per PR; docs and agent instructions updated in the same PR; the description says why, links the ticket, gives evidence and states what wasn't verified.
9. **CI on the head commit.** Required checks pass. Look at skipped jobs and report-only findings; a green summary can hide missing evidence.

When the diff touches these, also check:

- **Points, vouchers, credits, balances:** amounts are integers or decimals, never floats; every change is an append-only ledger entry; the server decides owner, eligibility and amount; limits are enforced by the database, not check-then-write; idempotency keys come from the business event, not the request; codes can't be guessed and failed attempts are limited.
- **SMS, OTP and other paid calls:** a server-verified bot check; rate limits per number, IP, device and account plus a global ceiling, checked before the provider call; sends only to allowed countries, taken from the parsed number; a spend cap and a kill switch that works without a deploy.
- **Bulk issuance:** an idempotent, resumable job; the approved input can't change after approval.

Leave formatting and style to the repository's linters unless it hides a bug.

## 4. Prove each finding

- Back every defect with evidence: a failing test or probe you ran in the worktree, a command and its output, a request and its response, or the exact code path. Don't commit it, and delete the worktree when you're done.
- If you can't prove it, report it as a question, not a defect.
- Drop what you can't support. A few proven findings are worth more than many guesses.

## 5. Report

Write the report in the format in [references/report.md](references/report.md), in the language the user wrote in. Then stop. Don't offer to fix, approve or merge.
