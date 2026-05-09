import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import * as path from 'node:path';

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@img': path.resolve(__dirname, './imgs'),
        },
    },
    test: {
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        include: ['tests/unit/**/*.spec.ts', 'tests/component/**/*.spec.ts'],
        // Single-thread keeps resident memory under ~400 MB on the 2 GB CI runner.
        // (Vitest 4 flattened poolOptions; --no-file-parallelism is the simplest equivalent.)
        fileParallelism: false,
    },
});
