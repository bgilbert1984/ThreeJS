// vite.config.ts (or vitest.config.ts)
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        reporters: ['json'], // Use the JSON reporter
        outputFile: '/home/gorelock/threejs-test-project/go-anthropic-api/vitest-results.json', // Absolute path!
        setupFiles: ['./src/test/setup.ts']  // Added setupFiles configuration
    }
})