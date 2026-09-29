import '@warp-drive/tc39-proposal-signals/install';

import { useRecommendedStore } from '@warp-drive/core';
import { withDefaults } from '@warp-drive/core/reactive';
import { JSONAPICache } from '@warp-drive/json-api';

const AppStore = useRecommendedStore({
  cache: JSONAPICache,
  schemas: [
    withDefaults({
      type: 'post',
      fields: [{ name: 'title', kind: 'field' }],
    }),
  ],
});

export const store = new AppStore();
