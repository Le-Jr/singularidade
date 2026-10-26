import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative asset paths so dist/ works from any static host subfolder (itch.io, GitHub Pages)
  base: './',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1600,
    rollupOptions: { output: { manualChunks: (id: string) => (id.includes('node_modules/phaser') ? 'phaser' : undefined) } },
  },
  test: { include: ['tests/**/*.test.ts'] },
});
