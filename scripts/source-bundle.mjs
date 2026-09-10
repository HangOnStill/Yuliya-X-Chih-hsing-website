import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { zipSync, strToU8 } from 'fflate';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = resolve(process.argv[2] || resolve(root, 'bundles/Yuliya_V5_Bundle.zip'));
let files;
let sourceCommit = 'from-source-bundle';
try {
  sourceCommit = execFileSync('git', ['rev-parse', '--verify', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  const status = execFileSync('git', ['status', '--porcelain', '--untracked-files=normal'], { cwd: root, encoding: 'utf8' });
  if (status.trim()) throw new Error('Commit intended source changes before making the release bundle.');
  files = execFileSync('git', ['ls-tree', '-r', '--name-only', '-z', 'HEAD'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
} catch (error) {
  if (sourceCommit !== 'from-source-bundle') throw error;
  const manifest = JSON.parse(await readFile(resolve(root, 'SOURCE_FILES.json'), 'utf8'));
  files = manifest.files;
  sourceCommit = manifest.sourceCommit;
}
const zipFiles = {};
for (const name of files) {
  if (name.startsWith('/') || name.split('/').some(part => ['..', '.git', 'node_modules', '.sites-runtime', '.wrangler'].includes(part))) throw new Error('Unsafe source path: ' + name);
  zipFiles['Yuliya_V5/' + name] = new Uint8Array(await readFile(resolve(root, name)));
}
zipFiles['Yuliya_V5/SOURCE_FILES.json'] = strToU8(JSON.stringify({ version: 5, sourceCommit, files }, null, 2) + '\n');
await mkdir(dirname(destination), { recursive: true });
await writeFile(destination, zipSync(zipFiles, { level: 6 }));
console.log(`Created ${destination} (${files.length} source files, commit ${sourceCommit}).`);
