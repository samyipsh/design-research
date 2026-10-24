// Builds content/ into _site/: research packages become HTML pages, design projects
// and companion files are copied byte for byte. Output is deterministic (sorted inputs,
// no timestamps). Any unresolved link or malformed package fails the build.
import fs from 'node:fs/promises';
import path from 'node:path';
import { paths, site } from './config.mjs';
import { createMarkdown, renderNote, slugify, stripTags } from './markdown.mjs';
import * as T from './templates.mjs';

const errors = [];
const fail = (msg) => errors.push(msg);
const out = paths.out;
const IGNORED = /^(\.|_site$|node_modules$|Thumbs\.db$)/;

async function exists(p) {
  return fs.access(p).then(() => true, () => false);
}

async function listDirs(dir) {
  if (!(await exists(dir))) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory() && !IGNORED.test(e.name)).map((e) => e.name).sort();
}

// All files below `dir`, as sorted POSIX paths relative to it. Dotfiles are skipped.
async function walk(dir, prefix = '') {
  const entries = await fs.readdir(path.join(dir, prefix), { withFileTypes: true });
  const files = [];
  for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (IGNORED.test(e.name)) continue;
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) files.push(...(await walk(dir, rel)));
    else files.push(rel);
  }
  return files;
}

async function readJson(file, required) {
  if (!(await exists(file))) {
    if (required) fail(`${file}: missing (see README "Add a research package")`);
    return {};
  }
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (e) {
    fail(`${file}: invalid JSON (${e.message})`);
    return {};
  }
}

async function write(rel, content) {
  const file = path.join(out, rel);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
}

async function copy(from, rel) {
  const file = path.join(out, rel);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.copyFile(from, file);
}

