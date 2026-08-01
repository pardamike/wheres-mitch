import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  access,
  cp,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  stat,
  utimes,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { productionDirectory, repositoryRoot } from './build.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.join(repositoryRoot, 'package.json');
const releaseDirectory = path.join(repositoryRoot, 'release');
const zipEpoch = new Date('1980-01-01T00:00:00.000Z');

function run(command, argumentsList, options = {}) {
  const result = spawnSync(command, argumentsList, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: 'inherit',
    ...options,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${command} ${argumentsList.join(' ')} failed with status ${result.status}.`);
  }
}

function gitStatus() {
  const result = spawnSync('git', ['status', '--porcelain', '--untracked-files=all'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  });
  if (result.error || result.status !== 0) {
    throw new Error('Unable to verify the Git worktree before packaging.');
  }
  return result.stdout.trim();
}

async function pathExists(candidate) {
  try {
    await access(candidate);
    return true;
  } catch {
    return false;
  }
}

async function normalizeTimestamps(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await normalizeTimestamps(entryPath);
    }
    await utimes(entryPath, zipEpoch, zipEpoch);
  }
}

async function artifactSummary(directory, relativeDirectory = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((first, second) => first.name.localeCompare(second.name))) {
    const relativePath = path.join(relativeDirectory, entry.name);
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await artifactSummary(entryPath, relativePath)));
      continue;
    }
    if (!entry.isFile()) {
      throw new Error(`Release artifact contains an unsupported entry: ${relativePath}`);
    }
    const details = await stat(entryPath);
    files.push({ name: relativePath, size: details.size });
  }
  return files.sort((first, second) => first.name.localeCompare(second.name));
}

async function main() {
  if (gitStatus()) {
    throw new Error(
      'Refusing to package from a dirty worktree. Commit or stash source changes first.',
    );
  }

  run('npm', ['run', 'verify']);
  run('npm', ['run', 'verify:dist']);

  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  const version = packageJson.version;
  if (typeof version !== 'string' || !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error('package.json needs a valid semantic version before packaging.');
  }

  const archiveName = `wheres-mitch-v${version}.zip`;
  const checksumName = `wheres-mitch-v${version}.sha256`;
  const archivePath = path.join(releaseDirectory, archiveName);
  const checksumPath = path.join(releaseDirectory, checksumName);
  if ((await pathExists(archivePath)) || (await pathExists(checksumPath))) {
    throw new Error(`Release outputs already exist for v${version}; refusing to overwrite them.`);
  }

  const stagingDirectory = await mkdtemp(path.join(tmpdir(), 'wheres-mitch-release-'));
  try {
    await cp(productionDirectory, stagingDirectory, { recursive: true });
    await normalizeTimestamps(stagingDirectory);
    const files = await artifactSummary(stagingDirectory);
    const archiveInputNames = files.map((file) => file.name);

    await mkdir(releaseDirectory, { recursive: true });
    const zipResult = spawnSync('zip', ['-X', '-q', archivePath, ...archiveInputNames], {
      cwd: stagingDirectory,
      encoding: 'utf8',
    });
    if (zipResult.error || zipResult.status !== 0) {
      throw zipResult.error ?? new Error('zip failed while creating the release archive.');
    }

    const checksum = createHash('sha256')
      .update(await readFile(archivePath))
      .digest('hex');
    await writeFile(checksumPath, `${checksum}  ${archiveName}\n`, 'utf8');
    const archiveSize = (await stat(archivePath)).size;
    console.log(`Packaged ${archiveName} (${archiveSize} bytes)`);
    for (const file of files) {
      console.log(`  ${file.name} (${file.size} bytes)`);
    }
    console.log(`SHA-256: ${checksum}`);
  } finally {
    await rm(stagingDirectory, { recursive: true, force: true });
  }
}

const invokedAsScript =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.join(scriptDirectory, 'package-release.mjs');
if (invokedAsScript) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
