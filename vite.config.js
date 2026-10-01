import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        aboutproject: resolve(import.meta.dirname, 'aboutproject/index.html'),
      },
    },
  },
})
