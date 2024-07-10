// vite.config.js

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from "node:path";
import checker from 'vite-plugin-checker';
import eslintPlugin from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        checker({
            vueTsc: true,
        }),
        eslintPlugin(),
    ],
    server: {
        port: 8080,
        host: '0.0.0.0',
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})