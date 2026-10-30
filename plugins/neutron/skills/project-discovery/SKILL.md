---
name: project-discovery
description: Before changing code, understand the part of a project a Jira ticket touches — who uses it, the business flow, the code and tests involved, open questions — and plan the ticket's starting branch and PR target. Use when starting on a project or a new ticket, or when asked to explore, map or explain a codebase for a task. Read-only; not for implementing the change.
---

# Project discovery

Give the engineer what they need before the first code change: who the feature is for, how the flow works today, where the code and tests are, what is still unclear, and which branch the work starts from and merges into.

## Inputs

- A Jira ticket key or URL, such as `ENG-123`. Without one, ask for a short description of the assignment.
- The repository you are run in. If the assignment spans several repositories, ask which ones to include.

## Boundaries

- Don't change code, configuration or data. Don't switch branches, create branches, merge or push. `git fetch` is fine: it only updates remote refs.
- Running the app or tests is a separate step; don't start servers or run migrations here.
- Don't guess business rules. An unclear rule is a question for the person responsible for the requirement, not an assumption.
- If you see a secret or real personal data, say where it is without copying the value.

## 1. Read the ticket

- Use the connected Jira MCP, or `acli jira workitem view <KEY> --fields '*all' --json`. Read the description, acceptance criteria, comments, links to other tickets, and the **Fix Version**.
- If you can't reach Jira, ask the user to paste the ticket. Don't invent acceptance criteria.

## 2. Read how this project works

- Read `AGENTS.md` or `CLAUDE.md`, the README and the docs index first, then only the docs the ticket touches: architecture notes, runbooks, API docs.
- Note how the project is set up, run and tested, as written in its docs. You report these; you don't run them.

## 3. Trace the business flow

- Find who uses this feature (roles, apps, other systems) and what they are trying to get done.
- Follow one real path through the code from the entry point (route, screen, job, webhook) to where data is stored or an external call is made. Name the files and functions in order.
- Find the tests that cover this path, and the parts nothing tests.
- Mark where the ticket's change fits in that flow, and what else depends on it: other screens, jobs, API clients, installed app versions.
- Note when the change touches something costly to get wrong: permissions or tenant-scoped data, database schema, money or points, retries and external calls, SMS or other paid APIs.

## 4. Plan the branch

Follow [references/branching.md](references/branching.md).

- Take the target release from the ticket's Fix Version. If it's missing, say so and ask; don't pick a release yourself.
- `git fetch --prune`, then check that the latest production release is merged back into `main`, and which release branches exist.
- Say whether `main` is behind production, whether a Release Merge branch is likely (the release already changes the same files), and which other tickets would come along or be left out.

## 5. Report

Write the report in the format in [references/report.md](references/report.md), in the language the user wrote in. End with the open questions. Then stop; implementing comes next, after the engineer agrees the plan.
