import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary', 'lcov'],
      include: [
        'src/lib/**',
        'src/services/**',
        'src/hooks/use-local-storage.ts',
        'src/components/StatsWidget.tsx',
        'src/components/TrendingSection.tsx',
      ],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.test.ts',
        '**/*.test.tsx',
        'dist/',
        'public/',
        'scripts/',
      ],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 50,
        lines: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
