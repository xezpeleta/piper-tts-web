import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const isDemoBuild = process.env.BUILD_DEMO === 'true';

export default defineConfig({
  base: isDemoBuild ? (process.env.BASE_URL ?? '/') : '/',
  publicDir: process.env.NODE_ENV !== 'production' ? './assets' : '',
  build: isDemoBuild
    ? {
        minify: false,
        outDir: 'dist-demo',
      }
    : {
        minify: false,
        lib: {
          entry: path.resolve(__dirname, 'src/index.ts'),
          name: 'vits-web',
          formats: ['es']
        },
        rollupOptions: {
          external: [
            '**/*.spec.ts',
            'onnxruntime-web'
          ],
        },
      },
  plugins: [dts({ exclude: "**/*.spec.ts" })],
  worker: {
    format: 'es'
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
});
