import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    base: '/shtp-maps/',
    root: '.',
    publicDir: 'assets',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
            },
        },
        sourcemap: true,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: false,
                drop_debugger: true,
            },
        },
    },
    server: {
        port: 3000,
        open: true,
        cors: true,
    },
    preview: {
        port: 4173,
    },
    test: {
        globals: true,
        environment: 'jsdom',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'assets/bower_components/',
                'dist/',
                'coverage/',
                '**/*.test.js',
                '**/*.spec.js',
                'assets/js/islab-maps.js',
                'assets/js/ol-debug.js',
                'assets/js/bootstrap3-typeahead.min.js',
            ],
        },
    },
});
