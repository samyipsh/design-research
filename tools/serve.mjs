// Local preview of _site/ under the same subpath GitHub Pages uses, so relative links
// and the 404 page behave as they will in production.
//   npm run preview            → http://localhost:4173/design-research/
//   PORT=8080 npm run preview  → another port
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { paths, site } from './config.mjs';

const port = Number(process.env.PORT ?? 4173);
const root = path.resolve(paths.out);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

async function send(res, status, file) {
  const body = await fs.readFile(file);
  res.writeHead(status, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/' || url.pathname === site.basePath.slice(0, -1)) {
    res.writeHead(302, { Location: site.basePath });
    return res.end();
  }
  const notFound = () => send(res, 404, path.join(root, '404.html'));
  if (!url.pathname.startsWith(site.basePath)) return notFound();

  let rel;
  try {
    rel = decodeURIComponent(url.pathname.slice(site.basePath.length));
  } catch {
    return notFound();
  }
  let file = path.resolve(root, rel);
  if (!file.startsWith(root)) return notFound();

  const stat = await fs.stat(file).catch(() => null);
  if (stat?.isDirectory()) {
    if (!url.pathname.endsWith('/')) {
      res.writeHead(301, { Location: `${url.pathname}/${url.search}` });
      return res.end();
    }
    file = path.join(file, 'index.html');
  } else if (!stat && !path.extname(file)) {
    file = `${file}.html`;
  }
  const ok = await fs.stat(file).then((s) => s.isFile(), () => false);
  return ok ? send(res, 200, file) : notFound();
});

server.listen(port, () => console.log(`Previewing ${paths.out}/ at http://localhost:${port}${site.basePath}  (Ctrl+C to stop)`));
