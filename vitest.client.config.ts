import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./apps/client/test/setup.ts'],
    include: ['apps/client/test/**/*.{test,spec}.{ts,tsx,js,jsx}'],
  },
});
