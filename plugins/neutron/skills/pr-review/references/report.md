# PR review report

Use this structure. Keep it short: an approver should be able to act on it in a few minutes.

```text
PR review: <PR title> (<PR URL>)
Commit: <head SHA> · Ticket: <KEY>

Verdict: Ready for human review | Needs changes | Blocked — <one line why>

Findings, most severe first
| # | Severity | Where | Finding | Impact | Evidence | Suggested fix |
|---|----------|-------|---------|--------|----------|---------------|
| 1 | Blocker  | app/exports/controller.rb:42 | ... | ... | ... | ... |

Acceptance criteria
| Criterion | Where it's handled | Tested by | Status |
|-----------|--------------------|-----------|--------|

Checks
- CI on <SHA>: <passed | failed | pending>; skipped or report-only jobs: <list or none>
- Run locally: <commands and results, or "nothing run">

Safeguard tests (only for the areas the diff touches)
- Present: <test cases found, with file>
- Missing: <test cases the project should add>

Not verified
- <what you could not check, and why>
```

Verdict: **Blocked** when any Blocker exists; **Needs changes** when there are Majors but no Blocker; **Ready for human review** otherwise.

Severity:
- **Blocker:** wrong behaviour against a criterion, a security or access gap, data loss, or an irreversible effect.
- **Major:** a real defect or a missing test for a criterion, with limited impact.
- **Minor:** worth fixing, low risk.
- **Question:** you suspect a problem but couldn't prove it.

Where: the path relative to the repository root, with a line number, such as `app/models/coupon.rb:149`. Never a local absolute path or a temporary copy; the approver can't open those.

Evidence: say how you got it. If you wrote a probe script or test, keep it outside the repository, name what it ran, and delete it when you're done.

End with one line: "AI review is advisory. A person approves this PR."
