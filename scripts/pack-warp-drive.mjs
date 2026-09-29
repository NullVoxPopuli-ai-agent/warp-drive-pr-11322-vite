// Usage: node scripts/pack-warp-drive.mjs <warp-drive checkout> <package name...>
//
// Packs the named packages and their workspace dependencies into vendor/,
// from a warp-drive checkout of PR 11322 that already ran `pnpm install && pnpm build`.
//
// PR 11322 keeps @embroider/macros in @warp-drive/build-config's dependencies.
// This script moves it to peerDependencies there, so no WarpDrive package has its own copy.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [repoRoot, ...roots] = process.argv.slice(2);
const outDir = path.resolve('vendor');

const byName = new Map();
for (const group of ['packages', 'warp-drive-packages']) {
  for (const entry of fs.readdirSync(path.join(repoRoot, group))) {
    const dir = path.join(repoRoot, group, entry);
    const manifest = path.join(dir, 'package.json');
    if (!fs.existsSync(manifest)) continue;
    const pkg = JSON.parse(fs.readFileSync(manifest, 'utf8'));
    byName.set(pkg.name, { dir, pkg });
  }
}

const seen = new Set();
const queue = roots.slice();
while (queue.length) {
  const name = queue.shift();
  if (seen.has(name) || !byName.has(name)) continue;
  seen.add(name);
  const { pkg } = byName.get(name);
  const deps = Object.assign({}, pkg.dependencies, pkg.peerDependencies);
  for (const [dep, range] of Object.entries(deps)) {
    if (byName.has(dep) && String(range).startsWith('workspace:')) queue.push(dep);
  }
}

function moveMacrosToPeer(tarball) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pack-'));
  execFileSync('tar', ['xzf', tarball, '-C', tmp]);
  const manifest = path.join(tmp, 'package', 'package.json');
  const pkg = JSON.parse(fs.readFileSync(manifest, 'utf8'));
  const range = pkg.dependencies['@embroider/macros'];
  delete pkg.dependencies['@embroider/macros'];
  pkg.peerDependencies = Object.assign({}, pkg.peerDependencies, { '@embroider/macros': range });
  fs.writeFileSync(manifest, JSON.stringify(pkg, null, 2) + '\n');
  execFileSync('tar', ['czf', tarball, '-C', tmp, 'package']);
  fs.rmSync(tmp, { recursive: true });
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir);
const packed = {};
for (const name of Array.from(seen).sort()) {
  const { dir, pkg } = byName.get(name);
  const out = execFileSync('pnpm', ['pack', '--pack-destination', outDir], { cwd: dir, encoding: 'utf8' });
  const file = path.basename(out.trim().split('\n').pop());
  if (name === '@warp-drive/build-config') moveMacrosToPeer(path.join(outDir, file));
  packed[name] = { version: pkg.version, file };
  console.log(name, pkg.version, file);
}
fs.writeFileSync(path.join(outDir, 'packed.json'), JSON.stringify(packed, null, 2) + '\n');
