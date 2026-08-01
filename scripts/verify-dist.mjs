import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { productionDirectory } from './build.mjs';

const expectedFiles = [
  '404.html',
  '_headers',
  'favicon.svg',
  'game.js',
  'index.html',
  'styles.css',
];
const textFiles = ['404.html', 'favicon.svg', 'game.js', 'index.html', 'styles.css'];

function fail(message) {
  throw new Error(`Production artifact verification failed: ${message}`);
}

function withoutSvgNamespace(contents) {
  return contents.replaceAll('http://www.w3.org/2000/svg', '');
}

function assertNoForbiddenRuntimePattern(fileName, contents) {
  const portableContents = withoutSvgNamespace(contents);
  const forbiddenPatterns = [
    [/type\s*=\s*["']module["']/i, 'module script'],
    [/\bimport\s*\(/, 'dynamic import'],
    [/^\s*import\s/m, 'top-level import'],
    [/\brequire\s*\(/, 'CommonJS require'],
    [/https?:\/\//i, 'remote URL'],
    [/(?:src|href)\s*=\s*["']\/(?!\/)/i, 'root-absolute asset URL'],
    [/url\(\s*["']?\/(?!\/)/i, 'root-absolute CSS URL'],
    [/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/, 'network API'],
    [/\b(?:importScripts|serviceWorker|SharedWorker|new\s+Worker)\b/, 'worker runtime'],
    [/sourceMappingURL|sourcesContent/, 'source-map payload'],
  ];

  for (const [pattern, label] of forbiddenPatterns) {
    if (pattern.test(portableContents)) {
      fail(`${fileName} contains a forbidden ${label}.`);
    }
  }
}

async function artifactFileNames() {
  const entries = await readdir(productionDirectory, { withFileTypes: true });
  if (entries.some((entry) => !entry.isFile())) {
    fail('dist must contain only the documented root-level files.');
  }
  return entries.map((entry) => entry.name).sort();
}

async function main() {
  const fileNames = await artifactFileNames();
  if (fileNames.join('|') !== expectedFiles.join('|')) {
    fail(`expected ${expectedFiles.join(', ')}, found ${fileNames.join(', ')}.`);
  }

  const contents = new Map();
  for (const fileName of textFiles) {
    const filePath = path.join(productionDirectory, fileName);
    const details = await stat(filePath);
    if (!details.isFile() || details.size === 0) {
      fail(`${fileName} is missing or empty.`);
    }
    const text = await readFile(filePath, 'utf8');
    contents.set(fileName, text);
    assertNoForbiddenRuntimePattern(fileName, text);
  }

  const html = contents.get('index.html');
  const script = contents.get('game.js');
  if (!html?.includes('href="./styles.css"') || !html.includes('src="./game.js"')) {
    fail('index.html must reference the stylesheet and classic game script relatively.');
  }
  if (!html.includes('href="./favicon.svg"')) {
    fail('index.html must reference the favicon relatively.');
  }
  if (!script?.includes('(() => {')) {
    fail('game.js is not the expected classic IIFE bundle.');
  }

  console.log(`Verified portable static artifact: ${fileNames.join(', ')}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
