# Instructions for agents

This repo publishes a **public** static site (GitHub Pages) from `content/`. Read `README.md` for the conventions; these are the rules.

## What may be published

- Only files the user explicitly selected for publishing. Never copy whole vault folders, unrelated notes, private project files, prompts, logs, chat transcripts, credentials, `.env` files or absolute home paths.
- This repo is a publishing copy. Never modify the source vault, and never add scripts that read from or sync with absolute vault paths.
- Don't invent content. No placeholder projects or example artifacts that pretend to exist.

## Adding or updating research

- One folder per package in `content/research/<package>/`, with a `_ <Title>.md` hub, numbered chapters, other notes as reference, companion `.html` files, and `meta.json` (`title`, `summary`, optional `snapshot`, `reviewed`, `companions`).
- Keep research prose, dates and sources as written. Allowed web adaptations, kept minimal and mentioned in the commit message:
  - in companion HTML, turn Obsidian-only references into relative links and add a back link `<a href="./">` to the package;
  - escape Mermaid syntax that fails to parse (for example `;` inside message text becomes `#59;`).
- Known difference from the vault: `object-storage/04 Browser Uploads in Practice.md` uses `#59;` in its sequence diagram, and both object-storage companions carry web links. Re-apply these if the files are re-imported.

## Adding design files

- Copy the project's files into `content/design/<project>/` unchanged. Paths inside must be relative, not root-absolute.
- Optional `meta.json` with `title` and `summary`.

## Before every commit

```sh
npm run build && npm run check
```

Both must pass. Don't commit `_site/` or `node_modules/`. Pushing to `main` deploys; check that the **Publish site** workflow succeeds.

## Keep it small

- No frameworks, analytics, trackers, external CDNs or paid services. Fonts and Mermaid are self-hosted from pinned npm packages.
- Folder and file names become URLs. Don't rename published files without a reason.
- Change the build only when content needs it, and keep `tools/` plain Node.
