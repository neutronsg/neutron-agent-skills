# Branch plan

Neutron's default branching. A project's own rules (its `AGENTS.md`, docs or the client's process) take precedence where they differ; say which you followed.

## Branch types

| Branch | Purpose |
|---|---|
| `main` | Latest released code after merge-back; the base for new work. |
| Ticket, such as `feat/ENG-123` | One ticket's code and tests, nothing else. |
| Release, such as `release/2.8.0` | The tickets selected for one release. A candidate until approved and shipped. |
| Release Merge, such as `feat/ENG-123-RM1` | A temporary branch for resolving conflicts between a ticket and a release. |
| Fix, such as `fix/ENG-130` | An urgent production fix, or a fix to a candidate bug that has no ticket branch. |

## Start and target

| The change | Start from | Open the PR into |
|---|---|---|
| Planned ticket | Current `main` | The release branch for the ticket's Fix Version |
| Fix to your ticket before release | The original ticket branch | The same release, through its Release Merge branch if one is used |
| Candidate bug with no ticket branch | A new fix branch from that release branch | The same release branch |
| Urgent production fix | Current `main` | Its own patch release branch, such as `release/2.7.1` |

## Checks before starting

- The ticket's Fix Version is its target release. If it's missing or has changed, the engineer confirms with the PM before branching.
- Before branching from `main`, the latest production release must be merged back. Otherwise `main` lags behind production, and work built on it differs from what is running.
- A branch cut from a release branch carries every ticket already in that release. It can't move to another release without checking those tickets.
- Resolve conflicts with a release on a Release Merge branch, never on the ticket branch, and never merge the Release Merge branch back into the ticket branch.
- Nothing is committed directly to `main` or `release/*`; changes arrive by reviewed PR.
