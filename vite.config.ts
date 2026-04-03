import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, 'src'),
    },
  },
  build: {
    target: 'es2022',
    outDir: 'generated/landing-hero',
    emptyOutDir: true,
    sourcemap: false,
    lib: {
      entry: path.resolve(dirname, 'src/landing/main.tsx'),
      formats: ['es'],
      fileName: () => 'landing-hero.js',
    },
  },
});
