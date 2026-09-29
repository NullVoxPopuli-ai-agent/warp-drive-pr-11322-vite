// Same setup as WarpDrive's own non-ember test apps (tests/framework-react, tests/framework-vue).
import { buildMacros } from '@embroider/macros/babel';
import { setConfig } from '@warp-drive/core/build-config';
import { macros } from '@warp-drive/core/build-config/babel-macros';

const Macros = buildMacros({
  configure: (config) => {
    setConfig(config, {
      compatWith: '5.6',
    });
  },
});

export default {
  plugins: [
    ...macros(),
    // Turns the @ember/debug imports in WarpDrive into console calls, because there is no Ember here.
    [
      'babel-plugin-debug-macros',
      {
        flags: [],
        debugTools: {
          isDebug: process.env.NODE_ENV !== 'production',
          source: '@ember/debug',
          assertPredicateIndex: 1,
        },
      },
      'ember-data-specific-macros-stripping-test',
    ],
    ...Macros.babelMacros,
  ],
};
