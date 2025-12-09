// vitest.config.mts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/setup/browser-env.js'],
    globals: true,
  },
});
