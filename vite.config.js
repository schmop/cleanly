// vite.config.js

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from "node:path";
import checker from 'vite-plugin-checker';
import eslintPlugin from "vite-plugin-eslint";
import legacy from '@vitejs/plugin-legacy';

// CI runs vue-tsc + eslint as a separate step (`yarn lint`), so we skip the
// in-build checker/eslint plugins there. Running all three in one Node
// process blows past the 2 GB runner's heap during `rendering chunks`.
const skipInlineChecks = process.env.VITE_SKIP_CHECKS === '1';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        ...(skipInlineChecks ? [] : [checker({ vueTsc: true }), eslintPlugin()]),
        legacy(),
    ],
    server: {
        port: 8080,
        host: '0.0.0.0',
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@img": path.resolve(__dirname, "./imgs"),
        },
    },
})
