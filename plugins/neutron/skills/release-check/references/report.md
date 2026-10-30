# Release check report

Use this structure. The release record is what approvers read; the sections before it are what the PM resolves first.

```text
Release check: <version> on <release branch>
Release head: <SHA> · Production now: <tag or SHA> · Checked: <date and time>

Blocking: <number> mismatches, <number> tickets without evidence — or "none"

Mismatches
| Ticket or change | Problem | Where |
|------------------|---------|-------|
| ENG-124 | In the Fix Version, no merged PR | — |
| a1b2c3d "fix typo" | No ticket | commit |

Patch-release tickets from main (expected)
- <KEY> (<patch version>) — or "none"

Tickets
| Ticket | Status | PR | Evidence | Not verified |
|--------|--------|----|----------|--------------|

Changes that need a recovery plan
| Change | Where | How it is undone | What stays behind |
|--------|-------|------------------|-------------------|

Release record (draft)
| Record | Content |
|--------|---------|
| Version | <branch> at <SHA>; production runs <version> at <SHA>. Artifact: <digest or build>; target: <environment>. |
| Evidence | <CI run for the head commit; what was verified, where> |
| Remaining gaps | <what isn't verified, and what resolves it before promotion> |
| Recovery | <per change, from the table above> |
| Success check | <the metric or flow to watch after deploy, for how long, and who watches> |
```

Leave Success check as a question for the team if the tickets don't suggest one. Never mark a gap as resolved without evidence.
