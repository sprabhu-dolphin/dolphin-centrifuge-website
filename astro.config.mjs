// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { isNoindexPage } from './config/noindex-registry.mjs';
import { lastmodForUrl } from './config/sitemap-lastmod.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://dolphincentrifuge.com',
  integrations: [react(), sitemap({
    filter: (page) => !isNoindexPage(page),
    // The 360 tour is a static Pano2VR page in public/tour3/, outside src/pages.
    customPages: ['https://dolphincentrifuge.com/tour3/'],
    serialize: (item) => {
      const lastmod = lastmodForUrl(item.url);
      return lastmod ? { ...item, lastmod } : item;
    },
  })],
  vite: {
    plugins: [tailwindcss()],
  },
});
