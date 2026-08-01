import { build } from 'esbuild';
import { cp, mkdir, readdir, readFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
export const repositoryRoot = path.resolve(scriptDirectory, '..');
export const productionDirectory = path.join(repositoryRoot, 'dist');
const publicDirectory = path.join(repositoryRoot, 'public');
const entryPoint = path.join(repositoryRoot, 'src', 'main.ts');
const publicFiles = ['index.html', 'styles.css', 'favicon.svg', '404.html', '_headers'];

export function assertSafeOutputDirectory(candidate) {
  const resolved = path.resolve(candidate);
  if (resolved !== productionDirectory || path.dirname(resolved) !== repositoryRoot) {
    throw new Error(`Refusing to clear unsafe output directory: ${resolved}`);
  }
  return resolved;
}

async function copyPublicFiles(outputDirectory) {
  for (const file of publicFiles) {
    await cp(path.join(publicDirectory, file), path.join(outputDirectory, file));
  }
}

function assertArtifactIsPortable(fileName, contents) {
  const portableContents = contents.split('http://www.w3.org/2000/svg').join('');
  const disallowedPatterns = [
    [/type\s*=\s*["']module["']/i, 'module script'],
    [/\bimport\s*\(/, 'dynamic import'],
    [/^\s*import\s/m, 'top-level import'],
    [/\brequire\s*\(/, 'CommonJS require'],
    [/https?:\/\//i, 'remote URL'],
    [/(?:src|href)\s*=\s*["']\/(?!\/)/i, 'root-absolute asset URL'],
    [/url\(\s*["']?\/(?!\/)/i, 'root-absolute CSS URL'],
    [/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\b/, 'network API'],
  ];

  for (const [pattern, label] of disallowedPatterns) {
    if (pattern.test(portableContents)) {
      throw new Error(`Generated ${fileName} contains a forbidden ${label}.`);
    }
  }
}

async function listArtifactFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
}

export async function buildArtifact({ outputDirectory = productionDirectory } = {}) {
  const safeOutputDirectory = assertSafeOutputDirectory(outputDirectory);
  await rm(safeOutputDirectory, { recursive: true, force: true });
  await mkdir(safeOutputDirectory, { recursive: true });

  await build({
    entryPoints: [entryPoint],
    outfile: path.join(safeOutputDirectory, 'game.js'),
    bundle: true,
    platform: 'browser',
    format: 'iife',
    target: ['es2020'],
    sourcemap: process.env.NODE_ENV === 'development',
    minify: process.env.NODE_ENV === 'production',
    legalComments: 'none',
  });

  await copyPublicFiles(safeOutputDirectory);

  for (const fileName of ['index.html', 'styles.css', 'game.js']) {
    const contents = await readFile(path.join(safeOutputDirectory, fileName), 'utf8');
    assertArtifactIsPortable(fileName, contents);
  }

  const fileNames = await listArtifactFiles(safeOutputDirectory);
  const expectedFiles = [...publicFiles, 'game.js'].sort();
  if (fileNames.join('|') !== expectedFiles.join('|')) {
    throw new Error(`Build emitted an unexpected artifact set: ${fileNames.join(', ')}`);
  }

  const summary = await Promise.all(
    fileNames.map(async (fileName) => {
      const details = await stat(path.join(safeOutputDirectory, fileName));
      return `${fileName} (${details.size} bytes)`;
    }),
  );
  console.log(`Built static artifact: ${summary.join(', ')}`);
}

function readOutputArgument(argumentsList) {
  const index = argumentsList.indexOf('--output');
  if (index === -1) {
    return productionDirectory;
  }
  const supplied = argumentsList[index + 1];
  if (!supplied) {
    throw new Error('Missing path after --output.');
  }
  return path.resolve(repositoryRoot, supplied);
}

const invokedAsScript =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedAsScript) {
  buildArtifact({ outputDirectory: readOutputArgument(process.argv.slice(2)) }).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
