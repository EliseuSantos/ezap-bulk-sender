import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    passWithNoTests: true,
    coverage: {
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      all: true,
      include: ['src/**/*.{js,mjs}'],
      exclude: ['**/*.test.js', '**/__tests__/**'],
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
});
