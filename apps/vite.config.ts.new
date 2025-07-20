/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: 'apps/client',
  publicDir: 'public',
  cacheDir: '../../node_modules/.vite/client',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4200,
    host: 'localhost',
  },
  plugins: [react()],
  resolve: {
    alias: {
      'shared': path.resolve(__dirname, '../libs/shared/src'),
    },
  },
  build: {
    outDir: '../../dist/apps/client',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
