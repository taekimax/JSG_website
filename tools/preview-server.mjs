import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.woff2': 'font/woff2',
  '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf'
};
const PUBLIC_DIRS = new Set(['assets', 'scripts', 'styles', 'admin']);
const within = (file, root) => file.startsWith(`${root}${path.sep}`);

// Serve live visitor files; the /jsg prefix exists only in this preview response.
export function createPreviewServer({ root, contentRoot, prefix = '/jsg' }) {
  root = path.resolve(root);
  contentRoot = path.resolve(contentRoot);
  return http.createServer(async (request, response) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method)) {
        response.writeHead(405, { Allow: 'GET, HEAD' });
        return response.end();
      }
      const rawPath = decodeURIComponent(request.url.split('?')[0]);
      if ([prefix, `${prefix}/`, '/'].includes(rawPath)) {
        const query = request.url.includes('?') ? request.url.slice(request.url.indexOf('?')) : '';
        response.writeHead(302, { Location: `${prefix}/about.html${query}` });
        return response.end();
      }
      if (!rawPath.startsWith(`${prefix}/`) || rawPath.includes('\\') ||
          rawPath.split('/').some(part => part.startsWith('.')) || rawPath.includes('\0')) {
        response.writeHead(404);
        return response.end();
      }
      const relative = rawPath.slice(prefix.length + 1) || 'index.html';
      const parts = relative.split('/');
      let allowedRoot;
      let target;
      if (parts[0] === 'board-content') {
        allowedRoot = contentRoot;
        target = path.join(contentRoot, ...parts.slice(1));
      } else if (PUBLIC_DIRS.has(parts[0])) {
        allowedRoot = path.join(root, parts[0]);
        target = path.join(root, relative);
      } else if (parts.length === 1 && relative.endsWith('.html')) {
        allowedRoot = root;
        target = path.join(root, relative);
      } else {
        response.writeHead(404);
        return response.end();
      }
      if (relative.endsWith('/')) target = path.join(target, 'index.html');
      // Block symlink escapes as well as URL traversal; never list directories.
      const [realTarget, realRoot] = await Promise.all([fs.realpath(target), fs.realpath(allowedRoot)]);
      if (!within(realTarget, realRoot) || !(await fs.stat(realTarget)).isFile()) {
        response.writeHead(404);
        return response.end();
      }
      let body = await fs.readFile(realTarget);
      const extension = path.extname(target).toLowerCase();
      if (['.json', '.html'].includes(extension)) {
        body = Buffer.from(body.toString('utf8').replace(/(?<![A-Za-z0-9:/])\/board-content\//g,
          `${prefix}/board-content/`));
      }
      response.writeHead(200, {
        'Content-Type': MIME[extension] || 'application/octet-stream',
        'Content-Length': body.length,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch (error) {
      response.writeHead(['ENOENT', 'ENOTDIR', 'EISDIR'].includes(error.code) ? 404 : 400);
      response.end();
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const contentRoot = process.env.JSG_CONTENT_DIST || path.resolve(root, '../jsg-board-content/dist');
  const port = Number(process.env.JSG_PREVIEW_PORT || 4174);
  createPreviewServer({ root, contentRoot }).listen(port, '127.0.0.1', () => {
    console.log(`JSG live preview: http://127.0.0.1:${port}/jsg/`);
  });
}
