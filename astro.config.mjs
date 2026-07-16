// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://dolphincentrifuge.com',
  integrations: [react(), sitemap({
    // Exclude /admin/. Also exclude /applications/* : those pages build but are
    // 301-redirected away at the Cloudflare edge (see public/_redirects -
    // "CC-invented /applications/* ... redirect to correct destinations"), so
    // they must never appear in the sitemap. Confirmed by the 2026-07-16
    // migration integrity check (live: /applications/crude-oil/ 301s away).
    filter: (page) =>
      !page.includes('/admin/') &&
      !page.includes('/applications/'),
  })],
  vite: {
    plugins: [tailwindcss()],
  },
});
