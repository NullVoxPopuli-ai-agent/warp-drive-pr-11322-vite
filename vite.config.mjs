import { babel } from '@rollup/plugin-babel';
import { defineConfig } from 'vite';

const warpDrive = ['@warp-drive/core', '@warp-drive/json-api', '@warp-drive/utilities', '@warp-drive/tc39-proposal-signals'];

export default defineConfig({
  plugins: [
    {
      ...babel({
        configFile: './babel.config.mjs',
        babelHelpers: 'bundled',
        skipPreflightCheck: true,
        extensions: ['.js'],
        // The published WarpDrive dist imports @embroider/macros.
        // The app's babel pass compiles those imports away.
        include: [/\/src\//, /\/node_modules\/@warp-drive\//],
      }),
      enforce: 'pre',
    },
  ],
  optimizeDeps: {
    // The dev server pre-bundles dependencies without app plugins, so babel would never see them.
    exclude: warpDrive,
    // CommonJS dependencies of excluded packages still need pre-bundling.
    include: ['@warp-drive/json-api > json-to-ast'],
  },
});
