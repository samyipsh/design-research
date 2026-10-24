// HTML shells for every generated page. `link(to)` turns a site-root path
// ("research/x/", "assets/site.css", "" for home) into the href used on that page.
import path from 'node:path';
import { site } from './config.mjs';
import { escapeHtml as esc } from './markdown.mjs';

export function relativeLinker(fromDir) {
  return (to) => {
    const isDir = to === '' || to.endsWith('/');
    const target = isDir ? to.replace(/\/$/, '') : to;
    const r = path.posix.relative(fromDir, target);
    if (isDir) return r ? `${r}/` : './';
    return r || './';
  };
}

export const absoluteLinker = (to) => `${site.basePath}${to}`;

export function formatDuration(minutes) {
  if (minutes < 60) return `~${Math.max(5, Math.round(minutes / 5) * 5)} min`;
  const hours = Math.round((minutes / 60) * 2) / 2;
  return `~${String(hours).replace('.5', '½')} h`;
}

export function layout({ link, title, description, bodyClass = '', crumbs = [], main, diagrams = false, sourcePath }) {
  const crumbNav = crumbs.length
    ? `<nav class="crumbs" aria-label="Breadcrumb"><ol>${crumbs
        .map((c) => `<li><a href="${link(c.to)}">${esc(c.label)}</a></li>`)
        .join('')}</ol></nav>`
    : '';
  const sourceLink = sourcePath
    ? ` · <a href="${site.repoUrl}/blob/${site.branch}/${sourcePath.split('/').map(encodeURIComponent).join('/')}">This page on GitHub</a>`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${esc(title)}</title>
${description ? `<meta name="description" content="${esc(description)}">\n` : ''}<link rel="icon" href="${link('assets/favicon.svg')}" type="image/svg+xml">
<link rel="preload" href="${link('assets/fonts/literata-latin-wght-normal.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${link('assets/site.css')}">
<script src="${link('assets/site.js')}" defer></script>
${diagrams ? `<script type="module" src="${link('assets/diagrams.js')}"></script>\n` : ''}</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<a class="skip-link" href="#main">Skip to content</a>
<header class="masthead">
  <a class="wordmark" href="${link('')}">${esc(site.title)}</a>
  ${crumbNav}
</header>
<main id="main">
${main}
</main>
<footer class="site-foot">
  <p><a href="${link('')}">Library</a> · <a href="${site.repoUrl}">Source on GitHub</a>${sourceLink}</p>
</footer>
</body>
</html>
`;
}

export function routeBar(pkg, current, link) {
  const total = pkg.chapters.reduce((sum, c) => sum + c.minutes, 0);
  const at = pkg.chapters.indexOf(current);
  const segments = pkg.chapters
    .map((c, i) => {
      const state = at < 0 ? '' : i < at ? ' is-done' : i === at ? ' is-current' : '';
      const label = `${c.number} ${c.label}, about ${c.minutes} minutes`;
      return `<li style="--m:${c.minutes}"><a class="seg${state}" href="${link(c.url)}" title="${esc(label)}"${
        i === at ? ' aria-current="page"' : ''
      }><span aria-hidden="true">${esc(c.number)}</span><span class="visually-hidden">${esc(label)}</span></a></li>`;
    })
    .join('');
  return `<nav class="route" aria-label="Reading route">
  <p class="route-label"><span>Reading route</span><span>${pkg.chapters.length} chapters · ${formatDuration(total)}</span></p>
  <ol class="route-bar">${segments}</ol>
</nav>`;
}

export function packageNav(pkg, current, link) {
  const item = (note, inner) => {
    const here = note === current;
    return `<li${here ? ' class="is-current"' : ''}><a href="${link(note.url)}"${here ? ' aria-current="page"' : ''}>${inner}</a></li>`;
  };
  const chapters = pkg.chapters
    .map((c) =>
      item(c, `<span class="pn-num">${esc(c.number)}</span><span class="pn-label">${esc(c.label)}</span><span class="pn-min">${c.minutes} min</span>`),
    )
    .join('');
  const companions = pkg.companions.length
    ? `<h3 class="pn-sub">Visual companions</h3>
  <ul class="pn-list">${pkg.companions
    .map((c) => `<li><a href="${link(c.url)}">${esc(c.title)}</a>${c.blurb ? `<span class="pn-note">${esc(c.blurb)}</span>` : ''}</li>`)
    .join('')}</ul>`
    : '';
  const references = pkg.references.length
    ? `<h3 class="pn-sub">Reference</h3>
  <ul class="pn-list">${pkg.references.map((r) => item(r, esc(r.label))).join('')}</ul>`
    : '';
  return `<nav class="package-nav" aria-labelledby="pn-${pkg.id}">
  <h2 class="pn-heading" id="pn-${pkg.id}"><a href="${link(pkg.url)}">${esc(pkg.title)}</a></h2>
  <ol class="pn-route">
    ${item(pkg.hub, `<span class="pn-tag">Start here</span><span class="pn-label">${esc(pkg.hub.label)}</span>`)}
    ${chapters}
  </ol>
  ${companions}
  ${references}
</nav>`;
}

function pager(prev, next, link) {
  const card = (note, dir, rel) =>
    `<a class="pager-${dir}" href="${link(note.url)}" rel="${rel}"><span class="pager-dir">${
      dir === 'prev' ? 'Previous' : 'Next'
    }</span><span class="pager-title">${esc(note.navTitle)}</span></a>`;
  if (!prev && !next) return '';
  return `<nav class="pager" aria-label="Previous and next page">
  ${prev ? card(prev, 'prev', 'prev') : '<span></span>'}
  ${next ? card(next, 'next', 'next') : ''}
</nav>`;
}

export function notePage({ pkg, note, rendered, prev, next, link }) {
  const { titleHtml, sections, html } = rendered;
  const toc =
    sections.length >= 3
      ? `<details class="toc">
  <summary>On this page <span class="toc-count">${sections.length} sections</span></summary>
  <ol>${sections.map((s) => `<li><a href="#${esc(s.id)}">${esc(s.label)}</a></li>`).join('')}</ol>
</details>`
      : '';
  return `<div class="reading">
<article class="note" aria-labelledby="page-title">
<header class="note-head">
${routeBar(pkg, note, link)}
<h1 id="page-title">${titleHtml ?? esc(note.name)}</h1>
${toc}
</header>
<div class="prose">
${html}
</div>
${pager(prev, next, link)}
</article>
${packageNav(pkg, note, link)}
</div>`;
}

export function packageCard(pkg, link) {
  const first = pkg.chapters[0];
  const facts = [
    pkg.companions.length && `${pkg.companions.length} visual companion${pkg.companions.length === 1 ? '' : 's'}`,
    pkg.references.length && `${pkg.references.length} reference note${pkg.references.length === 1 ? '' : 's'}`,
  ].filter(Boolean);
  const dates = [
    pkg.snapshot && `Research snapshot <time datetime="${esc(pkg.snapshot)}">${esc(pkg.snapshot)}</time>`,
    pkg.reviewed && `reviewed <time datetime="${esc(pkg.reviewed)}">${esc(pkg.reviewed)}</time>`,
  ].filter(Boolean);
  const companions = pkg.companions.length
    ? `<ul class="card-companions">${pkg.companions
        .map((c) => `<li><a href="${link(c.url)}">${esc(c.title)}</a></li>`)
        .join('')}</ul>`
    : '';
  return `<article class="card pkg-card" aria-labelledby="card-${pkg.id}">
  ${dates.length ? `<p class="card-meta">${dates.join(' · ')}</p>` : ''}
  <h3 class="card-title" id="card-${pkg.id}"><a href="${link(pkg.url)}">${esc(pkg.title)}</a></h3>
  <p class="card-summary">${esc(pkg.summary)}</p>
  ${pkg.chapters.length ? routeBar(pkg, null, link) : ''}
  <div class="card-actions">
    <a class="button button-primary" href="${link(pkg.url)}">Start here</a>
    ${first ? `<a class="button" href="${link(first.url)}">Chapter ${esc(first.number)}</a>` : ''}
  </div>
  ${facts.length ? `<p class="card-facts">${facts.join(' · ')}</p>` : ''}
  ${companions}
</article>`;
}

export function projectCard(project, link) {
  const artifacts = project.artifacts.length
    ? `<ul class="artifact-list">${project.artifacts
        .map((a) => `<li><a href="${link(a.url)}">${esc(a.title)}</a><span class="artifact-path">${esc(a.file)}</span></li>`)
        .join('')}</ul>`
    : `<p class="card-facts">No HTML files in <code>content/design/${esc(project.id)}/</code> yet.</p>`;
  return `<article class="card project-card" aria-labelledby="project-${project.id}">
  <h3 class="card-title" id="project-${project.id}">${esc(project.title)}</h3>
  ${project.summary ? `<p class="card-summary">${esc(project.summary)}</p>` : ''}
  ${artifacts}
</article>`;
}

function designEmpty() {
  return `<div class="empty">
  <p class="empty-title">No design files yet</p>
  <p>To add a project, put its HTML, CSS and assets in <code>content/design/&lt;project&gt;/</code> and push to <code>main</code>. Each HTML file at the top of the project folder is listed here.</p>
  <p><a href="${site.repoUrl}#add-design-files">How to add design files</a></p>
</div>`;
}

function countLabel(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}

const RESEARCH_NOTE = 'Each package has a reading route: chapters in order, with visual companions and reference notes alongside.';
const DESIGN_NOTE = 'Mockups, prototypes and assets, grouped by project and served exactly as committed.';

export const researchCards = (packages, link) =>
  `<div class="cards">${packages.map((p) => packageCard(p, link)).join('\n')}</div>`;

export const designCards = (projects, link) =>
  projects.length ? `<div class="cards">${projects.map((p) => projectCard(p, link)).join('\n')}</div>` : designEmpty();

function shelf({ id, title, href, count, note, body }) {
  return `<section class="shelf" aria-labelledby="${id}">
  <div class="shelf-head"><h2 id="${id}"><a href="${href}">${title}</a></h2><p class="shelf-count">${count}</p></div>
  <p class="shelf-note">${note}</p>
  ${body}
</section>`;
}

export function homePage({ packages, projects, link }) {
  return `<div class="home">
<header class="intro">
  <h1>Design &amp; research library</h1>
  <p class="lede">Research to read end to end, and design files from my projects.</p>
</header>
${shelf({
  id: 'research-heading',
  title: 'Research',
  href: link('research/'),
  count: countLabel(packages.length, 'package', 'packages'),
  note: RESEARCH_NOTE,
  body: researchCards(packages, link),
})}
${shelf({
  id: 'design-heading',
  title: 'Design files',
  href: link('design/'),
  count: countLabel(projects.length, 'project', 'projects'),
  note: DESIGN_NOTE,
  body: designCards(projects, link),
})}
</div>`;
}

export function shelfPage({ kind, items, link }) {
  const research = kind === 'research';
  return `<div class="home">
<header class="intro intro-small">
  <h1>${research ? 'Research' : 'Design files'}</h1>
  <p class="lede">${research ? RESEARCH_NOTE : DESIGN_NOTE}</p>
</header>
${research ? researchCards(items, link) : designCards(items, link)}
</div>`;
}

export function notFoundPage(link) {
  return `<div class="home">
<header class="intro intro-small">
  <h1>Page not found</h1>
  <p class="lede">Nothing in the library lives at this address. It may have been renamed or removed.</p>
  <p><a class="button button-primary" href="${link('')}">Go to the library</a></p>
</header>
</div>`;
}