const encodePath = (p) => p.split('/').map((s) => (s === '..' || s === '.' ? s : encodeURIComponent(s))).join('/');
const htmlTitle = (html, fallback) => stripTags(/<title>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '').trim() || fallback;
const plain = (md) => md.replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, '$2').replace(/[*_`]/g, '').trim();

function readingMinutes(source) {
  // Prefer the author's estimate ("~20 min") near the top of the note; otherwise ~220 words a minute.
  const stated = /~\s?(\d+)\s*min/.exec(source.slice(0, 600));
  if (stated) return Number(stated[1]);
  return Math.max(5, Math.ceil(source.split(/\s+/).length / 220 / 5) * 5);
}

async function loadResearch() {
  const packages = [];
  for (const id of await listDirs(paths.research)) {
    const dir = path.join(paths.research, id);
    if (id !== slugify(id)) fail(`${dir}: folder names become URLs; use lowercase-hyphenated ("${slugify(id)}")`);
    const meta = await readJson(path.join(dir, 'meta.json'), true);
    for (const key of ['title', 'summary']) if (!meta[key]) fail(`${dir}/meta.json: "${key}" is required`);

    const files = await walk(dir);
    const pkg = {
      id,
      dir,
      url: `research/${id}/`,
      title: meta.title ?? id,
      summary: meta.summary ?? '',
      snapshot: meta.snapshot,
      reviewed: meta.reviewed,
      notes: [],
      assets: [],
      companions: [],
    };

    for (const file of files) {
      if (file === 'meta.json') continue;
      if (!file.endsWith('.md')) {
        pkg.assets.push(file);
        continue;
      }
      if (file.includes('/')) {
        fail(`${dir}/${file}: notes must sit directly in the package folder (subfolders are for assets)`);
        continue;
      }
      const name = file.slice(0, -3);
      const source = await fs.readFile(path.join(dir, file), 'utf8');
      const isHub = meta.hub ? file === meta.hub : name.startsWith('_ ');
      const title = plain(/^#\s+(.+)$/m.exec(source)?.[1] ?? name);
      const numbered = /^(\d+)[\s._-]+/.exec(name);
      const slug = slugify(name.replace(/^_\s*/, ''));
      pkg.notes.push({
        pkg,
        file,
        name,
        source,
        isHub,
        number: isHub ? null : numbered?.[1] ?? null,
        title,
        label: numbered && !isHub ? title.replace(/^\d+[\s._:-]+/, '') : title,
        minutes: readingMinutes(source),
        slug,
        url: isHub ? pkg.url : `${pkg.url}${slug}/`,
      });
    }

    const hubs = pkg.notes.filter((n) => n.isHub);
    if (hubs.length !== 1) fail(`${dir}: needs exactly one hub note (a file named "_ <Title>.md", or "hub" in meta.json); found ${hubs.length}`);
    pkg.hub = hubs[0] ?? pkg.notes[0];
    pkg.chapters = pkg.notes.filter((n) => !n.isHub && n.number).sort((a, b) => a.number - b.number || a.name.localeCompare(b.name));
    pkg.references = pkg.notes.filter((n) => !n.isHub && !n.number).sort((a, b) => a.name.localeCompare(b.name));
    for (const n of [pkg.hub, ...pkg.chapters, ...pkg.references]) {
      if (!n) continue;
      n.navTitle = n.number ? `${n.number} ${n.label}` : n.title;
    }

    const slugs = new Map();
    for (const n of pkg.notes) {
      if (slugs.has(n.slug)) fail(`${dir}: "${n.file}" and "${slugs.get(n.slug)}" would share the URL ${n.url}`);
      slugs.set(n.slug, n.file);
      if (!n.isHub && pkg.assets.some((a) => a.split('/')[0] === n.slug)) fail(`${dir}: note "${n.file}" collides with asset path "${n.slug}"`);
    }

    for (const file of pkg.assets.filter((f) => /\.html?$/i.test(f) && !f.includes('/'))) {
      const html = await fs.readFile(path.join(dir, file), 'utf8');
      pkg.companions.push({ file, url: `${pkg.url}${encodePath(file)}`, title: htmlTitle(html, file), blurb: meta.companions?.[file] });
    }
    packages.push(pkg);
  }
  return packages;
}

async function loadDesign() {
  const projects = [];
  for (const id of await listDirs(paths.design)) {
    const dir = path.join(paths.design, id);
    if (id !== slugify(id)) fail(`${dir}: folder names become URLs; use lowercase-hyphenated ("${slugify(id)}")`);
    const meta = await readJson(path.join(dir, 'meta.json'), false);
    const files = (await walk(dir)).filter((f) => f !== 'meta.json');
    const artifacts = [];
    for (const file of files.filter((f) => /\.html?$/i.test(f) && (!f.includes('/') || /^[^/]+\/index\.html?$/i.test(f)))) {
      const html = await fs.readFile(path.join(dir, file), 'utf8');
      artifacts.push({ file, url: `design/${id}/${encodePath(file)}`, title: htmlTitle(html, file) });
    }
    projects.push({ id, dir, files, artifacts, title: meta.title ?? id, summary: meta.summary ?? '' });
  }
  return projects;
}

function makeResolvers(note, page, index, link) {
  const where = `${note.pkg.dir}/${note.file}`;
  const toNote = (target, heading) => link(target.url) + (heading ? `#${slugify(heading)}` : '');

  const resolveWikilink = (target) => {
    const [namePart, heading] = target.split('#');
    if (!namePart) return { href: `#${slugify(heading ?? '')}`, label: heading ?? target };
    const key = namePart.split('/').pop().replace(/\.md$/i, '').toLowerCase();
    const notes = index.notes.get(key) ?? [];
    const match = notes.find((n) => n.pkg === note.pkg) ?? (notes.length === 1 ? notes[0] : null);
    // Unaliased links show the note's own title, so "_ Hub" and filename-safe dashes read naturally.
    if (match) return { href: toNote(match, heading), label: heading ? `${match.title} > ${heading}` : match.title };
    const label = heading ? `${namePart} > ${heading}` : namePart;
    const asset = index.assets.get(`${note.pkg.url}${namePart}`);
    if (asset) return { href: link(asset), label };
    fail(`${where}: ${notes.length > 1 ? 'ambiguous' : 'unresolved'} wikilink [[${target}]]`);
    return { href: '#', label };
  };

  const resolveHref = (href) => {
    if (!href || /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//') || href.startsWith('#')) return href;
    if (href.startsWith('/')) {
      fail(`${where}: root-absolute link "${href}" breaks under the /design-research/ subpath; use a relative link`);
      return href;
    }
    const [rawPath, fragment] = href.split('#');
    let decoded = rawPath;
    try {
      decoded = decodeURI(rawPath);
    } catch {}
    const target = path.posix.normalize(path.posix.join(note.pkg.url, decoded));
    const hash = fragment ? `#${fragment}` : '';
    const linked = index.byPath.get(target);
    if (linked) return toNote(linked) + hash;
    const asset = index.assets.get(target);
    if (asset) return link(asset) + hash;
    fail(`${where}: link target "${href}" not found`);
    return href;
  };

  const resolveAsset = (name) => {
    const asset = index.assets.get(`${note.pkg.url}${name}`) ?? [...index.assets.entries()].find(([k]) => k.startsWith(note.pkg.url) && k.endsWith(`/${name}`))?.[1];
    if (asset) return link(asset);
    fail(`${where}: embedded file ![[${name}]] not found`);
    return '';
  };

  return { resolveWikilink, resolveHref, resolveAsset, hasDiagrams: false, diagrams: [], page };
}

// Mermaid's parser runs in Node for most diagram types. Without a DOM some types can't be
// fully checked, so only genuine syntax errors fail the build; the browser shows the source
// text of any diagram it can't draw.
async function validateDiagrams(list) {
  if (!list.length) return;
  const { default: mermaid } = await import('mermaid');
  for (const { where, n, source } of list) {
    try {
      await mermaid.parse(source);
    } catch (e) {
      const msg = String(e?.message ?? e);
      if (/^(Parse error|Lexical error|No diagram type detected)/.test(msg)) {
        fail(`${where}: diagram ${n} has a Mermaid syntax error: ${msg.split('\n').slice(0, 3).join(' ')}`);
      }
    }
  }
}

async function copyTheme() {
  for (const file of await walk(paths.theme)) await copy(path.join(paths.theme, file), `assets/${file}`);

  const fonts = [
    ['@fontsource-variable/literata', 'literata-latin-wght-normal.woff2'],
    ['@fontsource-variable/literata', 'literata-latin-wght-italic.woff2'],
    ['@fontsource-variable/archivo', 'archivo-latin-standard-normal.woff2'],
  ];
  for (const [pkg, file] of fonts) await copy(`node_modules/${pkg}/files/${file}`, `assets/fonts/${file}`);
  await copy('node_modules/@fontsource-variable/literata/LICENSE', 'assets/fonts/Literata-OFL.txt');
  await copy('node_modules/@fontsource-variable/archivo/LICENSE', 'assets/fonts/Archivo-OFL.txt');
}

// Mermaid is self-hosted (no CDN). Only the minified ESM build is copied; the browser
// fetches just the chunks a page's diagram types need.
async function copyMermaid() {
  const dist = 'node_modules/mermaid/dist';
  const strip = (code) => code.replace(/\n?\/\/# sourceMappingURL=\S+\s*$/, '\n');
  await write('assets/vendor/mermaid/mermaid.esm.min.mjs', strip(await fs.readFile(`${dist}/mermaid.esm.min.mjs`, 'utf8')));
  for (const file of await walk(`${dist}/chunks/mermaid.esm.min`)) {
    if (!file.endsWith('.mjs')) continue;
    await write(`assets/vendor/mermaid/chunks/mermaid.esm.min/${file}`, strip(await fs.readFile(`${dist}/chunks/mermaid.esm.min/${file}`, 'utf8')));
  }
  await copy('node_modules/mermaid/LICENSE', 'assets/vendor/mermaid/LICENSE.txt');
}

async function main() {
  await fs.rm(out, { recursive: true, force: true });
  await fs.mkdir(out, { recursive: true });

  const packages = await loadResearch();
  const projects = await loadDesign();

  const index = { notes: new Map(), byPath: new Map(), assets: new Map() };
  for (const pkg of packages) {
    for (const n of pkg.notes) {
      const key = n.name.toLowerCase();
      index.notes.set(key, [...(index.notes.get(key) ?? []), n]);
      index.byPath.set(`${pkg.url}${n.file}`, n);
    }
    for (const a of pkg.assets) index.assets.set(`${pkg.url}${a}`, `${pkg.url}${encodePath(a)}`);
  }

  const md = createMarkdown();
  let diagramPages = 0;
  const diagrams = [];
  for (const pkg of packages) {
    const order = [pkg.hub, ...pkg.chapters, ...pkg.references].filter(Boolean);
    for (const [i, note] of order.entries()) {
      const dir = note.url.replace(/\/$/, '');
      const link = T.relativeLinker(dir);
      const env = makeResolvers(note, dir, index, link);
      const rendered = renderNote(md, note.source, env);
      if (env.hasDiagrams) diagramPages++;
      env.diagrams.forEach((source, k) => diagrams.push({ where: `${pkg.dir}/${note.file}`, n: k + 1, source }));
      const main = T.notePage({ pkg, note, rendered, prev: order[i - 1], next: order[i + 1], link });
      const crumbs = note.isHub ? [{ to: 'research/', label: 'Research' }] : [{ to: 'research/', label: 'Research' }, { to: pkg.url, label: pkg.title }];
      const html = T.layout({
        link,
        title: note.isHub ? `${pkg.title} · ${site.title}` : `${note.title} · ${pkg.title}`,
        description: note.isHub ? pkg.summary : undefined,
        bodyClass: 'page-note',
        crumbs,
        main,
        diagrams: env.hasDiagrams,
        sourcePath: `${pkg.dir}/${note.file}`,
      });
      await write(`${dir}/index.html`, html);
    }
    for (const asset of pkg.assets) await copy(path.join(pkg.dir, asset), `${pkg.url}${asset}`);
  }

  for (const project of projects) {
    for (const file of project.files) await copy(path.join(project.dir, file), `design/${project.id}/${file}`);
  }

  const home = T.relativeLinker('');
  await write(
    'index.html',
    T.layout({ link: home, title: 'Design & research library', description: 'Research notes and project design files.', bodyClass: 'page-home', main: T.homePage({ packages, projects, link: home }) }),
  );
  for (const kind of ['research', 'design']) {
    const link = T.relativeLinker(kind);
    const items = kind === 'research' ? packages : projects;
    const title = kind === 'research' ? 'Research' : 'Design files';
    await write(`${kind}/index.html`, T.layout({ link, title: `${title} · ${site.title}`, bodyClass: 'page-home', main: T.shelfPage({ kind, items, link }) }));
  }
  await write(
    '404.html',
    T.layout({ link: T.absoluteLinker, title: `Page not found · ${site.title}`, bodyClass: 'page-home', main: T.notFoundPage(T.absoluteLinker) }),
  );

  await validateDiagrams(diagrams);
  await copyTheme();
  if (diagramPages) await copyMermaid();

  if (errors.length) {
    console.error(`Build failed with ${errors.length} problem${errors.length === 1 ? '' : 's'}:`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  const notes = packages.reduce((n, p) => n + p.notes.length, 0);
  const artifacts = projects.reduce((n, p) => n + p.artifacts.length, 0);
  console.log(
    `Built ${out}/: ${packages.length} research package(s), ${notes} notes, ${diagramPages} page(s) with diagrams; ${projects.length} design project(s), ${artifacts} HTML artifact(s).`,
  );
}

await main();
