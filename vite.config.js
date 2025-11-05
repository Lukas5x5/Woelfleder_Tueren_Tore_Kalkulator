import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  publicDir: 'public',
  base: './', // Für GitHub Pages - relative Pfade
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    port: 3000,
    open: true
  }
});
