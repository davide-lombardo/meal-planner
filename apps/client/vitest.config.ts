import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'shared': resolve(__dirname, '../../libs/shared/src')
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './test/setup.ts',
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});
