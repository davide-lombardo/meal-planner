import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['apps/server/test/**/*.test.ts'],
  },
  resolve: {
    alias: {
      'shared': path.resolve(__dirname, './libs/shared/src'),
    },
  },
});
