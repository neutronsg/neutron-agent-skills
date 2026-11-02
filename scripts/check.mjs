// Checks the skills repo: marketplace and plugin manifests, every SKILL.md and links to reference files.
// Usage: node scripts/check.mjs [--base <git ref>]  (with --base, a change to skills must bump the version)
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const json = (p) => { try { return JSON.parse(readFileSync(join(root, p), "utf8")); } catch (e) { errors.push(`${p}: ${e.message}`); return null; } };

// Marketplaces point at plugins that exist, with matching names.
const claude = json(".claude-plugin/marketplace.json"), codex = json(".agents/plugins/marketplace.json");
const plugins = new Map();
for (const p of claude?.plugins || []) plugins.set(p.name, p.source);
for (const p of codex?.plugins || []) if (plugins.get(p.name) !== p.source?.path) errors.push(`.agents/plugins/marketplace.json: "${p.name}" must point to the same folder as in .claude-plugin/marketplace.json`);
const kebab = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const skills = [];
for (const [name, src] of plugins) {
  const dir = join(root, src);
  if (!existsSync(dir)) { errors.push(`plugin "${name}": ${src} does not exist`); continue; }
  const versions = new Set();
  for (const m of [".claude-plugin/plugin.json", "plugin.json"]) {
    const man = json(join(src, m));
    if (man && man.name !== name) errors.push(`${src}/${m}: name must be "${name}"`);
    if (man) versions.add(man.version);
  }
  if (versions.size !== 1 || !/^\d+\.\d+\.\d+$/.test([...versions][0])) errors.push(`${src}: both plugin.json files need the same semver version`);
  plugins.set(name, src); plugins.version = [...versions][0];
  const sdir = join(dir, "skills");
  for (const s of existsSync(sdir) ? readdirSync(sdir) : []) if (statSync(join(sdir, s)).isDirectory()) skills.push({ name: s, dir: join(sdir, s), rel: join(src, "skills", s) });
}

// Every SKILL.md: frontmatter per the open Agent Skills spec, size, and links that resolve.
for (const s of skills) {
  const file = join(s.dir, "SKILL.md"), rel = join(s.rel, "SKILL.md");
  if (!existsSync(file)) { errors.push(`${rel}: missing`); continue; }
  const text = readFileSync(file, "utf8");
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) { errors.push(`${rel}: frontmatter must start on the first line`); continue; }
  const field = (k) => fm[1].match(new RegExp(`^${k}:\\s*(.+)$`, "m"))?.[1].trim();
  const name = field("name"), desc = field("description");
  if (name !== s.name) errors.push(`${rel}: name must equal the folder name "${s.name}"`);
  if (!kebab.test(s.name) || s.name.length > 64) errors.push(`${rel}: name must be lowercase letters, digits and single hyphens, at most 64 characters`);
  if (!desc || desc.length > 1024) errors.push(`${rel}: description is required and at most 1024 characters`);
  if (text.split("\n").length > 500) errors.push(`${rel}: keep SKILL.md under 500 lines; move detail into references/`);
  const refs = existsSync(join(s.dir, "references")) ? readdirSync(join(s.dir, "references")).map((f) => join("references", f)) : [];
  for (const f of ["SKILL.md", ...refs]) {
    const body = readFileSync(join(s.dir, f), "utf8");
    for (const [, href] of body.matchAll(/\]\((?!https?:|#)([^)\s]+)\)/g)) if (!existsSync(join(dirname(join(s.dir, f)), href))) errors.push(`${join(s.rel, f)}: link to missing file ${href}`);
  }
  for (const r of refs) if (!text.includes(r)) errors.push(`${join(s.rel, r)}: not linked from SKILL.md, so agents won't read it`);
}

// A PR that changes a skill must bump the version, or installed copies never update.
const b = process.argv.indexOf("--base");
if (b > 0) {
  const base = process.argv[b + 1];
  const git = (...a) => execFileSync("git", a, { cwd: root, encoding: "utf8" });
  const changed = git("diff", "--name-only", git("merge-base", base, "HEAD").trim()).split("\n").filter((f) => /^plugins\/[^/]+\/skills\//.test(f));
  const baseVersion = JSON.parse(git("show", `${base}:plugins/neutron/plugin.json`)).version;
  if (changed.length && baseVersion === plugins.version) errors.push(`skills changed (${changed.length} files) but the version is still ${baseVersion}; bump it in both plugin.json files`);
}

if (errors.length) { for (const e of errors) console.error(`error ${e}`); process.exit(1); }
console.log(`OK    ${skills.length} skill(s) in ${plugins.size} plugin(s).`);
