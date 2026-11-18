# PR review report

Use this structure. Keep it short: an approver should be able to act on it in a few minutes.

```text
PR review: <PR title> (<PR URL>)
Commit: <head SHA> · Ticket: <KEY>

Merge recommendation: Recommend merge | Needs changes | Hold — <decisive reason>

Findings, most severe first
| # | Severity | Where | Finding | Impact | Evidence | Suggested fix |
|---|----------|-------|---------|--------|----------|---------------|
| 1 | Blocker  | app/exports/controller.rb:42 | ... | ... | ... | ... |

Acceptance criteria
| Criterion | Where it's handled | Tested by | Status |
|-----------|--------------------|-----------|--------|

Checks
- CI on <SHA>: <passed | failed | pending | unverified>; skipped or report-only jobs: <list or none>
- Run locally: <commands and results, or "nothing run">

Safeguard tests (only for the areas the diff touches)
- Present: <test cases found, with file>
- Missing: <test cases the project should add>

Not verified
- <what you could not check, and why>
```

Lead with the recommendation for the reviewed commit. For a batch, give each PR a row with its SHA, recommendation and decisive reason.

- **Needs changes** when a Blocker, Major or other unmet project requirement calls for a change to the PR. Lead with the finding that drives the decision.
- **Hold** when a required check, integration prerequisite or material evidence gap prevents a merge recommendation. Name the condition that clears the hold. A check failure caused by a confirmed defect in the PR is **Needs changes**.
- **Recommend merge** when evidence supports the changed behaviour, required checks pass on the reviewed commit, and no Blocker or Major requires a fix before merge. State any agreed release prerequisite and when it must be verified.

Use the evidence appropriate to the change. A focused check can establish the affected behaviour. State what each check covered, including when CI only checked security or formatting. Record accepted deferrals with their conditions and apply exceptions to required checks under the project's rules.

Use a more specific disposition when the evidence calls for one, such as **Close as superseded** when the target branch already contains the intended change.

Severity:
- **Blocker:** wrong behaviour against a criterion, a security or access gap, data loss, or an irreversible effect.
- **Major:** a real defect with limited impact or missing regression coverage needed to verify a criterion.
- **Minor:** worth fixing, low risk.
- **Question:** you suspect a problem but couldn't prove it.

Where: the path relative to the repository root, with a line number, such as `app/models/coupon.rb:149`. Never a local absolute path or a temporary copy; the approver can't open those.

Evidence: say how you got it. If you wrote a probe script or test, keep it outside the repository, name what it ran, and delete it when you're done.
