// Checks the built site without touching the network:
//  1. every local href/src (and CSS url()) points at a file that exists, including #fragments;
//  2. every research companion HTML file links back to its package;
//  3. nothing in content/ or _site/ leaks a private local path.
// External links are not fetched; sources are dated in the notes themselves.
import fs from 'node:fs/promises';
import path from 'node:path';
import { paths, site } from './config.mjs';

const out = paths.out;
const problems = [];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files.sort();
}

const isExternal = (url) => /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//');
const decode = (s) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};
const unescapeAttr = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

const idCache = new Map();
async function idsIn(file) {
  if (!idCache.has(file)) {
    const html = await fs.readFile(file, 'utf8');
    idCache.set(file, new Set([...html.matchAll(/\s(?:id|name)="([^"]+)"/g)].map((m) => unescapeAttr(m[1]))));
  }
  return idCache.get(file);
}

// Resolve a URL found in `fromFile` to a file inside _site, the way GitHub Pages would.
async function resolveTarget(fromFile, url) {
  let p = url;
  if (p.startsWith(site.basePath)) p = p.slice(site.basePath.length);
  else if (p.startsWith('/')) return { error: `root-absolute URL outside ${site.basePath}` };
  const base = url.startsWith(site.basePath) ? out : path.dirname(fromFile);
  let target = path.join(base, decode(p));
  if (!path.resolve(target).startsWith(path.resolve(out))) return { error: 'points outside the site' };
  const stat = await fs.stat(target).catch(() => null);
  if (stat?.isDirectory()) target = path.join(target, 'index.html');
  else if (!stat && !path.extname(target)) target = `${target}.html`;
  const ok = await fs.stat(target).then((s) => s.isFile(), () => false);
  return ok ? { file: target } : { error: 'missing' };
}

async function checkLinks() {
  const files = await walk(out);
  const htmlFiles = files.filter((f) => f.endsWith('.html'));
  let checked = 0;
  for (const file of htmlFiles) {
    const html = await fs.readFile(file, 'utf8');
    const rel = path.relative(out, file);
    const companion = /^research\/[^/]+\/[^/]+\.html$/.test(rel.split(path.sep).join('/'));
    let linksHome = false;
    for (const m of html.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
      const url = unescapeAttr(m[1]);
      if (!url || isExternal(url)) continue;
      checked++;
      const [p, fragment] = url.split('#');
      let target = file;
      if (p) {
        const r = await resolveTarget(file, p);
        if (r.error) {
          problems.push(`${rel}: "${url}" (${r.error})`);
          continue;
        }
        target = r.file;
      }
      if (companion && target === path.join(path.dirname(file), 'index.html')) linksHome = true;
      if (fragment && target.endsWith('.html') && !(await idsIn(target)).has(decode(fragment))) {
        problems.push(`${rel}: "${url}" (no element with id "${decode(fragment)}")`);
      }
    }
    if (companion && !linksHome) problems.push(`${rel}: companion page has no link back to its package ("./")`);
  }
  for (const file of files.filter((f) => f.endsWith('.css'))) {
    const css = await fs.readFile(file, 'utf8');
    for (const m of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
      const url = m[1];
      if (isExternal(url) || url.startsWith('data:') || url.startsWith('#')) continue;
      checked++;
      const r = await resolveTarget(file, url.split('#')[0]);
      if (r.error) problems.push(`${path.relative(out, file)}: url(${url}) (${r.error})`);
    }
  }
  return { pages: htmlFiles.length, checked };
}

// Private paths that must never be published.
const PRIVATE = [/\/Users\/[^/\s"'<>]+/, /\/home\/[a-z][^/\s"'<>]*\//, /[A-Z]:\\Users\\/, /obsidian_vault/i, /file:\/\//i, /\.obsidian\//];
const TEXT = /\.(md|html?|css|m?js|json|svg|txt|xml|ya?ml)$/i;

async function checkPrivacy() {
  const files = [...(await walk(paths.content)), ...(await walk(out))].filter(
    (f) => TEXT.test(f) && !f.includes(`${path.sep}vendor${path.sep}`) && !f.includes(`${path.sep}fonts${path.sep}`),
  );
  for (const file of files) {
    const text = await fs.readFile(file, 'utf8');
    for (const pattern of PRIVATE) {
      const m = pattern.exec(text);
      if (m) problems.push(`${file}: looks like a private local path ("${m[0]}"); remove it before publishing`);
    }
  }
  return files.length;
}

if (!(await fs.stat(out).catch(() => null))) {
  console.error(`No ${out}/ yet. Run "npm run build" first.`);
  process.exit(1);
}
const links = await checkLinks();
const scanned = await checkPrivacy();
if (problems.length) {
  console.error(`Check failed with ${problems.length} problem${problems.length === 1 ? '' : 's'}:`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`Check passed: ${links.checked} local links across ${links.pages} HTML pages resolve; ${scanned} text files contain no private paths.`);
