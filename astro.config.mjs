// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://dolphincentrifuge.com',
  integrations: [react(), sitemap({
    // The /applications/* pages were removed entirely 2026-07-16 (they were
    // edge-301'd by public/_redirects and unreachable by design); only /admin/
    // needs excluding now. If /applications/* ever come back as buildable
    // pages, re-add the exclusion or drop the _redirects rules - never both.
    filter: (page) => !page.includes('/admin/'),
  })],
  vite: {
    plugins: [tailwindcss()],
  },
});
