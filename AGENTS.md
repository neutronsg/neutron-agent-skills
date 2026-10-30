# Neutron agent skills

Skills for Claude Code and Codex that run Neutron's engineering workflows. This repository is public: anyone can install from it, including engineers outside the GitHub organization.

## Docs in this repo

- `README.md`: what the skills do and how engineers install, use and update them.
- `AGENTS.md`: how to write and change skills. `CLAUDE.md` imports it for Claude Code.

## Layout

- `plugins/neutron/skills/<name>/SKILL.md`: one folder per skill, in the open Agent Skills format both agents read. Detail an agent needs only sometimes goes in `references/` next to it, one level deep.
- `plugins/neutron/.claude-plugin/plugin.json` (Claude Code) and `plugins/neutron/plugin.json` (Codex): the plugin manifests. Keep name and version identical.
- `.claude-plugin/marketplace.json` (Claude Code) and `.agents/plugins/marketplace.json` (Codex): this repo as a marketplace for both agents.
- `scripts/check.mjs`: validation; CI runs it on every PR.

## Commands

- `node scripts/check.mjs`: check manifests, skills, links and the cited handbook IDs. Pass `--handbook <url or path to requirements.json>` to check IDs before the handbook URL is set.
- `claude plugin validate .`: Claude Code's own manifest validation.

## The handbook is the source of the rules

- Skills hold procedures: inputs, steps, evidence to collect, what not to do, and the report. Rules live in the handbook. A skill fetches `<handbook>/requirements.json` and page Markdown when it runs, so rules change in one place.
- Cite rules by requirement ID (`SEC-1`) or handbook task (`migration`), never by copying their text. The check fails on an ID the handbook no longer has. Retired IDs are never reused, so a cited ID can't silently change meaning.
- Every SKILL.md has one `Handbook: \`<url>\`` line, the same in every skill.
- A skill still works if the handbook can't be reached: it says so in its report and continues with its own steps.

## Writing a skill

- Copy `pr-review`. The skill's page in the handbook has the prompt engineers type; the skill turns that prompt into a full procedure.
- `name` matches the folder: lowercase letters, digits and hyphens. The name is also the command (`/pr-review`, `$pr-review`) the handbook shows, so don't rename a skill casually.
- `description` says what the skill does, when to use it and when not to, with trigger words first. Agents choose skills from it.
- Keep SKILL.md under 500 lines and the steps imperative. Move templates and long references into `references/`.
- Every skill names its inputs, its boundaries (what it must not do), the evidence it collects and its report format. Skills are read-only and end in a report unless their handbook page says otherwise.
- Read Jira through the connected Jira MCP or `acli`, and ask for pasted details when neither works. Use `gh` for GitHub and `glab` for GitLab.

## Public repository

- Nothing here may name a client, product, client repository or provider, or include internal URLs other than the handbook's, secrets, or real incidents.
- Outsiders can open issues. Only Neutron engineers merge.

## Releasing

- Bump `version` in both plugin manifests in the PR that changes a skill. Installed copies update only when the version changes.
- Run `node scripts/check.mjs` and `claude plugin validate .` before merging.
