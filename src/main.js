import { DEBUG } from '@warp-drive/core/build-config/env';
import { buildBaseURL } from '@warp-drive/utilities';

import { store } from './store.js';

const status = document.querySelector('#status');

try {
  document.querySelector('#debug').textContent = DEBUG ? 'true' : 'false';

  const url = buildBaseURL({ namespace: 'api', resourcePath: 'posts/1.json' });
  const { content } = await store.request({ url, method: 'GET' });
  const post = content.data;
  document.querySelector('#title').textContent = post.title;

  store.push({ data: { type: 'post', id: '1', attributes: { title: 'Updated through the cache' } } });
  document.querySelector('#updated-title').textContent = post.title;

  status.textContent = 'ok';
} catch (error) {
  status.textContent = `error: ${error.message}`;
  throw error;
}
