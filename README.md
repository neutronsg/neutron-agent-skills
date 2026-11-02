# Neutron agent skills

Skills for Claude Code and Codex that run Neutron's engineering workflows, from starting on a project to reviewing a PR.

| Skill | Use it to |
|---|---|
| `project-discovery` | Understand the part of a project a ticket touches, and plan its branch, before changing code |
| `pr-review` | Review a PR against its Jira ticket before a person approves it |
| `release-check` | Check a release holds exactly its Fix Version's tickets, and draft its release record |
| `release-closeout` | After a release, align the repo's docs with the code in a docs-only PR |
| `ssat-review` | Check a system against its SSAT checklist with evidence before go-live or a major release |

## Install

Install once for yourself; the skills then work in any repository you open, including client repositories you can't add files to.

Paste this into Claude Code or Codex:

```text
Install Neutron's agent skills from the public GitHub repository neutronsg/neutron-agent-skills, for my user only.
- If you are Claude Code, run: claude plugin marketplace add neutronsg/neutron-agent-skills, then: claude plugin install neutron@neutron
- If you are Codex, run: codex plugin marketplace add neutronsg/neutron-agent-skills, then: codex plugin add neutron@neutron
If the marketplace step fails because there is no GitHub SSH key, set CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1 for the command and retry.
Then list the installed plugins to confirm neutron is there, and tell me how to load it (a new session, or /reload-plugins in Claude Code).
Don't change any other settings.
```

Or run the commands yourself.

**Claude Code**

```bash
claude plugin marketplace add neutronsg/neutron-agent-skills
claude plugin install neutron@neutron
```

Without a GitHub SSH key, run `export CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` first.

**Codex**

```bash
codex plugin marketplace add neutronsg/neutron-agent-skills
codex plugin add neutron@neutron
```

## Use

Type the skill's name before your request:

- Claude Code: `/pr-review Review [PR URL] against its linked Jira ticket.`
- Codex: `$pr-review Review [PR URL] against its linked Jira ticket.`

Skills also start on their own when a request matches their description, except `release-closeout`, which opens a PR and runs only when you call it by name.

## Update

- Claude Code: `claude plugin marketplace update neutron`, then `claude plugin update neutron@neutron`. Start a new session to load the update.
- Codex: `codex plugin marketplace upgrade neutron`, then `codex plugin add neutron@neutron` again. The first command only refreshes the list.

## Contributing

How skills are written and changed: [AGENTS.md](AGENTS.md).
