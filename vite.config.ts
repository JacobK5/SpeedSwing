import { defineConfig } from 'vitest/config';

// Vite + Vitest configuration.
//
// `base: './'` keeps asset URLs relative so the static production build can be
// hosted from a subdirectory (e.g. itch.io / CrazyGames) without rewrites.
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 2000, // Phaser is a large single dependency; silence the noise.
  },
  test: {
    // Config and level-format logic is pure; no DOM is required for unit tests.
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    passWithNoTests: true,
  },
});
