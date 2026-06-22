import { defineConfig } from 'vite';

import { resolve } from 'path';

export default defineConfig({
  preview: {
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        article: resolve(__dirname, 'article.html'),
        category: resolve(__dirname, 'category.html'),
        subscribe: resolve(__dirname, 'subscribe.html')
      }
    }
  }
});
