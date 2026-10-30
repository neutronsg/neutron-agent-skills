# SSAT review report

Use this structure. Write the item rows so they can be pasted into the SSAT sheet's own columns.

```text
SSAT review: <system> · <environment(s)> · Checked <date>
Checklist: <file name> (<n> items) · Client checklist: <file or "none">

Go-live: blocked by <n> confirmed gaps and <n> items needing evidence | nothing open
RA proposals for a person to accept: <n>

Open gaps and RA proposals
| Item | Line | What is missing | Risk | Proposed fix | Proposed owner |
|------|------|-----------------|------|--------------|----------------|

Items
| Item | Applicability | Remarks (evidence per line) | Proposed status | Justification |
|------|---------------|------------------------------|-----------------|---------------|
| <code> | Yes | 1. <evidence: file:line, CI run, setting or command output> 2. ... | Closed | |
| <code> | No: <reason> | | NA | |
| <code> | Yes | 1. ... 2. Not met: <gap> | RA | <what's missing, risk, proposed fix> |
| <code> | Yes | 1. ... 2. Not checked: <what evidence is needed> | (needs evidence) | |

Could not check
- <item and line>: <what access or document is missing, and who could provide it>

Commands and probes run
- <each command, against which host, and when>
```

One example of weak and strong evidence for the same line:

- Weak: "5. Yes" — nobody can verify it; the scan might exist and only report.
- Strong: "5. The secrets job in the CI workflow fails a PR on any finding; run 4821 on commit 7d03f5b passed." — anyone can open the run and confirm it blocks.

End with: "Statuses are proposals. A person reviews each item and accepts any risk."
