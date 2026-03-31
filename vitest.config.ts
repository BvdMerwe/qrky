import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', '.next', 'dist', '.opencode'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      thresholds: {
        lines: 85,
        functions: 80,
        branches: 85,
        statements: 85,
      },
      exclude: [
        'node_modules/',
        '.next/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/middleware.ts',
        '**/route.ts',
        '**/page.tsx',
        '**/layout.tsx',
        '**/loading.tsx',
        '**/error.tsx',
        '**/not-found.tsx',
        '**/global-error.tsx',
        '**/template.tsx',
        '**/default.tsx',
        '**/opengraph-image.tsx',
        '**/twitter-image.tsx',
        '**/icon.tsx',
        '**/apple-icon.tsx',
        '**/sitemap.ts',
        '**/robots.ts',
        '**/manifest.ts',
        '**/instrumentation.ts',
        '**/vitest.setup.ts',
        '**/postcss.config.mjs',
        '**/tailwind.config.ts',
        '**/next.config.ts',
        '**/eslint.config.mjs',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
