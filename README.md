# design-research

A small library of research notes and project design files, published as a static site:

**https://samyipsh.github.io/design-research/**

> **Everything in this repository and on the site is public.** Only add material you have chosen to publish. This repo is a publishing copy, not a backup or a sync of any notes vault.

## How it fits together

```text
content/
  research/<package>/   Markdown notes + companion HTML/assets  → rendered into pages
  design/<project>/     HTML, CSS, images, anything             → copied byte for byte
theme/                  site.css, small scripts, favicon
tools/                  build.mjs, check.mjs, serve.mjs (no framework)
_site/                  build output (git-ignored; built by GitHub Actions)
```

`content/` is the single source of truth. `npm run build` turns it into `_site/`; output is deterministic and every link is relative, so the same build works at `/design-research/`, at a custom domain, or locally. Dependencies are pinned in `package-lock.json`: markdown-it with two plugins, Mermaid (self-hosted, loaded only on pages with diagrams) and two fonts.

## Preview locally

Needs Node 22 or later (`.nvmrc` says 24).

```sh
npm ci          # once, or after dependency changes
npm run dev     # build + check + serve at http://localhost:4173/design-research/
```

`npm run build`, `npm run check` and `npm run preview` also work on their own. The build fails on unresolved wikilinks, missing link targets or Mermaid syntax errors. The check verifies every local link and anchor in `_site/`, and refuses private local paths such as `/Users/…`.

## Publish

Commit and push to `main`. The **Publish site** workflow builds, checks and deploys in about a minute; watch it under the repo's Actions tab. If the check fails, nothing is deployed and the live site stays as it was.

## Add a research package

1. Pick the notes to publish. Copy only those files, and nothing else from the vault.
2. Put them in `content/research/<package>/`. The folder name becomes the URL, so use lowercase-hyphenated (`object-storage`).
3. Follow the naming the build reads:
   - **Hub:** exactly one note named `_ <Title>.md`. It becomes the package page.
   - **Chapters:** `01 Title.md`, `02 Title.md` … form the reading route, in number order. A `~20 min` near the top sets the reading time; otherwise it is estimated.
   - **Reference notes:** any other `.md` file (glossary, sources…).
   - **Companions:** `.html` files next to the notes are linked from the package and served as-is. Give each one a link back to its package, `<a href="./">…</a>`; the check enforces this.
   - **Assets:** images or downloads can sit in subfolders; link them relatively.
4. Add `meta.json`:

   ```json
   {
     "title": "Object storage for web apps",
     "summary": "One sentence for the library card.",
     "snapshot": "2026-10-18",
     "reviewed": "2026-10-19",
     "companions": { "timeline.html": "Optional one-line description." }
   }
   ```

   `title` and `summary` are required.
5. Run `npm run dev`, read it on the preview, then commit and push.

Obsidian syntax that works: `[[Note]]`, `[[Note#Heading]]`, `[[Note|alias]]`, `![[image.png]]`, `> [!note] Title` callouts, footnotes, tables, and fenced `mermaid` diagrams. Wikilinks resolve by note file name within the package.

**Updating a package:** copy the changed notes over the old ones, update the dates in `meta.json`, re-apply the companion back links if you replaced a companion, and rebuild. Renaming a note changes its URL.

## Add design files

1. Create `content/design/<project>/` (lowercase-hyphenated; it becomes the URL).
2. Copy in the project's HTML, CSS, JS, images and fonts. Use **relative** paths (`styles.css`, `img/logo.svg`). A leading `/` would point outside `/design-research/` and break.
3. Optional `meta.json`: `{ "title": "Project name", "summary": "One line." }`.
4. Build, check, push.

Files are served unchanged at `/design-research/design/<project>/<file>`. Each HTML file at the top of the project folder, plus `<subfolder>/index.html`, is listed on the home page under the project, using the page's `<title>`.

## Stable URLs

| What | URL |
|---|---|
| Library | `https://samyipsh.github.io/design-research/` |
| Research package | `…/research/<package>/` |
| Research note | `…/research/<package>/<note-file-name-slug>/` |
| Companion | `…/research/<package>/<file>.html` |
| Design file | `…/design/<project>/<path>` |

URLs come from folder and file names, so they stay put unless you rename things. Link to any of them from another website.

## Custom domain (optional, later)

Add the domain under **Settings → Pages → Custom domain** and create the DNS record GitHub shows there. Pages are linked relatively, so they need no change. Only `404.html` and the local preview use the base path: set `BASE_PATH: /` as an `env` on the build step in `.github/workflows/pages.yml`.

## Updating dependencies

Change versions deliberately (`npm install mermaid@<version> --save-exact`), then run `npm run dev` and look at a page with diagrams before pushing.
