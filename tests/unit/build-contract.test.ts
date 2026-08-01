import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '../..');
const distDirectory = path.join(repositoryRoot, 'dist');
const sentinelPath = path.join(repositoryRoot, 'README.md');

function runBuild(...argumentsList: string[]) {
  execFileSync(process.execPath, ['scripts/build.mjs', ...argumentsList], {
    cwd: repositoryRoot,
    stdio: 'pipe',
  });
}

describe('static build contract', () => {
  beforeAll(() => {
    runBuild();
  });

  it('emits the documented portable static artifact', () => {
    expect(existsSync(path.join(distDirectory, 'index.html'))).toBe(true);
    expect(existsSync(path.join(distDirectory, 'styles.css'))).toBe(true);
    expect(existsSync(path.join(distDirectory, 'game.js'))).toBe(true);
    expect(existsSync(path.join(distDirectory, 'assets', 'mitch-head.png'))).toBe(true);

    const html = readFileSync(path.join(distDirectory, 'index.html'), 'utf8');
    const script = readFileSync(path.join(distDirectory, 'game.js'), 'utf8');
    const styles = readFileSync(path.join(distDirectory, 'styles.css'), 'utf8');

    expect(html).toContain('href="./styles.css"');
    expect(html).toContain('src="./game.js"');
    expect(html).not.toMatch(/type\s*=\s*["']module["']/i);
    const runtimeArtifact = `${html}\n${styles}\n${script}`
      .split('http://www.w3.org/2000/svg')
      .join('');
    expect(runtimeArtifact).not.toMatch(/https?:\/\//i);
    expect(script).not.toMatch(/\bimport\s*\(|^\s*import\s/m);
    expect(script).not.toMatch(/\brequire\s*\(/);
    expect(script).toContain('./assets/mitch-head.png');
  });

  it('refuses a build target outside the exact dist directory', () => {
    const before = readFileSync(sentinelPath, 'utf8');

    expect(() => runBuild('--output', '../unsafe-output')).toThrow();
    expect(readFileSync(sentinelPath, 'utf8')).toBe(before);
  });
});
