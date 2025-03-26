import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html', // Main entry
        about: 'src/pages/template.html', // Additional pages
      },
    },
  },
});