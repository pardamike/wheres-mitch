import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '../..');
const manifestPath = path.join(repositoryRoot, 'docs/ART-BIBLE.md');

function relative(filePath: string): string {
  return path.relative(repositoryRoot, filePath).split(path.sep).join('/');
}

function filesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(entryPath) : [entryPath];
  });
}

function optionalFilesUnder(directory: string): string[] {
  return existsSync(directory) ? filesUnder(directory) : [];
}

describe('shipped asset manifest', () => {
  it('records every code-authored art, audio, and local SVG asset with rights metadata', () => {
    const manifest = readFileSync(manifestPath, 'utf8');
    const artFiles = filesUnder(path.join(repositoryRoot, 'src/render/art')).filter((filePath) =>
      filePath.endsWith('.ts'),
    );
    const audioFiles = optionalFilesUnder(path.join(repositoryRoot, 'src/audio')).filter(
      (filePath) => filePath.endsWith('.ts'),
    );
    const publicSvgFiles = filesUnder(path.join(repositoryRoot, 'public')).filter((filePath) =>
      filePath.endsWith('.svg'),
    );
    const requiredPaths = [
      ...artFiles,
      ...audioFiles,
      ...publicSvgFiles,
      path.join(repositoryRoot, 'src/render/stage-renderer.ts'),
    ].map(relative);

    expect(manifest).toContain('| Asset family | Author/source | Owning source path | License |');
    for (const filePath of requiredPaths) {
      expect(manifest).toContain(`\`${filePath}\``);
    }
  });

  it('keeps art and audio sources local, code-authored, and free of HTML-string injection', () => {
    const sourceFiles = [
      ...filesUnder(path.join(repositoryRoot, 'src/render/art')),
      ...optionalFilesUnder(path.join(repositoryRoot, 'src/audio')).filter((filePath) =>
        filePath.endsWith('.ts'),
      ),
    ];
    for (const sourceFile of sourceFiles) {
      const source = readFileSync(sourceFile, 'utf8');
      expect(source).not.toMatch(/innerHTML|outerHTML/);
      expect(source).not.toMatch(/https?:\/\//);
    }
  });
});
