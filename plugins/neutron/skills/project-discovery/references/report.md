# Project discovery report

Use this structure. Link code as paths relative to the repository root with line numbers, such as `app/models/order.rb:42`.

```text
Project discovery: <KEY> · <ticket title>
Repository: <name> at <commit SHA on the current branch>

The assignment
- Outcome: <what the ticket wants, in one or two sentences>
- Acceptance criteria: <numbered list from the ticket, or "none in the ticket">
- Fix Version: <release, or "not set">

Who uses it
- <role or system>: <what they need to get done>

Business flow today
1. <entry point> — <file:line> — <what happens>
2. ...
Where the change fits: <step number and what changes there>

<Mermaid flowchart of the same steps, ten nodes at most>

Code and tests
| Area | Code | Tests | Notes |
|------|------|-------|-------|

Costly-to-get-wrong areas this touches
- <permissions / schema / money or points / retries and external calls / paid APIs>: <where, and why it matters here>
  (or "none found")

How to run and test it, per the project's docs
- <commands as documented, or "not documented">

Branch plan
- Start from: <branch> · PR into: <branch>
- main merged back with the latest production release: <yes / no / can't tell, and how you checked>
- Release Merge branch likely: <yes / no, and why>
- Other tickets that come along or are left out: <list or none>
- Remote refs fetched at: <time>

Open questions for the person responsible for the requirement
1. <question, and what it changes in the code>
```

Keep it to what the engineer needs before starting. If a section has nothing, say so in one line rather than padding it.
