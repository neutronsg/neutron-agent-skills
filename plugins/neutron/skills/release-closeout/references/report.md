# Release closeout report and PR description

Use the same structure for the PR description and for the inspection record when nothing changes. Reviewers read the file table first, then the content.

```text
Docs closeout: <version>
main at <SHA> · Previous production: <tag or SHA> · Release diff: <n> files changed

Files
| File | Action | Reason |
|------|--------|--------|
| docs/plans/export-plan.md | Delete | A plan for ENG-123, now implemented; the ticket keeps the context |
| README.md | Correct | Setup used `bin/setup`, which the release removed; now `bin/dev` |
| AGENTS.md | Correct | Test command and docs index updated |
| docs/runbooks/exports.md | Add | The release added a queued export job with no runbook |

Docs index: <updated | added to AGENTS.md | unchanged>
Agent files: AGENTS.md <changed / unchanged> · CLAUDE.md <is "@AGENTS.md" / moved N lines into AGENTS.md>

Inspected without change: <n> files — <list, or the folders covered>

Left for tickets
- <work found that isn't a docs fix, such as missing tests or a broken script>

This PR changes documentation only.
```

Every row needs a concrete reason a reviewer can check in a minute: what the doc said, what the code does now, or why nobody needs the file. "Outdated" alone is not a reason.

When nothing changes, replace "This PR changes documentation only." with "No PR: every doc matched the code on <SHA>."
