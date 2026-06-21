import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Group core stable dependencies together, let async components split themselves
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('d3')) return 'vendor-d3'
            if (id.includes('leaflet')) return 'vendor-leaflet'
            return 'vendor-core' // lodash, tippy, vue, etc.
          }
        },
      },
    },
  },
})
