/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@react-three/cannon': '@react-three/cannon/dist/index.js'
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  esbuild: {
    loader: {
      '.js': 'jsx',
      '.jsx': 'jsx'
    },
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.ts', // This line is correct.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
  },
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      target: 'esnext',
    },
  },
  clearScreen: false,
});