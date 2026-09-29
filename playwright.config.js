import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { channel: 'chrome' },
  projects: [
    { name: 'dev server', use: { baseURL: 'http://localhost:5173' }, metadata: { debug: 'true' } },
    { name: 'production build', use: { baseURL: 'http://localhost:4173' }, metadata: { debug: 'false' } },
  ],
  webServer: [
    { command: 'pnpm dev --port 5173 --strictPort', url: 'http://localhost:5173' },
    { command: 'pnpm build && pnpm preview --port 4173 --strictPort', url: 'http://localhost:4173' },
  ],
});
