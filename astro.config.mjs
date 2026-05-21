// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://dolphincentrifuge.com',
  integrations: [react(), sitemap({
    filter: (page) =>
      !page.includes('/admin/') &&
      !page.includes('/applications/'),
  })],
  vite: {
    plugins: [tailwindcss()],
  },
});
