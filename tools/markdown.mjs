// Markdown → HTML with the Obsidian features the research notes use:
// [[wikilinks]] (with #heading and |alias), ![[embeds]] for images, > [!type] callouts,
// footnotes, ```mermaid fences and wide tables. Link resolution is delegated to the
// caller through `env`, so this file knows nothing about the site layout.
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import footnote from 'markdown-it-footnote';

export function slugify(text) {
  return String(text)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const stripTags = (html) => html.replace(/<[^>]+>/g, '');

const CALLOUT_LABELS = {
  note: 'Note', summary: 'Summary', tip: 'Tip', warning: 'Warning', important: 'Important',
  info: 'Info', abstract: 'Summary', tldr: 'Summary', caution: 'Warning', danger: 'Danger',
  question: 'Question', example: 'Example', quote: 'Quote', success: 'Success', failure: 'Failure', bug: 'Bug',
};

function wikilinks(md) {
  md.inline.ruler.before('link', 'wikilink', (state, silent) => {
    const { src } = state;
    let start = state.pos;
    let embed = false;
    if (src.charCodeAt(start) === 0x21 /* ! */) {
      embed = true;
      start += 1;
    }
    if (!src.startsWith('[[', start)) return false;
    const end = src.indexOf(']]', start + 2);
    if (end < 0) return false;
    const inner = src.slice(start + 2, end);
    if (!inner.trim() || /[\n[\]]/.test(inner)) return false;
    if (!silent) {
      // Inside tables Obsidian writes the alias separator as "\|".
      const bar = inner.search(/\\?\|/);
      const target = (bar < 0 ? inner : inner.slice(0, bar)).trim();
      const alias = bar < 0 ? null : inner.slice(bar).replace(/^\\?\|/, '').trim();
      const token = state.push(embed ? 'wikiembed' : 'wikilink', '', 0);
      token.meta = { target, alias };
    }
    state.pos = end + 2;
    return true;
  });

  md.renderer.rules.wikilink = (tokens, idx, _opts, env) => {
    const { target, alias } = tokens[idx].meta;
    const { href, label } = env.resolveWikilink(target);
    return `<a class="wikilink" href="${escapeHtml(href)}">${escapeHtml(alias || label)}</a>`;
  };

  md.renderer.rules.wikiembed = (tokens, idx, _opts, env) => {
    const { target, alias } = tokens[idx].meta;
    const src = env.resolveAsset(target.split('#')[0]);
    const width = alias && /^\d+$/.test(alias) ? ` width="${alias}"` : '';
    const alt = alias && !width ? alias : target;
    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${width} loading="lazy">`;
  };
}

function callouts(md) {
  const marker = /^\[!([A-Za-z-]+)\]([+-]?)[ \t]*/;
  md.core.ruler.after('inline', 'callouts', (state) => {
    const t = state.tokens;
    for (let i = 0; i < t.length; i++) {
      if (t[i].type !== 'blockquote_open') continue;
      const para = t[i + 1];
      const inline = t[i + 2];
      if (para?.type !== 'paragraph_open' || inline?.type !== 'inline') continue;
      const m = marker.exec(inline.content);
      if (!m) continue;

      let depth = 0;
      let close = i;
      for (; close < t.length; close++) {
        if (t[close].type === 'blockquote_open') depth++;
        else if (t[close].type === 'blockquote_close' && --depth === 0) break;
      }

      // The first line of the paragraph is the title; anything after it is body text.
      const children = inline.children;
      const brk = children.findIndex((c) => c.type === 'softbreak' || c.type === 'hardbreak');
      const title = brk < 0 ? children : children.slice(0, brk);
      const body = brk < 0 ? [] : children.slice(brk + 1);
      const first = title.find((c) => c.type === 'text');
      if (first) first.content = first.content.replace(marker, '');

      const kind = m[1].toLowerCase();
      t[i].type = 'callout_open';
      t[i].meta = { kind, fold: m[2], title };
      t[close].type = 'callout_close';
      t[close].meta = { fold: m[2] };
      if (body.length) inline.children = body;
      else t.splice(i + 1, 3);
    }
  });

  md.renderer.rules.callout_open = (tokens, idx, opts, env) => {
    const { kind, fold, title } = tokens[idx].meta;
    let titleHtml = md.renderer.renderInline(title, opts, env).trim();
    if (!stripTags(titleHtml).trim()) titleHtml = CALLOUT_LABELS[kind] ?? kind;
    const open = `<div class="callout" data-callout="${escapeHtml(kind)}" role="note">`;
    if (fold) {
      return `${open}<details${fold === '+' ? ' open' : ''}><summary class="callout-title">${titleHtml}</summary>`;
    }
    return `${open}<p class="callout-title">${titleHtml}</p>`;
  };
  md.renderer.rules.callout_close = (tokens, idx) => (tokens[idx].meta.fold ? '</details></div>' : '</div>');
}

function siteRenderers(md) {
  const fence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, idx, opts, env, self) => {
    const info = tokens[idx].info.trim().split(/\s+/)[0];
    if (info === 'mermaid') {
      env.hasDiagrams = true;
      env.diagrams?.push(tokens[idx].content);
      // Rendered in the browser by theme/diagrams.js; the source stays readable without JS.
      return `<figure class="diagram" data-diagram><pre class="diagram-source"><code>${escapeHtml(tokens[idx].content)}</code></pre></figure>\n`;
    }
    return fence(tokens, idx, opts, env, self);
  };

  md.renderer.rules.table_open = () => '<div class="table-scroll"><table>\n';
  md.renderer.rules.table_close = () => '</table></div>\n';

  const linkOpen = md.renderer.rules.link_open ?? ((tokens, idx, opts, _env, self) => self.renderToken(tokens, idx, opts));
  md.renderer.rules.link_open = (tokens, idx, opts, env, self) => {
    const token = tokens[idx];
    const href = token.attrGet('href');
    if (href) token.attrSet('href', env.resolveHref(href));
    return linkOpen(tokens, idx, opts, env, self);
  };

  const image = md.renderer.rules.image;
  md.renderer.rules.image = (tokens, idx, opts, env, self) => {
    const token = tokens[idx];
    token.attrSet('src', env.resolveHref(token.attrGet('src')));
    token.attrSet('loading', 'lazy');
    return image(tokens, idx, opts, env, self);
  };
}

export function createMarkdown() {
  // breaks: true matches Obsidian's default, where a single newline is a line break.
  const md = new MarkdownIt({ html: true, linkify: true, breaks: true, typographer: false });
  md.use(wikilinks).use(callouts).use(footnote).use(siteRenderers);
  md.use(anchor, { slugify, tabIndex: false, level: [2, 3, 4, 5, 6] });
  return md;
}

// Parse one note: pull out the H1 as the page title and collect H2s for "On this page".
export function renderNote(md, source, env) {
  const tokens = md.parse(source, env);
  let titleHtml = null;
  const h1 = tokens.findIndex((tok) => tok.type === 'heading_open' && tok.tag === 'h1');
  if (h1 >= 0) {
    titleHtml = md.renderer.renderInline(tokens[h1 + 1].children, md.options, env);
    tokens.splice(h1, 3);
  }
  const sections = [];
  tokens.forEach((tok, i) => {
    if (tok.type === 'heading_open' && tok.tag === 'h2') {
      const label = stripTags(md.renderer.renderInline(tokens[i + 1].children, md.options, env)).trim();
      sections.push({ id: tok.attrGet('id'), label });
    }
  });
  const html = md.renderer.render(tokens, md.options, env);
  return { titleHtml, sections, html };
}
