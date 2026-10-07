import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';

const root = join(process.cwd(), 'dist', 'client', 'ong_ong');
const mime = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
};

createServer(async (request, response) => {
  const pathname = new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
  if (!pathname.startsWith('/ong_ong/')) {
    response.writeHead(404).end();
    return;
  }

  const relative = decodeURIComponent(pathname.slice('/ong_ong/'.length));
  const path = normalize(join(root, relative));
  if (path !== root && !path.startsWith(root + sep)) {
    response.writeHead(403).end();
    return;
  }

  try {
    const file = (await stat(path)).isDirectory() ? join(path, 'index.html') : path;
    const body = await readFile(file);
    response.writeHead(200, { 'content-type': mime[extname(file)] ?? 'application/octet-stream' }).end(body);
  } catch {
    response.writeHead(404).end();
  }
}).listen(8766, '127.0.0.1', () => {
  process.stdout.write('Local Pages preview: http://127.0.0.1:8766/ong_ong/\n');
});
