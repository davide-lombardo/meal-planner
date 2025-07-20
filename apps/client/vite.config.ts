/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname, // Ensure Vite uses the project root for index.html
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
      'shared': resolve(__dirname, '../../libs/shared/src')
    }
  },
  build: {
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    outDir: '../../dist/apps/client',
  },
});
