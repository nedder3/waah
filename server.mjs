// Static dev server for local preview (no build step).
// Serves the repo root as ESM-friendly static files so `src/main.js` loads directly.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5173;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';
    // Prevent path traversal.
    const safePath = normalize(join(ROOT, pathname));
    if (!safePath.startsWith(ROOT)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    const info = await stat(safePath).catch(() => null);
    if (!info || !info.isFile()) {
      res.writeHead(404).end('Not found');
      return;
    }
    const data = await readFile(safePath);
    res.writeHead(200, { 'Content-Type': TYPES[extname(safePath)] || 'application/octet-stream' });
    res.end(data);
  } catch (err) {
    res.writeHead(500).end('Server error');
  }
});

server.listen(PORT, () => {
  console.log(`WAHH dev server on http://localhost:${PORT}`);
});
