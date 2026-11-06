import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    env: { DB_NAME: 'todo_test' },
    // E2E files share the todo_test database, so they must not run in parallel.
    fileParallelism: false,
  },
});
