// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://dolphincentrifuge.com',
  integrations: [react(), sitemap({
    // /applications/ hub pages are self-canonical, internally linked, and
    // indexable - they belong in the sitemap (Phase 0 SEO audit 2026-07-16).
    filter: (page) => !page.includes('/admin/'),
  })],
  vite: {
    plugins: [tailwindcss()],
  },
});
