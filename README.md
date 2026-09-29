# WarpDrive PR 11322 in a Vite app without a framework

```sh
pnpm install
pnpm check:install
pnpm test
```

This app tests [warp-drive-data/warp-drive#11322](https://github.com/warp-drive-data/warp-drive/pull/11322) in a non-ember app: Vite 8, plain JavaScript, and TC39 signals through `@warp-drive/tc39-proposal-signals`.

No WarpDrive package in this app has `@embroider/macros` in its `dependencies`. The app sets up babel, `babel-plugin-debug-macros`, and `@embroider/macros` itself.

## Results

| Step | Result |
| --- | --- |
| `pnpm check:install` | 5 of 5 WarpDrive packages have no `@embroider/macros` dependency |
| `pnpm test`, dev server | pass, `DEBUG` is `true` |
| `pnpm test`, production build | pass, `DEBUG` is `false`, and the bundle has no `@embroider/macros` or `@ember/debug` left |

Local run: Node 24.20.0, pnpm 10.34.5, Chrome 152. CI runs the same steps on every push.

As a control, the production build fails if babel does not run on the WarpDrive files: `Rolldown failed to resolve import "@ember/debug"`. So the app's babel pass is what makes WarpDrive work.

## What the app does

`src/main.js`:

1. Requests `public/api/posts/1.json` with `store.request`.
2. Renders the title of the record.
3. Pushes a new title into the cache with `store.push`, and reads it from the same record.
4. Renders `DEBUG` from `@warp-drive/core/build-config/env`.

`tests/app.spec.js` runs in Chrome against `vite dev` and against `vite build` plus `vite preview`.

## Build setup

- `babel.config.mjs` is the setup from WarpDrive's own non-ember test apps (`tests/framework-react`, `tests/framework-vue`): `macros()` from `@warp-drive/core/build-config/babel-macros`, `babel-plugin-debug-macros`, and `buildMacros` from `@embroider/macros/babel` with `setConfig`.
- `vite.config.mjs` runs babel on `src/` and on the WarpDrive files in `node_modules`.
- The Vite dev server pre-bundles dependencies without app plugins, so `optimizeDeps.exclude` lists the WarpDrive packages. `json-to-ast` is CommonJS, so it stays pre-bundled.
- `pnpm build` sets `NODE_ENV=production`, because the WarpDrive build config reads it.

## The WarpDrive packages

The tarballs in `vendor/` come from PR 11322 at commit `8d6991d04`:

1. In a warp-drive checkout of the PR, run `pnpm install` and then `pnpm build`.
2. In this repo, run `node scripts/pack-warp-drive.mjs <checkout> @warp-drive/core @warp-drive/json-api @warp-drive/utilities @warp-drive/tc39-proposal-signals`.

The PR keeps `@embroider/macros` in the `dependencies` of `@warp-drive/build-config`. The pack script moves it to `peerDependencies` there. So in this app, no WarpDrive package has its own copy at all. `build-config` uses the app's copy.

`pnpm.overrides` in `package.json` points every WarpDrive package at its tarball.

`.npmrc` sets `hoist=false`. Then a package can only resolve its own linked dependencies and the app's dependencies.
