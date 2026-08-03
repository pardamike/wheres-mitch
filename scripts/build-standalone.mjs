import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildArtifact, productionDirectory, repositoryRoot } from './build.mjs';
import { verifyProductionArtifact } from './verify-dist.mjs';

export const standaloneDirectory = path.join(repositoryRoot, 'release');
export const standaloneFileName = 'wheres-mitch-standalone.html';
export const standaloneArtifactPath = path.join(standaloneDirectory, standaloneFileName);

const faviconLink = '<link rel="icon" href="./favicon.svg" type="image/svg+xml" />';
const stylesheetLink = '<link rel="stylesheet" href="./styles.css" />';
const gameScriptTag = '<script defer src="./game.js"></script>';
const mitchHeadPath = './assets/mitch-head.png';

function dataUrl(mimeType, contents) {
  if (!Buffer.isBuffer(contents)) {
    throw new Error(`Standalone build expected binary ${mimeType} contents.`);
  }
  return `data:${mimeType};base64,${contents.toString('base64')}`;
}

function replaceRequired(source, target, replacement, label) {
  const occurrences = source.split(target).length - 1;
  if (occurrences === 0) {
    throw new Error(`Standalone build could not find the ${label}.`);
  }
  return source.replaceAll(target, replacement);
}

function escapeRawText(contents, closingTag) {
  return contents.replace(new RegExp(`</${closingTag}`, 'gi'), `<\\/${closingTag}`);
}

function assertStandaloneHtml(contents) {
  const leftoverReferences = ['./styles.css', './game.js', './favicon.svg', mitchHeadPath];
  for (const reference of leftoverReferences) {
    if (contents.includes(reference)) {
      throw new Error(`Standalone build still contains an external reference: ${reference}`);
    }
  }
  if (!contents.includes('data:image/png;base64,')) {
    throw new Error('Standalone build is missing the embedded Mitch head PNG.');
  }
  const faviconHref = contents.match(
    /<link rel="icon" href="([^"]+)" type="image\/svg\+xml" \/>/,
  )?.[1];
  if (!faviconHref || !/^data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+$/.test(faviconHref)) {
    throw new Error('Standalone build is missing a valid embedded favicon.');
  }
  if (!contents.includes('<style>') || !contents.includes('<script>')) {
    throw new Error('Standalone build is missing its embedded stylesheet or game script.');
  }
}

export function createStandaloneHtml({ html, styles, gameScript, favicon, mitchHead }) {
  const faviconDataUrl = dataUrl('image/svg+xml', favicon);
  const mitchHeadDataUrl = dataUrl('image/png', mitchHead);
  const embeddedGameScript = replaceRequired(
    gameScript,
    mitchHeadPath,
    mitchHeadDataUrl,
    'Mitch head reference in the game bundle',
  );

  let standaloneHtml = replaceRequired(
    html,
    faviconLink,
    `<link rel="icon" href="${faviconDataUrl}" type="image/svg+xml" />`,
    'favicon link',
  );
  standaloneHtml = replaceRequired(
    standaloneHtml,
    stylesheetLink,
    `<style>\n${escapeRawText(styles, 'style')}\n</style>`,
    'stylesheet link',
  );
  standaloneHtml = replaceRequired(
    standaloneHtml,
    mitchHeadPath,
    mitchHeadDataUrl,
    'Mitch head reference in the title art',
  );
  standaloneHtml = replaceRequired(
    standaloneHtml,
    gameScriptTag,
    `<script>\ndocument.addEventListener('DOMContentLoaded', () => {\n${escapeRawText(
      embeddedGameScript,
      'script',
    )}\n});\n</script>`,
    'game script tag',
  );
  assertStandaloneHtml(standaloneHtml);
  return standaloneHtml;
}

export async function buildStandaloneArtifact() {
  await buildArtifact();
  await verifyProductionArtifact();

  const [html, styles, gameScript, favicon, mitchHead] = await Promise.all([
    readFile(path.join(productionDirectory, 'index.html'), 'utf8'),
    readFile(path.join(productionDirectory, 'styles.css'), 'utf8'),
    readFile(path.join(productionDirectory, 'game.js'), 'utf8'),
    readFile(path.join(productionDirectory, 'favicon.svg')),
    readFile(path.join(productionDirectory, 'assets', 'mitch-head.png')),
  ]);
  const standaloneHtml = createStandaloneHtml({ html, styles, gameScript, favicon, mitchHead });

  await mkdir(standaloneDirectory, { recursive: true });
  await writeFile(standaloneArtifactPath, standaloneHtml, 'utf8');
  const details = await stat(standaloneArtifactPath);
  console.log(`Built standalone artifact: ${standaloneFileName} (${details.size} bytes)`);
  return standaloneArtifactPath;
}

const invokedAsScript =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedAsScript) {
  buildStandaloneArtifact().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
