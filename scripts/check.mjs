// Checks the skills repo: marketplace and plugin manifests, every SKILL.md, links to reference files,
// one handbook URL across skills, and (when the handbook is reachable) every cited requirement ID and task.
// Usage: node scripts/check.mjs [--handbook <url-or-path-to-requirements.json>]
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

const root = resolve(dirname(new URL(import.meta.url).pathname), "..");
const errors = [], notes = [];
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
  const sdir = join(dir, "skills");
  for (const s of existsSync(sdir) ? readdirSync(sdir) : []) if (statSync(join(sdir, s)).isDirectory()) skills.push({ name: s, dir: join(sdir, s), rel: join(src, "skills", s) });
}

// Every SKILL.md: frontmatter per the open Agent Skills spec, links that resolve, one handbook URL.
const urls = new Set(), cited = new Map();
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
  const files = [text, ...(existsSync(join(s.dir, "references")) ? readdirSync(join(s.dir, "references")).map((f) => readFileSync(join(s.dir, "references", f), "utf8")) : [])];
  for (const [, href] of text.matchAll(/\]\((?!https?:|#)([^)\s]+)\)/g)) if (!existsSync(join(s.dir, href))) errors.push(`${rel}: link to missing file ${href}`);
  const url = text.match(/^Handbook: `([^`]+)`/m)?.[1];
  if (!url) errors.push(`${rel}: needs a "Handbook: \`<url>\`" line`); else urls.add(url);
  for (const f of files) {
    for (const [id] of f.matchAll(/\b[A-Z]{2,5}-T?\d+\b/g)) if (!/^(ENG|RM|DS|SS|FS|CS)-/.test(id)) (cited.get(id) || cited.set(id, new Set()).get(id)).add(rel);
    for (const [, t] of f.matchAll(/`(pr|review|value|otp|bulk|migration|campaign|agent|release|access|incident|golive)` task|tasks?: `([a-z]+)`/g)) if (t) cited.set(`task:${t}`, new Set([rel]));
  }
  for (const [, t] of text.matchAll(/\|[^|\n]*\|\s*`([a-z]+)`/g)) (cited.get(`task:${t}`) || cited.set(`task:${t}`, new Set()).get(`task:${t}`)).add(rel);
}
if (urls.size > 1) errors.push(`skills disagree on the handbook URL: ${[...urls].join(", ")}`);
const url = [...urls][0];
if (url?.includes("HANDBOOK_URL_NOT_SET")) notes.push("Handbook URL is not set yet; skills ask the user for it. Set it in every SKILL.md once the site is published.");

// Cited requirement IDs and tasks exist in the handbook and aren't retired.
const arg = process.argv.indexOf("--handbook");
const source = arg > 0 ? process.argv[arg + 1] : url && !url.includes("NOT_SET") ? `${url.replace(/\/$/, "")}/requirements.json` : null;
if (source) {
  try {
    const data = /^https?:/.test(source) ? await (await fetch(source)).json() : JSON.parse(readFileSync(source, "utf8"));
    const ids = new Set(data.requirements.map((r) => r.id)), tasks = new Set(data.tasks.map((t) => t.id));
    for (const [id, where] of cited) {
      if (id.startsWith("task:")) { if (!tasks.has(id.slice(5))) errors.push(`${[...where].join(", ")}: handbook has no task "${id.slice(5)}"`); }
      else if (!ids.has(id)) errors.push(`${[...where].join(", ")}: handbook has no requirement ${id} (retired or mistyped)`);
    }
    notes.push(`Checked ${cited.size} cited IDs and tasks against ${source}.`);
  } catch (e) { errors.push(`could not read handbook requirements from ${source}: ${e.message}`); }
} else notes.push("Cited requirement IDs not checked: no handbook URL. Pass --handbook <url or requirements.json>.");

for (const n of notes) console.log(`note  ${n}`);
if (errors.length) { for (const e of errors) console.error(`error ${e}`); process.exit(1); }
console.log(`OK    ${skills.length} skill(s) in ${plugins.size} plugin(s).`);
