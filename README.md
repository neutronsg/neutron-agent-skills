# Neutron agent skills

Skills for Claude Code and Codex that run Neutron's engineering workflows. Each one follows a step in the [Neutron engineering handbook](https://HANDBOOK_URL_NOT_SET) and reads the handbook's rules when it runs.

| Skill | Use it to | Handbook page |
|---|---|---|
| `pr-review` | Review a PR against its Jira ticket before a person approves it | Code review |

More skills (`project-discovery`, `release-check`, `release-closeout`, `ssat-review`) are being added.

## Install

Install once for yourself; the skills then work in any repository you open, including client repositories you can't add files to.

**Claude Code**

```bash
claude plugin marketplace add neutronsg/neutron-agent-skills
claude plugin install neutron@neutron
```

Without a GitHub SSH key, run `export CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` first.

**Codex**

```bash
codex plugin marketplace add neutronsg/neutron-agent-skills
```

Then open the Plugins Directory, choose **Neutron engineering skills** and install **neutron**.

## Use

Type the skill's name before your request, as the handbook's prompt cards show:

- Claude Code: `/pr-review Review [PR URL] against its linked Jira ticket.`
- Codex: `$pr-review Review [PR URL] against its linked Jira ticket.`

Skills also start on their own when a request matches their description.

## Update

- Claude Code: `claude plugin marketplace update neutron`, then `claude plugin update neutron@neutron`. Start a new session to load the update.
- Codex: `codex plugin marketplace upgrade neutron`.

## Contributing

How skills are written and changed: [AGENTS.md](AGENTS.md).
