import { createReadStream } from 'node:fs';
import { watch } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildArtifact, productionDirectory, repositoryRoot } from './build.mjs';

const port = Number.parseInt(process.env.PORT ?? '4173', 10);
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function safeFilePath(urlPath) {
  const requestedPath = urlPath === '/' ? '/index.html' : urlPath;
  const decoded = decodeURIComponent(requestedPath);
  const resolved = path.resolve(productionDirectory, `.${decoded}`);
  return resolved.startsWith(`${productionDirectory}${path.sep}`) ? resolved : null;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function start() {
  await buildArtifact();

  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
    const requestedFile = safeFilePath(url.pathname);
    const fallbackFile = path.join(productionDirectory, '404.html');
    const filePath = requestedFile && (await exists(requestedFile)) ? requestedFile : fallbackFile;
    const details = await stat(filePath);

    response.writeHead(filePath === fallbackFile ? 404 : 200, {
      'Content-Length': details.size,
      'Content-Type': mimeTypes[path.extname(filePath)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    createReadStream(filePath).pipe(response);
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`Where's Mitch? development server: http://127.0.0.1:${port}`);
  });

  let rebuilding = false;
  const rebuild = async () => {
    if (rebuilding) {
      return;
    }
    rebuilding = true;
    try {
      await buildArtifact();
      console.log('Rebuilt static artifact.');
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    } finally {
      rebuilding = false;
    }
  };

  for (const directory of ['src', 'public']) {
    watch(path.join(repositoryRoot, directory), { recursive: true }, rebuild);
  }
}

const invokedAsScript =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedAsScript) {
  start().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
