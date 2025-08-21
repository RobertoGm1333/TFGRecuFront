import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/main.scss";`,
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',        // Asegura que la salida esté en dist/
    assetsDir: 'assets',   // Guarda imágenes, fuentes y otros assets en dist/assets/
    emptyOutDir: true,     // Elimina archivos antiguos en dist/ antes de un nuevo build
  },
  server: {
    port: 5173,            // Para desarrollo, útil si usas Docker
    host: '0.0.0.0',       // Asegura que el servidor sea accesible en Docker
    strictPort: true
  }
});
