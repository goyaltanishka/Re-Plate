import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import postcssTailwind from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Content-Security-Policy': "frame-ancestors 'self' https://browserpod.io https://*.browserpod.io https://*.browserpod.pages.dev"
    }
  },
  css: {
    postcss: {
      plugins: [postcssTailwind(), autoprefixer()]
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  optimizeDeps: {
    exclude: ['@leaningtech/browserpod']
  },
  build: {
    target: 'es2022'
  }
});
