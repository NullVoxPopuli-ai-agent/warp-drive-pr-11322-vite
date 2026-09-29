// Fails if any installed WarpDrive package still depends on @embroider/macros.
// It checks the package.json that bundlers and ember-cli read,
// and the links pnpm made for that package.
import fs from 'node:fs';
import path from 'node:path';

function isWarpDrive(name) {
  return (
    name === 'ember-data' ||
    name === 'warp-drive' ||
    name.startsWith('@warp-drive/') ||
    (name.startsWith('@ember-data/') && name !== '@ember-data/rfc395-data')
  );
}

const appMacros = fs.realpathSync('node_modules/@embroider/macros');
const store = path.resolve('node_modules/.pnpm');

let failures = 0;
let checked = 0;
function fail(message) {
  console.error(`FAIL ${message}`);
  failures++;
}

for (const entry of fs.readdirSync(store)) {
  const modules = path.join(store, entry, 'node_modules');
  if (!fs.existsSync(modules)) continue;

  for (const scopeOrName of fs.readdirSync(modules)) {
    const names = scopeOrName.startsWith('@')
      ? fs.readdirSync(path.join(modules, scopeOrName)).map((n) => `${scopeOrName}/${n}`)
      : [scopeOrName];

    for (const name of names) {
      const dir = path.join(modules, name);
      if (!isWarpDrive(name) || fs.lstatSync(dir).isSymbolicLink()) continue;
      checked++;

      const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
      const id = `${name}@${pkg.version}`;
      const link = path.join(modules, '@embroider/macros');
      const isPeer = Boolean(pkg.peerDependencies?.['@embroider/macros']);

      if (pkg.dependencies?.['@embroider/macros']) {
        fail(`${id} lists @embroider/macros in dependencies`);
      } else if (fs.existsSync(link) && !isPeer) {
        fail(`${id} has @embroider/macros linked at ${link}`);
      } else if (fs.existsSync(link) && fs.realpathSync(link) !== appMacros) {
        fail(`${id} peer @embroider/macros is not the app's copy`);
      } else {
        console.log(`ok   ${id}: ${isPeer ? "peerDependency, uses the app's copy" : 'no @embroider/macros'}`);
      }
    }
  }
}

if (checked === 0) fail('no WarpDrive packages found in node_modules/.pnpm');
process.exit(failures ? 1 : 0);
